<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora events

An event is something a contact did, such as `Order Completed`, with properties describing it.

## kirora events catalog define <name>

Define or describe an event name. `PUT /v1/events/catalog/{name}`, needs `events:write`.

Adds a name to the catalogue before the app sends it, so a journey, segment or goal can be built on it while the app's developers add it, or sets the description of a name already listed. Sending events with exactly this name then fills its figures. A name new to the workspace counts against its limit, and past it is refused with `EVENT_NAME_LIMIT_REACHED`; a name being deleted is 409 `CONFLICT`. `contact.*` names and `Ordered Product` are recorded by Kirora and refused. On `/v1` it takes `events:write`, which an agent key cannot hold.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--description <value>`, `--no-description` (clears it) | **Required.** What the event means, at most 255 characters: shown in the lists and pickers, and read by Kiro. `null` removes it. |

```text
Examples:
  Define a name before the app sends it:
    $ kirora events catalog define <name> -d '{"description":"A contact moved to a paid plan."}'

API reference: https://kirora.io/docs/api/reference/defineEventName
```

## kirora events catalog delete <name>

Delete an event name and its events. `DELETE /v1/events/catalog/{name}`, needs `events:delete`.

Deletes the name and every event tracked under it, for a name sent by mistake; it cannot be undone. A name defined but never sent just leaves the catalogue. The name leaves the catalogue and the limit at once, and its events are removed within the hour; until then tracking it returns 409 `CONFLICT`, and deleting it again 404. A name that a journey, segment, campaign, conversion goal or active workspace goal reads is refused with 409 `IN_USE`, naming them in `details.usedBy` in the summary's shape. `contact.*` names are recorded by Kirora and cannot be deleted; `Ordered Product` goes with `Order Completed`.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteEventName
```

## kirora events catalog list

List the event catalogue. `GET /v1/events/catalog`, needs `events:read`.

The workspace's event names, for the data index and for trigger, rule and goal pickers: Kirora's system names, each name the workspace has sent, and each one a person defined before sending it. Each has its `origin` (`system`, `standard` or `custom`), whether it has events (`recorded`), its description, when it was last seen, its last 30 days and how many journeys, segments, campaigns and goals read it. The figures are counted at most 15 minutes before `meta.countedAt`; a name sent for the first time is listed at once. `query`, `origin` and `recorded` filter, and `sort` orders, across every page. Standard names not yet sent are in `GET /events/standard-names`. Only the first page has `meta.nameUsage`: the names counted against the workspace's limit of 1,000, defined ones included; past it a new name is refused with `EVENT_NAME_LIMIT_REACHED`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Only names containing this, ignoring case. |
| `--origin <value>` | Only names of this origin. One of `system`, `standard`, `custom`. |
| `--recorded <value>` | `true`: only names with events; `false`: only names without, such as one defined before it was sent. One of `true`, `false`. |
| `--sort <value>` | A field ascending, or `-field` descending; ties go by name. A name with no events sorts last by `lastSeenAt` either way. One of `-lastSeenAt`, `lastSeenAt`, `-last30DaysCount`, `last30DaysCount`, `name`, `-name`. |

```text
API reference: https://kirora.io/docs/api/reference/listEventCatalog
```

## kirora events list

List events. `GET /v1/events`, needs `events:read`.

Every event the workspace tracked, accepted or rejected, newest first: did an integration's event arrive, and if not, why? Accepted events are ordered and filtered by when they happened, rejected ones by when they arrived; the log reaches back `meta.retention`. A rejected event is a tracked event the API refused (validation, an unknown contact, the name limit, a deleted name), kept as sent with the error it answered; a batch refused whole is listed event by event. A request refused before its body was read (credentials, rate limit, plan, size, broken JSON) is not kept. `query` matches an event name exactly, or a contact's id, email address or external id (accepted events only: a rejected one has no contact); property values are not searched. Complete, not sampled. For a member, a property whose key is a masked attribute is left out, as on contact reads.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--name <value>` | Only events of this name. |
| `--status <value>` | Only `accepted` events, or only `rejected` ones (refused, kept with the error). One of `accepted`, `rejected`. |
| `--source <value>` | Only events that came in this way. Nothing indexes it, so a page polling for new events also sets `occurredAfter`. One of `api`, `web`, `system`, `stripe`, `zapier`, `make`, `n8n`, `segment`. |
| `--query <value>` | An event name, exactly as tracked, or a contact's id, email address or external id. Property values are not searched. |
| `--occurred-after <date-time>` | Only events that happened at or after this time (inclusive), a rejected one by when it arrived; the log reaches back `meta.retention` at most. |
| `--occurred-before <date-time>` | Only events that happened before this time (exclusive). |

```text
API reference: https://kirora.io/docs/api/reference/listEvents
```

## kirora events series

Retrieve an event's time series. `GET /v1/events/series`, needs `events:read`.

How many events of a name happened in each hour or day of the workspace's timezone (`timezone`), to catch tracking that broke: a line that falls to zero after a release. Accepted events only; refused ones are in the event log (`status=rejected`) with the reason. `from` (inclusive) and `to` (exclusive) choose the window, a date meaning the start of that day in `timezone`; it runs from the bucket holding `from` to the one holding the moment before `to`, without gaps, at most 366 points. `from` must be before `to`. Events past retention are gone and not counted.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** The event name, exactly as it was tracked. |
| `--interval <value>` | **Required.** The bucket size. One of `hour`, `day`. |
| `--from <date|date-time>` | Inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. The series starts with the bucket holding it. By default 30 days (`day`) or 24 hours (`hour`) before `to`. |
| `--to <date|date-time>` | Exclusive, in the same forms: the series ends with the bucket holding the moment before it. Now by default. |

