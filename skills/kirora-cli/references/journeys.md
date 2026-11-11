<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora journeys

A journey is an automation that contacts enter on a trigger, such as an event or joining a list, and move through step by step over time.

## kirora journeys activate <id>

Activate a journey. `POST /v1/journeys/{id}/activate`, needs `journeys:activate`.

Starts the journey running, so matching contacts begin entering it. Requires a whole journey (409 `DRAFT_INCOMPLETE` lists each missing field in `errors`, including anything the journey names that no longer exists: a list, segment or form in its trigger or exit conditions, a list or webhook an action step names, a topic a send step uses, a segment a filter or split rule names; and a webhook endpoint that is paused or disabled) and, for any step that sends email, a from-address on a verified sending domain (409 `SENDING_DOMAIN_UNVERIFIED`, or `SENDING_DOMAIN_DMARC_MISSING` while it has no DMARC record). Agent keys are refused with 403. Activating a paused journey resumes it: people partway through carry on where they were. With `{ "enrollCurrentMembers": true }`, the people already in the trigger's list or segment are enrolled too, in the background over the next minutes: anyone the journey has ever enrolled is skipped (even when re-entry is repeatable: this is a catch-up, not a re-entry), as are entries past `maxEntries`. On a resume it covers people who joined while it was paused; on a running journey it starts the catch-up unless one is under way. Without it, only people who join from now enter. Another trigger type returns 400 `VALIDATION_ERROR` at `enrollCurrentMembers`; a date trigger always includes current matches, and an event trigger has none. `enrolledCount` and the metrics show the progress.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--enroll-current-members`, `--no-enroll-current-members` | For a `list` or `segment` trigger: also enroll the people already in it, in the background, skipping anyone the journey has ever enrolled and any entry past `maxEntries`. Default `false`: only people who join from now enter. |

```text
Examples:
  A list journey also enrolls the people already on the list:
    $ kirora journeys activate <id> -d '{"enrollCurrentMembers":true}'

API reference: https://kirora.io/docs/api/reference/activateJourney
```

## kirora journeys activation-check <id>

Check a journey before activating. `GET /v1/journeys/{id}/activation-check`, needs `journeys:read`.

Lists everything activating now would refuse, all at once and without activating: unfinished send steps, a list, segment, form, topic or webhook a step, the trigger or an exit names that is gone or off, a conversion goal exit without a goal, and for each finished send step an unverified sender or a sending domain without the DMARC record marketing email needs, the workspace's missing postal address or a push app not ready. Each issue gives the field to fix, the error code `activateJourney` would answer with for it and, on a step, the step's id. Empty `issues` means these checks pass; activation can still refuse for the plan's active journey limit or, for a journey an agent authored or edited, a person's confirmation. An ended journey has one issue on `status`; a workspace whose sending is stopped (suspended, or its deletion pending) has one on `workspace`.

```text
API reference: https://kirora.io/docs/api/reference/getJourneyActivationCheck
```

## kirora journeys create

Create a journey. `POST /v1/journeys`, needs `journeys:write`.

Creates a multi-step automation in a draft state. A draft saves unfinished: it needs a name and a trigger, but may have no steps yet and send steps without their content; what is given is checked. Each step has an `id` you choose, unique within the journey, and transitions (`nextStep`, `onMatchStep`, `otherwiseStep`, split paths) name those ids: a step whose `nextStep` is omitted goes on to the next step in `steps`, `null` ends the journey there, and a branch's last step should set `null`. A transition to a step that does not exist, or one that leads back to a step already passed (a loop), is a 400 at that field. A journey does not run until it is activated, which needs it whole (409 `DRAFT_INCOMPLETE` lists each missing field in `errors`); edit it with `PATCH /v1/journeys/{id}`. An email step is built from its design (`templateSnapshot`): any `html` or `text` sent beside it is replaced by the design's rendering. A send step may set `onUnreachableStep` (the contact cannot receive the channel) and `onFailureStep`: taken when the message cannot be queued because the plan's sending allowance is used up or its marketing contacts are past the plan's limit (it is recorded `skipped`, reason `plan_limit_reached`). Delivery happens after the enrollment has moved on, so a later bounce or provider error does not branch. A contact enters one repeatable journey at most 10 times an hour, whatever its `waitAfterEntry`; past that, entries are skipped and the workspace admins are notified (`journey_loop_detected`).

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |
| `--max-entries <number>`, `--no-max-entries` (clears it) | The most enrollments the journey starts over its life; `null` or unset has no cap. |
| `--min-hours-between-sends <number>`, `--no-min-hours-between-sends` (clears it) | The least time, in hours (1–168), between two of this journey's messages to one contact, across all their runs: a send due sooner waits, and is not dropped. `null` or unset: no gap. |
| `--tags <values...>` | Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all. |

