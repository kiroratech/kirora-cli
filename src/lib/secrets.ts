import { execFile, spawn } from 'node:child_process';
import { setting, type Environment } from './config.js';
import { exists } from './files.js';
import { CliError } from './output.js';

/** A system keychain holding API keys, each under its own account name. */
export type SecretStore = {
  name: string;
  /** Resolves undefined when the account holds no key. */
  get: (account: string) => Promise<string | undefined>;
  set: (account: string, secret: string) => Promise<void>;
  delete: (account: string) => Promise<void>;
};

/** macOS's own keychain tool. */
const SECURITY = '/usr/bin/security';
const SERVICE = 'kirora-cli';
const TIMEOUT_MS = 10_000;

/**
 * Returns the system keychain: macOS Keychain, or Secret Service on Linux. Returns
 * undefined when there is none, or KIRORA_CREDENTIAL_STORE=file keeps keys in the
 * config file.
 */
export async function systemSecretStore(
  env: Environment,
): Promise<SecretStore | undefined> {
  if (setting(env, 'KIRORA_CREDENTIAL_STORE') === 'file') return undefined;
  if (process.platform === 'darwin' && (await exists(SECURITY))) {
    return macosKeychain();
  }
  if (
    process.platform === 'linux' &&
    setting(env, 'DBUS_SESSION_BUS_ADDRESS') &&
    // secret-tool without arguments fails; only a missing command has no exit code.
    (await run('secret-tool', [])).code !== null
  ) {
    return secretService();
  }
  return undefined;
}

function macosKeychain(): SecretStore {
  return {
    name: 'macOS Keychain',
    async get(account) {
      const result = await run(SECURITY, [
        'find-generic-password',
        '-s',
        SERVICE,
        '-a',
        account,
        '-w',
      ]);
      if (result.code === 44) return undefined;
      if (result.code !== 0) throw keychainError('read', result.stderr);
      return result.stdout.trim() || undefined;
    },
    async set(account, secret) {
      // The key goes in on stdin so it never shows in the process list; the command
      // line it is written in can't quote these characters.
      if (!/^[\x21-\x7e]+$/.test(secret) || /["'\\]/.test(secret)) {
        throw new Error('That key has characters the keychain command line can’t take.');
      }
      const command = `add-generic-password -U -s ${SERVICE} -a "${account}" -l "Kirora CLI (${account})" -w "${secret}"\n`;
      const result = await run(SECURITY, ['-i'], command);
      if (result.code !== 0 || result.stderr.trim()) {
        throw keychainError('save to', result.stderr);
      }
    },
    async delete(account) {
      const result = await run(SECURITY, [
        'delete-generic-password',
        '-s',
        SERVICE,
        '-a',
        account,
      ]);
      // 44: no such item, so it's already gone.
      if (result.code !== 0 && result.code !== 44) {
        throw keychainError('delete from', result.stderr);
      }
    },
  };
}

export function secretService(runCommand: typeof run = run): SecretStore {
  const attributes = (account: string) => ['service', SERVICE, 'account', account];
  return {
    name: 'Secret Service',
    async get(account) {
      const result = await runCommand('secret-tool', ['lookup', ...attributes(account)]);
      if (result.code === 0) return result.stdout.trim() || undefined;
      if (nothingThere(result)) return undefined;
      throw secretToolError('read', result);
    },
    async set(account, secret) {
      const result = await runCommand(
        'secret-tool',
        ['store', `--label=Kirora CLI (${account})`, ...attributes(account)],
        secret,
      );
      if (result.code !== 0) throw secretToolError('save to', result);
    },
    async delete(account) {
      const result = await runCommand('secret-tool', ['clear', ...attributes(account)]);
      if (result.code !== 0 && !nothingThere(result)) {
        throw secretToolError('delete from', result);
      }
    },
  };
}

/**
 * secret-tool says nothing is saved by exiting 1 without a word. Any other failure is the
 * keyring itself, locked or unreachable, which logging in again wouldn't fix.
 */
const nothingThere = (result: Result) => result.code === 1 && !result.stderr.trim();

const secretToolError = (action: string, result: Result) =>
  keychainError(
    action,
    result.stderr || (result.code === null ? 'secret-tool did not answer' : ''),
  );

function keychainError(action: string, stderr: string) {
  return new CliError(
    'KEYCHAIN_UNAVAILABLE',
    `Couldn't ${action} the keychain: ${stderr.trim() || 'no reason given'}. ` +
      'Log in with --insecure-storage to keep the key in the config file instead.',
  );
}

type Result = { code: number | null; stdout: string; stderr: string };

/**
 * Runs `command`, writing `input` to its stdin, and resolves with its exit code and
 * output; it never rejects. `code` is null when the command couldn't start or was
 * killed, as it is after 10 seconds.
 */
export function run(command: string, args: string[], input?: string): Promise<Result> {
  return new Promise((resolve) => {
    if (input === undefined) {
      execFile(command, args, { timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
        const code = error ? (typeof error.code === 'number' ? error.code : null) : 0;
        resolve({ code, stdout, stderr });
      });
      return;
    }
    const child = spawn(command, args, { timeout: TIMEOUT_MS });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => (stdout += chunk));
    child.stderr.on('data', (chunk: Buffer) => (stderr += chunk));
    child.on('error', () => resolve({ code: null, stdout, stderr }));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    // A command can exit without reading all of `input`; its exit code reports that.
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
