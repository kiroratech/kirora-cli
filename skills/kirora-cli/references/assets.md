<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora assets

An asset is an image you upload for a template's image blocks, served from a public URL.

## kirora assets delete <id>

Delete an asset. `DELETE /v1/assets/{id}`, needs `templates:write`.

Removes the image from the library and deletes its file, which frees its bytes from the storage limit. Email loads an image from its address, so deletion is refused with 409 `IN_USE` while a template (its draft or any published version), a shared block, a campaign or journey in any status, a journey enrollment in progress, an unsent transactional message, or the workspace brand uses it. `details` is the `AssetUsage` of `GET /v1/assets/{id}/usage`, each use with `locked`: true where no edit or delete can free the image (a sent campaign keeps it for as long as the campaign exists), false where changing or removing that use frees it. An image in use stays, and counts toward storage, until nothing uses it. Uses are found by the image id in the address, including inside raw HTML and CSS. Messages already sent with inline content through the API cannot be checked. The check is not serialised against saves: a save landing within milliseconds of the delete can still reference the removed image. Agent keys may delete images.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteAsset
```

## kirora assets import

Copy an image into the library. `POST /v1/assets/import`, needs `templates:write`.

Copies the image at a public address into this workspace, checked as an upload is (PNG, JPEG or GIF, at most 2 MB and 25 megapixels), so an email never depends on another site keeping it: images hosted where your email was made before, a logo from your site, or a video block's thumbnail (a YouTube or Vimeo page's address copies its thumbnail). Only public addresses are reached; anything that is not such an image is a 400.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--url <url>` | **Required.** A public PNG, JPEG or GIF of at most 2 MB, such as a logo on your current site; or a YouTube or Vimeo video page, whose thumbnail is copied. |
| `--name <value>` | The name the library shows, up to 200 characters; the file's name when omitted. |

```text
Examples:
  Copy a logo from where it is hosted now:
    $ kirora assets import -d '{"url":"https://acme-shop.com/images/acme-logo.png","name":"Acme logo"}'

API reference: https://kirora.io/docs/api/reference/importAsset
```

## kirora assets list

List assets. `GET /v1/assets`, needs `templates:read`.

Lists the files uploaded or copied into this workspace for email content, newest first; `query` matches part of the name or the file name. Place one in a template by its `url`.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Part of the name or the file name, ignoring case. |

```text
API reference: https://kirora.io/docs/api/reference/listAssets
```

## kirora assets update <id>

Rename an asset. `PATCH /v1/assets/{id}`, needs `templates:write`.

Changes the name the library shows. The file, its `filename` and its `url` stay as they are, so emails using it are unaffected.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--name <value>` | **Required.** The name the library shows. |

```text
Examples:
  Rename it in the library; its address stays:
    $ kirora assets update <id> -d '{"name":"Acme logo, dark"}'

API reference: https://kirora.io/docs/api/reference/updateAsset
```

## kirora assets upload

Upload an image. `POST /v1/assets`, needs `templates:write`.

Uploads one PNG, JPEG or GIF of at most 2 MB and 25 megapixels for image blocks, as a multipart part named `file`, with an optional `name` for the library (the file's name otherwise). The request sample shows a complete upload. The returned `url` is public and stable, so it can go straight into a template. A retry with the same `Idempotency-Key` and the same file replays the first response; a different file under that key is 409 `IDEMPOTENCY_KEY_REUSED`.

- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--file <path>` | **Required.** A PNG, JPEG or GIF of at most 2097152 bytes. |
| `--name <value>` | The name the library shows, up to 200 characters; the file's name when omitted. |

```text
API reference: https://kirora.io/docs/api/reference/uploadAsset
```

## kirora assets usage <id>

Retrieve an asset's usage. `GET /v1/assets/{id}/usage`, needs `templates:read`.

Everything whose content contains the file's address, found by the asset id it carries, so raw HTML, CSS `url(...)` and addresses with a query string count: templates (the draft or any published version), shared blocks, campaigns and journeys in any status, journey enrollments in progress, unsent transactional messages, and the workspace brand, each list at most 50 long, with `hasMore` when one is longer. Deleting the asset is refused while any of these is listed. Each entry says whether it is `locked`: one that no edit or delete can free (a sent campaign, an ended journey, enrollments under way, a message about to go) keeps the image, and its bytes count toward storage, until that use ends, if ever.

```text
API reference: https://kirora.io/docs/api/reference/getAssetUsage
```
