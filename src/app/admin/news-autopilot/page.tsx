import AdminShell from '@/components/AdminShell';
import {formatNewsTime, newsAutopilotRuntimeStatus, readNewsAutopilotState} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';

export const dynamic = 'force-dynamic';

export default async function NewsAutopilotPage() {
  const site = defaultNewsSite();
  const state = await readNewsAutopilotState();
  const siteState = site ? state.sites[site.site_id] : undefined;
  const runtime = newsAutopilotRuntimeStatus();
  const candidates = siteState?.candidates.slice().reverse().slice(0, 25) || [];
  const runs = siteState?.runs.slice().reverse().slice(0, 25) || [];

  return <AdminShell active="news-autopilot">
    <div className="admin-title">
      <p className="eyebrow">NEWS AUTOMATION V3</p>
      <h1>News collection and publication</h1>
      <p>Every 12 hours the system only collects, validates, scores and stores candidates. Every 48 hours it publishes one verified News article only after the public list, detail page, sitemap and RSS all pass delivery checks. Blog is not part of this workflow.</p>
    </div>

    <section className="admin-panel">
      <h2>Configured site</h2>
      {site ? <div className="admin-config-list">
        <div><dt>Site ID</dt><dd>{site.site_id}</dd></div>
        <div><dt>News routes</dt><dd>{site.news.list_route} and {site.news.detail_route_pattern}</dd></div>
        <div><dt>Time zone</dt><dd>{site.timezone}</dd></div>
        <div><dt>Last ingest</dt><dd>{siteState?.lastIngestAt ? formatNewsTime(new Date(siteState.lastIngestAt), site.timezone) : 'No successful ingest recorded'}</dd></div>
        <div><dt>Last public News</dt><dd>{siteState?.lastPublishedAt ? formatNewsTime(new Date(siteState.lastPublishedAt), site.timezone) : 'No public News verification recorded'}</dd></div>
      </div> : <p>No valid News site configuration is available.</p>}
      <div className="admin-action-row">
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="ingest" /><button type="submit">Run ingest only</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="dry-run" /><button type="submit">Preview next publication</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="publish" /><button type="submit">Run publication check</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="toggle" /><input type="hidden" name="enabled" value={siteState?.enabled === false ? 'true' : 'false'} /><button type="submit">{siteState?.enabled === false ? 'Resume News automation' : 'Pause News automation'}</button></form>
      </div>
    </section>

    <section className="admin-panel">
      <h2>Runtime safeguards</h2>
      <div className="admin-metrics">
        <article><span>Automation switch</span><strong>{runtime.schedulingEnabled && siteState?.enabled !== false ? 'Enabled' : 'Paused'}</strong><small>Production environment and site switch</small></article>
        <article><span>Publication switch</span><strong>{runtime.publishingEnabled ? 'Enabled' : 'Paused'}</strong><small>Direct publishing is disabled when this switch is off</small></article>
        <article><span>Persistent storage</span><strong>{runtime.durableStore}</strong><small>{runtime.hasDistributedLock ? 'Distributed lease available' : 'A distributed lease is required'}</small></article>
        <article><span>Candidate pool</span><strong>{candidates.filter((candidate) => candidate.status === 'candidate').length}</strong><small>Eligible, source-attributed records only</small></article>
      </div>
    </section>

    <section className="admin-panel">
      <h2>Source allowlist</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>Domain</th><th>Tier</th><th>Trust score</th><th>Use</th></tr></thead><tbody>
        {site ? [...site.sources.primary_whitelist, ...site.sources.fallback_whitelist].map((source) => <tr key={source.domain}><td><a href={source.rss_or_api_url} target="_blank" rel="noreferrer">{source.domain}</a></td><td>{site.sources.primary_whitelist.some((item) => item.domain === source.domain) ? 'Primary' : 'Fallback'}</td><td>{source.source_trust_score}</td><td>{source.allowed_topics.join(', ')}</td></tr>) : null}
      </tbody></table></div>
    </section>

    <section className="admin-panel">
      <h2>Recent candidate decisions</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>Source</th><th>Title</th><th>Score</th><th>Status</th><th>Published at source</th><th>Reason</th></tr></thead><tbody>
        {candidates.map((candidate) => <tr key={candidate.id}><td><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">{candidate.sourceName}</a></td><td>{candidate.title}</td><td>{candidate.score}</td><td>{candidate.status}</td><td>{candidate.sourcePublishedAt}</td><td>{candidate.rejectReason || '-'}</td></tr>)}
      </tbody></table></div>
    </section>

    <section className="admin-panel">
      <h2>Execution audit</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>Finished</th><th>Task</th><th>Status</th><th>Accepted</th><th>Reason</th></tr></thead><tbody>
        {runs.map((run) => <tr key={run.id}><td>{formatNewsTime(new Date(run.finishedAt), site?.timezone)}</td><td>{run.kind}</td><td>{run.status}</td><td>{run.candidateCount}</td><td>{run.reason}</td></tr>)}
      </tbody></table></div>
    </section>
  </AdminShell>;
}
