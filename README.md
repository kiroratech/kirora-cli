# Kirora CLI

Manage contacts, send messages, and test Kirora webhooks from your terminal.
Use the CLI for local development, shell scripts, and CI.

[Quick start](#quick-start) · [Examples](#examples) ·
[Authentication](#authentication) · [Usage guide](docs/usage.md) ·
[API reference](https://kirora.io/docs/api/reference)

- Preview API requests with `--dry-run` before sending them.
- Read JSON responses, paginate results, and stream CSV exports into scripts.
- Use saved profiles locally or environment credentials in CI.
- Forward verified webhooks to a local handler while developing.

## Installation

Requires **Node.js 22.13 or later**.

```sh
npm install -g @kirora/cli
kirora --version
```

Shell examples use Bash or zsh unless noted. To work on the CLI itself, see
[building from source](#build-locally).

## Quick start

First, preview a request without an API key or login:

```sh
kirora lists create --name VIPs --dry-run
```

The JSON output includes `"dryRun": true`, method `POST`, and path `/v1/lists`.
Nothing is sent. A preview assembles the request locally; server validation happens
when you send it.

To make your first API call, create a workspace API key in the Kirora dashboard,
then log in. Enter the key in the masked prompt:

```sh
kirora login
kirora whoami
kirora lists list --limit 5
```

`whoami` shows the selected workspace, key details, and credential source.
The list command returns one page as JSON and needs `lists:read` access. An empty
`data` array is a successful response when the workspace has no lists.

Use a key with `lists:write` access and remove `--dry-run` from the first command
when you intend to create the list. Run `kirora doctor` if setup fails.

## Examples

### Work with contacts

Preview creating or updating a contact using your application's customer ID:

```sh
kirora contacts identify \
  --external-id cust_1042 --email ada@example.com --dry-run
```

Replace the test values and remove `--dry-run` to apply the change. Check a command's
`--help` for its required scope.

To print every contact's email address, install `jq` and run this in Bash or zsh:

```sh
set -o pipefail
kirora contacts list --paginate | jq -r '.email'
```

`--paginate` prints one item per line. `pipefail` makes the pipeline fail if the CLI
fails; some items may already have been printed.

### Send a transactional email

Complete your workspace's sending setup, configure an email template, and use a key
with `transactional:send` access. Replace the recipient with an address you control
and `order-receipt` with your template's alias or ID:

```sh
kirora transactional send --idempotency-key receipt-order-1001 --dry-run -d '{
  "to": { "email": "recipient@example.com" },
  "email": { "template": "order-receipt" },
  "data": { "order_id": "1001" }
}'
```

Remove `--dry-run` to send. Reuse the same idempotency key for the same operation and
request body; use a new key for a different message. New invocations with automatically
generated keys do not deduplicate your retries.

Transactional sends ignore marketing preferences but respect suppressions. Use them
for receipts, password resets, and similar messages. Agent keys cannot send them.

### Test a local webhook handler

Start your handler at `http://localhost:3000/webhooks`. In **Terminal 1**, use a
separately installed tunnel tool, such as ngrok, to reach the CLI listener:

```sh
ngrok http 4318
```

In **Terminal 2**, replace the public URL with your tunnel's HTTPS URL. Use a key
with `webhooks:write` access:

```sh
kirora webhooks listen \
  --url https://example.ngrok.app \
  --forward-to localhost:3000/webhooks
```

The CLI creates a temporary subscription, verifies deliveries, and forwards verified
requests to your handler. Deliveries print as JSON lines on stdout; the signing secret
prints on stderr. Configure your handler with that secret to verify the raw forwarded
body. Kirora receives your handler's response status.

Ctrl+C stops the listener and attempts to delete the subscription. If cleanup fails,
use the manual deletion command printed on stderr. See [webhook development](docs/usage.md#webhook-development)
for event filters, ports, size limits, and cleanup behavior.

## Commands and input

Use help to find commands, flags, required scopes, body fields, and examples:

```sh
kirora --help
kirora contacts --help
kirora contacts identify --help
```

| Task                              | Where to start                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Manage contacts and lists         | [Contacts](skills/kirora-cli/references/contacts.md), [lists](skills/kirora-cli/references/lists.md)           |
| Prepare and send campaigns        | [Campaigns](skills/kirora-cli/references/campaigns.md), [templates](skills/kirora-cli/references/templates.md) |
| Track events and inspect delivery | [Events](skills/kirora-cli/references/events.md), [messages](skills/kirora-cli/references/messages.md)         |
| Inspect sending performance       | [Reports](skills/kirora-cli/references/reports.md)                                                             |
| Manage partner tenants            | [Workspaces](skills/kirora-cli/references/workspaces.md)                                                       |

`kirora commands` prints the command tree as JSON. The
[resource references](skills/kirora-cli/references/) cover the generated API commands.

- A resource defaults to listing: `kirora lists` runs `lists list`.
  `ls` and `rm` alias `list` and `delete`.
- Path IDs are arguments. Commands with multiple IDs also accept named flags.
- Simple fields use flags; nested fields use `-d` / `--data` with inline JSON,
  `@file.json`, or `-` for stdin. Field flags override matching JSON fields.
- Put IDs before list-valued flags such as `--tags a b`.

See [JSON input and uploads](docs/usage.md#json-input) for complete examples.

### Shell completion

Generate completion scripts with `kirora completion <shell>`. For Bash, add
`source <(kirora completion bash)` to `~/.bashrc`. For zsh, add
`source <(kirora completion zsh)` to `~/.zshrc` after `compinit`.
For fish, write `kirora completion fish` to
`~/.config/fish/completions/kirora.fish`.

For source checkouts, see [local-build completion setup](docs/usage.md#shell-completion).

## Authentication

Credentials are selected in this order:

1. The profile named by `--profile` (`-p`) or `KIRORA_PROFILE`.
2. `KIRORA_API_KEY`, with optional `KIRORA_API_URL` and `KIRORA_WORKSPACE`.
3. The active saved profile.

An explicitly selected profile takes precedence over an environment key and must
exist. Run `whoami` to check what a command will use.

Your first login becomes active. Save another profile, then switch to it:

```sh
kirora --profile staging login
kirora auth list
kirora auth switch staging
```

Keys use macOS Keychain or Linux Secret Service when available. Otherwise, including
on Windows, they are stored as plaintext in the config file. Profile settings live in
`$XDG_CONFIG_HOME/kirora/config.json`, defaulting to `~/.config/kirora/config.json`.
On Unix systems, the file has owner-only permissions.

See [credential storage](docs/usage.md#profiles-and-credential-storage) for file-storage
options, renaming profiles, and logout. Partner keys can use `--workspace <externalId>`
to select a tenant; see [partner workspaces](docs/usage.md#partner-workspaces).

## Scripts and output

In CI, supply `KIRORA_API_KEY` through your pipeline's secret store and skip login.
Avoid selecting a saved profile with `--profile` or `KIRORA_PROFILE` when you intend
to use that environment key.

API commands write JSON responses to stdout, or stream CSV for `messages exports download`.
Lists return one page unless you pass `--paginate`, which prints one JSON item per line.
Local commands such as `login` and `logout` print status text instead.

Failures print a JSON `error` object with `code` and `message` on stderr. Diagnostics
and warnings also use stderr. Lists and downloads can produce partial output before
failing, so check the exit code.

| Exit code | Meaning                                        |
| --------- | ---------------------------------------------- |
| `0`       | Success.                                       |
| `1`       | The request or command failed.                 |
| `2`       | Invalid command line. No API request was sent. |

Deletes require confirmation in an interactive terminal. In scripts and CI, add
`--yes` to confirm deletion or receive `CONFIRMATION_REQUIRED`.
For commands accepting `--idempotency-key`, keep the key stable across retries of the
same request; some commands require it and others generate a new key per invocation.

`-i` / `--include` adds HTTP status and headers to stdout, so the output is no longer
JSON-only. It cannot be combined with `--paginate`. See the
[error codes](skills/kirora-cli/SKILL.md#error-codes) for details.

## AI agents

The [CLI skill](skills/kirora-cli/SKILL.md) describes commands, retry keys, errors,
and deletion rules. Use `commands` for JSON discovery and `--help` for command-specific
requirements. See [agent setup](docs/usage.md#ai-agents).

## Development

### Build locally

Requires pnpm 8.6.0, the version declared in `package.json`. From the CLI checkout:

```sh
pnpm install --frozen-lockfile
pnpm build
node dist/bin.js --version
```

Use `node dist/bin.js` instead of `kirora` to run your local build. Rebuild after
changing source files.

Commands are generated from OpenAPI and use the [Node.js SDK](https://www.npmjs.com/package/@kirora/node)
for API requests. Run the following from the checkout:

```sh
pnpm test
pnpm typecheck
pnpm format:check
pnpm build
```

See the [development guide](docs/usage.md#development) for running from source,
OpenAPI generation, staging smoke checks, and CI details.

## Troubleshooting

Run `kirora doctor` to check setup and API access, and `whoami` to confirm
the selected workspace and credential source. An access failure may mean the key
lacks the scope shown in the command's `--help`.

A send refused with `SENDING_REVIEW_REQUIRED` is waiting for Kirora to review your
sending domain. Fill in the workspace's sending profile with `kirora workspaces update`
(`--website`, `--mail-kind`, `--contact-opt-in`): the review is asked for on its own
once the domain is verified and the profile is complete. After a decline, change what
`review.declineReason` names in `kirora sending-domains get <id>`, then run
`kirora sending-domains request-review <id>`.

When reporting a problem, include the CLI version, command, error code, and request ID
if available. Remove API keys and personal data before sharing logs.

## License

[MIT](LICENSE)
