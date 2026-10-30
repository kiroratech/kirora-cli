<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora topics

A topic is a kind of marketing a contact can choose, such as product updates, and a topic choice is their choice for it on every channel or one.

## kirora topics create

Create a topic. `POST /v1/topics`, needs `topics:write`.

Creates a topic. Names are unique in the workspace (`409 ALREADY_EXISTS`). Topics let contacts choose what marketing they get, separately from lists. A campaign or journey send step with a `topicId` reaches a contact only if they have email or push consent and the topic reaches them: an `opt_out` topic reaches everyone who has not left it, an `opt_in` topic only those who joined. A contact leaves a topic from the unsubscribe link of any message sent on it; every change is recorded in the contact's consent changes.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** Unique within the workspace. |
| `--description <value>` |  |
| `--mode <value>` | Who the topic reaches: everyone who has not left, or only who joined. One of `opt_out`, `opt_in`. |

```text
Examples:
  A topic contacts leave when they opt out:
    $ kirora topics create -d '{"name":"Weekly offers","description":"Discounts and bundles, once a week","mode":"opt_out"}'

API reference: https://kirora.io/docs/api/reference/createTopic
```

## kirora topics delete <id>

Delete a topic. `DELETE /v1/topics/{id}`, needs `topics:write`.

Deletes a topic. Refused with `409 IN_USE` while a campaign, or an active or paused journey, uses it (the journeys listed in `details.journeys`); ended journeys do not count. Consent changes keep its past changes. Every contact’s choices on the topic go with it, so agent keys are refused with 403.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteTopic
```

## kirora topics get <id>

Retrieve a topic. `GET /v1/topics/{id}`, needs `topics:read`.

Returns one topic by id.

```text
API reference: https://kirora.io/docs/api/reference/getTopic
```

## kirora topics list

List topics. `GET /v1/topics`, needs `topics:read`.

Lists the workspace's topics. Topics let contacts choose what marketing they get, separately from lists. A campaign or journey send step with a `topicId` reaches a contact only if they have email or push consent and the topic reaches them: an `opt_out` topic reaches everyone who has not left it, an `opt_in` topic only those who joined. A contact leaves a topic from the unsubscribe link of any message sent on it; every change is recorded in the contact's consent changes.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listTopics
```

## kirora topics update <id>

Update a topic. `PATCH /v1/topics/{id}`, needs `topics:write`.

Renames or re-describes a topic. `mode` is fixed once created: sending the other mode is refused with 409 `CONFLICT` (`details.field: "mode"`); create a new topic instead.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` | Unique within the workspace. |
| `--description <value>` |  |
| `--mode <value>` | Who the topic reaches: everyone who has not left, or only who joined. One of `opt_out`, `opt_in`. |

```text
Examples:
  Rename a topic:
    $ kirora topics update <id> -d '{"name":"Weekly deals"}'

API reference: https://kirora.io/docs/api/reference/updateTopic
```
