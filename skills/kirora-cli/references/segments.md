<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora segments

A segment is an audience described by rules, such as "ordered twice in 90 days", evaluated when it is used.

## kirora segments contacts <id>

List contacts in a segment. `GET /v1/segments/{id}/contacts`, needs `contacts:read`.

Evaluates a saved segment now and returns the matching contacts, shaped like the contacts list: who a send would reach. `GET /v1/contacts?segmentId=` reads the stored membership instead, up to about 15 minutes behind, with the contact filters. Because the rules are evaluated on read, results can change between pages if contacts are changing underneath. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one. `meta.count` counts the matching contacts up to 10000: beyond that it reports the cap and `meta.countExact` is `false`; both are counted on the first page only (null with a `cursor`). Who joined or left on a day is `GET /v1/segments/{id}/membership-changes`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listSegmentContacts
```

## kirora segments create

Create a segment. `POST /v1/segments`, needs `segments:write`.

Creates a segment: an audience defined by rules. A send evaluates the rules live, so it reaches whoever matches at that moment. In the background, about every 15 minutes, the rules are also evaluated into a stored membership: `memberCount`, `GET /v1/contacts?segmentId=`, `GET /v1/contacts/{id}/segments` and the `contact.entered_segment` and `contact.exited_segment` events journeys start from come from it, so they can be up to about 15 minutes behind. `memberCount` is null until the first evaluation. Rules that name a list must name one of the workspace's lists (400 `VALIDATION_ERROR` at `rules`). Names must be unique within the workspace.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** Unique within the workspace. |
| `--description <value>` | What the segment is for, up to 1,000 characters; `null` clears it. |
| `--tags <values...>` | Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all. |

```text
Body fields only --data can carry (* required):
  rules*  one of { all* } | { any* }

Examples:
  Newsletter members with no order in 90 days:
    $ kirora segments create -d '{"name":"Lapsed customers","description":"Newsletter readers who have not ordered in 90 days, for the win-back offer","rules":{"all":[{"type":"event","name":"Order Completed","count":{"operator":"equals","value":0},"withinDays":90},{"type":"list","listIds":["0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e"],"member":true}]},"tags":["Win-back"]}'
  Nested rules: Nigerian pro customers, or anyone who clicked:
    $ kirora segments create -d '{"name":"Engaged or pro","rules":{"any":[{"all":[{"type":"contact","field":"phone","operator":"exists"},{"type":"attribute","field":"attributes.plan","operator":"equals","value":"pro"}]},{"type":"activity","activity":"clicked","withinDays":30}]}}'

API reference: https://kirora.io/docs/api/reference/createSegment
```

## kirora segments delete <id>

Delete a segment. `DELETE /v1/segments/{id}`, needs `segments:write`.

Deletes the segment definition. Contacts it matched are not affected. Refused with one 409 `IN_USE` while a campaign not yet sent or cancelled (A/B tests included), an active or paused journey, or another segment uses it; `details` lists them in the shape of `getSegmentUsage`. Draft and ended journeys do not block it: a draft naming it cannot be activated until the rule is changed. Nor does a sent or cancelled campaign: its `segmentId` becomes `null` and `audienceName` keeps the segment name.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteSegment
```

## kirora segments get <id>

Retrieve a segment. `GET /v1/segments/{id}`, needs `segments:read`.

Returns one segment including its rule tree and `memberCount`, the size of its stored membership as last evaluated in the background.

```text
API reference: https://kirora.io/docs/api/reference/getSegment
```

## kirora segments list

List segments. `GET /v1/segments`, needs `segments:read`.

Returns segments in this workspace, newest first unless `sort` says otherwise (by `name`, `memberCount`, `updatedAt` or `createdAt`; a leading `-` sorts descending). Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the segment's name, ignoring case. |
| `--tag <value>` | Only items carrying this tag, its name matched without case. |

```text
API reference: https://kirora.io/docs/api/reference/listSegments
```

