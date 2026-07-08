import Link from 'next/link';
import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate, money} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {readRefundRecords, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminReturnsPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const [refunds, orders] = await Promise.all([readRefundRecords(), readStoreOrders()]);
  const orderMap = new Map(orders.map((order) => [order.id, order]));
  const paged = paginate(refunds.slice().reverse(), page, perPage);

  return (
    <AdminShell active="returns">
      <div className="admin-title">
        <p className="eyebrow">退换货管理</p>
        <h1>退款与售后记录</h1>
        <p>这里展示真实退款记录。新增退款请进入订单详情页处理，避免脱离订单和支付状态单独改账。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>退款号</th><th>订单号</th><th>客户</th><th>金额</th><th>状态</th><th>原因</th><th>时间</th><th>操作</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((refund) => {
                const order = orderMap.get(refund.orderId);
                return (
                  <tr key={refund.id}>
                    <td>{refund.refundNo}</td>
                    <td>{refund.orderId}</td>
                    <td>{order?.customer.email || '-'}</td>
                    <td>{money(refund.amount)}</td>
                    <td>{refund.status}</td>
                    <td>{refund.reason || '-'}</td>
                    <td>{formatAdminDate(refund.createdAt)}</td>
                    <td><Link className="button secondary small" href={`/admin/orders/${refund.orderId}`}>查看订单</Link></td>
                  </tr>
                );
              }) : <tr><td colSpan={8}>暂无真实退款/退换货记录。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/returns" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
