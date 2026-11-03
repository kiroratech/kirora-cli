import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ReadableStream } from 'node:stream/web';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { runCli } from '../src/cli.js';
import { configPath } from '../src/lib/config.js';
import {
  deliver,
  deliverTooLarge,
  fakeIo,
  hangUntilAborted,
  listeningPort,
  tempDir,
  webhookCreated,
  writeConfig,
} from './helpers.js';

const CALLER = { workspace: { name: 'Acme' }, apiKey: { name: 'CI' } };

const ALREADY_EXISTS = () =>
  Response.json(
    { error: { code: 'ALREADY_EXISTS', message: 'This URL is already subscribed' } },
    { status: 409 },
  );

/** `webhooks listen` on a test URL, on any free port. */
const LISTEN = ['webhooks', 'listen', '--url', 'https://tunnel.example', '--port', '0'];

const KEY = { KIRORA_API_KEY: 'kirora_env', KIRORA_API_URL: 'https://api.acme.dev/' };

describe('kirora CLI', () => {
  it('sends an action with --data and its field flags merged, and prints the body', async () => {
    const { io, fetch, output } = await fakeIo(
      () => Response.json({ data: { id: 'group-1' } }, { status: 201 }),
      { ...KEY, KIRORA_WORKSPACE: 'tenant-42' },
    );

    expect(await runCli(['lists', 'create', '-d', '-', '--description', 'Top'], io)).toBe(
      0,
    );

    const [url, init] = fetch.mock.calls[0]!;
    expect(String(url)).toBe('https://api.acme.dev/v1/lists');
    expect(init).toMatchObject({
      method: 'POST',
      body: '{"name":"VIPs","description":"Top"}',
      headers: { authorization: 'Bearer kirora_env', 'kirora-workspace': 'tenant-42' },
    });
    expect(JSON.parse(output.stdout)).toEqual({ data: { id: 'group-1' } });
  });

  it('puts arguments in the path and the idempotency key in its header', async () => {
    const { io, fetch } = await fakeIo(() => Response.json({ data: {} }), KEY);

    expect(await runCli(['lists', 'get', 'group 1'], io)).toBe(0);
    const args = ['transactional', 'send', '-d', '{}', '--idempotency-key', 'k-1'];
    expect(await runCli(args, io)).toBe(0);

    expect(String(fetch.mock.calls[0]![0])).toBe(
      'https://api.acme.dev/v1/lists/group%201',
    );
    expect(fetch.mock.calls[1]![1]?.headers).toMatchObject({ 'idempotency-key': 'k-1' });
  });

  it('prints an API error to stderr and exits 1, so a pipeline sees nothing', async () => {
    const error = { code: 'VALIDATION_ERROR', message: 'name is required' };
    const { io, output } = await fakeIo(
      () => Response.json({ error }, { status: 422 }),
      KEY,
    );

    expect(await runCli(['lists', 'create'], io)).toBe(1);

    expect(output.stdout).toBe('');
    expect(JSON.parse(output.stderr)).toMatchObject({ error });
  });

  it('follows every page of a list and prints one item per line', async () => {
    const { io, output } = await fakeIo(
      (url) =>
        Response.json(
          url.searchParams.get('cursor') === 'page-2'
            ? {
                data: [{ id: 'c' }],
                meta: { pagination: { limit: 2, nextCursor: null } },
              }
            : {
                data: [{ id: 'a' }, { id: 'b' }],
                meta: { pagination: { limit: 2, nextCursor: 'page-2' } },
              },
        ),
      KEY,
    );

    expect(await runCli(['contacts', 'list', '--limit', '2', '--paginate'], io)).toBe(0);

    expect(output.stdout).toBe('{"id":"a"}\n{"id":"b"}\n{"id":"c"}\n');
  });

  it('checks a key at login, saves it readable only by its owner, and uses it', async () => {
    const caller = {
      workspace: { id: 'w', name: 'Acme' },
      apiKey: { id: 'k', name: 'Laptop', kind: 'standard', source: null, scopes: [] },
    };
    const { io, fetch, output } = await fakeIo((url) =>
      url.pathname === '/v1/me'
        ? Response.json({ data: caller })
        : Response.json({
            data: [],
            meta: { pagination: { limit: 25, nextCursor: null } },
          }),
    );

    const login = [
      'login',
      '--base-url',
      'https://api.acme.dev',
      '--workspace',
      'tenant-7',
    ];
    expect(await runCli(login, io)).toBe(0);
    expect(output.stdout).toContain('Logged in to Acme');
    // Windows has no permission bits to check: every file reads as 0o666.
    if (process.platform !== 'win32') {
      expect((await stat(configPath(io.env))).mode & 0o777).toBe(0o600);
    }

    expect(await runCli(['lists', 'list'], io)).toBe(0);
    const [url, init] = fetch.mock.calls[1]!;
    expect(String(url)).toBe('https://api.acme.dev/v1/lists');
    expect(init?.headers).toMatchObject({
      authorization: 'Bearer kirora_saved',
      'kirora-workspace': 'tenant-7',
    });
  });

  it('keeps the key in the keychain, or in the file when asked, never both', async () => {
    const { io, keychain } = await fakeIo(() => Response.json({ data: CALLER }));
    const configText = () => readFileSync(configPath(io.env), 'utf8');

    expect(await runCli(['login'], io)).toBe(0);
    expect([...keychain.secrets.values()]).toEqual(['kirora_saved']);
    expect(configText()).not.toContain('kirora_saved');

    expect(await runCli(['login', '--insecure-storage'], io)).toBe(0);
    expect(keychain.secrets.size).toBe(0);
    expect(configText()).toContain('kirora_saved');

    expect(await runCli(['login'], io)).toBe(0);
    expect(await runCli(['logout'], io)).toBe(0);
    expect(keychain.secrets.size).toBe(0);
  });

  it('never deletes a key saved by a login that ran while a logout was finishing', async () => {
    const { io, keychain, printed } = await fakeIo(() => Response.json({ data: CALLER }));
    expect(await runCli(['login'], io)).toBe(0);
    // Holds logout inside its keychain delete, after the profile has left the config,
    // while a login runs.
    let resume = () => {};
    const paused = new Promise<void>((resolve) => (resume = resolve));
    let reached = false;
    const deleteKey = keychain.delete;
    keychain.delete = async (account) => {
      reached = true;
      await paused;
      await deleteKey(account);
    };

    const loggingOut = runCli(['logout'], io);
    await vi.waitFor(() => expect(reached).toBe(true));
    keychain.delete = deleteKey;
    expect(await runCli(['login'], io)).toBe(0);
    resume();
    expect(await loggingOut).toBe(0);

    expect([...keychain.secrets.values()]).toEqual(['kirora_saved']);
    expect(await printed(['whoami'])).toMatchObject({ storage: 'keychain' });
  });

  it("says when a logout couldn't delete its key, and deletes it at the next login", async () => {
    const { io, keychain, output } = await fakeIo(() => Response.json({ data: CALLER }));
    expect(await runCli(['login'], io)).toBe(0);
    const [first] = [...keychain.secrets.keys()];
    const deleteKey = keychain.delete;
    keychain.delete = async () => {
      throw new Error('keyring locked');
    };

    expect(await runCli(['logout'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'KEY_NOT_DELETED' },
    });
    // Logged out, so doctor fails on the missing key; its config check warns.
    output.stdout = '';
    await runCli(['doctor'], io);
    expect(JSON.parse(output.stdout)).toMatchObject({
      checks: expect.arrayContaining([
        expect.objectContaining({ name: 'Config file', status: 'warn' }),
      ]),
    });

    keychain.delete = deleteKey;
    expect(await runCli(['login'], io)).toBe(0);
    expect(keychain.secrets.has(first!)).toBe(false);
    expect(keychain.secrets.size).toBe(1);
    expect(readFileSync(configPath(io.env), 'utf8')).not.toContain('keysToDelete');
  });

  it('treats only saved profiles as profiles, whatever their name', async () => {
    const { io, output, printed } = await fakeIo(() => Response.json({ data: CALLER }));
    expect(await runCli(['login'], io)).toBe(0);

    expect(await runCli(['auth', 'switch', 'constructor'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'PROFILE_NOT_FOUND' },
    });
    expect(await runCli(['auth', 'rename', 'default', 'constructor'], io)).toBe(0);
    expect(await runCli(['auth', 'switch', 'constructor'], io)).toBe(0);
    expect(await printed(['whoami'])).toMatchObject({ profile: 'constructor' });
  });

  it('refuses a config file that is not a saved set of logins', async () => {
    const { io, output } = await fakeIo(() => undefined);
    await writeConfig(io.env, { profiles: { default: { apiKey: 7 } } });

    expect(await runCli(['lists', 'list'], io)).toBe(1);

    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'CONFIG_INVALID' },
    });
  });

  it('keeps every profile when logins run at once, and renames one', async () => {
    const { io, printed } = await fakeIo(() => Response.json({ data: CALLER }));
    const names = ['a', 'b', 'c', 'd', 'e'];

    const codes = await Promise.all(
      names.map((name) => runCli(['login', '--profile', name], io)),
    );
    expect(codes).toEqual([0, 0, 0, 0, 0]);
    expect(await runCli(['auth', 'switch', 'a'], io)).toBe(0);
    expect(await runCli(['auth', 'rename', 'a', 'work'], io)).toBe(0);
    expect(await runCli(['login', '--profile', 'no good'], io)).toBe(1);

    const profiles = await printed<{ name: string; active: boolean }[]>(['auth', 'list']);
    expect(profiles.map(({ name }) => name).sort()).toEqual(['b', 'c', 'd', 'e', 'work']);
    expect(profiles.find(({ active }) => active)?.name).toBe('work');
  });

  it('listens: subscribes, prints and forwards each signed delivery, then unsubscribes', async () => {
    // The handler that --forward-to names is at handler.example; the rest is the API.
    const { io, fetch, output, interrupt } = await fakeIo((url, init) => {
      if (url.host === 'handler.example') return new Response(null, { status: 202 });
      return init.method === 'POST'
        ? webhookCreated('wh-1')
        : new Response(null, { status: 204 });
    }, KEY);
    const args = ['webhooks', 'listen', '--url', 'https://tunnel.example'];
    const listening = runCli(
      [
        ...args,
        '--events',
        'message.delivered',
        '--port',
        '0',
        '--forward-to',
        'http://handler.example/hooks',
      ],
      io,
    );
    const port = await listeningPort(output);
    const replies = [
      await deliver(
        port,
        JSON.stringify({ eventType: 'message.delivered', eventId: 'ev-1' }),
      ),
      await deliver(port, '{}', 'whsec_other'),
      await deliver(port, 'not json'),
      // Signed, but its headers name another event than its body does.
      await deliver(
        port,
        JSON.stringify({ eventType: 'message.delivered', eventId: 'ev-2' }),
      ),
      await deliverTooLarge(port),
    ];
    interrupt();
    expect(await listening).toBe(0);

    expect(replies).toEqual([202, 401, 401, 401, 413]);
    const calls = fetch.mock.calls.map(([url, init]) => ({ url: String(url), init }));
    const forwarded = calls.filter(({ url }) => url.startsWith('http://handler.example'));
    expect(forwarded).toHaveLength(1);
    expect(forwarded[0]!.init?.headers).toEqual(
      expect.arrayContaining([['x-webhook-event-id', 'ev-1']]),
    );
    const lines = output.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(lines).toEqual([
      expect.objectContaining({
        event: 'message.delivered',
        payload: { eventType: 'message.delivered', eventId: 'ev-1' },
        forwarded: { url: 'http://handler.example/hooks', status: 202 },
      }),
    ]);
    // With --forward-to, the handler is told the secret to verify the deliveries with.
    expect(output.stderr).toContain('Deliveries are signed with whsec_test');
    expect(
      calls
        .filter(({ url }) => url.startsWith('https://api.acme.dev'))
        .map(({ url, init }) => `${init?.method} ${url}`),
    ).toEqual([
      'POST https://api.acme.dev/v1/webhooks',
      'DELETE https://api.acme.dev/v1/webhooks/wh-1',
    ]);
    expect(calls[0]!.init?.body).toBe(
      '{"url":"https://tunnel.example","events":["message.delivered"]}',
    );
  });

  it("answers a delivery with the handler's own status, a redirect included", async () => {
    const { io, output, interrupt } = await fakeIo((url, init) => {
      if (url.host === 'handler.example') {
        expect(init.redirect).toBe('manual');
        return new Response('moved', { status: 302, headers: { location: '/login' } });
      }
      return init.method === 'POST'
        ? webhookCreated('wh-4')
        : new Response(null, { status: 204 });
    }, KEY);
    const listening = runCli(
      [...LISTEN, '--forward-to', 'http://handler.example/hooks'],
      io,
    );
    const port = await listeningPort(output);

    expect(
      await deliver(port, '{"eventType":"message.delivered","eventId":"ev-1"}'),
    ).toBe(302);
    interrupt();
    expect(await listening).toBe(0);
    expect(JSON.parse(output.stdout)).toMatchObject({ forwarded: { status: 302 } });
  });

  it('a second Ctrl+C stops a cleanup that hangs, saying what is left subscribed', async () => {
    const { io, output, interrupt } = await fakeIo(
      (_url, init) =>
        init.method === 'POST' ? webhookCreated('wh-3') : hangUntilAborted(init),
      KEY,
    );

    const listening = runCli(LISTEN, io);
    await listeningPort(output);
    interrupt();
    interrupt();

    expect(await listening).toBe(1);
    expect(JSON.parse(output.stderr.slice(output.stderr.indexOf('{')))).toMatchObject({
      error: {
        code: 'WEBHOOK_NOT_DELETED',
        message: expect.stringContaining('kirora webhooks delete wh-3 --yes'),
      },
    });
  });

  it('a second Ctrl+C stops the lookup of the webhook already subscribed', async () => {
    const { io, output, interrupt } = await fakeIo((_url, init) => {
      if (init.method === 'POST') return ALREADY_EXISTS();
      interrupt();
      interrupt();
      return hangUntilAborted(init);
    }, KEY);

    expect(await runCli(LISTEN, io)).toBe(1);

    expect(JSON.parse(output.stderr)).toMatchObject({ error: { code: 'INTERRUPTED' } });
  });

  it('names the webhook already subscribed to the URL, and how to delete it', async () => {
    const { io, output } = await fakeIo((_url, init) => {
      if (init.method === 'POST') return ALREADY_EXISTS();
      return Response.json({
        data: [
          { id: 'wh-other', url: 'https://other.example' },
          { id: 'wh-old', url: 'https://tunnel.example' },
        ],
        meta: { pagination: { limit: 20, nextCursor: null } },
      });
    }, KEY);

    expect(await runCli(LISTEN, io)).toBe(1);

    expect(JSON.parse(output.stderr)).toMatchObject({
      error: {
        code: 'ALREADY_SUBSCRIBED',
        message: expect.stringContaining('kirora webhooks delete wh-old --yes'),
      },
    });
  });

  it('deletes the webhook when Ctrl+C comes while it is being made', async () => {
    const { io, fetch, output, interrupt } = await fakeIo((_url, init) => {
      if (init.method !== 'POST') return new Response(null, { status: 204 });
      interrupt();
      return webhookCreated('wh-2');
    }, KEY);

    expect(await runCli(LISTEN, io)).toBe(0);

    expect(fetch.mock.calls.map(([url, init]) => `${init?.method} ${url}`)).toEqual([
      'POST https://api.acme.dev/v1/webhooks',
      'DELETE https://api.acme.dev/v1/webhooks/wh-2',
    ]);
    expect(output.stderr).not.toContain('Listening');
  });

  it('doctor reports each check, and exits 1 only when one fails', async () => {
    const caller = {
      workspace: { name: 'Acme' },
      apiKey: { name: 'CI', scopes: ['lists:read'] },
    };
    const { io, output } = await fakeIo(() => Response.json({ data: caller }), KEY);

    expect(await runCli(['doctor'], io)).toBe(0);
    const report = JSON.parse(output.stdout) as {
      ok: boolean;
      checks: { name: string; status: string; message: string }[];
    };
    expect(report.ok).toBe(true);
    expect(report.checks.find(({ name }) => name === 'API')?.message).toBe(
      'Acme, with the key "CI" (lists:read)',
    );

    const { io: loggedOut, output: failed } = await fakeIo(() => undefined);
    expect(await runCli(['doctor'], loggedOut)).toBe(1);
    expect(JSON.parse(failed.stdout)).toMatchObject({ ok: false });
    expect(failed.stderr).toBe('');
  });

  it('completes commands, flags and choices, and prints the command tree', async () => {
    const { io, output, printed } = await fakeIo(() => undefined);
    const completions = async (...words: string[]) => {
      output.stdout = '';
      expect(await runCli(['__complete', '--', ...words], io)).toBe(0);
      return output.stdout.split('\n').filter(Boolean);
    };

    expect(await completions('web')).toEqual(['webhooks']);
    expect(await completions('webhooks', 'deliveries', '')).toEqual([
      'get',
      'list',
      'redeliver',
    ]);
    expect(await completions('lists', 'list', '--li')).toEqual(['--limit']);
    // `lists` alone runs `lists list`, so its flags complete there too.
    expect(await completions('lists', '--li')).toEqual(['--limit']);
    expect(await completions('contacts', 'topics', 'set', '--id-type', 'e')).toEqual([
      'externalId',
      'email',
    ]);
    expect(await completions('--profile', 'work', 'auth', 's')).toEqual(['switch']);

    const tree = await printed<{ commands: { name: string }[] }>(['commands']);
    const names = tree.commands.map(({ name }) => name);
    expect(names).toEqual(
      expect.arrayContaining(['whoami', 'doctor', 'lists', 'completion']),
    );
    expect(names).not.toContain('__complete');
  });

  it('logs in and out of the profile KIRORA_PROFILE names, as other commands use', async () => {
    const { io, printed } = await fakeIo(() => Response.json({ data: CALLER }));
    const staging = { ...io, env: { ...io.env, KIRORA_PROFILE: 'staging' } };

    expect(await runCli(['login'], io)).toBe(0);
    expect(await runCli(['login'], staging)).toBe(0);
    expect(await runCli(['logout'], staging)).toBe(0);

    expect(await printed(['auth', 'list'])).toMatchObject([{ name: 'default' }]);
  });

  it('takes over a lock its holder left behind, once, with many runs racing for it', async () => {
    const { io, printed } = await fakeIo(() => Response.json({ data: CALLER }));
    // The id of a process that has exited, as a crashed lock holder's would be.
    const { pid } = spawnSync(process.execPath, ['-e', '']);
    const lockDir = `${configPath(io.env)}.locks`;
    await mkdir(lockDir, { recursive: true });
    await writeFile(join(lockDir, '1'), `${pid} left-behind`);
    const names = Array.from({ length: 12 }, (_, index) => `p${index}`);

    const codes = await Promise.all(
      names.map((name) => runCli(['login', '--profile', name], io)),
    );

    expect(codes.every((code) => code === 0)).toBe(true);
    const saved = (await printed<{ name: string }[]>(['auth', 'list'])).map(
      ({ name }) => name,
    );
    expect(saved.sort()).toEqual([...names].sort());
    const left = await readdir(lockDir);
    expect(left).toHaveLength(2);
    expect(left.some((name) => name.endsWith('.free'))).toBe(true);
  });

  it('points AI agents at llms.txt and the skill, by paths that exist', async () => {
    const { io, output } = await fakeIo(() => undefined);

    expect(await runCli(['--help'], io)).toBe(0);

    // Absolute paths: /… on Unix, C:\… on Windows.
    const paths = output.stdout.match(/(?:[A-Za-z]:)?[\\/]\S+\.(?:txt|md)/g) ?? [];
    expect(paths.map((path) => path.split(/[\\/]/).at(-1))).toEqual([
      'llms.txt',
      'SKILL.md',
    ]);
    for (const path of paths) expect(existsSync(path)).toBe(true);
  });

  it('prints a CSV export as it comes, and still an error as an error', async () => {
    const csv = 'id,email\nm1,ada@example.com\n';
    const { io, output } = await fakeIo(
      (url) =>
        url.pathname.endsWith('/ex1/download')
          ? new Response(csv, { headers: { 'content-type': 'text/csv; charset=utf-8' } })
          : Response.json(
              { error: { code: 'NOT_FOUND', message: 'No such export' } },
              { status: 404 },
            ),
      KEY,
    );

    expect(await runCli(['messages', 'exports', 'download', 'ex1'], io)).toBe(0);
    expect(output.stdout).toBe(csv);

    expect(await runCli(['messages', 'exports', 'download', 'ex2'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('streams a download larger than any limit on a JSON body, as it arrives', async () => {
    const chunk = new TextEncoder().encode('x'.repeat(1024 * 1024));
    let sent = 0;
    const { io } = await fakeIo(
      () =>
        new Response(
          new ReadableStream<Uint8Array>({
            pull(controller) {
              if (sent === 70) return controller.close();
              sent += 1;
              controller.enqueue(chunk);
            },
          }),
          { headers: { 'content-type': 'text/csv' } },
        ),
      KEY,
    );
    let received = 0;
    io.pipeStdout = async (body) => {
      for await (const part of body) received += part.byteLength;
    };

    expect(await runCli(['messages', 'exports', 'download', 'ex1'], io)).toBe(0);

    expect(received).toBe(70 * 1024 * 1024);
  });

  it('never takes its API host from KIRORA_BASE_URL, which the CLI does not use', async () => {
    const { io, fetch } = await fakeIo(() => Response.json({ data: CALLER }));
    expect(await runCli(['login'], io)).toBe(0);
    process.env.KIRORA_BASE_URL = 'https://somewhere-else.example';
    try {
      expect(await runCli(['whoami'], io)).toBe(0);
    } finally {
      delete process.env.KIRORA_BASE_URL;
    }

    expect(String(fetch.mock.calls.at(-1)![0])).toBe('https://api.kirora.io/v1/me');
  });

  it('keeps which fields failed, and says what was wrong with a response it cannot use', async () => {
    const errors = [{ field: 'email', code: 'invalid', message: 'Not an email address' }];
    const { io, output } = await fakeIo(
      (url) =>
        url.pathname === '/v1/contacts/identify'
          ? Response.json(
              { error: { code: 'VALIDATION_ERROR', message: 'Invalid body', errors } },
              { status: 422, headers: { 'x-request-id': 'req-1' } },
            )
          : new Response('<html>proxy</html>', {
              headers: { 'content-type': 'text/html', 'x-request-id': 'req-2' },
            }),
      KEY,
    );

    expect(await runCli(['contacts', 'identify', '--email', 'nope'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'VALIDATION_ERROR', status: 422, errors },
    });

    output.stderr = '';
    expect(await runCli(['lists', 'list'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'INVALID_RESPONSE', status: 200, requestId: 'req-2' },
    });
  });

  it('uploads a file with its text fields sent as text', async () => {
    const { io, fetch, printed } = await fakeIo(() => Response.json({ data: {} }), KEY);
    const logo = join(await tempDir(), 'logo.png');
    await writeFile(logo, 'png bytes');

    const upload = ['assets', 'upload', '--file', logo, '--name', 'Logo'];
    expect(await printed([...upload, '--dry-run'])).toMatchObject({
      request: { body: { file: '<file logo.png>', name: 'Logo' } },
    });
    expect(await runCli(upload, io)).toBe(0);

    const form = fetch.mock.calls[0]![1]?.body as FormData;
    expect(form.get('name')).toBe('Logo');
    expect(await (form.get('file') as File).text()).toBe('png bytes');
  });

  it('takes a date or a date-time where the API takes either', async () => {
    const { printed } = await fakeIo(() => undefined);

    const window = ['--from', '2026-10-01', '--to', '2026-10-08T12:00:00Z', '--dry-run'];
    expect(await printed(['reports', 'overview', ...window])).toMatchObject({
      request: { query: { from: '2026-10-01', to: '2026-10-08T12:00:00Z' } },
    });
  });

  it('says a dry run of --paginate would follow every page', async () => {
    const { printed } = await fakeIo(() => undefined);

    expect(await printed(['lists', 'list', '--paginate', '--dry-run'])).toMatchObject({
      request: { method: 'GET', path: '/v1/lists', paginate: true },
    });
  });

  it('saves the KIRORA_WORKSPACE tenant with a login, as it saves KIRORA_API_URL', async () => {
    const { io, fetch } = await fakeIo(() => Response.json({ data: CALLER }));
    const env = {
      ...io.env,
      KIRORA_API_URL: 'https://api.acme.dev',
      KIRORA_WORKSPACE: 'tenant-1',
    };

    expect(await runCli(['login'], { ...io, env })).toBe(0);
    expect(await runCli(['whoami'], io)).toBe(0);

    expect(fetch.mock.calls[1]![1]?.headers).toMatchObject({
      'kirora-workspace': 'tenant-1',
    });
  });

  it('takes over a lock file that names no holder at once, rather than waiting', async () => {
    const { io } = await fakeIo(() => Response.json({ data: CALLER }));
    const lockDir = `${configPath(io.env)}.locks`;
    await mkdir(lockDir, { recursive: true });
    await writeFile(join(lockDir, '1'), '');

    const started = Date.now();
    expect(await runCli(['login'], io)).toBe(0);

    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it('makes a first login under any name the active one, and names the saved ones', async () => {
    const { io, output, printed } = await fakeIo(() => Response.json({ data: CALLER }));

    expect(await runCli(['login', '--profile', 'work'], io)).toBe(0);
    expect(await printed(['whoami'])).toMatchObject({ profile: 'work' });

    expect(await runCli(['login', '--profile', 'other'], io)).toBe(0);
    expect(await runCli(['logout'], io)).toBe(0);
    output.stderr = '';
    expect(await runCli(['whoami'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'NO_ACTIVE_PROFILE', message: expect.stringContaining('other') },
    });
  });

  it('refuses a command it cannot read before calling anything, in JSON', async () => {
    const { io, fetch, output } = await fakeIo(() => undefined, KEY);
    const refused = async (...args: string[]) => {
      output.stderr = '';
      expect(await runCli(args, io)).toBe(2);
      return (JSON.parse(output.stderr) as { error: { code: string } }).error.code;
    };

    expect(await refused('lists', 'get')).toBe('USAGE_ERROR');
    expect(await refused('lists', 'list', '--wat')).toBe('USAGE_ERROR');
    expect(await refused('events', 'track', '-d', '{')).toBe('USAGE_ERROR');
    expect(await refused('lists', 'list', '--limit', 'ten')).toBe('USAGE_ERROR');
    for (const limit of ['0x10', '1e3', 'Infinity', '9'.repeat(400)]) {
      expect(await refused('lists', 'list', '--limit', limit)).toBe('USAGE_ERROR');
    }
    expect(await refused('lists', 'list', '--paginate', '-i')).toBe('USAGE_ERROR');
    expect(await refused('events', 'series', '--dry-run')).toBe('USAGE_ERROR');
    expect(await refused('events', 'series', '--name', 'Order', '--dry-run')).toBe(
      'USAGE_ERROR',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('nests a sub-collection, lists by default and takes two ids as flags', async () => {
    const { io, fetch } = await fakeIo(
      () => Response.json({ data: [], meta: { pagination: { nextCursor: null } } }),
      KEY,
    );

    expect(await runCli(['webhooks', 'deliveries', 'ls'], io)).toBe(0);
    expect(await runCli(['lists'], io)).toBe(0);
    const topic = ['contacts', 'topics', 'set', '--topic-id', 't1', 'c1', '-d', '{}'];
    expect(await runCli(topic, io)).toBe(0);

    expect(fetch.mock.calls.map(([url, init]) => `${init?.method} ${url}`)).toEqual([
      'GET https://api.acme.dev/v1/webhooks/deliveries',
      'GET https://api.acme.dev/v1/lists',
      'PUT https://api.acme.dev/v1/contacts/c1/topics/t1',
    ]);
  });

  it('prints the request with --dry-run and sends nothing, without a login', async () => {
    const { io, fetch, output } = await fakeIo(() => undefined);

    const args = ['lists', 'create', '--name', 'VIPs', '--idempotency-key', 'k-1'];
    expect(await runCli([...args, '--dry-run'], io)).toBe(0);

    expect(fetch).not.toHaveBeenCalled();
    expect(JSON.parse(output.stdout)).toEqual({
      dryRun: true,
      request: {
        method: 'POST',
        path: '/v1/lists',
        body: { name: 'VIPs' },
        idempotencyKey: 'k-1',
      },
    });
  });

  it('deletes only with --yes, or when someone at a terminal says so', async () => {
    const { io, fetch, output } = await fakeIo(
      () => new Response(null, { status: 204 }),
      KEY,
    );

    expect(await runCli(['lists', 'rm', 'group-1'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({
      error: { code: 'CONFIRMATION_REQUIRED' },
    });
    const confirm = vi.fn(async () => false);
    expect(
      await runCli(['lists', 'rm', 'group-1'], { ...io, interactive: true, confirm }),
    ).toBe(1);
    expect(confirm).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();

    expect(await runCli(['lists', 'delete', 'group-1', '--yes'], io)).toBe(0);
    expect(fetch.mock.calls[0]![1]?.method).toBe('DELETE');
  });

  it("takes a field's flag in the API's own spelling too", async () => {
    const { io, fetch } = await fakeIo(() => Response.json({ data: {} }), KEY);

    expect(await runCli(['contacts', 'identify', '--externalId', 'cust_1'], io)).toBe(0);

    expect(fetch.mock.calls[0]![1]?.body).toBe('{"externalId":"cust_1"}');
  });

  it('prints a failure of its own in the shape of an API error', async () => {
    const { io, fetch, output } = await fakeIo(() => undefined);

    expect(await runCli(['lists', 'list'], io)).toBe(1);

    expect(fetch).not.toHaveBeenCalled();
    expect(JSON.parse(output.stderr)).toMatchObject({ error: { code: 'NOT_LOGGED_IN' } });
  });

  it('switches the active profile, and whoami says which one a command uses', async () => {
    const { io, fetch, printed } = await fakeIo(() => Response.json({ data: CALLER }));

    expect(await runCli(['login', '--profile', 'work'], io)).toBe(0);
    expect(await runCli(['auth', 'switch', 'work'], io)).toBe(0);

    expect(await printed(['whoami'])).toEqual({
      source: 'profile',
      profile: 'work',
      storage: 'keychain',
      ...CALLER,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(await runCli(['auth', 'switch', 'staging'], io)).toBe(1);
  });

  it('refuses a saved profile with a blank key, rather than use KIRORA_API_KEY', async () => {
    for (const profile of [{ apiKey: '' }, { apiKey: '  ' }, { keychain: '' }]) {
      const { io, fetch, output } = await fakeIo(
        () => Response.json({ data: CALLER }),
        KEY,
      );
      await writeConfig(io.env, { profiles: { staging: profile } });

      expect(await runCli(['--profile', 'staging', 'whoami'], io)).toBe(1);
      expect(JSON.parse(output.stderr)).toMatchObject({
        error: { code: 'CONFIG_INVALID' },
      });
      expect(fetch).not.toHaveBeenCalled();
    }
  });

  it('refuses a blank key from the keychain, and still takes KIRORA_API_KEY alone', async () => {
    const { io, fetch, output, keychain } = await fakeIo(
      () => Response.json({ data: CALLER }),
      KEY,
    );
    await writeConfig(io.env, { profiles: { staging: { keychain: 'staging.1' } } });
    keychain.secrets.set('staging.1', '');

    expect(await runCli(['--profile', 'staging', 'whoami'], io)).toBe(1);
    expect(JSON.parse(output.stderr)).toMatchObject({ error: { code: 'KEY_NOT_FOUND' } });
    expect(fetch).not.toHaveBeenCalled();

    expect(await runCli(['whoami'], io)).toBe(0);
    expect(fetch.mock.calls[0]![1]?.headers).toMatchObject({
      authorization: 'Bearer kirora_env',
    });
  });

  const askingToDelete = async () => {
    const { io } = await fakeIo(() => new Response(null, { status: 204 }), KEY);
    const confirm = vi.fn(async (_message: string) => true);
    return { io: { ...io, interactive: true, confirm }, confirm };
  };

  it('names every id, however given, and the workspace when asking to delete', async () => {
    const { io, confirm } = await askingToDelete();
    const named = [
      '--workspace',
      'tenant-b',
      'contacts',
      'installations',
      'delete',
      '--external-installation-id',
      'device-9',
      'contact-42',
    ];
    expect(await runCli(named, io)).toBe(0);
    expect(confirm).toHaveBeenCalledWith(
      "Run kirora contacts installations delete (DELETE /v1/contacts/contact-42/installations/device-9) in workspace tenant-b with KIRORA_API_KEY? It can't be undone.",
    );
  });

  it('refuses a delete without --yes before looking for a key, naming its target', async () => {
    const { io, fetch, output } = await fakeIo(() => undefined);
    const secrets = vi.fn(io.secrets);

    const args = ['lists', 'rm', 'group-1'];
    expect(await runCli(args, { ...io, secrets })).toBe(1);

    // Not NOT_LOGGED_IN: without a login, the answer is still to add --yes.
    expect(JSON.parse(output.stderr).error).toMatchObject({
      code: 'CONFIRMATION_REQUIRED',
      message: expect.stringContaining('(DELETE /v1/lists/group-1)'),
    });
    expect(secrets).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('counts what a batch delete names, without printing it', async () => {
    const { io, confirm } = await askingToDelete();
    const batch = ['suppressions', 'delete', '--emails', 'a@x.io', 'b@x.io'];
    expect(await runCli(batch, io)).toBe(0);
    const [question] = confirm.mock.calls[0]!;
    expect(question).toContain('(POST /v1/suppressions/delete for 2 emails)');
    expect(question).not.toContain('a@x.io');
  });

  it('names the saved profile a delete would use when asking', async () => {
    const { io: saved, fetch } = await fakeIo(() => Response.json({ data: CALLER }));
    const confirm = vi.fn(async (_message: string) => false);
    expect(await runCli(['login', '--profile', 'staging'], saved)).toBe(0);
    const remove = ['--profile', 'staging', 'lists', 'rm', 'group-1'];
    expect(await runCli(remove, { ...saved, interactive: true, confirm })).toBe(1);
    expect(confirm.mock.calls[0]![0]).toContain(
      '(DELETE /v1/lists/group-1) with profile staging',
    );
    // Only the login's own check: nothing was deleted.
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('waits for stdout to take each item before fetching the next page', async () => {
    const page = (n: number) =>
      Response.json({
        data: [{ id: `item-${n}` }],
        meta: { pagination: { limit: 1, nextCursor: n < 3 ? `page-${n + 1}` : null } },
      });
    const { io, fetch, output } = await fakeIo(
      (url) => page(Number(url.searchParams.get('cursor')?.slice(5) ?? 1)),
      KEY,
    );
    const written: string[] = [];
    let drain: () => void = () => {};
    io.stdout = (text) =>
      new Promise((resolve) => {
        written.push(text);
        drain = resolve;
      });

    const listing = runCli(['contacts', 'list', '--paginate'], io);
    await vi.waitFor(() => expect(written, output.stderr).toHaveLength(1));
    // Stdout is full until drain(): no other page is asked for.
    expect(fetch).toHaveBeenCalledOnce();

    for (let n = 2; n <= 3; n++) {
      drain();
      await vi.waitFor(() => expect(written).toHaveLength(n));
    }
    drain();
    expect(await listing).toBe(0);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('cancels a forward still waiting on the handler when listening stops', async () => {
    let forwardSignal: AbortSignal | undefined;
    const { io, output, interrupt } = await fakeIo((url, init) => {
      if (url.host === 'handler.example') {
        forwardSignal = init.signal ?? undefined;
        return hangUntilAborted(init);
      }
      return init.method === 'POST'
        ? webhookCreated('wh-9')
        : new Response(null, { status: 204 });
    }, KEY);
    const listening = runCli(
      [...LISTEN, '--forward-to', 'http://handler.example/hooks'],
      io,
    );
    const port = await listeningPort(output);
    const delivered = deliver(
      port,
      JSON.stringify({ eventType: 'message.delivered', eventId: 'ev-1' }),
    ).catch(() => 'closed');
    await vi.waitFor(() => expect(forwardSignal).toBeDefined());

    interrupt();
    expect(await listening).toBe(0);

    expect(forwardSignal!.aborted).toBe(true);
    // Printed before listen returned, not after.
    expect(JSON.parse(output.stdout)).toMatchObject({
      forwarded: {
        url: 'http://handler.example/hooks',
        error: 'cancelled: listening stopped',
      },
    });
    await delivered;
  });

  it('escapes control characters in names it prints after a login', async () => {
    const caller = {
      workspace: { name: 'Acme\u001b[2J\u009b31m' },
      apiKey: { name: 'CI\u0007\r\nLogged in to Evil' },
    };
    const { io, output } = await fakeIo(() => Response.json({ data: caller }));

    expect(await runCli(['login'], io)).toBe(0);

    // C1 controls too: U+009B is CSI on its own in an 8-bit terminal.
    expect(output.stdout).not.toMatch(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/);
    expect(output.stdout.trimEnd()).not.toContain('\n');
    expect(output.stdout).toContain(
      'Acme\\u001b[2J\\u009b31m with the key "CI\\u0007\\u000d\\u000aLogged',
    );
  });

  // pnpm check:package checks the links in the docs the package ships.
  it('installs as llms.txt says, the same way as the README', () => {
    const read = (path: string) =>
      readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    const install = (text: string) => /^\s*(npm install -g \S+)$/m.exec(text)?.[1];
    expect(install(read('llms.txt'))).toBeDefined();
    expect(install(read('llms.txt'))).toBe(install(read('README.md')));
  });
});

const { sha256 } = JSON.parse(
  readFileSync(new URL('../spec/source.json', import.meta.url), 'utf8'),
) as { sha256: string };
const cachedSpec = new URL(
  `../node_modules/.cache/kirora-openapi/${sha256}.json`,
  import.meta.url,
);

describe.skipIf(!existsSync(cachedSpec))('generated from the pinned spec', () => {
  it('has a command for every operation; run `pnpm codegen` if not', () => {
    const script = fileURLToPath(new URL('../scripts/codegen.mjs', import.meta.url));
    expect(() =>
      execFileSync('node', [script, '--check'], { stdio: 'pipe' }),
    ).not.toThrow();
  });
});
