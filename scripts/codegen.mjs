/**
 * Generates the CLI's commands (src/operations.ts and .json) and the skill's
 * reference pages from the Kirora OpenAPI spec pinned in spec/source.json. With
 * --check, fails instead if they are out of date. A path argument or
 * KIRORA_OPENAPI_SPEC uses that spec instead of the pinned one.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const specArg = args.find((arg) => arg !== '--check') ?? process.env.KIRORA_OPENAPI_SPEC;
const source = JSON.parse(
  readFileSync(new URL('../spec/source.json', import.meta.url), 'utf8'),
);
const fail = (message) => {
  process.stderr.write(`${message}\n`);
  process.exit(1);
};

const cacheDir = new URL('../node_modules/.cache/kirora-openapi/', import.meta.url);
const cached = new URL(`${source.sha256}.json`, cacheDir);
const hash = (text) => createHash('sha256').update(text).digest('hex');

const cachedText = existsSync(cached) ? readFileSync(cached, 'utf8') : undefined;
let specText;
let downloaded = false;
if (specArg !== undefined) {
  specText = readFileSync(specArg, 'utf8');
} else if (cachedText !== undefined && hash(cachedText) === source.sha256) {
  specText = cachedText;
} else {
  const response = await fetch(source.url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) fail(`Couldn't download ${source.url}: HTTP ${response.status}`);
  specText = await response.text();
  downloaded = true;
}
const spec = JSON.parse(specText);
const sha256 = hash(specText);
if (
  specArg === undefined &&
  (source.sha256 !== sha256 || source.version !== spec.info.version)
) {
  fail(
    `${source.url} doesn't match spec/source.json. Set its version to ${spec.info.version} and its sha256 to ${sha256}.`,
  );
}
if (downloaded) {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cached, specText);
}
const specName = specArg ?? source.url;
const REFERENCES = '../skills/kirora-cli/references/';
const API_REFERENCE = 'https://kirora.io/docs/api/reference/';

// Flags every command has already, which an API field can't take as its own.
const GLOBAL_FLAGS = new Set([
  'data',
  'dry-run',
  'help',
  'idempotency-key',
  'include',
  'paginate',
  'profile',
  'version',
  'workspace',
  'yes',
]);
// Flags or path labels for fields whose own name would clash, by operationId and field.
const FLAG_ALIASES = {
  chooseAbTestWinner: { version: 'ab-version' },
  previewCampaign: { version: 'ab-version' },
  getTemplateVersion: { version: 'template-version' },
  renderTemplate: { version: 'template-version' },
  restoreTemplateVersion: { version: 'template-version' },
};
// Subcommand names for operations whose derived name would clash, by operationId.
const ACTION_ALIASES = {
  deleteContacts: 'delete-many',
};

const deref = (schema) => {
  let resolved = schema;
  while (resolved?.$ref) {
    resolved = resolved.$ref
      .split('/')
      .slice(1)
      .reduce((node, key) => node[key], spec);
  }
  return resolved ?? {};
};

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const isParam = (segment) => segment.startsWith('{');
const singular = (word) => word.replace(/s$/, '');

function stringPlaceholder(name, schema) {
  if (name === 'cursor') return 'cursor';
  if (schema.format === 'uuid' || /Id$/.test(name)) return 'id';
  if (['email', 'date-time', 'date'].includes(schema.format)) return schema.format;
  if (schema.format === 'uri') return 'url';
  return 'value';
}

function fieldKind(name, schema) {
  const resolved = deref(schema);
  if (resolved.type === 'string' && resolved.format === 'binary') {
    return { kind: 'file', placeholder: '<path>' };
  }
  const variants = variantsOf(resolved);
  // Text in every shape, as a date or a date-time is: one text flag takes them all.
  if (variants.length > 0 && variants.every((variant) => variant.type === 'string')) {
    const placeholders = [
      ...new Set(variants.map((variant) => stringPlaceholder(name, variant))),
    ];
    const choices = variants.every((variant) => variant.enum)
      ? [...new Set(variants.flatMap((variant) => variant.enum))].filter(
          (choice) => typeof choice === 'string',
        )
      : undefined;
    return {
      kind: 'string',
      placeholder: `<${placeholders.join('|')}>`,
      ...(choices && { choices }),
    };
  }
  if (variants.length !== 1) return undefined;
  const [variant] = variants;
  if (variant.type === 'integer' || variant.type === 'number') {
    return { kind: 'number', placeholder: '<number>' };
  }
  if (variant.type === 'boolean') return { kind: 'boolean' };
  const items = deref(variant.items);
  if (variant.type === 'array' && items.type === 'string') {
    const each = stringPlaceholder(singular(name), items);
    return { kind: 'list', placeholder: `<${each}s...>` };
  }
  return undefined;
}

function withApiSpelling(each) {
  return /[A-Z]/.test(each.name) && kebab(each.name) === each.flag
    ? { ...each, alias: each.name }
    : each;
}

/** The field's flag, or undefined when its value only fits in `--data`. */
function field(name, schema, description, required) {
  const kind = fieldKind(name, schema);
  if (!kind) return undefined;
  return {
    name,
    flag: kebab(name),
    ...kind,
    ...(description && { description: description.split('\n')[0] }),
    ...(required && { required: true }),
  };
}

