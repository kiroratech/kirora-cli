<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora templates

A template is a reusable email design: a document of blocks and a theme, saved as a draft and published as numbered versions.

## kirora templates create

Create an email template. `POST /v1/templates`, needs `templates:write`.

Creates a reusable email design and publishes it as version 1, so a transactional send can use it at once by its `id` or `alias`. An agent key's template stays a draft until a person publishes it.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |
| `--schema-version <number>` | The block format version. Defaults to the current one. |
| `--language <value>` | The language the email is written in, as a BCP 47 tag ("en", "fr-BE", "ar"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to "en". |
| `--plain-text-override <value>` | Plain text sent instead of the version generated from the blocks; `null` clears it. |
| `--alias <value>` | Unique in the workspace; a transactional send may name the template by it in `email.template`. Null clears it. |
| `--tags <values...>` | Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all. |

```text
Body fields only --data can carry (* required):
  blocks*                list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
                         The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.
  theme                  { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }
  transactionalDefaults  { subject, previewText, from, replyTo }
                         The subject, preview text and sender a transactional send of this template uses unless the send gives its own; campaigns and journeys set their own.

Examples:
  A welcome email, created with an integration key: live as version 1:
    $ kirora templates create -d '{"name":"Welcome email","blocks":[{"id":"title","type":"heading","text":"Welcome to Acme Shop","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free."},{"id":"shop","type":"button","text":"Start shopping","href":"https://acme-shop.com"},{"id":"store-footer","type":"shared","sharedBlockId":"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b"},{"id":"footer","type":"footer","text":"{{ org.name }}\n{{ org.address }}","locked":true}],"theme":{"bodyFontFamily":"Arial, sans-serif","headingFontFamily":"Georgia, serif","cardBackgroundColor":"#ffffff","canvasBackgroundColor":"#f4f1ec","textColor":"#1f2933","accentColor":"#b4461f","linkColor":"#b4461f","cardWidth":"600px","cardBorderRadius":"6px","buttonStyle":"solid"},"transactionalDefaults":{"subject":"Welcome to Acme Shop","previewText":"Your first order ships free","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com"},"alias":"welcome","tags":["Onboarding"]}'
  The same email, created with an agent key: a draft until a person publishes it:
    $ kirora templates create -d '{"name":"Welcome email","blocks":[{"id":"title","type":"heading","text":"Welcome to Acme Shop","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free."},{"id":"shop","type":"button","text":"Start shopping","href":"https://acme-shop.com"},{"id":"store-footer","type":"shared","sharedBlockId":"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b"},{"id":"footer","type":"footer","text":"{{ org.name }}\n{{ org.address }}","locked":true}],"theme":{"bodyFontFamily":"Arial, sans-serif","headingFontFamily":"Georgia, serif","cardBackgroundColor":"#ffffff","canvasBackgroundColor":"#f4f1ec","textColor":"#1f2933","accentColor":"#b4461f","linkColor":"#b4461f","cardWidth":"600px","cardBorderRadius":"6px","buttonStyle":"solid"},"transactionalDefaults":{"subject":"Welcome to Acme Shop","previewText":"Your first order ships free","from":"Acme Shop <hello@mail.acme-shop.com>","replyTo":"support@acme-shop.com"},"alias":"welcome","tags":["Onboarding"]}'

API reference: https://kirora.io/docs/api/reference/createTemplate
```

## kirora templates delete <id>

Delete a template. `DELETE /v1/templates/{id}`, needs `templates:write`.

Deletes the template and its versions. Campaigns and journeys built from it are unaffected, since they hold their own copy of the design. A transactional send that names the template by its `id` or `alias` fails with 404 from then on, so check your code's sends before deleting one.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteTemplate
```

## kirora templates duplicate <id>

Duplicate a template. `POST /v1/templates/{id}/duplicate`, needs `templates:write`.

Copies a template's draft (its blocks, theme and `transactionalDefaults`, not its alias) into a new template, published as version 1, as on create. A copy made with an agent key, or of an agent's template, stays a draft until a person publishes it.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | The name of the copy; the original's followed by "copy" when omitted. |

```text
Examples:
  A copy under a new name, live as version 1:
    $ kirora templates duplicate <id> -d '{"name":"Welcome email, spring"}'

API reference: https://kirora.io/docs/api/reference/duplicateTemplate
```

## kirora templates gallery

List sample emails and theme presets. `GET /v1/templates/gallery`, needs `templates:read`.

Lists finished sample emails and coordinated theme presets. Start a template from a sample by creating it with the sample's `theme` and `blocks`; apply a preset by replacing a template's `theme`. Every sample has exactly one `header` block, id `logo`, holding the workspace's logo from its brand profile; without a logo it shows the workspace's name as a wordmark until one is added. The samples' photos are examples to replace, not images to send.

```text
API reference: https://kirora.io/docs/api/reference/getTemplateGallery
```

## kirora templates get <id>

Retrieve a template. `GET /v1/templates/{id}`, needs `templates:read`.

Returns one template including its full block tree and theme.

```text
API reference: https://kirora.io/docs/api/reference/getTemplate
```

## kirora templates list

List templates. `GET /v1/templates`, needs `templates:read`.

Returns templates in this workspace. The list form omits the block tree; retrieve a template individually to get its full content. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the template's name, ignoring case. |
| `--tag <value>` | Only items carrying this tag, its name matched without case. |

```text
API reference: https://kirora.io/docs/api/reference/listTemplates
```

## kirora templates publish <id>

Publish a template. `POST /v1/templates/{id}/publish`, needs `templates:write`.

Makes the draft, its `transactionalDefaults` included, the next version, which transactional sends of the template use from then on, with the brand and shared blocks as they are now. When the draft matches the published version and neither has changed, it publishes nothing and returns the template unchanged. Agent keys are refused with 403: a person publishes.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/publishTemplate
```

## kirora templates render <id>

Render a saved template. `POST /v1/templates/{id}/render`, needs `templates:read`.

Renders a saved template to the subject, HTML and plain text a recipient would get, without sending or changing anything. By default it renders the published version, which is what sends use, drawn with the brand and shared blocks it was published with; pass `"version": "draft"` for the draft as it stands now, or a version number. A template never published is 409 `TEMPLATE_NOT_PUBLISHED` for `published`. Merge tags show their defaults, or pass `contact` to render them as that contact would see them, and `data` for what a send's `data` would carry. `warnings` flags problems that do not stop rendering, such as an oversized message.

- `-d, --data` takes the whole JSON body; flags set fields on top.

```text
Body fields only --data can carry (* required):
  version  one of "published" | "draft" | number
           `published` (the default): what sends use, with the brand and shared blocks it was published with.
  contact  one of { contactId* } | { externalId* } | { email* }
  data     object
           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.

Examples:
  Render what sends use, as one contact would see it:
    $ kirora templates render <id> -d '{"version":"published","contact":{"externalId":"customer-881"}}'
  Render the draft with merge tags at their defaults:
    $ kirora templates render <id> -d '{"version":"draft"}'

API reference: https://kirora.io/docs/api/reference/renderTemplate
```

## kirora templates render-content

Render blocks to email HTML. `POST /v1/templates/render`, needs `templates:read`.

Renders a block tree and theme sent in the request to the HTML and plain text a recipient would get, without saving anything: the builder preview, plain-text view and HTML export. To render a saved template, use `POST /v1/templates/{id}/render`. Merge tags show their defaults, or pass `contact` to render them as that contact would see them (not from an embed session). `warnings` flags problems that do not stop rendering, such as an oversized message, or `POSTAL_ADDRESS_MISSING` while the workspace has no `postalAddress` for the footer.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--schema-version <number>` | The block format version. |
| `--language <value>` | The language the email is written in, as a BCP 47 tag ("en", "fr-BE", "ar"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to "en". |
| `--plain-text-override <value>` | Plain text used instead of the version generated from the blocks. |
| `--subject <value>` | The subject line, returned rendered. |

```text
Body fields only --data can carry (* required):
  blocks*  list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.
  theme    { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }
  contact  one of { contactId* } | { externalId* } | { email* }
  data     object
           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.

Examples:
  Render a design for one contact without saving it:
    $ kirora templates render-content -d '{"blocks":[{"id":"title","type":"heading","text":"Welcome to Acme Shop","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free."},{"id":"shop","type":"button","text":"Start shopping","href":"https://acme-shop.com"},{"id":"store-footer","type":"shared","sharedBlockId":"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b"},{"id":"footer","type":"footer","text":"{{ org.name }}\n{{ org.address }}","locked":true}],"theme":{"bodyFontFamily":"Arial, sans-serif","headingFontFamily":"Georgia, serif","cardBackgroundColor":"#ffffff","canvasBackgroundColor":"#f4f1ec","textColor":"#1f2933","accentColor":"#b4461f","linkColor":"#b4461f","cardWidth":"600px","cardBorderRadius":"6px","buttonStyle":"solid"},"contact":{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"},"subject":"Welcome to Acme Shop"}'

API reference: https://kirora.io/docs/api/reference/renderTemplateContent
```

## kirora templates send-test

Send a test email. `POST /v1/templates/test-send`, needs `templates:write`.

Sends the design in the request to one workspace member who has accepted their invitation; call once per recipient. Pass `contact` to render merge tags as that contact would see them. The test comes from `from`, or the workspace's default sender, on a verified sending domain: there is no shared sender, so a workspace sends tests once its own domain is verified (`SENDING_DOMAIN_UNVERIFIED` before then). Nothing is recorded as a message. An embed session may call this too: a session lets the chosen builders read what they need, render previews, count audiences, upload images and, when `testSendTo` lists addresses, send test emails to those addresses only. It never saves, publishes or sends anything else; your server saves what the builders return. From a session, the test goes only to an address its `testSendTo` names, instead of to a workspace member (400 `VALIDATION_ERROR` for any other).

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--schema-version <number>` | The block format version. |
| `--language <value>` | The language the email is written in, as a BCP 47 tag ("en", "fr-BE", "ar"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to "en". |
| `--plain-text-override <value>` | Plain text used instead of the version generated from the blocks. |
| `--subject <value>` | **Required.** The subject line. |
| `--from <email>` | The address the test comes from, on one of the workspace's verified domains; the workspace's default sender when omitted. |
| `--to <email>` | **Required.** Where to send the test: any member of the workspace who has accepted their invitation. |

```text
Body fields only --data can carry (* required):
  blocks*  list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.
  theme    { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }
  contact  one of { contactId* } | { externalId* } | { email* }
  data     object
           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.

Examples:
  Send a draft to a workspace member, filled in for one contact:
    $ kirora templates send-test -d '{"blocks":[{"id":"title","type":"heading","text":"Welcome to Acme Shop","size":"28px"},{"id":"intro","type":"text","text":"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free."},{"id":"shop","type":"button","text":"Start shopping","href":"https://acme-shop.com"},{"id":"store-footer","type":"shared","sharedBlockId":"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b"},{"id":"footer","type":"footer","text":"{{ org.name }}\n{{ org.address }}","locked":true}],"theme":{"bodyFontFamily":"Arial, sans-serif","headingFontFamily":"Georgia, serif","cardBackgroundColor":"#ffffff","canvasBackgroundColor":"#f4f1ec","textColor":"#1f2933","accentColor":"#b4461f","linkColor":"#b4461f","cardWidth":"600px","cardBorderRadius":"6px","buttonStyle":"solid"},"contact":{"contactId":"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d"},"subject":"Welcome to Acme Shop","to":"owner@acme-shop.com"}'

API reference: https://kirora.io/docs/api/reference/sendTemplateTest
```

## kirora templates update <id>

Update a template. `PATCH /v1/templates/{id}`, needs `templates:write`.

Edits the template's draft. Campaigns and journeys that already copied it keep the content they were built with, and transactional sends keep the published version until `POST /v1/templates/{id}/publish`. `transactionalDefaults` is part of the draft and is published with it: a field left out stays as it is, and `null` clears it.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |
| `--schema-version <number>` | The block format version. |
| `--language <value>` | The language the email is written in, as a BCP 47 tag ("en", "fr-BE", "ar"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to "en". |
| `--plain-text-override <value>` | Plain text sent instead of the version generated from the blocks; `null` clears it. |
| `--alias <value>` | Unique in the workspace; a transactional send may name the template by it in `email.template`. Null clears it. |
| `--tags <values...>` | Replaces the tags whole (`[]` removes them), matched without case. Changing only the tags needs no publish and no confirmation: they change nothing sent. |
| `--expected-revision <number>` | The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there. |

```text
Body fields only --data can carry (* required):
  blocks                 list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
                         The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.
  theme                  { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }
  transactionalDefaults  { subject, previewText, from, replyTo }
                         The subject, preview text and sender a transactional send of this template uses unless the send gives its own; campaigns and journeys set their own.

Examples:
  Change the subject, guarding against a concurrent edit:
    $ kirora templates update <id> -d '{"transactionalDefaults":{"subject":"Welcome to Acme Shop, {{ contact.firstName }}"},"expectedRevision":1}'

API reference: https://kirora.io/docs/api/reference/updateTemplate
```

## kirora templates versions get [template-id] [template-version]

Retrieve a template version. `GET /v1/templates/{id}/versions/{version}`, needs `templates:read`.

Returns one published version of a template with its full content and `transactionalDefaults`, and the shared blocks and brand theme it was published with, to view or compare: two versions with the same blocks can still send different footers.

- Each id is an argument, in order, or a flag: `--template-id`, `--template-version`.

```text
API reference: https://kirora.io/docs/api/reference/getTemplateVersion
```

## kirora templates versions list <id>

List a template's versions. `GET /v1/templates/{id}/versions`, needs `templates:read`.

Lists a template's published versions, newest first, without their content. The newest is the one sends use.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listTemplateVersions
```

## kirora templates versions restore [template-id] [template-version]

Restore a template version. `POST /v1/templates/{id}/versions/{version}/restore`, needs `templates:write`.

Replaces the draft with that version's content and `transactionalDefaults`, discarding unpublished changes, and publishes it as the next version, so the history records the rollback (nothing new when it is already the live content). Agent keys are refused with 403.

- Each id is an argument, in order, or a flag: `--template-id`, `--template-version`.
- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/restoreTemplateVersion
```
