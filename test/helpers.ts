import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { createServer, request, type RequestListener } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, vi } from 'vitest';
import { runCli } from '../src/cli.js';
import type { Io } from '../src/lib/io.js';
import type { SecretStore } from '../src/lib/secrets.js';

function webhookHeaders(body: string, secret: string): Record<string, string> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  return {
    'x-webhook-event': 'message.delivered',
    'x-webhook-event-id': 'ev-1',
    'x-webhook-timestamp': timestamp,
    'x-webhook-signature': `sha256=${signature}`,
  };
}

export async function deliver(port: string, body: string, secret = 'whsec_test') {
  const response = await fetch(`http://localhost:${port}/`, {
    method: 'POST',
    body,
    headers: webhookHeaders(body, secret),
  });
  return response.status;
}

export function deliverTooLarge(port: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const delivery = request(`http://localhost:${port}/`, {
      method: 'POST',
      headers: { ...webhookHeaders('', 'whsec_test'), 'content-length': 2 * 1024 * 1024 },
    });
    delivery.once('response', (response) => {
      resolve(response.statusCode!);
      delivery.destroy();
    });
    delivery.once('error', reject);
    // Declares 2 MiB but sends 1 KiB, so the reply must come before the body ends.
    delivery.write('x'.repeat(1024));
  });
}

export async function startApi(handler: RequestListener) {
  const server = createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    close: () => server.close(),
  };
}

export function spawnKirora(args: string[], env: Record<string, string>) {
  const bin = fileURLToPath(new URL('../src/bin.ts', import.meta.url));
  return spawn(process.execPath, ['--import', 'tsx', bin, ...args], {
    env: { ...process.env, ...env },
  });
}

/** Answers a request the CLI makes; undefined for one the test doesn't expect. */
type Route = (url: URL, init: RequestInit) => Response | Promise<Response> | undefined;

/** A keychain in memory, holding `secrets` by account. */
function memoryKeychain(): SecretStore & { secrets: Map<string, string> } {
  const secrets = new Map<string, string>();
  return {
    name: 'test keychain',
    secrets,
    get: async (account) => secrets.get(account),
    set: async (account, secret) => void secrets.set(account, secret),
    delete: async (account) => void secrets.delete(account),
  };
}

/**
 * An `Io` with its own config folder and an in-memory keychain, whose requests `route`
 * answers. `printed` runs a command that should succeed and returns its JSON;
 * `interrupt` presses Ctrl+C for the command holding it.
 */
export async function fakeIo(route: Route, env: Io['env'] = {}) {
  const fetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const response = await route(new URL(String(input)), init ?? {});
    if (!response) throw new Error(`Unexpected request to ${String(input)}`);
    return response;
  });
  const output = { stdout: '', stderr: '' };
  const keychain = memoryKeychain();
  let onInterrupt = () => {};
  const io: Io = {
    env: { XDG_CONFIG_HOME: await tempDir(), ...env },
    fetch: fetch as unknown as typeof globalThis.fetch,
    stdout: (text) => (output.stdout += text),
    stderr: (text) => (output.stderr += text),
    pipeStdout: async (body) => {
      output.stdout += await new Response(body).text();
    },
    readStdin: async () => '{"name":"VIPs"}',
    readSecret: async () => 'kirora_saved\n',
    secrets: async () => keychain,
    interactive: false,
    confirm: async () => false,
    onInterrupt: (handler) => {
      onInterrupt = handler;
      return () => (onInterrupt = () => {});
    },
  };
  const printed = async <T = unknown>(args: string[]): Promise<T> => {
    output.stdout = '';
    expect(await runCli(args, io)).toBe(0);
    return JSON.parse(output.stdout) as T;
  };
  return { io, fetch, output, keychain, interrupt: () => onInterrupt(), printed };
}

/** A request that never answers, until its signal aborts it. */
export function hangUntilAborted(init: RequestInit): Promise<Response> {
  return new Promise((_, reject) => {
    if (init.signal?.aborted) return reject(init.signal.reason);
    init.signal?.addEventListener('abort', () => reject(init.signal!.reason));
  });
}

/** The local port `webhooks listen` says it's listening on, once it does. */
export async function listeningPort(output: { stderr: string }): Promise<string> {
  await vi.waitFor(() => expect(output.stderr).toContain('Listening'));
  return /localhost:(\d+)/.exec(output.stderr)![1]!;
}

/** A new empty folder, for a config or a file to upload. */
export const tempDir = () => mkdtemp(join(tmpdir(), 'kirora-test-'));

/** The API's answer to creating webhook `id`, signed with `whsec_test`. */
export const webhookCreated = (id: string) =>
  Response.json({ data: { id, secret: 'whsec_test' } }, { status: 201 });
