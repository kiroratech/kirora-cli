<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora contacts

A contact is one person you can message, with their profile, custom attributes, consent on each channel and topic choices.

## kirora contacts consent-changes <id>

List a contact's consent changes. `GET /v1/contacts/{id}/consent-changes`, needs `contacts:read`.

Lists every grant and withdrawal of consent for this contact, per channel or per topic, newest first: where it came from (dashboard, API, import, form, unsubscribe link), who made it, and the IP it came from. Append-only. It tells apart a contact never asked from one who withdrew, which both read as `false` in `consent`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactConsentChanges
```

## kirora contacts delete <id>

Delete a contact. `DELETE /v1/contacts/{id}`, needs `contacts:delete`.

Deletes one contact and its data, for a right-to-erasure request: its events, list memberships, consent changes and journey enrollments go with it. Journey messages go with the enrollments; campaign and transactional messages are kept for campaign totals but anonymised: the address, content and provider ids are removed and nothing links them to the person. Address suppressions are kept, so a deleted address that is imported again is still not mailed. While a message to the contact is being handed to the provider, which takes seconds, it answers 409 `CONTACT_SEND_IN_PROGRESS`; retry shortly. A message waiting to be retried is skipped (`contact_deleted`) instead; a push that already reached one of the contact's devices is marked `sent`, and one a push service refused is marked `failed`, as it would have ended anyway. It cannot be undone. Requires `contacts:delete`; agent keys are refused.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/deleteContact
```

## kirora contacts delete-many

Delete contacts. `POST /v1/contacts/delete`, needs `contacts:delete`.

Deletes up to 100 contacts, each named by `contactId`, `externalId` or `email`, and reports an outcome per contact. For each one deleted, its events, list memberships, consent changes and journey enrollments go with it. Journey messages go with the enrollments; campaign and transactional messages are kept for campaign totals but anonymised: the address, content and provider ids are removed and nothing links them to the person. Address suppressions are kept, so a deleted address that is imported again is still not mailed. `send_in_progress` means a message was being handed to the provider; retry that one shortly. Requires `contacts:delete`; agent keys are refused.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.
- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
Body fields only --data can carry (* required):
  contacts*  list of one of { contactId* } | { externalId* } | { email* }

Examples:
  Delete two contacts:
    $ kirora contacts delete-many -d '{"contacts":[{"email":"amaka@example.com"},{"externalId":"customer-0000"}]}'

API reference: https://kirora.io/docs/api/reference/deleteContacts
```

## kirora contacts events <id>

List a contact's events. `GET /v1/contacts/{id}/events`, needs `events:read`.

Lists the events tracked against this contact, newest first, by when they happened: accepted events only, in the same shape as the event log. Events past the retention period are gone and not listed.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--name <value>` | Only events of this name. |
| `--occurred-after <date-time>` | Only events that happened at or after this time (inclusive). |
| `--occurred-before <date-time>` | Only events that happened before this time (exclusive). |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactEvents
```

## kirora contacts export <id>

Export a contact's data. `GET /v1/contacts/{id}/export`, needs `contacts:read`.

Returns everything held about one contact, for answering a right-of-access request: profile, consent changes, events, messages, lists, segments, topics, journeys, push devices (without tokens), form submissions, conversions and suppressions. Data past the retention periods is no longer held, so it is not included. The response is streamed as it is read, so a long history arrives without a length. Each export is recorded in the audit log.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/getContactExport
```

## kirora contacts get <id>

Retrieve a contact. `GET /v1/contacts/{id}`, needs `contacts:read`.

