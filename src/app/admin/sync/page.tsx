import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth} from '@/lib/adminDataViews';
import {googleSeoConfigStatus, readGoogleSeoSnapshot} from '@/lib/googleSeo';
import {newsAutopilotRuntimeStatus, readNewsAutopilotState} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';
import {readSitemapState} from '@/lib/sitemapState';

export const dynamic = 'force-dynamic';

export default async function AdminSyncPage() {
  const [health, seo, sitemap, newsAutopilot] = await Promise.all([
    getRetailAdminHealth(),
    readGoogleSeoSnapshot(),
    readSitemapState(),
    readNewsAutopilotState()
  ]);
  const googleSeo = googleSeoConfigStatus();
  const newsRuntime = newsAutopilotRuntimeStatus();
  const newsSite = defaultNewsSite();
  const newsState = newsSite ? newsAutopilot.sites[newsSite.site_id] : undefined;
  const googleSeoStatus = seo.status === 'ok'
    ? `Healthy. Last verified sync: ${formatAdminDate(seo.syncedAt)}.`
    : googleSeo.configured
      ? `Needs attention. Last sync status: ${seo.status}. ${seo.error || 'No successful snapshot exists yet.'}`
      : 'Waiting for Google Search Console service-account environment variables.';
  const newsAutopilotStatus = !newsRuntime.schedulingEnabled
    ? 'Scheduling switch is off in production. No automatic News run can publish.'
    : newsState?.enabled === false
      ? 'Planning is disabled by the administrator. No automatic News run can publish.'
      : !newsRuntime.hasDistributedLock
        ? `Blocked safely: a KV/Redis distributed lock is required (current store: ${newsRuntime.durableStore}).`
        : !newsRuntime.publishingEnabled
          ? 'Ingest remains available, but the public publishing switch remains off.'
          : '12-hour ingest and 48-hour public News verification are enabled.';
  const cronJobs = [
    {
      name: 'Sitemap health check',
      path: '/api/cron/sitemap-health',
      status: sitemap.lastRun?.success
        ? `Healthy. Last processed ${sitemap.lastRun.processedUrls} URLs.`
        : 'Waiting for the first run or needs attention.'
    },
    {
      name: 'Google SEO sync',
      path: '/api/cron/sync-google-seo',
      status: `${googleSeoStatus} Scheduled every 3 days.`
    },
    {
      name: 'Monthly form email test',
      path: '/api/cron/test-contact-form',
      status: 'Runs on the first day of every month to verify form-email delivery.'
    },
    {
      name: 'News candidate ingest',
      path: '/api/cron/news-ingest',
      status: `${newsAutopilotStatus} Collects, verifies, deduplicates and scores only; no writing or publishing.`
    },
    {
      name: 'News publication verification',
      path: '/api/cron/news-publish',
      status: 'Checks every 12 hours and publishes only after the 48-hour interval and public list/detail/sitemap/RSS verification pass.'
    }
  ];

  return (
    <AdminShell active="sync">
      <div className="admin-title">
        <p className="eyebrow">DATA SYNC</p>
        <h1>Persistent storage and scheduled service health</h1>
        <p>Verify real order, visitor, content, email, Google SEO and form-test data flows.</p>
      </div>
      <div className="admin-metrics">
        <article><span>Persistent storage</span><strong>{health.persistentStore ? 'Healthy' : 'Needs configuration'}</strong><small>Production uses Vercel Blob, KV, or Redis.</small></article>
        <article><span>Orders</span><strong>{health.metrics.orders}</strong><small>orders.jsonl</small></article>
        <article><span>Visitor events</span><strong>{health.events.length}</strong><small>analytics-events.jsonl</small></article>
        <article><span>SEO pages</span><strong>{seo.pages.length}</strong><small>Search Console page data</small></article>
      </div>
      <section className="admin-panel">
        <h2>Scheduled tasks and data sync</h2>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Task</th><th>Endpoint</th><th>Status</th></tr></thead>
            <tbody>{cronJobs.map((job) => <tr key={job.path}><td>{job.name}</td><td>{job.path}</td><td>{job.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="admin-panel">
        <h2>Editorial publishing</h2>
        <p>Blog is isolated from News automation. News candidates, articles, routes, sitemap entries, RSS, audit logs and scheduled endpoints are separate from Blog data and publishing.</p>
      </section>
      <section className="admin-panel">
        <h2>Recent data timestamps</h2>
        <dl className="admin-config-list">
          <div><dt>Latest order</dt><dd>{formatAdminDate(health.orders[health.orders.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>Latest visitor event</dt><dd>{formatAdminDate(health.events[health.events.length - 1]?.timestamp || '')}</dd></div>
          <div><dt>Latest email log</dt><dd>{formatAdminDate(health.emails[health.emails.length - 1]?.createdAt || '')}</dd></div>
          <div><dt>Google SEO sync</dt><dd>{formatAdminDate(seo.syncedAt || '')}</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