```text
Body fields only --data can carry (* required):
  trigger*        one of { type*: "event", name*, where, reentry } | { type*: "list", listId, reentry } | { type*: "segment", segmentId, on: "enter" | "exit", reentry } | { type*: "form", formId, where, reentry } | { type*: "attribute", key*, where, reentry } | { field*, recurrence*: "once" | "annual", offset, time*, leapDay: "feb28" | "mar1" | "skip", type*: "date" }
                  What starts an enrollment.
  exitConditions  list of one of { type*: "event", name*, where, matchTriggerProperty, includeEarlierEvents } | { type*: "conversion_goal" }
                  Events that end a contact's enrollment early. Default: [].
  steps*          list of one of { id*, name, type*: "wait", duration, until, businessDays, window, nextStep } | { id*, name, type*: "wait_until", event*, timeout*, onMatchStep*, onTimeoutStep* } | { id*, name, type*: "digest", gatherFor*, nextStep } | { id*, name, type*: "send", channel*: "email", content*, nextStep, onUnreachableStep, onFailureStep, topicId, transactional } | { id*, name, type*: "send", channel*: "push", content*, nextStep, onUnreachableStep, onFailureStep, topicId } | { id*, name, type*: "branch", where*, onMatchStep*, otherwiseStep* } | { id*, name, type*: "filter", mode*: "once" | "continuous", rules*, onMatchStep*, otherwiseStep } | { id*, name, type*: "split", paths*, otherwiseStep* } | { id*, name, type*: "random_split", paths* } | { id*, name, type*: "action", action*, nextStep }
                  The steps.
  messageLimits   { apply*, retryFor }
                  For the whole journey: a person over a limit skips that send and moves on.
  utm             { enabled*, source, medium, campaign, content, term }
                  Link tags for the journey's email, as on campaigns; unset follows the workspace.

Examples:
  Wait an hour after sign-up, then send a welcome email:
    $ kirora journeys create -d '{"name":"Welcome series","trigger":{"type":"event","name":"Signed Up","reentry":{"mode":"once"}},"steps":[{"id":"wait-an-hour","name":"Wait an hour","type":"wait","duration":{"value":1,"unit":"hours"}},{"id":"welcome-email","name":"Welcome email","type":"send","channel":"email","content":{"subject":"Welcome to Acme Shop","previewText":"Your first order ships free","from":"Acme Shop <hello@mail.acme-shop.com>","templateSnapshot":{"schemaVersion":1,"blocks":[{"id":"title","type":"heading","text":"Welcome to Acme Shop","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, your first order ships free."},{"id":"shop","type":"button","text":"Start shopping","href":"https://acme-shop.com"}],"theme":{}}},"nextStep":null}],"messageLimits":{"apply":true,"retryFor":{"value":24,"unit":"hours"}},"tags":["Onboarding"]}'

API reference: https://kirora.io/docs/api/reference/createJourney
```

## kirora journeys delete <id>

Delete a journey. `DELETE /v1/journeys/{id}`, needs `journeys:write`.

Deletes an ended journey, or one nobody has entered. An active or paused journey that contacts have entered is refused with 409 `CONFLICT`: end it first. The enrollments and messages of a deleted journey are kept: messages stay in message history and the contact timeline with `journeyId` `null`, and their web versions keep working.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteJourney
```

## kirora journeys duplicate <id>

Duplicate a journey. `POST /v1/journeys/{id}/duplicate`, needs `journeys:write`.

Copies the journey definition into a new `draft`, named `name` (default "Copy of" and the original's name) and tagged `tags` (default the original's). Enrollments and metrics are not copied; step ids are, so the copy's metrics count apart by journey.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | The copy's name; defaults to "Copy of" and the original's. |
| `--tags <values...>` | The copy's tags; defaults to the original's. |

```text
Examples:
  A draft copy with its own name and tags:
    $ kirora journeys duplicate <id> -d '{"name":"Welcome series (Spain)","tags":["Onboarding","Spain"]}'