Returns one contact, including its current email suppression state.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/getContact
```

## kirora contacts identify

Create or update a contact. `POST /v1/contacts/identify`, needs `contacts:write`.

Creates or updates a contact, matched by `externalId`, then `email`, then `phone` rather than by id, and created if none matches. A write whose lower-ranked identifier matches a contact that holds a different value for a higher-ranked one (a phone matching a contact with another email) names two people and is refused with 409 `CONFLICT`, `details.field` the identifier that differs. Consent flags that are omitted keep their current value rather than resetting to false. Granting consent, on a channel or (in `topics`) a topic, needs `consent.statement`, how the contact agreed; without it the write is refused with 400 `VALIDATION_ERROR` at `consent.statement`. Withdrawing needs none. `attributes` merge as on update: `null` removes a key. `topics` sets topic choices in the same write, each recorded in consent changes as `PUT /v1/contacts/{id}/topics/{topicId}` records it. `lists` adds the contact to lists by name, creating a list that does not exist yet; joining one starts any journey triggered by joining it. This is the endpoint to use for ingestion. Agent keys are refused with 403.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--external-id <id>` | Your own id for the contact, up to 255 characters. Identify matches on it first. |
| `--email <email>` |  |
| `--first-name <value>` |  |
| `--last-name <value>` |  |
| `--phone <value>` | Phone number; normalised to E.164 (a leading `+` and country code). |
| `--timezone <value>` | IANA timezone, e.g. `Europe/London`; used for send-time scheduling. |
| `--country <value>` | ISO 3166-1 alpha-2 code. Omitted, it is inferred from the phone, else the timezone. |
| `--locale <value>` | BCP 47 tag (`fr`, `fr-CA`), stored canonical: the language the contact reads, and how merge tags format numbers, dates and money for them. |
| `--lists <values...>` | Names of lists to add the contact to, up to 20, matched without case; a list the workspace lacks is created. Adds only: the contact stays in the lists it is already in. |

```text
Body fields only --data can carry (* required):
  dates       object
  attributes  object
              Custom attributes, merged key by key; `null` removes one.
  consent     { email, push, statement }
  topics      object
              Topic choices keyed by topic id, at most 50, as `PUT /v1/contacts/{id}/topics/{topicId}` sets them: `true` or `false` for every channel, or `{ "email": …, "push": … }` per channel.

Examples:
  By your own id, with consent:
    $ kirora contacts identify -d '{"externalId":"customer-4821","email":"amaka@example.com","firstName":"Amaka","lastName":"Obi","phone":"+2348031234567","timezone":"Africa/Lagos","dates":{"birthday":"1992-03-14"},"attributes":{"plan":"pro","favourite_spice":"smoked paprika","orders":3},"consent":{"email":true,"statement":{"basis":"opted_in","evidence":"Checkout opt-in on shop.example.com"}}}'
  With topic choices:
    $ kirora contacts identify -d '{"externalId":"customer-4821","topics":{"0192f3b0-6a1b-7c2d-8e3f-4a5b6c7d8e9f":{"email":true,"push":false}}}'
  By email address only:
    $ kirora contacts identify -d '{"email":"amaka@example.com","attributes":{"orders":3}}'

API reference: https://kirora.io/docs/api/reference/identifyContact
```

## kirora contacts identify-batch

Identify contacts in a batch. `POST /v1/contacts/batch`, needs `contacts:write`.

Creates or updates up to 100 contacts in one request, each resolved and written exactly as `POST /v1/contacts/identify` would, in order. One contact refused, an invalid one included, does not stop the rest: its entry carries the error a single identify would have returned, a 400 `VALIDATION_ERROR` naming the field for a contact that does not validate. Only a body that is not 1 to 100 contacts is refused whole. Draws on the high-volume rate budget, shared with transactional sends, as one request per contact; for a larger sync, send several batches. Agent keys are refused with 403.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

