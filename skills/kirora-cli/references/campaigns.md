<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora campaigns

A campaign is one marketing send to an audience, a list or a segment, at once or at a scheduled time.

## kirora campaigns archive <id>

Archive a campaign. `POST /v1/campaigns/{id}/archive`, needs `campaigns:write`.

Hides the campaign from the list (`GET /v1/campaigns` leaves archived campaigns out unless `archived=true`). Nothing else changes: statistics and messages stay. A scheduled or sending campaign is refused with 409.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/archiveCampaign
```

## kirora campaigns breakdown <id>

Retrieve a campaign's email results by domain, device or country. `GET /v1/campaigns/{id}/breakdown`, needs `campaigns:read`.

Splits a campaign's email results into rows by the recipient's email domain (`gmail.com`), the device they first opened or clicked on (`desktop`, `mobile`, `tablet`), or the contact's country (`GB`), counted the same way as the campaign's metrics. Use it to find where a problem sits: bounces concentrated on one domain point at that mailbox provider, not at the whole list.

| Flag | |
| --- | --- |
| `--group-by <value>` | **Required.** `domain`: the recipient's email domain. `device`: the kind of device a person first opened or clicked on. `country`: the contact's country (ISO 3166-1 alpha-2). One of `domain`, `device`, `country`. |

```text
API reference: https://kirora.io/docs/api/reference/getCampaignBreakdown
```

## kirora campaigns cancel <id>

Cancel a campaign that is still sending. `POST /v1/campaigns/{id}/cancel`, needs `campaigns:write`.

Stops a campaign whose messages are still going out: every message not yet handed to a worker is skipped with reason `campaign_cancelled`, and the campaign becomes `cancelled`. Messages already being sent finish. A campaign with nothing left queued is refused with 409 `CONFLICT`; unschedule a scheduled one instead. Skipped messages publish no webhooks. Needs `campaigns:write`, so agent keys may stop a send.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/cancelCampaign
```

## kirora campaigns choose-ab-test-winner <id>

Choose an A/B test's winner. `POST /v1/campaigns/{id}/ab-test/winner`, needs `campaigns:send`.

Picks the winning version of a campaign in `testing` and sends it to the rest of the audience at once, instead of waiting for the automatic pick (or when the test has none, `decideAfter: null`). The campaign turns `sending`, then `sent`. Asking again for the version already picked returns 202 and queues its send again, so a retry is safe; another version once one is picked, or a campaign not in `testing`, is refused with 409 `CONFLICT`. Agent keys are refused with 403: this sends.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--ab-version <number>` | **Required.** The version the rest of the audience gets. |

```text
Examples:
  Send version 2 to the rest of the audience:
    $ kirora campaigns choose-ab-test-winner <id> -d '{"version":2}'

API reference: https://kirora.io/docs/api/reference/chooseAbTestWinner
```

## kirora campaigns create

Create a campaign. `POST /v1/campaigns`, needs `campaigns:write`.

Creates a campaign in `draft`, targeting email, push, or both. A draft saves unfinished: only `name` is required, and the audience and each channel's content may come later (content for a channel not selected is refused). What is given is checked, so a bad merge tag is caught on save. Sending, scheduling or confirming needs it whole: 409 `DRAFT_INCOMPLETE` lists each missing field in `errors`, and the eligibility check shows the same. Every contact receives each selected channel they can be reached on and have consented to. Email content is a template snapshot — a schema version, block tree and theme — not a subject and body; build it from a template rather than by hand. Creating does not send: use the send or schedule operation once the campaign is ready.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |
| `--channels <values...>` | The channels to send on; each needs its own content. Defaults to `email`. |
| `--all-contacts`, `--no-all-contacts` | Send to all contacts: everyone its channels reach, with consent and suppressions applied as on any send. Choose at most one audience. |
| `--list-ids <ids...>` | Send to these lists, up to 20: a member of any of them receives it once. Choose at most one audience. |
| `--segment-id <id>` | Send to this segment. Choose at most one audience. |
| `--topic-id <id>` | Send only to contacts the topic reaches. Omit to reach everyone with consent. |
| `--tags <values...>` | Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all. |

```text
Body fields only --data can carry (* required):
  audienceRules  one of { all* } | { any* }
  exclusions     { listIds, segmentIds }
                 Leave out the members of these lists and segments ("don't send to"); beside all contacts, lists or a segment, not rules, as rules exclude within themselves.
  messageLimits  { apply*, retryFor }
  utm            { enabled*, source, medium, campaign, content, term }
                 UTM parameters added to the links in the email.
  content        { email, push }
                 The content for each selected channel.
  abTest         { versions*, testPercent*, winnerBy, conversionGoalId, decideAfter* }
  delivery       { rateLimit*, expiresAfter* }
                 How fast it goes out, and until when.