/**
 * The shapes a value can take, null left out: each of an `anyOf` or `oneOf`, or each of
 * the types a `type` list names (`["string", "null"]` is a string).
 */
function variantsOf(schema) {
  const resolved = deref(schema);
  const alternatives = resolved.anyOf ?? resolved.oneOf;
  if (alternatives) return alternatives.flatMap(variantsOf);
  if (Array.isArray(resolved.type)) {
    return resolved.type
      .filter((type) => type !== 'null')
      .map((type) => ({ ...resolved, type }));
  }
  return resolved.type === 'null' ? [] : [resolved];
}

/** A value's shape in one line of help: `text`, `"a" | "b"`, `{ to*, email }`, `one of …`. */
function shapeOf(schema) {
  const variants = variantsOf(schema);
  if (variants.length > 1) return `one of ${variants.map(shapeOf).join(' | ')}`;
  const [variant] = variants;
  if (!variant) return 'null';
  if (variant.const !== undefined) return JSON.stringify(variant.const);
  if (variant.enum) {
    return variant.enum
      .filter((choice) => choice !== null)
      .map((choice) => JSON.stringify(choice))
      .join(' | ');
  }
  if (variant.properties) {
    const required = new Set(variant.required ?? []);
    const keys = Object.entries(variant.properties).map(([key, property]) => {
      const name = required.has(key) ? `${key}*` : key;
      // A key with one possible value, such as a union's `type`, says which shape it is.
      const { const: value, enum: choices } = deref(property);
      const only = value ?? (choices?.length === 1 ? choices[0] : undefined);
      return only === undefined ? name : `${name}: ${JSON.stringify(only)}`;
    });
    return `{ ${keys.join(', ')} }`;
  }
  if (variant.type === 'object') return 'object';
  if (variant.type === 'array') return `list of ${shapeOf(variant.items ?? {})}`;
  if (variant.type === 'integer' || variant.type === 'number') return 'number';
  if (variant.type === 'boolean') return 'true/false';
  if (variant.type === 'string') {
    if (variant.format === 'uuid') return 'id';
    if (['email', 'date-time', 'date', 'uri'].includes(variant.format)) {
      return `text (${variant.format})`;
    }
    return 'text';
  }
  return 'any';
}

/** The description's opening paragraph, on one line, without Markdown's bold. */
const firstParagraph = (text) =>
  text
    .split(/\n\s*\n/)[0]
    .replaceAll('**', '')
    .replace(/\s+/g, ' ')
    .trim();

const firstSentence = (text) => text?.split('\n')[0].split(/(?<=\.)\s/)[0];

/** Quoted for a POSIX shell, so an example can be pasted as it is. */
const shellQuote = (text) => `'${text.replaceAll("'", "'\\''")}'`;

/**
 * What `--help` adds after the flags: the body's fields that only `--data` can carry, the
 * spec's examples as commands to paste, and the API reference page. The skill's pages
 * show the same text.
 */
