# ZAIHAI SURFING full-site audit — 2026-08-31

## Scope

The audit covered the public frontend, responsive layouts, RTL rendering, product media, checkout and customer-account APIs, payment preparation, admin API authorization, Vercel Blob persistence, News automation, cron configuration, sitemap/robots/RSS, localized metadata, build output and production observability.

Baseline commit: `62eb9f735d66c4b710c3ccdb139462843cbb33ea`

Rollback branch: `backup/pre-full-site-audit-2026-08-30`

## Fixed findings

| Priority | Finding | Resolution |
| --- | --- | --- |
| P0 | Guest checkout issued a customer session for any submitted email, allowing access to that email's historical orders. | Guest checkout no longer creates a customer login session. Each order gets an independent 24-hour HttpOnly access cookie; existing account access still requires a valid signed customer session. |
| P0 | Oceanpayment preparation and checkout result pages could expose order/payment details by order number alone. | Payment preparation, guest order polling, success and failed pages now require account ownership or the order-specific credential. Unauthorized requests return a non-enumerating 404. |
| P0 | Checkout accepted malformed email and quantity values. | Added strict email, payment-method and integer quantity validation plus checkout rate limiting. |
| P1 | Vercel Blob append and read-modify-write operations could overwrite concurrent events, orders or settings. | Added per-file distributed leases and atomic mutation helpers; refactored order, customer, shipment, promotion, admin, pricing and sitemap mutations. |
| P1 | Product pages rendered every multi-megabyte gallery image at full size on initial load. | Gallery now renders one optimized main image, optimized thumbnails and accessible button state through Next Image. |
| P1 | Incomplete Qianhai placeholder endpoints accepted arbitrary input and acknowledged unsigned callbacks. | Retired both unused endpoints with HTTP 410. Oceanpayment and bank transfer remain the supported checkout methods. |
| P2 | SMTP admin recipient ignored the configured notification address and message content was not dot-stuffed. | Admin recipient now honors `ADMIN_NOTIFICATION_EMAIL`; mailbox validation and SMTP dot-stuffing were added. |
| P2 | Public analytics ingestion had no request throttle. | Added a 120 requests/minute/IP soft limit in addition to bot and payload sanitization. |
| P2 | English-only support/legal pages were indexed as translated locale pages, producing duplicate metadata and incorrect language labeling. | Non-English variants now redirect to canonical English pages and are removed from localized sitemap entries until professionally reviewed translations exist. |

## Verification evidence

- TypeScript: passed with zero errors.
- Unit tests: 31/31 passed, including concurrent line/object mutations and order-token behavior.
- Next.js production build: 285/285 static pages generated.
- Pre-deployment production sitemap: 5 child sitemaps, 175 URLs, 175/175 reachable.
- Pre-deployment SEO crawl: 175 pages, no missing title, description, canonical, H1, language, direction or x-default defects.
- Responsive browser QA: 360, 390, 430, 768, 1024 and 1440 px; no broken images, JavaScript errors or actual page-width overflow. Arabic rendered with `lang=ar` and `dir=rtl`; gallery keyboard/button state worked.
- Isolated TEST order: no customer-session cookie; no-credential order and payment access returned 404; order credential returned 200; internal credential hash was not serialized; invalid email/method returned 400. All isolated TEST data and screenshots were removed after verification.
- Protected API probes: admin, account and cron endpoints rejected unauthenticated requests; payment simulation remained disabled.

## Operational notes

- Production durable storage is Vercel Blob and now uses distributed per-file leases.
- News ingest and publish remain separate scheduled jobs every 12 hours; publication retains the 48-hour minimum interval, source validation, duplicate checks, delivery checks, persistent state and distributed cron lock.
- The monthly contact-form health check intentionally creates a clearly labeled monitor inquiry and verifies SMTP delivery.
- Existing non-English homepage/navigation content remains translated. Support/legal translations should only be re-enabled in localized sitemaps after human legal-language review.
- China and India visitor blocking remains an existing business rule in the proxy and was not changed by this audit.

## Rollback

If production regression occurs, redeploy the baseline commit or the rollback branch above. No production data reset or deletion is required for rollback.
