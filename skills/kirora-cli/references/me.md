<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora me

These operations return the calling API key, its scopes and its workspace.

## kirora me get

Retrieve the current API key. `GET /v1/me`.

Returns the calling API key and the workspace it acts in. Any valid key, whatever its scopes. Use it as a connection test; a revoked, expired or unknown key is 401. A partner key with `Kirora-Workspace` names that tenant as `workspace`.

```text
API reference: https://kirora.io/docs/api/reference/getMe
```
