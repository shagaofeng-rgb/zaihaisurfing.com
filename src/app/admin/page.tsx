import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import AdminPagination from '@/components/AdminPagination';
import AdminBarChart from '@/components/AdminBarChart';
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

  return (
    <AdminShell active="dashboard">
      <div className="admin-title" id="overview">
        <p className="eyebrow">经营概览</p>
        <h1>企业运营数据总览</h1>
        <p>查看当前周期的订单、客户咨询、访问表现与内容运营情况。</p>
        <AdminTimeFilter action="/admin" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="数据统计" summary={timeFilter.summary} />
      </div>

      <div className="admin-metrics">
        <article><span>销售额</span><strong>{money(backend.metrics.revenue)}</strong><small>已付款及履约中订单</small></article>
        <article><span>订单数</span><strong>{backend.metrics.orders}</strong><small>当前筛选范围内订单</small></article>
        <article><span>客户咨询</span><strong>{backend.metrics.leads}</strong><small>已提交表单或结账意向</small></article>
        <article><span>访问客户</span><strong>{backend.metrics.visitors}</strong><small>按匿名访客编号去重</small></article>
        <article><span>商品</span><strong>{backend.metrics.publishedProducts}/{backend.metrics.products}</strong><small>已发布 / 总商品数</small></article>
        <article><span>产品浏览</span><strong>{backend.metrics.productViews}</strong><small>产品详情页访问</small></article>
        <article><span>内容</span><strong>{backend.metrics.posts}</strong><small>新闻与博客</small></article>
        <article><span>转化率</span><strong>{backend.metrics.conversionRate}%</strong><small>订单 / 独立访客</small></article>
      </div>

      <section className="admin-panel admin-health-panel">
        <div>
          <p className="eyebrow">经营提示</p>
          <h2>当前周期重点</h2>
          <p>全部指标以客户访问、表单提交、订单和已发布内容为准。</p>
        </div>
        <dl className="admin-config-list">
          <div><dt>待跟进咨询</dt><dd>{backend.metrics.leads} 条客户需求信号，可在“客户表单”中查看详情。</dd></div>
          <div><dt>已发布商品</dt><dd>{backend.metrics.publishedProducts} 个商品正在前台展示。</dd></div>
          <div><dt>内容运营</dt><dd>{backend.metrics.posts} 篇新闻与博客内容正在管理中。</dd></div>
          <div><dt>访问转化</dt><dd>当前访问转化率为 {backend.metrics.conversionRate}% 。</dd></div>
        </dl>
      </section>

      <section className="admin-panel">
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

      <div className="admin-two-col">
        <AdminBarChart title="客户访问来源" rows={backend.trafficSources} />
        <AdminBarChart title="访问国家与地区" rows={backend.countries} />
      </div>

      <section className="admin-panel">
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

      <AdminBarChart title="产品需求信号" rows={backend.popularProducts} />
    </AdminShell>
  );
}
