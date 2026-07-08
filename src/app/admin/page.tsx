import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import AdminPagination from '@/components/AdminPagination';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhOrderStatus, zhPaymentStatus} from '@/lib/adminZh';
import {getAdminDashboardData} from '@/lib/backendStore';
import {getCommerceSnapshot, readStoreOrders} from '@/lib/commerceStore';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {formatAdminDate, getRetailAdminHealth, money} from '@/lib/adminDataViews';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const [snapshot, backend, allOrders, health] = await Promise.all([
    getCommerceSnapshot({from: timeFilter.from, to: timeFilter.to}),
    getAdminDashboardData({from: timeFilter.from, to: timeFilter.to}),
    readStoreOrders(),
    getRetailAdminHealth()
  ]);
  const filteredOrders = allOrders
    .filter((order) => {
      const time = new Date(order.createdAt).getTime();
      if (Number.isNaN(time)) return false;
      if (timeFilter.from && time < timeFilter.from.getTime()) return false;
      if (timeFilter.to && time > timeFilter.to.getTime()) return false;
      return true;
    })
    .slice()
    .reverse();
  const pagedOrders = paginate(filteredOrders, page, perPage);

  return (
    <AdminShell active="dashboard">
      <div className="admin-title" id="overview">
        <p className="eyebrow">B2C 零售后台</p>
        <h1>订单、支付、库存、客户与内容数据总览</h1>
        <p>本页只读取真实持久化数据：订单来自结账流程，访客来自埋点事件，商品与内容来自后台 CMS，旧数据不会被迁移或覆盖。</p>
        <AdminTimeFilter action="/admin" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="数据统计" summary={timeFilter.summary} />
      </div>

      <div className="admin-metrics">
        <article><span>销售额</span><strong>{money(snapshot.metrics.revenue)}</strong><small>已付款/处理中/已发货/已完成订单</small></article>
        <article><span>订单数</span><strong>{snapshot.metrics.orders}</strong><small>当前筛选范围内订单</small></article>
        <article><span>待付款</span><strong>{snapshot.metrics.pendingPayment}</strong><small>需要客服或网关继续跟进</small></article>
        <article><span>真实访客</span><strong>{snapshot.metrics.visitors}</strong><small>按访客 ID 去重</small></article>
        <article><span>商品</span><strong>{backend.metrics.publishedProducts}/{backend.metrics.products}</strong><small>已发布 / 总商品数</small></article>
        <article><span>低库存</span><strong>{health.metrics.lowStock}</strong><small>库存小于等于 5 的商品</small></article>
        <article><span>内容</span><strong>{backend.metrics.posts}</strong><small>新闻与博客</small></article>
        <article><span>转化率</span><strong>{backend.metrics.conversionRate}%</strong><small>订单 / 独立访客</small></article>
      </div>

      <section className="admin-panel admin-health-panel">
        <div>
          <p className="eyebrow">数据保护</p>
          <h2>后台真实数据源状态</h2>
          <p>优化仅修改代码与后台页面，不清空订单、访客、客户、支付、物流、邮件日志和 CMS 数据。</p>
        </div>
        <dl className="admin-config-list">
          <div><dt>持久化存储</dt><dd>{health.persistentStore ? '已配置 Vercel Blob / KV / Redis 持久化数据源' : '当前环境未检测到生产持久化凭证，请确认 Vercel 环境变量已配置'}</dd></div>
          <div><dt>订单数据</dt><dd>{health.metrics.orders} 条订单，{health.metrics.paymentNotices} 条支付通知，{health.metrics.refunds} 条退款记录</dd></div>
          <div><dt>物流与邮件</dt><dd>{health.metrics.shipments} 条物流记录，{health.metrics.emails} 条邮件日志</dd></div>
          <div><dt>支付接口</dt><dd>{snapshot.paymentGateway.provider}，状态：{snapshot.paymentGateway.status}</dd></div>
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

      <section className="admin-panel">
        <div>
          <p className="eyebrow">需求信号</p>
          <h2>访问国家与产品需求</h2>
        </div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{backend.countries.length ? backend.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实国家/地区数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{backend.popularProducts.length ? backend.popularProducts.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实产品需求数据</span><strong>0</strong></p>}</div>
        </div>
      </section>
    </AdminShell>
  );
}
