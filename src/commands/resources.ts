import { randomUUID } from 'node:crypto';
import { openAsBlob } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { RequestOptions } from '@kirora/node';
import { Command, Option } from 'commander';
import { parseNumber } from '../lib/args.js';
import {
  clientFor,
  recordResponses,
  statusAndHeaders,
  workspaceFor,
} from '../lib/client.js';
import { type Credentials, resolveCredentials } from '../lib/config.js';
import type { GlobalFlags, Io } from '../lib/io.js';
import { CliError, json, messageOf } from '../lib/output.js';
import { RESOURCES } from '../operations.js';

type Field = {
  name: string;
  flag: string;
  alias?: string;
  kind: 'string' | 'number' | 'boolean' | 'list' | 'file';
  placeholder?: string;
  description?: string;
  required?: true;
  choices?: string[];
};

type PathParam = { name: string; label: string };

type Operation = {
  action: string;
  operationId: string;
  method: string;
  path: string;
  summary: string;
  details?: string;
  scope?: string;
  pathParams?: PathParam[];
  query: Field[];
  body?: Field[];
  idempotencyKey?: 'required' | 'optional';
  responseType?: string;
  paginate?: true;
  destructive?: true;
  help: string;
};

/**
 * A top-level command for one API resource. Each operation's `action` is its
 * subcommand, or a group and a subcommand separated by a space.
 */
export type Resource = { name: string; description: string; operations: Operation[] };

type OperationCall = Pick<RequestOptions, 'query' | 'body' | 'idempotencyKey'> & {
  method: string;
  path: string;
  paginate: boolean;
  responseType?: string;
};

export const ACTION_ALIASES: Record<string, string> = { list: 'ls', delete: 'rm' };

/** The action a resource or group runs when none is named: `kirora lists` lists. */
export const DEFAULT_ACTION = 'list';

/** Adds a command for every API operation in RESOURCES to `program`. */
export function addResourceCommands(program: Command, io: Io): void {
  for (const resource of RESOURCES) {
    const resourceCommand = program
      .command(resource.name)
      .description(resource.description);
    const groups = new Map<string, Command>();
    for (const operation of resource.operations) {
      const [first, last] = operation.action.split(' ') as [string, string?];
      if (last === undefined) {
        addOperation(resourceCommand, first, operation, io);
        continue;
      }
      if (!groups.has(first)) {
        groups.set(
          first,
          resourceCommand.command(first).description(groupSummary(resource, first)),
        );
      }
      addOperation(groups.get(first)!, last, operation, io);
    }
  }
}

function groupSummary(resource: Resource, group: string): string {
  const operations = resource.operations.filter(({ action }) =>
    action.startsWith(`${group} `),
  );
  return (operations.find(({ action }) => action === `${group} list`) ?? operations[0]!)
    .summary;
}