function helpText(resource, operation, apiOperation) {
  const sections = [];
  const content = apiOperation.requestBody
    ? deref(apiOperation.requestBody).content?.['application/json']
    : undefined;
  if (content) {
    const schema = deref(content.schema);
    const flagged = new Set((operation.body ?? []).map((field) => field.name));
    if (schema.properties) {
      const required = new Set(schema.required ?? []);
      const fields = Object.entries(schema.properties).filter(
        ([name]) => !flagged.has(name),
      );
      if (fields.length > 0) {
        const label = (name) => (required.has(name) ? `${name}*` : name);
        const width = Math.max(...fields.map(([name]) => label(name).length));
        sections.push(
          [
            'Body fields only --data can carry (* required):',
            ...fields.flatMap(([name, property]) => {
              const about = firstSentence(deref(property).description);
              return [
                `  ${label(name).padEnd(width)}  ${shapeOf(property)}`,
                ...(about ? [`  ${' '.repeat(width)}  ${about}`] : []),
              ];
            }),
          ].join('\n'),
        );
      }
    } else {
      sections.push(
        [
          'The body (--data) is one of:',
          ...variantsOf(schema).map((variant) => `  ${shapeOf(variant)}`),
        ].join('\n'),
      );
    }
    const examples = Object.values(
      content.examples ??
        (content.example ? { example: { value: content.example } } : {}),
    );
    if (examples.length > 0) {
      const params = operation.pathParams ?? [];
      const ids = params.map(({ label }) => ` <${label}>`).join('');
      const key =
        operation.idempotencyKey === 'required' ? ' --idempotency-key <key>' : '';
      sections.push(
        [
          'Examples:',
          ...examples
            .slice(0, 3)
            .flatMap(({ summary, value }) => [
              ...(summary ? [`  ${summary}:`] : []),
              `    $ kirora ${resource} ${operation.action}${ids} -d ${shellQuote(JSON.stringify(value))}${key}`,
            ]),
        ].join('\n'),
      );
    }
  }
  sections.push(`API reference: ${API_REFERENCE}${operation.operationId}`);
  return `\n${sections.join('\n\n')}\n`;
}

function bodyFields(operation) {
  if (!operation.requestBody) return undefined;
  const [content] = Object.values(deref(operation.requestBody).content);
  const schema = deref(content.schema);
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties ?? {})
    .map(([name, property]) =>
      field(name, property, deref(property).description, required.has(name)),
    )
    .filter(Boolean);
}

function sharedPrefix(paths) {
  const [first, ...rest] = paths.map((path) => path.split('/').slice(2));
  const shared = [];
  for (const [index, segment] of first.entries()) {
    if (isParam(segment) || rest.some((other) => other[index] !== segment)) break;
    shared.push(segment);
  }
  return shared;
}

function groupOf(segments, allSegments) {
  for (const [index, segment] of segments.entries()) {
    if (isParam(segment)) continue;
    const key = segments.slice(0, index + 1);
    const sharing = allSegments.filter((other) =>
      key.every((part, at) => other[at] === part),
    );
    if (sharing.length >= 2) return key;
  }
  return undefined;
}

function actionName(operationId, prefix) {
  const resourceWords = new Set(
    prefix.flatMap((segment) =>
      segment.split('-').flatMap((word) => [word, singular(word)]),
    ),
  );
  const [verb, ...rest] = kebab(operationId).split('-');
  return [verb, ...rest.filter((word) => !resourceWords.has(word))].join('-');
}

function commandWords(operationId, segments, allSegments, prefix) {
  if (ACTION_ALIASES[operationId]) return [ACTION_ALIASES[operationId]];
  const verb = kebab(operationId).split('-')[0];
  const group = groupOf(segments, allSegments);
  if (group) return [group.at(-1), verb];
  const last = segments.at(-1);
  if ((verb === 'get' || verb === 'list') && last !== undefined && !isParam(last)) {
    return [last];
  }
  return [actionName(operationId, prefix)];
}

function pathParamsOf(path, aliases) {
  const segments = path.split('/');
  const params = segments.flatMap((segment, index) =>
    isParam(segment) ? [{ name: segment.slice(1, -1), parent: segments[index - 1] }] : [],
  );
  return params.map(({ name, parent }) => ({
    name,
    label:
      aliases[name] ??
      (params.length > 1 && name === 'id' ? `${singular(parent)}-id` : kebab(name)),
  }));
}

const tagDescription = (name) =>
  firstSentence(spec.tags.find((tag) => tag.name === name)?.description);

const byResource = new Map();
for (const [path, pathItem] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (operation.tags.includes('compat')) continue;
    const resource = path.split('/')[2];
    if (!byResource.has(resource)) byResource.set(resource, []);
    byResource.get(resource).push({ path, method, operation });
  }
}

