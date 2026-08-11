# SEO and indexation baseline

- Existing sitemap index and News sitemap endpoints were present before the v3 change.
- The old generic posts sitemap mixed News and Blog URLs. V3 separates `news-*.xml` and `blog-*.xml` parts.
- V3 News detail pages contain canonical metadata through the existing metadata helper, `NewsArticle` JSON-LD, an Original source panel and an Editorial disclaimer.
- News sitemap includes only published News from the last two days. It cannot be truthfully non-empty until a verified v3 article exists.
- No historical URL has been removed, redirected, or noindexed by this change.

Production Search Console coverage, crawl status and historic URL decisions require a production export and must not be inferred from source code.
