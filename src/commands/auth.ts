import { randomUUID } from 'node:crypto';
import type { Command } from 'commander';
import { getCaller } from '../lib/client.js';
import { ACTION_ALIASES, DEFAULT_ACTION } from './resources.js';
import {
  activeProfile,
  DEFAULT_PROFILE,
  namedProfile,
  profileNotFound,
  readConfig,
  resolveCredentials,
  setting,
  updateConfig,
  type StoredConfig,
  type StoredProfile,
} from '../lib/config.js';
import type { GlobalFlags, Io } from '../lib/io.js';
import { CliError, json, messageOf } from '../lib/output.js';

/** Adds login, logout, whoami and `auth list`, `switch` and `rename` to `program`. */
export function addAuthCommands(program: Command, io: Io): void {
  program
    .command('login')
    .description('check an API key and save it')
    .option('--base-url <url>', 'another API host to save with the login')
    .option(
      '--insecure-storage',
      "keep the key in the config file, readable only by you, rather than the system's keychain",
    )
    .action((_options: unknown, self: Command) => login(self, io));
  program
    .command('logout')
    .description('remove a saved login')
    .action((_options: unknown, self: Command) =>
      logout(self.optsWithGlobals<GlobalFlags>(), io),
    );
  program
    .command('whoami')
    .description('show the key, workspace and profile a command would use')
    .action((_options: unknown, self: Command) =>
      whoami(self.optsWithGlobals<GlobalFlags>(), io),
    );

  const auth = program.command('auth').description('manage saved logins');
  auth
    .command(DEFAULT_ACTION, { isDefault: true })
    .alias(ACTION_ALIASES[DEFAULT_ACTION]!)
    .description('list the saved profiles; never their keys')
    .action(() => listProfiles(io));
  auth
    .command('switch')
    .argument('<profile>')
    .description('use another saved profile from now on')
    .action((name: string) => switchProfile(name, io));
  auth
    .command('rename')
    .argument('<profile>')
    .argument('<new-name>')
    .description('rename a saved profile, keeping it active if it was')
    .action((from: string, to: string) => renameProfile(from, to, io));
}

function checkProfileName(name: string) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(name)) {
    throw new CliError(
      'INVALID_PROFILE_NAME',
      `"${name}" can't be a profile name: use up to 64 letters, digits, ".", "_" or "-", starting with a letter or digit.`,
    );
  }
}

async function login(command: Command, io: Io) {
  const flags = command.optsWithGlobals<
    GlobalFlags & { baseUrl?: string; insecureStorage?: boolean }
  >();
  await retryKeyDeletes(io);
  const name =
    namedProfile(io.env, flags.profile) ?? activeProfile(await readConfig(io.env));
  checkProfileName(name);
  const apiKey = (await io.readSecret('API key')).trim();
  if (!apiKey) command.error('No API key given.', { exitCode: 2 });
  const saved = {
    baseUrl: flags.baseUrl ?? setting(io.env, 'KIRORA_API_URL'),
    workspace: flags.workspace ?? setting(io.env, 'KIRORA_WORKSPACE'),
  };
  const caller = await getCaller({ ...saved, apiKey }, undefined, io.fetch);

  const store = flags.insecureStorage ? undefined : await io.secrets();
  // A new account for every login, so a login or logout running at the same time,
  // deleting the account it replaced, can't delete this key.
  const account = store && `${name}.${randomUUID()}`;
  if (account) await store.set(account, apiKey);
  const stored: StoredProfile = account
    ? { ...saved, keychain: account }
    : { ...saved, apiKey };
  let replaced: StoredProfile | undefined;
  try {
    replaced = await updateConfig(io.env, (config) => {
      const before = config.profiles[name];
      // A first login under any name is the one commands use, not a `default` that isn't.
      if (!config.profiles[activeProfile(config)]) setActive(config, name);
      config.profiles[name] = stored;
      return before;
    });
  } catch (error) {
    // The login failed, so its new key goes too; the error to report is the login's.
    if (account) await deleteKey(io, account).catch(() => {});
    throw error;
  }
  if (replaced?.keychain !== undefined) {
    const left = await deleteKey(io, replaced.keychain);
    if (left) {
      io.stderr(
        `Warning: the key this login replaced is still in the keychain (${left}); kirora tries again at the next login or logout.\n`,
      );
    }
  }
  io.stdout(
    `Logged in to ${caller.workspace.name} with the key "${caller.apiKey.name}" ` +
      `as profile ${name}, kept in the ${store ? store.name : 'config file'}.\n`,
  );
}

