<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora conversion-goals

A conversion goal says what counts as a result for a campaign or a journey: an event, such as an order, done within a window after one of its messages, with an event property summed as revenue.

## kirora conversion-goals create

Create a conversion goal. `POST /v1/conversion-goals`, needs `conversion-goals:write`.

Counts an event as a conversion when the contact was sent the campaign or journey within the attribution window before it. Narrow which events count with `where` (property conditions, all must hold) and `occurrence` (`first` or `repeat` of the contact's events of that name), as a workspace goal's event step does. Set `valueProperty` to sum an event property (such as `total`) as revenue, and `currency` to label it; an event whose own `currency` property names another currency converts without a value, since amounts are never converted, and so does one whose value is negative, not numeric, or too large. Events from the goal's creation on are matched as they are processed; the retained history before it is matched in the background from `countedFrom`, so the goal's results fill in shortly after it is created. A campaign or journey can count one event under several goals with different filters; a second goal with the same event and filter is refused with `409 ALREADY_EXISTS`, since it would count every conversion twice. Goals count the workspace's own events, so the Free plan is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--campaign-id <id>` | The campaign it measures. |
| `--journey-id <id>` | The journey it measures. |
| `--event-name <value>` | **Required.** The event that counts as a conversion. |
| `--occurrence <value>` | `first`: only the contact's first event of these names; `repeat`: any after it. Read from the event history, so a contact whose earlier ones predate it counts as first seen (`coverageFrom` on progress says where the history starts); a property the customer sends (`first_order`) is the stricter signal. Absent: every one. One of `first`, `repeat`. |
| `--value-property <value>` | The event property summed as revenue, such as `total`. |
| `--currency <value>` | The revenue's currency, an ISO 4217 code; needs `valueProperty`. |

```text
Body fields only --data can carry (* required):
  where              list of { property*, operator*: "equals" | "notEquals" | "gt" | "gte" | "lt" | "lte", value* }
                     Property conditions the event must meet, up to 5; with several names, each of them must meet them.
  attributionWindow  { value*, unit*: "seconds" | "minutes" | "hours" | "days" }
                     How long after a message the event still counts: 1 to 3,650 whole days, default 30 days. Default: {"value":30,"unit":"days"}.

Examples:
  Count orders after the journey's messages as conversions, with revenue:
    $ kirora conversion-goals create -d '{"journeyId":"0192f3a4-3d5e-7a7f-8c43-6b8c9d0e1f2a","eventName":"Order Completed","valueProperty":"total","currency":"USD"}'
  Count only contacts' first orders of $50 or more:
    $ kirora conversion-goals create -d '{"journeyId":"0192f3a4-3d5e-7a7f-8c43-6b8c9d0e1f2a","eventName":"Order Completed","where":[{"property":"total","operator":"gte","value":"50"}],"occurrence":"first","valueProperty":"total","currency":"USD"}'

API reference: https://kirora.io/docs/api/reference/createConversionGoal
```

## kirora conversion-goals delete <id>

Delete a conversion goal. `DELETE /v1/conversion-goals/{id}`, needs `conversion-goals:write`.

Removes the goal and the conversions recorded against it, for good. Refused with 409 `IN_USE` while it still decides something: a campaign's A/B test that picks its winner by conversions on this goal and has not picked one yet, or a live or paused journey with a conversion goal exit. `details.usedBy` names them (`campaigns`, `journeys`). In the dashboard, admins and owners only.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteConversionGoal
```

## kirora conversion-goals list

List the conversion goals of a campaign or journey. `GET /v1/conversion-goals`, needs `conversion-goals:read`.

Pass exactly one of `campaignId` or `journeyId`. Cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it is `null`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--campaign-id <id>` | The campaign's goals. |
| `--journey-id <id>` | The journey's goals. |

```text
API reference: https://kirora.io/docs/api/reference/listConversionGoals
```

## kirora conversion-goals metrics <id>

Report a conversion goal's results. `GET /v1/conversion-goals/{id}/metrics`, needs `conversion-goals:read`.

Conversions, the contacts who converted out of those sent to, and revenue when the goal has a `valueProperty`. Revenue sums values in the goal currency only: a value counts when it is a non-negative number or numeric string (`"49.90"`, no thousands separators) up to 999,999,999,999.99. `conversionsWithoutValue` counts the conversions that carried none — the property missing or unusable, a negative (refunds are not revenue), or an event naming another currency — so it explains a gap between conversions and revenue. `reachedContacts` counts only sends a conversion could be credited to: from one attribution window before `countedFrom`. `conversionRate` is null until there is such a send. The totals are all time, every conversion the goal has counted since `countedFrom` (each under the attribution window in force when it was counted; see `windowChangedAt`); `history` covers the report window (`from` inclusive to `to` exclusive, the last 30 days by default) day by day in the workspace timezone.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |

```text
API reference: https://kirora.io/docs/api/reference/getConversionGoalMetrics
```

## kirora conversion-goals update <id>

Change a conversion goal. `PATCH /v1/conversion-goals/{id}`, needs `conversion-goals:write`.

Changes the attribution window, value property or currency for events processed from now on; conversions already counted keep their attribution and value, and are not counted again under the new window. Changing the window sets `windowChangedAt`, so a reader can tell the all-time totals mix both. Clearing `valueProperty` clears `currency` too. The event and its filter cannot change: create another goal.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--value-property <value>`, `--no-value-property` (clears it) |  |
| `--currency <value>`, `--no-currency` (clears it) |  |

```text
Body fields only --data can carry (* required):
  attributionWindow  { value*, unit*: "seconds" | "minutes" | "hours" | "days" }
                     How long after a message the event still counts: 1 to 3,650 whole days.

Examples:
  Credit orders up to a week after a message:
    $ kirora conversion-goals update <id> -d '{"attributionWindow":{"value":7,"unit":"days"}}'

API reference: https://kirora.io/docs/api/reference/updateConversionGoal
```