```text
Body fields only --data can carry (* required):
  contacts*  list of one of { externalId* } | { email* } | { phone* }

Examples:
  One contact updated, two refused, each in its own result:
    $ kirora contacts identify-batch -d '{"contacts":[{"externalId":"customer-4821","email":"amaka@example.com","firstName":"Amaka","topics":{"0192f3b0-6a1b-7c2d-8e3f-4a5b6c7d8e9f":true}},{"externalId":"customer-9999","email":"amaka@example.com"},{"externalId":"customer-5310","email":"tunde@example.com","consent":{"email":true}}]}'

API reference: https://kirora.io/docs/api/reference/identifyContactsBatch
```

## kirora contacts installations delete [contact-id] [external-installation-id]

Delete a push installation. `DELETE /v1/contacts/{id}/installations/{externalInstallationId}`, needs `contacts:write`.

Stops push to the device you registered as `externalInstallationId` for this contact, in every push app it registered with, as the SDK does on sign-out. Use it on sign-out, or when the device reports its token is no longer valid. The record is kept, marked `active: false`, so `listPushInstallations` still shows it; registering the device again turns it back on. To delete a person's data, delete the contact (`deleteContact`). A device the contact never registered is a 404.

- Each id is an argument, in order, or a flag: `--contact-id`, `--external-installation-id`.
- Without a terminal it needs `--yes`: only for a deletion the user asked for.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/deletePushInstallation
```

## kirora contacts installations list <id>

List a contact's push installations. `GET /v1/contacts/{id}/installations`, needs `contacts:read`.

Lists the devices and browsers registered against a contact, newest first, including inactive ones (`active: false` after a sign-out, a refused permission, or a provider reporting the device gone). The device token or browser subscription is never returned.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listPushInstallations
```

## kirora contacts installations register <id>

Register a push installation. `POST /v1/contacts/{id}/installations`, needs `contacts:write`.

Registers a device or browser subscription against a contact so push can reach it. Re-registering the same token updates the existing installation rather than creating a duplicate. With `idType=externalId`, `{id}` is your own id for the contact, so a backend that knows only its user id can register a device without looking the contact up first. A revoked permission is reported as `{ pushAppId, externalInstallationId, permission: "denied", lastSeenAt }` with the `lastSeenAt` of the latest registration; if the device registered again since, the report is refused with 409 `CONFLICT`, and an installation never registered is 404. Returns 201 when the installation is new and 200 when it was already registered.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
The body (--data) is one of:
  { pushAppId*, externalInstallationId*, permission*, targetKind*, target* }
  { pushAppId*, externalInstallationId*, permission*, targetKind*: "web_push_subscription", subscription* }
  { pushAppId*, externalInstallationId*, permission*: "denied", lastSeenAt* }

Examples:
  An iPhone with its APNs token:
    $ kirora contacts installations register <id> -d '{"pushAppId":"0192f3d0-4b5c-7d6e-8f70-1a2b3c4d5e6f","externalInstallationId":"device-amaka-iphone","permission":"granted","targetKind":"apns_token","target":"740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad"}'
  A browser web push subscription:
    $ kirora contacts installations register <id> -d '{"pushAppId":"0192f3d0-4b5c-7d6e-8f70-1a2b3c4d5e6f","externalInstallationId":"browser-amaka-chrome","permission":"granted","targetKind":"web_push_subscription","subscription":{"endpoint":"https://fcm.googleapis.com/fcm/send/dXNlci1zdWJzY3JpcHRpb24","expirationTime":null,"keys":{"p256dh":"BAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc","auth":"CQkJCQkJCQkJCQkJCQkJCQ"}}}'

