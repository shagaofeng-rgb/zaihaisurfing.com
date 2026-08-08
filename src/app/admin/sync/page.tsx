import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth} from '@/lib/adminDataViews';
import {readGoogleSeoSnapshot} from '@/lib/googleSeo';
import {readSitemapState} from '@/lib/sitemapState';

export const dynamic = 'force-dynamic';

function googleSeoReady() {
  return Boolean(
    process.env.GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON ||
      (process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL && process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY)
  );
}

export default async function AdminSyncPage() {
  const [health, seo, sitemap] = await Promise.all([
    getRetailAdminHealth(),
    readGoogleSeoSnapshot(),
    readSitemapState()
  ]);
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
      status: googleSeoReady()
        ? `Service account configured. Runs every 3 days. Last sync: ${formatAdminDate(seo.syncedAt || '')}`
        : 'Waiting for Google service-account environment variables.'
    },
    {
      name: 'Monthly form email test',
      path: '/api/cron/test-contact-form',
      status: 'Runs on the first day of every month to verify form-email delivery.'
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
        <p>News and Blog automated publishing are removed. Existing content remains available, and editors can continue to create and publish content manually from the admin console.</p>
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
