import { randomUUID } from 'node:crypto';
import {
  chmod,
  link,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { exists } from './files.js';
import { CliError, json } from './output.js';
import type { SecretStore } from './secrets.js';

export type Environment = Record<string, string | undefined>;

/**
 * What a command needs to call the API: a key, and optionally another API host and,
 * for a partner key, the tenant workspace to act in.
 */
export type Profile = { apiKey: string; baseUrl?: string; workspace?: string };

/**
 * A Profile as saved in the config file: with either the key itself or the keychain
 * account it is saved under, never both.
 */
export type StoredProfile = Omit<Profile, 'apiKey'> &
  ({ apiKey: string; keychain?: never } | { apiKey?: never; keychain: string });

/** The config file: saved profiles by name, and the active one (DEFAULT_PROFILE when unset). */
export type StoredConfig = {
  active?: string;
  profiles: Record<string, StoredProfile>;
  /** Keychain accounts of logins gone from `profiles` whose keys couldn't be deleted. */
  keysToDelete?: string[];
};

/** Where a command's API key is kept. */
export type KeyStorage = 'keychain' | 'file' | 'environment';

/**
 * The profile a command will use, its name (absent when the key comes from
 * KIRORA_API_KEY), and where its key is kept.
 */
export type Credentials = { profile: Profile; profileName?: string; storage: KeyStorage };

/** Returns the system keychain, or undefined when keys go in the config file. */
export type Secrets = () => Promise<SecretStore | undefined>;

/** The profile used when none is active or named. */
export const DEFAULT_PROFILE = 'default';

/** Returns the config file's path, under XDG_CONFIG_HOME or ~/.config. */
export function configPath(env: Environment): string {
  const configHome = setting(env, 'XDG_CONFIG_HOME') ?? join(homedir(), '.config');
  return join(configHome, 'kirora', 'config.json');
}

/**
 * Reads the config file, or returns an empty config when there is none. Throws
 * CliError CONFIG_INVALID when the file isn't a valid config.
 */
export async function readConfig(env: Environment): Promise<StoredConfig> {
  const path = configPath(env);
  let text: string;
  try {
    text = await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { profiles: Object.create(null) as StoredConfig['profiles'] };
    }
    throw error;
  }
  let config: unknown;
  try {
    config = JSON.parse(text);
  } catch {
    throw invalidConfig(path, 'it is not JSON');
  }
  checkConfig(config, path);
  // Without a prototype, names such as "constructor" aren't found as profiles.
  return {
    ...config,
    profiles: Object.assign(
      Object.create(null) as StoredConfig['profiles'],
      config.profiles,
    ),
  };
}

function checkConfig(config: unknown, path: string): asserts config is StoredConfig {
  const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
  const isText = (value: unknown) => value === undefined || typeof value === 'string';
  if (!isObject(config) || !isObject(config.profiles)) {
    throw invalidConfig(path, 'it has no "profiles" object');
  }
  if (!isText(config.active)) throw invalidConfig(path, '"active" is not a name');
  const leftover = config.keysToDelete;
  if (
    leftover !== undefined &&
    !(Array.isArray(leftover) && leftover.every((account) => typeof account === 'string'))
  ) {
    throw invalidConfig(path, '"keysToDelete" is not a list of keychain accounts');
  }
  for (const [name, profile] of Object.entries(config.profiles)) {
    const valid =
      isObject(profile) &&
      (typeof profile.apiKey === 'string') !== (typeof profile.keychain === 'string') &&
      isText(profile.baseUrl) &&
      isText(profile.workspace);
    if (!valid) throw invalidConfig(path, `profile "${name}" isn't a saved login`);
  }
}

function invalidConfig(path: string, reason: string): CliError {
  return new CliError(
    'CONFIG_INVALID',
    `${path} can't be used: ${reason}. Fix it, or remove it and log in again.`,
  );
}

/**
 * Applies `change` to the config file and saves it, returning what `change` returns;
 * no other kirora process can change the file in between. If `change` throws, nothing
 * is saved. Throws CliError CONFIG_LOCKED when another process keeps the file busy for
 * 10 seconds.
 */
export async function updateConfig<T>(
  env: Environment,
  change: (config: StoredConfig) => T,
): Promise<T> {
  const path = configPath(env);
  return withLock(`${path}.locks`, async () => {
    const config = await readConfig(env);
    const result = change(config);
    await writeAtomically(path, json(config));
    return result;
  });
}

async function writeAtomically(path: string, text: string) {
  const temporary = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, text, { mode: 0o600, flush: true });
    await chmod(temporary, 0o600);
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

const LOCK_WAIT_MS = 10_000;
// A lock this old is taken over even if its process id is alive: the id may have been reused.
const ABANDONED_LOCK_MS = 10 * 60_000;

/**
 * The lock is held by whoever created the highest-numbered file in `lockDir`. Numbers
 * only grow: a holder marks its number free rather than deleting it, so taking over
 * from a holder that exited means creating the next number, which only one of many
 * racing processes can do.
 */
async function withLock<T>(lockDir: string, run: () => Promise<T>): Promise<T> {
  await mkdir(lockDir, { recursive: true, mode: 0o700 });
  const token = `${process.pid} ${randomUUID()}`;
  const deadline = Date.now() + LOCK_WAIT_MS;
  let held: number | undefined;
  let wait = 2;
  while (held === undefined) {
    const top = Math.max(0, ...(await lockNumbers(lockDir)));
    if (top === 0 || (await isFree(lockDir, top))) {
      if (await tryLock(lockDir, top + 1, token)) held = top + 1;
    } else if (Date.now() > deadline) {
      throw new CliError(
        'CONFIG_LOCKED',
        `Another kirora is changing the config (lock ${join(lockDir, String(top))}). Try again.`,
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, wait * (0.5 + Math.random())));
      wait = Math.min(wait * 2, 50);
    }
  }
  await clearBelow(lockDir, held);
  try {
    return await run();
  } finally {
    await markFree(lockDir, held);
  }
}

