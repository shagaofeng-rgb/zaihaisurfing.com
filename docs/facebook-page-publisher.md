# Facebook Page publisher

## Purpose

This service publishes one photo post per day to the configured ZAIHAI Facebook Page after a Page administrator authorizes the Meta app. It never posts to a personal timeline or group, and it only accepts ZAIHAI-owned assets under `/assets/`.

## Production configuration

Set the following Vercel Production variables. Do not add values to this repository.

| Variable | Purpose |
| --- | --- |
| `META_GRAPH_API_VERSION` | Current stable Meta Graph API version selected in Meta for Developers. |
| `META_APP_ID` | Meta app ID. |
| `META_APP_SECRET` | Meta app secret. |
| `META_FACEBOOK_PAGE_ID` | The target ZAIHAI Page ID. |
| `FACEBOOK_TOKEN_ENCRYPTION_KEY` | Random 32+ byte server secret used to encrypt the stored Page token. |
| `CRON_SECRET` | Existing server-only Vercel Cron authorization secret. |

In Meta for Developers, add this exact valid OAuth redirect URI:

`https://www.zaihaisurfing.com/api/admin/facebook/oauth/callback`

Request only these Page permissions: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `read_insights`.

## Authorize the Page

1. Deploy after the Vercel variables are present.
2. Sign into the existing ZAIHAI admin dashboard.
3. Open `/admin/facebook` and select **Connect Meta Page**.
4. A human Page administrator completes Facebook Login and grants the listed permissions.
5. Confirm the configured Page name appears as connected, then set the daily time and enable publishing.

The callback exchanges the temporary user token for a longer-lived user token, retrieves only the configured Page token, and stores that token encrypted in the server-side durable store. The token is never returned by the UI or API.

## Publishing safeguards

- Product facts come from `src/lib/site.ts` product specifications and ZAIHAI product/application/FAQ/warranty URLs, not News or Blog.
- Image URLs must be HTTPS ZAIHAI `/assets/` paths, publicly accessible, image typed, and no more than 10 MB.
- Landing pages must be on `www.zaihaisurfing.com`.
- Per-day idempotency, 90-day text similarity, 30-day image rotation, 14-day industry rotation and 7-day CTA rotation are enforced.
- One retry is attempted only when Meta returns a failure. A record is preserved for every published, skipped or failed execution.
- Automatic publishing is paused by default.

## Verification checklist

Before enabling production publishing, verify:

- Meta app is in an allowed mode for the Page and has the required permissions.
- The person authorizing is a Page administrator with the necessary Page task.
- Vercel production has all six variables above and has been redeployed.
- The OAuth redirect URI exactly matches Meta configuration.
- `/api/cron/facebook-page-post` is reachable only with `Authorization: Bearer $CRON_SECRET`.
- `/admin/facebook` reports `Connected` and does not display any token.
- A Page-owned image URL and product landing URL return HTTP 200.
- Keep publishing paused until a controlled first post has been reviewed through the Page itself.

## Operational notes

The Vercel Cron runs hourly and only publishes when its configured `Asia/Manila` (or chosen IANA timezone) hour equals the saved time. It records `draft_generated`, `validated`, `published`, `failed`, or `skipped`. Token expiry is shown in the admin screen; a Page administrator must reconnect before expiry if Meta requires reauthorization.