```text
API reference: https://kirora.io/docs/api/reference/getEventSeries
```

## kirora events standard-names

List the standard event names. `GET /v1/events/standard-names`, needs `events:read`.

Kirora's standard names the workspace has neither sent nor defined, with what each means: Segment's e-commerce names (`commerce`) and its B2B SaaS names (`saas`). Offered beside the catalogue in pickers; once sent or defined, a name moves to the catalogue. Commerce names drive revenue: `Order Completed` with `total` and `currency`.

```text
API reference: https://kirora.io/docs/api/reference/listStandardEventNames
```

## kirora events summary

Retrieve an event's summary. `GET /v1/events/summary`, needs `events:read`.

Whether an event is arriving and what it looks like, before a segment or journey is built on it: when it last happened, how many happened in the last 30 days (counted up to 100,000, `countExact: false` past it), the property keys its latest 1,000 events carry with their types and up to five sample values, and what reads it. A custom name never tracked nor defined, or deleted, is a 404. For charts, read the series. An API key always gets the sample values. An embed session gets none unless minted with `includeAttributeValues`, and none for a key that is a masked attribute.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** The event name, exactly as it was tracked. |

```text
API reference: https://kirora.io/docs/api/reference/getEventSummary
```

## kirora events track

Track an event. `POST /v1/events/track`, needs `events:write`.

Records a behavioural event against a contact. Events drive journey triggers and segment rules, so this is the main ingestion endpoint for product activity. The event and its processing obligation are stored atomically: a 201 confirms storage, while journey and conversion effects run asynchronously afterwards. Name the contact by exactly one of `contactId`, `externalId` or `email`; a contact that does not exist is a 404, never created: identify it first. `occurredAt` defaults to now and may be at most 24 hours in the future; an event that arrives more than 72 hours after its `occurredAt` starts no journey, but still counts for history, exits and waits. Names are case-sensitive, up to 128 characters with no control characters, with leading and trailing spaces removed; those beginning with `contact.` are reserved for platform events. A workspace tracks at most 1,000 distinct names: a new one past that is refused with `EVENT_NAME_LIMIT_REACHED`, so keep ids and prices in `properties`. Send an `Idempotency-Key` from your own event id: without one, every request records a new event, so a retry after a timeout can record it twice and start a journey twice. A repeated `Idempotency-Key` with the same body returns the receipt first stored, with `Idempotency-Replay: true`; with a different body it is a 409 `IDEMPOTENCY_KEY_REUSED`. The body must be JSON (`Content-Type: application/json`). On the Free plan, which records only Kirora's own events, it is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

```text
The body (--data) is one of:
  { contactId*, name*, properties, occurredAt, context }
  { externalId*, name*, properties, occurredAt, context }
  { email*, name*, properties, occurredAt, context }

Examples:
  By Kirora contact id:
    $ kirora events track -d '{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d","name":"Checkout Started","occurredAt":"2026-10-01T09:30:00Z"}'
  By your own id, with properties:
    $ kirora events track -d '{"externalId":"customer-4821","name":"Order Completed","properties":{"order_id":"1001","total":46.5,"currency":"USD","products":[{"name":"Smoked paprika","quantity":3,"price":15.5}]},"occurredAt":"2026-10-01T09:30:00Z"}'
  By email address, at the time it arrives:
    $ kirora events track -d '{"email":"amaka@example.com","name":"Checkout Started"}'

API reference: https://kirora.io/docs/api/reference/trackEvent
```

## kirora events track-batch

Track events in a batch. `POST /v1/events/batch`, needs `events:write`.

Tracks up to 100 events in one request, each stored exactly as `POST /v1/events/track` would, in order, under its own `idempotencyKey` in place of the header. One event refused does not stop the rest: its entry carries the error a single track would have returned, and a key already used returns the stored event with `replayed: true`, or `IDEMPOTENCY_KEY_REUSED` if the event differs. An entry without a key is recorded every time it is sent. Retry a failed batch whole; the keys stop anything being stored twice. Counts against the rate limit as one request per event. On the Free plan the whole batch is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.

- `-d, --data` takes the whole JSON body; flags set fields on top.

```text
Body fields only --data can carry (* required):
  events*  list of { idempotencyKey, event* }

Examples:
  Two events in one request:
    $ kirora events track-batch -d '{"events":[{"idempotencyKey":"order-1001-completed","event":{"externalId":"customer-4821","name":"Order Completed","properties":{"order_id":"1001","total":45.5,"currency":"USD"},"occurredAt":"2026-10-01T09:30:00Z"}},{"idempotencyKey":"order-1002-completed","event":{"externalId":"customer-5307","name":"Order Completed","properties":{"order_id":"1002","total":18.5,"currency":"USD"},"occurredAt":"2026-10-01T09:30:00Z"}}]}'
  One event fails, the other is recorded:
    $ kirora events track-batch -d '{"events":[{"idempotencyKey":"order-1003-completed","event":{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d","name":"Order Completed","occurredAt":"2026-10-01T09:30:00Z"}},{"idempotencyKey":"order-1004-completed","event":{"email":"nobody@example.com","name":"Order Completed","occurredAt":"2026-10-01T09:30:00Z"}}]}'

API reference: https://kirora.io/docs/api/reference/trackEventsBatch
```
