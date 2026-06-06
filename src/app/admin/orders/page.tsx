import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import {zhOrderStatus, zhPaymentMethod, zhPaymentStatus} from '@/lib/adminZh';
import {readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

export default async function AdminOrdersPage() {
  const orders = (await readStoreOrders()).slice().reverse();
  return (
    <AdminShell active="orders">
      <div className="admin-title">
        <p className="eyebrow">订单管理</p>
        <h1>订单管理</h1>
        <p>前台结账、Oceanpayment 通知、物流、退款和客户账号绑定都会同步到这里。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户</th>
                <th>产品</th>
                <th>金额</th>
                <th>支付</th>
                <th>物流</th>
                <th>日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length ? orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong><br /><small>{zhOrderStatus(order.status)}</small></td>
                  <td>{order.customer.name}<br /><small>{order.customer.email} | {order.customer.country}</small></td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{money(order.total)}</td>
                  <td>{zhPaymentMethod(order.paymentMethod)}<br /><small>{zhPaymentStatus(order.gatewayStatus)}</small></td>
                  <td>{order.logisticsStatus}<br /><small>{order.trackingNumber || '暂无物流单号'}</small></td>
                  <td>{order.createdAt.slice(0, 10)}</td>
                  <td><Link className="button secondary small" href={`/admin/orders/${order.id}`}>查看详情</Link></td>
                </tr>
              )) : <tr><td colSpan={8}>暂无真实订单数据。客户在前台结账页提交后会实时出现在这里。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
