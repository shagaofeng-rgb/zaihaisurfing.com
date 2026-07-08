import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {zhEventType} from '@/lib/adminZh';
import {listAuditLogs} from '@/lib/adminExtraStore';
import {readAnalyticsEvents, readEmailLogs, readPaymentNotifications, readRefundRecords, readShipmentRecords} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  const params = await searchParams;
  const {page, perPage} = parseAdminPagination(params);
  const [audits, events, emails, notices, refunds, shipments] = await Promise.all([
    listAuditLogs(),
    readAnalyticsEvents(),
    readEmailLogs(),
    readPaymentNotifications(),
    readRefundRecords(),
    readShipmentRecords()
  ]);
  const derived = [
    ...audits.map((item) => ({id: item.id, time: item.createdAt, action: item.action, target: item.target, actor: item.actor, detail: item.detail})),
    ...events.filter((event) => /payment|shipment|refund|checkout|order/i.test(event.type)).map((event) => ({id: event.id, time: event.timestamp, action: zhEventType(event.type), target: event.page, actor: event.visitorId, detail: JSON.stringify(event.payload).slice(0, 220)})),
    ...emails.map((email) => ({id: email.id, time: email.createdAt, action: '邮件发送记录', target: email.orderId, actor: email.customerEmail, detail: `${email.templateType} / ${email.status}`})),
    ...notices.map((notice) => ({id: notice.id, time: notice.createdAt, action: '支付网关通知', target: notice.orderId, actor: notice.provider, detail: `${notice.paymentStatus} / verified=${notice.verified}`})),
    ...refunds.map((refund) => ({id: refund.id, time: refund.createdAt, action: '退款记录', target: refund.orderId, actor: 'admin/payment', detail: `${refund.refundNo} / ${refund.status}`})),
    ...shipments.map((shipment) => ({id: shipment.id, time: shipment.createdAt, action: '物流记录', target: shipment.orderId, actor: shipment.logisticsProvider || 'admin', detail: `${shipment.trackingNumber || '-'} / ${shipment.shipmentStatus}`}))
  ].sort((a, b) => b.time.localeCompare(a.time));
  const paged = paginate(derived, page, perPage);

  return (
    <AdminShell active="audit">
      <div className="admin-title">
        <p className="eyebrow">操作日志</p>
        <h1>关键操作与系统事件</h1>
        <p>合并展示后台操作、支付通知、退款、物流、邮件和结账类事件，方便排查订单与数据同步问题。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>时间</th><th>动作</th><th>对象</th><th>操作者/来源</th><th>详情</th></tr></thead>
            <tbody>
              {paged.items.length ? paged.items.map((item) => (
                <tr key={item.id}><td>{formatAdminDate(item.time)}</td><td>{item.action}</td><td>{item.target}</td><td>{item.actor}</td><td><small>{item.detail}</small></td></tr>
              )) : <tr><td colSpan={5}>暂无真实操作日志。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/audit" params={params} page={paged.page} perPage={paged.perPage} total={paged.total} totalPages={paged.totalPages} />
      </section>
    </AdminShell>
  );
}