API reference: https://kirora.io/docs/api/reference/registerPushInstallation
```

## kirora contacts journeys <id>

List a contact's journey enrollments. `GET /v1/contacts/{id}/journeys`, needs `journeys:read`.

Lists every journey enrollment of this contact, newest first: `active` while it is still moving through the steps, `completed` at the end, `exited` when it left early, with `exitReason` saying why. Pass `status=active` for the journeys they are in now.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--status <value>` | Only enrollments in this status: `active` for the journeys they are in now. One of `active`, `completed`, `exited`. |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactJourneys
```

## kirora contacts list

List contacts. `GET /v1/contacts`, needs `contacts:read`.

Returns contacts in this workspace. To read one contact by its email address or your own id, use `GET /v1/contacts/{id}` with `idType`. `query` searches: it matches any part of the email address or name, ignoring case. `consent`, `suppressed`, `listId`, `segmentId`, `createdAfter` (inclusive) and `createdBefore` (exclusive) narrow the list and combine with each other and with `query`; an unknown list or segment is a 404. Each item is shaped like a single contact read: it carries its email suppression and the lists it is in (`listIds`). `meta.count` counts every contact matching the filters, up to 10000: beyond that it reports the cap and `meta.countExact` is `false`; both are counted on the first page only (null with a `cursor`). Results are newest first and cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Searches any part of the email address or name, ignoring case and accents in any script. |
| `--consent <value>` | Comma-separated channels, e.g. `email,push`: consent granted on each. |
| `--suppressed <value>` | Whether email to the contact, or to its address, is suppressed. One of `true`, `false`. |
| `--list-id <id>` | Only members of this list. |
| `--segment-id <id>` | The segment's members as stored at its last background sweep, so a contact that matches only since then is not in it yet. For the live answer, list the segment's contacts (`GET /v1/segments/{id}/contacts`). |
| `--created-after <date-time>` | Only contacts created at or after this time (inclusive). |
| `--created-before <date-time>` | Only contacts created before this time (exclusive). |

```text
API reference: https://kirora.io/docs/api/reference/listContacts
```

## kirora contacts lists <id>

List a contact's lists. `GET /v1/contacts/{id}/lists`, needs `contacts:read`.

Returns the lists one contact belongs to, with the time each membership began. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactLists
```

## kirora contacts merge <id>

Merge a contact into another. `POST /v1/contacts/{id}/merge`, needs `contacts:write`.

Merges this contact, a duplicate, into the one `keep` names, for one person recorded twice. The kept contact keeps its values and gains any the duplicate had that it lacks: identifiers, name, timezone, country, locale, and attributes and dates by key. An email address or phone it gains brings that channel's consent with it; its own consent otherwise stands. The duplicate's messages, events, conversions, devices and consent changes move to the kept contact; its lists and suppressions are added, and its topic choices fill in topics the kept contact has not chosen. Then the duplicate is deleted, ending its journey enrollments. It cannot be undone. While a message to either is being handed to the provider, which takes seconds, it returns 409 `CONTACT_SEND_IN_PROGRESS`; retry shortly. A message waiting to be retried moves to the kept contact and still sends; the duplicate's copy of a campaign both received is skipped (`contact_deleted`) instead; a push that already reached one of the duplicate's devices is marked `sent`, and one a push service refused is marked `failed`, as it would have ended anyway. A `keep` that names no contact is a 404, and merging a contact into itself a 400 at `keep`.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
Body fields only --data can carry (* required):
  keep*  one of { contactId* } | { externalId* } | { email* }

Examples:
  Merge an email-only duplicate into Amaka:
    $ kirora contacts merge <id> -d '{"keep":{"externalId":"customer-4821"}}'

API reference: https://kirora.io/docs/api/reference/mergeContacts
```

## kirora contacts messages <id>

List a contact's messages. `GET /v1/contacts/{id}/messages`, needs `messages:read`.

Lists every message sent or attempted to this contact, from any source, newest first, with its outcome. Filter by `status`, `channel` or `messageType`; `createdAfter` (inclusive) and `createdBefore` (exclusive) bound when each was accepted.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--status <value>` | Only messages in this status. One of `queued`, `sending`, `skipped`, `sent`, `failed`, `delivered`, `bounced`, `complained`. |
| `--channel <value>` | Only messages on this channel. One of `email`, `push`. |
| `--message-type <value>` | Only messages of this type: `marketing` or `transactional`. One of `marketing`, `transactional`. |
| `--created-after <date-time>` | Only messages accepted at or after this time (inclusive). |
| `--created-before <date-time>` | Only messages accepted before this time (exclusive). |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactMessages
```

## kirora contacts segments <id>

List a contact's segments. `GET /v1/contacts/{id}/segments`, needs `contacts:read`.

Lists the segments the contact is in, newest entry first, from the stored membership the background evaluation keeps about every 15 minutes: the same answer as `GET /v1/contacts?segmentId=` and the `contact.entered_segment` events, up to about 15 minutes behind a live evaluation. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the segment's name, ignoring case. |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactSegments
```