## kirora segments membership-changes <id>

List who joined or left a segment on a day. `GET /v1/segments/{id}/membership-changes`, needs `contacts:read`.

The contacts who joined (`change=joined`) or left (`change=left`) the segment on `day`, in the workspace timezone, newest first, from the changes recorded then (kept as long as the workspace's events). `meta.count` is that day's `joinedCount` or `leftCount` from `getSegmentSizeHistory`, on the first page only (null with a `cursor`), so the list and the chart agree.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--change <value>` | **Required.** Who joined (`joined`) or left (`left`) the segment. One of `joined`, `left`. |
| `--day <date>` | **Required.** The day, `YYYY-MM-DD` in the workspace timezone. |

```text
API reference: https://kirora.io/docs/api/reference/listSegmentMembershipChanges
```

## kirora segments preview

Preview segment rules. `POST /v1/segments/preview`, needs `segments:read`.

Evaluates a rule tree that has not been saved and returns how many contacts it would match, counted live up to 10000, and how many of them email and push can reach. Use this to check a segment definition before creating it; a saved segment's size is its `memberCount`.

- `-d, --data` takes the whole JSON body; flags set fields on top.

```text
Body fields only --data can carry (* required):
  rules*  one of { all* } | { any* }

Examples:
  Count a rule tree before saving it:
    $ kirora segments preview -d '{"rules":{"all":[{"type":"event","name":"Order Completed","count":{"operator":"equals","value":0},"withinDays":90},{"type":"list","listIds":["0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e"],"member":true}]}}'

API reference: https://kirora.io/docs/api/reference/previewSegment
```

## kirora segments size-history <id>

Retrieve a segment's size history. `GET /v1/segments/{id}/size-history`, needs `segments:read`.

Returns the segment's size each day in the report window, as the background count last found it that day; it is counted every 15 minutes or so. Days are the workspace timezone's, as in every report. A day with no count (before the segment existed, or while the sweep was behind) is absent. Each day also says how many contacts joined and left (list them with `GET /v1/segments/{id}/membership-changes`), and `definitionChanges` the days the rules were saved, so a step in the line reads as an edit. Kept for 400 days; a window covers at most 366.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |

```text
API reference: https://kirora.io/docs/api/reference/getSegmentSizeHistory
```

## kirora segments update <id>

Update a segment. `PATCH /v1/segments/{id}`, needs `segments:write`.

Replaces the segment's rules, renames it or changes its description. Changing rules changes who the segment matches from the next evaluation onward; campaigns already sent are unaffected. When an agent key changes the rules, everything that uses the segment, directly or through segments that name it, waits for a person again: scheduled campaigns are unscheduled, active journeys are paused, and each needs a human confirmation before it sends.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` | Unique within the workspace. |
| `--description <value>` | What the segment is for, up to 1,000 characters; `null` clears it. |
| `--tags <values...>` | Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all. |

```text
Body fields only --data can carry (* required):
  rules  one of { all* } | { any* }

Examples:
  Widen the window to 180 days:
    $ kirora segments update <id> -d '{"rules":{"all":[{"type":"event","name":"Order Completed","count":{"operator":"equals","value":0},"withinDays":180},{"type":"list","listIds":["0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e"],"member":true}]}}'

API reference: https://kirora.io/docs/api/reference/updateSegment
```

## kirora segments usage <id>

Retrieve a segment's usage. `GET /v1/segments/{id}/usage`, needs `segments:read`.

Returns what uses the segment: campaigns whose audience is this segment or whose rules or exclusions name it, journeys whose rules or steps name it, and other segments whose rules name it, up to 50 of each (`hasMore` when a kind holds more). Deleting the segment is refused (409 `IN_USE`) while any of them is a campaign not yet sent or cancelled (`draft`, `scheduled`, `testing` for an A/B test, or `sending`), an `active` or `paused` journey, or another segment.

```text
API reference: https://kirora.io/docs/api/reference/getSegmentUsage
```
