import Link from 'next/link';
import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate, getRetailAdminHealth, money} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhOrderStatus, zhPaymentMethod, zhPaymentStatus} from '@/lib/adminZh';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const health = await getRetailAdminHealth();
  const orders = health.orders.slice().reverse();
  const paged = paginate(orders, page, perPage);

  return (
    <AdminShell active="payments">
      <div className="admin-title">
        <p className="eyebrow">支付与退款</p>
        <h1>支付、通知、退款记录</h1>
        <p>读取订单支付状态、Oceanpayment 通知、退款记录和预授权记录。退款操作在订单详情页执行并写入真实退款日志。</p>
      </div>
      <div className="admin-metrics">
        <article><span>支付成功</span><strong>{health.orders.filter((item) => item.gatewayStatus === 'success').length}</strong><small>网关成功状态</small></article>
        <article><span>待处理</span><strong>{health.orders.filter((item) => ['pending', 'processing', 'not_submitted'].includes(item.gatewayStatus)).length}</strong><small>待支付或处理中</small></article>
        <article><span>退款记录</span><strong>{health.refunds.length}</strong><small>真实退款日志</small></article>
        <article><span>支付通知</span><strong>{health.notices.length}</strong><small>Oceanpayment notice</small></article>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>订单号</th><th>客户</th><th>金额</th><th>支付方式</th><th>支付状态</th><th>订单状态</th><th>Payment ID</th><th>操作</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}<br /><small>{formatAdminDate(order.createdAt)}</small></td>
                  <td>{order.customer.email || order.checkout.contact}</td>
                  <td>{money(order.total)}</td>
                  <td>{zhPaymentMethod(order.paymentMethod)}</td>
                  <td>{zhPaymentStatus(order.gatewayStatus)}</td>
                  <td>{zhOrderStatus(order.status)}</td>
                  <td>{order.paymentId || order.transactionId || '-'}</td>
                  <td><Link className="button secondary small" href={`/admin/orders/${order.id}`}>处理</Link></td>
                </tr>
              )) : <tr><td colSpan={8}>暂无真实支付数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/payments" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
