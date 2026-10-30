<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora attributes

Attributes are the custom fields your contacts carry, such as `plan` or `orders`, discovered from the values you send.

## kirora attributes describe <key>

Describe an attribute key. `PUT /v1/attributes/{key}`, needs `attributes:write`.

Sets what an attribute key means, in the workspace's words, or removes it with `null`. A key no contact carries yet may be described too; it shows in the key list once contacts carry it. An agent key may describe keys: nothing is sent or changed on a contact.

- `-d, --data` takes the whole JSON body; flags set fields on top.

| Flag | |
| --- | --- |
| `--description <value>` | **Required.** What the key means, at most 255 characters: shown in the Data index's attribute list, and read by Kiro. `null` removes it. |

```text
Examples:
  Say what an attribute key means:
    $ kirora attributes describe <key> -d '{"description":"The billing plan the contact pays for."}'

API reference: https://kirora.io/docs/api/reference/describeAttribute
```

## kirora attributes list

List contact attribute keys. `GET /v1/attributes`, needs `attributes:read`.

Lists every attribute key your contacts carry, with its inferred type and how many contacts have it: the pickers for segment rules and merge tags. Read from an index up to five minutes old (a contact import refreshes it at once). A `list` key takes `contains`, `notContains`, `exists` and `notExists` in rules. `masked` says whether the workspace hides the key's values from members and embed sessions; an API key sees them either way. `description` is what an admin wrote the key means. `query` and `type` filter across every page; keys come in key order.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |
| `--query <value>` | Only keys containing this, ignoring case. |
| `--type <value>` | Only keys of this type. One of `string`, `number`, `boolean`, `date`, `list`, `mixed`. |

```text
API reference: https://kirora.io/docs/api/reference/listAttributes
```

## kirora attributes values <key>

List the values of an attribute. `GET /v1/attributes/{key}/values`, needs `attributes:read`.

Lists the distinct values contacts hold for one attribute key, with how many hold each, for value suggestions in rules; each member of a list counts on its own. The 100 most common only, from the same index as the key list. An API key always gets the values, a masked key's included. In the dashboard and in embed sessions (minted with `includeAttributeValues`), a masked key returns none.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listAttributeValues
```
