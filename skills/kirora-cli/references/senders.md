<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora senders

A sender is a From address the workspace has saved, on one of its sending domains, with one default that new emails start with.

## kirora senders list

List senders. `GET /v1/senders`, needs `domains:read`.

The workspace's saved From addresses, the default first, then by name, so an integration or agent picks a From that can send rather than guessing one. `domainVerified` says whether the email can send today; a domain that lost verification leaves its senders listed but false. `from` is the string an email's `from` takes. Senders are added and changed in the dashboard.

```text
API reference: https://kirora.io/docs/api/reference/listSenders
```
