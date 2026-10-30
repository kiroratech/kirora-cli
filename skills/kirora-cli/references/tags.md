<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora tags

A tag is a label on campaigns, journeys, segments and templates, such as "Black Friday", for filtering lists and reports.

## kirora tags create

Create a tag. `POST /v1/tags`, needs `tags:write`.

Creates a tag ahead of use. Naming a tag in `tags` on a campaign, journey, segment or template also creates it, so this is only needed to prepare a set of tags. Names are unique within the workspace ignoring case: "black friday" is taken by "Black Friday" (409 `ALREADY_EXISTS`). Agent keys may manage tags: a label sends nothing.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** Unique within the workspace, ignoring case. |

```text
Examples:
  Prepare a tag before tagging anything:
    $ kirora tags create -d '{"name":"Black Friday"}'

API reference: https://kirora.io/docs/api/reference/createTag
```

## kirora tags delete <id>

Delete a tag. `DELETE /v1/tags/{id}`, needs `tags:write`.

Deletes the tag and takes it off every item; the items themselves are kept. Refused with 409 `IN_USE` while a rule names it (a segment, campaign audience, journey, goal, or a block condition in a design), since the rule would then match nobody. `details.usedBy` lists the first 50 of each kind (`segments`, `campaigns`, `journeys`, `goals`, `templates`, `sharedBlocks`), with `hasMore` when a kind holds more. Merge it into another tag instead to keep those rules working.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteTag
```

## kirora tags list

List tags. `GET /v1/tags`, needs `tags:read`.

Returns the workspace's tags sorted by name (ignoring case), each with how many campaigns, journeys, segments and templates carry it. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the tag's name, ignoring case: what a picker types. |

```text
API reference: https://kirora.io/docs/api/reference/listTags
```

## kirora tags merge <id>

Merge a tag into another. `POST /v1/tags/{id}/merge`, needs `tags:write`.

Moves every item carrying this tag onto `targetTagId`, then deletes this tag, in one step: how "BF" and "Black Friday" become one. An item already carrying both keeps one. Rules that name this tag (segments, campaign audiences, journey filters, goal populations, block conditions in designs) are pointed at the target in the same step, so a rule that named either tag now matches the items of both. Since that can change who a rule reaches, an agent key is refused with 403 `AGENT_KEY_REFUSED` when a rule names either tag. Merging a tag into itself is refused with 400.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--target-tag-id <id>` | **Required.** The tag that takes over every item, and survives the merge. |

```text
Examples:
  Fold "BF" into "Black Friday":
    $ kirora tags merge <id> -d '{"targetTagId":"0192f3e0-1a2b-7c3d-8e4f-5a6b7c8d9e0f"}'

API reference: https://kirora.io/docs/api/reference/mergeTags
```

## kirora tags update <id>

Rename a tag. `PATCH /v1/tags/{id}`, needs `tags:write`.

Renames the tag on every item that carries it. A name another tag holds, ignoring case, is refused with 409 `ALREADY_EXISTS`: merge the two instead.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** The new name; unique within the workspace, ignoring case. |

```text
Examples:
  Rename a tag everywhere it is used:
    $ kirora tags update <id> -d '{"name":"Black Friday 2026"}'

API reference: https://kirora.io/docs/api/reference/updateTag
```