const problems = [];
const seenOperationIds = new Set();
const output = [...byResource.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, entries]) => {
    const prefix = sharedPrefix(entries.map((entry) => entry.path));
    const segmentsOf = (path) => path.split('/').slice(2 + prefix.length);
    const allSegments = entries.map((entry) => segmentsOf(entry.path));
    const operations = entries.map(({ path, method, operation }) => {
      const parameters = (operation.parameters ?? []).map(deref);
      const query = parameters
        .filter((parameter) => parameter.in === 'query')
        .map((parameter) => {
          const flag = field(
            parameter.name,
            parameter.schema,
            parameter.description,
            parameter.required,
          );
          // A query parameter has no other way in, so each must become a flag.
          if (!flag) {
            problems.push(
              `${operation.operationId}: query parameter ${parameter.name} has no flag`,
            );
          }
          return flag;
        })
        .filter(Boolean)
        .map(withApiSpelling);
      seenOperationIds.add(operation.operationId);
      const aliases = FLAG_ALIASES[operation.operationId] ?? {};
      const body = bodyFields(operation)
        ?.map((each) =>
          aliases[each.name] ? { ...each, flag: aliases[each.name] } : each,
        )
        .map(withApiSpelling);
      const pathParams = pathParamsOf(path, aliases);
      const action = commandWords(
        operation.operationId,
        segmentsOf(path),
        allSegments,
        prefix,
      ).join(' ');
      const fields = [...query, ...(body ?? [])];
      const flags = [
        ...fields.flatMap((each) => [each.flag, ...(each.alias ? [each.alias] : [])]),
        ...(pathParams.length > 1 ? pathParams.map((each) => each.label) : []),
      ];
      flags
        .filter((flag, index) => GLOBAL_FLAGS.has(flag) || flags.indexOf(flag) !== index)
        .forEach((flag) => problems.push(`${name} ${action} --${flag}`));
      const built = {
        action,
        operationId: operation.operationId,
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        ...(operation.description && { details: firstParagraph(operation.description) }),
        ...(operation['x-required-scope'] && { scope: operation['x-required-scope'] }),
        ...(pathParams.length > 0 && { pathParams }),
        query,
        ...(body && { body }),
        ...idempotencyKeyOf(parameters),
        ...responseTypeOf(operation),
        ...(query.some((each) => each.name === 'cursor') && { paginate: true }),
        // Some deletions, such as delete-many, are POSTs.
        ...((method === 'delete' || action.split(' ').at(-1).startsWith('delete')) && {
          destructive: true,
        }),
      };
      return { ...built, help: helpText(name, built, operation) };
    });
    const actions = operations.map((each) => each.action);
    actions
      .filter((action, index) => actions.indexOf(action) !== index)
      .forEach((action) => problems.push(`${name} ${action} names two operations`));
    const groups = new Set(
      actions
        .filter((action) => action.includes(' '))
        .map((action) => action.split(' ')[0]),
    );
    actions
      .filter((action) => groups.has(action))
      .forEach((action) => problems.push(`${name} ${action} is a group and an action`));
    return {
      name,
      description:
        tagDescription(name) ??
        (operations.length === 1
          ? operations[0].summary
          : tagDescription(entries[0].operation.tags[0])),
      operations: operations.sort((left, right) =>
        left.action.localeCompare(right.action),
      ),
    };
  });
for (const [table, entries] of Object.entries({ FLAG_ALIASES, ACTION_ALIASES })) {
  Object.keys(entries)
    .filter((operationId) => !seenOperationIds.has(operationId))
    .forEach((operationId) =>
      problems.push(`${table} names ${operationId}, not in the spec`),
    );
}
if (problems.length > 0) fail(`These commands would clash:\n${problems.join('\n')}`);

const json = `${JSON.stringify(output, null, 2)}\n`;
const outputs = new Map([
  [
    '../src/operations.ts',
    `/** Generated from the published spec by \`pnpm codegen\`. Do not edit. */
import type { Resource } from './commands/resources.js';

export const RESOURCES: Resource[] = ${json.trimEnd()};

/** The webhook event types the API sends. */
export const WEBHOOK_EVENTS = ${JSON.stringify(Object.keys(spec.webhooks))};
`,
  ],
  ['../src/operations.json', json],
  ...output.map((resource) => [
    `${REFERENCES}${resource.name}.md`,
    referencePage(resource),
  ]),
]);
const referencesDir = new URL(REFERENCES, import.meta.url);
const leftover = existsSync(referencesDir)
  ? readdirSync(referencesDir)
      .map((file) => `${REFERENCES}${file}`)
      .filter((path) => !outputs.has(path))
  : [];

