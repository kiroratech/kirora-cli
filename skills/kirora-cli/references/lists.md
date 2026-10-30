<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora lists

A list is a fixed set of contacts you add and remove yourself; its membership changes only when you change it.

## kirora lists contacts add <id>

Add contacts to a list. `POST /v1/lists/{id}/contacts`, needs `lists:write`.

Adds up to 500 contacts to a list in one batch, named by exactly one of `contactIds`, `externalIds` or `emails`. Contacts already in the list are skipped rather than rejected, so the call is safe to repeat; the response reports how many were actually added, and lists in `notFound` the identifiers that name no contact in this workspace (no contact is created). Each contact added records a `contact.added_to_list` event, which starts the journeys triggered by joining the list: adding 500 people to a list with a welcome journey starts 500 welcome journeys. Because that sends without a person confirming it, agent keys are refused with 403 `AGENT_KEY_REFUSED`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

```text
The body (--data) is one of:
  { contactIds* }
  { externalIds* }
  { emails* }

Examples:
  Add contacts by email:
    $ kirora lists contacts add <id> -d '{"emails":["amaka@example.com","unknown@example.com"]}'
  Add contacts by Kirora id:
    $ kirora lists contacts add <id> -d '{"contactIds":["0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"]}'

API reference: https://kirora.io/docs/api/reference/addListContacts
```

## kirora lists contacts delete <id>

Delete contacts from a list. `POST /v1/lists/{id}/contacts/delete`, needs `lists:write`.

Takes up to 500 contacts out of a list in one batch, named by exactly one of `contactIds`, `externalIds` or `emails`: a POST, since some clients and proxies drop the body of a DELETE. The contacts themselves are kept. Contacts that were not members are ignored; the response reports how many were actually taken out, and lists in `notFound` the identifiers that name no contact in this workspace. Agent keys are refused with 403 `AGENT_KEY_REFUSED`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.
- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
The body (--data) is one of:
  { contactIds* }
  { externalIds* }
  { emails* }

Examples:
  Take contacts out by your own id:
    $ kirora lists contacts delete <id> -d '{"externalIds":["customer-4821"]}'

API reference: https://kirora.io/docs/api/reference/deleteListContacts
```

## kirora lists create

Create a list. `POST /v1/lists`, needs `lists:write`.

Creates a static list: membership is explicit, unlike a segment, which is evaluated from rules. Names are unique within the workspace, ignoring case: "VIP" and "vip" are one list (409 `ALREADY_EXISTS`).

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** Unique within the workspace, ignoring case. |
| `--description <value>` |  |

```text
Examples:
  A static list:
    $ kirora lists create -d '{"name":"Newsletter","description":"Everyone who wants the monthly newsletter"}'

API reference: https://kirora.io/docs/api/reference/createList
```

## kirora lists delete <id>

Delete a list. `DELETE /v1/lists/{id}`, needs `lists:write`.

Deletes the list and its membership records. The contacts themselves are not deleted. Refused with one 409 `IN_USE` naming everything that blocks it, in the shape of `getListUsage`: campaigns not yet sent or cancelled (A/B tests included) whose audience, rules or exclusions name it (`details.campaigns`), published forms that add submitters to it or name it in a field (`details.forms`): without the list a form refuses every submission. Also active or paused journeys (`details.journeys`) and segments whose rules name it (`details.segments`): a "not in this list" rule must not outlive the list. Change or end those first. A sent or cancelled campaign does not block it: the campaign keeps its recipients and messages, the list leaves its `listIds` (`null` once none is left) and `audienceName` keeps the names of the lists it went to.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteList
```

## kirora lists get <id>

Retrieve a list. `GET /v1/lists/{id}`, needs `lists:read`.

Returns one list. Its members are read with `GET /v1/contacts?listId=`, which takes the same filters and pages as any contact list.

```text
API reference: https://kirora.io/docs/api/reference/getList
```

## kirora lists list

List lists. `GET /v1/lists`, needs `lists:read`.

Returns lists in this workspace. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the list's name, ignoring case. |

```text
API reference: https://kirora.io/docs/api/reference/listLists
```

## kirora lists update <id>

Update a list. `PATCH /v1/lists/{id}`, needs `lists:write`.

Renames a list or changes its description. Membership is managed through the member operations, not here.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` | Unique within the workspace, ignoring case. |
| `--description <value>` |  |

```text
Examples:
  Rename a list:
    $ kirora lists update <id> -d '{"name":"Monthly newsletter"}'

API reference: https://kirora.io/docs/api/reference/updateList
```

## kirora lists usage <id>

Retrieve a list's usage. `GET /v1/lists/{id}/usage`, needs `lists:read`.

Returns what names the list: campaigns whose audience, rules or exclusions name it, forms that add people to it, journeys whose rules or steps name it, and segments whose rules name it, up to 50 of each (`hasMore` when a kind holds more). Deleting the list is refused (409 `IN_USE`) while any of them is a campaign not yet sent or cancelled (`draft`, `scheduled`, `testing` for an A/B test, or `sending`), an `active` or `paused` journey, or a segment. Forms, sent or cancelled campaigns and draft or ended journeys do not block it.

```text
API reference: https://kirora.io/docs/api/reference/getListUsage
```
