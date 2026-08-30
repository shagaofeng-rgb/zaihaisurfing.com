# News automatic publishing repair — 2026-08-30

## Incident

The production cron jobs continued to run, but ingest returned zero accepted candidates. Current feed simulation showed that valid recent articles scored between 57 and 64 while the configured threshold was 70. One article reached 76 only after crossing the former 72-hour maximum age. Eight configured endpoints also returned HTTP 403, HTTP 404, or ordinary HTML instead of RSS/Atom.

## Repair

- Keep the 48-hour publishing cadence and 12-hour ingest cadence.
- Extend primary candidate age from 72 to 120 hours.
- Use a primary quality threshold of 58 and a separate fallback threshold of 55.
- Extend fallback age from 7 to 14 days.
- Remove eight confirmed-unusable endpoints from active source pools.
- Retry degraded sources after 24 hours instead of suppressing them for seven days.
- Reject responses that do not contain a parseable dated RSS/Atom item.
- When primary ingest accepts no candidates, immediately fill from the fallback pool.
- Log rejection counts by source failure, stale/invalid data, duplicate, and score/topic gate.
- Require both a marine/water context and a commercial operations, technology, safety, regulation, or market context; block generic EV and incident coverage.
- Permit the source-health worker to validate an explicitly configured feed URL when homepage discovery is absent.

## Safeguards retained

- A candidate must have a source URL, title, summary, timestamp, relevant industry topic, and quality score.
- Duplicate URLs, titles, fingerprints, and semantically repeated titles remain blocked.
- News content must be based only on the source metadata supplied to the model.
- Blog content and fabricated fallback content are forbidden.
- Only ZAIHAI-owned neutral editorial images are used automatically.
- A publication is successful only when the public list, detail page, source panel, disclaimer, NewsArticle schema, sitemap, and RSS checks all pass.

## Rollback

- Git branch: `backup/pre-news-autopublish-repair-2026-08-30`
- Revert the repair commit and redeploy the prior production deployment if candidate quality or delivery verification regresses.
- Do not reset or replace the production durable store.
