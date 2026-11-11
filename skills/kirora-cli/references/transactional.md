<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora transactional

Transactional messages are one-off email or push sends to one recipient, such as receipts and password resets, that a person needs whatever their marketing choices.

## kirora transactional cancel-scheduled <id>

Cancel a scheduled transactional message. `POST /v1/transactional/messages/{id}/cancel`, needs `transactional:send`.

Stops a message sent with `sendAt` before it goes: it becomes `skipped` with `skip.reason` `cancelled`, its email or push goes back to the plan allowance, and `message.skipped` is published. Cancelling an email also cancels its `cc` and `bcc` copies. Cancelling it again answers 200 with the message as it is. Once a worker has started sending it, or it went at once, the response is 409 `CONFLICT`. Agent keys are refused with 403.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/cancelScheduledTransactionalMessage
```

## kirora transactional send

Send a transactional message. `POST /v1/transactional/messages`, needs `transactional:send`.

Sends a one-off message to one recipient — a receipt, a password reset, a confirmation — bypassing campaigns. It ignores marketing preferences (it is the critical tier) but respects suppression. Agent keys are refused with 403.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--sensitive`, `--no-sensitive` | Set when the message carries a secret (a reset link, a one-time code): its content is kept only while the message is queued or sending, and removed once sending finishes, whatever the workspace's retention says. |
| `--correlation-id <id>` | Your own reference for this send, echoed on its webhooks and its read. |
| `--send-at <date-time>` | When to send, up to 90 days ahead, with its UTC offset. Suppression and push reachability are checked when the request is accepted and again when it goes. A `fallbackOrder` fallback keeps this time but goes only after the message before it fails, is skipped or bounces. |
| `--fallback-order <values...>` | With both `push` and `email`, each once, in the order to try them: the first the contact can receive is sent, and the next only if it fails, is skipped or bounces. Left out, each channel the contact can receive is sent. |

```text
Body fields only --data can carry (* required):
  to*    one of { contactId* } | { externalId* } | { email* }
         Who receives it.
  data   object
         Values the content reads as `{{ data.<key> }}`: a stored template, inline email and the push `title` and `body` alike.
  email  one of { template*, subject, previewText, from, replyTo, attachments, threading, tracking, cc, bcc } | { subject*, previewText, html*, text, from*, replyTo, attachments, threading, tracking, cc, bcc, mergeTags }
         Inline (`subject`, `from`, `html`), or a stored template by `template`; either may carry `attachments`, `threading`, `tracking`, `cc` and `bcc`.
  push   { title*, body*, actionUrl, imageUrl, iconUrl, data, buttons, collapseKey, sound, badge, ttl, urgency: "high" | "normal", overrides, pushProjectId }
         A push notification to the contact's devices.

Examples:
  Email from a stored template:
    $ kirora transactional send -d '{"to":{"externalId":"customer-4821"},"correlationId":"order-1001","data":{"order_id":"1001","total":"$45.00","item_count":3},"email":{"template":"order-receipt"}}'
  Email written in the request:
    $ kirora transactional send -d '{"to":{"email":"amaka@example.com"},"sensitive":true,"data":{"code":"482913"},"email":{"subject":"Your sign-in code","from":"Juniper Kitchen <security@juniperkitchen.com>","html":"<p>Your code is <strong>{{ data.code }}</strong>. It expires in 10 minutes.</p>","text":"Your code is {{ data.code }}. It expires in 10 minutes."}}'
  Push and email together:
    $ kirora transactional send -d '{"to":{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"},"correlationId":"delivery-7731","push":{"pushProjectId":"0192f3a1-91d4-7b2a-8c3e-4d5e6f7a8b9c","title":"Order {{ data.order_id }} is on its way","body":"Arriving {{ data.eta }}."},"data":{"order_id":"7731","eta":"Thursday"},"email":{"template":"order-shipped"}}'

API reference: https://kirora.io/docs/api/reference/sendTransactionalMessage
```

## kirora transactional send-batch

Send transactional messages in a batch. `POST /v1/transactional/messages/batch`, needs `transactional:send`.

Sends up to 100 transactional messages in one request. Each entry of `messages` holds a single send (see `POST /v1/transactional/messages`) as its `message`, optionally with its own `idempotencyKey`, and gets its own result: `results` keeps the order of `messages`, each with its `messages` (one per channel the entry sends on) and `replayed`, or the `error` a single send would have returned. One refused entry does not stop the rest. The call counts against the rate limit as one request per entry.

- `-d, --data` takes the whole JSON body; flags set fields on top.

```text
Body fields only --data can carry (* required):
  messages*  list of { idempotencyKey, message* }

Examples:
  Two receipts in one request:
    $ kirora transactional send-batch -d '{"messages":[{"idempotencyKey":"order-1001-receipt","message":{"to":{"externalId":"customer-4821"},"correlationId":"order-1001","data":{"order_id":"1001","total":"$45.00","item_count":3},"email":{"template":"order-receipt"}}},{"idempotencyKey":"order-1002-receipt","message":{"to":{"externalId":"customer-5307"},"correlationId":"order-1002","data":{"order_id":"1002","total":"$18.50","item_count":1},"email":{"template":"order-receipt"}}}]}'
  One message fails, the other goes:
    $ kirora transactional send-batch -d '{"messages":[{"idempotencyKey":"order-1003-receipt","message":{"to":{"externalId":"customer-4821"},"correlationId":"order-1003","data":{"order_id":"1003","total":"$24.00","item_count":2},"email":{"template":"order-receipt"}}},{"idempotencyKey":"order-1004-receipt","message":{"to":{"externalId":"customer-0000"},"correlationId":"order-1004","data":{"order_id":"1004","total":"$7.25","item_count":1},"email":{"template":"order-receipt"}}}]}'

API reference: https://kirora.io/docs/api/reference/sendTransactionalMessagesBatch
```
