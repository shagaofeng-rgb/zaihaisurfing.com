# Current architecture: zaihai-global

- Repository: `zaihaisurfing.com-git`, Next.js App Router on Vercel.
- Site configuration: `content/news-sites/zaihai-global.json`.
- News public routes: `/en/news`, `/en/news/[slug]`, `/news/rss.xml`, `/news-sitemap.xml`.
- Blog public routes: `/en/blog`, `/en/blog/[slug]`, `/blog-sitemap.xml`.
- Content storage: existing durable admin store. Production must use KV/Redis for News task locking; Blob/local storage is not accepted by the worker.
- Publishing adapter: existing `writeAdminStore` content adapter, restricted to `type: news`.
- New automation state: `news-automation-v3.json`, keyed by `siteId`.
- Existing News and Blog records are retained. This change does not delete, redirect, noindex, or migrate historical content.

Only one configured site was discovered in this repository. The configuration model supports additional site files and site IDs without changing worker logic.
