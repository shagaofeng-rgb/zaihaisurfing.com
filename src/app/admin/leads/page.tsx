import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {zhLeadStatus} from '@/lib/adminZh';
import {buildCustomerLeads} from '@/lib/backendStore';
import {readAnalyticsEvents, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function inRange(timestamp: string, from: Date, to: Date) {
  const value = new Date(timestamp).getTime();
  return Number.isFinite(value) && value >= from.getTime() && value <= to.getTime();
}

export default async function AdminLeadsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const leads = buildCustomerLeads(orders, events).filter((lead) => inRange(lead.lastActiveTime, timeFilter.from, timeFilter.to));
  const pagedLeads = paginate(leads, page, perPage);

  return (
    <AdminShell active="leads">
      <div className="admin-title">
        <p className="eyebrow">线索与弃单</p>
        <h1>线索/弃单</h1>
        <p>跟踪真实结账开始、按钮点击、订单创建和待付款客户信号。</p>
        <AdminTimeFilter action="/admin/leads" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="线索活跃时间" summary={timeFilter.summary} params={params} />
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>线索</th><th>状态</th><th>关注产品</th><th>来源页面</th><th>流量来源</th><th>备注</th><th>最后活跃</th><th>操作</th></tr></thead>
            <tbody>
              {pagedLeads.items.length ? pagedLeads.items.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong><br /><small>{lead.email || lead.id}</small></td>
                  <td><span className="admin-status draft">{zhLeadStatus(lead.status)}</span></td>
                  <td>{lead.interestedProducts.join(', ') || '-'}</td>
                  <td>{lead.source}</td>
                  <td>{lead.trafficSource}</td>
                  <td>{lead.notes}</td>
                  <td>{formatAdminDate(lead.lastActiveTime)}</td>
                  <td><a className="admin-detail-link" href={`/admin/leads/${encodeURIComponent(lead.id)}`}>查看详情</a></td>
                </tr>
              )) : <tr><td colSpan={8}>当前时间范围内暂无真实线索/弃单数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/leads" params={params} page={pagedLeads.page} perPage={pagedLeads.perPage} total={pagedLeads.total} totalPages={pagedLeads.totalPages} />
      </section>
    </AdminShell>
  );
}
