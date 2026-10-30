<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora suppressions

A suppression is a block on an email address, held whether or not a contact has it, with its reason.

## kirora suppressions add

Add suppressed email addresses. `POST /v1/suppressions`, needs `suppressions:write`.

Blocks email addresses: up to 10,000 per request, with reason `imported`, for example opt-outs carried over from another platform. An agent key cannot hold `suppressions:write`. Addresses are trimmed and lowercased; one already blocked keeps its reason, and an entry that is not an address is listed in `invalid` rather than refusing the request. Nothing is sent to anyone.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--emails <values...>` | **Required.** Email addresses to block, up to 10,000; trimmed and lowercased. |

```text
Examples:
  Opt-outs carried over from another platform:
    $ kirora suppressions add -d '{"emails":["optout@example.com","Old.Customer@Example.com","not-an-address"]}'

API reference: https://kirora.io/docs/api/reference/addSuppressions
```

## kirora suppressions delete

Delete suppressed email addresses. `POST /v1/suppressions/delete`, needs `suppressions:write`.

Unblocks email addresses, up to 100 per request, one included: a POST, so an address never sits in a URL. A `manual` or `imported` block is removed, with the manual block on any contact holding that address. Bounces, complaints and unsubscribes stay: they also protect sister workspaces and the shared sending reputation, and an unsubscribe lifts only when the person resubscribes. They are listed in `notRemovable` rather than refusing the request. Only this workspace's own blocks are touched, so an address blocked only by a sister workspace is in `notFound`. Consent is unchanged. An agent key cannot hold `suppressions:write`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.
- Without a terminal it needs `--yes`: only for a deletion the user asked for.

| Flag | |
| --- | --- |
| `--emails <values...>` | **Required.** Email addresses to unblock, up to 100; trimmed and lowercased. |

```text
Examples:
  Unblock addresses blocked by mistake:
    $ kirora suppressions delete -d '{"emails":["optout@example.com","bounced@example.com","never@example.com"]}'

API reference: https://kirora.io/docs/api/reference/deleteSuppressions
```

## kirora suppressions list

List suppressed email addresses. `GET /v1/suppressions`, needs `suppressions:read`.

Lists the email addresses this workspace blocks, newest first, whether or not a contact still exists for each. Filter by `email` to check one address exactly (normalised as stored), by `query` to match any part of the address, by `reason`, or by `createdAfter` and `createdBefore` (half-open) to keep another system in step with the blocks made since a time.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--email <value>` | One address, matched trimmed and without case: is it blocked? |
| `--query <value>` | Case-insensitive part of the address. |
| `--reason <value>` | Only blocks with this reason. One of `manual`, `imported`, `unsubscribed`, `bounced`, `complained`, `complained_transactional`. |
| `--created-after <date-time>` | Only blocks made at or after this time (inclusive). |
| `--created-before <date-time>` | Only blocks made before this time (exclusive). |

```text
API reference: https://kirora.io/docs/api/reference/listSuppressions
```