if (check) {
  const stale = [...outputs]
    .filter(([path, content]) => {
      const url = new URL(path, import.meta.url);
      return !existsSync(url) || readFileSync(url, 'utf8') !== content;
    })
    .map(([path]) => path)
    .concat(leftover)
    .map((path) => path.replace('../', ''));
  if (stale.length > 0) {
    fail(`Out of date with ${specName}: ${stale.join(', ')}. Run \`pnpm codegen\`.`);
  }
  process.stdout.write('Generated files are up to date\n');
} else {
  mkdirSync(referencesDir, { recursive: true });
  for (const path of leftover) rmSync(new URL(path, import.meta.url));
  for (const [path, content] of outputs) {
    writeFileSync(new URL(path, import.meta.url), content);
  }
  process.stdout.write(
    `Wrote ${output.length} resources and ${output.reduce((count, resource) => count + resource.operations.length, 0)} commands\n`,
  );
}

function referencePage(resource) {
  const lines = [
    `<!-- Generated from the published spec by \`pnpm codegen\`. Do not edit. -->`,
    '',
    `# kirora ${resource.name}`,
    '',
    resource.description,
  ];
  for (const operation of resource.operations) {
    const params = operation.pathParams ?? [];
    const args = params
      .map(({ label }) => (params.length > 1 ? `[${label}]` : `<${label}>`))
      .join(' ');
    lines.push(
      '',
      `## kirora ${resource.name} ${operation.action}${args ? ` ${args}` : ''}`,
    );
    lines.push(
      '',
      `${operation.summary}. \`${operation.method} ${operation.path}\`` +
        (operation.scope ? `, needs \`${operation.scope}\`.` : '.'),
    );
    if (operation.details) lines.push('', operation.details);
    const notes = [];
    if (params.length > 1) {
      notes.push(
        `Each id is an argument, in order, or a flag: ${params.map(({ label }) => `\`--${label}\``).join(', ')}.`,
      );
    }
    if (operation.body && !operation.body.some((field) => field.kind === 'file')) {
      notes.push('`-d, --data` takes the whole JSON body; flags set fields on top.');
    }
    if (operation.idempotencyKey === 'required') {
      notes.push('`--idempotency-key` is required: reuse the same key to retry safely.');
    } else if (operation.idempotencyKey === 'optional') {
      notes.push('`--idempotency-key`: reuse the same key to retry safely.');
    }
    if (operation.destructive) {
      notes.push(
        'Without a terminal it needs `--yes`: only for a deletion the user asked for.',
      );
    }
    if (operation.paginate) {
      notes.push('`--paginate` follows every page and prints one JSON item per line.');
    }
    if (notes.length > 0) lines.push('', ...notes.map((note) => `- ${note}`));
    const fields = [...operation.query, ...(operation.body ?? [])];
    if (fields.length > 0) {
      lines.push('', '| Flag | |', '| --- | --- |');
      for (const field of fields) {
        const flag =
          field.kind === 'boolean'
            ? `\`--${field.flag}\`, \`--no-${field.flag}\``
            : `\`--${field.flag} ${field.placeholder}\``;
        const about = [
          field.required ? '**Required.**' : '',
          (field.description ?? '').replaceAll('|', '\\|'),
          field.choices
            ? `One of ${field.choices.map((choice) => `\`${choice}\``).join(', ')}.`
            : '',
        ]
          .filter(Boolean)
          .join(' ');
        lines.push(`| ${flag} | ${about} |`);
      }
    }
    lines.push('', '```text', operation.help.trim(), '```');
  }
  return `${lines.join('\n')}\n`;
}

function responseTypeOf(operation) {
  const types = Object.entries(operation.responses ?? {})
    .filter(([status]) => status.startsWith('2'))
    .flatMap(([, response]) => Object.keys(deref(response).content ?? {}));
  if (types.length === 0 || types.includes('application/json')) return {};
  return { responseType: types[0] };
}

function idempotencyKeyOf(parameters) {
  const header = parameters.find(
    (parameter) =>
      parameter.in === 'header' && parameter.name.toLowerCase() === 'idempotency-key',
  );
  if (!header) return {};
  return { idempotencyKey: header.required ? 'required' : 'optional' };
}