API reference: https://kirora.io/docs/api/reference/duplicateJourney
```

## kirora journeys end <id>

End a journey. `POST /v1/journeys/{id}/end`, needs `journeys:write`.

Ends the journey for good: nobody enters it again, and every contact still partway through exits with reason `journey_ended`, so nothing more is sent. Its enrollments and statistics are kept. An ended journey cannot be edited or activated (409 `CONFLICT`); duplicate it to run it again. Needs `journeys:write`, so agent keys may end a journey.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/endJourney
```

## kirora journeys get <id>

Retrieve a journey. `GET /v1/journeys/{id}`, needs `journeys:read`.

Returns one journey including its current step definition.

```text
API reference: https://kirora.io/docs/api/reference/getJourney
```

## kirora journeys list

List journeys. `GET /v1/journeys`, needs `journeys:read`.

Returns journeys in this workspace. Pass `status` to list only journeys in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one. Failed and skipped messages are in `GET /v1/journeys/{id}/metrics`, over a window you choose.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the journey's name, ignoring case. |
| `--status <value>` | Only journeys in this status. One of `draft`, `active`, `paused`, `ended`. |
| `--tag <value>` | Only items carrying this tag, its name matched without case. |
| `--pending-agent-review <value>` | `true`: only journeys waiting in the agent review queue; `false`: only those not. One of `true`, `false`. |

```text
API reference: https://kirora.io/docs/api/reference/listJourneys
```

## kirora journeys metrics <id>

Retrieve a journey's metrics. `GET /v1/journeys/{id}/metrics`, needs `journeys:read`.

Enrollments, messages and conversions for one journey over the report window (`from` inclusive, `to` exclusive, the last 30 days by default), counted by when each thing happened: an enrollment in the window started in it, wherever it is now. `active` is now. `exited` includes `conversionGoalReached`, the enrollments that left by reaching a conversion goal. `messages` counts what failed or was skipped; `conversions` gives each conversion goal of the journey its conversions and gross revenue (before refunds), credited to its messages. For where people are step by step, use `GET /v1/journeys/{id}/step-metrics`. Deleting a contact deletes their runs of the journey and those messages, so a past window can later show less than it did.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |

```text
API reference: https://kirora.io/docs/api/reference/getJourneyMetrics
```

## kirora journeys pause <id>

Pause a journey. `POST /v1/journeys/{id}/pause`, needs `journeys:write`.

Stops new contacts entering the journey. Contacts already partway through stay where they are and resume if the journey is activated again. Only an active journey can be paused: a draft returns 409 `CONFLICT`. Needs `journeys:write`, so agent keys may pause; activating again needs `journeys:activate`.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/pauseJourney
```

## kirora journeys simulate <id>

Simulate a journey. `POST /v1/journeys/{id}/simulate`, needs `journeys:read`.

Previews an enrollment without sending. `entry` says whether the contact would enter now: a date journey needs a valid date in its field; an event journey checks the supplied eventProperties against the trigger's conditions, then re-entry. The path follows branches on eventProperties and filters and splits on the contact as they are now; a wait-until step takes its match path. Each send step is checked against suppression, consent, topics and devices: `would_send`, `unreachable` (takes the fallback path), `failed` (a plan limit refuses it and the step has `onFailureStep`) or `would_skip`, with the refusal code in `reason` (`DRAFT_INCOMPLETE` for a send step not yet finished: a draft simulates too; `PLAN_LIMIT_REACHED` with `planLimit`: `emails` when the email allowance is used up, `marketing_contacts`, on any channel, when the workspace's marketing contacts are past the plan's limit and its tolerance). An ended journey returns `journey_ended`; a draft or paused one is previewed as if live. A date journey enters only when its date is due now in the contact's timezone (`date_not_due` otherwise), once per occurrence; when due, its branches read the date occurrence instead of `eventProperties`. `maxEntries` and the hourly re-entry cap apply as they do live. Message limits, the push allowance and send-time scheduling are not previewed.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--contact-id <id>` | **Required.** The contact to simulate. |

```text
Body fields only --data can carry (* required):
  eventProperties  object
                   Properties of a trigger event to simulate, checked against the trigger's conditions. Default: {}.

Examples:
  Preview one contact without sending:
    $ kirora journeys simulate <id> -d '{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"}'

API reference: https://kirora.io/docs/api/reference/simulateJourney
```

## kirora journeys step-metrics <id>

Retrieve a journey's metrics step by step. `GET /v1/journeys/{id}/step-metrics`, needs `journeys:read`.

