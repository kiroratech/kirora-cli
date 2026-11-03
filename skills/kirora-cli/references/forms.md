<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora forms

A form is a hosted sign-up, contact or waitlist form that creates or updates contacts and records the consent they give.

## kirora forms archive <id>

Archive a form. `POST /v1/forms/{id}/archive`, needs `forms:write`.

Hides the form from the list (`GET /v1/forms` leaves archived forms out unless `archived=true`) and stops it serving: a published form disappears from the sites embedding it. Its status, submissions and contacts stay.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/archiveForm
```

## kirora forms create

Create a form. `POST /v1/forms`, needs `forms:write`.

Creates a hosted form (a sign-up, contact, waitlist or registration form), in draft. Submissions create or update contacts and record the consent configured on the form. Marketing sends check the recorded channel consent; you remain responsible for the permissions your messages require. An agent key may create one; it stays a draft, listed for review, until a person publishes it. The response carries `url`, the hosted link.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |
| `--heading <value>` | What visitors see above the fields; `null` clears it. |
| `--intro <value>` | A line or two under the heading; `null` clears it. |
| `--slug <value>` | The readable part of the form's link (`forms.kirora.io/f/acme-newsletter`), unique across every workspace; `null` clears it. A new slug frees the old one, which then stops working; the link with `publicId` always works, so use that one on print and QR codes. |
| `--accepting-submissions`, `--no-accepting-submissions` | `false` closes the form by hand, whatever its closing time and limit. |
| `--closes-at <date-time>` | When the form closes; `null` for never. |
| `--max-submissions <number>` | The form closes once it has taken this many submissions (honeypot catches aside); `null` for no limit. |
| `--closed-message <value>` | What a closed form shows; `null` shows the default wording. |
| `--location <value>` | Where the form sits on your site, a label you choose (`website-footer`, `checkout-page`). Recorded on each submission, as `properties.location` on its `contact.form_submitted` event and on the `form.submitted` webhook, which is how a segment or journey uses it. Defaults to `form`. |
| `--list-id <id>` | The list every submitter is added to; `null` while the draft has none. A form cannot be published without one. |
| `--allowed-origins <urls...>` | Site origins (scheme and host, no path) the embed may load from, such as `https://example.com`. |
| `--double-opt-in`, `--no-double-opt-in` | Ask submitters to confirm by email before they are subscribed. |
| `--notify-user-ids <ids...>` | Users of this workspace to tell about each submission, in the bell and by email (each can turn the email off). Each must be a user here. |

```text
Body fields only --data can carry (* required):
  share         { title, description, imageUrl }
                How the form's link previews in chat and social apps.
  fields*       list of { key*, type*, label*, placeholder, required, options }
                The fields, top to bottom.
  hiddenFields  object
                Values saved on each submitter with no field shown, each a contact attribute: fixed (`{ "source": "fixed", "value": "spring" }`), or taken from the link (`{ "source": "link", "param": "utm_campaign" }`).
  theme         { mode, accentColor, backgroundColor, textColor, buttonColor, buttonTextColor, fontFamily, borderRadius, buttonLabel, inputs, button, layout }
  display       one of { mode*: "inline" } | { mode*: "popup", delay, scrollPercent, exitIntent, urlMatch, hideFor, hideAfterSubmit }
  captcha       one of { mode*: "kirora" } | { mode*: "own", siteKey*, secretKey }
                CAPTCHA for submissions: `{ mode: "kirora" }` (the default on a new form), `{ mode: "own", siteKey, secretKey }` for your Cloudflare Turnstile widget, or `null` for none.
  consent*      { required*: true, label* }
                The consent box every submitter must tick.
  success       one of { type*: "message", message* } | { type*: "redirect", redirectUrl* }
                What happens after a submission.

Examples:
  A newsletter signup with double opt-in:
    $ kirora forms create -d '{"name":"Newsletter signup","heading":"Join the Acme Shop newsletter","intro":"New arrivals and offers, once a week.","location":"website-footer","slug":"acme-newsletter","share":{"title":"Get the Acme Shop newsletter"},"hiddenFields":{"signup_campaign":{"source":"link","param":"utm_campaign"}},"listId":"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e","fields":[{"key":"email","type":"email","label":"Email address","placeholder":"you@example.com","required":true},{"key":"firstName","type":"text","label":"First name","required":false}],"allowedOrigins":["https://acme-shop.com"],"doubleOptIn":true,"notifyUserIds":[],"theme":{"accentColor":"#b4461f","fontFamily":"sans","buttonLabel":"Subscribe"},"consent":{"required":true,"label":"I agree to receive emails from Acme Shop and can unsubscribe at any time."},"success":{"type":"message","message":"Thanks. Check your inbox to confirm."}}'

API reference: https://kirora.io/docs/api/reference/createForm
```