function addOperation(parent: Command, action: string, operation: Operation, io: Io) {
  const summary = operation.scope
    ? `${operation.summary} (needs ${operation.scope})`
    : operation.summary;
  // The list of a resource's commands shows the summary; the command's own help, more.
  const command = parent
    .command(action, { isDefault: action === DEFAULT_ACTION })
    .summary(summary)
    .description(operation.details ? `${summary}\n\n${operation.details}` : summary);
  if (ACTION_ALIASES[action]) command.alias(ACTION_ALIASES[action]);
  command.addHelpText('after', operation.help);

  const pathParams = operation.pathParams ?? [];
  const idFlags = pathParams.length > 1;
  for (const param of pathParams) {
    command.argument(idFlags ? `[${param.label}]` : `<${param.label}>`);
    if (idFlags) command.option(`--${param.label} <id>`, 'or give it as an argument');
  }

  const queryOptions = operation.query.map((field) =>
    withOption(command, field, field.required === true),
  );
  const bodyOptions = (operation.body ?? []).map((field) => withOption(command, field));
  const multipart = operation.body?.some((field) => field.kind === 'file') ?? false;
  if (operation.body && !multipart) {
    command.option(
      '-d, --data <json|@file|->',
      'the whole body as JSON (inline, a file, or - for stdin); flags set fields on top',
    );
  }
  if (operation.idempotencyKey === 'required') {
    command.requiredOption(
      '--idempotency-key <key>',
      'reuse the same key when you retry',
    );
  } else if (operation.idempotencyKey === 'optional') {
    command.option(
      '--idempotency-key <key>',
      'reuse the same key when you retry; without one, a key is made for this run',
    );
  }
  if (operation.paginate) {
    command.option('--paginate', 'follow every page; prints one item per line');
  }
  if (operation.destructive) {
    command.option(
      '-y, --yes',
      'delete without asking; needed when no one is at a terminal',
    );
  }
  command.option('--dry-run', 'print the request instead of sending it');

  command.action(async (...args: unknown[]) => {
    const values = command.opts<Record<string, unknown>>();
    const flags = command.optsWithGlobals<GlobalFlags>();
    if (values.paginate && flags.include) {
      command.error("error: -i can't be used with --paginate", { exitCode: 2 });
    }
    const ids = pathIds(pathParams, args.slice(0, pathParams.length), values, command);
    const path = operation.path.replace(/\{(\w+)\}/g, (_, name: string) =>
      encodeURIComponent(ids.get(name)!),
    );
    const call: OperationCall = {
      method: operation.method,
      path,
      query: Object.fromEntries(
        queryOptions.map(({ field, key }) => [
          field.name,
          values[key] as string | number,
        ]),
      ),
      body: multipart
        ? await formBody(bodyOptions, values)
        : await jsonBody(bodyOptions, values, command, io.readStdin),
      idempotencyKey:
        (values.idempotencyKey as string | undefined) ??
        (operation.idempotencyKey === 'optional' ? randomUUID() : undefined),
      paginate: values.paginate === true,
      ...(operation.responseType && { responseType: operation.responseType }),
    };
    if (values.dryRun) {
      io.stdout(json({ dryRun: true, request: describeRequest(call) }));
      return;
    }
    if (operation.destructive && !values.yes && !io.interactive) {
      throw new CliError(
        'CONFIRMATION_REQUIRED',
        `${deleteTarget(command, call)} deletes, and can't be undone. Add --yes to go ahead.`,
      );
    }
    const credentials = await resolveCredentials(io, flags.profile);
    if (operation.destructive && !values.yes) {
      const question = `Run ${deleteTarget(command, call)}${keyUsed(credentials, flags)}?`;
      if (!(await io.confirm(`${question} It can't be undone.`))) {
        throw new CliError('CANCELLED', 'Nothing was deleted.');
      }
    }
    await send(call, credentials, flags, io);
  });
}

/**
 * Describes what a delete acts on: the command and the request, with every id in its
 * path however it was given and how much its body names.
 */
function deleteTarget(command: Command, { method, path, body }: OperationCall): string {
  return `kirora ${commandPath(command)} (${method} ${path}${bodySummary(body)})`;
}

/** Names the workspace and key a request will use, for a question about it. */
function keyUsed({ profile, profileName }: Credentials, flags: GlobalFlags): string {
  const workspace = workspaceFor(profile, flags.workspace);
  return (
    (workspace === undefined ? '' : ` in workspace ${workspace}`) +
    (profileName === undefined ? ' with KIRORA_API_KEY' : ` with profile ${profileName}`)
  );
}

/** Counts what a body's lists name (`3 emails`), without printing them. */
function bodySummary(body: unknown): string {
  if (body === undefined || body instanceof FormData) return '';
  if (Array.isArray(body)) return ` for ${body.length} items`;
  const counts =
    typeof body === 'object' && body !== null
      ? Object.entries(body).flatMap(([name, value]) =>
          Array.isArray(value) ? [`${value.length} ${name}`] : [],
        )
      : [];
  return counts.length > 0 ? ` for ${counts.join(', ')}` : ' with a body';
}

function commandPath(command: Command): string {
  const names: string[] = [];
  for (let each: Command | null = command; each?.parent; each = each.parent) {
    names.unshift(each.name());
  }
  return names.join(' ');
}

function describeRequest({
  method,
  path,
  query,
  body,
  idempotencyKey,
  paginate,
}: OperationCall) {
  const sentQuery = Object.fromEntries(
    Object.entries(query ?? {}).filter(([, value]) => value !== undefined),
  );
  return {
    method,
    path,
    ...(Object.keys(sentQuery).length > 0 && { query: sentQuery }),
    ...(body !== undefined && {
      body:
        body instanceof FormData
          ? Object.fromEntries(
              [...body].map(([name, value]) => [
                name,
                typeof value === 'string' ? value : `<file ${value.name}>`,
              ]),
            )
          : body,
    }),
    ...(idempotencyKey && { idempotencyKey }),
    // Every page is fetched, the cursor moved on each time.
    ...(paginate && { paginate: true }),
  };
}

