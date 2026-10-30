# Kirora CLI

`kirora` calls the Kirora API from a shell: one command for each operation the API
publishes, generated from its spec. It is built on the Node.js library (`@kirora/node`),
so authentication, retries and errors behave as they do there.

> Not published yet. What has to happen first is in the API repository's
> `docs/production-checklist.md`.

## Install

Needs Node.js 22.13 or later.

```sh
npm install -g @kirora/cli
kirora --version
```

## Quick start

```sh
kirora login                      # paste an API key at a masked prompt; it's checked, then saved
kirora whoami                     # the workspace, key and profile commands will use

kirora lists create --name VIPs
kirora lists                      # a resource on its own lists it
kirora contacts list --paginate | jq -r .email
kirora contacts identify --external-id cust_1042 --email ada@example.com
kirora campaigns send 01a1…       # an id from the path is an argument
kirora webhooks deliveries list   # a sub-collection is a group of its own

# Check a request before sending it.
kirora segments update seg_1 --tags vip --dry-run

# A receipt, safe to retry.
kirora transactional send -d @message.json --idempotency-key order-1001

# A partner key acting in one tenant.
kirora contacts list --workspace tenant-42
```

## Finding a command

Every command is `kirora <resource> <action>`, named after the API path:

- the resource is the path's first segment (`/v1/sending-domains/{id}/check` →
  `sending-domains check`);
- a path segment that two or more operations share is a group of its own
  (`/v1/webhooks/deliveries/{id}` → `webhooks deliveries get`);
- a read of a sub-path is named after it (`campaigns metrics <id>`);
- `list` is a resource's default (`kirora lists`); `ls` and `rm` are short for `list` and
  `delete`.

`kirora --help` lists the resources and `kirora lists --help` a resource's actions.
`kirora lists create --help` shows:

- what the action does, and the scope its key needs;
- its flags;
- the body fields only `--data` can carry, with their shapes (`*` marks the required ones);
- the API reference's examples, as commands to paste, and a link to the reference page.

`kirora commands` prints every command, with its arguments and options, as JSON.
`kirora completion bash|zsh|fish` prints a shell completion script; it asks the CLI at each
Tab, so it always knows the installed version's commands:

```sh
echo 'source <(kirora completion bash)' >> ~/.bashrc
echo 'source <(kirora completion zsh)' >> ~/.zshrc     # after compinit
kirora completion fish > ~/.config/fish/completions/kirora.fish
```

## Arguments, flags and bodies

- **Ids** in the path are arguments, in order. With two, each is also a flag:
  `kirora contacts topics set --contact-id c1 --topic-id t1`.
- **Query parameters and simple body fields** (text, numbers, true/false, lists of text)
  are flags: `--external-id`, `--sensitive` and `--no-sensitive`. The API's own spelling
  (`--externalId`) works too. A list flag takes every value up to the next flag, so put ids
  before it.
- **Anything nested** goes in `-d, --data` as JSON: inline, `@file.json`, or `-` for stdin.
  Flags set fields on top of it.
- **A file upload** takes the file's path: `kirora assets upload --file logo.png --name Logo`.
- **`--dry-run`** prints the request (`{ "dryRun": true, "request": … }`) and sends
  nothing. It needs no login.
- **`--idempotency-key`** makes a retry safe. Without one, each run makes its own key.
- **Deletes** ask first at a terminal. Anywhere else they need `--yes`, or fail with
  `CONFIRMATION_REQUIRED`, so a script or an agent can't delete by accident.

## Output and errors

- **A success** prints the response body on stdout, as the API sent it: JSON, or CSV for
  `messages exports download`, streamed as it arrives.
- **`--paginate`** follows a list's cursors and prints one item per line, ready for `jq`.
- **`-i`** prints the HTTP status and headers first. It can't be combined with
  `--paginate`.
