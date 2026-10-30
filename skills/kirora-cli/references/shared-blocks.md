<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora shared-blocks

A shared block is a block kept once and placed in many templates, such as a footer or a product card.

## kirora shared-blocks create

Create a shared block. `POST /v1/shared-blocks`, needs `templates:write`.

Creates a shared block. A shared block (a footer, a product card) is kept once and placed in emails as a `shared` block naming it. Template drafts and draft campaigns and journeys show its current content; publishing a template, scheduling or sending a campaign and activating a journey keep it as it was then. A placement with `override` shows its own blocks instead: the editor marks it edited and can push it back (update the shared block, then drop the override) or revert it (drop the override).

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** |

```text
Body fields only --data can carry (* required):
  blocks*  list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.

Examples:
  A footer note to reuse across emails:
    $ kirora shared-blocks create -d '{"name":"Footer note","blocks":[{"id":"footer-note","type":"text","text":"Acme Shop, 12 Market Street, Lagos. Questions? Reply to this email.","align":"center"}]}'

API reference: https://kirora.io/docs/api/reference/createSharedBlock
```

## kirora shared-blocks delete <id>

Delete a shared block. `DELETE /v1/shared-blocks/{id}`, needs `templates:write`.

Deletes a shared block. Refused with 409 `IN_USE`, its `details` the usage, while a template, an unsent campaign or a journey not ended places it.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteSharedBlock
```

## kirora shared-blocks get <id>

Retrieve a shared block. `GET /v1/shared-blocks/{id}`, needs `templates:read`.

Returns one shared block with its content.

```text
API reference: https://kirora.io/docs/api/reference/getSharedBlock
```

## kirora shared-blocks list

List shared blocks. `GET /v1/shared-blocks`, needs `templates:read`.

Lists the workspace's shared blocks, without their content: retrieve one for its `blocks`. A shared block (a footer, a product card) is kept once and placed in emails as a `shared` block naming it. Template drafts and draft campaigns and journeys show its current content; publishing a template, scheduling or sending a campaign and activating a journey keep it as it was then. A placement with `override` shows its own blocks instead: the editor marks it edited and can push it back (update the shared block, then drop the override) or revert it (drop the override).

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listSharedBlocks
```

## kirora shared-blocks update <id>

Update a shared block. `PATCH /v1/shared-blocks/{id}`, needs `templates:write`.

Renames a shared block or replaces its content. New content shows at once in template drafts and in campaigns and journeys not yet scheduled or activated. Published templates keep the content they froze until they are published again, and scheduled campaigns and active journeys keep theirs: a footer change never alters a live email by itself. `GET /v1/shared-blocks/{id}/usage` lists where it is placed, with each template's `hasUnpublishedChanges`, so the templates that now need publishing are one call away.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` |  |

```text
Body fields only --data can carry (* required):
  blocks  list of one of { id*, type*: "header", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "heading", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: "text", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "image", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: "button", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: "divider", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: "spacer", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: "columns", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "columns3", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: "imagetext", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: "imagegroup", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: "boxed", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: "quote", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: "list", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "product", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: "video", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: "social", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: "menu", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: "html", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: "section", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: "footer", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: "repeat", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: "shared", style, visibleIfPresent, showOn, sharedBlockId*, override }
          The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.

Examples:
  Rename the block:
    $ kirora shared-blocks update <id> -d '{"name":"Store footer"}'

API reference: https://kirora.io/docs/api/reference/updateSharedBlock
```

## kirora shared-blocks usage <id>

Retrieve a shared block's usage. `GET /v1/shared-blocks/{id}/usage`, needs `templates:read`.

Returns where a shared block is placed: templates, campaigns not yet sent and journeys not ended, each list at most 50 long, with `hasMore` when one is longer. A template's `hasUnpublishedChanges` says whether its sends still show an older content: publish it to bring them this one. Sent campaigns kept it as it was.

```text
API reference: https://kirora.io/docs/api/reference/getSharedBlockUsage
```
