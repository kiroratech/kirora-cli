<!-- Generated from the published spec by `pnpm codegen`. Do not edit. -->

# kirora brand-kit

Retrieve the workspace brand kit

## kirora brand-kit get

Retrieve the workspace brand kit. `GET /v1/brand-kit`, needs `templates:read`.

Returns the workspace brand kit. Until it is saved, it holds the defaults: an empty `theme`, no `name`, logo, links, header or footer, and `updatedAt` null. Every email's `theme` holds only the fields it overrides; the rest come from here. A `header` block without an image shows the brand kit's logo, and a `social` block without links shows its social links. A change restyles templates and draft campaigns and journeys at once. Scheduling or sending a campaign, activating a journey and publishing a template freeze the brand kit that email goes out with, so nothing already approved changes. The default header and footer are what gallery and Kiro designs open and close with; emails that place them follow the shared blocks' own changes.

```text
API reference: https://kirora.io/docs/api/reference/getBrandKit
```
