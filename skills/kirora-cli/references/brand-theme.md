<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora brand-theme

Retrieve the workspace brand theme

## kirora brand-theme get

Retrieve the workspace brand theme. `GET /v1/brand-theme`, needs `templates:read`.

Returns the workspace brand theme. Every email's `theme` holds only the fields it overrides; the rest come from here. A change restyles templates and draft campaigns and journeys at once. Scheduling or sending a campaign, activating a journey and publishing a template freeze the look that email goes out with, so nothing already approved changes. Templates saved before the brand existed carry every field, so they keep their look until a field is reset.

```text
API reference: https://kirora.io/docs/api/reference/getBrandTheme
```
