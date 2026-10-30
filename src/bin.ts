#!/usr/bin/env node
import { Readable } from 'node:stream';
import { text } from 'node:stream/consumers';
import { pipeline } from 'node:stream/promises';
import { runCli } from './cli.js';
import type { SecretStore } from './lib/secrets.js';

const interruptHandlers = new Set<() => void>();
let stdoutClosed = false;

// When whatever reads stdout goes away (as with `| head`), stop as if on Ctrl+C,
// so a running `webhooks listen` still deletes its webhook.
process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code !== 'EPIPE') throw error;
  if (stdoutClosed) return;
  stdoutClosed = true;
  if (interruptHandlers.size === 0) process.exit(0);
  for (const handler of interruptHandlers) handler();
});

process.exitCode = await runCli(process.argv.slice(2), {
  env: process.env,
  stdout: (output) => {
    if (!stdoutClosed) process.stdout.write(output);
  },
  pipeStdout: (body) => pipeline(Readable.fromWeb(body), process.stdout, { end: false }),
  stderr: (output) => void process.stderr.write(output),
  readStdin: () => text(process.stdin),
  readSecret,
  // Looked for only by commands that need a saved key, and once: finding the
  // keychain can mean running secret-tool.
  secrets: once(async () => {
    const { systemSecretStore } = await import('./lib/secrets.js');
    return systemSecretStore(process.env);
  }),
  interactive: isInteractive(),
  confirm,
  onInterrupt: (handler) => {
    interruptHandlers.add(handler);
    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
    return () => {
      interruptHandlers.delete(handler);
      process.off('SIGINT', handler);
      process.off('SIGTERM', handler);
    };
  },
});

function once(find: () => Promise<SecretStore | undefined>) {
  let found: Promise<SecretStore | undefined> | undefined;
  return () => (found ??= find());
}

function isInteractive(): boolean {
  if (!process.stdin.isTTY || !process.stderr.isTTY) return false;
  const ci = process.env.CI;
  return !(ci && ci !== 'false' && ci !== '0') && process.env.TERM !== 'dumb';
}

async function confirm(message: string): Promise<boolean> {
  // Prompts load only when shown, and draw on stderr so stdout stays the command's output.
  const { default: ask } = await import('@inquirer/confirm');
  return ask({ message, default: false }, { output: process.stderr });
}

async function readSecret(message: string): Promise<string> {
  if (!process.stdin.isTTY) return text(process.stdin);
  const { default: password } = await import('@inquirer/password');
  return password({ message, mask: true }, { output: process.stderr });
}
