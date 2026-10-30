import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { runCli } from '../src/cli.js';
import { CLI_ERROR_CODES } from '../src/lib/output.js';
import { RESOURCES } from '../src/operations.js';
import { fakeIo } from './helpers.js';

/** The words of a command line as a POSIX shell splits them, for the quoting help uses. */
function shellWords(line: string): string[] {
  const words: string[] = [];
  let word = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    if (quoted) {
      if (char === "'") quoted = false;
      else word += char;
    } else if (char === "'") {
      quoted = true;
    } else if (char === '\\') {
      word += line[(index += 1)];
    } else if (char === ' ') {
      if (word) words.push(word);
      word = '';
    } else {
      word += char;
    }
  }
  if (word) words.push(word);
  return words;
}

const examples = RESOURCES.flatMap((resource) =>
  resource.operations.flatMap((operation) =>
    operation.help
      .split('\n')
      .filter((line) => line.trimStart().startsWith('$ kirora '))
      .map((line) => ({ name: `${resource.name} ${operation.action}`, line })),
  ),
);

describe('--help', () => {
  it('shows the fields only --data can carry, the examples and the reference', async () => {
    const { io, output } = await fakeIo(() => undefined);

    expect(await runCli(['transactional', 'send', '--help'], io)).toBe(0);

    expect(output.stdout).toContain('Body fields only --data can carry (* required):');
    expect(output.stdout).toContain(
      'to*    one of { contactId* } | { externalId* } | { email* }',
    );
    expect(output.stdout).toMatch(
      /email {2}one of \{ template\*.*\} \| \{ subject\*.*html\*/,
    );
    expect(output.stdout).toContain('Email written in the request:');
    expect(output.stdout).toContain(
      'API reference: https://kirora.io/docs/api/reference/sendTransactionalMessage',
    );
  });

  it("explains a command in its own help, and keeps a resource's list to summaries", async () => {
    const { io, output } = await fakeIo(() => undefined);

    expect(await runCli(['messages', 'deliveries', '--help'], io)).toBe(0);
    expect(output.stdout).toMatch(/Lists what each device reported for one push message/);
    expect(output.stdout).toMatch(/A message that is not a push returns 404\./);

    output.stdout = '';
    expect(await runCli(['messages', '--help'], io)).toBe(0);
    expect(output.stdout).toContain("List a push message's deliveries");
    expect(output.stdout).not.toContain('Lists what each device reported');
  });

  it.each(examples)(
    '$name: its example, pasted, sends the body it shows',
    async ({ line }) => {
      const [, ...args] = shellWords(line.trim().slice(2));
      const filled = args.map((arg) => arg.replace(/^<[\w-]+>$/, 'id-1'));
      const data = JSON.parse(filled[filled.indexOf('-d') + 1]!) as unknown;
      const { io, output } = await fakeIo(() => undefined);

      expect(await runCli([...filled, '--dry-run'], io)).toBe(0);

      expect(JSON.parse(output.stdout)).toMatchObject({
        dryRun: true,
        request: { body: data },
      });
    },
  );
});

describe('the agent skill', () => {
  it('lists every error code the CLI can print, as the CLI describes it', () => {
    const skill = readFileSync(
      new URL('../skills/kirora-cli/SKILL.md', import.meta.url),
      'utf8',
    );
    // The table's rows, padded as Prettier pads them: `| \`CODE\` | meaning |`.
    const rows = new Map(
      [...skill.matchAll(/^\| `([A-Z_]+)` +\| (.+?) +\|$/gm)].map(([, code, about]) => [
        code,
        about,
      ]),
    );

    const wrong = Object.entries(CLI_ERROR_CODES).filter(
      ([code, about]) => rows.get(code) !== about,
    );

    expect(wrong).toEqual([]);
  });
});
