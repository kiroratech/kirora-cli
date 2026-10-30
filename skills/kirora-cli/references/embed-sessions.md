<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora embed-sessions

Embed sessions let a partner's customers use Kirora's segment and email builders inside the partner's app for 15 minutes, without a key of their own.

## kirora embed-sessions create

Create an embed session. `POST /v1/embed-sessions`, needs `embed:write`.

Creates an embed session for one tenant. Partner keys only, from your server, with `Kirora-Workspace` naming the tenant. Returns a token the embedded segment and email builders send as `Authorization: Bearer es_…` for 15 minutes; the SDK asks your server for a new one before it expires. The key must have `allowedOrigins`, and a session is refused with 403 `EMBED_ORIGIN_NOT_ALLOWED` from any other origin. A session lets the chosen builders read what they need, render previews, count audiences, upload images and, when `testSendTo` lists addresses, send test emails to those addresses only. It never saves, publishes or sends anything else; your server saves what the builders return. It sees masked attributes as a member does, and attribute values and event property samples only with `includeAttributeValues`. Revoking the key ends every session it minted. Use a new `Idempotency-Key` for each session: a repeat with the same key within 24 hours returns the first session again, whose token may have expired.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--components <values...>` | **Required.** The builders the browser may load; each opens only the routes it needs. |
| `--include-attribute-values`, `--no-include-attribute-values` | Lets the session read attribute values and event property samples, for value suggestions. Off by default: they are the workspace's customer data. |
| `--test-send-to <emails...>` | Up to 5 addresses the email builder may send a test to, such as your signed-in user's. Defaults to none, which hides test sending. The builder can send to no other address. |

```text
Examples:
  A session for the segment and email builders:
    $ kirora embed-sessions create -d '{"components":["segment_builder","email_builder"],"testSendTo":["ada@acme-shop.com"]}'

API reference: https://kirora.io/docs/api/reference/createEmbedSession
```
