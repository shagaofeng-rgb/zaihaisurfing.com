# ZAIHAI Site Audit - 2026-07-10

## Scope

- Public frontend on desktop, tablet, and mobile
- Product catalog, checkout price source, and admin-to-public cache invalidation
- News and blog publishing quality controls
- Canonical URLs, language indexing, robots, sitemap generation, and Google Search Console integration
- Cron authorization, production build, dependency security, and deployment readiness

## Search Console baseline

The live `sc-domain:zaihaisurfing.com` property reported 237 indexed and 143 not-indexed URLs at its 2026-06-30 data refresh. The reported exclusions were:

- Alternative page with proper canonical: 30
- Not found (404): 22
- Blocked by 403: 8
- Duplicate without a selected canonical: 7
- Redirected page: 7
- Crawled, currently not indexed: 63
- Google selected another canonical: 6

## Corrections

- Standardized the public origin and canonical host on `https://www.zaihaisurfing.com`.
- Added permanent apex-to-www and legacy sitemap redirects.
- Added permanent redirects for the historical malformed category/tag article URLs.
- Corrected category and tag article links to point to `/news/{slug}`.
- Canonicalized English editorial pages and marked untranslated editorial duplicates `noindex,follow`.
- Replaced the single volatile sitemap with a validated sitemap index and pages, products, posts, and categories children.
- Limited Google News sitemap entries to eligible recent articles.
- Added real `lastmod` values, durable sitemap state, diff logs, locking, last-good fallback, and a daily health cron.
- Added official Search Console sitemap submission using the service account and Webmasters scope.
- Expanded the crawler allowlist so Google inspection, News, Image, Other, and Storebot requests are not caught by visitor country blocking.
- Added a source-subject relevance gate and automatic archival for unrelated automated news.
- Connected public product price, availability, stock, and checkout validation to the durable admin catalog.
- Added layout cache revalidation after product and content changes.
- Fixed the mobile hero media offset and checked responsive overflow and image rendering.
- Upgraded vulnerable dependencies and reduced the production audit result to zero known vulnerabilities.

## Acceptance evidence

- `npm run lint`: passed
- `npm test`: 7/7 passed
- `npm run build`: passed on Next.js 16.2.10
- `npm audit --audit-level=moderate`: 0 vulnerabilities
- Sitemap index: HTTP 200
- Sitemap children: 4
- Canonical sitemap URLs checked: 159, failures: 0
- Internal links checked: 434, failures: 0
- Google crawler variants under restricted-country headers: HTTP 200
- Normal visitor under restricted-country headers: HTTP 403, as configured
- Preview deployment: `dpl_8wmxyGLrejxFRYJoSK9yTrU84RKy`, READY

Search Console counts will change only after Google recrawls the corrected URLs. Intentional canonical and redirect exclusions are expected to remain excluded rather than become indexed.
