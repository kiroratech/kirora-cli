# Changelog

## 0.2.0

Generated from [kiroratech/openapi@dd83858](https://github.com/kiroratech/openapi/commit/dd83858ec02055d3f875ceed4959adb95bf94f47), on `@kirora/node` 0.2.0.

### Breaking

- `kirora reports funnel` no longer has `--within-days`. Pass the window in `--data` as
  `"conversionWindow": { "value": 14, "unit": "days" }` (unit: `seconds`, `minutes`,
  `hours` or `days`; default 7 days).
- Event and activity segment rules take `"within": { "value": 90, "unit": "days" }` in
  place of `"withinDays": 90`, in `segments create`, `update` and `preview`.

### Added

- `kirora sending-domains request-review <id>` asks for a sending domain review again
  after a decline. A send refused with `SENDING_REVIEW_REQUIRED` is waiting for one.
- `kirora workspaces update` takes `--website`, `--mail-kind` and `--contact-opt-in`,
  the sending profile a domain review reads.
- `kirora messages list` filters by `--sent`, `--delivered`, `--bounced` and
  `--complained`.
- Journeys take `--min-hours-between-sends`.
- Every flag whose field the API lets be null has a `--no-<flag>` that clears it, such
  as `--no-min-hours-between-sends` or `--no-website`. `--help` lists them.
- Transactional emails take `cc` and `bcc` in `--data`, and inline ones `mergeTags`.

### Changed

- `--help` names the allowed values of nested fields (such as a window's `unit`), and
  shows a field's default and description where the spec gives one, including one
  written beside a `$ref`.
