import AdminShell from '@/components/AdminShell';
import {facebookPublisherStatus, listFacebookPosts, nextFacebookTopics} from '@/lib/facebookPagePublisher';

export const dynamic = 'force-dynamic';

export default async function FacebookPublisherPage({searchParams}: {searchParams: Promise<{facebook?: string; settings?: string}>}) {
  const [status, posts, params] = await Promise.all([facebookPublisherStatus(), listFacebookPosts(), searchParams]);
  return <AdminShell active="facebook">
    <div className="admin-title">
      <p className="eyebrow">FACEBOOK PAGE PUBLISHER</p>
      <h1>Facebook Page automation</h1>
      <p>Server-side, Page-only publishing. It uses verified ZAIHAI product facts and ZAIHAI-owned image assets only. Publishing remains paused until an administrator completes Meta authorization and enables it here.</p>
    </div>
    {(params.facebook || params.settings) && <section className="admin-panel"><p>{params.facebook || params.settings}</p></section>}
    <section className="admin-panel">
      <h2>Authorization and safety status</h2>
      <div className="admin-metrics">
        <article><span>Meta configuration</span><strong>{status.configuredMeta ? 'Ready' : 'Incomplete'}</strong><small>Server environment only</small></article>
        <article><span>Page connection</span><strong>{status.connected ? 'Connected' : 'Not connected'}</strong><small>{status.pageName || 'Authorization required'}</small></article>
        <article><span>Publishing</span><strong>{status.settings.enabled ? 'Enabled' : 'Paused'}</strong><small>{status.settings.timezone} at {status.settings.publishTime}</small></article>
        <article><span>Token status</span><strong>{status.tokenExpiresSoon ? 'Expires soon' : status.connected ? 'Monitored' : 'Unavailable'}</strong><small>{status.tokenExpiresAt || 'No Page token stored'}</small></article>
      </div>
      <div className="admin-action-row"><a className="admin-button" href="/api/admin/facebook/connect">Connect Meta Page</a></div>
      <p><small>Required Meta permissions: pages_show_list, pages_read_engagement, pages_manage_posts, read_insights. The flow only manages the configured Page ID; it cannot access personal timelines or groups.</small></p>
    </section>
    <section className="admin-panel">
      <h2>Daily schedule</h2>
      <form action="/api/admin/facebook/settings" method="post" className="admin-form-grid">
        <label>Timezone<input name="timezone" defaultValue={status.settings.timezone} required /></label>
        <label>Time (hourly scheduler)<input name="publishTime" type="time" step="3600" defaultValue={status.settings.publishTime} required /></label>
        <label>Publishing status<select name="enabled" defaultValue={String(status.settings.enabled)}><option value="false">Paused</option><option value="true">Enabled</option></select></label>
        <button type="submit">Save schedule</button>
      </form>
      <p><small>Vercel invokes the protected worker hourly. It publishes only when the configured local hour matches, and daily idempotency blocks any duplicate trigger.</small></p>
    </section>
    <section className="admin-panel">
      <h2>Next 14-day topic plan</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>Day</th><th>Content type</th><th>Product</th><th>Industry focus</th></tr></thead><tbody>{nextFacebookTopics().map((item) => <tr key={item.dayOffset}><td>+{item.dayOffset + 1}</td><td>{item.contentType}</td><td>{item.product}</td><td>{item.industry}</td></tr>)}</tbody></table></div>
    </section>
    <section className="admin-panel">
      <h2>Post history</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>Scheduled</th><th>Status</th><th>Product</th><th>Topic</th><th>Facebook</th><th>Reason</th></tr></thead><tbody>{posts.slice(0, 50).map((post) => <tr key={post.id}><td>{post.scheduledDate}</td><td>{post.status}</td><td>{post.productName || '-'}</td><td>{post.industry || '-'}</td><td>{post.facebookPostUrl ? <a href={post.facebookPostUrl} target="_blank" rel="noreferrer">Open post</a> : '-'}</td><td>{post.failureReason || '-'}</td></tr>)}{!posts.length && <tr><td colSpan={6}>No Facebook publishing records yet.</td></tr>}</tbody></table></div>
    </section>
  </AdminShell>;
}
