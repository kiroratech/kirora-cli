<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora sending-domains

A sending domain is a domain your email is sent from, with the DNS records that prove you own it.

## kirora sending-domains check <id>

Check a sending domain. `POST /v1/sending-domains/{id}/check`, needs `domains:write`.

Re-reads DNS and updates the domain's `status`, `checks` and each record's `matches` and `reason`. Call this after publishing the records; while DNS propagates, the first check can find nothing yet.

- `--idempotency-key`: reuse the same key to retry safely.

```text
API reference: https://kirora.io/docs/api/reference/checkSendingDomain
```

## kirora sending-domains create

Add a sending domain. `POST /v1/sending-domains`, needs `domains:write`.

Registers a domain to send from and returns the DNS records to publish, all at once. It cannot send until they are in place and `status` is `verified`; Kirora checks them in the background, or call `POST /v1/sending-domains/{id}/check`. A Unicode domain is stored and returned in its punycode form (`münchen.de` becomes `xn--mnchen-3ya.de`); an IP address, a numeric top-level domain or invalid punycode is refused, as are a public suffix (`co.uk`) and a public mailbox domain or its subdomains (`gmail.com`), since neither can be verified. A removed domain can be added again.

- `-d, --data` takes the whole JSON body; flags set fields on top.
- `--idempotency-key`: reuse the same key to retry safely.

| Flag | |
| --- | --- |
| `--domain <value>` | **Required.** The domain to send from, such as `mail.example.com`. A Unicode name is stored in its punycode form. |

```text
Examples:
  Register a subdomain to send from:
    $ kirora sending-domains create -d '{"domain":"mail.acme-shop.com"}'

API reference: https://kirora.io/docs/api/reference/createSendingDomain
```

## kirora sending-domains delete <id>

Delete a sending domain. `DELETE /v1/sending-domains/{id}`, needs `domains:write`.

Removes the domain. Refused with 409 `IN_USE`, its `details` the `SendingDomainUsage` of `GET /v1/sending-domains/{id}/usage`, while a campaign not yet sent, a journey not ended, a template's `transactionalDefaults.from` or the workspace's default sender is on it: change those first. Transactional sends name their sender per request, so they are not checked. A removed domain can be added again.

- Without a terminal it needs `--yes`: only for a deletion the user asked for.

```text
API reference: https://kirora.io/docs/api/reference/deleteSendingDomain
```

## kirora sending-domains get <id>

Retrieve a sending domain. `GET /v1/sending-domains/{id}`, needs `domains:read`.

Returns one domain, its `status`, and the DNS records it expects with whether each was found.

```text
API reference: https://kirora.io/docs/api/reference/getSendingDomain
```

## kirora sending-domains list

List sending domains. `GET /v1/sending-domains`, needs `domains:read`.

Returns the sending domains in this workspace with each one's `status`. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.

- `--paginate` follows every page and prints one JSON item per line.

| Flag | |
| --- | --- |
| `--limit <number>` | How many items a page holds: 1 to 100, 20 by default. |
| `--cursor <cursor>` | Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it. |

```text
API reference: https://kirora.io/docs/api/reference/listSendingDomains
```

## kirora sending-domains usage <id>

Retrieve a sending domain's usage. `GET /v1/sending-domains/{id}/usage`, needs `domains:read`.

Lists what sends from this domain, which deleting it is refused for: campaigns not yet sent (draft, scheduled, sending or testing), journeys not ended with an email step, and templates whose `transactionalDefaults.from` is on it, each list at most 50 long, most recently edited first, with `hasMore` when one is longer; and whether the workspace's default sender is on it. Transactional sends name their sender per request, so they are not listed.

```text
API reference: https://kirora.io/docs/api/reference/getSendingDomainUsage
```
