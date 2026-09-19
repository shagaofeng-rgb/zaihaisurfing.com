import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {getAcquisitionReport} from '@/lib/trafficReports';

export const dynamic = 'force-dynamic';

type Rows = Awaited<ReturnType<typeof getAcquisitionReport>>['channels'];

function ReportTable({title, rows}: {title: string; rows: Rows}) {
  return (
    <section className="admin-panel">
      <div><p className="eyebrow">来源分析</p><h2>{title}</h2></div>
      <div className="admin-table-wrap">
        <table>
          <thead><tr><th>来源</th><th>访客</th><th>会话</th><th>浏览量</th><th>咨询</th><th>订单</th><th>转化率</th><th>主要活动</th><th>主要落地页</th></tr></thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.visitors}</td>
                <td>{row.sessions}</td>
                <td>{row.pageViews}</td>
                <td>{row.leads}</td>
                <td>{row.purchases}</td>
                <td>{row.conversionRate}%</td>
                <td>{row.topCampaign}</td>
                <td>{row.topLandingPage}</td>
              </tr>
            )) : <tr><td colSpan={9}>暂无业务数据。</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function AcquisitionPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const model = String(params.model || 'last') as 'first' | 'last' | 'session';
  const report = await getAcquisitionReport({from: timeFilter.from, to: timeFilter.to, model});
  return (
    <AdminShell active="acquisition">
      <div className="admin-title">
        <p className="eyebrow">流量分析</p>
        <h1>流量来源与转化表现</h1>
        <p>按首次接触、最近接触或本次访问，查看不同来源带来的访客、咨询和订单。</p>
        <AdminTimeFilter action="/admin/analytics/acquisition" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="归因统计时间" summary={timeFilter.summary} />
      </div>
      <div className="admin-metrics">
        <article><span>访客</span><strong>{report.metrics.visitors}</strong><small>独立访客</small></article>
        <article><span>会话</span><strong>{report.metrics.sessions}</strong><small>有效访问会话</small></article>
        <article><span>浏览量</span><strong>{report.metrics.pageViews}</strong><small>页面浏览次数</small></article>
        <article><span>客户咨询</span><strong>{report.metrics.leads}</strong><small>表单提交</small></article>
        <article><span>订单</span><strong>{report.metrics.purchases}</strong><small>已完成订单</small></article>
        <article><span>转化率</span><strong>{report.metrics.conversionRate}%</strong><small>咨询和订单 / 访客</small></article>
        <article><span>主要来源</span><strong>{report.metrics.topSource}</strong><small>当前筛选周期</small></article>
        <article><span>最近更新</span><strong>{report.lastSyncedAt ? report.lastSyncedAt.slice(0, 16).replace('T', ' ') : '-'}</strong><small>业务数据记录时间</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">统计口径</p><h2>选择来源计算方式</h2></div>
        <div className="admin-actions">
          <a className="button secondary small" href="/admin/analytics/acquisition?model=first">首次来源</a>
          <a className="button secondary small" href="/admin/analytics/acquisition?model=last">最近来源</a>
          <a className="button secondary small" href="/admin/analytics/acquisition?model=session">本次访问来源</a>
        </div>
      </section>
      <ReportTable title="渠道表现" rows={report.channels} />
      <ReportTable title="平台与来源表现" rows={report.platforms} />
      <ReportTable title="推广活动表现" rows={report.campaigns} />
    </AdminShell>
  );
}
