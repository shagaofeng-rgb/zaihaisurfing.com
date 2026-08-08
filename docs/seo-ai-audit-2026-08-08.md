# SEO and AI Visibility Audit - 2026-08-08

## Scope and evidence

- Production storage snapshot: `.audit-backups/20260808-133157/`
- Production deployment inspected: `dpl_8f236of6s5yiur1bG4ULHdqKnJaP`
- Local verification: `npm test`, `npm run lint`, and `npm run build`
- Vercel runtime-error window: the seven days ending 2026-08-08

The snapshot is ignored by Git and contains the original production objects needed for rollback. No production object was changed during this audit.

## Confirmed findings

| Area | Evidence | Result |
| --- | --- | --- |
| Blog automated publishing | `vercel.json` has no Blog publishing cron and source search found no `publish-blog` route or publisher | Disabled in code before this audit; historical posts remain available. |
| News automated publishing | Production cron called `/api/cron/publish-news` three times a day. Vercel recorded 15 target-miss errors from 2026-07-13 to 2026-08-08. | Confirmed source of repetitive fallback publishing and runtime noise; the complete automation chain was removed on 2026-08-08. |
| Editorial duplication | Production snapshot has 92 published News (91 automated) and 27 published Blog posts (25 automated). | News normalizes to 29 canonical topics; Blog normalizes to 5 canonical topics. |
| Image concentration | 29 published News images resolve to NEOM, 20 to ShoreMaster, and 17 to Unsplash. Multiple historic covers are reused 10 times. | Confirmed; existing image rights need a manual source-license review before replacement. |
| Product metadata | Product detail pages generated one generic description despite distinct backend SEO descriptions. | Fixed locally to read each product's persisted SEO title and description. |
| Fuel product FAQ | P1 and P1 Pro inherited battery questions. | Fixed locally with fuel, maintenance, waterway and safety questions. |
| Organization schema | `sameAs` pointed to the site's contact page. | Removed locally; verified official social profiles should be added only after their ownership is confirmed. |
| Google SEO schedule | `/api/cron/sync-google-seo` checks a 72-hour execution interval and Vercel cron runs every third day. | Configured in code; live confirmation requires deployment and the next cron run. |

## Local remediation included in this change set

1. Remove the News publishing cron, protected publishing endpoint, candidate intelligence, fallback generation, relevance gate, and image-repair publisher from the codebase. Existing manual admin publishing is unchanged.
3. Normalize dated buyer-brief titles, keep one canonical article in News/Blog lists and sitemaps, and permanently redirect duplicate News detail URLs to the retained article.
4. Restrict product detail sitemap entries to English while the shared product body copy remains English. Non-English product URLs remain usable for visitors but are `noindex,follow` and point canonically to English.
5. Use the current product record's SEO title and description in the product page metadata.
6. Correct English FAQ content for all five products, including fuel-specific P1/P1 Pro answers.

## Not changed automatically

- Existing posts, images, orders, visitors, and customer records were not deleted or overwritten.
- No third-party image was assumed to be licensed based on attribution alone. Replacing existing images needs a per-source rights decision.
- Search Console indexing, manual actions, real-user Core Web Vitals, Analytics, and Merchant Center data were not marked as verified because this audit did not query those private systems.
- No official social URL was added to `sameAs` because none was verified from a first-party source.

## Rollback

1. Revert the source commit containing this audit change set.
2. If content storage must be restored, use the matching files in `.audit-backups/20260808-133157/` and write them back to the same `zaihai-commerce/` Blob keys after an explicit data-restore approval.

## Post-deployment checks

1. Confirm Vercel Cron Jobs and deployed route inventory no longer list `/api/cron/publish-news`.
2. Check a known duplicate News URL returns a permanent redirect to its canonical article.
3. Confirm `sitemap.xml` no longer contains duplicate News/Blog URLs and product sitemap contains only English product detail URLs.
4. In Search Console, inspect the retained canonical URLs before requesting validation. Do not submit mass removals before exporting the URL performance and link data.
