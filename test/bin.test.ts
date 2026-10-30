import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';
import { describe, expect, it } from 'vitest';
import { deliver, listeningPort, spawnKirora, startApi, tempDir } from './helpers.js';

describe('the kirora process', () => {
  it('deletes the webhook when whatever reads `webhooks listen` stops reading', async () => {
    const requests: string[] = [];
    const api = await startApi((request, response) => {
      requests.push(`${request.method} ${request.url}`);
      if (request.method !== 'POST') return void response.writeHead(204).end();
      response.writeHead(201, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ data: { id: 'wh-9', secret: 'whsec_test' } }));
    });
    const child = spawnKirora(
      ['webhooks', 'listen', '--url', 'https://t.example', '--port', '0'],
      {
        XDG_CONFIG_HOME: await tempDir(),
        KIRORA_API_KEY: 'kirora_test',
        KIRORA_API_URL: api.url,
      },
    );
    const exited = new Promise<number | null>((resolve) => child.once('exit', resolve));
    const output = { stderr: '' };
    child.stderr.on('data', (chunk: Buffer) => (output.stderr += chunk));
    const port = await listeningPort(output);

    const lines = createInterface({ input: child.stdout });
    const firstLine = new Promise<string>((resolve) => lines.once('line', resolve));
    await deliver(port, '{"eventType":"message.delivered","eventId":"ev-1"}');
    expect(JSON.parse(await firstLine)).toMatchObject({ eventId: 'ev-1' });
    lines.close();
    child.stdout.destroy();
    // Printing this delivery hits the closed pipe.
    await deliver(port, '{"eventType":"message.delivered","eventId":"ev-1"}');

    expect(await exited).toBe(0);
    api.close();
    expect(requests).toEqual(['POST /v1/webhooks', 'DELETE /v1/webhooks/wh-9']);
  }, 20_000);

  it('keeps every profile when separate kirora processes log in at once', async () => {
    const api = await startApi((_request, response) => {
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(
        JSON.stringify({ data: { workspace: { name: 'Acme' }, apiKey: { name: 'CI' } } }),
      );
    });
    const home = await tempDir();
    const names = Array.from({ length: 8 }, (_, index) => `p${index}`);

    const codes = await Promise.all(
      names.map((name) => {
        const child = spawnKirora(['login', '--profile', name], {
          XDG_CONFIG_HOME: home,
          KIRORA_API_URL: api.url,
          KIRORA_CREDENTIAL_STORE: 'file',
        });
        child.stdin.end(`kirora_${name}`);
        return new Promise<number | null>((resolve) => child.once('exit', resolve));
      }),
    );
    api.close();

    expect(codes).toEqual(names.map(() => 0));
    const config = JSON.parse(
      await readFile(join(home, 'kirora', 'config.json'), 'utf8'),
    ) as { profiles: Record<string, { apiKey: string }> };
    expect(Object.keys(config.profiles).sort()).toEqual(names);
    expect(config.profiles.p3?.apiKey).toBe('kirora_p3');
  }, 30_000);
});
