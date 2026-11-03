<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora reports

Reports show how sending performs: the workspace overview, a comparison of campaigns, transactional delivery and conversion funnels.

## kirora reports campaigns

List campaign reports. `GET /v1/reports/campaigns`, needs `reports:read`.

Lists campaign performance over a window. One row per campaign with a marketing message in the window, including a campaign none of whose messages were sent: its email shows as `failed` or `skipped`. Counts are send cohorts like the overview: email by the time it was sent, email never sent and push by the time it was queued, and later feedback revises them. Journey and transactional messages are not here (see the journey and transactional reports), so these rows can sum to less than the overview. Conversions are those whose source message was sent in the window, and revenue is summed per goal currency, never converted. Rates are fractions; null means no denominator, and sorts below every rate. `sent` sorts by email sent. Without `from` and `to`, the window is the last 30 days ending today. Needs a plan with advanced reports: without one, 403 `PLAN_FEATURE_UNAVAILABLE`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |
| `--sort <value>` | A field ascending, or `-field` descending. Rates with no denominator sort last. One of `firstAttemptedAt`, `sent`, `openRate`, `clickRate`, `bounceRate`, `unsubscribeRate`, `conversions`, `-firstAttemptedAt`, `-sent`, `-openRate`, `-clickRate`, `-bounceRate`, `-unsubscribeRate`, `-conversions`. |
| `--tag <value>` | Only campaigns carrying this tag, its name matched without case: "everything tagged Black Friday". |

```text
API reference: https://kirora.io/docs/api/reference/listCampaignReports
```

## kirora reports funnel

Retrieve a funnel report. `POST /v1/reports/funnel`, needs `reports:read`.

Counts the contacts who did each step's event, in order. A contact enters with the first step's earliest event in the window (`from` inclusive, `to` exclusive; a date bound is the start of that day in the workspace timezone; default the last 30 days), and reaches a later step with an event after the previous step's, within `withinDays` of entering. Each contact counts once per step, however many times they repeat it. Events past retention are no longer held. Needs a plan with advanced reports: without one, 403 `PLAN_FEATURE_UNAVAILABLE`. A read sent as `POST` for its body of steps: it takes no `Idempotency-Key`.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |
| `--within-days <number>` | How long after the first step a contact has to finish the rest. |

```text
Body fields only --data can carry (* required):
  steps*  list of { eventName*, where }
          The events, in order.

Examples:
  Cart to order:
    $ kirora reports funnel -d '{"from":"2026-09-01","to":"2026-10-01","steps":[{"eventName":"Cart Abandoned"},{"eventName":"Order Completed","where":[{"property":"total","operator":"gte","value":"20"}]}],"withinDays":7}'

API reference: https://kirora.io/docs/api/reference/getFunnelReport
```

## kirora reports overview

Retrieve the performance overview. `GET /v1/reports/overview`, needs `reports:read`.

Returns how the workspace did in a window: marketing email in `email` and marketing push in `push`, never added together, each against the period before. Email counts are send cohorts (by the day it was sent), push by the day it was queued, and later feedback revises them. Bounce and complaint counts are durable first-occurrence facts, not current statuses. `conversions` are the goal conversions a message drove, with their credited revenue, gross; `refunds` sums every refund in the window beside it. `deliverabilityHealth` is an advisory band from the workspace's own bounce and complaint rates against Kirora's warning and pause lines, not the sending provider's reputation. Rates are fractions; null means no denominator. Days are calendar days in the workspace timezone (`timezone`, set in workspace settings); the first and last may be partial. Without `from` and `to`, the window is the last 30 days ending today.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |
| `--tag <value>` | Only email, push and conversions from campaigns and journeys carrying this tag, its name matched without case: "how did everything tagged Black Friday do". Refunds are not filtered: no message is linked to them. |

```text
API reference: https://kirora.io/docs/api/reference/getOverviewReport
```

## kirora reports rfm

Retrieve the RFM summary. `GET /v1/reports/rfm`, needs `reports:read`.

Returns the workspace's RFM summary: how many customers its RFM groups (`rfm` on each contact, `rfmGroup` in segment rules) were scored from, how many each group holds, and when. RFM groups customers by the recency, frequency and monetary value of their purchases. Scoring runs once a day.

```text
API reference: https://kirora.io/docs/api/reference/getRfmSummary
```

## kirora reports transactional

Retrieve transactional delivery statistics. `GET /v1/reports/transactional`, needs `reports:read`.

Returns transactional delivery statistics, email in `email` and push in `push`, never added together, by the day the API accepted each, so a send that failed or was skipped counts on its day. Email opens and clicks are not counted: an email is tracked only when it asks (`tracking`), so a rate across all of them would mislead; read them on each message. Push opens and clicks are, since every push can report a tap; push has no delivered or bounced count, because push services report neither. Later feedback revises the counts. Bounce and complaint counts are durable first-occurrence facts, not current statuses. Rates are fractions of `sent`; null means nothing was sent. Days are calendar days in the workspace timezone (`timezone`); the first and last may be partial. Omitting `from` and `to` means the last 30 days ending today.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |

```text
API reference: https://kirora.io/docs/api/reference/getTransactionalReport
```
