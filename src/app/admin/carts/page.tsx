import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate, money} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhDevice, zhEventType} from '@/lib/adminZh';
import {readAnalyticsEvents, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminCartsPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const [events, orders] = await Promise.all([readAnalyticsEvents(), readStoreOrders()]);
  const checkoutEvents = events
    .filter((event) => /cart|checkout|payment|order/i.test(event.type))
    .slice()
    .reverse();
  const orderSessions = new Set(orders.map((order) => order.id));
  const visitorOrders = new Set(orders.map((order) => order.attribution?.visitorId || order.userId).filter(Boolean));
  const abandoned = checkoutEvents.filter((event) => !orderSessions.has(event.sessionId) && !visitorOrders.has(event.visitorId));
  const paged = paginate(checkoutEvents, page, perPage);

  return (
    <AdminShell active="carts">
      <div className="admin-title">
        <p className="eyebrow">购物车与弃购</p>
        <h1>结账行为与弃购线索</h1>
        <p>根据前台真实埋点识别进入结账、提交结账、支付发起和支付失败等行为，用于客服跟进和转化分析。</p>
      </div>
      <div className="admin-metrics">
        <article><span>结账行为</span><strong>{checkoutEvents.length}</strong><small>cart / checkout / payment / order 事件</small></article>
        <article><span>疑似弃购</span><strong>{abandoned.length}</strong><small>未匹配到成交订单的结账行为</small></article>
        <article><span>成交订单</span><strong>{orders.length}</strong><small>真实订单数量</small></article>
        <article><span>已成交金额</span><strong>{money(orders.filter((order) => ['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status)).reduce((sum, order) => sum + order.total, 0))}</strong><small>已付款订单合计</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>时间</th><th>访客</th><th>事件</th><th>页面</th><th>国家</th><th>设备</th><th>来源</th><th>详情</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((event) => (
                <tr key={event.id}>
                  <td>{formatAdminDate(event.timestamp)}</td>
                  <td>{event.visitorId}</td>
                  <td>{zhEventType(event.type)}</td>
                  <td>{event.page}</td>
                  <td>{event.country || '-'}</td>
                  <td>{zhDevice(event.device)} / {event.browser}</td>
                  <td>{event.attribution?.lastTouch?.source || event.referrer || '直接访问'}</td>
                  <td><small>{JSON.stringify(event.payload).slice(0, 180)}</small></td>
                </tr>
              )) : <tr><td colSpan={8}>暂无真实购物车/结账事件。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/carts" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