function pathIds(
  params: PathParam[],
  positional: unknown[],
  values: Record<string, unknown>,
  command: Command,
): Map<string, string> {
  const given = positional.filter((value): value is string => value !== undefined);
  const ids = new Map<string, string>();
  for (const param of params) {
    const flagged = values[new Option(`--${param.label}`).attributeName()];
    const id = (flagged as string | undefined) ?? given.shift();
    if (id === undefined) {
      command.error(`error: missing ${param.label}`, { exitCode: 2 });
    }
    ids.set(param.name, id);
  }
  if (given.length > 0) {
    command.error(`error: too many arguments: ${given.join(' ')}`, { exitCode: 2 });
  }
  return ids;
}

async function send(
  operationCall: OperationCall,
  { profile }: Credentials,
  flags: GlobalFlags,
  io: Io,
) {
  const { method, path, query, body, idempotencyKey, paginate, responseType } =
    operationCall;
  const recorder = recordResponses(io.fetch ?? globalThis.fetch);
  const client = await clientFor(profile, flags.workspace, recorder.fetch);

  if (paginate) {
    // Waits while stdout is full, so a slow reader holds back the next page rather
    // than every page piling up in memory.
    for await (const item of client.list(path, { query })) {
      await io.stdout(`${JSON.stringify(item)}\n`);
    }
    return;
  }
  const options = { query, body, idempotencyKey };
  const printHeaders = () => {
    if (flags.include && recorder.last) io.stdout(statusAndHeaders(recorder.last));
  };
  if (!responseType) {
    const response = await client
      .request<unknown>(method, path, options)
      .finally(printHeaders);
    if (response !== undefined) io.stdout(json(response));
    return;
  }
  // A body that isn't JSON, such as a CSV export, goes to stdout as it arrives.
  const response = await client.requestRaw(method, path, options).finally(printHeaders);
  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith(responseType) || !response.body) {
    await response.body?.cancel();
    throw new CliError(
      'INVALID_RESPONSE',
      `Expected ${responseType} from ${method} ${path}, and got ${type || 'no body'}.`,
    );
  }
  try {
    await io.pipeStdout(response.body);
  } catch (error) {
    throw new CliError(
      'DOWNLOAD_FAILED',
      `The download stopped before it was complete: ${messageOf(error)}`,
    );
  }
}

type FieldOption = { field: Field; key: string };

function withOption(command: Command, field: Field, mandatory = false): FieldOption {
  const description = `${field.description ?? ''}${field.required ? ' (required)' : ''}`;
  const placeholder = field.placeholder ? ` ${field.placeholder}` : '';
  const options = [
    new Option(`--${field.flag}${placeholder}`, description),
    ...(field.alias ? [new Option(`--${field.alias}${placeholder}`).hideHelp()] : []),
  ];
  for (const option of options) {
    if (field.kind === 'number') option.argParser(parseNumber);
    if (field.choices) option.choices(field.choices);
    command.addOption(option);
  }
  if (mandatory) options[0]!.makeOptionMandatory();
  if (field.kind === 'boolean') {
    command.addOption(new Option(`--no-${field.flag}`, 'the same, as false'));
  }
  return { field, key: options[0]!.attributeName() };
}

async function jsonBody(
  options: FieldOption[],
  values: Record<string, unknown>,
  command: Command,
  readStdin: () => Promise<string>,
): Promise<unknown> {
  const fields = Object.fromEntries(
    options.flatMap(({ field, key }) =>
      values[key] === undefined ? [] : [[field.name, values[key]]],
    ),
  );
  const data = values.data as string | undefined;
  if (data === undefined) return Object.keys(fields).length > 0 ? fields : undefined;

  const text =
    data === '-'
      ? await readStdin()
      : data.startsWith('@')
        ? await readFile(data.slice(1), 'utf8')
        : data;
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    command.error('The request body must be valid JSON.', { exitCode: 2 });
  }
  if (Object.keys(fields).length === 0) return body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    command.error('Flags set fields on an object; --data is not one.', { exitCode: 2 });
  }
  return { ...body, ...fields };
}

async function formBody(options: FieldOption[], values: Record<string, unknown>) {
  const form = new FormData();
  for (const { field, key } of options) {
    const value = values[key];
    if (value === undefined) continue;
    if (field.kind === 'file') {
      const path = value as string;
      form.append(field.name, await openAsBlob(path), basename(path));
    } else {
      for (const each of Array.isArray(value) ? value : [value]) {
        form.append(field.name, String(each));
      }
    }
  }
  return form;
}