## kirora forms delete <id>

Delete a form. `DELETE /v1/forms/{id}`, needs `forms:write`.

Deletes the form and stops accepting submissions for it. Contacts already created through it are not affected. Refused with 409 `IN_USE` while an active or paused journey names it (its trigger, an exit or a step), listing those journeys in `details.journeys`: end them, or edit them, first.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteForm
```

## kirora forms get <id>

Retrieve a form. `GET /v1/forms/{id}`, needs `forms:read`.

Returns one form including its field and consent configuration.

```text
API reference: https://kirora.io/docs/api/reference/getForm
```

## kirora forms list

List forms. `GET /v1/forms`, needs `forms:read`.

Returns forms in this workspace, leaving archived ones out unless `archived=true`. Pass `status` to list only forms in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the form's name, ignoring case. |
| `--status <value>` | Only forms in this status. One of `draft`, `published`. |
| `--archived <value>` | `true` lists archived forms only; unset or `false` leaves them out. One of `true`, `false`. |

```text
API reference: https://kirora.io/docs/api/reference/listForms
```

## kirora forms metrics <id>

Retrieve a form's metrics. `GET /v1/forms/{id}/metrics`, needs `forms:read`.

Returns a form's submissions by outcome, views and the submit rate over the window (the last 30 days unless `from` and `to` say otherwise), split by where visitors came from (`byTrafficSource`) and how the form showed (`byPlacement`).

| Flag | |
| --- | --- |
| `--from <date|date-time>` | Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. A date-time falls on a quarter hour, since views are counted per quarter hour. |
| `--to <date|date-time>` | End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`. |

```text
API reference: https://kirora.io/docs/api/reference/getFormMetrics
```

## kirora forms publish <id>

Publish a form. `POST /v1/forms/{id}/publish`, needs `forms:write`.

Puts the form live: its link (`url`) and embeds take submissions, adding each submitter to its list. It needs a list (409 `DRAFT_INCOMPLETE` at `listId`). Publishing a published form returns it. Agent keys are refused with 403 `AGENT_KEY_REFUSED`: a person puts a form live.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/publishForm
```

## kirora forms submissions list <id>

List a form's submissions. `GET /v1/forms/{id}/submissions`, needs `contacts:read`.

Lists every submission of the form, newest first, with the contact it created or updated as that contact is now; `outcome` narrows the list. Reading them needs `contacts:read`, since each names a person.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--outcome <value>` | Only submissions with this outcome. One of `created`, `updated`, `honeypot`, `pending`, `expired`. |

```text
API reference: https://kirora.io/docs/api/reference/listFormSubmissions
```

## kirora forms submissions submit <id>

Submit a form. `POST /v1/forms/{id}/submissions`, needs `contacts:write`.

Submits a double opt-in form for a person your own system signs up: the answers go through the form's fields as a visitor's would, the contact is recorded without consent, and Kirora emails them the form's confirmation link; consent, lists and topics follow when they confirm. Only a published, unarchived double opt-in form with a list takes it: any other answers 409 `CONFLICT` saying which. An address gets at most one confirmation per form per day. Answers are checked as the form checks them (400). Each call is a new sign-up that counts toward the form's limit, so send an `Idempotency-Key` to retry safely. A plain server sign-up with consent goes through `POST /v1/contacts/identify` with a consent `statement`. Agent keys are refused with 403.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

```text
Body fields only --data can carry (* required):
  fields*  object
           Answers by field `key`.
  choices  object
           Each checkbox field's ticked option values, by field `key`.

Examples:
  Sign up a person your system collected; they confirm by email:
    $ kirora forms submissions submit <id> -d '{"fields":{"email":"amaka@example.com","firstName":"Amaka"}}'

API reference: https://kirora.io/docs/api/reference/submitForm
```

