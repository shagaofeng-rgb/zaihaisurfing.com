# Old code removal plan

1. Retire the scheduled `/api/cron/news-autopilot` route. It now returns 410 after cron authentication.
2. Remove its Vercel schedule and replace it with separate ingest and publish endpoints.
3. Remove old draft seeding and manual approval actions from the News admin route and dashboard.
4. Preserve historical content and prior state files as data, but do not read them from the v3 worker.
5. Keep the old source file path only as a renamed v3 implementation to avoid breaking existing imports; no legacy draft publisher remains exported.

Rollback: restore `vercel.json`, the News admin/cron route files, and `src/lib/newsAutopilot.ts` from `.audit-backups/news-automation-v3-20260811-131432`, then redeploy. Do not restore old schedules without reviewing their publication behavior.
