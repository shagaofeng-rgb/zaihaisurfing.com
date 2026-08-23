import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {zhCountry, zhDeviceName} from '@/lib/adminLabels';
import {parseAdminPagination} from '@/lib/adminPagination';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {getWhatsAppAnalytics} from '@/lib/whatsappAnalytics';

export const dynamic = 'force-dynamic';

function ReportList({title, rows}: {title: string; rows: Array<{label: string; count: number}>}) {
  return (
    <section className="admin-panel">
      <div><p className="eyebrow">WhatsApp</p><h2>{title}</h2></div>
      <div className="admin-bar-list">
        {rows.length ? rows.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.count}</strong></p>) : <p><span>暂无真实点击数据</span><strong>0</strong></p>}
      </div>
    </section>
  );
}

export default async function AdminWhatsAppAnalyticsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const report = await getWhatsAppAnalytics({from: timeFilter.from, to: timeFilter.to, page, perPage});

  return (
    <AdminShell active="whatsapp">
      <div className="admin-title">
        <p className="eyebrow">WhatsApp 转化</p>
        <h1>WhatsApp 点击分析</h1>
        <p>仅记录网站内的真实 WhatsApp 跳转点击。点击不等于已经对话或成交；后续询盘和订单仅按同一匿名访客的时间顺序关联。</p>
        <AdminTimeFilter action="/admin/analytics/whatsapp" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="WhatsApp 统计时间" summary={timeFilter.summary} />
      </div>

      <div className="admin-metrics">
        <article><span>点击次数</span><strong>{report.metrics.clicks}</strong><small>已过滤机器人</small></article>
        <article><span>独立点击访客</span><strong>{report.metrics.uniqueVisitors}</strong><small>匿名访客编号去重</small></article>
        <article><span>访客点击率</span><strong>{report.metrics.visitorClickRate}%</strong><small>独立点击访客 / 访问访客</small></article>
        <article><span>关联表单</span><strong>{report.metrics.linkedLeads}</strong><small>点击后提交的询盘</small></article>
        <article><span>关联订单</span><strong>{report.metrics.linkedOrders}</strong><small>点击后创建的订单</small></article>
        <article><span>热门入口</span><strong>{report.metrics.topPlacement}</strong><small>点击次数最多的位置</small></article>
      </div>

      <div className="admin-two-col">
        <ReportList title="入口位置" rows={report.placements} />
        <ReportList title="点击页面" rows={report.pages} />
      </div>
      <div className="admin-two-col">
        <ReportList title="关联产品" rows={report.products} />
        <ReportList title="来源渠道" rows={report.sources} />
      </div>

      <section className="admin-panel">
        <div><p className="eyebrow">Click Log</p><h2>点击明细</h2><p>当前数据源：{report.store.provider}；生成时间：{report.generatedAt.slice(0, 19).replace('T', ' ')}</p></div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>时间</th><th>访客编号</th><th>入口</th><th>按钮</th><th>页面</th><th>产品</th><th>国家/地区</th><th>设备</th><th>来源</th><th>活动</th></tr></thead>
            <tbody>
              {report.records.length ? report.records.map((record) => (
                <tr key={record.id}>
                  <td>{record.time.slice(0, 19).replace('T', ' ')}</td>
                  <td>{record.visitorId}</td>
                  <td>{record.placement}</td>
                  <td>{record.targetText}</td>
                  <td>{record.page}</td>
                  <td>{record.product}</td>
                  <td>{zhCountry(record.country)}</td>
                  <td>{zhDeviceName(record.device)} / {record.browser}</td>
                  <td>{record.source}</td>
                  <td>{record.campaign}</td>
                </tr>
              )) : <tr><td colSpan={10}>暂无 WhatsApp 点击记录。新版本上线后，所有站内 WhatsApp 入口会自动记录。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/analytics/whatsapp" params={params} page={report.page} perPage={report.perPage} total={report.total} totalPages={report.totalPages} />
      </section>
    </AdminShell>
  );
}
