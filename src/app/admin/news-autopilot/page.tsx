import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {isAdminTimestampInRange, parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {formatNewsTime, newsAutopilotRuntimeStatus, readNewsAutopilotState} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';

export const dynamic = 'force-dynamic';

export default async function NewsAutopilotPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const site = defaultNewsSite();
  const state = await readNewsAutopilotState();
  const siteState = site ? state.sites[site.site_id] : undefined;
  const runtime = newsAutopilotRuntimeStatus();
  const sources = site ? [...site.sources.primary_whitelist, ...site.sources.fallback_whitelist] : [];
  const candidates = (siteState?.candidates || []).filter((item) => isAdminTimestampInRange(item.createdAt, timeFilter.from, timeFilter.to)).slice().reverse();
  const runs = (siteState?.runs || []).filter((item) => isAdminTimestampInRange(item.finishedAt, timeFilter.from, timeFilter.to)).slice().reverse();
  const checks = (siteState?.deliveryChecks || []).filter((item) => isAdminTimestampInRange(item.checkedAt, timeFilter.from, timeFilter.to)).slice().reverse();
  const sourcePagination = parseAdminPagination(params, 'sourcePage', 'sourcePerPage');
  const candidatePagination = parseAdminPagination(params, 'candidatePage', 'candidatePerPage');
  const runPagination = parseAdminPagination(params, 'runPage', 'runPerPage');
  const checkPagination = parseAdminPagination(params, 'checkPage', 'checkPerPage');
  const pagedSources = paginate(sources, sourcePagination.page, sourcePagination.perPage);
  const pagedCandidates = paginate(candidates, candidatePagination.page, candidatePagination.perPage);
  const pagedRuns = paginate(runs, runPagination.page, runPagination.perPage);
  const pagedChecks = paginate(checks, checkPagination.page, checkPagination.perPage);

  return <AdminShell active="news-autopilot">
    <div className="admin-title">
      <p className="eyebrow">News 自动化 V3</p>
      <h1>新闻采集与发布</h1>
      <p>每 12 小时只采集、验证、评分和保存候选；每 48 小时发布一篇，并完成 News 列表、详情、Sitemap 和 RSS 前台验收。Blog 不参与该流程。</p>
      <AdminTimeFilter action="/admin/news-autopilot" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="自动任务记录时间" summary={timeFilter.summary} params={params} />
    </div>

    <section className="admin-panel">
      <h2>站点配置</h2>
      {site ? <div className="admin-config-list">
        <div><dt>站点 ID</dt><dd>{site.site_id}</dd></div>
        <div><dt>News 路由</dt><dd>{site.news.list_route} / {site.news.detail_route_pattern}</dd></div>
        <div><dt>时区</dt><dd>{site.timezone}</dd></div>
        <div><dt>最近采集</dt><dd>{siteState?.lastIngestAt ? formatNewsTime(new Date(siteState.lastIngestAt), site.timezone) : '暂无成功记录'}</dd></div>
        <div><dt>最近前台发布</dt><dd>{siteState?.lastPublishedAt ? formatNewsTime(new Date(siteState.lastPublishedAt), site.timezone) : '暂无前台验收记录'}</dd></div>
      </div> : <p>当前没有有效的 News 站点配置。</p>}
      <div className="admin-action-row">
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="ingest" /><button type="submit">仅执行采集</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="dry-run" /><button type="submit">预览下次发布</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="publish" /><button type="submit">执行发布检查</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="toggle" /><input type="hidden" name="enabled" value={siteState?.enabled === false ? 'true' : 'false'} /><button type="submit">{siteState?.enabled === false ? '恢复 News 自动化' : '暂停 News 自动化'}</button></form>
      </div>
    </section>

    <section className="admin-panel">
      <h2>运行保护状态</h2>
      <div className="admin-metrics">
        <article><span>自动任务</span><strong>{runtime.schedulingEnabled && siteState?.enabled !== false ? '已启用' : '已暂停'}</strong><small>生产环境开关与站点开关</small></article>
        <article><span>发布能力</span><strong>{runtime.publishingEnabled ? '已启用' : '已暂停'}</strong><small>关闭时只允许采集</small></article>
        <article><span>持久化存储</span><strong>{runtime.durableStore}</strong><small>{runtime.hasDistributedLock ? '分布式锁可用' : '需要分布式锁'}</small></article>
        <article><span>本期合格候选</span><strong>{candidates.filter((candidate) => candidate.status === 'candidate').length}</strong><small>仅含可归因候选</small></article>
      </div>
    </section>

    <section className="admin-panel">
      <h2>来源白名单</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>域名</th><th>层级</th><th>信任分</th><th>允许主题</th></tr></thead><tbody>
        {pagedSources.items.map((source) => <tr key={source.domain}><td><a href={source.rss_or_api_url} target="_blank" rel="noreferrer">{source.domain}</a></td><td>{site?.sources.primary_whitelist.some((item) => item.domain === source.domain) ? '主要来源' : '备用来源'}</td><td>{source.source_trust_score}</td><td>{source.allowed_topics.join(', ')}</td></tr>)}
        {!pagedSources.items.length ? <tr><td colSpan={4}>暂无来源配置。</td></tr> : null}
      </tbody></table></div>
      <AdminPagination basePath="/admin/news-autopilot" params={params} page={pagedSources.page} perPage={pagedSources.perPage} total={pagedSources.total} totalPages={pagedSources.totalPages} pageParam="sourcePage" perPageParam="sourcePerPage" />
    </section>

    <section className="admin-panel">
      <h2>候选内容决策</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>来源</th><th>标题</th><th>分数</th><th>状态</th><th>原始发布时间</th><th>原因</th></tr></thead><tbody>
        {pagedCandidates.items.map((candidate) => <tr key={candidate.id}><td><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">{candidate.sourceName}</a></td><td>{candidate.title}</td><td>{candidate.score}</td><td>{candidate.status}</td><td>{formatNewsTime(new Date(candidate.sourcePublishedAt), site?.timezone)}</td><td>{candidate.rejectReason || '-'}</td></tr>)}
        {!pagedCandidates.items.length ? <tr><td colSpan={6}>当前时间范围内没有候选记录。</td></tr> : null}
      </tbody></table></div>
      <AdminPagination basePath="/admin/news-autopilot" params={params} page={pagedCandidates.page} perPage={pagedCandidates.perPage} total={pagedCandidates.total} totalPages={pagedCandidates.totalPages} pageParam="candidatePage" perPageParam="candidatePerPage" />
    </section>

    <section className="admin-panel">
      <h2>执行审计</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>完成时间</th><th>任务</th><th>状态</th><th>候选数</th><th>拒绝数</th><th>原因</th></tr></thead><tbody>
        {pagedRuns.items.map((run) => <tr key={run.id}><td>{formatNewsTime(new Date(run.finishedAt), site?.timezone)}</td><td>{run.kind}</td><td>{run.status}</td><td>{run.candidateCount}</td><td>{run.rejectedCount}</td><td>{run.reason}</td></tr>)}
        {!pagedRuns.items.length ? <tr><td colSpan={6}>当前时间范围内没有执行记录。</td></tr> : null}
      </tbody></table></div>
      <AdminPagination basePath="/admin/news-autopilot" params={params} page={pagedRuns.page} perPage={pagedRuns.perPage} total={pagedRuns.total} totalPages={pagedRuns.totalPages} pageParam="runPage" perPageParam="runPerPage" />
    </section>

    <section className="admin-panel">
      <h2>前台交付验收</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>检查时间</th><th>文章</th><th>列表页</th><th>详情页</th><th>Sitemap</th><th>RSS</th><th>结果</th></tr></thead><tbody>
        {pagedChecks.items.map((check) => <tr key={check.id}><td>{formatNewsTime(new Date(check.checkedAt), site?.timezone)}</td><td>{check.slug}</td><td>{check.list.status}</td><td>{check.detail.status}</td><td>{check.sitemap.status}</td><td>{check.rss.status}</td><td>{check.passed ? '通过' : check.error || '未通过'}</td></tr>)}
        {!pagedChecks.items.length ? <tr><td colSpan={7}>当前时间范围内没有前台验收记录。</td></tr> : null}
      </tbody></table></div>
      <AdminPagination basePath="/admin/news-autopilot" params={params} page={pagedChecks.page} perPage={pagedChecks.perPage} total={pagedChecks.total} totalPages={pagedChecks.totalPages} pageParam="checkPage" perPageParam="checkPerPage" />
    </section>
  </AdminShell>;
}
