import AdminShell from '@/components/AdminShell';
import {formatManila, newsAutopilotRuntimeStatus, readNewsAutopilotState} from '@/lib/newsAutopilot';

export const dynamic = 'force-dynamic';

export default async function NewsAutopilotPage() {
  const state = await readNewsAutopilotState();
  const runtime = newsAutopilotRuntimeStatus();
  const drafts = state.drafts.slice().reverse();

  return <AdminShell active="news-autopilot">
    <div className="admin-title">
      <p className="eyebrow">NEWS AUTOPILOT</p>
      <h1>新闻自主运营</h1>
      <p>仅管理 News。Blog 自动发布保持关闭；所有内容先进入审核草稿，未审核内容不会显示在前台或 sitemap。</p>
    </div>

    <section className="admin-panel">
      <h2>运行状态</h2>
      <div className="admin-metrics">
        <article><span>自动规划</span><strong>{state.enabled ? '已开启' : '已关闭'}</strong><small>后台开关</small></article>
        <article><span>发布节奏</span><strong>48 小时 / 最多 1 篇</strong><small>Asia/Manila</small></article>
        <article><span>上次发布</span><strong>{state.lastPublishedAt ? formatManila(new Date(state.lastPublishedAt)) : '暂无'}</strong><small>仅记录已批准发布</small></article>
        <article><span>待审核草稿</span><strong>{state.drafts.filter((item) => item.status === 'draft').length}</strong><small>不会自动上前台</small></article>
      </div>
      <p><small>生产定时器：{runtime.schedulingEnabled ? '已启用' : '未启用'} · 公开发布：{runtime.publishingEnabled ? '已启用' : '未启用'} · 分布式锁：{runtime.hasDistributedLock ? 'KV 已就绪' : `待配置（当前 ${runtime.durableStore}）`}</small></p>
      <div className="admin-action-row">
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="seed"/><button type="submit">建立后续 6 篇草稿</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="dry-run"/><button type="submit">执行 Dry Run</button></form>
        <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="toggle"/><input type="hidden" name="enabled" value={state.enabled ? 'false' : 'true'}/><button type="submit">{state.enabled ? '关闭自动草稿计划' : '开启自动草稿计划'}</button></form>
      </div>
    </section>

    <section className="admin-panel">
      <h2>来源白名单</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>来源</th><th>地区</th><th>层级</th><th>图片规则</th><th>状态</th></tr></thead><tbody>
        {state.sources.map((source) => <tr key={source.id}><td><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a><br/><small>{source.domain}</small></td><td>{source.region}</td><td>{source.tier === 'official' ? '官方 / 监管' : '行业媒体'}</td><td>{source.imageLicense === 'link-card-only' ? '仅外链，不复制图片' : '未提供'}</td><td>{source.enabled ? '启用' : '停用'} / {source.health}</td></tr>)}
      </tbody></table></div>
    </section>

    <section className="admin-panel">
      <h2>审核草稿</h2>
      {drafts.length ? drafts.map((draft) => <article key={draft.id} className="admin-panel" style={{marginTop: 16}}>
        <p className="eyebrow">{draft.category} · {draft.region}</p>
        <h3>{draft.title}</h3>
        <p>{draft.excerpt}</p>
        <p><small>来源：<a href={draft.source.url} target="_blank" rel="noreferrer">{draft.source.name}</a> · 访问日期：{draft.source.accessedDate}</small></p>
        <details><summary>查看完整草稿</summary><pre style={{whiteSpace: 'pre-wrap', maxWidth: 840, fontFamily: 'inherit'}}>{draft.content}</pre></details>
        <p><small>校验：{draft.validation.length ? draft.validation.join(' ') : '通过'} · 状态：{draft.status === 'published' ? '已发布' : '待审核'}</small></p>
        {draft.status === 'draft' && <form action="/api/admin/news-autopilot" method="post"><input type="hidden" name="action" value="publish"/><input type="hidden" name="draftId" value={draft.id}/><button type="submit">批准并发布英文版</button></form>}
      </article>) : <p>尚未建立草稿。</p>}
    </section>

    <section className="admin-panel">
      <h2>最近运行与审计</h2>
      <div className="admin-table-wrap"><table><thead><tr><th>时间</th><th>触发</th><th>状态</th><th>原因</th></tr></thead><tbody>
        {state.runs.slice().reverse().slice(0, 20).map((run) => <tr key={run.id}><td>{formatManila(new Date(run.finishedAt))}</td><td>{run.trigger}</td><td>{run.status}</td><td>{run.reason}</td></tr>)}
      </tbody></table></div>
    </section>
  </AdminShell>;
}