async function tryLock(lockDir: string, n: number, token: string): Promise<boolean> {
  // Linked into place, so the lock file never exists without its process id.
  const aside = join(lockDir, `${randomUUID()}.tmp`);
  await writeFile(aside, token, { mode: 0o600 });
  try {
    await link(aside, join(lockDir, String(n)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') return false;
    throw error;
  } finally {
    await rm(aside, { force: true });
  }
  // A slow process can recreate a number that a later holder has already cleared.
  if (Math.max(...(await lockNumbers(lockDir))) === n) return true;
  await markFree(lockDir, n);
  return false;
}

async function lockNumbers(lockDir: string): Promise<number[]> {
  return (await readdir(lockDir)).filter((name) => /^\d+$/.test(name)).map(Number);
}

async function markFree(lockDir: string, n: number) {
  await writeFile(join(lockDir, `${n}.free`), '');
}

async function isFree(lockDir: string, n: number): Promise<boolean> {
  const path = join(lockDir, String(n));
  const [marked, token, found] = await Promise.all([
    exists(`${path}.free`),
    readFile(path, 'utf8').catch(() => undefined),
    stat(path).catch(() => undefined),
  ]);
  if (marked || token === undefined || !found) return true;
  if (Date.now() - found.mtimeMs > ABANDONED_LOCK_MS) return true;
  const pid = Number.parseInt(token, 10);
  // Locks are linked into place whole, so one without a holder is corrupt, not half made.
  if (!Number.isSafeInteger(pid) || pid <= 0) return true;
  try {
    process.kill(pid, 0);
    return false;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'ESRCH';
  }
}

async function clearBelow(lockDir: string, held: number) {
  const names = await readdir(lockDir);
  await Promise.all(
    names
      .filter((name) => /^\d+(\.free)?$/.test(name) && Number.parseInt(name, 10) < held)
      .map((name) => rm(join(lockDir, name), { force: true })),
  );
}

/** Returns the active profile's name. */
export function activeProfile(config: StoredConfig): string {
  return config.active ?? DEFAULT_PROFILE;
}

/** Returns the profile named by `flag` (--profile) or KIRORA_PROFILE, if any. */
export function namedProfile(
  env: Environment,
  flag: string | undefined,
): string | undefined {
  return flag ?? setting(env, 'KIRORA_PROFILE');
}

/**
 * Returns the key a command should use: from the profile named by `profileName` or
 * KIRORA_PROFILE, else KIRORA_API_KEY, else the active profile. Throws CliError
 * NOT_LOGGED_IN, PROFILE_NOT_FOUND or KEY_NOT_FOUND.
 */
export async function resolveCredentials(
  { env, secrets }: { env: Environment; secrets: Secrets },
  profileName: string | undefined,
): Promise<Credentials> {
  const named = namedProfile(env, profileName);
  const environmentKey = setting(env, 'KIRORA_API_KEY');
  if (named === undefined && environmentKey !== undefined) {
    return {
      profile: {
        apiKey: environmentKey,
        baseUrl: setting(env, 'KIRORA_API_URL'),
        workspace: setting(env, 'KIRORA_WORKSPACE'),
      },
      storage: 'environment',
    };
  }
  const config = await readConfig(env);
  const name = named ?? activeProfile(config);
  const stored = config.profiles[name];
  if (stored?.apiKey !== undefined) {
    return {
      profile: { ...stored, apiKey: stored.apiKey },
      profileName: name,
      storage: 'file',
    };
  }
  if (stored?.keychain !== undefined) {
    const store = await secrets();
    const apiKey = await store?.get(stored.keychain);
    if (apiKey === undefined) throw keyNotFound(name);
    const { keychain: _, ...rest } = stored;
    return { profile: { ...rest, apiKey }, profileName: name, storage: 'keychain' };
  }
  const saved = Object.keys(config.profiles);
  if (named === undefined && saved.length === 0) {
    throw new CliError(
      'NOT_LOGGED_IN',
      'Not logged in. Run: kirora login, or set KIRORA_API_KEY.',
    );
  }
  if (named === undefined) {
    throw new CliError(
      'NO_ACTIVE_PROFILE',
      `The active profile "${name}" isn't saved. Choose one of ${saved.join(', ')} with: kirora auth switch <name>`,
    );
  }
  throw profileNotFound(name);
}

/** The error for a profile name that isn't saved. */
export function profileNotFound(name: string): CliError {
  return new CliError(
    'PROFILE_NOT_FOUND',
    `No profile "${name}" (kirora auth list shows them). Run: kirora login --profile ${name}`,
  );
}

/** The error for a profile whose key is missing from the keychain. */
export function keyNotFound(name: string): CliError {
  return new CliError(
    'KEY_NOT_FOUND',
    `No key for profile "${name}" in this system's keychain. Run: kirora login --profile ${name}`,
  );
}

/** Returns an environment variable's value, trimmed; undefined when unset or blank. */
export function setting(env: Environment, name: string): string | undefined {
  return env[name]?.trim() || undefined;
}
