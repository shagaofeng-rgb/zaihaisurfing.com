import Link from 'next/link';
import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhOrderStatus, zhShipmentStatus} from '@/lib/adminZh';
import {readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminFulfillmentPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const orders = (await readStoreOrders()).filter((order) => order.status !== 'cancelled').slice().reverse();
  const paged = paginate(orders, page, perPage);

  return (
    <AdminShell active="fulfillment">
      <div className="admin-title">
        <p className="eyebrow">发货与物流</p>
        <h1>发货、跟踪号与物流状态</h1>
        <p>物流信息在订单详情页保存，会同步到订单、物流记录和访客事件，方便客服跟踪交付进度。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>订单号</th><th>客户国家</th><th>产品</th><th>订单状态</th><th>物流状态</th><th>承运商</th><th>跟踪号</th><th>操作</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}<br /><small>{formatAdminDate(order.updatedAt)}</small></td>
                  <td>{order.customer.country || '-'}</td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{zhOrderStatus(order.status)}</td>
                  <td>{zhShipmentStatus(order.shipmentStatus)}</td>
                  <td>{order.logisticsProvider || '-'}</td>
                  <td>{order.trackingNumber || '-'}</td>
                  <td><Link className="button secondary small" href={`/admin/orders/${order.id}`}>更新物流</Link></td>
                </tr>
              )) : <tr><td colSpan={8}>暂无可发货订单。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/fulfillment" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