async function logout(flags: GlobalFlags, io: Io) {
  await retryKeyDeletes(io);
  const named = namedProfile(io.env, flags.profile);
  const { name, stored } = await updateConfig(io.env, (config) => {
    const name = named ?? activeProfile(config);
    const stored = config.profiles[name];
    if (!stored) throw profileNotFound(name);
    delete config.profiles[name];
    if (config.active === name) delete config.active;
    return { name, stored };
  });
  const left =
    stored.keychain === undefined ? undefined : await deleteKey(io, stored.keychain);
  if (left) {
    throw new CliError(
      'KEY_NOT_DELETED',
      `Logged out of profile ${name}, but its key is still in the keychain (${left}). kirora tries again at the next login or logout.`,
    );
  }
  io.stdout(`Logged out of profile ${name}.\n`);
}

/**
 * Deletes a login's key from the keychain. If that fails, the account is kept in the
 * config's `keysToDelete` for a later try, and the reason is returned.
 */
async function deleteKey(io: Io, account: string): Promise<string | undefined> {
  try {
    const store = await io.secrets();
    if (!store) throw new Error('this system has no keychain now');
    await store.delete(account);
    return undefined;
  } catch (error) {
    await updateConfig(io.env, (config) => {
      config.keysToDelete = [...new Set([...(config.keysToDelete ?? []), account])];
    });
    return messageOf(error);
  }
}

/** Tries again to delete the keys earlier logouts and logins couldn't. */
async function retryKeyDeletes(io: Io) {
  const { keysToDelete = [] } = await readConfig(io.env);
  const store = keysToDelete.length > 0 ? await io.secrets() : undefined;
  if (!store) return;
  const deleted = new Set<string>();
  for (const account of keysToDelete) {
    try {
      await store.delete(account);
      deleted.add(account);
    } catch {}
  }
  if (deleted.size === 0) return;
  await updateConfig(io.env, (config) => {
    const left = (config.keysToDelete ?? []).filter((account) => !deleted.has(account));
    if (left.length > 0) config.keysToDelete = left;
    else delete config.keysToDelete;
  });
}

async function whoami(flags: GlobalFlags, io: Io) {
  const { profile, profileName, storage } = await resolveCredentials(io, flags.profile);
  const caller = await getCaller(profile, flags.workspace, io.fetch);
  io.stdout(
    json({
      source: profileName === undefined ? 'KIRORA_API_KEY' : 'profile',
      ...(profileName !== undefined && { profile: profileName }),
      storage,
      ...caller,
    }),
  );
}

async function listProfiles(io: Io) {
  const config = await readConfig(io.env);
  const active = activeProfile(config);
  io.stdout(
    json(
      Object.entries(config.profiles).map(([name, { baseUrl, workspace, keychain }]) => ({
        name,
        active: name === active,
        storage: keychain === undefined ? 'file' : 'keychain',
        ...(baseUrl && { baseUrl }),
        ...(workspace && { workspace }),
      })),
    ),
  );
}

async function switchProfile(name: string, io: Io) {
  await updateConfig(io.env, (config) => {
    if (!config.profiles[name]) throw profileNotFound(name);
    setActive(config, name);
  });
  io.stdout(`Using profile ${name}.\n`);
}

async function renameProfile(from: string, to: string, io: Io) {
  checkProfileName(to);
  await updateConfig(io.env, (config) => {
    const profile = config.profiles[from];
    if (!profile) throw profileNotFound(from);
    if (config.profiles[to]) {
      throw new CliError('PROFILE_EXISTS', `There is already a profile "${to}".`);
    }
    if (activeProfile(config) === from) setActive(config, to);
    delete config.profiles[from];
    config.profiles[to] = profile;
  });
  io.stdout(`Renamed profile ${from} to ${to}.\n`);
}

function setActive(config: StoredConfig, name: string) {
  if (name === DEFAULT_PROFILE) delete config.active;
  else config.active = name;
}
