<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora push-projects

A push project is a product whose iOS, Android and web apps receive push, with whether each can send.

## kirora push-projects list

List push projects. `GET /v1/push-projects`, needs `push:read`.

Lists the workspace's push projects. Each project groups the iOS, Android and web apps of one product, with whether any can send (`ready`). Rules that ask whether a contact is reachable by push name a project. Credentials are described, never returned.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listPushProjects
```