Examples:
  An email draft for a list:
    $ kirora campaigns create -d '{"name":"October newsletter","channels":["email"],"listIds":["0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e"],"messageLimits":{"apply":true,"retryFor":{"value":24,"unit":"hours"}},"content":{"email":{"subject":"New this month at Acme Shop","previewText":"Autumn arrivals are in","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com","templateSnapshot":{"schemaVersion":1,"blocks":[{"id":"title","type":"heading","text":"Autumn arrivals","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, the new range is in."},{"id":"shop","type":"button","text":"Shop now","href":"https://acme-shop.com"}],"theme":{}}}},"tags":["Newsletter"]}'
  A flash sale at 5,000 people an hour, so the shop is not swamped, ending after 48 hours:
    $ kirora campaigns create -d '{"name":"Flash sale","channels":["email"],"allContacts":true,"content":{"email":{"subject":"New this month at Acme Shop","previewText":"Autumn arrivals are in","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com","templateSnapshot":{"schemaVersion":1,"blocks":[{"id":"title","type":"heading","text":"Autumn arrivals","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, the new range is in."},{"id":"shop","type":"button","text":"Shop now","href":"https://acme-shop.com"}],"theme":{}}}},"delivery":{"rateLimit":{"recipients":5000,"per":"hour"},"expiresAfter":{"value":48,"unit":"hours"}}}'
  A subject-line A/B test: 20% split between two subjects, the winner by clicks after 4 hours:
    $ kirora campaigns create -d '{"name":"October newsletter","channels":["email"],"listIds":["0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e"],"messageLimits":{"apply":true,"retryFor":{"value":24,"unit":"hours"}},"content":{"email":{"subject":"New this month at Acme Shop","previewText":"Autumn arrivals are in","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com","templateSnapshot":{"schemaVersion":1,"blocks":[{"id":"title","type":"heading","text":"Autumn arrivals","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, the new range is in."},{"id":"shop","type":"button","text":"Shop now","href":"https://acme-shop.com"}],"theme":{}}}},"tags":["Newsletter"],"abTest":{"versions":[{"email":{"subject":"Five autumn recipes, one pan each"}}],"testPercent":20,"winnerBy":"clicks","decideAfter":{"value":4,"unit":"hours"}}}'

API reference: https://kirora.io/docs/api/reference/createCampaign
```

## kirora campaigns delete <id>

Delete a draft campaign. `DELETE /v1/campaigns/{id}`, needs `campaigns:write`.

Deletes a draft. A campaign that was scheduled or sent keeps its history and is refused with 409 `CONFLICT`: archive it instead.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteCampaign
```

## kirora campaigns duplicate <id>

Duplicate a campaign. `POST /v1/campaigns/{id}/duplicate`, needs `campaigns:write`.

Copies an existing campaign, including its content snapshot, audience selection and delivery settings, into a new `draft`, named `name` or "Copy of" the original's. Metrics and messages are not copied. A campaign is sent once, so sending again is a duplicate, then a send or trigger of the copy.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | The copy's name; defaults to "Copy of" and the original's. |

```text
Examples:
  A draft copy, named for its send:
    $ kirora campaigns duplicate <id> -d '{"name":"October newsletter: second send"}'

API reference: https://kirora.io/docs/api/reference/duplicateCampaign
```

## kirora campaigns eligibility <id>

Retrieve a campaign's eligibility. `GET /v1/campaigns/{id}/eligibility`, needs `campaigns:read`.

