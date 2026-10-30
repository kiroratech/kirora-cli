/**
 * Runs the built CLI against a real Kirora workspace, reading only: it creates, changes,
 * sends and deletes nothing. Use a staging workspace's key.
 *
 *   KIRORA_SMOKE_API_KEY=… [KIRORA_SMOKE_API_URL=https://…] pnpm smoke [--verbose]
 *
 * With `--verbose`, each check is followed by the commands it ran, their exit codes and
 * what they printed.
 *
 * It uses a config folder of its own, with keys kept in it rather than the keychain, so
 * your saved logins are never read or changed.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiKey = process.env.KIRORA_SMOKE_API_KEY?.trim();
if (!apiKey) {
  process.stderr.write('Set KIRORA_SMOKE_API_KEY to a staging workspace key.\n');
  process.exit(2);
}
const apiUrl = process.env.KIRORA_SMOKE_API_URL?.trim();
const bin = fileURLToPath(new URL('../dist/bin.js', import.meta.url));
const configHome = mkdtempSync(join(tmpdir(), 'kirora-smoke-'));
const env = {
  // Never a KIRORA_* setting from the shell it's run from, such as a production key.
  ...Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('KIRORA_')),
  ),
  XDG_CONFIG_HOME: configHome,
  KIRORA_CREDENTIAL_STORE: 'file',
  KIRORA_API_KEY: apiKey,
  ...(apiUrl && { KIRORA_API_URL: apiUrl }),
};

const verbose = process.argv.includes('--verbose');
/** What the current check ran, for `--verbose`. */
let ran = [];

function kirora(args, input) {
  const result = spawnSync(process.execPath, [bin, ...args], {
    env,
    input,
    encoding: 'utf8',
    timeout: 60_000,
  });
  const run = { args, code: result.status, stdout: result.stdout, stderr: result.stderr };
  ran.push(run);
  return run;
}

const MAX_LINES = 40;

function show({ args, code, stdout, stderr }) {
  const quoted = args.map((arg) => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `'${arg}'`));
  const lines = [`  $ kirora ${quoted.join(' ')}`, `    exit ${code}`];
  for (const [stream, text] of [
    ['stdout', stdout],
    ['stderr', stderr],
  ]) {
    if (!text) continue;
    const all = text.trimEnd().split('\n');
    lines.push(
      `    ${stream}:`,
      ...all.slice(0, MAX_LINES).map((line) => `      ${line}`),
    );
    if (all.length > MAX_LINES)
      lines.push(`      … ${all.length - MAX_LINES} more lines`);
  }
  return `${lines.join('\n')}\n`;
}

const json = (text) => JSON.parse(text);
const NOWHERE = '00000000-0000-4000-8000-000000000000';

const checks = [
  [
    '--version prints the version',
    () => /^\d+\.\d+\.\d+/.test(kirora(['--version']).stdout),
  ],
  [
    'doctor passes every check',
    () => {
      const { code, stdout } = kirora(['doctor']);
      return code === 0 && json(stdout).ok === true;
    },
  ],
  [
    'whoami names the workspace and key',
    () => {
      const caller = json(kirora(['whoami']).stdout);
      return (
        caller.source === 'KIRORA_API_KEY' &&
        !!caller.workspace?.name &&
        !!caller.apiKey?.name
      );
    },
  ],
  ...['lists', 'contacts', 'campaigns', 'messages', 'segments', 'templates'].map(
    (resource) => [
      `${resource} list returns a page`,
      () => {
        const { code, stdout } = kirora([resource, 'list', '--limit', '1']);
        return code === 0 && Array.isArray(json(stdout).data);
      },
    ],
  ),
  [
    'webhooks list returns its webhooks',
    () => {
      const { code, stdout } = kirora(['webhooks', 'list']);
      return code === 0 && Array.isArray(json(stdout).data);
    },
  ],
  [
    '--paginate prints one JSON item per line',
    () => {
      const { code, stdout } = kirora(['lists', 'list', '--limit', '100', '--paginate']);
      return (
        code === 0 &&
        stdout
          .split('\n')
          .filter(Boolean)
          .every((line) => typeof json(line) === 'object')
      );
    },
  ],
  [
    'an id that does not exist is a 404, as JSON on stderr',
    () => {
      const { code, stdout, stderr } = kirora(['lists', 'get', NOWHERE]);
      return code === 1 && stdout === '' && json(stderr).error?.status === 404;
    },
  ],
  [
    '--dry-run sends nothing',
    () => {
      const { code, stdout } = kirora([
        'lists',
        'create',
        '--name',
        'smoke test',
        '--dry-run',
      ]);
      return code === 0 && json(stdout).dryRun === true;
    },
  ],
  [
    'a delete without --yes is refused before it is sent',
    () => {
      const { code, stderr } = kirora(['lists', 'delete', NOWHERE]);
      return code === 1 && json(stderr).error?.code === 'CONFIRMATION_REQUIRED';
    },
  ],
  [
    'login checks the key and saves it, and the saved login works',
    () => {
      const login = [
        'login',
        '--profile',
        'smoke',
        ...(apiUrl ? ['--base-url', apiUrl] : []),
      ];
      if (kirora(login, apiKey).code !== 0) return false;
      const { code, stdout } = kirora(['whoami', '--profile', 'smoke']);
      return code === 0 && json(stdout).profile === 'smoke';
    },
  ],
];

process.stdout.write(`Smoke test against ${apiUrl ?? 'the default API host'}\n`);
let failed = 0;
for (const [name, check] of checks) {
  ran = [];
  let passed = false;
  try {
    passed = check();
  } catch {}
  if (!passed) failed += 1;
  process.stdout.write(`${passed ? 'pass' : 'FAIL'}  ${name}\n`);
  if (verbose) process.stdout.write(`${ran.map(show).join('')}\n`);
}
rmSync(configHome, { recursive: true, force: true });
process.stdout.write(failed === 0 ? 'All passed\n' : `${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