## kirora contacts topics list <id>

List a contact's topics. `GET /v1/contacts/{id}/topics`, needs `contacts:read`.

Lists every topic, with whether it reaches this contact.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
API reference: https://kirora.io/docs/api/reference/listContactTopics
```

## kirora contacts topics set [contact-id] [topic-id]

Set a contact's topic choice. `PUT /v1/contacts/{id}/topics/{topicId}`, needs `contacts:write`.

Joins a contact to a topic or removes them from it, in the shape identify's `topics` takes: `subscribed: true` or `false` holds for every channel and clears channel choices; `{ "email": true, "push": false }` sets each channel named and leaves the others (keep Product updates by email, not by push). Never an agent key, as for consent. Each change is recorded in consent changes with the member or key as actor. Joining on any channel needs `statement`, how the contact agreed, recorded as the proof; without it the request is refused with 400 `VALIDATION_ERROR` at `statement`. Leaving needs none.

- Each id is an argument, in order, or a flag: `--contact-id`, `--topic-id`.
- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |

```text
Body fields only --data can carry (* required):
  subscribed*  one of true/false | object
  statement    { basis*, evidence*, consentedAt, wording }

Examples:
  Join by email, not by push:
    $ kirora contacts topics set <contact-id> <topic-id> -d '{"subscribed":{"email":true,"push":false},"statement":{"basis":"opted_in","evidence":"Preference centre"}}'
  Leave on every channel:
    $ kirora contacts topics set <contact-id> <topic-id> -d '{"subscribed":false}'

API reference: https://kirora.io/docs/api/reference/setContactTopic
```

## kirora contacts update <id>

Update a contact. `PATCH /v1/contacts/{id}`, needs `contacts:write`.

Merges the supplied fields into an existing contact; omitted fields are left alone, and `attributes` is merged key by key rather than replaced; a key set to `null` is removed (JSON Merge Patch). Granting consent, on a channel or a topic, needs `consent.statement`, how the contact agreed; without it the write is refused with 400 `VALIDATION_ERROR` at `consent.statement`. Agent keys cannot mutate contacts or consent and are refused with 403.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--id-type <value>` | What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case). One of `id`, `externalId`, `email`. |
| `--external-id <id>` | Your own id for the contact, up to 255 characters. Identify matches on it first. |
| `--email <email>` |  |
| `--first-name <value>` |  |
| `--last-name <value>` |  |
| `--phone <value>` | Phone number; normalised to E.164 (a leading `+` and country code). |
| `--timezone <value>` | IANA timezone, e.g. `Europe/London`; used for send-time scheduling. |
| `--country <value>` | ISO 3166-1 alpha-2 code. Omitted, it is inferred from the phone, else the timezone. |
| `--locale <value>` | BCP 47 tag (`fr`, `fr-CA`), stored canonical: the language the contact reads, and how merge tags format numbers, dates and money for them. |

```text
Body fields only --data can carry (* required):
  dates       object
  attributes  object
              Custom attributes, merged key by key; `null` removes one.
  consent     { email, push, statement }

Examples:
  Change a name and an attribute:
    $ kirora contacts update <id> -d '{"lastName":"Obi","attributes":{"plan":"pro"}}'

API reference: https://kirora.io/docs/api/reference/updateContact
```
