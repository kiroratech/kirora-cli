import { once } from 'node:events';
import type { KiroraClient } from '@kirora/node';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { type Command, InvalidArgumentError } from 'commander';
import { parseNumber } from '../lib/args.js';
import { clientFor } from '../lib/client.js';
import { resolveCredentials } from '../lib/config.js';
import type { GlobalFlags, Io } from '../lib/io.js';
import { CliError, isApiError, messageOf } from '../lib/output.js';
import { RESOURCES, WEBHOOK_EVENTS } from '../operations.js';

type ListenFlags = GlobalFlags & {
  url: string;
  events: string[];
  forwardTo?: string;
  port: number;
};

const DEFAULT_PORT = 4318;
const FORWARD_TIMEOUT_MS = 30_000;
// --url makes the server reachable from the internet, so a delivery must be small and
// arrive quickly.
const MAX_BODY_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Adds `webhooks listen` to the `webhooks` command, so it must run after
 * addResourceCommands. Throws when there is no `webhooks` command, or it already has a
 * `listen`.
 */
export function addWebhooksListen(program: Command, io: Io): void {
  const webhooks = program.commands.find((command) => command.name() === 'webhooks');
  if (!webhooks) throw new Error('There is no webhooks command to add listen to.');
  if (webhooks.commands.some((command) => command.name() === 'listen')) {
    throw new Error('The API now has a webhooks listen of its own.');
  }
  const paths: Paths = {
    create: pathOf('createWebhook'),
    delete: pathOf('deleteWebhook'),
    list: pathOf('listWebhooks'),
  };
  webhooks
    .command('listen')
    .description(
      'receive webhooks here while it runs: it subscribes --url, prints each delivery as a JSON line and unsubscribes on Ctrl+C',
    )
    .requiredOption(
      '--url <url>',
      `a public HTTPS URL that reaches --port here, such as a tunnel's (ngrok http ${DEFAULT_PORT})`,
    )
    .option(
      '--events <events...>',
      `the event types to receive (${WEBHOOK_EVENTS.join(', ')}); every one by default`,
      ['*'],
    )
    .option(
      '--forward-to <url>',
      'also post each delivery, headers and all, to your own handler, and answer with its status',
    )
    .option('--port <number>', 'the local port to listen on', parsePort, DEFAULT_PORT)
    .addHelpText(
      'after',
      `
Examples:
  ngrok http ${DEFAULT_PORT}
  kirora webhooks listen --url https://example.ngrok.app
  kirora webhooks listen --url https://example.ngrok.app --events message.delivered message.bounced
  kirora webhooks listen --url https://example.ngrok.app --forward-to localhost:3000/webhooks
`,
    )
    .action((_options: unknown, self: Command) =>
      listen(self.optsWithGlobals<ListenFlags>(), paths, io),
    );
}

function pathOf(operationId: string): string {
  for (const { operations } of RESOURCES) {
    const found = operations.find((operation) => operation.operationId === operationId);
    if (found) return found.path;
  }
  throw new Error(`The spec has no ${operationId} for webhooks listen.`);
}

async function listen(flags: ListenFlags, paths: Paths, io: Io) {
  // Loaded only when listening, to keep other commands quick to start.
  const { createServer } = await import('node:http');
  const { readWebhookHeaders, verifyWebhook } = await import('@kirora/node');
  const { profile } = await resolveCredentials(io, flags.profile);
  const client = await clientFor(profile, flags.workspace, io.fetch);
  const forwardTo = flags.forwardTo && withScheme(flags.forwardTo);
  let secret = '';

  const server = createServer((request, response) => {
    receive(request, response).catch(() => {
      if (!response.headersSent) response.writeHead(500).end();
    });
  });
  server.requestTimeout = REQUEST_TIMEOUT_MS;
  server.headersTimeout = REQUEST_TIMEOUT_MS;
  async function receive(request: IncomingMessage, response: ServerResponse) {
    if (request.method !== 'POST') return void response.writeHead(405).end();
    const unsigned = () => void response.writeHead(401).end('Not signed by this webhook');
    const headers = readWebhookHeaders(request.headers);
    if (!secret || !headers) return unsigned();
    const rawBody = await readBody(request, MAX_BODY_BYTES);
    if (rawBody === undefined) {
      return void response
        // The rest of the body is never read, so the connection can't be reused.
        .writeHead(413, { connection: 'close' })
        .end(() => request.destroy());
    }
    // The signature covers the body, not the event headers, so those are checked against
    // the body too: a replay can't relabel a delivery.
    const verified = verifyWebhook(secret, rawBody, request.headers);
    if (!verified) return unsigned();
    const forwarded = forwardTo
      ? await forward(io.fetch ?? globalThis.fetch, forwardTo, rawBody, request.headers)
      : undefined;
    io.stdout(
      `${JSON.stringify({
        receivedAt: new Date().toISOString(),
        event: verified.headers.event,
        eventId: verified.headers.eventId,
        attempt: verified.headers.attempt,
        payload: verified.payload,
        ...(forwarded && { forwarded }),
      })}\n`,
    );
    response.writeHead(forwarded ? (forwarded.status ?? 502) : 200).end();
  }

  // The first Ctrl+C stops listening and deletes the webhook. A second stops waiting for
  // a request that hangs, cancelling it, and says what may be left subscribed.
  const stop = new AbortController();
  const giveUp = new AbortController();
  const release = io.onInterrupt(() => (stop.signal.aborted ? giveUp : stop).abort());
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', (error: NodeJS.ErrnoException) =>
        reject(
          new CliError(
            'PORT_UNAVAILABLE',
            `Can't listen on port ${flags.port}: ${error.code ?? error.message}. Try another --port.`,
          ),
        ),
      );
      server.listen(flags.port, resolve);
    });
    if (stop.signal.aborted) return;
    const webhook = await subscribe(client, flags, paths, giveUp.signal);
    secret = webhook.secret;
    try {
      if (!stop.signal.aborted) {
        const { port } = server.address() as AddressInfo;
        io.stderr(
          `Listening on localhost:${port} for ${flags.url} (webhook ${webhook.id}). ` +
            'Ctrl+C stops, and deletes the webhook.\n',
        );
        if (forwardTo) {
          io.stderr(
            `Deliveries are signed with ${webhook.secret}: give it to your handler as its webhook secret while this runs.\n`,
          );
        }
        await once(stop.signal, 'abort');
      }
    } finally {
      await unsubscribe(client, webhook.id, flags.url, paths.delete, giveUp.signal);
      io.stderr(`Deleted webhook ${webhook.id}.\n`);
    }
  } finally {
    release();
    server.close();
    server.closeAllConnections();
  }
}

