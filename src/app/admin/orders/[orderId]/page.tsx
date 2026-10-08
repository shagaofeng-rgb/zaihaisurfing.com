import {notFound} from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import AdminOrderActions from '@/components/AdminOrderActions';
import {zhOrderStatus, zhPaymentStatus, zhShipmentStatus} from '@/lib/adminZh';
import {
  findStoreOrder,
  readAuthorizationRecords,
  readEmailLogs,
  readPaymentNotifications,
  readRefundRecords,
  readShipmentRecords
} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

function JsonBlock({value}: {value: unknown}) {
  return <details className="admin-record-details"><summary>查看原始记录</summary><pre className="admin-json">{JSON.stringify(value, null, 2)}</pre></details>;
}

export default async function AdminOrderDetailPage({params}: {params: Promise<{orderId: string}>}) {
  const {orderId} = await params;
  const order = await findStoreOrder(orderId);
  if (!order) notFound();
  const [refunds, shipments, authorizations, emails, notifications] = await Promise.all([
    readRefundRecords(),
    readShipmentRecords(),
    readAuthorizationRecords(),
    readEmailLogs(),
    readPaymentNotifications()
  ]);
  const orderRefunds = refunds.filter((item) => item.orderId === order.id).reverse();
  const orderShipments = shipments.filter((item) => item.orderId === order.id).reverse();
  const orderAuthorizations = authorizations.filter((item) => item.orderId === order.id).reverse();
  const orderEmails = emails.filter((item) => item.orderId === order.id || item.customerEmail === order.customer.email).reverse();
  const orderNotifications = notifications.filter((item) => item.orderId === order.id).reverse();

  return (
    <AdminShell active="orders">
      <div className="admin-title">
        <p className="eyebrow">订单详情</p>
        <h1>{order.id}</h1>
        <p>{order.productName} x {order.quantity} · {money(order.total)}</p>
      </div>

      <section className="admin-detail-grid">
        <article className="admin-panel">
          <h2>客户信息</h2>
          <dl className="admin-detail-list">
            <div><dt>姓名</dt><dd>{order.customer.name || '未提供'}</dd></div>
            <div><dt>邮箱</dt><dd>{order.customer.email || '未提供'}</dd></div>
            <div><dt>电话</dt><dd>{order.customer.phone || '未提供'}</dd></div>
            <div><dt>国家/地区</dt><dd>{order.customer.country || '未提供'}</dd></div>
            <div><dt>地址</dt><dd>{order.customer.address || '未提供'}</dd></div>
            <div><dt>客户编号</dt><dd>{order.userId || '暂未关联'}</dd></div>
          </dl>
        </article>
        <article className="admin-panel">
          <h2>订单状态</h2>
          <dl className="admin-detail-list">
            <div><dt>订单</dt><dd>{zhOrderStatus(order.status)}</dd></div>
            <div><dt>支付</dt><dd>{zhPaymentStatus(order.gatewayStatus)}</dd></div>
            <div><dt>支付编号</dt><dd>{order.paymentId || order.transactionId || '待生成'}</dd></div>
            <div><dt>退款</dt><dd>{order.refundStatus || '无记录'}</dd></div>
            <div><dt>物流</dt><dd>{zhShipmentStatus(order.shipmentStatus)}</dd></div>
            <div><dt>跟踪号</dt><dd>{order.trackingNumber || '未发货'}</dd></div>
          </dl>
        </article>
      </section>

      <section className="admin-panel">
        <h2>订单操作</h2>
        <AdminOrderActions orderId={order.id} canShip={['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(order.status)} />
      </section>

      <section className="admin-detail-grid">
        <article className="admin-panel"><h2>支付通知</h2>{orderNotifications.length ? orderNotifications.map((item) => <JsonBlock key={item.id} value={item} />) : <p>暂无支付通知记录。</p>}</article>
        <article className="admin-panel"><h2>邮件记录</h2>{orderEmails.length ? orderEmails.map((item) => <JsonBlock key={item.id} value={item} />) : <p>暂无邮件记录。</p>}</article>
        <article className="admin-panel"><h2>物流记录</h2>{orderShipments.length ? orderShipments.map((item) => <JsonBlock key={item.id} value={item} />) : <p>暂无物流记录。</p>}</article>
        <article className="admin-panel"><h2>退款记录</h2>{orderRefunds.length ? orderRefunds.map((item) => <JsonBlock key={item.id} value={item} />) : <p>暂无退款记录。</p>}</article>
        <article className="admin-panel"><h2>预授权记录</h2>{orderAuthorizations.length ? orderAuthorizations.map((item) => <JsonBlock key={item.id} value={item} />) : <p>暂无预授权记录。</p>}</article>
      </section>
    </AdminShell>
  );
}
