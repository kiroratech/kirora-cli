# Kirora CLI

Manage contacts, send messages, and test Kirora webhooks from your terminal.

> Development preview. The CLI is not published to npm yet. Build it locally using
> the steps below.

[Quick start](#quick-start) · [Examples](#examples) ·
[Authentication](#authentication) · [Development](#development)

## Build locally

Requires Node.js 22.13 or later and pnpm. Check out
[`node-sdk`](https://github.com/kiroratech/node-sdk) alongside this repository,
then run these commands from the CLI checkout:

```sh
(cd ../node-sdk && pnpm install && pnpm build)
pnpm install
pnpm build
node dist/bin.js --version
```

In the examples below, replace `kirora` with `node dist/bin.js` from this checkout.

## Quick start

Log in with your workspace's API key. The prompt hides your input and validates
the key before saving it. Check the workspace and credentials with `whoami`:

```sh
kirora login
kirora whoami
kirora lists list --limit 5
```

Listing needs `lists:read` access. To preview a change:

```sh
kirora lists create --name VIPs --dry-run
```

`--dry-run` prints the request without sending it or requiring a login. Remove
it to create the list. Run `kirora doctor` if setup fails.

## Examples

### Work with contacts

Preview creating or updating a contact using your application's customer ID:

```sh
kirora contacts identify --external-id cust_1042 --email ada@example.com --dry-run
```

Replace the example values and remove `--dry-run` to apply the change.
To print every contact's email address, use `--paginate` with `jq`:

```sh
kirora contacts list --paginate | jq -r .email
```

### Send a transactional email

Use a configured template and a key with `transactional:send` access. Replace the
recipient and template name:

```sh
kirora transactional send --idempotency-key order-1001 --dry-run -d '{
  "to": { "email": "recipient@example.com" },
  "email": { "template": "order-receipt" },
  "data": { "order_id": "1001" }
}'
```

Remove `--dry-run` to send. Reuse the same idempotency key when retrying this
request. Use a new key for a different message.

Transactional sends ignore marketing preferences. Use them for receipts, password
resets, and similar messages. Agent keys cannot use this action.

### Test a local webhook handler

Start your handler at `http://localhost:3000/webhooks`.
In **Terminal 1**, open a tunnel to the CLI's listener port:

```sh
ngrok http 4318
```

In **Terminal 2**, replace the public URL with your tunnel's HTTPS URL:

```sh
kirora webhooks listen \
  --url https://example.ngrok.app \
  --forward-to localhost:3000/webhooks
```

The listener creates a temporary subscription, verifies deliveries, and forwards
only verified requests. Deliveries print as JSON lines on stdout. The signing
secret prints on stderr; give it to your handler to verify forwarded requests.
Kirora receives your handler's response status.

Press Ctrl+C to stop and delete the subscription. If cleanup fails, the CLI prints
a command to delete it manually. Use `--events` to select event types.

## Commands and input

Use help to find commands, flags, required scopes, and request examples:

```sh
kirora --help
kirora contacts --help
kirora contacts identify --help
```

The [resource references](skills/kirora-cli/references/) cover every command.
`kirora commands` prints the command tree as JSON.

- `kirora lists` runs `kirora lists list`. `ls` and `rm` alias `list` and `delete`.
- Path IDs are arguments. Commands with multiple IDs also accept named flags,
  such as `--contact-id` and `--topic-id`.
- Simple fields are flags: `--external-id`, `--sensitive`, or `--no-sensitive`.
- Nested fields use `-d` / `--data`: inline JSON, `@file.json`, or `-` for stdin.
  Field flags override matching JSON fields.
- Put IDs before list-valued flags: `--tags a b` consumes values until the next flag.
- Uploads take a file path: `kirora assets upload --file logo.png`.

### Shell completion

Add one of these lines to your shell configuration:

```sh
# ~/.bashrc
source <(kirora completion bash)

# ~/.zshrc, after compinit
source <(kirora completion zsh)
```

For fish:

```fish
kirora completion fish > ~/.config/fish/completions/kirora.fish
```

## Authentication

Credentials are selected in this order:

1. The profile named by `--profile` (`-p`) or `KIRORA_PROFILE`.
2. `KIRORA_API_KEY`, with optional `KIRORA_API_URL` and `KIRORA_WORKSPACE`.
3. The active saved profile.

Your first login becomes active. Save and switch profiles with:

```sh
kirora login --profile staging
kirora auth list
kirora auth switch staging
```

`--profile <name>` selects a profile for one command. `auth rename <name> <new-name>`
renames it; `logout` removes the selected login and attempts to delete its key.
The CLI reports failed keychain cleanup and retries at the next login or logout.

Keys are stored in macOS Keychain or Linux Secret Service when available.
Otherwise, including on Windows, they are saved as plaintext in the config file.
Use `--insecure-storage` or `KIRORA_CREDENTIAL_STORE=file` to select file storage.

Profile settings live in `$XDG_CONFIG_HOME/kirora/config.json`, defaulting to
`~/.config/kirora/config.json`. On Unix systems, the file has owner-only permissions.

For a partner key, `--workspace <externalId>` selects a tenant. At login,
`--base-url` and `--workspace` save a host and tenant with the profile.
Their environment-variable equivalents also work.

## Scripts and output

In CI, provide `KIRORA_API_KEY` through your secret store instead of logging in.
For commands that accept `--idempotency-key`, reuse it when retrying the same
request. Some commands require a key; others generate a new one per invocation.

Deletes require confirmation at an interactive terminal. In scripts and CI,
add `--yes` to confirm the deletion or receive `CONFIRMATION_REQUIRED`.

Responses go to stdout as JSON, or streamed CSV for `messages exports download`.
`--paginate` prints one JSON item per line; without it, lists return one page.
Command failures print `{ "error": { "code", "message", … } }` on stderr.
Diagnostics and warnings also use stderr.

| Exit code | Meaning                                    |
| --------- | ------------------------------------------ |
| `0`       | Success.                                   |
| `1`       | The request or command failed.             |
| `2`       | Invalid command line. No request was sent. |

Lists and downloads can produce partial output before failing, so check the exit
code. `-i` adds HTTP status and headers to stdout and cannot be used with
`--paginate`. See the [error codes](skills/kirora-cli/SKILL.md#error-codes) for details.

## AI agents

After building locally, give your agent this prompt:

```text
Read llms.txt and help me set up the Kirora CLI using this checkout's local build.
Let me enter my API key directly in the login prompt.
```

[`llms.txt`](llms.txt) covers setup. The [CLI skill](skills/kirora-cli/SKILL.md)
covers commands, retries, errors, and deletion rules.

## Development

Commands are generated from OpenAPI and use the Node.js SDK for API requests.
The SDK is linked from `../node-sdk` until publication.

```sh
node --import tsx src/bin.ts --help    # run from source
pnpm test
pnpm build
pnpm codegen
pnpm codegen:check
```

[`spec/source.json`](spec/source.json) pins the OpenAPI commit, version, and
checksum; update them together. To use a local spec, run
`pnpm codegen path/to/openapi.json` or set `KIRORA_OPENAPI_SPEC`.

For read-only checks against a staging workspace, set `KIRORA_SMOKE_API_KEY` and
optionally `KIRORA_SMOKE_API_URL`, then run `pnpm smoke`. Add `--verbose` to see
each command's output. The smoke test uses a temporary config directory.

[CI](.github/workflows/ci.yml) checks formatting, types, generated files, the build,
and tests on Linux, macOS, and Windows with Node.js 22 and 24.
[Skill evaluations](skill-evals/kirora-cli/evals.json) check agent behavior.

## Troubleshooting

Use `kirora whoami` to check the selected workspace and credentials.
Run `kirora doctor` to check setup and API access. When reporting a problem,
include the CLI version, command, error code, and request ID if available.
Remove API keys and personal data from the report.

## License

[MIT](LICENSE)
