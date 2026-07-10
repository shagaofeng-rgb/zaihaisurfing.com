# Sitemap Operations

## Architecture

The production canonical origin is `https://www.zaihaisurfing.com`.

- `/sitemap.xml` is a sitemap index.
- `/sitemaps/pages-1.xml` contains public localized pages.
- `/sitemaps/products-1.xml` contains published product pages.
- `/sitemaps/posts-1.xml` contains published English News and Blog articles.
- `/sitemaps/categories-1.xml` contains indexable English News category and tag pages.
- `/news-sitemap.xml` contains only News articles published within the last two days, following Google News sitemap guidance.

The XML is generated from the current durable content store at request time. This avoids partially written public files. The last successful URL snapshot is stored in the existing durable store and is used as a fallback if live content loading fails. Each section automatically splits before 45,000 URLs or 45 MB, below Google's hard limits.

Published content changes mark the sitemap state as dirty without blocking the content request. The daily Vercel Cron reconciles the current URLs with the previous snapshot, records added/modified/deleted URLs, validates every sitemap endpoint and `robots.txt`, and optionally submits the index through the Google Search Console Sitemaps API.

## Public URLs

- `https://www.zaihaisurfing.com/sitemap.xml`
- `https://www.zaihaisurfing.com/news-sitemap.xml`
- `https://www.zaihaisurfing.com/robots.txt`

## Manual Maintenance

```bash
npm run sitemap:generate -- --dry-run --verbose
npm run sitemap:generate -- --force --verbose
npm run sitemap:generate -- --force --submit --verbose
```

`CRON_SECRET` must be present in the shell when the production endpoint is protected. To test locally, run the site first and set `SITE_URL=http://127.0.0.1:3000`.

- `--force`: reconcile even when the content snapshot is unchanged.
- `--dry-run`: validate and report without replacing the saved successful snapshot.
- `--submit`: request Search Console sitemap submission.
- `--verbose`: print the complete sanitized result.

## Vercel Cron

`vercel.json` calls `/api/cron/sitemap-health` once per day. Vercel schedules are UTC. The route requires the `Authorization: Bearer <CRON_SECRET>` header in production; Vercel adds it automatically when `CRON_SECRET` is configured.

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://www.zaihaisurfing.com
CRON_SECRET=
GOOGLE_SEARCH_CONSOLE_ENABLED=true
GOOGLE_SEARCH_CONSOLE_SITE_URL=sc-domain:zaihaisurfing.com
GOOGLE_SEARCH_CONSOLE_SITEMAP_URL=https://www.zaihaisurfing.com/sitemap.xml
GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON=
```

The service account must be granted access to the matching Search Console property. Credentials and access tokens are never written to sitemap logs.

## Logs

The existing durable store keeps `sitemap-state.json` for the lock, dirty marker, last successful snapshot and latest run, plus `sitemap-runs.jsonl` for sanitized execution history. The latest state is visible in the admin SEO area.

## Troubleshooting

- Sitemap 404: confirm the latest deployment includes `/sitemap.xml` and `/sitemaps/[file]`.
- Invalid XML: run the test suite and the manual command with `--dry-run --verbose`.
- Missing robots declaration: verify `/robots.txt` contains `Sitemap: https://www.zaihaisurfing.com/sitemap.xml`.
- Search Console API 403: confirm the service account is a user of `sc-domain:zaihaisurfing.com` and the property value exactly matches the environment variable.
- Submitted but not indexed: submission only helps Google discover URLs. Submission does not prove crawling, crawling does not guarantee indexing, and final indexing status must be checked in Search Console.

## Tests

```bash
npm run test
npm run lint
npm run build
```
