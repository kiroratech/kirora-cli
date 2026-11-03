/**
 * Checks the CLI as it would be published: packs it (or takes a tarball), checks that
 * the documentation it ships links only to files it ships, installs it globally into a
 * throwaway prefix as `npm install -g` would, and runs the installed `kirora`:
 *
 *   pnpm check:package [path/to/package.tgz]
 *
 * Given a tarball, it checks that one instead of packing a new one, so a release can
 * publish exactly what was checked. Installing fetches the dependencies from npm.
 */
import { execFile as execFileCallback } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);
const root = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'kirora-cli-package-'));
const run = async (command, args, options = {}) =>
  (await execFile(command, args, { cwd: work, ...options })).stdout;

try {
  const given = process.argv[2];
  let tarball;
  if (given === undefined) {
    // `pnpm pack` runs `prepack`, so this also checks the package builds itself.
    await run('pnpm', ['pack', '--pack-destination', work], { cwd: root });
    tarball = join(
      work,
      `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`,
    );
  } else {
    tarball = resolve(given);
  }
  const files = new Set(
    (await run('tar', ['-tzf', tarball]))
      .split('\n')
      .filter(Boolean)
      .map((file) => file.replace(/^package\//, '')),
  );
  const required = [
    ...Object.values(pkg.bin),
    'llms.txt',
    'skills/kirora-cli/SKILL.md',
    'docs/usage.md',
  ];
  for (const file of required) {
    if (!files.has(file.replace(/^\.\//, ''))) {
      throw new Error(`${file} is missing from the tarball`);
    }
  }

  // Relative links in the documentation the package ships must lead to files it ships;
  // a link to a folder, to a file in it.
  const shipped = (path) =>
    path.endsWith('/')
      ? [...files].some((file) => file.startsWith(path))
      : files.has(path);
  const unpacked = join(work, 'unpacked');
  await run('mkdir', ['-p', unpacked]);
  await run('tar', ['-xzf', tarball, '-C', unpacked, '--strip-components=1']);
  for (const doc of [...files].filter((file) => /\.(?:md|txt)$/.test(file))) {
    const text = readFileSync(join(unpacked, doc), 'utf8');
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^[a-z][a-z\d+.-]*:|^#/i.test(target)) continue;
      const path = decodeURIComponent(target.split('#')[0]);
      const file = posix.join(path.startsWith('/') ? '' : posix.dirname(doc), path);
      if (!shipped(file.replace(/^\//, ''))) {
        throw new Error(`${doc} links to ${target}, which is missing from the tarball`);
      }
    }
  }

  // Installed as a user would, then run with no config and no key of the developer's.
  const prefix = join(work, 'prefix');
  await run('npm', [
    'install',
    '--global',
    '--prefix',
    prefix,
    '--no-audit',
    '--no-fund',
    tarball,
  ]);
  const kirora = join(prefix, 'bin', 'kirora');
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith('KIRORA_')),
  );
  const cli = (...args) =>
    run(kirora, args, { env: { ...env, XDG_CONFIG_HOME: join(work, 'config') } });

  const version = (await cli('--version')).trim();
  if (version !== pkg.version) {
    throw new Error(`kirora --version says ${version}, not ${pkg.version}`);
  }
  const help = await cli('--help');
  const agentFiles = help.match(/\/\S+\.(?:txt|md)/g) ?? [];
  if (agentFiles.length !== 2 || !agentFiles.every((path) => existsSync(path))) {
    throw new Error(
      `kirora --help names agent files that aren't installed: ${agentFiles}`,
    );
  }
  const dryRun = JSON.parse(await cli('lists', 'create', '--name', 'VIPs', '--dry-run'));
  if (dryRun.request?.path !== '/v1/lists') {
    throw new Error(`kirora lists create --dry-run printed ${JSON.stringify(dryRun)}`);
  }
  process.stdout.write(
    `${pkg.name}@${pkg.version} installs globally, and its kirora runs and finds its docs\n`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