Reports everything that would stop this campaign sending, without attempting a send: `canSend` is true when nothing does. Campaign-wide blockers sit at the top; each selected channel reports its own reach and blockers. Every blocker is `{ code, message, field? }`: `code` to branch on, `message` written for whoever fixes it, and for `draft_incomplete` the `field` still missing (a missing email body is `content.email` under the email channel). Sending is all or nothing, so one blocker anywhere stops every channel. Call this before `POST /v1/campaigns/{id}/send` to turn a 409 into an actionable list. The warnings (`contentWarnings`, `abTestWarnings`, the email channel's `mergeTagSkipped`) never stop a send. This is an estimate: it neither reserves quota nor guarantees delivery.

```text
API reference: https://kirora.io/docs/api/reference/getCampaignEligibility
```

## kirora campaigns get <id>

Retrieve a campaign. `GET /v1/campaigns/{id}`, needs `campaigns:read`.

Returns one campaign including its full content snapshot and audience selection.

```text
API reference: https://kirora.io/docs/api/reference/getCampaign
```

## kirora campaigns links <id>

List a campaign's links and their clicks. `GET /v1/campaigns/{id}/links`, needs `campaigns:read`.

Lists every link in the campaign email, never-clicked ones included, with its clicks. Ordered by `uniqueClicks`, most first; links nobody clicked come last, in the order they appear in the email. A/B versions are combined. A link is reported without its query string or fragment, so a personalised link is one row. `uniqueClicks` and `totalClicks` count people; a mail security scanner checking links on delivery, or a link preview, counts only in `machineClicks`. One person can click several links, so the unique clicks here can add up to more than the campaign's `email.clicked`.

```text
API reference: https://kirora.io/docs/api/reference/listCampaignLinks
```

## kirora campaigns list

List campaigns. `GET /v1/campaigns`, needs `campaigns:read`.

Returns campaigns in this workspace, newest first by default. Pass `status` to list only campaigns in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the campaign's name, ignoring case. |
| `--status <value>` | Only campaigns in this status. One of `draft`, `scheduled`, `sending`, `testing`, `sent`, `cancelled`. |
| `--archived <value>` | `true` lists archived campaigns only; unset or `false` leaves them out. One of `true`, `false`. |
| `--tag <value>` | Only items carrying this tag, its name matched without case. |
| `--pending-agent-review <value>` | `true`: only campaigns waiting in the agent review queue; `false`: only those not. One of `true`, `false`. |

```text
API reference: https://kirora.io/docs/api/reference/listCampaigns
```

## kirora campaigns metrics <id>

Retrieve a campaign's metrics. `GET /v1/campaigns/{id}/metrics`, needs `campaigns:read`.

Returns how a campaign did over its whole life. People-level numbers sit at the top: `recipientCount`, and the conversions and credited revenue its messages drove (gross, before refunds; zeros without conversion goals). Message counters sit under `email` and `push`, never added together, `null` for a channel the campaign does not send; push device outcomes are under `push.devices`. Email's `opened` includes machine opens (`openedByMachine`); a machine's click counts in neither `clicked` nor `opened`. Counters keep moving after a send completes, as opens, clicks and bounces arrive.

```text
API reference: https://kirora.io/docs/api/reference/getCampaignMetrics
```

## kirora campaigns preview <id>

Preview campaign content. `POST /v1/campaigns/{id}/preview`, needs `campaigns:read`.

Renders the campaign's email to HTML and plain text against the contact `contactId` (required), so merge tags resolve, without sending anything; `data` fills `{{ data.<key> }}` as a trigger's recipient would. A draft renders as far as it goes. A campaign that sends no email returns 409 `CONFLICT`.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--contact-id <id>` | **Required.** The contact whose values fill the merge tags. |
| `--ab-version <number>` | The A/B version to preview; 1 is the campaign's own content. |

```text
Body fields only --data can carry (* required):
  data  object
        Values for `{{ data.<key> }}`, as a trigger would pass them; a triggered campaign previews with what one recipient would get.

Examples:
  The email as one contact would see it:
    $ kirora campaigns preview <id> -d '{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"}'

API reference: https://kirora.io/docs/api/reference/previewCampaign
```

## kirora campaigns schedule <id>

Schedule a campaign. `POST /v1/campaigns/{id}/schedule`, needs `campaigns:send`.

Sets when a draft sends, and moves it to `scheduled`; on a campaign already `scheduled` whose send has not begun, moves it to the new time. `type: "fixed"` sends to everyone at `sendAt`, which must be in the future (400 `INVALID_SCHEDULE`). `type: "local_time"` sends to each contact at `localDateTime` on their own clock (`timezoneIfUnknown` for contacts without a timezone, else the workspace's). It may already have passed in some timezones: the send then starts at once, and `ifTimeHasPassed` says whether those contacts get it now, the next day or not at all; it is refused only once it has passed everywhere. The campaign answers with the computed `schedule.startsAt`. An A/B test with a local time sends its test share by each contact's own time; the automatic decision comes `decideAfter` after that time has passed in the last timezone (UTC-12), and the winner goes to the rest at that time of day where they are, the next time it comes round. An unfinished draft returns 409 `DRAFT_INCOMPLETE`, and every channel must be ready, as for sending. An archived campaign returns 409 `CONFLICT`. Agent keys are refused with 403. A campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

```text
The body (--data) is one of:
  { type*: "fixed", sendAt* }
  { type*: "local_time", localDateTime*, timezoneIfUnknown, ifTimeHasPassed }

Examples:
  Everyone receives it at the same moment, 08:00 UTC:
    $ kirora campaigns schedule <id> -d '{"type":"fixed","sendAt":"2026-11-03T08:00:00.000Z"}'
  Each person receives it at 08:00 in their own timezone (Europe/London where none is known):
    $ kirora campaigns schedule <id> -d '{"type":"local_time","localDateTime":"2026-11-03T08:00","timezoneIfUnknown":"Europe/London","ifTimeHasPassed":"skip"}'

API reference: https://kirora.io/docs/api/reference/scheduleCampaign
```

## kirora campaigns send <id>

Send a campaign. `POST /v1/campaigns/{id}/send`, needs `campaigns:send`.

Queues the campaign for immediate delivery: it turns `sending`, then `sent` once every message is queued. With a `delivery.rateLimit` it stays `sending` while its messages go out over the period, and turns `sent` once the last has gone or expired. A campaign is sent at most once: sending one that has already gone returns it again, so a retry after a timeout never sends twice. Every selected channel must be ready — a verified sending domain for email (409 `SENDING_DOMAIN_UNVERIFIED`, or `SENDING_DOMAIN_DMARC_MISSING` while it has no DMARC record), a configured app for push — and nothing is sent while any is blocked. An unfinished draft returns 409 `DRAFT_INCOMPLETE` with each missing field in `errors`. An archived campaign returns 409 `CONFLICT`; unarchive it first. Agent keys are refused with 403. A campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/sendCampaign
```

## kirora campaigns series <id>

Retrieve a campaign's metrics over time. `GET /v1/campaigns/{id}/series`, needs `campaigns:read`.

Returns how a campaign's metrics built up over time: for each hour or day, how many messages were sent, delivered, opened, clicked, bounced and so on, with email and push counted apart. Use it to chart a send, for example to see that most opens came in the first six hours.

| Flag | |
| --- | --- |
| `--interval <value>` | **Required.** The bucket size. One of `hour`, `day`. |
| `--from <date|date-time>` | Inclusive: start the series at the bucket holding this time instead of the first send. A date-time, or a date meaning the start of that day in the workspace timezone. |
| `--to <date|date-time>` | Exclusive: end the series with the bucket holding the moment before this time instead of now, in the same forms. A date ends the series with the day before it. |

```text
API reference: https://kirora.io/docs/api/reference/getCampaignSeries
```

## kirora campaigns trigger <id>

Trigger a campaign. `POST /v1/campaigns/{id}/trigger`, needs `campaigns:send`.

Sends a draft now, once, to the contacts `recipients` names, by `contactId`, `externalId` or `email`, instead of its saved audience; it needs none. Each person may carry their own `data`, read in the content as `{{ data.<key> }}` over the shared `data`: "the item in your basket is now cheaper", to each their item. Up to 5,000 recipients, the request up to 10 MB. A recipient that names no contact is not sent and comes back in `notFound`; one contact listed twice is refused with 400. Each message is checked as any campaign send is (consent, suppression, topic, limits), and a message whose content reads a value its recipient lacks is skipped with `missing_merge_tag`. Data is kept on a message only until it is sent. A campaign whose content reads `data` can go out only this way. A campaign is sent at most once, and every channel must be ready, as for a send. An `Idempotency-Key` header is required, and is kept with the campaign for as long as it exists: a retry with the same key and request returns the first response, `notFound` included, with `Idempotency-Replay: true`; the same key with a different request is 409 `IDEMPOTENCY_KEY_REUSED`, and any other trigger of a campaign already sent is 409 `CONFLICT`: to send again, duplicate it. Agent keys are refused with 403, and a campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key` is required: reuse the same key to retry safely.

```text
Body fields only --data can carry (* required):
  data         object
               Values every recipient shares.
  recipients*  list of one of { contactId*, data } | { externalId*, data } | { email*, data }
               The people to send to, each named by one identifier.

Examples:
  Each person with their own item:
    $ kirora campaigns trigger <id> -d '{"data":{"store":"Juniper Kitchen"},"recipients":[{"externalId":"customer-4821","data":{"item":"Cast iron skillet","price":"$39.00"}},{"email":"sam@example.com","data":{"item":"Chef knife","price":"$54.00"}},{"externalId":"customer-9999","data":{"item":"Dutch oven","price":"$89.00"}}]}' --idempotency-key <key>

API reference: https://kirora.io/docs/api/reference/triggerCampaign
```

## kirora campaigns unarchive <id>

Unarchive a campaign. `POST /v1/campaigns/{id}/unarchive`, needs `campaigns:write`.

Returns an archived campaign to the list.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/unarchiveCampaign
```

## kirora campaigns unschedule <id>

Unschedule a campaign. `POST /v1/campaigns/{id}/unschedule`, needs `campaigns:write`.

Returns a scheduled campaign to `draft`, so nothing goes out at its scheduled time. A campaign that is not scheduled returns 409 `CONFLICT`; one already sending is stopped with cancel instead. Needs `campaigns:write`, so agent keys may stop a send.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/unscheduleCampaign
```

## kirora campaigns update <id>

Update a campaign. `PATCH /v1/campaigns/{id}`, needs `campaigns:write`.

Updates a draft campaign. Only campaigns still in `draft` can be changed; anything else returns 409 `CONFLICT`. A field left out is kept; `null` clears one that may be empty (`exclusions`, `topicId`, `utm`, `abTest`, `delivery`). Content is replaced wholesale rather than merged, so send the full template snapshot — read the campaign first and pass its existing snapshot back if you are changing only the subject. Changing `channels` requires `content` in the same request, with a block for each selected channel. With `expectedRevision`, a retry after a timeout whose first attempt landed returns 409 `REVISION_CONFLICT`: read the campaign, and if it already holds your change, the update went through.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |
| `--all-contacts`, `--no-all-contacts` | Send to all contacts. Any audience field replaces the audience whole: the one set is the new audience, and `false` or `null` alone leaves it without one. |
| `--list-ids <ids...>` | Send to these lists, up to 20; replaces the audience whole. |
| `--segment-id <id>` | Send to this segment; replaces the audience whole. |
| `--topic-id <id>` | The topic to send under; `null` reaches everyone with consent. |
| `--channels <values...>` | The channels to send on. Send `content` with it so each has its content. |
| `--tags <values...>` | Replaces the tags whole (`[]` removes them), matched without case. Tags change on a campaign in any status; the rest of the body only on a draft. |
| `--expected-revision <number>` | The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there. |

```text
Body fields only --data can carry (* required):
  audienceRules  one of { all* } | { any* }
                 Send to contacts matching these rules; replaces the audience whole.
  exclusions     { listIds, segmentIds }
                 Lists and segments to leave out of its audience, beside all contacts, lists or a segment; `null` removes them.
  messageLimits  { apply*, retryFor }
  utm            { enabled*, source, medium, campaign, content, term }
                 UTM parameters added to links; `null` removes them.
  content        { email, push }
                 The content for each selected channel.
  abTest         { versions*, testPercent*, winnerBy, conversionGoalId, decideAfter* }
                 Replaces the A/B test whole; `null` removes it.
  delivery       { rateLimit*, expiresAfter* }
                 Replaces throttling and expiry whole; `null` removes them.

Examples:
  Change the subject, guarding against a concurrent edit:
    $ kirora campaigns update <id> -d '{"content":{"email":{"subject":"Autumn arrivals at Acme Shop","previewText":"Autumn arrivals are in","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com","templateSnapshot":{"schemaVersion":1,"blocks":[{"id":"title","type":"heading","text":"Autumn arrivals","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, the new range is in."},{"id":"shop","type":"button","text":"Shop now","href":"https://acme-shop.com"}],"theme":{}}}},"expectedRevision":1}'

API reference: https://kirora.io/docs/api/reference/updateCampaign
```