/** The API paths listen calls, from the generated commands. */
type Paths = Record<'create' | 'delete' | 'list', string>;

/** Creates the webhook; an address already subscribed is named, with how to free it. */
async function subscribe(
  client: KiroraClient,
  flags: ListenFlags,
  paths: Paths,
  signal: AbortSignal,
): Promise<{ id: string; secret: string }> {
  try {
    const { data } = await client.request<{ data: { id: string; secret: string } }>(
      'POST',
      paths.create,
      { body: { url: flags.url, events: flags.events }, signal },
    );
    return data;
  } catch (error) {
    if (signal.aborted) throw stoppedWhileSubscribing(flags.url);
    if (isApiError(error) && error.code === 'ALREADY_EXISTS') {
      // Naming the webhook in the way is a courtesy: if the lookup fails, say so without
      // it, unless Ctrl+C stopped it, which is an interruption like any other.
      const existing = await webhookFor(client, flags.url, paths.list, signal).catch(
        () => {
          if (signal.aborted) throw stoppedWhileSubscribing(flags.url);
          return undefined;
        },
      );
      throw new CliError(
        'ALREADY_SUBSCRIBED',
        existing
          ? `${flags.url} already has webhook ${existing}, perhaps left by an earlier listen. If nothing else uses it, delete it with: kirora webhooks delete ${existing} --yes`
          : `${flags.url} already has a webhook, perhaps left by an earlier listen; kirora webhooks list shows it.`,
      );
    }
    throw error;
  }
}

async function webhookFor(
  client: KiroraClient,
  url: string,
  path: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  for await (const webhook of client.list(path, { signal })) {
    const { id, url: subscribed } = webhook as { id: string; url: string };
    if (subscribed === url) return id;
  }
  return undefined;
}

function stoppedWhileSubscribing(url: string): CliError {
  return new CliError(
    'INTERRUPTED',
    `Stopped while subscribing ${url}. If a webhook was made, kirora webhooks list shows it.`,
  );
}

/** Deletes the webhook, or fails saying it's still subscribed and how to delete it. */
async function unsubscribe(
  client: KiroraClient,
  id: string,
  url: string,
  path: string,
  signal: AbortSignal,
) {
  try {
    await client.request('DELETE', path.replace('{id}', encodeURIComponent(id)), {
      signal,
    });
  } catch (error) {
    const why = signal.aborted ? 'stopped before it was deleted' : messageOf(error);
    throw new CliError(
      'WEBHOOK_NOT_DELETED',
      `Webhook ${id} for ${url} is still subscribed (${why}). Delete it with: kirora webhooks delete ${id} --yes`,
    );
  }
}

function readBody(request: IncomingMessage, limit: number): Promise<string | undefined> {
  if (Number(request.headers['content-length']) > limit)
    return Promise.resolve(undefined);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const onData = (chunk: Buffer) => {
      size += chunk.length;
      if (size <= limit) return void chunks.push(chunk);
      request.off('data', onData).pause();
      resolve(undefined);
    };
    request.on('data', onData);
    request.once('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.once('error', reject);
  });
}

function withScheme(url: string): string {
  return /^https?:\/\//.test(url) ? url : `http://${url}`;
}

async function forward(
  fetch: typeof globalThis.fetch,
  url: string,
  rawBody: string,
  headers: IncomingMessage['headers'],
): Promise<{ url: string; status?: number; error?: string }> {
  const passed = Object.entries(headers).flatMap(([name, value]) =>
    name.startsWith('x-webhook-') && typeof value === 'string' ? [[name, value]] : [],
  );
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: [['content-type', 'application/json'], ...passed] as [string, string][],
      body: rawBody,
      // The handler's own answer: a redirect (to a login page, say) is its failure, not
      // the page it points to.
      redirect: 'manual',
      signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
    });
    await response.body?.cancel();
    return { url, status: response.status };
  } catch (error) {
    return { url, error: messageOf(error) };
  }
}

function parsePort(value: string): number {
  const port = parseNumber(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new InvalidArgumentError('Not a port.');
  }
  return port;
}
