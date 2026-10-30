<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora webhooks

A webhook is an endpoint of yours that receives Kirora's events, such as `message.delivered`.

## kirora webhooks create

Create a webhook. `POST /v1/webhooks`, needs `webhooks:write`.

Registers an HTTPS endpoint for the listed events, or `*` for every event including ones added later. Deliveries are signed with the returned `secret` (only this answer and a keyed replay of it within 24 hours carry it; reads never do), retried with backoff, and paused by a circuit breaker while the endpoint keeps failing; see the webhooks guide. This is the subscribe call Zapier, Make and n8n make when a workflow turns on. A URL already subscribed returns 409 `ALREADY_EXISTS`; edit its events instead. Agent keys cannot hold `webhooks:write`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--url <url>` | **Required.** The HTTPS endpoint that receives deliveries; it must resolve to a public host. |
| `--events <values...>` | **Required.** Event types to receive, or `["*"]` alone for every event, including future ones. |
| `--source <value>` | The tool subscribing, so the dashboard can say who made it. One of `zapier`, `make`, `n8n`. |

```text
Examples:
  Listen for new and unsubscribed contacts:
    $ kirora webhooks create -d '{"url":"https://hooks.acme-shop.com/kirora","events":["contact.created","contact.unsubscribed"]}'

API reference: https://kirora.io/docs/api/reference/createWebhook
```

## kirora webhooks delete <id>

Delete a webhook. `DELETE /v1/webhooks/{id}`, needs `webhooks:write`.

Deletes the subscription; nothing more is delivered to it. Deleting it again is 404, which Zapier, Make and n8n treat as already done. Refused with 409 `IN_USE` while an action step of an active or paused journey sends to it (`details.journeys`).

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteWebhook
```

## kirora webhooks deliveries get <id>

Retrieve a webhook delivery. `GET /v1/webhooks/deliveries/{id}`, needs `webhooks:read`.

Returns one delivery: the one a test or a redelivery queued, to watch it move from `pending` to `delivered` or `failed`.

```text
API reference: https://kirora.io/docs/api/reference/getWebhookDelivery
```

## kirora webhooks deliveries list

List webhook deliveries. `GET /v1/webhooks/deliveries`, needs `webhooks:read`.

Lists outbound webhook deliveries, newest first, a page at a time, narrowed by `webhookId`, `status`, `eventType` or `eventId`. Each names the webhook it went to (`webhookId`) and its last attempt. A pending or failed delivery carries the exact body sent (`requestBody`); a delivered one has dropped it. After an outage, `status=failed` lists what to resend with redeliver.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--webhook-id <id>` | Only deliveries to this webhook. |
| `--status <value>` | Only deliveries in this state: `failed` lists what to resend. One of `pending`, `delivered`, `failed`. |
| `--event-type <value>` | Only deliveries of this event type. One of `contact.created`, `contact.unsubscribed`, `contact.consent_changed`, `form.submitted`, `campaign.sent`, `journey.enrolled`, `message.delivered`, `message.bounced`, `message.complained`, `message.opened`, `message.clicked`, `message.failed`, `message.skipped`, `message.sent`, `journey.action_reached`, `webhook.test`. |
| `--event-id <id>` | Only this event's deliveries: one per webhook it went to. |

```text
API reference: https://kirora.io/docs/api/reference/listWebhookDeliveries
```

## kirora webhooks deliveries redeliver <delivery-id>

Redeliver a webhook delivery. `POST /v1/webhooks/deliveries/{deliveryId}/redeliver`, needs `webhooks:write`.

Re-queues a failed delivery as the same event (same `X-Webhook-Event-Id`), and returns it to watch. 404 for a delivery this workspace does not have; 409 `CONFLICT` for one that is not failed or whose body is no longer kept. A redelivery to a paused or disabled webhook waits until it is active.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/redeliverWebhookDelivery
```

## kirora webhooks events

List webhook events. `GET /v1/webhooks/events`.

Lists the event types a subscription may listen for, each with what fires it and an example delivery body. A subscription may also name `*` alone, which covers every event, including ones added later. `journey.action_reached` and `webhook.test` are not listed: they cannot be subscribed to. Each event's full schema is in this document's `webhooks` section. Any valid key.

```text
API reference: https://kirora.io/docs/api/reference/listWebhookEvents
```

## kirora webhooks get <id>

Retrieve a webhook. `GET /v1/webhooks/{id}`, needs `webhooks:read`.

Returns one webhook subscription: its URL, events and status. The secret is never returned by a read.

```text
API reference: https://kirora.io/docs/api/reference/getWebhook
```

## kirora webhooks list

List webhooks. `GET /v1/webhooks`, needs `webhooks:read`.

Lists the workspace's webhook subscriptions, newest first, a page at a time; `source` narrows to the ones an integration made. Secrets are never returned by a read.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--source <value>` | Only webhooks made by this integration. One of `zapier`, `make`, `n8n`. |

```text
API reference: https://kirora.io/docs/api/reference/listWebhooks
```

## kirora webhooks rotate-secret <id>

Rotate a webhook signing secret. `POST /v1/webhooks/{id}/rotate-secret`, needs `webhooks:write`.

Returns a new secret. Only this answer carries it, and a retry with the same `Idempotency-Key` within 24 hours, which replays it instead of rotating again; reads never return it. For 24 hours requests carry signatures from both the new and the old secret, so the receiver can switch without dropping events. Rotating again within those 24 hours stops the secret the first rotation issued at once; the original keeps signing until the first overlap ends.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/rotateWebhookSecret
```

## kirora webhooks test <id>

Send a test webhook delivery. `POST /v1/webhooks/{id}/test`, needs `webhooks:write`.

Queues a `webhook.test` event to this endpoint, signed and retried like any other, and returns the delivery to watch with `GET /v1/webhooks/deliveries/{id}`. A paused or disabled webhook is refused with 409 `CONFLICT`: set its `status` to `active` first.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/testWebhook
```

## kirora webhooks update <id>

Update a webhook. `PATCH /v1/webhooks/{id}`, needs `webhooks:write`.

Changes the URL or events of a webhook, or sets `status` to `paused` or `active`. A paused or platform-disabled webhook receives no new events; its pending deliveries wait and resume when it is active again.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--url <url>` | The HTTPS endpoint that receives deliveries; it must resolve to a public host. |
| `--events <values...>` | Event types to receive, or `["*"]` alone for every event, including future ones. |
| `--status <value>` | `paused` stops deliveries. `active` resumes them, and also re-enables a webhook the platform disabled. One of `active`, `paused`. |

```text
Examples:
  Pause deliveries:
    $ kirora webhooks update <id> -d '{"status":"paused"}'

API reference: https://kirora.io/docs/api/reference/updateWebhook
```
