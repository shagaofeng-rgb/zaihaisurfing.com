# News and Blog boundary audit

| Layer | News | Blog |
| --- | --- | --- |
| Record type | `type: news`, optional `siteId` | `type: blog` |
| Public routes | `/en/news/*` | `/en/blog/*` |
| Feed | `/news/rss.xml` | none automated |
| Sitemap | `/news-sitemap.xml`, `/sitemaps/news-*.xml` | `/blog-sitemap.xml`, `/sitemaps/blog-*.xml` |
| Worker | `news-ingest`, `news-publish` only | no News worker access |
| Candidate store | `news-automation-v3.json` | none |
| API path | `/api/cron/news-*` | external Blog webhook remains `/api/webhook/send_article` |

The v3 worker never calls `listAdminPosts('blog')`, Blog routes, Blog sitemaps, or the Blog webhook. The former `news-autopilot` schedule is retired. Existing Blog records and manual Blog publishing are not changed.
