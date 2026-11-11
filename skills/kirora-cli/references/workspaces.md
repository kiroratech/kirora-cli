<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora workspaces

Partner workspaces let a platform offer messaging to its own customers, one workspace per customer, created and run with a partner key and the `Kirora-Workspace` header.

## kirora workspaces cancel-deletion <external-id>

Cancel a tenant workspace's deletion. `POST /v1/workspaces/{externalId}/cancel-deletion`, needs `workspaces:manage`.

Cancels a tenant workspace's pending deletion, keeping the workspace. Partner keys only. New sends work again; messages skipped while it was being deleted are not sent.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/cancelWorkspaceDeletion
```

## kirora workspaces create

Create a tenant workspace. `POST /v1/workspaces`, needs `workspaces:manage`.

Creates a child workspace for one tenant of your product, identified by your own `externalId`, so you never need to store ours. Partner keys only. From then on, any `/v1` call with the header `Kirora-Workspace: <externalId>` acts in that workspace with your key: load its contacts, verify its sending domain, send. The workspace has no members and bills to your account. A repeated `externalId` is 409 `ALREADY_EXISTS`. While your own workspace is being deleted this is 403 `WORKSPACE_DELETION_PENDING`; cancel the deletion to create workspaces again.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |
| `--external-id <id>` | **Required.** Your own id for the tenant (up to 128 letters, digits, `.`, `:`, `_`, `-`); unique among your workspaces. |
| `--country <value>` | **Required.** Two-letter ISO 3166-1 country code. |
| `--timezone <value>` | IANA timezone, such as `Europe/Berlin`. |
| `--website <url>`, `--no-website` (clears it) | The business's website. |
| `--mail-kind <value>`, `--no-mail-kind` (clears it) | What the workspace sends. One of `marketing`, `transactional`, `both`. |
| `--contact-opt-in <value>`, `--no-contact-opt-in` (clears it) | How its contacts agreed to hear from it: a signup form, checkout, an app. |

```text
Examples:
  A workspace for one of your tenants:
    $ kirora workspaces create -d '{"name":"Juniper Kitchen London","externalId":"tenant-lagos-01","country":"GB","timezone":"Europe/London"}'

API reference: https://kirora.io/docs/api/reference/createWorkspace
```

## kirora workspaces delete <external-id>

Delete a tenant workspace. `DELETE /v1/workspaces/{externalId}`, needs `workspaces:manage`.

Deletes a tenant workspace after a grace period. Partner keys only. Sending stops at once (403 `WORKSPACE_DELETION_PENDING`, queued messages skipped) and the status becomes `deleting`. At `deletesAt`, after the grace period, the workspace and everything in it (contacts, history, files, sending domains) is deleted for good. Cancel before then with `POST /v1/workspaces/{externalId}/cancel-deletion`. Asking twice keeps the first time. Unlike other deletes, this answers 200 with the workspace rather than 204: the deletion is deferred and can be cancelled, so the body shows `status: "deleting"` and the `deletesAt` to tell your customer.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteWorkspace
```

## kirora workspaces get <external-id>

Retrieve a tenant workspace. `GET /v1/workspaces/{externalId}`, needs `workspaces:manage`.

Returns a tenant workspace, looked up by your `externalId`. Partner keys only. A workspace another partner owns is 404, the same as one that does not exist.

```text
API reference: https://kirora.io/docs/api/reference/getWorkspace
```

## kirora workspaces list

List your tenant workspaces. `GET /v1/workspaces`, needs `workspaces:manage`.

Lists your tenant workspaces, newest first. Partner keys only. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listWorkspaces
```

## kirora workspaces resume <external-id>

Resume a tenant workspace. `POST /v1/workspaces/{externalId}/resume`, needs `workspaces:manage`.

Resumes a suspended tenant workspace, lifting the suspension. Partner keys only. Messages skipped while suspended are not sent again; send or schedule anew.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/resumeWorkspace
```

## kirora workspaces suspend <external-id>

Suspend a tenant workspace. `POST /v1/workspaces/{externalId}/suspend`, needs `workspaces:manage`.

Suspends a tenant workspace, stopping every send in it without touching your other tenants. Partner keys only. Sends, schedules, journey activations and transactional or push messages are refused with 403 `WORKSPACE_SUSPENDED`, and messages already queued are skipped rather than held, so resuming releases no backlog. Reading, editing and embed sessions keep working. Suspending twice keeps the first `suspendedAt`.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/suspendWorkspace
```

## kirora workspaces update <external-id>

Update a tenant workspace. `PATCH /v1/workspaces/{externalId}`, needs `workspaces:manage`.

Changes a tenant workspace's name, country or timezone; a field left out is unchanged. Partner keys only. The timezone decides local-time sends and report days.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |
| `--country <value>` | Two-letter ISO 3166-1 country code. |
| `--timezone <value>` | IANA timezone, such as `Europe/Berlin`. |
| `--website <url>`, `--no-website` (clears it) | The business's website. |
| `--mail-kind <value>`, `--no-mail-kind` (clears it) | What the workspace sends. One of `marketing`, `transactional`, `both`. |
| `--contact-opt-in <value>`, `--no-contact-opt-in` (clears it) | How its contacts agreed to hear from it: a signup form, checkout, an app. |

```text
Examples:
  Rename the workspace:
    $ kirora workspaces update <external-id> -d '{"name":"Juniper Kitchen UK"}'

API reference: https://kirora.io/docs/api/reference/updateWorkspace
```