- **Any failure** prints `{ "error": { "code", "message", … } }` on stderr, so a pipeline
  only ever sees a success. An API error carries the API's own code, its `status`, the
  fields that failed (`errors`), `requestId` and `retryAfterSeconds`. The CLI's own codes,
  such as `NOT_LOGGED_IN`, are listed in
  [`skills/kirora-cli/SKILL.md`](skills/kirora-cli/SKILL.md#error-codes).

| Exit code | Means                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`       | Success.                                                                                                                                     |
| `1`       | The call or command failed.                                                                                                                  |
| `2`       | The command couldn't be read (`USAGE_ERROR`): an unknown flag, a missing id or required flag, a value that isn't a number. Nothing was sent. |

## Credentials

A command's key comes from, in order:

1. the profile named by `--profile` (`-p`) or `KIRORA_PROFILE`;
2. `KIRORA_API_KEY`, with `KIRORA_API_URL` and `KIRORA_WORKSPACE`, for CI and scripts;
3. the active profile: `default`, unless `kirora auth switch <name>` chose another, or
   your first login used another name.

`kirora login` reads the key from a masked prompt, or from stdin
(`printf %s "$KEY" | kirora login`), never from a flag, where it would land in shell
history. It checks the key against `GET /v1/me`, then saves it:

- in the system keychain: the macOS Keychain, or the Secret Service (GNOME Keyring,
  KWallet) on Linux through `secret-tool`. The key reaches either on stdin, never as an
  argument;
- in the config file instead where there is no keychain (Windows, or Linux without one),
  or with `--insecure-storage` or `KIRORA_CREDENTIAL_STORE=file`.

Each login is kept in `$XDG_CONFIG_HOME/kirora/config.json` (`~/.config/kirora/config.json`),
readable only by you. `--base-url` (or `KIRORA_API_URL`) and `--workspace` (or
`KIRORA_WORKSPACE`) at login save another host or a partner's tenant with the profile.

- `kirora login --profile <name>` saves another login.
- `kirora logout` removes a login and its key. A key the keychain won't give up is retried at
  the next login or logout, and `kirora doctor` warns about it meanwhile.
- `kirora auth list` lists the profiles (never their keys); `kirora auth switch` and
  `kirora auth rename` choose and rename them.
- `kirora doctor` checks Node.js, the config file, which key is used and where it's kept,
  and that the API accepts it. It prints `{ ok, checks }` and exits 1 if a check fails.

## Webhooks while developing

```sh
ngrok http 4318
kirora webhooks listen --url https://example.ngrok.app --forward-to localhost:3000/webhooks
```

`kirora webhooks listen` subscribes a webhook for as long as it runs. It checks each
delivery's signature and prints the delivery as a JSON line. With `--forward-to` it posts
each one on to your handler, signature headers and all, and answers Kirora with your
handler's status; it prints the signing secret for your handler to verify them with.
`--events` narrows what it receives.

Ctrl+C, or the reader of its output stopping (`| head -n 1`), deletes the webhook; a second
Ctrl+C stops waiting for that. A webhook it couldn't delete, or one already subscribed to
the URL, is named with the command that deletes it. As the tunnel makes it public, it
reads nothing unsigned and refuses a body over 1 MiB.

## Use with an AI agent

Paste this into your agent (Claude Code, Cursor, Copilot and so on):

```text
Set up the Kirora CLI for me: install @kirora/cli, then follow its llms.txt step by step
(`kirora --help` prints where it is). Ask me for the API key, and let me log in myself.
```

- [`llms.txt`](llms.txt) walks the agent through installing, logging in or setting up CI,
  checking it works, and running commands safely.
- The skill in [`skills/kirora-cli/`](skills/kirora-cli/) holds every rule (`SKILL.md`) and
  a page per resource (`references/`), generated with the commands.
  [`skill-evals/kirora-cli/evals.json`](skill-evals/kirora-cli/evals.json) holds prompts to
  check an agent with.
- Assistants that don't run commands locally can use hosted MCP instead: `POST /mcp` with
  an agent key as a Bearer token.

## Development

Until `@kirora/node` is on npm, the library is linked from `../node-sdk`; build it there
first.

```sh
pnpm install
pnpm start -- lists list    # from source
pnpm test
pnpm build                   # to dist/
pnpm codegen                 # regenerate the commands from the pinned spec
pnpm codegen:check           # fail if the commands or the skill's pages are behind it
```

The commands are generated by `scripts/codegen.mjs` from the commit of
[kiroratech/openapi](https://github.com/kiroratech/openapi) that `spec/source.json` names,
as the Node.js library's are. Codegen fails if the download doesn't match the file's
`version` and `sha256`, so change the commit, `version` and `sha256` together. It also
fails if an API query parameter would get no flag. `pnpm codegen path/to/openapi.json` (or `KIRORA_OPENAPI_SPEC`) uses an
unpublished spec instead, without those checks.

`pnpm smoke` builds the CLI and runs it against a real workspace, reading only. It
creates, changes, sends and deletes nothing, and uses a config folder of its own, so your
saved logins and keychain are left alone. Give it a staging workspace's key, and
`--verbose` to see each command's output:

```sh
KIRORA_SMOKE_API_KEY=kirora_… KIRORA_SMOKE_API_URL=https://staging-api.example pnpm smoke
```

CI (`.github/workflows/ci.yml`) checks formatting, types, that the commands match the
pinned spec, and the build, then runs the tests on Linux, macOS and Windows with Node.js
22 and 24. Like local development, it builds `kiroratech/node-sdk` beside this repository
first, until `@kirora/node` is on npm.

## License

[MIT](LICENSE)
