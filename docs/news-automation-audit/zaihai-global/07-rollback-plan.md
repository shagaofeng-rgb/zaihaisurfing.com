# Rollback plan

1. Use the git commit created for this change as the release boundary.
2. Restore the backed-up files in `.audit-backups/news-automation-v3-20260811-131432` only after confirming the incident scope.
3. Redeploy the prior known-good Vercel deployment or revert the release commit; do not reset the repository or delete production data.
4. Preserve `news-automation-v3.json`, News records and delivery checks for diagnosis.
5. If a publication passes CMS write but fails public verification, the worker changes that record to draft and leaves a retry/audit record. Investigate cache, routes, sitemap/RSS and store persistence before rerunning.
