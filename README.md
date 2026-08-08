# ZAIHAI Surfing Production Site

This is the Next.js production site for `https://www.zaihaisurfing.com`. It includes the multilingual storefront, checkout and payment flows, a review-first News workflow, a Blog publishing webhook, Google Search Console data sync, analytics, customer accounts, a Chinese retail admin, and a separate pricing admin.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Admin Entrances

- `/admin`: retail operations admin.
- `/pricing-admin`: standalone quotation and commission admin.

## Durable Data

- `src/lib/commerceStore.ts`: orders, payments, shipping, refunds, email logs and visitor events.
- `src/lib/backendStore.ts`: products, categories, media, News, Blog and site settings.
- `src/lib/adminExtraStore.ts`: promotions, reviews and audit records.
- `src/lib/googleSeo.ts`: real Google Search Console search data and sitemap submission.

Production data is stored through the configured Vercel Blob/KV provider. Do not delete or replace the production store during deployment.

## Sitemap

The sitemap index, daily health job, content-change tracking, Search Console submission, manual commands and troubleshooting are documented in [docs/sitemap-operations.md](docs/sitemap-operations.md).

## Deployment

Production is deployed on Vercel. TypeScript checks, tests and the production build must pass before deployment. Verify the canonical domain, robots, sitemap, critical storefront pages, admin authentication, cron routes and production logs after release.
