import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import AdminPagination from '@/components/AdminPagination';
import AdminBarChart from '@/components/AdminBarChart';
import AdminIcon from '@/components/AdminIcon';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhOrderStatus, zhPaymentStatus} from '@/lib/adminZh';
import {getAdminDashboardData} from '@/lib/backendStore';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {formatAdminDate, money} from '@/lib/adminDataViews';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const backend = await getAdminDashboardData({from: timeFilter.from, to: timeFilter.to});
  const filteredOrders = backend.filteredOrders.slice().reverse();
  const pagedOrders = paginate(filteredOrders, page, perPage);
  const pendingOrders = backend.filteredOrders.filter((order) => order.status === 'paid' || order.status === 'processing').length;

  return (
    <AdminShell active="dashboard">
      <div className="admin-title admin-dashboard-title" id="overview">
        <div><p className="eyebrow">工作台</p><h1>经营工作台</h1><p>聚焦待处理事项，查看真实业务数据。</p></div>
        <AdminTimeFilter action="/admin" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="数据统计" summary={timeFilter.summary} />
      </div>

      <div className="admin-workbench-grid">
        <div className="admin-workbench-primary">
          <section className="admin-panel admin-task-panel">
            <div className="admin-panel-heading"><div><h2>待处理事项</h2><p>本周期的业务信号与待处理订单。</p></div></div>
            <div className="admin-task-grid">
              <article className="admin-task-card">
                <span className="admin-task-icon is-blue"><AdminIcon name="inquiry" size={30} /></span>
                <h3>意向信号</h3>
                <strong>{backend.metrics.leads}</strong>
                <p>包含表单提交、结账和联系点击；不等同于已提交咨询。</p>
                <a className="admin-task-cta" href="/admin/leads">查看意向信号 <AdminIcon name="arrow" size={19} /></a>
              </article>
              <article className="admin-task-card">
                <span className="admin-task-icon"><AdminIcon name="orders" size={30} /></span>
                <h3>待处理订单</h3>
                <strong>{pendingOrders}</strong>
                <p>{pendingOrders ? '查看已付款或处理中的订单。' : '当前没有待处理订单。'}</p>
                <a className="admin-task-link" href="/admin/orders">查看订单 <AdminIcon name="arrow" size={18} /></a>
              </article>
            </div>
          </section>

          <section className="admin-panel admin-inquiry-panel">
            <div className="admin-panel-heading"><div><h2>最近表单咨询</h2><p>仅显示客户实际提交的咨询表单。</p></div><a className="admin-detail-link" href="/admin/leads">查看全部 <AdminIcon name="arrow" size={17} /></a></div>
            {backend.inquiryEvents.length ? <div className="admin-table-wrap"><table><thead><tr><th>时间</th><th>客户</th><th>咨询内容</th><th>操作</th></tr></thead><tbody>
              {backend.inquiryEvents.slice(0, 5).map((event) => <tr key={event.id}>
                <td>{formatAdminDate(event.timestamp)}</td><td>{String(event.payload?.name || '未提供姓名')}</td>
                <td>{String(event.payload?.message || event.page)}</td>
                <td><a className="admin-detail-link" href={`/admin/leads/${encodeURIComponent(event.id)}`}>查看详情</a></td>
              </tr>)}
            </tbody></table></div> : <div className="admin-honest-empty"><AdminIcon name="inquiry" size={46} /><strong>本期暂无表单咨询</strong><p>只有客户实际提交表单后，记录才会在这里出现。</p></div>}
          </section>
        </div>

        <aside className="admin-panel admin-overview-panel" aria-label="真实数据概览">
          <div className="admin-panel-heading"><div><h2>数据概览</h2><p>{timeFilter.summary}</p></div></div>
          <dl className="admin-overview-list">
            <div><dt><AdminIcon name="customers" />访问客户<small>匿名访客去重</small></dt><dd>{backend.metrics.visitors}</dd></div>
            <div><dt><AdminIcon name="views" />产品浏览<small>产品详情页访问</small></dt><dd>{backend.metrics.productViews}</dd></div>
            <div><dt><AdminIcon name="store" />已发布商品<small>已发布 / 总商品</small></dt><dd>{backend.metrics.publishedProducts}<small> / {backend.metrics.products}</small></dd></div>
            <div><dt><AdminIcon name="content" />内容<small>新闻与博客记录</small></dt><dd>{backend.metrics.posts}</dd></div>
            <div><dt><AdminIcon name="revenue" />销售额<small>已付款及履约中订单</small></dt><dd>{money(backend.metrics.revenue)}</dd></div>
          </dl>
          <a className="admin-overview-link" href="/admin/analytics"><AdminIcon name="analytics" size={18} />查看访问分析 <AdminIcon name="arrow" size={18} /></a>
        </aside>
      </div>

      <section className="admin-panel admin-dashboard-secondary">
        <div>
          <p className="eyebrow">转化漏斗</p>
          <h2>客户访问路径</h2>
        </div>
        <div className="admin-grid-list">
          {backend.funnel.map((step) => (
            <article key={step.label}>
              <strong>{step.label}</strong>
              <span>{step.value.toLocaleString()} 次</span>
              <small>相对上一步 {step.conversion}%</small>
            </article>
          ))}
        </div>
      </section>

      <div className="admin-two-col admin-dashboard-secondary">
        <AdminBarChart title="客户访问来源" rows={backend.trafficSources} />
        <AdminBarChart title="访问国家与地区" rows={backend.countries} />
      </div>

      <section className="admin-panel admin-dashboard-secondary">
        <div>
          <p className="eyebrow">最新订单</p>
          <h2>订单记录</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>订单号</th><th>日期</th><th>产品</th><th>国家/地区</th><th>金额</th><th>订单状态</th><th>支付状态</th></tr>
            </thead>
            <tbody>
              {pagedOrders.items.length ? pagedOrders.items.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{formatAdminDate(order.createdAt)}</td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{order.customer.country || '-'}</td>
                  <td>{money(order.total)}</td>
                  <td>{zhOrderStatus(order.status)}</td>
                  <td>{zhPaymentStatus(order.gatewayStatus)}</td>
                </tr>
              )) : <tr><td colSpan={7}>暂无真实订单数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin" params={params} page={pagedOrders.page} perPage={pagedOrders.perPage} total={pagedOrders.total} totalPages={pagedOrders.totalPages} />
      </section>

      <div className="admin-dashboard-secondary"><AdminBarChart title="产品需求信号" rows={backend.popularProducts} /></div>
    </AdminShell>
  );
}
