<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora messages

The message log holds every message Kirora sent or tried to send, from campaigns, journeys and transactional sends, with what became of it.

## kirora messages content <id>

Retrieve a message's content. `GET /v1/messages/{id}/content`, needs `messages:read`.

Returns the subject, preview text, sender and body (or the push content) of a transactional send as it was accepted; merge tags appear unrendered. Kept for the workspace retention period, 30 days by default, and not kept once sent for a `sensitive` send: that, and expired content, return 404 `CONTENT_NOT_RETAINED`. So does a campaign or journey message, whose content is the campaign's or the journey version's: read it there.

```text
API reference: https://kirora.io/docs/api/reference/getMessageContent
```

## kirora messages deliveries <id>

List a push message's deliveries. `GET /v1/messages/{id}/deliveries`, needs `messages:read`.

Lists what each device reported for one push message: any message whose `channel` is `push`, from a campaign, a journey or a transactional send. A push reaches every ready installation of the contact, so a message has one delivery per device. `accepted`: Apple, Google or the browser's push service took it, which is not proof the device showed it. `invalid`: the device is gone and its installation was retired. `rejected`: refused, often the app's key or a payload the provider would not take. `retryable`: will be tried again. `unknown`: the provider may have taken it, so it is not resent. `skipped`: not attempted, as when the app's key was refused for another device of the same app. `pending` and `started` are still in flight. A message that is not a push returns 404.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listMessageDeliveries
```

## kirora messages exports create

Export sent messages as CSV. `POST /v1/messages/exports`, needs `messages:read`.

Queues a CSV of the message log. The body takes the filters of `GET /v1/messages` (`status`, `channel`, `recipient`, `query`, `messageType`, `campaignId`, `journeyId`, `stepId`, `templateId`, `correlationId`, `createdAfter`, `createdBefore`; not `opened` or `clicked`) and applies them the same way; send `{}` for every message. A filter matching no message is refused with `NOTHING_TO_EXPORT`. The file is generated in the background: poll the export until `status` is `ready`, then download it. Any key of the workspace with `messages:read` can read the export.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--status <value>` | Only messages in this status. One of `queued`, `sending`, `skipped`, `sent`, `failed`, `delivered`, `bounced`, `complained`. |
| `--channel <value>` | One of `email`, `push`. |
| `--recipient <value>` | The exact address the message went to. |
| `--query <value>` | Part of the recipient's email address or name, matched against the contact the message went to. |
| `--message-type <value>` | Only messages of this type: `marketing` or `transactional`. One of `marketing`, `transactional`. |
| `--campaign-id <id>` | Only messages from this campaign. |
| `--journey-id <id>` | Only messages from this journey. |
| `--step-id <id>` | With `journeyId`, only messages from the journey's step with this id, in every version of its steps. |
| `--template-id <id>` | Only transactional sends from this stored template; no other message records one. |
| `--correlation-id <id>` | Only the transactional sends that carried this `correlationId`. |
| `--created-after <date-time>` | Only messages accepted at or after this time (inclusive). |
| `--created-before <date-time>` | Only messages accepted before this time (exclusive). |

```text
Examples:
  Export this month’s marketing email:
    $ kirora messages exports create -d '{"channel":"email","messageType":"marketing","createdAfter":"2026-10-01T00:00:00.000Z"}'

API reference: https://kirora.io/docs/api/reference/createMessageExport
```

## kirora messages exports download <id>

Download a message export. `GET /v1/messages/exports/{id}/download`, needs `messages:read`.

Downloads a ready export as a CSV file, one row per message, newest first. Returns `409 EXPORT_UNAVAILABLE` until the export is ready and `410 EXPORT_UNAVAILABLE` once it has expired.

```text
API reference: https://kirora.io/docs/api/reference/downloadMessageExport
```

## kirora messages exports get <id>

Retrieve a message export. `GET /v1/messages/exports/{id}`, needs `messages:read`.

Returns a message export's progress: `queued`, `generating`, then `ready` or `failed`. A ready file is kept until `expiresAt`, after which the export reads `expired`. A failed export says why in `failureCode`: `EXPORT_TOO_LARGE` (narrow the filters) or `GENERATION_FAILED`.

```text
API reference: https://kirora.io/docs/api/reference/getMessageExport
```

## kirora messages get <id>

Retrieve an outbound message. `GET /v1/messages/{id}`, needs `messages:read`.

Returns any outbound message in the message log, whatever its source and status, as the log lists it.

```text
API reference: https://kirora.io/docs/api/reference/getMessage
```

## kirora messages list

List outbound messages. `GET /v1/messages`, needs `messages:read`.

Lists the workspace message log: one row per outbound message from campaigns, journeys and transactional sends, newest first, whether it was sent, is still queued, or was skipped or failed. `campaign` and `journey` say where a row came from (neither, for a transactional send), and `bounce`, `failure` or `skip` what became of it.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--status <value>` | Only messages in this status. One of `queued`, `sending`, `skipped`, `sent`, `failed`, `delivered`, `bounced`, `complained`. |
| `--channel <value>` | Only messages on this channel. One of `email`, `push`. |
| `--recipient <value>` | The exact address the message went to. |
| `--query <value>` | Part of the recipient's email address or name, matched against the contact the message went to. |
| `--message-type <value>` | Only messages of this type: `marketing` or `transactional`. One of `marketing`, `transactional`. |
| `--campaign-id <id>` | Only messages from this campaign. |
| `--journey-id <id>` | Only messages from this journey. |
| `--step-id <id>` | With `journeyId`, only messages from the journey's step with this id, in every version of its steps. |
| `--template-id <id>` | Only transactional sends from this stored template; no other message records one. |
| `--correlation-id <id>` | Only the transactional sends that carried this `correlationId`. |
| `--opened <value>` | `true`: opened (or clicked) at least once; `false`: never. One of `true`, `false`. |
| `--clicked <value>` | `true`: a link clicked at least once; `false`: never. One of `true`, `false`. |
| `--created-after <date-time>` | Only messages accepted at or after this time (inclusive). |
| `--created-before <date-time>` | Only messages accepted before this time (exclusive). |

```text
API reference: https://kirora.io/docs/api/reference/listMessages
```