Where people are and what each step did, by step id across every version of the journey, so a step keeps its counts when others are added or moved. It counts the enrollments that entered the journey in the window (all time by default), wherever they are now; `GET /v1/journeys/{id}/metrics` counts by when each thing happened instead. Send steps carry their messages (`email` or `push`) and conversions; a random split, each path and how it converted. Deleting a contact deletes their runs of the journey and those messages, so a past window can later show less than it did.

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Count only the enrollments that entered from then, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for all time. |
| `--to <date|date-time>` | Count only the enrollments that entered before then, exclusive, in the same forms. To include a whole last day, pass the day after it. No later than the end of today; a window touches at most 366 days. Give with `from`. |
| `--include-removed-steps <value>` | `true`: also the steps no longer in the journey that enrollments passed through, with `removed: true`. One of `true`, `false`. |

```text
API reference: https://kirora.io/docs/api/reference/getJourneyStepMetrics
```

## kirora journeys update <id>

Update a journey. `PATCH /v1/journeys/{id}`, needs `journeys:write`.

Updates a journey's definition. Works while the journey is live, where the edit must leave it whole (409 `DRAFT_INCOMPLETE`); a draft or paused journey saves unfinished. `trigger` and `steps` are replaced whole. People partway through keep the path they entered on (waits, branches, splits, which steps exist); the edit applies to new entries. A send step's content (subject, body, sender, push message) is the exception: a change reaches everyone who has not yet reached that step, matched by the step `id`, so keep the `id` when fixing a step. An id names one step for the journey's life: reusing a deleted step's id merges their metrics. Changing the trigger kind or recurrence after anyone has entered is refused with 409. An agent key may edit a draft or paused journey, which marks it agent-authored so a person must confirm it before activation; editing an active journey is refused with 403. With `expectedRevision`, a retry after a timeout whose first attempt landed returns 409 `REVISION_CONFLICT`: read the journey, and if it already holds your change, the update went through.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |
| `--max-entries <number>`, `--no-max-entries` (clears it) | The most enrollments the journey starts over its life; `null` or unset has no cap. |
| `--min-hours-between-sends <number>`, `--no-min-hours-between-sends` (clears it) | The least time, in hours (1–168), between two of this journey's messages to one contact, across all their runs: a send due sooner waits, and is not dropped. `null` or unset: no gap. |
| `--tags <values...>` | Replaces the tags whole (`[]` removes them), matched without case. Tags change on a journey in any status, an agent key included: they send nothing. |
| `--expected-revision <number>` | The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there. |

```text
Body fields only --data can carry (* required):
  trigger         one of { type*: "event", name*, where, reentry } | { type*: "list", listId, reentry } | { type*: "segment", segmentId, on: "enter" | "exit", reentry } | { type*: "form", formId, where, reentry } | { type*: "attribute", key*, where, reentry } | { field*, recurrence*: "once" | "annual", offset, time*, leapDay: "feb28" | "mar1" | "skip", type*: "date" }
                  What starts an enrollment; replaces the trigger whole.
  exitConditions  list of one of { type*: "event", name*, where, matchTriggerProperty, includeEarlierEvents } | { type*: "conversion_goal" }
                  Events that end a contact's enrollment early.
  steps           list of one of { id*, name, type*: "wait", duration, until, businessDays, window, nextStep } | { id*, name, type*: "wait_until", event*, timeout*, onMatchStep*, onTimeoutStep* } | { id*, name, type*: "digest", gatherFor*, nextStep } | { id*, name, type*: "send", channel*: "email", content*, nextStep, onUnreachableStep, onFailureStep, topicId, transactional } | { id*, name, type*: "send", channel*: "push", content*, nextStep, onUnreachableStep, onFailureStep, topicId } | { id*, name, type*: "branch", where*, onMatchStep*, otherwiseStep* } | { id*, name, type*: "filter", mode*: "once" | "continuous", rules*, onMatchStep*, otherwiseStep } | { id*, name, type*: "split", paths*, otherwiseStep* } | { id*, name, type*: "random_split", paths* } | { id*, name, type*: "action", action*, nextStep }
                  The steps.
  messageLimits   { apply*, retryFor }
                  For the whole journey: a person over a limit skips that send and moves on.
  utm             { enabled*, source, medium, campaign, content, term }
                  Link tags for the journey's email, as on campaigns; unset follows the workspace.

Examples:
  Rename, guarding against a concurrent edit:
    $ kirora journeys update <id> -d '{"name":"Welcome series (2026)","expectedRevision":1}'

API reference: https://kirora.io/docs/api/reference/updateJourney
```
