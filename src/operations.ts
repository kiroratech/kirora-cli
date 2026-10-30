/** Generated from the published spec by `pnpm codegen`. Do not edit. */
import type { Resource } from './commands/resources.js';

export const RESOURCES: Resource[] = [
  {
    "name": "assets",
    "description": "An asset is an image you upload for a template's image blocks, served from a public URL.",
    "operations": [
      {
        "action": "delete",
        "operationId": "deleteAsset",
        "method": "DELETE",
        "path": "/v1/assets/{id}",
        "summary": "Delete an asset",
        "details": "Removes the image from the library and deletes its file, which frees its bytes from the storage limit. Email loads an image from its address, so deletion is refused with 409 `IN_USE` while a template (its draft or any published version), a shared block, a campaign or journey in any status, a journey enrollment in progress, an unsent transactional message, or the workspace brand uses it. `details` is the `AssetUsage` of `GET /v1/assets/{id}/usage`, each use with `locked`: true where no edit or delete can free the image (a sent campaign keeps it for as long as the campaign exists), false where changing or removing that use frees it. An image in use stays, and counts toward storage, until nothing uses it. Uses are found by the image id in the address, including inside raw HTML and CSS. Messages already sent with inline content through the API cannot be checked. The check is not serialised against saves: a save landing within milliseconds of the delete can still reference the removed image. Agent keys may delete images.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteAsset\n"
      },
      {
        "action": "import",
        "operationId": "importAsset",
        "method": "POST",
        "path": "/v1/assets/import",
        "summary": "Copy an image into the library",
        "details": "Copies the image at a public address into this workspace, checked as an upload is (PNG, JPEG or GIF, at most 2 MB and 25 megapixels), so an email never depends on another site keeping it: images hosted where your email was made before, a logo from your site, or a video block's thumbnail (a YouTube or Vimeo page's address copies its thumbnail). Only public addresses are reached; anything that is not such an image is a 400.",
        "scope": "templates:write",
        "query": [],
        "body": [
          {
            "name": "url",
            "flag": "url",
            "kind": "string",
            "placeholder": "<url>",
            "description": "A public PNG, JPEG or GIF of at most 2 MB, such as a logo on your current site; or a YouTube or Vimeo video page, whose thumbnail is copied.",
            "required": true
          },
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The name the library shows, up to 200 characters; the file's name when omitted."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Copy a logo from where it is hosted now:\n    $ kirora assets import -d '{\"url\":\"https://acme-shop.com/images/acme-logo.png\",\"name\":\"Acme logo\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/importAsset\n"
      },
      {
        "action": "list",
        "operationId": "listAssets",
        "method": "GET",
        "path": "/v1/assets",
        "summary": "List assets",
        "details": "Lists the files uploaded or copied into this workspace for email content, newest first; `query` matches part of the name or the file name. Place one in a template by its `url`.",
        "scope": "templates:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the name or the file name, ignoring case."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listAssets\n"
      },
      {
        "action": "update",
        "operationId": "updateAsset",
        "method": "PATCH",
        "path": "/v1/assets/{id}",
        "summary": "Rename an asset",
        "details": "Changes the name the library shows. The file, its `filename` and its `url` stay as they are, so emails using it are unaffected.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The name the library shows.",
            "required": true
          }
        ],
        "help": "\nExamples:\n  Rename it in the library; its address stays:\n    $ kirora assets update <id> -d '{\"name\":\"Acme logo, dark\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateAsset\n"
      },
      {
        "action": "upload",
        "operationId": "uploadAsset",
        "method": "POST",
        "path": "/v1/assets",
        "summary": "Upload an image",
        "details": "Uploads one PNG, JPEG or GIF of at most 2 MB and 25 megapixels for image blocks, as a multipart part named `file`, with an optional `name` for the library (the file's name otherwise). The request sample shows a complete upload. The returned `url` is public and stable, so it can go straight into a template. A retry with the same `Idempotency-Key` and the same file replays the first response; a different file under that key is 409 `IDEMPOTENCY_KEY_REUSED`.",
        "scope": "templates:write",
        "query": [],
        "body": [
          {
            "name": "file",
            "flag": "file",
            "kind": "file",
            "placeholder": "<path>",
            "description": "A PNG, JPEG or GIF of at most 2097152 bytes.",
            "required": true
          },
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The name the library shows, up to 200 characters; the file's name when omitted."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/uploadAsset\n"
      },
      {
        "action": "usage",
        "operationId": "getAssetUsage",
        "method": "GET",
        "path": "/v1/assets/{id}/usage",
        "summary": "Retrieve an asset's usage",
        "details": "Everything whose content contains the file's address, found by the asset id it carries, so raw HTML, CSS `url(...)` and addresses with a query string count: templates (the draft or any published version), shared blocks, campaigns and journeys in any status, journey enrollments in progress, unsent transactional messages, and the workspace brand, each list at most 50 long, with `hasMore` when one is longer. Deleting the asset is refused while any of these is listed. Each entry says whether it is `locked`: one that no edit or delete can free (a sent campaign, an ended journey, enrollments under way, a message about to go) keeps the image, and its bytes count toward storage, until that use ends, if ever.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getAssetUsage\n"
      }
    ]
  },
  {
    "name": "attributes",
    "description": "Attributes are the custom fields your contacts carry, such as `plan` or `orders`, discovered from the values you send.",
    "operations": [
      {
        "action": "describe",
        "operationId": "describeAttribute",
        "method": "PUT",
        "path": "/v1/attributes/{key}",
        "summary": "Describe an attribute key",
        "details": "Sets what an attribute key means, in the workspace's words, or removes it with `null`. A key no contact carries yet may be described too; it shows in the key list once contacts carry it. An agent key may describe keys: nothing is sent or changed on a contact.",
        "scope": "attributes:write",
        "pathParams": [
          {
            "name": "key",
            "label": "key"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What the key means, at most 255 characters: shown in the Data index's attribute list, and read by Kiro. `null` removes it.",
            "required": true
          }
        ],
        "help": "\nExamples:\n  Say what an attribute key means:\n    $ kirora attributes describe <key> -d '{\"description\":\"The billing plan the contact pays for.\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/describeAttribute\n"
      },
      {
        "action": "list",
        "operationId": "listAttributes",
        "method": "GET",
        "path": "/v1/attributes",
        "summary": "List contact attribute keys",
        "details": "Lists every attribute key your contacts carry, with its inferred type and how many contacts have it: the pickers for segment rules and merge tags. Read from an index up to five minutes old (a contact import refreshes it at once). A `list` key takes `contains`, `notContains`, `exists` and `notExists` in rules. `masked` says whether the workspace hides the key's values from members and embed sessions; an API key sees them either way. `description` is what an admin wrote the key means. `query` and `type` filter across every page; keys come in key order.",
        "scope": "attributes:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only keys containing this, ignoring case."
          },
          {
            "name": "type",
            "flag": "type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "string",
              "number",
              "boolean",
              "date",
              "list",
              "mixed"
            ],
            "description": "Only keys of this type."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listAttributes\n"
      },
      {
        "action": "values",
        "operationId": "listAttributeValues",
        "method": "GET",
        "path": "/v1/attributes/{key}/values",
        "summary": "List the values of an attribute",
        "details": "Lists the distinct values contacts hold for one attribute key, with how many hold each, for value suggestions in rules; each member of a list counts on its own. The 100 most common only, from the same index as the key list. An API key always gets the values, a masked key's included. In the dashboard and in embed sessions (minted with `includeAttributeValues`), a masked key returns none.",
        "scope": "attributes:read",
        "pathParams": [
          {
            "name": "key",
            "label": "key"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listAttributeValues\n"
      }
    ]
  },
  {
    "name": "brand-theme",
    "description": "Retrieve the workspace brand theme",
    "operations": [
      {
        "action": "get",
        "operationId": "getBrandTheme",
        "method": "GET",
        "path": "/v1/brand-theme",
        "summary": "Retrieve the workspace brand theme",
        "details": "Returns the workspace brand theme. Every email's `theme` holds only the fields it overrides; the rest come from here. A change restyles templates and draft campaigns and journeys at once. Scheduling or sending a campaign, activating a journey and publishing a template freeze the look that email goes out with, so nothing already approved changes. Templates saved before the brand existed carry every field, so they keep their look until a field is reset.",
        "scope": "templates:read",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getBrandTheme\n"
      }
    ]
  },
  {
    "name": "campaigns",
    "description": "A campaign is one marketing send to an audience, a list or a segment, at once or at a scheduled time.",
    "operations": [
      {
        "action": "archive",
        "operationId": "archiveCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/archive",
        "summary": "Archive a campaign",
        "details": "Hides the campaign from the list (`GET /v1/campaigns` leaves archived campaigns out unless `archived=true`). Nothing else changes: statistics and messages stay. A scheduled or sending campaign is refused with 409.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/archiveCampaign\n"
      },
      {
        "action": "breakdown",
        "operationId": "getCampaignBreakdown",
        "method": "GET",
        "path": "/v1/campaigns/{id}/breakdown",
        "summary": "Retrieve a campaign's email results by domain, device or country",
        "details": "Splits a campaign's email results into rows by the recipient's email domain (`gmail.com`), the device they first opened or clicked on (`desktop`, `mobile`, `tablet`), or the contact's country (`NG`), counted the same way as the campaign's metrics. Use it to find where a problem sits: bounces concentrated on one domain point at that mailbox provider, not at the whole list.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "groupBy",
            "flag": "group-by",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "domain",
              "device",
              "country"
            ],
            "description": "`domain`: the recipient's email domain. `device`: the kind of device a person first opened or clicked on. `country`: the contact's country (ISO 3166-1 alpha-2).",
            "required": true,
            "alias": "groupBy"
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getCampaignBreakdown\n"
      },
      {
        "action": "cancel",
        "operationId": "cancelCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/cancel",
        "summary": "Cancel a campaign that is still sending",
        "details": "Stops a campaign whose messages are still going out: every message not yet handed to a worker is skipped with reason `campaign_cancelled`, and the campaign becomes `cancelled`. Messages already being sent finish. A campaign with nothing left queued is refused with 409 `CONFLICT`; unschedule a scheduled one instead. Skipped messages publish no webhooks. Needs `campaigns:write`, so agent keys may stop a send.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/cancelCampaign\n"
      },
      {
        "action": "choose-ab-test-winner",
        "operationId": "chooseAbTestWinner",
        "method": "POST",
        "path": "/v1/campaigns/{id}/ab-test/winner",
        "summary": "Choose an A/B test's winner",
        "details": "Picks the winning version of a campaign in `testing` and sends it to the rest of the audience at once, instead of waiting for the automatic pick (or when the test has none, `decideAfter: null`). The campaign turns `sending`, then `sent`. Asking again for the version already picked returns 202 and queues its send again, so a retry is safe; another version once one is picked, or a campaign not in `testing`, is refused with 409 `CONFLICT`. Agent keys are refused with 403: this sends.",
        "scope": "campaigns:send",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "version",
            "flag": "ab-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The version the rest of the audience gets.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Send version 2 to the rest of the audience:\n    $ kirora campaigns choose-ab-test-winner <id> -d '{\"version\":2}'\n\nAPI reference: https://kirora.io/docs/api/reference/chooseAbTestWinner\n"
      },
      {
        "action": "create",
        "operationId": "createCampaign",
        "method": "POST",
        "path": "/v1/campaigns",
        "summary": "Create a campaign",
        "details": "Creates a campaign in `draft`, targeting email, push, or both. A draft saves unfinished: only `name` is required, and the audience and each channel's content may come later (content for a channel not selected is refused). What is given is checked, so a bad merge tag is caught on save. Sending, scheduling or confirming needs it whole: 409 `DRAFT_INCOMPLETE` lists each missing field in `errors`, and the eligibility check shows the same. Every contact receives each selected channel they can be reached on and have consented to. Email content is a template snapshot — a schema version, block tree and theme — not a subject and body; build it from a template rather than by hand. Creating does not send: use the send or schedule operation once the campaign is ready.",
        "scope": "campaigns:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          },
          {
            "name": "channels",
            "flag": "channels",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "The channels to send on; each needs its own content. Defaults to `email`."
          },
          {
            "name": "allContacts",
            "flag": "all-contacts",
            "kind": "boolean",
            "description": "Send to all contacts: everyone its channels reach, with consent and suppressions applied as on any send. Choose at most one audience.",
            "alias": "allContacts"
          },
          {
            "name": "listIds",
            "flag": "list-ids",
            "kind": "list",
            "placeholder": "<ids...>",
            "description": "Send to these lists, up to 20: a member of any of them receives it once. Choose at most one audience.",
            "alias": "listIds"
          },
          {
            "name": "segmentId",
            "flag": "segment-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Send to this segment. Choose at most one audience.",
            "alias": "segmentId"
          },
          {
            "name": "topicId",
            "flag": "topic-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Send only to contacts the topic reaches. Omit to reach everyone with consent.",
            "alias": "topicId"
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  audienceRules  one of { all* } | { any* }\n  exclusions     { listIds, segmentIds }\n                 Leave out the members of these lists and segments (\"don't send to\"); beside all contacts, lists or a segment, not rules, as rules exclude within themselves.\n  messageLimits  { apply*, retryFor }\n  utm            { enabled*, source, medium, campaign, content, term }\n                 UTM parameters added to the links in the email.\n  content        { email, push }\n                 The content for each selected channel.\n  abTest         { versions*, testPercent*, winnerBy, conversionGoalId, decideAfter* }\n  delivery       { rateLimit*, expiresAfter* }\n                 How fast it goes out, and until when.\n\nExamples:\n  An email draft for a list:\n    $ kirora campaigns create -d '{\"name\":\"October newsletter\",\"channels\":[\"email\"],\"listIds\":[\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\"],\"messageLimits\":{\"apply\":true,\"retryFor\":{\"value\":24,\"unit\":\"hours\"}},\"content\":{\"email\":{\"subject\":\"New this month at Acme Shop\",\"previewText\":\"Autumn arrivals are in\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\",\"templateSnapshot\":{\"schemaVersion\":1,\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Autumn arrivals\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, the new range is in.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Shop now\",\"href\":\"https://acme-shop.com\"}],\"theme\":{}}}},\"tags\":[\"Newsletter\"]}'\n  A flash sale at 5,000 people an hour, so the shop is not swamped, ending after 48 hours:\n    $ kirora campaigns create -d '{\"name\":\"Flash sale\",\"channels\":[\"email\"],\"allContacts\":true,\"content\":{\"email\":{\"subject\":\"New this month at Acme Shop\",\"previewText\":\"Autumn arrivals are in\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\",\"templateSnapshot\":{\"schemaVersion\":1,\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Autumn arrivals\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, the new range is in.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Shop now\",\"href\":\"https://acme-shop.com\"}],\"theme\":{}}}},\"delivery\":{\"rateLimit\":{\"recipients\":5000,\"per\":\"hour\"},\"expiresAfter\":{\"value\":48,\"unit\":\"hours\"}}}'\n  A subject-line A/B test: 20% split between two subjects, the winner by clicks after 4 hours:\n    $ kirora campaigns create -d '{\"name\":\"October newsletter\",\"channels\":[\"email\"],\"listIds\":[\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\"],\"messageLimits\":{\"apply\":true,\"retryFor\":{\"value\":24,\"unit\":\"hours\"}},\"content\":{\"email\":{\"subject\":\"New this month at Acme Shop\",\"previewText\":\"Autumn arrivals are in\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\",\"templateSnapshot\":{\"schemaVersion\":1,\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Autumn arrivals\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, the new range is in.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Shop now\",\"href\":\"https://acme-shop.com\"}],\"theme\":{}}}},\"tags\":[\"Newsletter\"],\"abTest\":{\"versions\":[{\"email\":{\"subject\":\"Five autumn recipes, one pan each\"}}],\"testPercent\":20,\"winnerBy\":\"clicks\",\"decideAfter\":{\"value\":4,\"unit\":\"hours\"}}}'\n\nAPI reference: https://kirora.io/docs/api/reference/createCampaign\n"
      },
      {
        "action": "delete",
        "operationId": "deleteCampaign",
        "method": "DELETE",
        "path": "/v1/campaigns/{id}",
        "summary": "Delete a draft campaign",
        "details": "Deletes a draft. A campaign that was scheduled or sent keeps its history and is refused with 409 `CONFLICT`: archive it instead.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteCampaign\n"
      },
      {
        "action": "duplicate",
        "operationId": "duplicateCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/duplicate",
        "summary": "Duplicate a campaign",
        "details": "Copies an existing campaign, including its content snapshot, audience selection and delivery settings, into a new `draft`, named `name` or \"Copy of\" the original's. Metrics and messages are not copied. A campaign is sent once, so sending again is a duplicate, then a send or trigger of the copy.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The copy's name; defaults to \"Copy of\" and the original's."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A draft copy, named for its send:\n    $ kirora campaigns duplicate <id> -d '{\"name\":\"October newsletter: second send\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/duplicateCampaign\n"
      },
      {
        "action": "eligibility",
        "operationId": "getCampaignEligibility",
        "method": "GET",
        "path": "/v1/campaigns/{id}/eligibility",
        "summary": "Retrieve a campaign's eligibility",
        "details": "Reports everything that would stop this campaign sending, without attempting a send: `canSend` is true when nothing does. Campaign-wide blockers sit at the top; each selected channel reports its own reach and blockers. Every blocker is `{ code, message, field? }`: `code` to branch on, `message` written for whoever fixes it, and for `draft_incomplete` the `field` still missing (a missing email body is `content.email` under the email channel). Sending is all or nothing, so one blocker anywhere stops every channel. Call this before `POST /v1/campaigns/{id}/send` to turn a 409 into an actionable list. The warnings (`contentWarnings`, `abTestWarnings`, the email channel's `mergeTagSkipped`) never stop a send. This is an estimate: it neither reserves quota nor guarantees delivery.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getCampaignEligibility\n"
      },
      {
        "action": "get",
        "operationId": "getCampaign",
        "method": "GET",
        "path": "/v1/campaigns/{id}",
        "summary": "Retrieve a campaign",
        "details": "Returns one campaign including its full content snapshot and audience selection.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getCampaign\n"
      },
      {
        "action": "links",
        "operationId": "listCampaignLinks",
        "method": "GET",
        "path": "/v1/campaigns/{id}/links",
        "summary": "List a campaign's links and their clicks",
        "details": "Lists every link in the campaign email, never-clicked ones included, with its clicks. Ordered by `uniqueClicks`, most first; links nobody clicked come last, in the order they appear in the email. A/B versions are combined. A link is reported without its query string or fragment, so a personalised link is one row. `uniqueClicks` and `totalClicks` count people; a mail security scanner checking links on delivery, or a link preview, counts only in `machineClicks`. One person can click several links, so the unique clicks here can add up to more than the campaign's `email.clicked`.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listCampaignLinks\n"
      },
      {
        "action": "list",
        "operationId": "listCampaigns",
        "method": "GET",
        "path": "/v1/campaigns",
        "summary": "List campaigns",
        "details": "Returns campaigns in this workspace, newest first by default. Pass `status` to list only campaigns in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "campaigns:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the campaign's name, ignoring case."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "draft",
              "scheduled",
              "sending",
              "testing",
              "sent",
              "cancelled"
            ],
            "description": "Only campaigns in this status."
          },
          {
            "name": "archived",
            "flag": "archived",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true` lists archived campaigns only; unset or `false` leaves them out."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only items carrying this tag, its name matched without case."
          },
          {
            "name": "pendingAgentReview",
            "flag": "pending-agent-review",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: only campaigns waiting in the agent review queue; `false`: only those not.",
            "alias": "pendingAgentReview"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listCampaigns\n"
      },
      {
        "action": "metrics",
        "operationId": "getCampaignMetrics",
        "method": "GET",
        "path": "/v1/campaigns/{id}/metrics",
        "summary": "Retrieve a campaign's metrics",
        "details": "Returns how a campaign did over its whole life. People-level numbers sit at the top: `recipientCount`, and the conversions and credited revenue its messages drove (gross, before refunds; zeros without conversion goals). Message counters sit under `email` and `push`, never added together, `null` for a channel the campaign does not send; push device outcomes are under `push.devices`. Email's `opened` includes machine opens (`openedByMachine`); a machine's click counts in neither `clicked` nor `opened`. Counters keep moving after a send completes, as opens, clicks and bounces arrive.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getCampaignMetrics\n"
      },
      {
        "action": "preview",
        "operationId": "previewCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/preview",
        "summary": "Preview campaign content",
        "details": "Renders the campaign's email to HTML and plain text against the contact `contactId` (required), so merge tags resolve, without sending anything; `data` fills `{{ data.<key> }}` as a trigger's recipient would. A draft renders as far as it goes. A campaign that sends no email returns 409 `CONFLICT`.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "contactId",
            "flag": "contact-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The contact whose values fill the merge tags.",
            "required": true,
            "alias": "contactId"
          },
          {
            "name": "version",
            "flag": "ab-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The A/B version to preview; 1 is the campaign's own content."
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  data  object\n        Values for `{{ data.<key> }}`, as a trigger would pass them; a triggered campaign previews with what one recipient would get.\n\nExamples:\n  The email as one contact would see it:\n    $ kirora campaigns preview <id> -d '{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/previewCampaign\n"
      },
      {
        "action": "schedule",
        "operationId": "scheduleCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/schedule",
        "summary": "Schedule a campaign",
        "details": "Sets when a draft sends, and moves it to `scheduled`; on a campaign already `scheduled` whose send has not begun, moves it to the new time. `type: \"fixed\"` sends to everyone at `sendAt`, which must be in the future (400 `INVALID_SCHEDULE`). `type: \"local_time\"` sends to each contact at `localDateTime` on their own clock (`timezoneIfUnknown` for contacts without a timezone, else the workspace's). It may already have passed in some timezones: the send then starts at once, and `ifTimeHasPassed` says whether those contacts get it now, the next day or not at all; it is refused only once it has passed everywhere. The campaign answers with the computed `schedule.startsAt`. An A/B test with a local time sends its test share by each contact's own time; the automatic decision comes `decideAfter` after that time has passed in the last timezone (UTC-12), and the winner goes to the rest at that time of day where they are, the next time it comes round. An unfinished draft returns 409 `DRAFT_INCOMPLETE`, and every channel must be ready, as for sending. An archived campaign returns 409 `CONFLICT`. Agent keys are refused with 403. A campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.",
        "scope": "campaigns:send",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nThe body (--data) is one of:\n  { type*: \"fixed\", sendAt* }\n  { type*: \"local_time\", localDateTime*, timezoneIfUnknown, ifTimeHasPassed }\n\nExamples:\n  Everyone receives it at the same moment, 08:00 UTC:\n    $ kirora campaigns schedule <id> -d '{\"type\":\"fixed\",\"sendAt\":\"2026-11-03T08:00:00.000Z\"}'\n  Each person receives it at 08:00 in their own timezone (Africa/Lagos where none is known):\n    $ kirora campaigns schedule <id> -d '{\"type\":\"local_time\",\"localDateTime\":\"2026-11-03T08:00\",\"timezoneIfUnknown\":\"Africa/Lagos\",\"ifTimeHasPassed\":\"skip\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/scheduleCampaign\n"
      },
      {
        "action": "send",
        "operationId": "sendCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/send",
        "summary": "Send a campaign",
        "details": "Queues the campaign for immediate delivery: it turns `sending`, then `sent` once every message is queued. With a `delivery.rateLimit` it stays `sending` while its messages go out over the period, and turns `sent` once the last has gone or expired. A campaign is sent at most once: sending one that has already gone returns it again, so a retry after a timeout never sends twice. Every selected channel must be ready — a verified sending domain for email (409 `SENDING_DOMAIN_UNVERIFIED`, or `SENDING_DOMAIN_DMARC_MISSING` while it has no DMARC record), a configured app for push — and nothing is sent while any is blocked. An unfinished draft returns 409 `DRAFT_INCOMPLETE` with each missing field in `errors`. An archived campaign returns 409 `CONFLICT`; unarchive it first. Agent keys are refused with 403. A campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.",
        "scope": "campaigns:send",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/sendCampaign\n"
      },
      {
        "action": "series",
        "operationId": "getCampaignSeries",
        "method": "GET",
        "path": "/v1/campaigns/{id}/series",
        "summary": "Retrieve a campaign's metrics over time",
        "details": "Returns how a campaign's metrics built up over time: for each hour or day, how many messages were sent, delivered, opened, clicked, bounced and so on, with email and push counted apart. Use it to chart a send, for example to see that most opens came in the first six hours.",
        "scope": "campaigns:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "interval",
            "flag": "interval",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "hour",
              "day"
            ],
            "description": "The bucket size.",
            "required": true
          },
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Inclusive: start the series at the bucket holding this time instead of the first send. A date-time, or a date meaning the start of that day in the workspace timezone."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Exclusive: end the series with the bucket holding the moment before this time instead of now, in the same forms. A date ends the series with the day before it."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getCampaignSeries\n"
      },
      {
        "action": "trigger",
        "operationId": "triggerCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/trigger",
        "summary": "Trigger a campaign",
        "details": "Sends a draft now, once, to the contacts `recipients` names, by `contactId`, `externalId` or `email`, instead of its saved audience; it needs none. Each person may carry their own `data`, read in the content as `{{ data.<key> }}` over the shared `data`: \"the item in your basket is now cheaper\", to each their item. Up to 5,000 recipients, the request up to 10 MB. A recipient that names no contact is not sent and comes back in `notFound`; one contact listed twice is refused with 400. Each message is checked as any campaign send is (consent, suppression, topic, limits), and a message whose content reads a value its recipient lacks is skipped with `missing_merge_tag`. Data is kept on a message only until it is sent. A campaign whose content reads `data` can go out only this way. A campaign is sent at most once, and every channel must be ready, as for a send. An `Idempotency-Key` header is required, and is kept with the campaign for as long as it exists: a retry with the same key and request returns the first response, `notFound` included, with `Idempotency-Replay: true`; the same key with a different request is 409 `IDEMPOTENCY_KEY_REUSED`, and any other trigger of a campaign already sent is 409 `CONFLICT`: to send again, duplicate it. Agent keys are refused with 403, and a campaign an agent wrote or edited returns 409 `AGENT_CONFIRMATION_REQUIRED` until a person confirms it in the dashboard.",
        "scope": "campaigns:send",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "idempotencyKey": "required",
        "help": "\nBody fields only --data can carry (* required):\n  data         object\n               Values every recipient shares.\n  recipients*  list of one of { contactId*, data } | { externalId*, data } | { email*, data }\n               The people to send to, each named by one identifier.\n\nExamples:\n  Each person with their own item:\n    $ kirora campaigns trigger <id> -d '{\"data\":{\"store\":\"Juniper Kitchen\"},\"recipients\":[{\"externalId\":\"customer-4821\",\"data\":{\"item\":\"Cast iron skillet\",\"price\":\"$39.00\"}},{\"email\":\"sam@example.com\",\"data\":{\"item\":\"Chef knife\",\"price\":\"$54.00\"}},{\"externalId\":\"customer-9999\",\"data\":{\"item\":\"Dutch oven\",\"price\":\"$89.00\"}}]}' --idempotency-key <key>\n\nAPI reference: https://kirora.io/docs/api/reference/triggerCampaign\n"
      },
      {
        "action": "unarchive",
        "operationId": "unarchiveCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/unarchive",
        "summary": "Unarchive a campaign",
        "details": "Returns an archived campaign to the list.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/unarchiveCampaign\n"
      },
      {
        "action": "unschedule",
        "operationId": "unscheduleCampaign",
        "method": "POST",
        "path": "/v1/campaigns/{id}/unschedule",
        "summary": "Unschedule a campaign",
        "details": "Returns a scheduled campaign to `draft`, so nothing goes out at its scheduled time. A campaign that is not scheduled returns 409 `CONFLICT`; one already sending is stopped with cancel instead. Needs `campaigns:write`, so agent keys may stop a send.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/unscheduleCampaign\n"
      },
      {
        "action": "update",
        "operationId": "updateCampaign",
        "method": "PATCH",
        "path": "/v1/campaigns/{id}",
        "summary": "Update a campaign",
        "details": "Updates a draft campaign. Only campaigns still in `draft` can be changed; anything else returns 409 `CONFLICT`. A field left out is kept; `null` clears one that may be empty (`exclusions`, `topicId`, `utm`, `abTest`, `delivery`). Content is replaced wholesale rather than merged, so send the full template snapshot — read the campaign first and pass its existing snapshot back if you are changing only the subject. Changing `channels` requires `content` in the same request, with a block for each selected channel. With `expectedRevision`, a retry after a timeout whose first attempt landed returns 409 `REVISION_CONFLICT`: read the campaign, and if it already holds your change, the update went through.",
        "scope": "campaigns:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "allContacts",
            "flag": "all-contacts",
            "kind": "boolean",
            "description": "Send to all contacts. Any audience field replaces the audience whole: the one set is the new audience, and `false` or `null` alone leaves it without one.",
            "alias": "allContacts"
          },
          {
            "name": "listIds",
            "flag": "list-ids",
            "kind": "list",
            "placeholder": "<ids...>",
            "description": "Send to these lists, up to 20; replaces the audience whole.",
            "alias": "listIds"
          },
          {
            "name": "segmentId",
            "flag": "segment-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Send to this segment; replaces the audience whole.",
            "alias": "segmentId"
          },
          {
            "name": "topicId",
            "flag": "topic-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The topic to send under; `null` reaches everyone with consent.",
            "alias": "topicId"
          },
          {
            "name": "channels",
            "flag": "channels",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "The channels to send on. Send `content` with it so each has its content."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Replaces the tags whole (`[]` removes them), matched without case. Tags change on a campaign in any status; the rest of the body only on a draft."
          },
          {
            "name": "expectedRevision",
            "flag": "expected-revision",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there.",
            "alias": "expectedRevision"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  audienceRules  one of { all* } | { any* }\n                 Send to contacts matching these rules; replaces the audience whole.\n  exclusions     { listIds, segmentIds }\n                 Lists and segments to leave out of its audience, beside all contacts, lists or a segment; `null` removes them.\n  messageLimits  { apply*, retryFor }\n  utm            { enabled*, source, medium, campaign, content, term }\n                 UTM parameters added to links; `null` removes them.\n  content        { email, push }\n                 The content for each selected channel.\n  abTest         { versions*, testPercent*, winnerBy, conversionGoalId, decideAfter* }\n                 Replaces the A/B test whole; `null` removes it.\n  delivery       { rateLimit*, expiresAfter* }\n                 Replaces throttling and expiry whole; `null` removes them.\n\nExamples:\n  Change the subject, guarding against a concurrent edit:\n    $ kirora campaigns update <id> -d '{\"content\":{\"email\":{\"subject\":\"Autumn arrivals at Acme Shop\",\"previewText\":\"Autumn arrivals are in\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\",\"templateSnapshot\":{\"schemaVersion\":1,\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Autumn arrivals\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, the new range is in.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Shop now\",\"href\":\"https://acme-shop.com\"}],\"theme\":{}}}},\"expectedRevision\":1}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateCampaign\n"
      }
    ]
  },
  {
    "name": "contacts",
    "description": "A contact is one person you can message, with their profile, custom attributes, consent on each channel and topic choices.",
    "operations": [
      {
        "action": "consent-changes",
        "operationId": "listContactConsentChanges",
        "method": "GET",
        "path": "/v1/contacts/{id}/consent-changes",
        "summary": "List a contact's consent changes",
        "details": "Lists every grant and withdrawal of consent for this contact, per channel or per topic, newest first: where it came from (dashboard, API, import, form, unsubscribe link), who made it, and the IP it came from. Append-only. It tells apart a contact never asked from one who withdrew, which both read as `false` in `consent`.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactConsentChanges\n"
      },
      {
        "action": "delete",
        "operationId": "deleteContact",
        "method": "DELETE",
        "path": "/v1/contacts/{id}",
        "summary": "Delete a contact",
        "details": "Deletes one contact and its data, for a right-to-erasure request: its events, list memberships, consent changes and journey enrollments go with it. Journey messages go with the enrollments; campaign and transactional messages are kept for campaign totals but anonymised: the address, content and provider ids are removed and nothing links them to the person. Address suppressions are kept, so a deleted address that is imported again is still not mailed. While a message to the contact is being handed to the provider, which takes seconds, it answers 409 `CONTACT_SEND_IN_PROGRESS`; retry shortly. A message waiting to be retried is skipped (`contact_deleted`) instead; a push that already reached one of the contact's devices is marked `sent`, and one a push service refused is marked `failed`, as it would have ended anyway. It cannot be undone. Requires `contacts:delete`; agent keys are refused.",
        "scope": "contacts:delete",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteContact\n"
      },
      {
        "action": "delete-many",
        "operationId": "deleteContacts",
        "method": "POST",
        "path": "/v1/contacts/delete",
        "summary": "Delete contacts",
        "details": "Deletes up to 100 contacts, each named by `contactId`, `externalId` or `email`, and reports an outcome per contact. For each one deleted, its events, list memberships, consent changes and journey enrollments go with it. Journey messages go with the enrollments; campaign and transactional messages are kept for campaign totals but anonymised: the address, content and provider ids are removed and nothing links them to the person. Address suppressions are kept, so a deleted address that is imported again is still not mailed. `send_in_progress` means a message was being handed to the provider; retry that one shortly. Requires `contacts:delete`; agent keys are refused.",
        "scope": "contacts:delete",
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "destructive": true,
        "help": "\nBody fields only --data can carry (* required):\n  contacts*  list of one of { contactId* } | { externalId* } | { email* }\n\nExamples:\n  Delete two contacts:\n    $ kirora contacts delete-many -d '{\"contacts\":[{\"email\":\"amaka@example.com\"},{\"externalId\":\"customer-0000\"}]}'\n\nAPI reference: https://kirora.io/docs/api/reference/deleteContacts\n"
      },
      {
        "action": "events",
        "operationId": "listContactEvents",
        "method": "GET",
        "path": "/v1/contacts/{id}/events",
        "summary": "List a contact's events",
        "details": "Lists the events tracked against this contact, newest first, by when they happened: accepted events only, in the same shape as the event log. Events past the retention period are gone and not listed.",
        "scope": "events:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only events of this name."
          },
          {
            "name": "occurredAfter",
            "flag": "occurred-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only events that happened at or after this time (inclusive).",
            "alias": "occurredAfter"
          },
          {
            "name": "occurredBefore",
            "flag": "occurred-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only events that happened before this time (exclusive).",
            "alias": "occurredBefore"
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactEvents\n"
      },
      {
        "action": "export",
        "operationId": "getContactExport",
        "method": "GET",
        "path": "/v1/contacts/{id}/export",
        "summary": "Export a contact's data",
        "details": "Returns everything held about one contact, for answering a right-of-access request: profile, consent changes, events, messages, lists, segments, topics, journeys, push devices (without tokens), form submissions, conversions and suppressions. Data past the retention periods is no longer held, so it is not included. The response is streamed as it is read, so a long history arrives without a length. Each export is recorded in the audit log.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getContactExport\n"
      },
      {
        "action": "get",
        "operationId": "getContact",
        "method": "GET",
        "path": "/v1/contacts/{id}",
        "summary": "Retrieve a contact",
        "details": "Returns one contact, including its current email suppression state.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getContact\n"
      },
      {
        "action": "identify",
        "operationId": "identifyContact",
        "method": "POST",
        "path": "/v1/contacts/identify",
        "summary": "Create or update a contact",
        "details": "Creates or updates a contact, matched by `externalId`, then `email`, then `phone` rather than by id, and created if none matches. A write whose lower-ranked identifier matches a contact that holds a different value for a higher-ranked one (a phone matching a contact with another email) names two people and is refused with 409 `CONFLICT`, `details.field` the identifier that differs. Consent flags that are omitted keep their current value rather than resetting to false. Granting consent, on a channel or (in `topics`) a topic, needs `consent.statement`, how the contact agreed; without it the write is refused with 400 `VALIDATION_ERROR` at `consent.statement`. Withdrawing needs none. `attributes` merge as on update: `null` removes a key. `topics` sets topic choices in the same write, each recorded in consent changes as `PUT /v1/contacts/{id}/topics/{topicId}` records it. `lists` adds the contact to lists by name, creating a list that does not exist yet; joining one starts any journey triggered by joining it. This is the endpoint to use for ingestion. Agent keys are refused with 403.",
        "scope": "contacts:write",
        "query": [],
        "body": [
          {
            "name": "externalId",
            "flag": "external-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Your own id for the contact, up to 255 characters. Identify matches on it first.",
            "alias": "externalId"
          },
          {
            "name": "email",
            "flag": "email",
            "kind": "string",
            "placeholder": "<email>"
          },
          {
            "name": "firstName",
            "flag": "first-name",
            "kind": "string",
            "placeholder": "<value>",
            "alias": "firstName"
          },
          {
            "name": "lastName",
            "flag": "last-name",
            "kind": "string",
            "placeholder": "<value>",
            "alias": "lastName"
          },
          {
            "name": "phone",
            "flag": "phone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Phone number; normalised to E.164 (a leading `+` and country code)."
          },
          {
            "name": "timezone",
            "flag": "timezone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "IANA timezone, e.g. `Europe/London`; used for send-time scheduling."
          },
          {
            "name": "country",
            "flag": "country",
            "kind": "string",
            "placeholder": "<value>",
            "description": "ISO 3166-1 alpha-2 code. Omitted, it is inferred from the phone, else the timezone."
          },
          {
            "name": "locale",
            "flag": "locale",
            "kind": "string",
            "placeholder": "<value>",
            "description": "BCP 47 tag (`fr`, `fr-CA`), stored canonical: the language the contact reads, and how merge tags format numbers, dates and money for them."
          },
          {
            "name": "lists",
            "flag": "lists",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Names of lists to add the contact to, up to 20, matched without case; a list the workspace lacks is created. Adds only: the contact stays in the lists it is already in."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  dates       object\n  attributes  object\n              Custom attributes, merged key by key; `null` removes one.\n  consent     { email, push, statement }\n  topics      object\n              Topic choices keyed by topic id, at most 50, as `PUT /v1/contacts/{id}/topics/{topicId}` sets them: `true` or `false` for every channel, or `{ \"email\": …, \"push\": … }` per channel.\n\nExamples:\n  By your own id, with consent:\n    $ kirora contacts identify -d '{\"externalId\":\"customer-4821\",\"email\":\"amaka@example.com\",\"firstName\":\"Amaka\",\"lastName\":\"Obi\",\"phone\":\"+2348031234567\",\"timezone\":\"Africa/Lagos\",\"dates\":{\"birthday\":\"1992-03-14\"},\"attributes\":{\"plan\":\"pro\",\"favourite_spice\":\"smoked paprika\",\"orders\":3},\"consent\":{\"email\":true,\"statement\":{\"basis\":\"opted_in\",\"evidence\":\"Checkout opt-in on shop.example.com\"}}}'\n  With topic choices:\n    $ kirora contacts identify -d '{\"externalId\":\"customer-4821\",\"topics\":{\"0192f3b0-6a1b-7c2d-8e3f-4a5b6c7d8e9f\":{\"email\":true,\"push\":false}}}'\n  By email address only:\n    $ kirora contacts identify -d '{\"email\":\"amaka@example.com\",\"attributes\":{\"orders\":3}}'\n\nAPI reference: https://kirora.io/docs/api/reference/identifyContact\n"
      },
      {
        "action": "identify-batch",
        "operationId": "identifyContactsBatch",
        "method": "POST",
        "path": "/v1/contacts/batch",
        "summary": "Identify contacts in a batch",
        "details": "Creates or updates up to 100 contacts in one request, each resolved and written exactly as `POST /v1/contacts/identify` would, in order. One contact refused, an invalid one included, does not stop the rest: its entry carries the error a single identify would have returned, a 400 `VALIDATION_ERROR` naming the field for a contact that does not validate. Only a body that is not 1 to 100 contacts is refused whole. Draws on the high-volume rate budget, shared with transactional sends, as one request per contact; for a larger sync, send several batches. Agent keys are refused with 403.",
        "scope": "contacts:write",
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  contacts*  list of one of { externalId* } | { email* } | { phone* }\n\nExamples:\n  One contact updated, two refused, each in its own result:\n    $ kirora contacts identify-batch -d '{\"contacts\":[{\"externalId\":\"customer-4821\",\"email\":\"amaka@example.com\",\"firstName\":\"Amaka\",\"topics\":{\"0192f3b0-6a1b-7c2d-8e3f-4a5b6c7d8e9f\":true}},{\"externalId\":\"customer-9999\",\"email\":\"amaka@example.com\"},{\"externalId\":\"customer-5310\",\"email\":\"tunde@example.com\",\"consent\":{\"email\":true}}]}'\n\nAPI reference: https://kirora.io/docs/api/reference/identifyContactsBatch\n"
      },
      {
        "action": "installations delete",
        "operationId": "deletePushInstallation",
        "method": "DELETE",
        "path": "/v1/contacts/{id}/installations/{externalInstallationId}",
        "summary": "Delete a push installation",
        "details": "Stops push to the device you registered as `externalInstallationId` for this contact, in every push app it registered with, as the SDK does on sign-out. Use it on sign-out, or when the device reports its token is no longer valid. The record is kept, marked `active: false`, so `listPushInstallations` still shows it; registering the device again turns it back on. To delete a person's data, delete the contact (`deleteContact`). A device the contact never registered is a 404.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "contact-id"
          },
          {
            "name": "externalInstallationId",
            "label": "external-installation-id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deletePushInstallation\n"
      },
      {
        "action": "installations list",
        "operationId": "listPushInstallations",
        "method": "GET",
        "path": "/v1/contacts/{id}/installations",
        "summary": "List a contact's push installations",
        "details": "Lists the devices and browsers registered against a contact, newest first, including inactive ones (`active: false` after a sign-out, a refused permission, or a provider reporting the device gone). The device token or browser subscription is never returned.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listPushInstallations\n"
      },
      {
        "action": "installations register",
        "operationId": "registerPushInstallation",
        "method": "POST",
        "path": "/v1/contacts/{id}/installations",
        "summary": "Register a push installation",
        "details": "Registers a device or browser subscription against a contact so push can reach it. Re-registering the same token updates the existing installation rather than creating a duplicate. With `idType=externalId`, `{id}` is your own id for the contact, so a backend that knows only its user id can register a device without looking the contact up first. A revoked permission is reported as `{ pushAppId, externalInstallationId, permission: \"denied\", lastSeenAt }` with the `lastSeenAt` of the latest registration; if the device registered again since, the report is refused with 409 `CONFLICT`, and an installation never registered is 404. Returns 201 when the installation is new and 200 when it was already registered.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nThe body (--data) is one of:\n  { pushAppId*, externalInstallationId*, permission*, targetKind*, target* }\n  { pushAppId*, externalInstallationId*, permission*, targetKind*: \"web_push_subscription\", subscription* }\n  { pushAppId*, externalInstallationId*, permission*: \"denied\", lastSeenAt* }\n\nExamples:\n  An iPhone with its APNs token:\n    $ kirora contacts installations register <id> -d '{\"pushAppId\":\"0192f3d0-4b5c-7d6e-8f70-1a2b3c4d5e6f\",\"externalInstallationId\":\"device-amaka-iphone\",\"permission\":\"granted\",\"targetKind\":\"apns_token\",\"target\":\"740f4707bebcf74f9b7c25d48e3358945f6aa01da5ddb387462c7eaf61bb78ad\"}'\n  A browser web push subscription:\n    $ kirora contacts installations register <id> -d '{\"pushAppId\":\"0192f3d0-4b5c-7d6e-8f70-1a2b3c4d5e6f\",\"externalInstallationId\":\"browser-amaka-chrome\",\"permission\":\"granted\",\"targetKind\":\"web_push_subscription\",\"subscription\":{\"endpoint\":\"https://fcm.googleapis.com/fcm/send/dXNlci1zdWJzY3JpcHRpb24\",\"expirationTime\":null,\"keys\":{\"p256dh\":\"BAcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc\",\"auth\":\"CQkJCQkJCQkJCQkJCQkJCQ\"}}}'\n\nAPI reference: https://kirora.io/docs/api/reference/registerPushInstallation\n"
      },
      {
        "action": "journeys",
        "operationId": "listContactJourneys",
        "method": "GET",
        "path": "/v1/contacts/{id}/journeys",
        "summary": "List a contact's journey enrollments",
        "details": "Lists every journey enrollment of this contact, newest first: `active` while it is still moving through the steps, `completed` at the end, `exited` when it left early, with `exitReason` saying why. Pass `status=active` for the journeys they are in now.",
        "scope": "journeys:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "active",
              "completed",
              "exited"
            ],
            "description": "Only enrollments in this status: `active` for the journeys they are in now."
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactJourneys\n"
      },
      {
        "action": "list",
        "operationId": "listContacts",
        "method": "GET",
        "path": "/v1/contacts",
        "summary": "List contacts",
        "details": "Returns contacts in this workspace. To read one contact by its email address or your own id, use `GET /v1/contacts/{id}` with `idType`. `query` searches: it matches any part of the email address or name, ignoring case. `consent`, `suppressed`, `listId`, `segmentId`, `createdAfter` (inclusive) and `createdBefore` (exclusive) narrow the list and combine with each other and with `query`; an unknown list or segment is a 404. Each item is shaped like a single contact read: it carries its email suppression and the lists it is in (`listIds`). `meta.count` counts every contact matching the filters, up to 10000: beyond that it reports the cap and `meta.countExact` is `false`; both are counted on the first page only (null with a `cursor`). Results are newest first and cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "contacts:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Searches any part of the email address or name, ignoring case and accents in any script."
          },
          {
            "name": "consent",
            "flag": "consent",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Comma-separated channels, e.g. `email,push`: consent granted on each."
          },
          {
            "name": "suppressed",
            "flag": "suppressed",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "Whether email to the contact, or to its address, is suppressed."
          },
          {
            "name": "listId",
            "flag": "list-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only members of this list.",
            "alias": "listId"
          },
          {
            "name": "segmentId",
            "flag": "segment-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The segment's members as stored at its last background sweep, so a contact that matches only since then is not in it yet. For the live answer, list the segment's contacts (`GET /v1/segments/{id}/contacts`).",
            "alias": "segmentId"
          },
          {
            "name": "createdAfter",
            "flag": "created-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only contacts created at or after this time (inclusive).",
            "alias": "createdAfter"
          },
          {
            "name": "createdBefore",
            "flag": "created-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only contacts created before this time (exclusive).",
            "alias": "createdBefore"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContacts\n"
      },
      {
        "action": "lists",
        "operationId": "listContactLists",
        "method": "GET",
        "path": "/v1/contacts/{id}/lists",
        "summary": "List a contact's lists",
        "details": "Returns the lists one contact belongs to, with the time each membership began. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactLists\n"
      },
      {
        "action": "merge",
        "operationId": "mergeContacts",
        "method": "POST",
        "path": "/v1/contacts/{id}/merge",
        "summary": "Merge a contact into another",
        "details": "Merges this contact, a duplicate, into the one `keep` names, for one person recorded twice. The kept contact keeps its values and gains any the duplicate had that it lacks: identifiers, name, timezone, country, locale, and attributes and dates by key. An email address or phone it gains brings that channel's consent with it; its own consent otherwise stands. The duplicate's messages, events, conversions, devices and consent changes move to the kept contact; its lists and suppressions are added, and its topic choices fill in topics the kept contact has not chosen. Then the duplicate is deleted, ending its journey enrollments. It cannot be undone. While a message to either is being handed to the provider, which takes seconds, it returns 409 `CONTACT_SEND_IN_PROGRESS`; retry shortly. A message waiting to be retried moves to the kept contact and still sends; the duplicate's copy of a campaign both received is skipped (`contact_deleted`) instead; a push that already reached one of the duplicate's devices is marked `sent`, and one a push service refused is marked `failed`, as it would have ended anyway. A `keep` that names no contact is a 404, and merging a contact into itself a 400 at `keep`.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  keep*  one of { contactId* } | { externalId* } | { email* }\n\nExamples:\n  Merge an email-only duplicate into Amaka:\n    $ kirora contacts merge <id> -d '{\"keep\":{\"externalId\":\"customer-4821\"}}'\n\nAPI reference: https://kirora.io/docs/api/reference/mergeContacts\n"
      },
      {
        "action": "messages",
        "operationId": "listContactMessages",
        "method": "GET",
        "path": "/v1/contacts/{id}/messages",
        "summary": "List a contact's messages",
        "details": "Lists every message sent or attempted to this contact, from any source, newest first, with its outcome. Filter by `status`, `channel` or `messageType`; `createdAfter` (inclusive) and `createdBefore` (exclusive) bound when each was accepted.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "queued",
              "sending",
              "skipped",
              "sent",
              "failed",
              "delivered",
              "bounced",
              "complained"
            ],
            "description": "Only messages in this status."
          },
          {
            "name": "channel",
            "flag": "channel",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "email",
              "push"
            ],
            "description": "Only messages on this channel."
          },
          {
            "name": "messageType",
            "flag": "message-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "marketing",
              "transactional"
            ],
            "description": "Only messages of this type: `marketing` or `transactional`.",
            "alias": "messageType"
          },
          {
            "name": "createdAfter",
            "flag": "created-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted at or after this time (inclusive).",
            "alias": "createdAfter"
          },
          {
            "name": "createdBefore",
            "flag": "created-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted before this time (exclusive).",
            "alias": "createdBefore"
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactMessages\n"
      },
      {
        "action": "segments",
        "operationId": "listContactSegments",
        "method": "GET",
        "path": "/v1/contacts/{id}/segments",
        "summary": "List a contact's segments",
        "details": "Lists the segments the contact is in, newest entry first, from the stored membership the background evaluation keeps about every 15 minutes: the same answer as `GET /v1/contacts?segmentId=` and the `contact.entered_segment` events, up to about 15 minutes behind a live evaluation. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the segment's name, ignoring case."
          },
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactSegments\n"
      },
      {
        "action": "topics list",
        "operationId": "listContactTopics",
        "method": "GET",
        "path": "/v1/contacts/{id}/topics",
        "summary": "List a contact's topics",
        "details": "Lists every topic, with whether it reaches this contact.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listContactTopics\n"
      },
      {
        "action": "topics set",
        "operationId": "setContactTopic",
        "method": "PUT",
        "path": "/v1/contacts/{id}/topics/{topicId}",
        "summary": "Set a contact's topic choice",
        "details": "Joins a contact to a topic or removes them from it, in the shape identify's `topics` takes: `subscribed: true` or `false` holds for every channel and clears channel choices; `{ \"email\": true, \"push\": false }` sets each channel named and leaves the others (keep Product updates by email, not by push). Never an agent key, as for consent. Each change is recorded in consent changes with the member or key as actor. Joining on any channel needs `statement`, how the contact agreed, recorded as the proof; without it the request is refused with 400 `VALIDATION_ERROR` at `statement`. Leaving needs none.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "contact-id"
          },
          {
            "name": "topicId",
            "label": "topic-id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "body": [],
        "help": "\nBody fields only --data can carry (* required):\n  subscribed*  one of true/false | object\n  statement    { basis*, evidence*, consentedAt, wording }\n\nExamples:\n  Join by email, not by push:\n    $ kirora contacts topics set <contact-id> <topic-id> -d '{\"subscribed\":{\"email\":true,\"push\":false},\"statement\":{\"basis\":\"opted_in\",\"evidence\":\"Preference centre\"}}'\n  Leave on every channel:\n    $ kirora contacts topics set <contact-id> <topic-id> -d '{\"subscribed\":false}'\n\nAPI reference: https://kirora.io/docs/api/reference/setContactTopic\n"
      },
      {
        "action": "update",
        "operationId": "updateContact",
        "method": "PATCH",
        "path": "/v1/contacts/{id}",
        "summary": "Update a contact",
        "details": "Merges the supplied fields into an existing contact; omitted fields are left alone, and `attributes` is merged key by key rather than replaced; a key set to `null` is removed (JSON Merge Patch). Granting consent, on a channel or a topic, needs `consent.statement`, how the contact agreed; without it the write is refused with 400 `VALIDATION_ERROR` at `consent.statement`. Agent keys cannot mutate contacts or consent and are refused with 403.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "idType",
            "flag": "id-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "id",
              "externalId",
              "email"
            ],
            "description": "What `{id}` is: Kirora's id for the contact (`id`, the default), your own (`externalId`, as set with identify) or its email address (`email`, matched trimmed and without case).",
            "alias": "idType"
          }
        ],
        "body": [
          {
            "name": "externalId",
            "flag": "external-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Your own id for the contact, up to 255 characters. Identify matches on it first.",
            "alias": "externalId"
          },
          {
            "name": "email",
            "flag": "email",
            "kind": "string",
            "placeholder": "<email>"
          },
          {
            "name": "firstName",
            "flag": "first-name",
            "kind": "string",
            "placeholder": "<value>",
            "alias": "firstName"
          },
          {
            "name": "lastName",
            "flag": "last-name",
            "kind": "string",
            "placeholder": "<value>",
            "alias": "lastName"
          },
          {
            "name": "phone",
            "flag": "phone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Phone number; normalised to E.164 (a leading `+` and country code)."
          },
          {
            "name": "timezone",
            "flag": "timezone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "IANA timezone, e.g. `Europe/London`; used for send-time scheduling."
          },
          {
            "name": "country",
            "flag": "country",
            "kind": "string",
            "placeholder": "<value>",
            "description": "ISO 3166-1 alpha-2 code. Omitted, it is inferred from the phone, else the timezone."
          },
          {
            "name": "locale",
            "flag": "locale",
            "kind": "string",
            "placeholder": "<value>",
            "description": "BCP 47 tag (`fr`, `fr-CA`), stored canonical: the language the contact reads, and how merge tags format numbers, dates and money for them."
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  dates       object\n  attributes  object\n              Custom attributes, merged key by key; `null` removes one.\n  consent     { email, push, statement }\n\nExamples:\n  Change a name and an attribute:\n    $ kirora contacts update <id> -d '{\"lastName\":\"Obi\",\"attributes\":{\"plan\":\"pro\"}}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateContact\n"
      }
    ]
  },
  {
    "name": "conversion-goals",
    "description": "A conversion goal says what counts as a result for a campaign or a journey: an event, such as an order, done within a window after one of its messages, with an event property summed as revenue.",
    "operations": [
      {
        "action": "create",
        "operationId": "createConversionGoal",
        "method": "POST",
        "path": "/v1/conversion-goals",
        "summary": "Create a conversion goal",
        "details": "Counts an event as a conversion when the contact was sent the campaign or journey within the attribution window before it. Narrow which events count with `where` (property conditions, all must hold) and `occurrence` (`first` or `repeat` of the contact's events of that name), as a workspace goal's event step does. Set `valueProperty` to sum an event property (such as `total`) as revenue, and `currency` to label it; an event whose own `currency` property names another currency converts without a value, since amounts are never converted, and so does one whose value is negative, not numeric, or too large. Events from the goal's creation on are matched as they are processed; the retained history before it is matched in the background from `countedFrom`, so the goal's results fill in shortly after it is created. A campaign or journey can count one event under several goals with different filters; a second goal with the same event and filter is refused with `409 ALREADY_EXISTS`, since it would count every conversion twice. Goals count the workspace's own events, so the Free plan is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.",
        "scope": "conversion-goals:write",
        "query": [],
        "body": [
          {
            "name": "campaignId",
            "flag": "campaign-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The campaign it measures.",
            "alias": "campaignId"
          },
          {
            "name": "journeyId",
            "flag": "journey-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The journey it measures.",
            "alias": "journeyId"
          },
          {
            "name": "eventName",
            "flag": "event-name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The event that counts as a conversion.",
            "required": true,
            "alias": "eventName"
          },
          {
            "name": "occurrence",
            "flag": "occurrence",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "first",
              "repeat"
            ],
            "description": "`first`: only the contact's first event of these names; `repeat`: any after it. Read from the event history, so a contact whose earlier ones predate it counts as first seen (`coverageFrom` on progress says where the history starts); a property the customer sends (`first_order`) is the stricter signal. Absent: every one."
          },
          {
            "name": "valueProperty",
            "flag": "value-property",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The event property summed as revenue, such as `total`.",
            "alias": "valueProperty"
          },
          {
            "name": "currency",
            "flag": "currency",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The revenue's currency, an ISO 4217 code; needs `valueProperty`."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  where              list of { property*, operator*, value* }\n                     Property conditions the event must meet, up to 5; with several names, each of them must meet them.\n  attributionWindow  { value*, unit* }\n\nExamples:\n  Count orders after the journey's messages as conversions, with revenue:\n    $ kirora conversion-goals create -d '{\"journeyId\":\"0192f3a4-3d5e-7a7f-8c43-6b8c9d0e1f2a\",\"eventName\":\"Order Completed\",\"valueProperty\":\"total\",\"currency\":\"USD\"}'\n  Count only contacts' first orders of $50 or more:\n    $ kirora conversion-goals create -d '{\"journeyId\":\"0192f3a4-3d5e-7a7f-8c43-6b8c9d0e1f2a\",\"eventName\":\"Order Completed\",\"where\":[{\"property\":\"total\",\"operator\":\"gte\",\"value\":50}],\"occurrence\":\"first\",\"valueProperty\":\"total\",\"currency\":\"USD\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createConversionGoal\n"
      },
      {
        "action": "delete",
        "operationId": "deleteConversionGoal",
        "method": "DELETE",
        "path": "/v1/conversion-goals/{id}",
        "summary": "Delete a conversion goal",
        "details": "Removes the goal and the conversions recorded against it, for good. Refused with 409 `IN_USE` while it still decides something: a campaign's A/B test that picks its winner by conversions on this goal and has not picked one yet, or a live or paused journey with a conversion goal exit. `details.usedBy` names them (`campaigns`, `journeys`). In the dashboard, admins and owners only.",
        "scope": "conversion-goals:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteConversionGoal\n"
      },
      {
        "action": "list",
        "operationId": "listConversionGoals",
        "method": "GET",
        "path": "/v1/conversion-goals",
        "summary": "List the conversion goals of a campaign or journey",
        "details": "Pass exactly one of `campaignId` or `journeyId`. Cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it is `null`.",
        "scope": "conversion-goals:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "campaignId",
            "flag": "campaign-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The campaign's goals.",
            "alias": "campaignId"
          },
          {
            "name": "journeyId",
            "flag": "journey-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The journey's goals.",
            "alias": "journeyId"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listConversionGoals\n"
      },
      {
        "action": "metrics",
        "operationId": "getConversionGoalMetrics",
        "method": "GET",
        "path": "/v1/conversion-goals/{id}/metrics",
        "summary": "Report a conversion goal's results",
        "details": "Conversions, the contacts who converted out of those sent to, and revenue when the goal has a `valueProperty`. Revenue sums values in the goal currency only: a value counts when it is a non-negative number or numeric string (`\"49.90\"`, no thousands separators) up to 999,999,999,999.99. `conversionsWithoutValue` counts the conversions that carried none — the property missing or unusable, a negative (refunds are not revenue), or an event naming another currency — so it explains a gap between conversions and revenue. `reachedContacts` counts only sends a conversion could be credited to: from one attribution window before `countedFrom`. `conversionRate` is null until there is such a send. The totals are all time, every conversion the goal has counted since `countedFrom` (each under the attribution window in force when it was counted; see `windowChangedAt`); `history` covers the report window (`from` inclusive to `to` exclusive, the last 30 days by default) day by day in the workspace timezone.",
        "scope": "conversion-goals:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getConversionGoalMetrics\n"
      },
      {
        "action": "update",
        "operationId": "updateConversionGoal",
        "method": "PATCH",
        "path": "/v1/conversion-goals/{id}",
        "summary": "Change a conversion goal",
        "details": "Changes the attribution window, value property or currency for events processed from now on; conversions already counted keep their attribution and value, and are not counted again under the new window. Changing the window sets `windowChangedAt`, so a reader can tell the all-time totals mix both. Clearing `valueProperty` clears `currency` too. The event and its filter cannot change: create another goal.",
        "scope": "conversion-goals:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "valueProperty",
            "flag": "value-property",
            "kind": "string",
            "placeholder": "<value>",
            "alias": "valueProperty"
          },
          {
            "name": "currency",
            "flag": "currency",
            "kind": "string",
            "placeholder": "<value>"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  attributionWindow  { value*, unit* }\n\nExamples:\n  Credit orders up to a week after a message:\n    $ kirora conversion-goals update <id> -d '{\"attributionWindow\":{\"value\":7,\"unit\":\"days\"}}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateConversionGoal\n"
      }
    ]
  },
  {
    "name": "embed-sessions",
    "description": "Embed sessions let a partner's customers use Kirora's segment and email builders inside the partner's app for 15 minutes, without a key of their own.",
    "operations": [
      {
        "action": "create",
        "operationId": "createEmbedSession",
        "method": "POST",
        "path": "/v1/embed-sessions",
        "summary": "Create an embed session",
        "details": "Creates an embed session for one tenant. Partner keys only, from your server, with `Kirora-Workspace` naming the tenant. Returns a token the embedded segment and email builders send as `Authorization: Bearer es_…` for 15 minutes; the SDK asks your server for a new one before it expires. The key must have `allowedOrigins`, and a session is refused with 403 `EMBED_ORIGIN_NOT_ALLOWED` from any other origin. A session lets the chosen builders read what they need, render previews, count audiences, upload images and, when `testSendTo` lists addresses, send test emails to those addresses only. It never saves, publishes or sends anything else; your server saves what the builders return. It sees masked attributes as a member does, and attribute values and event property samples only with `includeAttributeValues`. Revoking the key ends every session it minted. Use a new `Idempotency-Key` for each session: a repeat with the same key within 24 hours returns the first session again, whose token may have expired.",
        "scope": "embed:write",
        "query": [],
        "body": [
          {
            "name": "components",
            "flag": "components",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "The builders the browser may load; each opens only the routes it needs.",
            "required": true
          },
          {
            "name": "includeAttributeValues",
            "flag": "include-attribute-values",
            "kind": "boolean",
            "description": "Lets the session read attribute values and event property samples, for value suggestions. Off by default: they are the workspace's customer data.",
            "alias": "includeAttributeValues"
          },
          {
            "name": "testSendTo",
            "flag": "test-send-to",
            "kind": "list",
            "placeholder": "<emails...>",
            "description": "Up to 5 addresses the email builder may send a test to, such as your signed-in user's. Defaults to none, which hides test sending. The builder can send to no other address.",
            "alias": "testSendTo"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A session for the segment and email builders:\n    $ kirora embed-sessions create -d '{\"components\":[\"segment_builder\",\"email_builder\"],\"testSendTo\":[\"ada@acme-shop.com\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/createEmbedSession\n"
      }
    ]
  },
  {
    "name": "events",
    "description": "An event is something a contact did, such as `Order Completed`, with properties describing it.",
    "operations": [
      {
        "action": "catalog define",
        "operationId": "defineEventName",
        "method": "PUT",
        "path": "/v1/events/catalog/{name}",
        "summary": "Define or describe an event name",
        "details": "Adds a name to the catalogue before the app sends it, so a journey, segment or goal can be built on it while the app's developers add it, or sets the description of a name already listed. Sending events with exactly this name then fills its figures. A name new to the workspace counts against its limit, and past it is refused with `EVENT_NAME_LIMIT_REACHED`; a name being deleted is 409 `CONFLICT`. `contact.*` names and `Ordered Product` are recorded by Kirora and refused. On `/v1` it takes `events:write`, which an agent key cannot hold.",
        "scope": "events:write",
        "pathParams": [
          {
            "name": "name",
            "label": "name"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What the event means, at most 255 characters: shown in the lists and pickers, and read by Kiro. `null` removes it.",
            "required": true
          }
        ],
        "help": "\nExamples:\n  Define a name before the app sends it:\n    $ kirora events catalog define <name> -d '{\"description\":\"A contact moved to a paid plan.\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/defineEventName\n"
      },
      {
        "action": "catalog delete",
        "operationId": "deleteEventName",
        "method": "DELETE",
        "path": "/v1/events/catalog/{name}",
        "summary": "Delete an event name and its events",
        "details": "Deletes the name and every event tracked under it, for a name sent by mistake; it cannot be undone. A name defined but never sent just leaves the catalogue. The name leaves the catalogue and the limit at once, and its events are removed within the hour; until then tracking it returns 409 `CONFLICT`, and deleting it again 404. A name that a journey, segment, campaign, conversion goal or active workspace goal reads is refused with 409 `IN_USE`, naming them in `details.usedBy` in the summary's shape. `contact.*` names are recorded by Kirora and cannot be deleted; `Ordered Product` goes with `Order Completed`.",
        "scope": "events:delete",
        "pathParams": [
          {
            "name": "name",
            "label": "name"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteEventName\n"
      },
      {
        "action": "catalog list",
        "operationId": "listEventCatalog",
        "method": "GET",
        "path": "/v1/events/catalog",
        "summary": "List the event catalogue",
        "details": "The workspace's event names, for the data index and for trigger, rule and goal pickers: Kirora's system names, each name the workspace has sent, and each one a person defined before sending it. Each has its `origin` (`system`, `standard` or `custom`), whether it has events (`recorded`), its description, when it was last seen, its last 30 days and how many journeys, segments, campaigns and goals read it. The figures are counted at most 15 minutes before `meta.countedAt`; a name sent for the first time is listed at once. `query`, `origin` and `recorded` filter, and `sort` orders, across every page. Standard names not yet sent are in `GET /events/standard-names`. Only the first page has `meta.nameUsage`: the names counted against the workspace's limit of 1,000, defined ones included; past it a new name is refused with `EVENT_NAME_LIMIT_REACHED`.",
        "scope": "events:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only names containing this, ignoring case."
          },
          {
            "name": "origin",
            "flag": "origin",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "system",
              "standard",
              "custom"
            ],
            "description": "Only names of this origin."
          },
          {
            "name": "recorded",
            "flag": "recorded",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: only names with events; `false`: only names without, such as one defined before it was sent."
          },
          {
            "name": "sort",
            "flag": "sort",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "-lastSeenAt",
              "lastSeenAt",
              "-last30DaysCount",
              "last30DaysCount",
              "name",
              "-name"
            ],
            "description": "A field ascending, or `-field` descending; ties go by name. A name with no events sorts last by `lastSeenAt` either way."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listEventCatalog\n"
      },
      {
        "action": "list",
        "operationId": "listEvents",
        "method": "GET",
        "path": "/v1/events",
        "summary": "List events",
        "details": "Every event the workspace tracked, accepted or rejected, newest first: did an integration's event arrive, and if not, why? Accepted events are ordered and filtered by when they happened, rejected ones by when they arrived; the log reaches back `meta.retention`. A rejected event is a tracked event the API refused (validation, an unknown contact, the name limit, a deleted name), kept as sent with the error it answered; a batch refused whole is listed event by event. A request refused before its body was read (credentials, rate limit, plan, size, broken JSON) is not kept. `query` matches an event name exactly, or a contact's id, email address or external id (accepted events only: a rejected one has no contact); property values are not searched. Complete, not sampled. For a member, a property whose key is a masked attribute is left out, as on contact reads.",
        "scope": "events:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only events of this name."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "accepted",
              "rejected"
            ],
            "description": "Only `accepted` events, or only `rejected` ones (refused, kept with the error)."
          },
          {
            "name": "source",
            "flag": "source",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "api",
              "web",
              "system",
              "stripe",
              "zapier",
              "make",
              "n8n",
              "segment"
            ],
            "description": "Only events that came in this way. Nothing indexes it, so a page polling for new events also sets `occurredAfter`."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "An event name, exactly as tracked, or a contact's id, email address or external id. Property values are not searched."
          },
          {
            "name": "occurredAfter",
            "flag": "occurred-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only events that happened at or after this time (inclusive), a rejected one by when it arrived; the log reaches back `meta.retention` at most.",
            "alias": "occurredAfter"
          },
          {
            "name": "occurredBefore",
            "flag": "occurred-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only events that happened before this time (exclusive).",
            "alias": "occurredBefore"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listEvents\n"
      },
      {
        "action": "series",
        "operationId": "getEventSeries",
        "method": "GET",
        "path": "/v1/events/series",
        "summary": "Retrieve an event's time series",
        "details": "How many events of a name happened in each hour or day of the workspace's timezone (`timezone`), to catch tracking that broke: a line that falls to zero after a release. Accepted events only; refused ones are in the event log (`status=rejected`) with the reason. `from` (inclusive) and `to` (exclusive) choose the window, a date meaning the start of that day in `timezone`; it runs from the bucket holding `from` to the one holding the moment before `to`, without gaps, at most 366 points. `from` must be before `to`. Events past retention are gone and not counted.",
        "scope": "events:read",
        "query": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The event name, exactly as it was tracked.",
            "required": true
          },
          {
            "name": "interval",
            "flag": "interval",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "hour",
              "day"
            ],
            "description": "The bucket size.",
            "required": true
          },
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. The series starts with the bucket holding it. By default 30 days (`day`) or 24 hours (`hour`) before `to`."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Exclusive, in the same forms: the series ends with the bucket holding the moment before it. Now by default."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getEventSeries\n"
      },
      {
        "action": "standard-names",
        "operationId": "listStandardEventNames",
        "method": "GET",
        "path": "/v1/events/standard-names",
        "summary": "List the standard event names",
        "details": "Kirora's standard names the workspace has neither sent nor defined, with what each means: Segment's e-commerce names (`commerce`) and its B2B SaaS names (`saas`). Offered beside the catalogue in pickers; once sent or defined, a name moves to the catalogue. Commerce names drive revenue: `Order Completed` with `total` and `currency`.",
        "scope": "events:read",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listStandardEventNames\n"
      },
      {
        "action": "summary",
        "operationId": "getEventSummary",
        "method": "GET",
        "path": "/v1/events/summary",
        "summary": "Retrieve an event's summary",
        "details": "Whether an event is arriving and what it looks like, before a segment or journey is built on it: when it last happened, how many happened in the last 30 days (counted up to 100,000, `countExact: false` past it), the property keys its latest 1,000 events carry with their types and up to five sample values, and what reads it. A custom name never tracked nor defined, or deleted, is a 404. For charts, read the series. An API key always gets the sample values. An embed session gets none unless minted with `includeAttributeValues`, and none for a key that is a masked attribute.",
        "scope": "events:read",
        "query": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The event name, exactly as it was tracked.",
            "required": true
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getEventSummary\n"
      },
      {
        "action": "track",
        "operationId": "trackEvent",
        "method": "POST",
        "path": "/v1/events/track",
        "summary": "Track an event",
        "details": "Records a behavioural event against a contact. Events drive journey triggers and segment rules, so this is the main ingestion endpoint for product activity. The event and its processing obligation are stored atomically: a 201 confirms storage, while journey and conversion effects run asynchronously afterwards. Name the contact by exactly one of `contactId`, `externalId` or `email`; a contact that does not exist is a 404, never created: identify it first. `occurredAt` defaults to now and may be at most 24 hours in the future; an event that arrives more than 72 hours after its `occurredAt` starts no journey, but still counts for history, exits and waits. Names are case-sensitive, up to 128 characters with no control characters, with leading and trailing spaces removed; those beginning with `contact.` are reserved for platform events. A workspace tracks at most 1,000 distinct names: a new one past that is refused with `EVENT_NAME_LIMIT_REACHED`, so keep ids and prices in `properties`. Send an `Idempotency-Key` from your own event id: without one, every request records a new event, so a retry after a timeout can record it twice and start a journey twice. A repeated `Idempotency-Key` with the same body returns the receipt first stored, with `Idempotency-Replay: true`; with a different body it is a 409 `IDEMPOTENCY_KEY_REUSED`. The body must be JSON (`Content-Type: application/json`). On the Free plan, which records only Kirora's own events, it is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.",
        "scope": "events:write",
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nThe body (--data) is one of:\n  { contactId*, name*, properties, occurredAt, context }\n  { externalId*, name*, properties, occurredAt, context }\n  { email*, name*, properties, occurredAt, context }\n\nExamples:\n  By Kirora contact id:\n    $ kirora events track -d '{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\",\"name\":\"Checkout Started\",\"occurredAt\":\"2026-10-01T09:30:00Z\"}'\n  By your own id, with properties:\n    $ kirora events track -d '{\"externalId\":\"customer-4821\",\"name\":\"Order Completed\",\"properties\":{\"order_id\":\"1001\",\"total\":46.5,\"currency\":\"USD\",\"products\":[{\"name\":\"Smoked paprika\",\"quantity\":3,\"price\":15.5}]},\"occurredAt\":\"2026-10-01T09:30:00Z\"}'\n  By email address, at the time it arrives:\n    $ kirora events track -d '{\"email\":\"amaka@example.com\",\"name\":\"Checkout Started\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/trackEvent\n"
      },
      {
        "action": "track-batch",
        "operationId": "trackEventsBatch",
        "method": "POST",
        "path": "/v1/events/batch",
        "summary": "Track events in a batch",
        "details": "Tracks up to 100 events in one request, each stored exactly as `POST /v1/events/track` would, in order, under its own `idempotencyKey` in place of the header. One event refused does not stop the rest: its entry carries the error a single track would have returned, and a key already used returns the stored event with `replayed: true`, or `IDEMPOTENCY_KEY_REUSED` if the event differs. An entry without a key is recorded every time it is sent. Retry a failed batch whole; the keys stop anything being stored twice. Counts against the rate limit as one request per event. On the Free plan the whole batch is refused with 403 `PLAN_FEATURE_UNAVAILABLE`.",
        "scope": "events:write",
        "query": [],
        "body": [],
        "help": "\nBody fields only --data can carry (* required):\n  events*  list of { idempotencyKey, event* }\n\nExamples:\n  Two events in one request:\n    $ kirora events track-batch -d '{\"events\":[{\"idempotencyKey\":\"order-1001-completed\",\"event\":{\"externalId\":\"customer-4821\",\"name\":\"Order Completed\",\"properties\":{\"order_id\":\"1001\",\"total\":45.5,\"currency\":\"USD\"},\"occurredAt\":\"2026-10-01T09:30:00Z\"}},{\"idempotencyKey\":\"order-1002-completed\",\"event\":{\"externalId\":\"customer-5307\",\"name\":\"Order Completed\",\"properties\":{\"order_id\":\"1002\",\"total\":18.5,\"currency\":\"USD\"},\"occurredAt\":\"2026-10-01T09:30:00Z\"}}]}'\n  One event fails, the other is recorded:\n    $ kirora events track-batch -d '{\"events\":[{\"idempotencyKey\":\"order-1003-completed\",\"event\":{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\",\"name\":\"Order Completed\",\"occurredAt\":\"2026-10-01T09:30:00Z\"}},{\"idempotencyKey\":\"order-1004-completed\",\"event\":{\"email\":\"nobody@example.com\",\"name\":\"Order Completed\",\"occurredAt\":\"2026-10-01T09:30:00Z\"}}]}'\n\nAPI reference: https://kirora.io/docs/api/reference/trackEventsBatch\n"
      }
    ]
  },
  {
    "name": "forms",
    "description": "A form is a hosted sign-up, contact or waitlist form that creates or updates contacts and records the consent they give.",
    "operations": [
      {
        "action": "archive",
        "operationId": "archiveForm",
        "method": "POST",
        "path": "/v1/forms/{id}/archive",
        "summary": "Archive a form",
        "details": "Hides the form from the list (`GET /v1/forms` leaves archived forms out unless `archived=true`) and stops it serving: a published form disappears from the sites embedding it. Its status, submissions and contacts stay.",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/archiveForm\n"
      },
      {
        "action": "create",
        "operationId": "createForm",
        "method": "POST",
        "path": "/v1/forms",
        "summary": "Create a form",
        "details": "Creates a hosted form (a sign-up, contact, waitlist or registration form), in draft. Submissions create or update contacts and record the consent configured on the form. Marketing sends check the recorded channel consent; you remain responsible for the permissions your messages require. An agent key may create one; it stays a draft, listed for review, until a person publishes it. The response carries `url`, the hosted link.",
        "scope": "forms:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          },
          {
            "name": "heading",
            "flag": "heading",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What visitors see above the fields; `null` clears it."
          },
          {
            "name": "intro",
            "flag": "intro",
            "kind": "string",
            "placeholder": "<value>",
            "description": "A line or two under the heading; `null` clears it."
          },
          {
            "name": "slug",
            "flag": "slug",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The readable part of the form's link (`forms.kirora.io/f/acme-newsletter`), unique across every workspace; `null` clears it. A new slug frees the old one, which then stops working; the link with `publicId` always works, so use that one on print and QR codes."
          },
          {
            "name": "acceptingSubmissions",
            "flag": "accepting-submissions",
            "kind": "boolean",
            "description": "`false` closes the form by hand, whatever its closing time and limit.",
            "alias": "acceptingSubmissions"
          },
          {
            "name": "closesAt",
            "flag": "closes-at",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "When the form closes; `null` for never.",
            "alias": "closesAt"
          },
          {
            "name": "maxSubmissions",
            "flag": "max-submissions",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The form closes once it has taken this many submissions (honeypot catches aside); `null` for no limit.",
            "alias": "maxSubmissions"
          },
          {
            "name": "closedMessage",
            "flag": "closed-message",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What a closed form shows; `null` shows the default wording.",
            "alias": "closedMessage"
          },
          {
            "name": "location",
            "flag": "location",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Where the form sits on your site, a label you choose (`website-footer`, `checkout-page`). Recorded on each submission, as `properties.location` on its `contact.form_submitted` event and on the `form.submitted` webhook, which is how a segment or journey uses it. Defaults to `form`."
          },
          {
            "name": "listId",
            "flag": "list-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The list every submitter is added to; `null` while the draft has none. A form cannot be published without one.",
            "alias": "listId"
          },
          {
            "name": "allowedOrigins",
            "flag": "allowed-origins",
            "kind": "list",
            "placeholder": "<urls...>",
            "description": "Site origins (scheme and host, no path) the embed may load from, such as `https://example.com`.",
            "alias": "allowedOrigins"
          },
          {
            "name": "doubleOptIn",
            "flag": "double-opt-in",
            "kind": "boolean",
            "description": "Ask submitters to confirm by email before they are subscribed.",
            "alias": "doubleOptIn"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  share         { title, description, imageUrl }\n                How the form's link previews in chat and social apps.\n  fields*       list of { key*, type*, label*, placeholder, required, options }\n                The fields, top to bottom.\n  hiddenFields  object\n                Values saved on each submitter with no field shown, each a contact attribute: fixed (`\"spring\"`), or taken from the link (`{ \"fromParam\": \"utm_campaign\" }`).\n  theme         { mode, accentColor, backgroundColor, textColor, buttonColor, buttonTextColor, fontFamily, borderRadius, buttonLabel, inputs, button, layout }\n  display       one of { mode*: \"inline\" } | { mode*: \"popup\", delay, scrollPercent, exitIntent, urlMatch, hideFor, hideAfterSubmit }\n  captcha       one of { mode*: \"kirora\" } | { mode*: \"own\", siteKey*, secretKey }\n                CAPTCHA for submissions: `{ mode: \"kirora\" }` (the default on a new form), `{ mode: \"own\", siteKey, secretKey }` for your Cloudflare Turnstile widget, or `null` for none.\n  consent*      { required*: true, label* }\n                The consent box every submitter must tick.\n  success       one of { type*: \"message\", message* } | { type*: \"redirect\", redirectUrl* }\n                What happens after a submission.\n\nExamples:\n  A newsletter signup with double opt-in:\n    $ kirora forms create -d '{\"name\":\"Newsletter signup\",\"heading\":\"Join the Acme Shop newsletter\",\"intro\":\"New arrivals and offers, once a week.\",\"location\":\"website-footer\",\"slug\":\"acme-newsletter\",\"share\":{\"title\":\"Get the Acme Shop newsletter\"},\"hiddenFields\":{\"signup_campaign\":{\"fromParam\":\"utm_campaign\"}},\"listId\":\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\",\"fields\":[{\"key\":\"email\",\"type\":\"email\",\"label\":\"Email address\",\"placeholder\":\"you@example.com\",\"required\":true},{\"key\":\"firstName\",\"type\":\"text\",\"label\":\"First name\",\"required\":false}],\"allowedOrigins\":[\"https://acme-shop.com\"],\"doubleOptIn\":true,\"theme\":{\"accentColor\":\"#b4461f\",\"fontFamily\":\"sans\",\"buttonLabel\":\"Subscribe\"},\"consent\":{\"required\":true,\"label\":\"I agree to receive emails from Acme Shop and can unsubscribe at any time.\"},\"success\":{\"type\":\"message\",\"message\":\"Thanks. Check your inbox to confirm.\"}}'\n\nAPI reference: https://kirora.io/docs/api/reference/createForm\n"
      },
      {
        "action": "delete",
        "operationId": "deleteForm",
        "method": "DELETE",
        "path": "/v1/forms/{id}",
        "summary": "Delete a form",
        "details": "Deletes the form and stops accepting submissions for it. Contacts already created through it are not affected. Refused with 409 `IN_USE` while an active or paused journey names it (its trigger, an exit or a step), listing those journeys in `details.journeys`: end them, or edit them, first.",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteForm\n"
      },
      {
        "action": "get",
        "operationId": "getForm",
        "method": "GET",
        "path": "/v1/forms/{id}",
        "summary": "Retrieve a form",
        "details": "Returns one form including its field and consent configuration.",
        "scope": "forms:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getForm\n"
      },
      {
        "action": "list",
        "operationId": "listForms",
        "method": "GET",
        "path": "/v1/forms",
        "summary": "List forms",
        "details": "Returns forms in this workspace, leaving archived ones out unless `archived=true`. Pass `status` to list only forms in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "forms:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the form's name, ignoring case."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "draft",
              "published"
            ],
            "description": "Only forms in this status."
          },
          {
            "name": "archived",
            "flag": "archived",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true` lists archived forms only; unset or `false` leaves them out."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listForms\n"
      },
      {
        "action": "metrics",
        "operationId": "getFormMetrics",
        "method": "GET",
        "path": "/v1/forms/{id}/metrics",
        "summary": "Retrieve a form's metrics",
        "details": "Returns a form's submissions by outcome, views and the submit rate over the window (the last 30 days unless `from` and `to` say otherwise), split by where visitors came from (`byTrafficSource`) and how the form showed (`byPlacement`).",
        "scope": "forms:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days. A date-time falls on a quarter hour, since views are counted per quarter hour."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getFormMetrics\n"
      },
      {
        "action": "publish",
        "operationId": "publishForm",
        "method": "POST",
        "path": "/v1/forms/{id}/publish",
        "summary": "Publish a form",
        "details": "Puts the form live: its link (`url`) and embeds take submissions, adding each submitter to its list. It needs a list (409 `DRAFT_INCOMPLETE` at `listId`). Publishing a published form returns it. Agent keys are refused with 403 `AGENT_KEY_REFUSED`: a person puts a form live.",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/publishForm\n"
      },
      {
        "action": "submissions list",
        "operationId": "listFormSubmissions",
        "method": "GET",
        "path": "/v1/forms/{id}/submissions",
        "summary": "List a form's submissions",
        "details": "Lists every submission of the form, newest first, with the contact it created or updated as that contact is now; `outcome` narrows the list. Reading them needs `contacts:read`, since each names a person.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "outcome",
            "flag": "outcome",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "created",
              "updated",
              "honeypot",
              "pending",
              "expired"
            ],
            "description": "Only submissions with this outcome."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listFormSubmissions\n"
      },
      {
        "action": "submissions submit",
        "operationId": "submitForm",
        "method": "POST",
        "path": "/v1/forms/{id}/submissions",
        "summary": "Submit a form",
        "details": "Submits a double opt-in form for a person your own system signs up: the answers go through the form's fields as a visitor's would, the contact is recorded without consent, and Kirora emails them the form's confirmation link; consent, lists and topics follow when they confirm. Only a published, unarchived double opt-in form with a list takes it: any other answers 409 `CONFLICT` saying which. An address gets at most one confirmation per form per day. Answers are checked as the form checks them (400). Each call is a new sign-up that counts toward the form's limit, so send an `Idempotency-Key` to retry safely. A plain server sign-up with consent goes through `POST /v1/contacts/identify` with a consent `statement`. Agent keys are refused with 403.",
        "scope": "contacts:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  fields*  object\n           Answers by field `key`.\n\nExamples:\n  Sign up a person your system collected; they confirm by email:\n    $ kirora forms submissions submit <id> -d '{\"fields\":{\"email\":\"amaka@example.com\",\"firstName\":\"Amaka\"}}'\n\nAPI reference: https://kirora.io/docs/api/reference/submitForm\n"
      },
      {
        "action": "unarchive",
        "operationId": "unarchiveForm",
        "method": "POST",
        "path": "/v1/forms/{id}/unarchive",
        "summary": "Unarchive a form",
        "details": "Returns an archived form to the list. A form that was published is live again at once, so an agent key cannot unarchive a published form (403 `AGENT_KEY_REFUSED`).",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/unarchiveForm\n"
      },
      {
        "action": "unpublish",
        "operationId": "unpublishForm",
        "method": "POST",
        "path": "/v1/forms/{id}/unpublish",
        "summary": "Unpublish a form",
        "details": "Sets the form back to `draft`: its link and embeds stop taking submissions until it is published again. Its submissions and contacts stay. Unpublishing a draft returns it. Agent keys are refused with 403 `AGENT_KEY_REFUSED`.",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/unpublishForm\n"
      },
      {
        "action": "update",
        "operationId": "updateForm",
        "method": "PATCH",
        "path": "/v1/forms/{id}",
        "summary": "Update a form",
        "details": "Changes a form's fields, consent text or success behaviour. Existing submissions are not revisited. Publishing is its own call, `POST /v1/forms/{id}/publish`. An agent key edits drafts only: it cannot change a published form (403 `AGENT_KEY_REFUSED`), since a live form signs people up into its list and topics at once. A person unpublishes it before an agent edits it.",
        "scope": "forms:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "heading",
            "flag": "heading",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What visitors see above the fields; `null` clears it."
          },
          {
            "name": "intro",
            "flag": "intro",
            "kind": "string",
            "placeholder": "<value>",
            "description": "A line or two under the heading; `null` clears it."
          },
          {
            "name": "slug",
            "flag": "slug",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The readable part of the form's link (`forms.kirora.io/f/acme-newsletter`), unique across every workspace; `null` clears it. A new slug frees the old one, which then stops working; the link with `publicId` always works, so use that one on print and QR codes."
          },
          {
            "name": "acceptingSubmissions",
            "flag": "accepting-submissions",
            "kind": "boolean",
            "description": "`false` closes the form by hand, whatever its closing time and limit.",
            "alias": "acceptingSubmissions"
          },
          {
            "name": "closesAt",
            "flag": "closes-at",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "When the form closes; `null` for never.",
            "alias": "closesAt"
          },
          {
            "name": "maxSubmissions",
            "flag": "max-submissions",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The form closes once it has taken this many submissions (honeypot catches aside); `null` for no limit.",
            "alias": "maxSubmissions"
          },
          {
            "name": "closedMessage",
            "flag": "closed-message",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What a closed form shows; `null` shows the default wording.",
            "alias": "closedMessage"
          },
          {
            "name": "location",
            "flag": "location",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Where the form sits on your site, a label you choose (`website-footer`, `checkout-page`). Recorded on each submission, as `properties.location` on its `contact.form_submitted` event and on the `form.submitted` webhook, which is how a segment or journey uses it."
          },
          {
            "name": "listId",
            "flag": "list-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The list every submitter is added to; `null` clears it, which only a draft may.",
            "alias": "listId"
          },
          {
            "name": "allowedOrigins",
            "flag": "allowed-origins",
            "kind": "list",
            "placeholder": "<urls...>",
            "description": "Site origins (scheme and host, no path) the embed may load from.",
            "alias": "allowedOrigins"
          },
          {
            "name": "doubleOptIn",
            "flag": "double-opt-in",
            "kind": "boolean",
            "description": "Ask submitters to confirm by email before they are subscribed.",
            "alias": "doubleOptIn"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  share         { title, description, imageUrl }\n                How the form's link previews in chat and social apps.\n  fields        list of { key*, type*, label*, placeholder, required, options }\n                The fields, top to bottom.\n  hiddenFields  object\n                Values saved on each submitter with no field shown: fixed, or taken from the link.\n  theme         { mode, accentColor, backgroundColor, textColor, buttonColor, buttonTextColor, fontFamily, borderRadius, buttonLabel, inputs, button, layout }\n  display       one of { mode*: \"inline\" } | { mode*: \"popup\", delay, scrollPercent, exitIntent, urlMatch, hideFor, hideAfterSubmit }\n  captcha       one of { mode*: \"kirora\" } | { mode*: \"own\", siteKey*, secretKey }\n                CAPTCHA for submissions: `{ mode: \"kirora\" }` (the default on a new form), `{ mode: \"own\", siteKey, secretKey }` for your Cloudflare Turnstile widget, or `null` for none.\n  consent       { required*: true, label* }\n                The consent box every submitter must tick.\n  success       one of { type*: \"message\", message* } | { type*: \"redirect\", redirectUrl* }\n                What happens after a submission.\n\nExamples:\n  Change the heading visitors see:\n    $ kirora forms update <id> -d '{\"heading\":\"Get 10% off your first order\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateForm\n"
      }
    ]
  },
  {
    "name": "journeys",
    "description": "A journey is an automation that contacts enter on a trigger, such as an event or joining a list, and move through step by step over time.",
    "operations": [
      {
        "action": "activate",
        "operationId": "activateJourney",
        "method": "POST",
        "path": "/v1/journeys/{id}/activate",
        "summary": "Activate a journey",
        "details": "Starts the journey running, so matching contacts begin entering it. Requires a whole journey (409 `DRAFT_INCOMPLETE` lists each missing field in `errors`, including anything the journey names that no longer exists: a list, segment or form in its trigger or exit conditions, a list or webhook an action step names, a topic a send step uses, a segment a filter or split rule names; and a webhook endpoint that is paused or disabled) and, for any step that sends email, a from-address on a verified sending domain (409 `SENDING_DOMAIN_UNVERIFIED`, or `SENDING_DOMAIN_DMARC_MISSING` while it has no DMARC record). Agent keys are refused with 403. Activating a paused journey resumes it: people partway through carry on where they were. With `{ \"enrollCurrentMembers\": true }`, the people already in the trigger's list or segment are enrolled too, in the background over the next minutes: anyone the journey has ever enrolled is skipped (even when re-entry is repeatable: this is a catch-up, not a re-entry), as are entries past `maxEntries`. On a resume it covers people who joined while it was paused; on a running journey it starts the catch-up unless one is under way. Without it, only people who join from now enter. Another trigger type returns 400 `VALIDATION_ERROR` at `enrollCurrentMembers`; a date trigger always includes current matches, and an event trigger has none. `enrolledCount` and the metrics show the progress.",
        "scope": "journeys:activate",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "enrollCurrentMembers",
            "flag": "enroll-current-members",
            "kind": "boolean",
            "description": "For a `list` or `segment` trigger: also enroll the people already in it, in the background, skipping anyone the journey has ever enrolled and any entry past `maxEntries`. Default `false`: only people who join from now enter.",
            "alias": "enrollCurrentMembers"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A list journey also enrolls the people already on the list:\n    $ kirora journeys activate <id> -d '{\"enrollCurrentMembers\":true}'\n\nAPI reference: https://kirora.io/docs/api/reference/activateJourney\n"
      },
      {
        "action": "create",
        "operationId": "createJourney",
        "method": "POST",
        "path": "/v1/journeys",
        "summary": "Create a journey",
        "details": "Creates a multi-step automation in a draft state. A draft saves unfinished: it needs a name and a trigger, but may have no steps yet and send steps without their content; what is given is checked. Each step has an `id` you choose, unique within the journey, and transitions (`nextStep`, `onMatchStep`, `otherwiseStep`, split paths) name those ids: a step whose `nextStep` is omitted goes on to the next step in `steps`, `null` ends the journey there, and a branch's last step should set `null`. A transition to a step that does not exist, or one that leads back to a step already passed (a loop), is a 400 at that field. A journey does not run until it is activated, which needs it whole (409 `DRAFT_INCOMPLETE` lists each missing field in `errors`); edit it with `PATCH /v1/journeys/{id}`. An email step is built from its design (`templateSnapshot`): any `html` or `text` sent beside it is replaced by the design's rendering. A send step may set `onUnreachableStep` (the contact cannot receive the channel) and `onFailureStep`: taken when the message cannot be queued because the plan's sending allowance is used up (it is recorded `skipped`, reason `plan_limit_reached`). Delivery happens after the enrollment has moved on, so a later bounce or provider error does not branch. A contact enters one repeatable journey at most 10 times an hour, whatever its `waitAfterEntry`; past that, entries are skipped and the workspace admins are notified (`journey_loop_detected`).",
        "scope": "journeys:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          },
          {
            "name": "maxEntries",
            "flag": "max-entries",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The most enrollments the journey starts over its life; `null` or unset has no cap.",
            "alias": "maxEntries"
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  trigger*        one of { type*: \"event\", name*, where, reentry } | { type*: \"list\", listId, reentry } | { type*: \"segment\", segmentId, on, reentry } | { type*: \"form\", formId, where, reentry } | { type*: \"attribute\", key*, where, reentry } | { field*, recurrence*, offset, time*, leapDay, type*: \"date\" }\n  exitConditions  list of one of { type*: \"event\", name*, where } | { type*: \"conversion_goal\" }\n                  Events that end a contact's enrollment early.\n  steps*          list of one of { id*, name, type*: \"wait\", duration, until, businessDays, window, nextStep } | { id*, name, type*: \"wait_until\", event*, timeout*, onMatchStep*, onTimeoutStep* } | { id*, name, type*: \"digest\", gatherFor*, nextStep } | { id*, name, type*: \"send\", channel*: \"email\", content*, nextStep, onUnreachableStep, onFailureStep, topicId, transactional } | { id*, name, type*: \"send\", channel*: \"push\", content*, nextStep, onUnreachableStep, onFailureStep, topicId } | { id*, name, type*: \"branch\", where*, onMatchStep*, otherwiseStep* } | { id*, name, type*: \"filter\", mode*, rules*, onMatchStep*, otherwiseStep } | { id*, name, type*: \"split\", paths*, otherwiseStep* } | { id*, name, type*: \"random_split\", paths* } | { id*, name, type*: \"action\", action*, nextStep }\n                  The steps.\n  messageLimits   { apply*, retryFor }\n  utm             { enabled*, source, medium, campaign, content, term }\n                  Link tags for the journey's email, as on campaigns; unset follows the workspace.\n\nExamples:\n  Wait an hour after sign-up, then send a welcome email:\n    $ kirora journeys create -d '{\"name\":\"Welcome series\",\"trigger\":{\"type\":\"event\",\"name\":\"Signed Up\",\"reentry\":{\"mode\":\"once\"}},\"steps\":[{\"id\":\"wait-an-hour\",\"name\":\"Wait an hour\",\"type\":\"wait\",\"duration\":{\"value\":1,\"unit\":\"hours\"}},{\"id\":\"welcome-email\",\"name\":\"Welcome email\",\"type\":\"send\",\"channel\":\"email\",\"content\":{\"subject\":\"Welcome to Acme Shop\",\"previewText\":\"Your first order ships free\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"templateSnapshot\":{\"schemaVersion\":1,\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Welcome to Acme Shop\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, your first order ships free.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Start shopping\",\"href\":\"https://acme-shop.com\"}],\"theme\":{}}},\"nextStep\":null}],\"messageLimits\":{\"apply\":true,\"retryFor\":{\"value\":24,\"unit\":\"hours\"}},\"tags\":[\"Onboarding\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/createJourney\n"
      },
      {
        "action": "delete",
        "operationId": "deleteJourney",
        "method": "DELETE",
        "path": "/v1/journeys/{id}",
        "summary": "Delete a journey",
        "details": "Deletes an ended journey, or one nobody has entered. An active or paused journey that contacts have entered is refused with 409 `CONFLICT`: end it first. The enrollments and messages of a deleted journey are kept: messages stay in message history and the contact timeline with `journeyId` `null`, and their web versions keep working.",
        "scope": "journeys:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteJourney\n"
      },
      {
        "action": "duplicate",
        "operationId": "duplicateJourney",
        "method": "POST",
        "path": "/v1/journeys/{id}/duplicate",
        "summary": "Duplicate a journey",
        "details": "Copies the journey definition into a new `draft`, named `name` (default \"Copy of\" and the original's name) and tagged `tags` (default the original's). Enrollments and metrics are not copied; step ids are, so the copy's metrics count apart by journey.",
        "scope": "journeys:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The copy's name; defaults to \"Copy of\" and the original's."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "The copy's tags; defaults to the original's."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A draft copy with its own name and tags:\n    $ kirora journeys duplicate <id> -d '{\"name\":\"Welcome series (Spain)\",\"tags\":[\"Onboarding\",\"Spain\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/duplicateJourney\n"
      },
      {
        "action": "end",
        "operationId": "endJourney",
        "method": "POST",
        "path": "/v1/journeys/{id}/end",
        "summary": "End a journey",
        "details": "Ends the journey for good: nobody enters it again, and every contact still partway through exits with reason `journey_ended`, so nothing more is sent. Its enrollments and statistics are kept. An ended journey cannot be edited or activated (409 `CONFLICT`); duplicate it to run it again. Needs `journeys:write`, so agent keys may end a journey.",
        "scope": "journeys:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/endJourney\n"
      },
      {
        "action": "get",
        "operationId": "getJourney",
        "method": "GET",
        "path": "/v1/journeys/{id}",
        "summary": "Retrieve a journey",
        "details": "Returns one journey including its current step definition.",
        "scope": "journeys:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getJourney\n"
      },
      {
        "action": "list",
        "operationId": "listJourneys",
        "method": "GET",
        "path": "/v1/journeys",
        "summary": "List journeys",
        "details": "Returns journeys in this workspace. Pass `status` to list only journeys in that state. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one. Failed and skipped messages are in `GET /v1/journeys/{id}/metrics`, over a window you choose.",
        "scope": "journeys:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the journey's name, ignoring case."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "draft",
              "active",
              "paused",
              "ended"
            ],
            "description": "Only journeys in this status."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only items carrying this tag, its name matched without case."
          },
          {
            "name": "pendingAgentReview",
            "flag": "pending-agent-review",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: only journeys waiting in the agent review queue; `false`: only those not.",
            "alias": "pendingAgentReview"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listJourneys\n"
      },
      {
        "action": "metrics",
        "operationId": "getJourneyMetrics",
        "method": "GET",
        "path": "/v1/journeys/{id}/metrics",
        "summary": "Retrieve a journey's metrics",
        "details": "Enrollments, messages and conversions for one journey over the report window (`from` inclusive, `to` exclusive, the last 30 days by default), counted by when each thing happened: an enrollment in the window started in it, wherever it is now. `active` is now. `exited` includes `conversionGoalReached`, the enrollments that left by reaching a conversion goal. `messages` counts what failed or was skipped; `conversions` gives each conversion goal of the journey its conversions and gross revenue (before refunds), credited to its messages. For where people are step by step, use `GET /v1/journeys/{id}/step-metrics`. Deleting a contact deletes their runs of the journey and those messages, so a past window can later show less than it did.",
        "scope": "journeys:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getJourneyMetrics\n"
      },
      {
        "action": "pause",
        "operationId": "pauseJourney",
        "method": "POST",
        "path": "/v1/journeys/{id}/pause",
        "summary": "Pause a journey",
        "details": "Stops new contacts entering the journey. Contacts already partway through stay where they are and resume if the journey is activated again. Only an active journey can be paused: a draft returns 409 `CONFLICT`. Needs `journeys:write`, so agent keys may pause; activating again needs `journeys:activate`.",
        "scope": "journeys:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/pauseJourney\n"
      },
      {
        "action": "simulate",
        "operationId": "simulateJourney",
        "method": "POST",
        "path": "/v1/journeys/{id}/simulate",
        "summary": "Simulate a journey",
        "details": "Previews an enrollment without sending. `entry` says whether the contact would enter now: a date journey needs a valid date in its field; an event journey checks the supplied eventProperties against the trigger's conditions, then re-entry. The path follows branches on eventProperties and filters and splits on the contact as they are now; a wait-until step takes its match path. Each send step is checked against suppression, consent, topics and devices: `would_send`, `unreachable` (takes the fallback path), `failed` (the email allowance is used up and the step has `onFailureStep`) or `would_skip`, with the refusal code in `reason` (`DRAFT_INCOMPLETE` for a send step not yet finished: a draft simulates too; `PLAN_LIMIT_REACHED` when the email allowance is used up). An ended journey returns `journey_ended`; a draft or paused one is previewed as if live. A date journey enters only when its date is due now in the contact's timezone (`date_not_due` otherwise), once per occurrence; when due, its branches read the date occurrence instead of `eventProperties`. `maxEntries` and the hourly re-entry cap apply as they do live. Message limits, the push allowance and send-time scheduling are not previewed.",
        "scope": "journeys:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "contactId",
            "flag": "contact-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The contact to simulate.",
            "required": true,
            "alias": "contactId"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  eventProperties  object\n                   Properties of a trigger event to simulate, checked against the trigger's conditions.\n\nExamples:\n  Preview one contact without sending:\n    $ kirora journeys simulate <id> -d '{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/simulateJourney\n"
      },
      {
        "action": "step-metrics",
        "operationId": "getJourneyStepMetrics",
        "method": "GET",
        "path": "/v1/journeys/{id}/step-metrics",
        "summary": "Retrieve a journey's metrics step by step",
        "details": "Where people are and what each step did, by step id across every version of the journey, so a step keeps its counts when others are added or moved. It counts the enrollments that entered the journey in the window (all time by default), wherever they are now; `GET /v1/journeys/{id}/metrics` counts by when each thing happened instead. Send steps carry their messages (`email` or `push`) and conversions; a random split, each path and how it converted. Deleting a contact deletes their runs of the journey and those messages, so a past window can later show less than it did.",
        "scope": "journeys:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Count only the enrollments that entered from then, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for all time."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Count only the enrollments that entered before then, exclusive, in the same forms. To include a whole last day, pass the day after it. No later than the end of today; a window touches at most 366 days. Give with `from`."
          },
          {
            "name": "includeRemovedSteps",
            "flag": "include-removed-steps",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: also the steps no longer in the journey that enrollments passed through, with `removed: true`.",
            "alias": "includeRemovedSteps"
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getJourneyStepMetrics\n"
      },
      {
        "action": "update",
        "operationId": "updateJourney",
        "method": "PATCH",
        "path": "/v1/journeys/{id}",
        "summary": "Update a journey",
        "details": "Updates a journey's definition. Works while the journey is live, where the edit must leave it whole (409 `DRAFT_INCOMPLETE`); a draft or paused journey saves unfinished. `trigger` and `steps` are replaced whole. People partway through keep the path they entered on (waits, branches, splits, which steps exist); the edit applies to new entries. A send step's content (subject, body, sender, push message) is the exception: a change reaches everyone who has not yet reached that step, matched by the step `id`, so keep the `id` when fixing a step. An id names one step for the journey's life: reusing a deleted step's id merges their metrics. Changing the trigger kind or recurrence after anyone has entered is refused with 409. An agent key may edit a draft or paused journey, which marks it agent-authored so a person must confirm it before activation; editing an active journey is refused with 403. With `expectedRevision`, a retry after a timeout whose first attempt landed returns 409 `REVISION_CONFLICT`: read the journey, and if it already holds your change, the update went through.",
        "scope": "journeys:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "maxEntries",
            "flag": "max-entries",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The most enrollments the journey starts over its life; `null` or unset has no cap.",
            "alias": "maxEntries"
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Replaces the tags whole (`[]` removes them), matched without case. Tags change on a journey in any status, an agent key included: they send nothing."
          },
          {
            "name": "expectedRevision",
            "flag": "expected-revision",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there.",
            "alias": "expectedRevision"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  trigger         one of { type*: \"event\", name*, where, reentry } | { type*: \"list\", listId, reentry } | { type*: \"segment\", segmentId, on, reentry } | { type*: \"form\", formId, where, reentry } | { type*: \"attribute\", key*, where, reentry } | { field*, recurrence*, offset, time*, leapDay, type*: \"date\" }\n  exitConditions  list of one of { type*: \"event\", name*, where } | { type*: \"conversion_goal\" }\n                  Events that end a contact's enrollment early.\n  steps           list of one of { id*, name, type*: \"wait\", duration, until, businessDays, window, nextStep } | { id*, name, type*: \"wait_until\", event*, timeout*, onMatchStep*, onTimeoutStep* } | { id*, name, type*: \"digest\", gatherFor*, nextStep } | { id*, name, type*: \"send\", channel*: \"email\", content*, nextStep, onUnreachableStep, onFailureStep, topicId, transactional } | { id*, name, type*: \"send\", channel*: \"push\", content*, nextStep, onUnreachableStep, onFailureStep, topicId } | { id*, name, type*: \"branch\", where*, onMatchStep*, otherwiseStep* } | { id*, name, type*: \"filter\", mode*, rules*, onMatchStep*, otherwiseStep } | { id*, name, type*: \"split\", paths*, otherwiseStep* } | { id*, name, type*: \"random_split\", paths* } | { id*, name, type*: \"action\", action*, nextStep }\n                  The steps.\n  messageLimits   { apply*, retryFor }\n  utm             { enabled*, source, medium, campaign, content, term }\n                  Link tags for the journey's email, as on campaigns; unset follows the workspace.\n\nExamples:\n  Rename, guarding against a concurrent edit:\n    $ kirora journeys update <id> -d '{\"name\":\"Welcome series (2026)\",\"expectedRevision\":1}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateJourney\n"
      }
    ]
  },
  {
    "name": "lists",
    "description": "A list is a fixed set of contacts you add and remove yourself; its membership changes only when you change it.",
    "operations": [
      {
        "action": "contacts add",
        "operationId": "addListContacts",
        "method": "POST",
        "path": "/v1/lists/{id}/contacts",
        "summary": "Add contacts to a list",
        "details": "Adds up to 500 contacts to a list in one batch, named by exactly one of `contactIds`, `externalIds` or `emails`. Contacts already in the list are skipped rather than rejected, so the call is safe to repeat; the response reports how many were actually added, and lists in `notFound` the identifiers that name no contact in this workspace (no contact is created). Each contact added records a `contact.added_to_list` event, which starts the journeys triggered by joining the list: adding 500 people to a list with a welcome journey starts 500 welcome journeys. Because that sends without a person confirming it, agent keys are refused with 403 `AGENT_KEY_REFUSED`.",
        "scope": "lists:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "help": "\nThe body (--data) is one of:\n  { contactIds* }\n  { externalIds* }\n  { emails* }\n\nExamples:\n  Add contacts by email:\n    $ kirora lists contacts add <id> -d '{\"emails\":[\"amaka@example.com\",\"unknown@example.com\"]}'\n  Add contacts by Kirora id:\n    $ kirora lists contacts add <id> -d '{\"contactIds\":[\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/addListContacts\n"
      },
      {
        "action": "contacts delete",
        "operationId": "deleteListContacts",
        "method": "POST",
        "path": "/v1/lists/{id}/contacts/delete",
        "summary": "Delete contacts from a list",
        "details": "Takes up to 500 contacts out of a list in one batch, named by exactly one of `contactIds`, `externalIds` or `emails`: a POST, since some clients and proxies drop the body of a DELETE. The contacts themselves are kept. Contacts that were not members are ignored; the response reports how many were actually taken out, and lists in `notFound` the identifiers that name no contact in this workspace. Agent keys are refused with 403 `AGENT_KEY_REFUSED`.",
        "scope": "lists:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "idempotencyKey": "optional",
        "destructive": true,
        "help": "\nThe body (--data) is one of:\n  { contactIds* }\n  { externalIds* }\n  { emails* }\n\nExamples:\n  Take contacts out by your own id:\n    $ kirora lists contacts delete <id> -d '{\"externalIds\":[\"customer-4821\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/deleteListContacts\n"
      },
      {
        "action": "create",
        "operationId": "createList",
        "method": "POST",
        "path": "/v1/lists",
        "summary": "Create a list",
        "details": "Creates a static list: membership is explicit, unlike a segment, which is evaluated from rules. Names are unique within the workspace, ignoring case: \"VIP\" and \"vip\" are one list (409 `ALREADY_EXISTS`).",
        "scope": "lists:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace, ignoring case.",
            "required": true
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A static list:\n    $ kirora lists create -d '{\"name\":\"Newsletter\",\"description\":\"Everyone who wants the monthly newsletter\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createList\n"
      },
      {
        "action": "delete",
        "operationId": "deleteList",
        "method": "DELETE",
        "path": "/v1/lists/{id}",
        "summary": "Delete a list",
        "details": "Deletes the list and its membership records. The contacts themselves are not deleted. Refused with one 409 `IN_USE` naming everything that blocks it, in the shape of `getListUsage`: campaigns not yet sent or cancelled (A/B tests included) whose audience, rules or exclusions name it (`details.campaigns`), published forms that add submitters to it or name it in a field (`details.forms`): without the list a form refuses every submission. Also active or paused journeys (`details.journeys`) and segments whose rules name it (`details.segments`): a \"not in this list\" rule must not outlive the list. Change or end those first. A sent or cancelled campaign does not block it: the campaign keeps its recipients and messages, the list leaves its `listIds` (`null` once none is left) and `audienceName` keeps the names of the lists it went to.",
        "scope": "lists:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteList\n"
      },
      {
        "action": "get",
        "operationId": "getList",
        "method": "GET",
        "path": "/v1/lists/{id}",
        "summary": "Retrieve a list",
        "details": "Returns one list. Its members are read with `GET /v1/contacts?listId=`, which takes the same filters and pages as any contact list.",
        "scope": "lists:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getList\n"
      },
      {
        "action": "list",
        "operationId": "listLists",
        "method": "GET",
        "path": "/v1/lists",
        "summary": "List lists",
        "details": "Returns lists in this workspace. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "lists:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the list's name, ignoring case."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listLists\n"
      },
      {
        "action": "update",
        "operationId": "updateList",
        "method": "PATCH",
        "path": "/v1/lists/{id}",
        "summary": "Update a list",
        "details": "Renames a list or changes its description. Membership is managed through the member operations, not here.",
        "scope": "lists:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace, ignoring case."
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>"
          }
        ],
        "help": "\nExamples:\n  Rename a list:\n    $ kirora lists update <id> -d '{\"name\":\"Monthly newsletter\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateList\n"
      },
      {
        "action": "usage",
        "operationId": "getListUsage",
        "method": "GET",
        "path": "/v1/lists/{id}/usage",
        "summary": "Retrieve a list's usage",
        "details": "Returns what names the list: campaigns whose audience, rules or exclusions name it, forms that add people to it, journeys whose rules or steps name it, and segments whose rules name it, up to 50 of each (`hasMore` when a kind holds more). Deleting the list is refused (409 `IN_USE`) while any of them is a campaign not yet sent or cancelled (`draft`, `scheduled`, `testing` for an A/B test, or `sending`), an `active` or `paused` journey, or a segment. Forms, sent or cancelled campaigns and draft or ended journeys do not block it.",
        "scope": "lists:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getListUsage\n"
      }
    ]
  },
  {
    "name": "me",
    "description": "These operations return the calling API key, its scopes and its workspace.",
    "operations": [
      {
        "action": "get",
        "operationId": "getMe",
        "method": "GET",
        "path": "/v1/me",
        "summary": "Retrieve the current API key",
        "details": "Returns the calling API key and the workspace it acts in. Any valid key, whatever its scopes. Use it as a connection test; a revoked, expired or unknown key is 401. A partner key with `Kirora-Workspace` names that tenant as `workspace`.",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getMe\n"
      }
    ]
  },
  {
    "name": "messages",
    "description": "The message log holds every message Kirora sent or tried to send, from campaigns, journeys and transactional sends, with what became of it.",
    "operations": [
      {
        "action": "content",
        "operationId": "getMessageContent",
        "method": "GET",
        "path": "/v1/messages/{id}/content",
        "summary": "Retrieve a message's content",
        "details": "Returns the subject, preview text, sender and body (or the push content) of a transactional send as it was accepted; merge tags appear unrendered. Kept for the workspace retention period, 30 days by default, and not kept once sent for a `sensitive` send: that, and expired content, return 404 `CONTENT_NOT_RETAINED`. So does a campaign or journey message, whose content is the campaign's or the journey version's: read it there.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getMessageContent\n"
      },
      {
        "action": "deliveries",
        "operationId": "listMessageDeliveries",
        "method": "GET",
        "path": "/v1/messages/{id}/deliveries",
        "summary": "List a push message's deliveries",
        "details": "Lists what each device reported for one push message: any message whose `channel` is `push`, from a campaign, a journey or a transactional send. A push reaches every ready installation of the contact, so a message has one delivery per device. `accepted`: Apple, Google or the browser's push service took it, which is not proof the device showed it. `invalid`: the device is gone and its installation was retired. `rejected`: refused, often the app's key or a payload the provider would not take. `retryable`: will be tried again. `unknown`: the provider may have taken it, so it is not resent. `skipped`: not attempted, as when the app's key was refused for another device of the same app. `pending` and `started` are still in flight. A message that is not a push returns 404.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listMessageDeliveries\n"
      },
      {
        "action": "exports create",
        "operationId": "createMessageExport",
        "method": "POST",
        "path": "/v1/messages/exports",
        "summary": "Export sent messages as CSV",
        "details": "Queues a CSV of the message log. The body takes the filters of `GET /v1/messages` (`status`, `channel`, `recipient`, `query`, `messageType`, `campaignId`, `journeyId`, `stepId`, `templateId`, `correlationId`, `createdAfter`, `createdBefore`; not `opened` or `clicked`) and applies them the same way; send `{}` for every message. A filter matching no message is refused with `NOTHING_TO_EXPORT`. The file is generated in the background: poll the export until `status` is `ready`, then download it. Any key of the workspace with `messages:read` can read the export.",
        "scope": "messages:read",
        "query": [],
        "body": [
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "queued",
              "sending",
              "skipped",
              "sent",
              "failed",
              "delivered",
              "bounced",
              "complained"
            ],
            "description": "Only messages in this status."
          },
          {
            "name": "channel",
            "flag": "channel",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "email",
              "push"
            ]
          },
          {
            "name": "recipient",
            "flag": "recipient",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The exact address the message went to."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the recipient's email address or name, matched against the contact the message went to."
          },
          {
            "name": "messageType",
            "flag": "message-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "marketing",
              "transactional"
            ],
            "description": "Only messages of this type: `marketing` or `transactional`.",
            "alias": "messageType"
          },
          {
            "name": "campaignId",
            "flag": "campaign-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only messages from this campaign.",
            "alias": "campaignId"
          },
          {
            "name": "journeyId",
            "flag": "journey-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only messages from this journey.",
            "alias": "journeyId"
          },
          {
            "name": "stepId",
            "flag": "step-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "With `journeyId`, only messages from the journey's step with this id, in every version of its steps.",
            "alias": "stepId"
          },
          {
            "name": "templateId",
            "flag": "template-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only transactional sends from this stored template; no other message records one.",
            "alias": "templateId"
          },
          {
            "name": "correlationId",
            "flag": "correlation-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only the transactional sends that carried this `correlationId`.",
            "alias": "correlationId"
          },
          {
            "name": "createdAfter",
            "flag": "created-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted at or after this time (inclusive).",
            "alias": "createdAfter"
          },
          {
            "name": "createdBefore",
            "flag": "created-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted before this time (exclusive).",
            "alias": "createdBefore"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Export this month’s marketing email:\n    $ kirora messages exports create -d '{\"channel\":\"email\",\"messageType\":\"marketing\",\"createdAfter\":\"2026-10-01T00:00:00.000Z\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createMessageExport\n"
      },
      {
        "action": "exports download",
        "operationId": "downloadMessageExport",
        "method": "GET",
        "path": "/v1/messages/exports/{id}/download",
        "summary": "Download a message export",
        "details": "Downloads a ready export as a CSV file, one row per message, newest first. Returns `409 EXPORT_UNAVAILABLE` until the export is ready and `410 EXPORT_UNAVAILABLE` once it has expired.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "responseType": "text/csv",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/downloadMessageExport\n"
      },
      {
        "action": "exports get",
        "operationId": "getMessageExport",
        "method": "GET",
        "path": "/v1/messages/exports/{id}",
        "summary": "Retrieve a message export",
        "details": "Returns a message export's progress: `queued`, `generating`, then `ready` or `failed`. A ready file is kept until `expiresAt`, after which the export reads `expired`. A failed export says why in `failureCode`: `EXPORT_TOO_LARGE` (narrow the filters) or `GENERATION_FAILED`.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getMessageExport\n"
      },
      {
        "action": "get",
        "operationId": "getMessage",
        "method": "GET",
        "path": "/v1/messages/{id}",
        "summary": "Retrieve an outbound message",
        "details": "Returns any outbound message in the message log, whatever its source and status, as the log lists it.",
        "scope": "messages:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getMessage\n"
      },
      {
        "action": "list",
        "operationId": "listMessages",
        "method": "GET",
        "path": "/v1/messages",
        "summary": "List outbound messages",
        "details": "Lists the workspace message log: one row per outbound message from campaigns, journeys and transactional sends, newest first, whether it was sent, is still queued, or was skipped or failed. `campaign` and `journey` say where a row came from (neither, for a transactional send), and `bounce`, `failure` or `skip` what became of it.",
        "scope": "messages:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "queued",
              "sending",
              "skipped",
              "sent",
              "failed",
              "delivered",
              "bounced",
              "complained"
            ],
            "description": "Only messages in this status."
          },
          {
            "name": "channel",
            "flag": "channel",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "email",
              "push"
            ],
            "description": "Only messages on this channel."
          },
          {
            "name": "recipient",
            "flag": "recipient",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The exact address the message went to."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the recipient's email address or name, matched against the contact the message went to."
          },
          {
            "name": "messageType",
            "flag": "message-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "marketing",
              "transactional"
            ],
            "description": "Only messages of this type: `marketing` or `transactional`.",
            "alias": "messageType"
          },
          {
            "name": "campaignId",
            "flag": "campaign-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only messages from this campaign.",
            "alias": "campaignId"
          },
          {
            "name": "journeyId",
            "flag": "journey-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only messages from this journey.",
            "alias": "journeyId"
          },
          {
            "name": "stepId",
            "flag": "step-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "With `journeyId`, only messages from the journey's step with this id, in every version of its steps.",
            "alias": "stepId"
          },
          {
            "name": "templateId",
            "flag": "template-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only transactional sends from this stored template; no other message records one.",
            "alias": "templateId"
          },
          {
            "name": "correlationId",
            "flag": "correlation-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only the transactional sends that carried this `correlationId`.",
            "alias": "correlationId"
          },
          {
            "name": "opened",
            "flag": "opened",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: opened (or clicked) at least once; `false`: never."
          },
          {
            "name": "clicked",
            "flag": "clicked",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "true",
              "false"
            ],
            "description": "`true`: a link clicked at least once; `false`: never."
          },
          {
            "name": "createdAfter",
            "flag": "created-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted at or after this time (inclusive).",
            "alias": "createdAfter"
          },
          {
            "name": "createdBefore",
            "flag": "created-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only messages accepted before this time (exclusive).",
            "alias": "createdBefore"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listMessages\n"
      }
    ]
  },
  {
    "name": "push-projects",
    "description": "A push project is a product whose iOS, Android and web apps receive push, with whether each can send.",
    "operations": [
      {
        "action": "list",
        "operationId": "listPushProjects",
        "method": "GET",
        "path": "/v1/push-projects",
        "summary": "List push projects",
        "details": "Lists the workspace's push projects. Each project groups the iOS, Android and web apps of one product, with whether any can send (`ready`). Rules that ask whether a contact is reachable by push name a project. Credentials are described, never returned.",
        "scope": "push:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listPushProjects\n"
      }
    ]
  },
  {
    "name": "reports",
    "description": "Reports show how sending performs: the workspace overview, a comparison of campaigns, transactional delivery and conversion funnels.",
    "operations": [
      {
        "action": "campaigns",
        "operationId": "listCampaignReports",
        "method": "GET",
        "path": "/v1/reports/campaigns",
        "summary": "List campaign reports",
        "details": "Lists campaign performance over a window. One row per campaign with a marketing message in the window, including a campaign none of whose messages were sent: its email shows as `failed` or `skipped`. Counts are send cohorts like the overview: email by the time it was sent, email never sent and push by the time it was queued, and later feedback revises them. Journey and transactional messages are not here (see the journey and transactional reports), so these rows can sum to less than the overview. Conversions are those whose source message was sent in the window, and revenue is summed per goal currency, never converted. Rates are fractions; null means no denominator, and sorts below every rate. `sent` sorts by email sent. Without `from` and `to`, the window is the last 30 days ending today. Needs a plan with advanced reports: without one, 403 `PLAN_FEATURE_UNAVAILABLE`.",
        "scope": "reports:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          },
          {
            "name": "sort",
            "flag": "sort",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "firstAttemptedAt",
              "sent",
              "openRate",
              "clickRate",
              "bounceRate",
              "unsubscribeRate",
              "conversions",
              "-firstAttemptedAt",
              "-sent",
              "-openRate",
              "-clickRate",
              "-bounceRate",
              "-unsubscribeRate",
              "-conversions"
            ],
            "description": "A field ascending, or `-field` descending. Rates with no denominator sort last."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only campaigns carrying this tag, its name matched without case: \"everything tagged Black Friday\"."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listCampaignReports\n"
      },
      {
        "action": "funnel",
        "operationId": "getFunnelReport",
        "method": "POST",
        "path": "/v1/reports/funnel",
        "summary": "Retrieve a funnel report",
        "details": "Counts the contacts who did each step's event, in order. A contact enters with the first step's earliest event in the window (`from` inclusive, `to` exclusive; a date bound is the start of that day in the workspace timezone; default the last 30 days), and reaches a later step with an event after the previous step's, within `withinDays` of entering. Each contact counts once per step, however many times they repeat it. Events past retention are no longer held. Needs a plan with advanced reports: without one, 403 `PLAN_FEATURE_UNAVAILABLE`. A read sent as `POST` for its body of steps: it takes no `Idempotency-Key`.",
        "scope": "reports:read",
        "query": [],
        "body": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          },
          {
            "name": "withinDays",
            "flag": "within-days",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How long after the first step a contact has to finish the rest.",
            "alias": "withinDays"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  steps*  list of { eventName*, where }\n          The events, in order.\n\nExamples:\n  Cart to order:\n    $ kirora reports funnel -d '{\"from\":\"2026-09-01\",\"to\":\"2026-10-01\",\"steps\":[{\"eventName\":\"Cart Abandoned\"},{\"eventName\":\"Order Completed\",\"where\":[{\"property\":\"total\",\"operator\":\"gte\",\"value\":20}]}],\"withinDays\":7}'\n\nAPI reference: https://kirora.io/docs/api/reference/getFunnelReport\n"
      },
      {
        "action": "overview",
        "operationId": "getOverviewReport",
        "method": "GET",
        "path": "/v1/reports/overview",
        "summary": "Retrieve the performance overview",
        "details": "Returns how the workspace did in a window: marketing email in `email` and marketing push in `push`, never added together, each against the period before. Email counts are send cohorts (by the day it was sent), push by the day it was queued, and later feedback revises them. Bounce and complaint counts are durable first-occurrence facts, not current statuses. `conversions` are the goal conversions a message drove, with their credited revenue, gross; `refunds` sums every refund in the window beside it. `deliverabilityHealth` is an advisory band from the workspace's own bounce and complaint rates against Kirora's warning and pause lines, not the sending provider's reputation. Rates are fractions; null means no denominator. Days are calendar days in the workspace timezone (`timezone`, set in workspace settings); the first and last may be partial. Without `from` and `to`, the window is the last 30 days ending today.",
        "scope": "reports:read",
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only email, push and conversions from campaigns and journeys carrying this tag, its name matched without case: \"how did everything tagged Black Friday do\". Refunds are not filtered: no message is linked to them."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getOverviewReport\n"
      },
      {
        "action": "rfm",
        "operationId": "getRfmSummary",
        "method": "GET",
        "path": "/v1/reports/rfm",
        "summary": "Retrieve the RFM summary",
        "details": "Returns the workspace's RFM summary: how many customers its RFM groups (`rfm` on each contact, `rfmGroup` in segment rules) were scored from, how many each group holds, and when. RFM groups customers by the recency, frequency and monetary value of their purchases. Scoring runs once a day.",
        "scope": "reports:read",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getRfmSummary\n"
      },
      {
        "action": "transactional",
        "operationId": "getTransactionalReport",
        "method": "GET",
        "path": "/v1/reports/transactional",
        "summary": "Retrieve transactional delivery statistics",
        "details": "Returns transactional delivery statistics, email in `email` and push in `push`, never added together, by the day the API accepted each, so a send that failed or was skipped counts on its day. Email opens and clicks are not counted: an email is tracked only when it asks (`tracking`), so a rate across all of them would mislead; read them on each message. Push opens and clicks are, since every push can report a tap; push has no delivered or bounced count, because push services report neither. Later feedback revises the counts. Bounce and complaint counts are durable first-occurrence facts, not current statuses. Rates are fractions of `sent`; null means nothing was sent. Days are calendar days in the workspace timezone (`timezone`); the first and last may be partial. Omitting `from` and `to` means the last 30 days ending today.",
        "scope": "reports:read",
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getTransactionalReport\n"
      }
    ]
  },
  {
    "name": "segments",
    "description": "A segment is an audience described by rules, such as \"ordered twice in 90 days\", evaluated when it is used.",
    "operations": [
      {
        "action": "contacts",
        "operationId": "listSegmentContacts",
        "method": "GET",
        "path": "/v1/segments/{id}/contacts",
        "summary": "List contacts in a segment",
        "details": "Evaluates a saved segment now and returns the matching contacts, shaped like the contacts list: who a send would reach. `GET /v1/contacts?segmentId=` reads the stored membership instead, up to about 15 minutes behind, with the contact filters. Because the rules are evaluated on read, results can change between pages if contacts are changing underneath. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one. `meta.count` counts the matching contacts up to 10000: beyond that it reports the cap and `meta.countExact` is `false`; both are counted on the first page only (null with a `cursor`). Who joined or left on a day is `GET /v1/segments/{id}/membership-changes`.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSegmentContacts\n"
      },
      {
        "action": "create",
        "operationId": "createSegment",
        "method": "POST",
        "path": "/v1/segments",
        "summary": "Create a segment",
        "details": "Creates a segment: an audience defined by rules. A send evaluates the rules live, so it reaches whoever matches at that moment. In the background, about every 15 minutes, the rules are also evaluated into a stored membership: `memberCount`, `GET /v1/contacts?segmentId=`, `GET /v1/contacts/{id}/segments` and the `contact.entered_segment` and `contact.exited_segment` events journeys start from come from it, so they can be up to about 15 minutes behind. `memberCount` is null until the first evaluation. Rules that name a list must name one of the workspace's lists (400 `VALIDATION_ERROR` at `rules`). Names must be unique within the workspace.",
        "scope": "segments:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace.",
            "required": true
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What the segment is for, up to 1,000 characters; `null` clears it."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  rules*  one of { all* } | { any* }\n\nExamples:\n  Newsletter members with no order in 90 days:\n    $ kirora segments create -d '{\"name\":\"Lapsed customers\",\"description\":\"Newsletter readers who have not ordered in 90 days, for the win-back offer\",\"rules\":{\"all\":[{\"type\":\"event\",\"name\":\"Order Completed\",\"count\":{\"operator\":\"equals\",\"value\":0},\"withinDays\":90},{\"type\":\"list\",\"listIds\":[\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\"],\"member\":true}]},\"tags\":[\"Win-back\"]}'\n  Nested rules: Nigerian pro customers, or anyone who clicked:\n    $ kirora segments create -d '{\"name\":\"Engaged or pro\",\"rules\":{\"any\":[{\"all\":[{\"type\":\"contact\",\"field\":\"phone\",\"operator\":\"exists\"},{\"type\":\"attribute\",\"field\":\"attributes.plan\",\"operator\":\"equals\",\"value\":\"pro\"}]},{\"type\":\"activity\",\"activity\":\"clicked\",\"withinDays\":30}]}}'\n\nAPI reference: https://kirora.io/docs/api/reference/createSegment\n"
      },
      {
        "action": "delete",
        "operationId": "deleteSegment",
        "method": "DELETE",
        "path": "/v1/segments/{id}",
        "summary": "Delete a segment",
        "details": "Deletes the segment definition. Contacts it matched are not affected. Refused with one 409 `IN_USE` while a campaign not yet sent or cancelled (A/B tests included), an active or paused journey, or another segment uses it; `details` lists them in the shape of `getSegmentUsage`. Draft and ended journeys do not block it: a draft naming it cannot be activated until the rule is changed. Nor does a sent or cancelled campaign: its `segmentId` becomes `null` and `audienceName` keeps the segment name.",
        "scope": "segments:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteSegment\n"
      },
      {
        "action": "get",
        "operationId": "getSegment",
        "method": "GET",
        "path": "/v1/segments/{id}",
        "summary": "Retrieve a segment",
        "details": "Returns one segment including its rule tree and `memberCount`, the size of its stored membership as last evaluated in the background.",
        "scope": "segments:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSegment\n"
      },
      {
        "action": "list",
        "operationId": "listSegments",
        "method": "GET",
        "path": "/v1/segments",
        "summary": "List segments",
        "details": "Returns segments in this workspace, newest first unless `sort` says otherwise (by `name`, `memberCount`, `updatedAt` or `createdAt`; a leading `-` sorts descending). Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "segments:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the segment's name, ignoring case."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only items carrying this tag, its name matched without case."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSegments\n"
      },
      {
        "action": "membership-changes",
        "operationId": "listSegmentMembershipChanges",
        "method": "GET",
        "path": "/v1/segments/{id}/membership-changes",
        "summary": "List who joined or left a segment on a day",
        "details": "The contacts who joined (`change=joined`) or left (`change=left`) the segment on `day`, in the workspace timezone, newest first, from the changes recorded then (kept as long as the workspace's events). `meta.count` is that day's `joinedCount` or `leftCount` from `getSegmentSizeHistory`, on the first page only (null with a `cursor`), so the list and the chart agree.",
        "scope": "contacts:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "change",
            "flag": "change",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "joined",
              "left"
            ],
            "description": "Who joined (`joined`) or left (`left`) the segment.",
            "required": true
          },
          {
            "name": "day",
            "flag": "day",
            "kind": "string",
            "placeholder": "<date>",
            "description": "The day, `YYYY-MM-DD` in the workspace timezone.",
            "required": true
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSegmentMembershipChanges\n"
      },
      {
        "action": "preview",
        "operationId": "previewSegment",
        "method": "POST",
        "path": "/v1/segments/preview",
        "summary": "Preview segment rules",
        "details": "Evaluates a rule tree that has not been saved and returns how many contacts it would match, counted live up to 10000, and how many of them email and push can reach. Use this to check a segment definition before creating it; a saved segment's size is its `memberCount`.",
        "scope": "segments:read",
        "query": [],
        "body": [],
        "help": "\nBody fields only --data can carry (* required):\n  rules*  one of { all* } | { any* }\n\nExamples:\n  Count a rule tree before saving it:\n    $ kirora segments preview -d '{\"rules\":{\"all\":[{\"type\":\"event\",\"name\":\"Order Completed\",\"count\":{\"operator\":\"equals\",\"value\":0},\"withinDays\":90},{\"type\":\"list\",\"listIds\":[\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\"],\"member\":true}]}}'\n\nAPI reference: https://kirora.io/docs/api/reference/previewSegment\n"
      },
      {
        "action": "size-history",
        "operationId": "getSegmentSizeHistory",
        "method": "GET",
        "path": "/v1/segments/{id}/size-history",
        "summary": "Retrieve a segment's size history",
        "details": "Returns the segment's size each day in the report window, as the background count last found it that day; it is counted every 15 minutes or so. Days are the workspace timezone's, as in every report. A day with no count (before the segment existed, or while the sweep was behind) is absent. Each day also says how many contacts joined and left (list them with `GET /v1/segments/{id}/membership-changes`), and `definitionChanges` the days the rules were saved, so a step in the line reads as an edit. Kept for 400 days; a window covers at most 366.",
        "scope": "segments:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "Start of the window, inclusive: a date-time, or a date meaning the start of that day in the workspace timezone. Give with `to`; omit both for the last 30 days."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<date|date-time>",
            "description": "End of the window, exclusive, in the same forms. To include a whole last day, pass the day after it: `from=2026-10-01&to=2026-10-08` covers 1 to 7 October. No later than the end of today; a window touches at most 366 days. Give with `from`."
          }
        ],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSegmentSizeHistory\n"
      },
      {
        "action": "update",
        "operationId": "updateSegment",
        "method": "PATCH",
        "path": "/v1/segments/{id}",
        "summary": "Update a segment",
        "details": "Replaces the segment's rules, renames it or changes its description. Changing rules changes who the segment matches from the next evaluation onward; campaigns already sent are unaffected. When an agent key changes the rules, everything that uses the segment, directly or through segments that name it, waits for a person again: scheduled campaigns are unscheduled, active journeys are paused, and each needs a human confirmation before it sends.",
        "scope": "segments:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace."
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>",
            "description": "What the segment is for, up to 1,000 characters; `null` clears it."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all."
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  rules  one of { all* } | { any* }\n\nExamples:\n  Widen the window to 180 days:\n    $ kirora segments update <id> -d '{\"rules\":{\"all\":[{\"type\":\"event\",\"name\":\"Order Completed\",\"count\":{\"operator\":\"equals\",\"value\":0},\"withinDays\":180},{\"type\":\"list\",\"listIds\":[\"0192f3a2-1b3c-7e5d-8a21-4f6a7b8c9d0e\"],\"member\":true}]}}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateSegment\n"
      },
      {
        "action": "usage",
        "operationId": "getSegmentUsage",
        "method": "GET",
        "path": "/v1/segments/{id}/usage",
        "summary": "Retrieve a segment's usage",
        "details": "Returns what uses the segment: campaigns whose audience is this segment or whose rules or exclusions name it, journeys whose rules or steps name it, and other segments whose rules name it, up to 50 of each (`hasMore` when a kind holds more). Deleting the segment is refused (409 `IN_USE`) while any of them is a campaign not yet sent or cancelled (`draft`, `scheduled`, `testing` for an A/B test, or `sending`), an `active` or `paused` journey, or another segment.",
        "scope": "segments:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSegmentUsage\n"
      }
    ]
  },
  {
    "name": "senders",
    "description": "A sender is a From address the workspace has saved, on one of its sending domains, with one default that new emails start with.",
    "operations": [
      {
        "action": "list",
        "operationId": "listSenders",
        "method": "GET",
        "path": "/v1/senders",
        "summary": "List senders",
        "details": "The workspace's saved From addresses, the default first, then by name, so an integration or agent picks a From that can send rather than guessing one. `domainVerified` says whether the email can send today; a domain that lost verification leaves its senders listed but false. `from` is the string an email's `from` takes. Senders are added and changed in the dashboard.",
        "scope": "domains:read",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSenders\n"
      }
    ]
  },
  {
    "name": "sending-domains",
    "description": "A sending domain is a domain your email is sent from, with the DNS records that prove you own it.",
    "operations": [
      {
        "action": "check",
        "operationId": "checkSendingDomain",
        "method": "POST",
        "path": "/v1/sending-domains/{id}/check",
        "summary": "Check a sending domain",
        "details": "Re-reads DNS and updates the domain's `status`, `checks` and each record's `matches` and `reason`. Call this after publishing the records; while DNS propagates, the first check can find nothing yet.",
        "scope": "domains:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/checkSendingDomain\n"
      },
      {
        "action": "create",
        "operationId": "createSendingDomain",
        "method": "POST",
        "path": "/v1/sending-domains",
        "summary": "Add a sending domain",
        "details": "Registers a domain to send from and returns the DNS records to publish, all at once. It cannot send until they are in place and `status` is `verified`; Kirora checks them in the background, or call `POST /v1/sending-domains/{id}/check`. A Unicode domain is stored and returned in its punycode form (`münchen.de` becomes `xn--mnchen-3ya.de`); an IP address, a numeric top-level domain or invalid punycode is refused, as are a public suffix (`co.uk`) and a public mailbox domain or its subdomains (`gmail.com`), since neither can be verified. A removed domain can be added again.",
        "scope": "domains:write",
        "query": [],
        "body": [
          {
            "name": "domain",
            "flag": "domain",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The domain to send from, such as `mail.example.com`. A Unicode name is stored in its punycode form.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Register a subdomain to send from:\n    $ kirora sending-domains create -d '{\"domain\":\"mail.acme-shop.com\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createSendingDomain\n"
      },
      {
        "action": "delete",
        "operationId": "deleteSendingDomain",
        "method": "DELETE",
        "path": "/v1/sending-domains/{id}",
        "summary": "Delete a sending domain",
        "details": "Removes the domain. Refused with 409 `IN_USE`, its `details` the `SendingDomainUsage` of `GET /v1/sending-domains/{id}/usage`, while a campaign not yet sent, a journey not ended, a template's `transactionalDefaults.from` or the workspace's default sender is on it: change those first. Transactional sends name their sender per request, so they are not checked. A removed domain can be added again.",
        "scope": "domains:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteSendingDomain\n"
      },
      {
        "action": "get",
        "operationId": "getSendingDomain",
        "method": "GET",
        "path": "/v1/sending-domains/{id}",
        "summary": "Retrieve a sending domain",
        "details": "Returns one domain, its `status`, and the DNS records it expects with whether each was found.",
        "scope": "domains:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSendingDomain\n"
      },
      {
        "action": "list",
        "operationId": "listSendingDomains",
        "method": "GET",
        "path": "/v1/sending-domains",
        "summary": "List sending domains",
        "details": "Returns the sending domains in this workspace with each one's `status`. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "domains:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSendingDomains\n"
      },
      {
        "action": "usage",
        "operationId": "getSendingDomainUsage",
        "method": "GET",
        "path": "/v1/sending-domains/{id}/usage",
        "summary": "Retrieve a sending domain's usage",
        "details": "Lists what sends from this domain, which deleting it is refused for: campaigns not yet sent (draft, scheduled, sending or testing), journeys not ended with an email step, and templates whose `transactionalDefaults.from` is on it, each list at most 50 long, most recently edited first, with `hasMore` when one is longer; and whether the workspace's default sender is on it. Transactional sends name their sender per request, so they are not listed.",
        "scope": "domains:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSendingDomainUsage\n"
      }
    ]
  },
  {
    "name": "shared-blocks",
    "description": "A shared block is a block kept once and placed in many templates, such as a footer or a product card.",
    "operations": [
      {
        "action": "create",
        "operationId": "createSharedBlock",
        "method": "POST",
        "path": "/v1/shared-blocks",
        "summary": "Create a shared block",
        "details": "Creates a shared block. A shared block (a footer, a product card) is kept once and placed in emails as a `shared` block naming it. Template drafts and draft campaigns and journeys show its current content; publishing a template, scheduling or sending a campaign and activating a journey keep it as it was then. A placement with `override` shows its own blocks instead: the editor marks it edited and can push it back (update the shared block, then drop the override) or revert it (drop the override).",
        "scope": "templates:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  blocks*  list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n\nExamples:\n  A footer note to reuse across emails:\n    $ kirora shared-blocks create -d '{\"name\":\"Footer note\",\"blocks\":[{\"id\":\"footer-note\",\"type\":\"text\",\"text\":\"Acme Shop, 12 Market Street, Lagos. Questions? Reply to this email.\",\"align\":\"center\"}]}'\n\nAPI reference: https://kirora.io/docs/api/reference/createSharedBlock\n"
      },
      {
        "action": "delete",
        "operationId": "deleteSharedBlock",
        "method": "DELETE",
        "path": "/v1/shared-blocks/{id}",
        "summary": "Delete a shared block",
        "details": "Deletes a shared block. Refused with 409 `IN_USE`, its `details` the usage, while a template, an unsent campaign or a journey not ended places it.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteSharedBlock\n"
      },
      {
        "action": "get",
        "operationId": "getSharedBlock",
        "method": "GET",
        "path": "/v1/shared-blocks/{id}",
        "summary": "Retrieve a shared block",
        "details": "Returns one shared block with its content.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSharedBlock\n"
      },
      {
        "action": "list",
        "operationId": "listSharedBlocks",
        "method": "GET",
        "path": "/v1/shared-blocks",
        "summary": "List shared blocks",
        "details": "Lists the workspace's shared blocks, without their content: retrieve one for its `blocks`. A shared block (a footer, a product card) is kept once and placed in emails as a `shared` block naming it. Template drafts and draft campaigns and journeys show its current content; publishing a template, scheduling or sending a campaign and activating a journey keep it as it was then. A placement with `override` shows its own blocks instead: the editor marks it edited and can push it back (update the shared block, then drop the override) or revert it (drop the override).",
        "scope": "templates:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSharedBlocks\n"
      },
      {
        "action": "update",
        "operationId": "updateSharedBlock",
        "method": "PATCH",
        "path": "/v1/shared-blocks/{id}",
        "summary": "Update a shared block",
        "details": "Renames a shared block or replaces its content. New content shows at once in template drafts and in campaigns and journeys not yet scheduled or activated. Published templates keep the content they froze until they are published again, and scheduled campaigns and active journeys keep theirs: a footer change never alters a live email by itself. `GET /v1/shared-blocks/{id}/usage` lists where it is placed, with each template's `hasUnpublishedChanges`, so the templates that now need publishing are one call away.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  blocks  list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n          The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n\nExamples:\n  Rename the block:\n    $ kirora shared-blocks update <id> -d '{\"name\":\"Store footer\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateSharedBlock\n"
      },
      {
        "action": "usage",
        "operationId": "getSharedBlockUsage",
        "method": "GET",
        "path": "/v1/shared-blocks/{id}/usage",
        "summary": "Retrieve a shared block's usage",
        "details": "Returns where a shared block is placed: templates, campaigns not yet sent and journeys not ended, each list at most 50 long, with `hasMore` when one is longer. A template's `hasUnpublishedChanges` says whether its sends still show an older content: publish it to bring them this one. Sent campaigns kept it as it was.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getSharedBlockUsage\n"
      }
    ]
  },
  {
    "name": "suppressions",
    "description": "A suppression is a block on an email address, held whether or not a contact has it, with its reason.",
    "operations": [
      {
        "action": "add",
        "operationId": "addSuppressions",
        "method": "POST",
        "path": "/v1/suppressions",
        "summary": "Add suppressed email addresses",
        "details": "Blocks email addresses: up to 10,000 per request, with reason `imported`, for example opt-outs carried over from another platform. An agent key cannot hold `suppressions:write`. Addresses are trimmed and lowercased; one already blocked keeps its reason, and an entry that is not an address is listed in `invalid` rather than refusing the request. Nothing is sent to anyone.",
        "scope": "suppressions:write",
        "query": [],
        "body": [
          {
            "name": "emails",
            "flag": "emails",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Email addresses to block, up to 10,000; trimmed and lowercased.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Opt-outs carried over from another platform:\n    $ kirora suppressions add -d '{\"emails\":[\"optout@example.com\",\"Old.Customer@Example.com\",\"not-an-address\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/addSuppressions\n"
      },
      {
        "action": "delete",
        "operationId": "deleteSuppressions",
        "method": "POST",
        "path": "/v1/suppressions/delete",
        "summary": "Delete suppressed email addresses",
        "details": "Unblocks email addresses, up to 100 per request, one included: a POST, so an address never sits in a URL. A `manual` or `imported` block is removed, with the manual block on any contact holding that address. Bounces, complaints and unsubscribes stay: they also protect sister workspaces and the shared sending reputation, and an unsubscribe lifts only when the person resubscribes. They are listed in `notRemovable` rather than refusing the request. Only this workspace's own blocks are touched, so an address blocked only by a sister workspace is in `notFound`. Consent is unchanged. An agent key cannot hold `suppressions:write`.",
        "scope": "suppressions:write",
        "query": [],
        "body": [
          {
            "name": "emails",
            "flag": "emails",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Email addresses to unblock, up to 100; trimmed and lowercased.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "destructive": true,
        "help": "\nExamples:\n  Unblock addresses blocked by mistake:\n    $ kirora suppressions delete -d '{\"emails\":[\"optout@example.com\",\"bounced@example.com\",\"never@example.com\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/deleteSuppressions\n"
      },
      {
        "action": "list",
        "operationId": "listSuppressions",
        "method": "GET",
        "path": "/v1/suppressions",
        "summary": "List suppressed email addresses",
        "details": "Lists the email addresses this workspace blocks, newest first, whether or not a contact still exists for each. Filter by `email` to check one address exactly (normalised as stored), by `query` to match any part of the address, by `reason`, or by `createdAfter` and `createdBefore` (half-open) to keep another system in step with the blocks made since a time.",
        "scope": "suppressions:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "email",
            "flag": "email",
            "kind": "string",
            "placeholder": "<value>",
            "description": "One address, matched trimmed and without case: is it blocked?"
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Case-insensitive part of the address."
          },
          {
            "name": "reason",
            "flag": "reason",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "manual",
              "imported",
              "unsubscribed",
              "bounced",
              "complained",
              "complained_transactional"
            ],
            "description": "Only blocks with this reason."
          },
          {
            "name": "createdAfter",
            "flag": "created-after",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only blocks made at or after this time (inclusive).",
            "alias": "createdAfter"
          },
          {
            "name": "createdBefore",
            "flag": "created-before",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "Only blocks made before this time (exclusive).",
            "alias": "createdBefore"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listSuppressions\n"
      }
    ]
  },
  {
    "name": "tags",
    "description": "A tag is a label on campaigns, journeys, segments and templates, such as \"Black Friday\", for filtering lists and reports.",
    "operations": [
      {
        "action": "create",
        "operationId": "createTag",
        "method": "POST",
        "path": "/v1/tags",
        "summary": "Create a tag",
        "details": "Creates a tag ahead of use. Naming a tag in `tags` on a campaign, journey, segment or template also creates it, so this is only needed to prepare a set of tags. Names are unique within the workspace ignoring case: \"black friday\" is taken by \"Black Friday\" (409 `ALREADY_EXISTS`). Agent keys may manage tags: a label sends nothing.",
        "scope": "tags:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace, ignoring case.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Prepare a tag before tagging anything:\n    $ kirora tags create -d '{\"name\":\"Black Friday\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createTag\n"
      },
      {
        "action": "delete",
        "operationId": "deleteTag",
        "method": "DELETE",
        "path": "/v1/tags/{id}",
        "summary": "Delete a tag",
        "details": "Deletes the tag and takes it off every item; the items themselves are kept. Refused with 409 `IN_USE` while a rule names it (a segment, campaign audience, journey, goal, or a block condition in a design), since the rule would then match nobody. `details.usedBy` lists the first 50 of each kind (`segments`, `campaigns`, `journeys`, `goals`, `templates`, `sharedBlocks`), with `hasMore` when a kind holds more. Merge it into another tag instead to keep those rules working.",
        "scope": "tags:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteTag\n"
      },
      {
        "action": "list",
        "operationId": "listTags",
        "method": "GET",
        "path": "/v1/tags",
        "summary": "List tags",
        "details": "Returns the workspace's tags sorted by name (ignoring case), each with how many campaigns, journeys, segments and templates carry it. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "tags:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the tag's name, ignoring case: what a picker types."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listTags\n"
      },
      {
        "action": "merge",
        "operationId": "mergeTags",
        "method": "POST",
        "path": "/v1/tags/{id}/merge",
        "summary": "Merge a tag into another",
        "details": "Moves every item carrying this tag onto `targetTagId`, then deletes this tag, in one step: how \"BF\" and \"Black Friday\" become one. An item already carrying both keeps one. Rules that name this tag (segments, campaign audiences, journey filters, goal populations, block conditions in designs) are pointed at the target in the same step, so a rule that named either tag now matches the items of both. Since that can change who a rule reaches, an agent key is refused with 403 `AGENT_KEY_REFUSED` when a rule names either tag. Merging a tag into itself is refused with 400.",
        "scope": "tags:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "targetTagId",
            "flag": "target-tag-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "The tag that takes over every item, and survives the merge.",
            "required": true,
            "alias": "targetTagId"
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Fold \"BF\" into \"Black Friday\":\n    $ kirora tags merge <id> -d '{\"targetTagId\":\"0192f3e0-1a2b-7c3d-8e4f-5a6b7c8d9e0f\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/mergeTags\n"
      },
      {
        "action": "update",
        "operationId": "updateTag",
        "method": "PATCH",
        "path": "/v1/tags/{id}",
        "summary": "Rename a tag",
        "details": "Renames the tag on every item that carries it. A name another tag holds, ignoring case, is refused with 409 `ALREADY_EXISTS`: merge the two instead.",
        "scope": "tags:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The new name; unique within the workspace, ignoring case.",
            "required": true
          }
        ],
        "help": "\nExamples:\n  Rename a tag everywhere it is used:\n    $ kirora tags update <id> -d '{\"name\":\"Black Friday 2026\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateTag\n"
      }
    ]
  },
  {
    "name": "templates",
    "description": "A template is a reusable email design: a document of blocks and a theme, saved as a draft and published as numbered versions.",
    "operations": [
      {
        "action": "create",
        "operationId": "createTemplate",
        "method": "POST",
        "path": "/v1/templates",
        "summary": "Create an email template",
        "details": "Creates a reusable email design and publishes it as version 1, so a transactional send can use it at once by its `id` or `alias`. An agent key's template stays a draft until a person publishes it.",
        "scope": "templates:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          },
          {
            "name": "schemaVersion",
            "flag": "schema-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The block format version. Defaults to the current one.",
            "alias": "schemaVersion"
          },
          {
            "name": "language",
            "flag": "language",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The language the email is written in, as a BCP 47 tag (\"en\", \"fr-BE\", \"ar\"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to \"en\"."
          },
          {
            "name": "plainTextOverride",
            "flag": "plain-text-override",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Plain text sent instead of the version generated from the blocks; `null` clears it.",
            "alias": "plainTextOverride"
          },
          {
            "name": "alias",
            "flag": "alias",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique in the workspace; a transactional send may name the template by it in `email.template`. Null clears it."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Tag names, up to 20, matched without case; a tag the workspace lacks is created. On update, replaces the tags whole: `[]` removes them all."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  blocks*                list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n                         The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n  theme                  { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }\n  transactionalDefaults  { subject, previewText, from, replyTo }\n                         The subject, preview text and sender a transactional send of this template uses unless the send gives its own; campaigns and journeys set their own.\n\nExamples:\n  A welcome email, created with an integration key: live as version 1:\n    $ kirora templates create -d '{\"name\":\"Welcome email\",\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Welcome to Acme Shop\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Start shopping\",\"href\":\"https://acme-shop.com\"},{\"id\":\"store-footer\",\"type\":\"shared\",\"sharedBlockId\":\"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b\"},{\"id\":\"footer\",\"type\":\"footer\",\"text\":\"{{ org.name }}\\n{{ org.address }}\",\"locked\":true}],\"theme\":{\"bodyFontFamily\":\"Arial, sans-serif\",\"headingFontFamily\":\"Georgia, serif\",\"cardBackgroundColor\":\"#ffffff\",\"canvasBackgroundColor\":\"#f4f1ec\",\"textColor\":\"#1f2933\",\"accentColor\":\"#b4461f\",\"linkColor\":\"#b4461f\",\"cardWidth\":\"600px\",\"cardBorderRadius\":\"6px\",\"buttonStyle\":\"solid\"},\"transactionalDefaults\":{\"subject\":\"Welcome to Acme Shop\",\"previewText\":\"Your first order ships free\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\"},\"alias\":\"welcome\",\"tags\":[\"Onboarding\"]}'\n  The same email, created with an agent key: a draft until a person publishes it:\n    $ kirora templates create -d '{\"name\":\"Welcome email\",\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Welcome to Acme Shop\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Start shopping\",\"href\":\"https://acme-shop.com\"},{\"id\":\"store-footer\",\"type\":\"shared\",\"sharedBlockId\":\"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b\"},{\"id\":\"footer\",\"type\":\"footer\",\"text\":\"{{ org.name }}\\n{{ org.address }}\",\"locked\":true}],\"theme\":{\"bodyFontFamily\":\"Arial, sans-serif\",\"headingFontFamily\":\"Georgia, serif\",\"cardBackgroundColor\":\"#ffffff\",\"canvasBackgroundColor\":\"#f4f1ec\",\"textColor\":\"#1f2933\",\"accentColor\":\"#b4461f\",\"linkColor\":\"#b4461f\",\"cardWidth\":\"600px\",\"cardBorderRadius\":\"6px\",\"buttonStyle\":\"solid\"},\"transactionalDefaults\":{\"subject\":\"Welcome to Acme Shop\",\"previewText\":\"Your first order ships free\",\"from\":\"Acme Shop <hello@mail.acme-shop.com>\",\"replyTo\":\"support@acme-shop.com\"},\"alias\":\"welcome\",\"tags\":[\"Onboarding\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/createTemplate\n"
      },
      {
        "action": "delete",
        "operationId": "deleteTemplate",
        "method": "DELETE",
        "path": "/v1/templates/{id}",
        "summary": "Delete a template",
        "details": "Deletes the template and its versions. Campaigns and journeys built from it are unaffected, since they hold their own copy of the design. A transactional send that names the template by its `id` or `alias` fails with 404 from then on, so check your code's sends before deleting one.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteTemplate\n"
      },
      {
        "action": "duplicate",
        "operationId": "duplicateTemplate",
        "method": "POST",
        "path": "/v1/templates/{id}/duplicate",
        "summary": "Duplicate a template",
        "details": "Copies a template's draft (its blocks, theme and `transactionalDefaults`, not its alias) into a new template, published as version 1, as on create. A copy made with an agent key, or of an agent's template, stays a draft until a person publishes it.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The name of the copy; the original's followed by \"copy\" when omitted."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A copy under a new name, live as version 1:\n    $ kirora templates duplicate <id> -d '{\"name\":\"Welcome email, spring\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/duplicateTemplate\n"
      },
      {
        "action": "gallery",
        "operationId": "getTemplateGallery",
        "method": "GET",
        "path": "/v1/templates/gallery",
        "summary": "List sample emails and theme presets",
        "details": "Lists finished sample emails and coordinated theme presets. Start a template from a sample by creating it with the sample's `theme` and `blocks`; apply a preset by replacing a template's `theme`. Every sample has exactly one `header` block, id `logo`, holding the workspace's logo from its brand profile; without a logo it shows the workspace's name as a wordmark until one is added. The samples' photos are examples to replace, not images to send.",
        "scope": "templates:read",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getTemplateGallery\n"
      },
      {
        "action": "get",
        "operationId": "getTemplate",
        "method": "GET",
        "path": "/v1/templates/{id}",
        "summary": "Retrieve a template",
        "details": "Returns one template including its full block tree and theme.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getTemplate\n"
      },
      {
        "action": "list",
        "operationId": "listTemplates",
        "method": "GET",
        "path": "/v1/templates",
        "summary": "List templates",
        "details": "Returns templates in this workspace. The list form omits the block tree; retrieve a template individually to get its full content. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`. The cursor is opaque — do not construct or parse one.",
        "scope": "templates:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "query",
            "flag": "query",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Part of the template's name, ignoring case."
          },
          {
            "name": "tag",
            "flag": "tag",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Only items carrying this tag, its name matched without case."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listTemplates\n"
      },
      {
        "action": "publish",
        "operationId": "publishTemplate",
        "method": "POST",
        "path": "/v1/templates/{id}/publish",
        "summary": "Publish a template",
        "details": "Makes the draft, its `transactionalDefaults` included, the next version, which transactional sends of the template use from then on, with the brand and shared blocks as they are now. When the draft matches the published version and neither has changed, it publishes nothing and returns the template unchanged. Agent keys are refused with 403: a person publishes.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/publishTemplate\n"
      },
      {
        "action": "render",
        "operationId": "renderTemplate",
        "method": "POST",
        "path": "/v1/templates/{id}/render",
        "summary": "Render a saved template",
        "details": "Renders a saved template to the subject, HTML and plain text a recipient would get, without sending or changing anything. By default it renders the published version, which is what sends use, drawn with the brand and shared blocks it was published with; pass `\"version\": \"draft\"` for the draft as it stands now, or a version number. A template never published is 409 `TEMPLATE_NOT_PUBLISHED` for `published`. Merge tags show their defaults, or pass `contact` to render them as that contact would see them, and `data` for what a send's `data` would carry. `warnings` flags problems that do not stop rendering, such as an oversized message.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [],
        "help": "\nBody fields only --data can carry (* required):\n  version  one of \"published\" | \"draft\" | number\n           `published` (the default): what sends use, with the brand and shared blocks it was published with.\n  contact  one of { contactId* } | { externalId* } | { email* }\n  data     object\n           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.\n\nExamples:\n  Render what sends use, as one contact would see it:\n    $ kirora templates render <id> -d '{\"version\":\"published\",\"contact\":{\"externalId\":\"customer-881\"}}'\n  Render the draft with merge tags at their defaults:\n    $ kirora templates render <id> -d '{\"version\":\"draft\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/renderTemplate\n"
      },
      {
        "action": "render-content",
        "operationId": "renderTemplateContent",
        "method": "POST",
        "path": "/v1/templates/render",
        "summary": "Render blocks to email HTML",
        "details": "Renders a block tree and theme sent in the request to the HTML and plain text a recipient would get, without saving anything: the builder preview, plain-text view and HTML export. To render a saved template, use `POST /v1/templates/{id}/render`. Merge tags show their defaults, or pass `contact` to render them as that contact would see them (not from an embed session). `warnings` flags problems that do not stop rendering, such as an oversized message, or `POSTAL_ADDRESS_MISSING` while the workspace has no `postalAddress` for the footer.",
        "scope": "templates:read",
        "query": [],
        "body": [
          {
            "name": "schemaVersion",
            "flag": "schema-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The block format version.",
            "alias": "schemaVersion"
          },
          {
            "name": "language",
            "flag": "language",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The language the email is written in, as a BCP 47 tag (\"en\", \"fr-BE\", \"ar\"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to \"en\"."
          },
          {
            "name": "plainTextOverride",
            "flag": "plain-text-override",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Plain text used instead of the version generated from the blocks.",
            "alias": "plainTextOverride"
          },
          {
            "name": "subject",
            "flag": "subject",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The subject line, returned rendered."
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  blocks*  list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n  theme    { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }\n  contact  one of { contactId* } | { externalId* } | { email* }\n  data     object\n           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.\n\nExamples:\n  Render a design for one contact without saving it:\n    $ kirora templates render-content -d '{\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Welcome to Acme Shop\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Start shopping\",\"href\":\"https://acme-shop.com\"},{\"id\":\"store-footer\",\"type\":\"shared\",\"sharedBlockId\":\"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b\"},{\"id\":\"footer\",\"type\":\"footer\",\"text\":\"{{ org.name }}\\n{{ org.address }}\",\"locked\":true}],\"theme\":{\"bodyFontFamily\":\"Arial, sans-serif\",\"headingFontFamily\":\"Georgia, serif\",\"cardBackgroundColor\":\"#ffffff\",\"canvasBackgroundColor\":\"#f4f1ec\",\"textColor\":\"#1f2933\",\"accentColor\":\"#b4461f\",\"linkColor\":\"#b4461f\",\"cardWidth\":\"600px\",\"cardBorderRadius\":\"6px\",\"buttonStyle\":\"solid\"},\"contact\":{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"},\"subject\":\"Welcome to Acme Shop\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/renderTemplateContent\n"
      },
      {
        "action": "send-test",
        "operationId": "sendTemplateTest",
        "method": "POST",
        "path": "/v1/templates/test-send",
        "summary": "Send a test email",
        "details": "Sends the design in the request to one workspace member who has accepted their invitation; call once per recipient. Pass `contact` to render merge tags as that contact would see them. The test comes from `from`, or the workspace's default sender, on a verified sending domain: there is no shared sender, so a workspace sends tests once its own domain is verified (`SENDING_DOMAIN_UNVERIFIED` before then). Nothing is recorded as a message. An embed session may call this too: a session lets the chosen builders read what they need, render previews, count audiences, upload images and, when `testSendTo` lists addresses, send test emails to those addresses only. It never saves, publishes or sends anything else; your server saves what the builders return. From a session, the test goes only to an address its `testSendTo` names, instead of to a workspace member (400 `VALIDATION_ERROR` for any other).",
        "scope": "templates:write",
        "query": [],
        "body": [
          {
            "name": "schemaVersion",
            "flag": "schema-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The block format version.",
            "alias": "schemaVersion"
          },
          {
            "name": "language",
            "flag": "language",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The language the email is written in, as a BCP 47 tag (\"en\", \"fr-BE\", \"ar\"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to \"en\"."
          },
          {
            "name": "plainTextOverride",
            "flag": "plain-text-override",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Plain text used instead of the version generated from the blocks.",
            "alias": "plainTextOverride"
          },
          {
            "name": "subject",
            "flag": "subject",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The subject line.",
            "required": true
          },
          {
            "name": "from",
            "flag": "from",
            "kind": "string",
            "placeholder": "<email>",
            "description": "The address the test comes from, on one of the workspace's verified domains; the workspace's default sender when omitted."
          },
          {
            "name": "to",
            "flag": "to",
            "kind": "string",
            "placeholder": "<email>",
            "description": "Where to send the test: any member of the workspace who has accepted their invitation.",
            "required": true
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  blocks*  list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n           The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n  theme    { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }\n  contact  one of { contactId* } | { externalId* } | { email* }\n  data     object\n           Sample data for `{{ event.properties.* }}` tags and repeat lists: what a transactional send's `data` or a journey's event would carry.\n\nExamples:\n  Send a draft to a workspace member, filled in for one contact:\n    $ kirora templates send-test -d '{\"blocks\":[{\"id\":\"title\",\"type\":\"heading\",\"text\":\"Welcome to Acme Shop\",\"size\":\"28px\"},{\"id\":\"intro\",\"type\":\"text\",\"text\":\"Hi {{ contact.firstName }}, thanks for joining. Your first order ships free.\"},{\"id\":\"shop\",\"type\":\"button\",\"text\":\"Start shopping\",\"href\":\"https://acme-shop.com\"},{\"id\":\"store-footer\",\"type\":\"shared\",\"sharedBlockId\":\"0192f3d1-3c4d-7e5f-8a61-7c8d9e0f1a2b\"},{\"id\":\"footer\",\"type\":\"footer\",\"text\":\"{{ org.name }}\\n{{ org.address }}\",\"locked\":true}],\"theme\":{\"bodyFontFamily\":\"Arial, sans-serif\",\"headingFontFamily\":\"Georgia, serif\",\"cardBackgroundColor\":\"#ffffff\",\"canvasBackgroundColor\":\"#f4f1ec\",\"textColor\":\"#1f2933\",\"accentColor\":\"#b4461f\",\"linkColor\":\"#b4461f\",\"cardWidth\":\"600px\",\"cardBorderRadius\":\"6px\",\"buttonStyle\":\"solid\"},\"contact\":{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"},\"subject\":\"Welcome to Acme Shop\",\"to\":\"owner@acme-shop.com\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/sendTemplateTest\n"
      },
      {
        "action": "update",
        "operationId": "updateTemplate",
        "method": "PATCH",
        "path": "/v1/templates/{id}",
        "summary": "Update a template",
        "details": "Edits the template's draft. Campaigns and journeys that already copied it keep the content they were built with, and transactional sends keep the published version until `POST /v1/templates/{id}/publish`. `transactionalDefaults` is part of the draft and is published with it: a field left out stays as it is, and `null` clears it.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "schemaVersion",
            "flag": "schema-version",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The block format version.",
            "alias": "schemaVersion"
          },
          {
            "name": "language",
            "flag": "language",
            "kind": "string",
            "placeholder": "<value>",
            "description": "The language the email is written in, as a BCP 47 tag (\"en\", \"fr-BE\", \"ar\"). It sets the HTML `lang` and the reading direction: Arabic, Hebrew, Persian, Urdu and other right-to-left languages render right to left. Defaults to \"en\"."
          },
          {
            "name": "plainTextOverride",
            "flag": "plain-text-override",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Plain text sent instead of the version generated from the blocks; `null` clears it.",
            "alias": "plainTextOverride"
          },
          {
            "name": "alias",
            "flag": "alias",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique in the workspace; a transactional send may name the template by it in `email.template`. Null clears it."
          },
          {
            "name": "tags",
            "flag": "tags",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Replaces the tags whole (`[]` removes them), matched without case. Changing only the tags needs no publish and no confirmation: they change nothing sent."
          },
          {
            "name": "expectedRevision",
            "flag": "expected-revision",
            "kind": "number",
            "placeholder": "<number>",
            "description": "The `revision` you read. When it is no longer current the update is refused with 409 `REVISION_CONFLICT`, whose details carry the current revision, `updatedAt` and who made the change. Omit it to overwrite whatever is there.",
            "alias": "expectedRevision"
          }
        ],
        "help": "\nBody fields only --data can carry (* required):\n  blocks                 list of one of { id*, type*: \"header\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"heading\", style, visibleIf, visibleIfPresent, showOn, text, size, align, weight } | { id*, type*: \"text\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"image\", style, visibleIf, visibleIfPresent, showOn, src, alt, width, align, href } | { id*, type*: \"button\", style, visibleIf, visibleIfPresent, showOn, text, href, align, fullWidth, color, buttonStyle } | { id*, type*: \"divider\", style, visibleIf, visibleIfPresent, showOn, thickness, color, lineStyle, width, align } | { id*, type*: \"spacer\", style, visibleIf, visibleIfPresent, showOn, size } | { id*, type*: \"columns\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"columns3\", style, visibleIf, visibleIfPresent, showOn, widths, valign, stackOnMobile, columns* } | { id*, type*: \"imagetext\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, side } | { id*, type*: \"imagegroup\", style, visibleIf, visibleIfPresent, showOn, count, images } | { id*, type*: \"boxed\", style, visibleIf, visibleIfPresent, showOn, text, align } | { id*, type*: \"quote\", style, visibleIf, visibleIfPresent, showOn, text, text2 } | { id*, type*: \"list\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"product\", style, visibleIf, visibleIfPresent, showOn, weight, text, text2, desc, href, src, alt } | { id*, type*: \"video\", style, visibleIf, visibleIfPresent, showOn, src, alt, text, href } | { id*, type*: \"social\", style, visibleIf, visibleIfPresent, showOn, align, links*, display, iconStyle } | { id*, type*: \"menu\", style, visibleIf, visibleIfPresent, showOn, links, align, separator } | { id*, type*: \"html\", style, visibleIf, visibleIfPresent, showOn, text } | { id*, type*: \"section\", style, visibleIf, visibleIfPresent, showOn, backgroundImage, blocks* } | { id*, type*: \"footer\", style, text, locked: true, align, unsubscribeLink, unsubscribeLabel } | { id*, type*: \"repeat\", style, visibleIf, visibleIfPresent, showOn, list*, limit, blocks* } | { id*, type*: \"shared\", style, visibleIfPresent, showOn, sharedBlockId*, override }\n                         The blocks, rendered top to bottom: at most 200 across the whole tree and five levels including the root.\n  theme                  { bodyFontFamily, headingFontFamily, cardBackgroundColor, canvasBackgroundColor, textColor, accentColor, linkColor, cardWidth, cardBorderRadius, buttonBorderRadius, buttonStyle }\n  transactionalDefaults  { subject, previewText, from, replyTo }\n                         The subject, preview text and sender a transactional send of this template uses unless the send gives its own; campaigns and journeys set their own.\n\nExamples:\n  Change the subject, guarding against a concurrent edit:\n    $ kirora templates update <id> -d '{\"transactionalDefaults\":{\"subject\":\"Welcome to Acme Shop, {{ contact.firstName }}\"},\"expectedRevision\":1}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateTemplate\n"
      },
      {
        "action": "versions get",
        "operationId": "getTemplateVersion",
        "method": "GET",
        "path": "/v1/templates/{id}/versions/{version}",
        "summary": "Retrieve a template version",
        "details": "Returns one published version of a template with its full content and `transactionalDefaults`, and the shared blocks and brand theme it was published with, to view or compare: two versions with the same blocks can still send different footers.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "template-id"
          },
          {
            "name": "version",
            "label": "template-version"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getTemplateVersion\n"
      },
      {
        "action": "versions list",
        "operationId": "listTemplateVersions",
        "method": "GET",
        "path": "/v1/templates/{id}/versions",
        "summary": "List a template's versions",
        "details": "Lists a template's published versions, newest first, without their content. The newest is the one sends use.",
        "scope": "templates:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listTemplateVersions\n"
      },
      {
        "action": "versions restore",
        "operationId": "restoreTemplateVersion",
        "method": "POST",
        "path": "/v1/templates/{id}/versions/{version}/restore",
        "summary": "Restore a template version",
        "details": "Replaces the draft with that version's content and `transactionalDefaults`, discarding unpublished changes, and publishes it as the next version, so the history records the rollback (nothing new when it is already the live content). Agent keys are refused with 403.",
        "scope": "templates:write",
        "pathParams": [
          {
            "name": "id",
            "label": "template-id"
          },
          {
            "name": "version",
            "label": "template-version"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/restoreTemplateVersion\n"
      }
    ]
  },
  {
    "name": "topics",
    "description": "A topic is a kind of marketing a contact can choose, such as product updates, and a topic choice is their choice for it on every channel or one.",
    "operations": [
      {
        "action": "create",
        "operationId": "createTopic",
        "method": "POST",
        "path": "/v1/topics",
        "summary": "Create a topic",
        "details": "Creates a topic. Names are unique in the workspace (`409 ALREADY_EXISTS`). Topics let contacts choose what marketing they get, separately from lists. A campaign or journey send step with a `topicId` reaches a contact only if they have email or push consent and the topic reaches them: an `opt_out` topic reaches everyone who has not left it, an `opt_in` topic only those who joined. A contact leaves a topic from the unsubscribe link of any message sent on it; every change is recorded in the contact's consent changes.",
        "scope": "topics:write",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace.",
            "required": true
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "mode",
            "flag": "mode",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "opt_out",
              "opt_in"
            ],
            "description": "Who the topic reaches: everyone who has not left, or only who joined."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A topic contacts leave when they opt out:\n    $ kirora topics create -d '{\"name\":\"Weekly offers\",\"description\":\"Discounts and bundles, once a week\",\"mode\":\"opt_out\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createTopic\n"
      },
      {
        "action": "delete",
        "operationId": "deleteTopic",
        "method": "DELETE",
        "path": "/v1/topics/{id}",
        "summary": "Delete a topic",
        "details": "Deletes a topic. Refused with `409 IN_USE` while a campaign, or an active or paused journey, uses it (the journeys listed in `details.journeys`); ended journeys do not count. Consent changes keep its past changes. Every contact’s choices on the topic go with it, so agent keys are refused with 403.",
        "scope": "topics:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteTopic\n"
      },
      {
        "action": "get",
        "operationId": "getTopic",
        "method": "GET",
        "path": "/v1/topics/{id}",
        "summary": "Retrieve a topic",
        "details": "Returns one topic by id.",
        "scope": "topics:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getTopic\n"
      },
      {
        "action": "list",
        "operationId": "listTopics",
        "method": "GET",
        "path": "/v1/topics",
        "summary": "List topics",
        "details": "Lists the workspace's topics. Topics let contacts choose what marketing they get, separately from lists. A campaign or journey send step with a `topicId` reaches a contact only if they have email or push consent and the topic reaches them: an `opt_out` topic reaches everyone who has not left it, an `opt_in` topic only those who joined. A contact leaves a topic from the unsubscribe link of any message sent on it; every change is recorded in the contact's consent changes.",
        "scope": "topics:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listTopics\n"
      },
      {
        "action": "update",
        "operationId": "updateTopic",
        "method": "PATCH",
        "path": "/v1/topics/{id}",
        "summary": "Update a topic",
        "details": "Renames or re-describes a topic. `mode` is fixed once created: sending the other mode is refused with 409 `CONFLICT` (`details.field: \"mode\"`); create a new topic instead.",
        "scope": "topics:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Unique within the workspace."
          },
          {
            "name": "description",
            "flag": "description",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "mode",
            "flag": "mode",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "opt_out",
              "opt_in"
            ],
            "description": "Who the topic reaches: everyone who has not left, or only who joined."
          }
        ],
        "help": "\nExamples:\n  Rename a topic:\n    $ kirora topics update <id> -d '{\"name\":\"Weekly deals\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateTopic\n"
      }
    ]
  },
  {
    "name": "transactional",
    "description": "Transactional messages are one-off email or push sends to one recipient, such as receipts and password resets, that a person needs whatever their marketing choices.",
    "operations": [
      {
        "action": "cancel-scheduled",
        "operationId": "cancelScheduledTransactionalMessage",
        "method": "POST",
        "path": "/v1/transactional/messages/{id}/cancel",
        "summary": "Cancel a scheduled transactional message",
        "details": "Stops a message sent with `sendAt` before it goes: it becomes `skipped` with `skip.reason` `cancelled`, its email or push goes back to the plan allowance, and `message.skipped` is published. Cancelling it again answers 200 with the message as it is. Once a worker has started sending it, or it went at once, the response is 409 `CONFLICT`. Agent keys are refused with 403.",
        "scope": "transactional:send",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/cancelScheduledTransactionalMessage\n"
      },
      {
        "action": "send",
        "operationId": "sendTransactionalMessage",
        "method": "POST",
        "path": "/v1/transactional/messages",
        "summary": "Send a transactional message",
        "details": "Sends a one-off message to one recipient — a receipt, a password reset, a confirmation — bypassing campaigns. It ignores marketing preferences (it is the critical tier) but respects suppression. Agent keys are refused with 403.",
        "scope": "transactional:send",
        "query": [],
        "body": [
          {
            "name": "sensitive",
            "flag": "sensitive",
            "kind": "boolean",
            "description": "Set when the message carries a secret (a reset link, a one-time code): its content is kept only while the message is queued or sending, and removed once sending finishes, whatever the workspace's retention says."
          },
          {
            "name": "correlationId",
            "flag": "correlation-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Your own reference for this send, echoed on its webhooks and its read.",
            "alias": "correlationId"
          },
          {
            "name": "sendAt",
            "flag": "send-at",
            "kind": "string",
            "placeholder": "<date-time>",
            "description": "When to send, up to 90 days ahead, with its UTC offset. Suppression and push reachability are checked when the request is accepted and again when it goes; `deliver: first` picks its channel when accepted.",
            "alias": "sendAt"
          },
          {
            "name": "deliver",
            "flag": "deliver",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "all",
              "first"
            ],
            "description": "With both `push` and `email`: `all` sends each the contact can receive; `first` sends push when the contact has a reachable device, else email."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nBody fields only --data can carry (* required):\n  to*    one of { contactId* } | { externalId* } | { email* }\n  data   object\n         Values the content reads as `{{ data.<key> }}`: a stored template, inline email and the push `title` and `body` alike.\n  email  one of { template*, subject, previewText, from, replyTo, attachments, threading, tracking } | { subject*, previewText, html*, text, from*, replyTo, attachments, threading, tracking }\n         Inline (`subject`, `from`, `html`), or a stored template by `template`; either may carry `attachments`, `threading` and `tracking`.\n  push   { title*, body*, actionUrl, imageUrl, iconUrl, data, buttons, collapseKey, sound, badge, ttl, urgency, overrides, pushProjectId }\n\nExamples:\n  Email from a stored template:\n    $ kirora transactional send -d '{\"to\":{\"externalId\":\"customer-4821\"},\"correlationId\":\"order-1001\",\"data\":{\"order_id\":\"1001\",\"total\":\"$45.00\",\"item_count\":3},\"email\":{\"template\":\"order-receipt\"}}'\n  Email written in the request:\n    $ kirora transactional send -d '{\"to\":{\"email\":\"amaka@example.com\"},\"sensitive\":true,\"data\":{\"code\":\"482913\"},\"email\":{\"subject\":\"Your sign-in code\",\"from\":\"Juniper Kitchen <security@juniperkitchen.com>\",\"html\":\"<p>Your code is <strong>{{ data.code }}</strong>. It expires in 10 minutes.</p>\",\"text\":\"Your code is {{ data.code }}. It expires in 10 minutes.\"}}'\n  Push and email together:\n    $ kirora transactional send -d '{\"to\":{\"contactId\":\"0192f3a1-7c2e-7d4b-9a10-3e5f6a7b8c9d\"},\"correlationId\":\"delivery-7731\",\"push\":{\"pushProjectId\":\"0192f3a1-91d4-7b2a-8c3e-4d5e6f7a8b9c\",\"title\":\"Order {{ data.order_id }} is on its way\",\"body\":\"Arriving {{ data.eta }}.\"},\"data\":{\"order_id\":\"7731\",\"eta\":\"Thursday\"},\"email\":{\"template\":\"order-shipped\"},\"deliver\":\"all\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/sendTransactionalMessage\n"
      },
      {
        "action": "send-batch",
        "operationId": "sendTransactionalMessagesBatch",
        "method": "POST",
        "path": "/v1/transactional/messages/batch",
        "summary": "Send transactional messages in a batch",
        "details": "Sends up to 100 transactional messages in one request. Each entry of `messages` holds a single send (see `POST /v1/transactional/messages`) as its `message`, optionally with its own `idempotencyKey`, and gets its own result: `results` keeps the order of `messages`, each with its `messages` (one per channel the entry sends on) and `replayed`, or the `error` a single send would have returned. One refused entry does not stop the rest. The call counts against the rate limit as one request per entry.",
        "scope": "transactional:send",
        "query": [],
        "body": [],
        "help": "\nBody fields only --data can carry (* required):\n  messages*  list of { idempotencyKey, message* }\n\nExamples:\n  Two receipts in one request:\n    $ kirora transactional send-batch -d '{\"messages\":[{\"idempotencyKey\":\"order-1001-receipt\",\"message\":{\"to\":{\"externalId\":\"customer-4821\"},\"correlationId\":\"order-1001\",\"data\":{\"order_id\":\"1001\",\"total\":\"$45.00\",\"item_count\":3},\"email\":{\"template\":\"order-receipt\"}}},{\"idempotencyKey\":\"order-1002-receipt\",\"message\":{\"to\":{\"externalId\":\"customer-5307\"},\"correlationId\":\"order-1002\",\"data\":{\"order_id\":\"1002\",\"total\":\"$18.50\",\"item_count\":1},\"email\":{\"template\":\"order-receipt\"}}}]}'\n  One message fails, the other goes:\n    $ kirora transactional send-batch -d '{\"messages\":[{\"idempotencyKey\":\"order-1003-receipt\",\"message\":{\"to\":{\"externalId\":\"customer-4821\"},\"correlationId\":\"order-1003\",\"data\":{\"order_id\":\"1003\",\"total\":\"$24.00\",\"item_count\":2},\"email\":{\"template\":\"order-receipt\"}}},{\"idempotencyKey\":\"order-1004-receipt\",\"message\":{\"to\":{\"externalId\":\"customer-0000\"},\"correlationId\":\"order-1004\",\"data\":{\"order_id\":\"1004\",\"total\":\"$7.25\",\"item_count\":1},\"email\":{\"template\":\"order-receipt\"}}}]}'\n\nAPI reference: https://kirora.io/docs/api/reference/sendTransactionalMessagesBatch\n"
      }
    ]
  },
  {
    "name": "webhooks",
    "description": "A webhook is an endpoint of yours that receives Kirora's events, such as `message.delivered`.",
    "operations": [
      {
        "action": "create",
        "operationId": "createWebhook",
        "method": "POST",
        "path": "/v1/webhooks",
        "summary": "Create a webhook",
        "details": "Registers an HTTPS endpoint for the listed events, or `*` for every event including ones added later. Deliveries are signed with the returned `secret` (only this answer and a keyed replay of it within 24 hours carry it; reads never do), retried with backoff, and paused by a circuit breaker while the endpoint keeps failing; see the webhooks guide. This is the subscribe call Zapier, Make and n8n make when a workflow turns on. A URL already subscribed returns 409 `ALREADY_EXISTS`; edit its events instead. Agent keys cannot hold `webhooks:write`.",
        "scope": "webhooks:write",
        "query": [],
        "body": [
          {
            "name": "url",
            "flag": "url",
            "kind": "string",
            "placeholder": "<url>",
            "description": "The HTTPS endpoint that receives deliveries; it must resolve to a public host.",
            "required": true
          },
          {
            "name": "events",
            "flag": "events",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Event types to receive, or `[\"*\"]` alone for every event, including future ones.",
            "required": true
          },
          {
            "name": "source",
            "flag": "source",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "zapier",
              "make",
              "n8n"
            ],
            "description": "The tool subscribing, so the dashboard can say who made it."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  Listen for new and unsubscribed contacts:\n    $ kirora webhooks create -d '{\"url\":\"https://hooks.acme-shop.com/kirora\",\"events\":[\"contact.created\",\"contact.unsubscribed\"]}'\n\nAPI reference: https://kirora.io/docs/api/reference/createWebhook\n"
      },
      {
        "action": "delete",
        "operationId": "deleteWebhook",
        "method": "DELETE",
        "path": "/v1/webhooks/{id}",
        "summary": "Delete a webhook",
        "details": "Deletes the subscription; nothing more is delivered to it. Deleting it again is 404, which Zapier, Make and n8n treat as already done. Refused with 409 `IN_USE` while an action step of an active or paused journey sends to it (`details.journeys`).",
        "scope": "webhooks:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteWebhook\n"
      },
      {
        "action": "deliveries get",
        "operationId": "getWebhookDelivery",
        "method": "GET",
        "path": "/v1/webhooks/deliveries/{id}",
        "summary": "Retrieve a webhook delivery",
        "details": "Returns one delivery: the one a test or a redelivery queued, to watch it move from `pending` to `delivered` or `failed`.",
        "scope": "webhooks:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getWebhookDelivery\n"
      },
      {
        "action": "deliveries list",
        "operationId": "listWebhookDeliveries",
        "method": "GET",
        "path": "/v1/webhooks/deliveries",
        "summary": "List webhook deliveries",
        "details": "Lists outbound webhook deliveries, newest first, a page at a time, narrowed by `webhookId`, `status`, `eventType` or `eventId`. Each names the webhook it went to (`webhookId`) and its last attempt. A pending or failed delivery carries the exact body sent (`requestBody`); a delivered one has dropped it. After an outage, `status=failed` lists what to resend with redeliver.",
        "scope": "webhooks:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "webhookId",
            "flag": "webhook-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only deliveries to this webhook.",
            "alias": "webhookId"
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "pending",
              "delivered",
              "failed"
            ],
            "description": "Only deliveries in this state: `failed` lists what to resend."
          },
          {
            "name": "eventType",
            "flag": "event-type",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "contact.created",
              "contact.unsubscribed",
              "contact.consent_changed",
              "form.submitted",
              "campaign.sent",
              "journey.enrolled",
              "message.delivered",
              "message.bounced",
              "message.complained",
              "message.opened",
              "message.clicked",
              "message.failed",
              "message.skipped",
              "message.sent",
              "journey.action_reached",
              "webhook.test"
            ],
            "description": "Only deliveries of this event type.",
            "alias": "eventType"
          },
          {
            "name": "eventId",
            "flag": "event-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Only this event's deliveries: one per webhook it went to.",
            "alias": "eventId"
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listWebhookDeliveries\n"
      },
      {
        "action": "deliveries redeliver",
        "operationId": "redeliverWebhookDelivery",
        "method": "POST",
        "path": "/v1/webhooks/deliveries/{deliveryId}/redeliver",
        "summary": "Redeliver a webhook delivery",
        "details": "Re-queues a failed delivery as the same event (same `X-Webhook-Event-Id`), and returns it to watch. 404 for a delivery this workspace does not have; 409 `CONFLICT` for one that is not failed or whose body is no longer kept. A redelivery to a paused or disabled webhook waits until it is active.",
        "scope": "webhooks:write",
        "pathParams": [
          {
            "name": "deliveryId",
            "label": "delivery-id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/redeliverWebhookDelivery\n"
      },
      {
        "action": "events",
        "operationId": "listWebhookEvents",
        "method": "GET",
        "path": "/v1/webhooks/events",
        "summary": "List webhook events",
        "details": "Lists the event types a subscription may listen for, each with what fires it and an example delivery body. A subscription may also name `*` alone, which covers every event, including ones added later. `journey.action_reached` and `webhook.test` are not listed: they cannot be subscribed to. Each event's full schema is in this document's `webhooks` section. Any valid key.",
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listWebhookEvents\n"
      },
      {
        "action": "get",
        "operationId": "getWebhook",
        "method": "GET",
        "path": "/v1/webhooks/{id}",
        "summary": "Retrieve a webhook",
        "details": "Returns one webhook subscription: its URL, events and status. The secret is never returned by a read.",
        "scope": "webhooks:read",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getWebhook\n"
      },
      {
        "action": "list",
        "operationId": "listWebhooks",
        "method": "GET",
        "path": "/v1/webhooks",
        "summary": "List webhooks",
        "details": "Lists the workspace's webhook subscriptions, newest first, a page at a time; `source` narrows to the ones an integration made. Secrets are never returned by a read.",
        "scope": "webhooks:read",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          },
          {
            "name": "source",
            "flag": "source",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "zapier",
              "make",
              "n8n"
            ],
            "description": "Only webhooks made by this integration."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listWebhooks\n"
      },
      {
        "action": "rotate-secret",
        "operationId": "rotateWebhookSecret",
        "method": "POST",
        "path": "/v1/webhooks/{id}/rotate-secret",
        "summary": "Rotate a webhook signing secret",
        "details": "Returns a new secret. Only this answer carries it, and a retry with the same `Idempotency-Key` within 24 hours, which replays it instead of rotating again; reads never return it. For 24 hours requests carry signatures from both the new and the old secret, so the receiver can switch without dropping events. Rotating again within those 24 hours stops the secret the first rotation issued at once; the original keeps signing until the first overlap ends.",
        "scope": "webhooks:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/rotateWebhookSecret\n"
      },
      {
        "action": "test",
        "operationId": "testWebhook",
        "method": "POST",
        "path": "/v1/webhooks/{id}/test",
        "summary": "Send a test webhook delivery",
        "details": "Queues a `webhook.test` event to this endpoint, signed and retried like any other, and returns the delivery to watch with `GET /v1/webhooks/deliveries/{id}`. A paused or disabled webhook is refused with 409 `CONFLICT`: set its `status` to `active` first.",
        "scope": "webhooks:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/testWebhook\n"
      },
      {
        "action": "update",
        "operationId": "updateWebhook",
        "method": "PATCH",
        "path": "/v1/webhooks/{id}",
        "summary": "Update a webhook",
        "details": "Changes the URL or events of a webhook, or sets `status` to `paused` or `active`. A paused or platform-disabled webhook receives no new events; its pending deliveries wait and resume when it is active again.",
        "scope": "webhooks:write",
        "pathParams": [
          {
            "name": "id",
            "label": "id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "url",
            "flag": "url",
            "kind": "string",
            "placeholder": "<url>",
            "description": "The HTTPS endpoint that receives deliveries; it must resolve to a public host."
          },
          {
            "name": "events",
            "flag": "events",
            "kind": "list",
            "placeholder": "<values...>",
            "description": "Event types to receive, or `[\"*\"]` alone for every event, including future ones."
          },
          {
            "name": "status",
            "flag": "status",
            "kind": "string",
            "placeholder": "<value>",
            "choices": [
              "active",
              "paused"
            ],
            "description": "`paused` stops deliveries. `active` resumes them, and also re-enables a webhook the platform disabled."
          }
        ],
        "help": "\nExamples:\n  Pause deliveries:\n    $ kirora webhooks update <id> -d '{\"status\":\"paused\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateWebhook\n"
      }
    ]
  },
  {
    "name": "workspaces",
    "description": "Partner workspaces let a platform offer messaging to its own customers, one workspace per customer, created and run with a partner key and the `Kirora-Workspace` header.",
    "operations": [
      {
        "action": "cancel-deletion",
        "operationId": "cancelWorkspaceDeletion",
        "method": "POST",
        "path": "/v1/workspaces/{externalId}/cancel-deletion",
        "summary": "Cancel a tenant workspace's deletion",
        "details": "Cancels a tenant workspace's pending deletion, keeping the workspace. Partner keys only. New sends work again; messages skipped while it was being deleted are not sent.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/cancelWorkspaceDeletion\n"
      },
      {
        "action": "create",
        "operationId": "createWorkspace",
        "method": "POST",
        "path": "/v1/workspaces",
        "summary": "Create a tenant workspace",
        "details": "Creates a child workspace for one tenant of your product, identified by your own `externalId`, so you never need to store ours. Partner keys only. From then on, any `/v1` call with the header `Kirora-Workspace: <externalId>` acts in that workspace with your key: load its contacts, verify its sending domain, send. The workspace has no members and bills to your account. A repeated `externalId` is 409 `ALREADY_EXISTS`. While your own workspace is being deleted this is 403 `WORKSPACE_DELETION_PENDING`; cancel the deletion to create workspaces again.",
        "scope": "workspaces:manage",
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>",
            "required": true
          },
          {
            "name": "externalId",
            "flag": "external-id",
            "kind": "string",
            "placeholder": "<id>",
            "description": "Your own id for the tenant (up to 128 letters, digits, `.`, `:`, `_`, `-`); unique among your workspaces.",
            "required": true,
            "alias": "externalId"
          },
          {
            "name": "country",
            "flag": "country",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Two-letter ISO 3166-1 country code.",
            "required": true
          },
          {
            "name": "timezone",
            "flag": "timezone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "IANA timezone, such as `Europe/Berlin`."
          }
        ],
        "idempotencyKey": "optional",
        "help": "\nExamples:\n  A workspace for one of your tenants:\n    $ kirora workspaces create -d '{\"name\":\"Acme Shop Lagos\",\"externalId\":\"tenant-lagos-01\",\"country\":\"NG\",\"timezone\":\"Africa/Lagos\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/createWorkspace\n"
      },
      {
        "action": "delete",
        "operationId": "deleteWorkspace",
        "method": "DELETE",
        "path": "/v1/workspaces/{externalId}",
        "summary": "Delete a tenant workspace",
        "details": "Deletes a tenant workspace after a grace period. Partner keys only. Sending stops at once (403 `WORKSPACE_DELETION_PENDING`, queued messages skipped) and the status becomes `deleting`. At `deletesAt`, after the grace period, the workspace and everything in it (contacts, history, files, sending domains) is deleted for good. Cancel before then with `POST /v1/workspaces/{externalId}/cancel-deletion`. Asking twice keeps the first time. Unlike other deletes, this answers 200 with the workspace rather than 204: the deletion is deferred and can be cancelled, so the body shows `status: \"deleting\"` and the `deletesAt` to tell your customer.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "destructive": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/deleteWorkspace\n"
      },
      {
        "action": "get",
        "operationId": "getWorkspace",
        "method": "GET",
        "path": "/v1/workspaces/{externalId}",
        "summary": "Retrieve a tenant workspace",
        "details": "Returns a tenant workspace, looked up by your `externalId`. Partner keys only. A workspace another partner owns is 404, the same as one that does not exist.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/getWorkspace\n"
      },
      {
        "action": "list",
        "operationId": "listWorkspaces",
        "method": "GET",
        "path": "/v1/workspaces",
        "summary": "List your tenant workspaces",
        "details": "Lists your tenant workspaces, newest first. Partner keys only. Results are cursor-paginated: pass `meta.pagination.nextCursor` back as `cursor` until it comes back `null`.",
        "scope": "workspaces:manage",
        "query": [
          {
            "name": "limit",
            "flag": "limit",
            "kind": "number",
            "placeholder": "<number>",
            "description": "How many items a page holds: 1 to 100, 20 by default."
          },
          {
            "name": "cursor",
            "flag": "cursor",
            "kind": "string",
            "placeholder": "<cursor>",
            "description": "Where the page starts: the previous page's `meta.pagination.nextCursor`. Omit it for the first page, and send the same filters with it."
          }
        ],
        "paginate": true,
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/listWorkspaces\n"
      },
      {
        "action": "resume",
        "operationId": "resumeWorkspace",
        "method": "POST",
        "path": "/v1/workspaces/{externalId}/resume",
        "summary": "Resume a tenant workspace",
        "details": "Resumes a suspended tenant workspace, lifting the suspension. Partner keys only. Messages skipped while suspended are not sent again; send or schedule anew.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/resumeWorkspace\n"
      },
      {
        "action": "suspend",
        "operationId": "suspendWorkspace",
        "method": "POST",
        "path": "/v1/workspaces/{externalId}/suspend",
        "summary": "Suspend a tenant workspace",
        "details": "Suspends a tenant workspace, stopping every send in it without touching your other tenants. Partner keys only. Sends, schedules, journey activations and transactional or push messages are refused with 403 `WORKSPACE_SUSPENDED`, and messages already queued are skipped rather than held, so resuming releases no backlog. Reading, editing and embed sessions keep working. Suspending twice keeps the first `suspendedAt`.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "idempotencyKey": "optional",
        "help": "\nAPI reference: https://kirora.io/docs/api/reference/suspendWorkspace\n"
      },
      {
        "action": "update",
        "operationId": "updateWorkspace",
        "method": "PATCH",
        "path": "/v1/workspaces/{externalId}",
        "summary": "Update a tenant workspace",
        "details": "Changes a tenant workspace's name, country or timezone; a field left out is unchanged. Partner keys only. The timezone decides local-time sends and report days.",
        "scope": "workspaces:manage",
        "pathParams": [
          {
            "name": "externalId",
            "label": "external-id"
          }
        ],
        "query": [],
        "body": [
          {
            "name": "name",
            "flag": "name",
            "kind": "string",
            "placeholder": "<value>"
          },
          {
            "name": "country",
            "flag": "country",
            "kind": "string",
            "placeholder": "<value>",
            "description": "Two-letter ISO 3166-1 country code."
          },
          {
            "name": "timezone",
            "flag": "timezone",
            "kind": "string",
            "placeholder": "<value>",
            "description": "IANA timezone, such as `Europe/Berlin`."
          }
        ],
        "help": "\nExamples:\n  Rename the workspace:\n    $ kirora workspaces update <external-id> -d '{\"name\":\"Acme Shop Nigeria\"}'\n\nAPI reference: https://kirora.io/docs/api/reference/updateWorkspace\n"
      }
    ]
  }
];

/** The webhook event types the API sends. */
export const WEBHOOK_EVENTS = ["contact.created","contact.unsubscribed","contact.consent_changed","form.submitted","campaign.sent","journey.enrolled","message.delivered","message.bounced","message.complained","message.opened","message.clicked","message.failed","message.skipped","message.sent","journey.action_reached","webhook.test"];
