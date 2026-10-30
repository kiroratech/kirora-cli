import { stat } from 'node:fs/promises';
import type { Command } from 'commander';
import { getCaller, MIN_NODE, VERSION } from '../lib/client.js';
import {
  configPath,
  readConfig,
  resolveCredentials,
  type Credentials,
} from '../lib/config.js';
import type { GlobalFlags, Io } from '../lib/io.js';
import { isApiError, json, messageOf, ReportedFailure } from '../lib/output.js';

type Check = { name: string; status: 'pass' | 'warn' | 'fail'; message: string };

/** Adds `doctor`, which prints a JSON report of its checks and exits 1 when one fails. */
export function addDoctor(program: Command, io: Io): void {
  program
    .command('doctor')
    .description(
      'check that commands can run: Node.js, the config file, which key is used, and that the API accepts it',
    )
    .action((_options: unknown, self: Command) =>
      doctor(self.optsWithGlobals<GlobalFlags>(), io),
    );
}

async function doctor(flags: GlobalFlags, io: Io) {
  const checks: Check[] = [
    { name: 'CLI', status: 'pass', message: `kirora ${VERSION}` },
    nodeCheck(),
    await configCheck(io),
  ];
  let credentials: Credentials | undefined;
  try {
    credentials = await resolveCredentials(io, flags.profile);
    checks.push({ name: 'API key', status: 'pass', message: describeKey(credentials) });
    checks.push(await storageCheck(credentials, io));
  } catch (error) {
    checks.push({ name: 'API key', status: 'fail', message: messageOf(error) });
  }
  checks.push(await apiCheck(credentials, flags, io));

  const ok = checks.every((check) => check.status !== 'fail');
  io.stdout(json({ ok, checks }));
  if (!ok) throw new ReportedFailure();
}

function nodeCheck(): Check {
  const [major = 0, minor = 0] = process.versions.node.split('.').map(Number);
  const [minMajor = 0, minMinor = 0] = MIN_NODE;
  const supported = major > minMajor || (major === minMajor && minor >= minMinor);
  return {
    name: 'Node.js',
    status: supported ? 'pass' : 'fail',
    message: supported
      ? `v${process.versions.node}`
      : `v${process.versions.node}; kirora needs v${MIN_NODE.join('.')} or later`,
  };
}

async function configCheck(io: Io): Promise<Check> {
  const path = configPath(io.env);
  const name = 'Config file';
  const mode = await stat(path).then(
    (found) => found.mode & 0o777,
    () => undefined,
  );
  if (mode === undefined) return { name, status: 'pass', message: `none yet at ${path}` };
  try {
    const { profiles, keysToDelete = [] } = await readConfig(io.env);
    if (keysToDelete.length > 0) {
      return {
        name,
        status: 'warn',
        message: `${plural(keysToDelete.length, 'key')} of old logins couldn't be deleted from the keychain (${keysToDelete.join(', ')}); the next kirora login or logout tries again`,
      };
    }
    if (process.platform !== 'win32' && (mode & 0o077) !== 0) {
      return {
        name,
        status: 'warn',
        message: `${path} can be read by others (mode ${mode.toString(8)}); run chmod 600 ${path}`,
      };
    }
    const count = Object.keys(profiles).length;
    return {
      name,
      status: 'pass',
      message: `${path}, ${plural(count, 'profile')}`,
    };
  } catch (error) {
    return {
      name,
      status: 'fail',
      message: `${path} can't be read: ${messageOf(error)}`,
    };
  }
}

async function apiCheck(
  credentials: Credentials | undefined,
  flags: GlobalFlags,
  io: Io,
): Promise<Check> {
  const name = 'API';
  if (!credentials) return { name, status: 'fail', message: 'skipped: no API key' };
  try {
    const data = await getCaller(credentials.profile, flags.workspace, io.fetch);
    const scopes = data.apiKey.scopes ?? [];
    return {
      name,
      status: 'pass',
      message:
        `${data.workspace.name}, with the key "${data.apiKey.name}"` +
        (scopes.length > 0 ? ` (${scopes.join(', ')})` : ''),
    };
  } catch (error) {
    const code = isApiError(error) ? ` (${error.code})` : '';
    return { name, status: 'fail', message: `${messageOf(error)}${code}` };
  }
}

async function storageCheck(
  { storage, profileName }: Credentials,
  io: Io,
): Promise<Check> {
  const name = 'Key storage';
  if (storage === 'environment') {
    return { name, status: 'pass', message: 'KIRORA_API_KEY, saved nowhere' };
  }
  const store = await io.secrets();
  if (storage === 'keychain') {
    return { name, status: 'pass', message: store?.name ?? 'keychain' };
  }
  return store
    ? {
        name,
        status: 'warn',
        message: `the config file, as plain text; run kirora login --profile ${profileName} to move it to the ${store.name}`,
      }
    : { name, status: 'pass', message: 'the config file (this system has no keychain)' };
}

function describeKey({ profile, profileName }: Credentials): string {
  const { apiKey } = profile;
  const masked = apiKey.length > 12 ? `${apiKey.slice(0, 7)}…${apiKey.slice(-4)}` : '…';
  const source = profileName === undefined ? 'KIRORA_API_KEY' : `profile ${profileName}`;
  return `${masked} from ${source}`;
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;