## kirora forms unarchive <id>

Unarchive a form. `POST /v1/forms/{id}/unarchive`, needs `forms:write`.

Returns an archived form to the list. A form that was published is live again at once, so an agent key cannot unarchive a published form (403 `AGENT_KEY_REFUSED`). One whose list, or a list its `lists` field offers, was deleted while it was archived comes back as a `draft`: choose its lists and publish it again.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/unarchiveForm
```

## kirora forms unpublish <id>

Unpublish a form. `POST /v1/forms/{id}/unpublish`, needs `forms:write`.

Sets the form back to `draft`: its link and embeds stop taking submissions until it is published again. Its submissions and contacts stay. Unpublishing a draft returns it. Agent keys are refused with 403 `AGENT_KEY_REFUSED`.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/unpublishForm
```

## kirora forms update <id>

Update a form. `PATCH /v1/forms/{id}`, needs `forms:write`.

Changes a form's fields, consent text or success behaviour. Existing submissions are not revisited. Publishing is its own call, `POST /v1/forms/{id}/publish`. An agent key edits drafts only: it cannot change a published form (403 `AGENT_KEY_REFUSED`), since a live form signs people up into its list and topics at once. A person unpublishes it before an agent edits it.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |
| `--heading <value>` | What visitors see above the fields; `null` clears it. |
| `--intro <value>` | A line or two under the heading; `null` clears it. |
| `--slug <value>` | The readable part of the form's link (`forms.kirora.io/f/acme-newsletter`), unique across every workspace; `null` clears it. A new slug frees the old one, which then stops working; the link with `publicId` always works, so use that one on print and QR codes. |
| `--accepting-submissions`, `--no-accepting-submissions` | `false` closes the form by hand, whatever its closing time and limit. |
| `--closes-at <date-time>` | When the form closes; `null` for never. |
| `--max-submissions <number>` | The form closes once it has taken this many submissions (honeypot catches aside); `null` for no limit. |
| `--closed-message <value>` | What a closed form shows; `null` shows the default wording. |
| `--location <value>` | Where the form sits on your site, a label you choose (`website-footer`, `checkout-page`). Recorded on each submission, as `properties.location` on its `contact.form_submitted` event and on the `form.submitted` webhook, which is how a segment or journey uses it. |
| `--list-id <id>` | The list every submitter is added to; `null` clears it, which only a draft may. |
| `--allowed-origins <urls...>` | Site origins (scheme and host, no path) the embed may load from. |
| `--double-opt-in`, `--no-double-opt-in` | Ask submitters to confirm by email before they are subscribed. |
| `--notify-user-ids <ids...>` | Users of this workspace to tell about each submission, in the bell and by email (each can turn the email off). Each must be a user here. |

```text
Body fields only --data can carry (* required):
  share         { title, description, imageUrl }
                How the form's link previews in chat and social apps.
  fields        list of { key*, type*, label*, placeholder, required, options }
                The fields, top to bottom.
  hiddenFields  object
                Values saved on each submitter with no field shown: fixed, or taken from the link.
  theme         { mode, accentColor, backgroundColor, textColor, buttonColor, buttonTextColor, fontFamily, borderRadius, buttonLabel, inputs, button, layout }
  display       one of { mode*: "inline" } | { mode*: "popup", delay, scrollPercent, exitIntent, urlMatch, hideFor, hideAfterSubmit }
  captcha       one of { mode*: "kirora" } | { mode*: "own", siteKey*, secretKey }
                CAPTCHA for submissions: `{ mode: "kirora" }` (the default on a new form), `{ mode: "own", siteKey, secretKey }` for your Cloudflare Turnstile widget, or `null` for none.
  consent       { required*: true, label* }
                The consent box every submitter must tick.
  success       one of { type*: "message", message* } | { type*: "redirect", redirectUrl* }
                What happens after a submission.

Examples:
  Change the heading visitors see:
    $ kirora forms update <id> -d '{"heading":"Get 10% off your first order"}'

API reference: https://kirora.io/docs/api/reference/updateForm
```
