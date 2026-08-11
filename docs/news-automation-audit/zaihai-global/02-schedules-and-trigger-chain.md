# Schedules and trigger chain

| Task | Endpoint | Schedule | Writes | Can publish | Status |
| --- | --- | --- | --- | --- | --- |
| Legacy News autopilot | `/api/cron/news-autopilot` | removed | none | no | Retired with HTTP 410 |
| News ingest | `/api/cron/news-ingest` | `0 */12 * * *` | candidate state and audit log | no | New |
| News publish | `/api/cron/news-publish` | `30 */12 * * *` | one News record after a 48-hour guard | yes | New |
| Google SEO sync | `/api/cron/sync-google-seo` | `30 2 */3 * *` | SEO snapshot/logs | no | Existing |
| Sitemap health | `/api/cron/sitemap-health` | `10 3 * * *` | sitemap state/logs | no | Existing |
| Form delivery test | `/api/cron/test-contact-form` | `0 2 1 * *` | contact audit/log | no | Existing |

The publish endpoint is invoked every 12 hours so failures can recover inside the 48-hour window. `canPublishAt` refuses a second success until 48 hours after the last verified public News article. Both tasks require a KV/Redis lease named `news:<site_id>`.
