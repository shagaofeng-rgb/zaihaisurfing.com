import {notFound} from 'next/navigation';
import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {formatAdminDate} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {isAdminTimestampInRange, parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {zhLeadStatus} from '@/lib/adminZh';
import {getCustomerLeadDetail} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

function fieldValue(value: string) {
  return value || '-';
}

function eventLabel(type: string) {
  const labels: Record<string, string> = {
    page_view: '浏览页面', product_view: '浏览产品', commerce_click: '点击商业按钮',
    checkout_start: '开始结账', checkout_submit: '提交结账', contact_inquiry: '提交询盘表单',
    form_submit: '提交表单', payment_notice: '支付通知', payment_return: '支付返回',
    whatsapp_click: '点击 WhatsApp'
  };
  return labels[type] || type;
}

export default async function AdminLeadDetailPage({
  params,
  searchParams
}: {
  params: Promise<{leadId: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{leadId}, query] = await Promise.all([params, searchParams]);
  const detail = await getCustomerLeadDetail(decodeURIComponent(leadId));
  if (!detail) notFound();
  const timeFilter = parseAdminTimeFilter(query);
  const {page, perPage} = parseAdminPagination(query);
  const {lead, formFields, orders, visitorIds} = detail;
  const timeline = detail.timeline.filter((event) => isAdminTimestampInRange(event.timestamp, timeFilter.from, timeFilter.to)).reverse();
  const pagedTimeline = paginate(timeline, page, perPage);

  return (
    <AdminShell active="leads">
      <div className="admin-title admin-detail-title">
        <div>
          <p className="eyebrow">客户线索档案</p>
          <h1>{lead.name}</h1>
          <p>客户表单、订单、来源归因和访问活动均来自真实订单及 Analytics 记录。</p>
        </div>
        <a className="admin-detail-link" href="/admin/leads">返回线索列表</a>
      </div>

      <AdminTimeFilter action={`/admin/leads/${encodeURIComponent(leadId)}`} range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="访问路径时间" summary={timeFilter.summary} params={query} />

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">客户资料</p><h2>联系与业务信息</h2></div>
          <span className="admin-status published">{zhLeadStatus(lead.status)}</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>姓名</dt><dd>{fieldValue(lead.name)}</dd></div>
          <div><dt>最后活跃</dt><dd>{formatAdminDate(lead.lastActiveTime)}</dd></div>
          <div><dt>邮箱</dt><dd>{fieldValue(lead.email)}</dd></div>
          <div><dt>电话</dt><dd>{fieldValue(lead.phone)}</dd></div>
          <div><dt>公司</dt><dd>{fieldValue(lead.company)}</dd></div>
          <div><dt>国家/地区</dt><dd>{fieldValue(lead.country)}</dd></div>
          <div><dt>关注产品</dt><dd>{fieldValue(lead.interestedProducts.join(', '))}</dd></div>
          <div><dt>购物车内容</dt><dd>{fieldValue(lead.cartItems.join(', '))}</dd></div>
          <div><dt>线索来源</dt><dd>{fieldValue(lead.source)}</dd></div>
          <div><dt>流量来源</dt><dd>{fieldValue(lead.trafficSource)}</dd></div>
          <div className="admin-detail-span"><dt>备注/留言</dt><dd>{fieldValue(lead.notes)}</dd></div>
        </dl>
      </section>

      <div className="admin-detail-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">表单资料</p><h2>客户提交字段</h2></div></div>
          {formFields.length ? <dl className="admin-detail-list admin-detail-single">
            {formFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
          </dl> : <p className="admin-empty-copy">该线索来自浏览或结账行为，没有额外表单字段。</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">关联信息</p><h2>访问与订单归属</h2></div></div>
          <dl className="admin-detail-list admin-detail-single">
            <div><dt>访客标识</dt><dd>{visitorIds.length ? visitorIds.join(', ') : '未记录'}</dd></div>
            <div><dt>当前周期访问事件</dt><dd>{timeline.length}</dd></div>
            <div><dt>关联订单</dt><dd>{orders.length}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">订单</p><h2>订单与弃单记录</h2></div></div>
        {orders.length ? <div className="admin-table-wrap"><table><thead><tr><th>订单号</th><th>产品</th><th>金额</th><th>订单状态</th><th>支付状态</th><th>创建时间</th></tr></thead><tbody>
          {orders.map((order) => <tr key={order.id}><td><a className="admin-detail-link" href={`/admin/orders/${encodeURIComponent(order.id)}`}>{order.id}</a></td><td>{order.productName} × {order.quantity}</td><td>{order.currency} {order.total.toLocaleString()}</td><td>{order.status}</td><td>{order.gatewayStatus}</td><td>{formatAdminDate(order.createdAt)}</td></tr>)}
        </tbody></table></div> : <p className="admin-empty-copy">暂无关联订单。</p>}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">客户旅程</p><h2>访问路径与来源信息</h2><p>按时间倒序展示，可通过时间筛选查看指定周期。</p></div></div>
        {pagedTimeline.items.length ? <ol className="admin-journey-list">
          {pagedTimeline.items.map((event) => <li key={event.id}>
            <div className="admin-journey-time"><strong>{formatAdminDate(event.timestamp)}</strong><span>{eventLabel(event.type)}</span></div>
            <div className="admin-journey-body"><strong>{event.page || '-'}</strong><span>{event.pageTitle || '未记录页面标题'}</span></div>
            <div className="admin-journey-meta"><span>{event.country || '未知国家'}</span><span>{event.device || '未知设备'} / {event.browser || '未知浏览器'}</span><span>{event.referrer || '直接访问'}</span><span>{event.ip || '未记录 IP'}</span></div>
          </li>)}
        </ol> : <p className="admin-empty-copy">当前时间范围内没有关联访问路径。</p>}
        <AdminPagination basePath={`/admin/leads/${encodeURIComponent(leadId)}`} params={query} page={pagedTimeline.page} perPage={pagedTimeline.perPage} total={pagedTimeline.total} totalPages={pagedTimeline.totalPages} />
      </section>
    </AdminShell>
  );
}
