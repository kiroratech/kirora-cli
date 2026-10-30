import { readFileSync } from 'node:fs';
import type { KiroraClient } from '@kirora/node';
import type { Profile } from './config.js';

const PACKAGE = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as { version: string; engines: { node: string } };

export const VERSION = PACKAGE.version;

/** The oldest Node.js this CLI runs on, as version numbers: [major, minor, patch]. */
export const MIN_NODE = PACKAGE.engines.node.replace(/^>=/, '').split('.').map(Number);

/** The API host a profile without a `baseUrl` uses. */
const DEFAULT_API_URL = 'https://api.kirora.io';

/**
 * Returns an API client for `profile`'s key. `workspace`, when given, overrides the
 * profile's own; `fetch` defaults to the global one.
 */
export async function clientFor(
  profile: Profile,
  workspace: string | undefined,
  fetch: typeof globalThis.fetch | undefined,
): Promise<KiroraClient> {
  // Loaded here, by a command that calls the API: --help and completion never need it.
  const { KiroraClient } = await import('@kirora/node');
  return new KiroraClient({
    apiKey: profile.apiKey,
    // Always given: without one the library reads KIRORA_BASE_URL, which the CLI doesn't
    // document and a shell may set for something else.
    baseUrl: profile.baseUrl ?? DEFAULT_API_URL,
    workspace: workspace ?? profile.workspace,
    fetch,
    appInfo: { name: 'kirora-cli', version: VERSION },
  });
}

/** Fetches the workspace and API key that `profile`'s key belongs to. */
export async function getCaller(
  profile: Profile,
  workspace: string | undefined,
  fetch: typeof globalThis.fetch | undefined,
) {
  const { Kirora } = await import('@kirora/node');
  return new Kirora(await clientFor(profile, workspace, fetch)).me();
}

/** Wraps `fetch` to keep the last response it returned in `last`. */
export function recordResponses(fetch: typeof globalThis.fetch) {
  const recorder: { last?: Response; fetch: typeof globalThis.fetch } = {
    fetch: async (input, init) => {
      recorder.last = await fetch(input, init);
      return recorder.last;
    },
  };
  return recorder;
}

/** Formats a response's status line and headers as `curl -i` prints them, ending in a blank line. */
export function statusAndHeaders(response: Response): string {
  const headers = [...response.headers].map(([name, value]) => `${name}: ${value}\n`);
  return `${`HTTP ${response.status} ${response.statusText}`.trimEnd()}\n${headers.join('')}\n`;
}
