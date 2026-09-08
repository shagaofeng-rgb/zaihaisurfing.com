import {notFound} from 'next/navigation';
import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {zhBrowser, zhCountry, zhDeviceName} from '@/lib/adminLabels';
import {formatAdminDate, money} from '@/lib/adminDataViews';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {getVisitorProfileDetail} from '@/lib/visitorRecords';

export const dynamic = 'force-dynamic';

const sensitiveField = /password|secret|token|card|cvv|authorization/i;

function eventLabel(type: string) {
  const labels: Record<string, string> = {
    page_view: '浏览页面',
    product_view: '浏览产品',
    commerce_click: '商业按钮点击',
    checkout_start: '开始结账',
    begin_checkout: '开始结账',
    checkout_submit: '提交结账',
    contact_inquiry: '提交询盘表单',
    form_submit: '提交表单',
    whatsapp_click: '点击 WhatsApp'
  };
  return labels[type] || type;
}

function displayPayload(payload: Record<string, unknown>) {
  return Object.entries(payload || {})
    .filter(([key, value]) => !sensitiveField.test(key) && value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
}

export default async function AdminVisitorDetailPage({
  params,
  searchParams
}: {
  params: Promise<{profileId: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{profileId}, query] = await Promise.all([params, searchParams]);
  const timeFilter = parseAdminTimeFilter(query);
  const {page, perPage} = parseAdminPagination(query);
  const detail = await getVisitorProfileDetail(decodeURIComponent(profileId), {from: timeFilter.from, to: timeFilter.to});
  if (!detail) notFound();
  const journey = paginate(detail.events, page, perPage);
  const {profile} = detail;

  return (
    <AdminShell active="visitors">
      <div className="admin-title admin-detail-title">
        <div>
          <p className="eyebrow">客户访问详情</p>
          <h1>{profile.name || profile.customerNo}</h1>
          <p>{profile.customerNo} · {profile.customerTag}。这里将同一客户的访问、表单、WhatsApp 和订单信号统一归档。</p>
        </div>
        <a className="admin-detail-link" href="/admin/visitors">返回访客列表</a>
      </div>

      <AdminTimeFilter
        action={`/admin/visitors/${encodeURIComponent(profile.profileId)}`}
        range={timeFilter.range}
        start={timeFilter.start}
        end={timeFilter.end}
        label="访问路径时间"
        summary={timeFilter.summary}
        params={query}
      />

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">客户档案</p><h2>身份与活跃概况</h2></div>
          <span className="admin-status published">{profile.customerTag}</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>客户编号</dt><dd>{profile.customerNo}</dd></div>
          <div><dt>姓名</dt><dd>{profile.name || '匿名访客'}</dd></div>
          <div><dt>邮箱</dt><dd>{profile.email || '-'}</dd></div>
          <div><dt>电话</dt><dd>{profile.phone || '-'}</dd></div>
          <div><dt>公司</dt><dd>{profile.company || '-'}</dd></div>
          <div><dt>国家/地区</dt><dd>{zhCountry(profile.country)}</dd></div>
          <div><dt>首次访问</dt><dd>{formatAdminDate(profile.firstSeenAt)}</dd></div>
          <div><dt>最近访问</dt><dd>{formatAdminDate(profile.lastSeenAt)}</dd></div>
          <div><dt>累计访问</dt><dd>{profile.totalVisits} 次 / {profile.sessions} 个会话</dd></div>
          <div><dt>访问范围</dt><dd>{profile.pages} 个页面 / {profile.visitDays} 个访问日</dd></div>
          <div><dt>设备</dt><dd>{zhDeviceName(profile.device)} / {zhBrowser(profile.browser)}</dd></div>
          <div><dt>业务信号</dt><dd>表单 {profile.formSubmissions} / WhatsApp {profile.whatsappClicks} / 订单 {profile.orderCount}</dd></div>
          <div className="admin-detail-span"><dt>最近页面</dt><dd>{profile.lastPage || '-'}</dd></div>
        </dl>
      </section>

      <div className="admin-detail-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">归属信息</p><h2>访问标识</h2></div></div>
          <dl className="admin-detail-list admin-detail-single">
            <div><dt>关联访客/会话标识</dt><dd>{detail.identities.length ? detail.identities.join(', ') : '-'}</dd></div>
            <div><dt>出现国家/地区</dt><dd>{detail.countries.map(zhCountry).join(', ') || '-'}</dd></div>
            <div><dt>设备与浏览器</dt><dd>{detail.devices.join(', ') || '-'}</dd></div>
            <div><dt>历史 IP</dt><dd>{detail.ips.join(', ') || '-'}</dd></div>
          </dl>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">表单资料</p><h2>客户留下的信息</h2></div></div>
          {detail.formEvents.length ? <div className="admin-form-history">
            {detail.formEvents.map((event) => (
              <article key={event.id}>
                <strong>{formatAdminDate(event.timestamp)} · {eventLabel(event.type)}</strong>
                <small>{event.page || '-'}</small>
                <dl>
                  {displayPayload(event.payload).map((field) => <div key={field.key}><dt>{field.key}</dt><dd>{field.value}</dd></div>)}
                </dl>
              </article>
            ))}
          </div> : <p className="admin-empty-copy">该客户暂未留下表单资料。</p>}
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">关联订单</p><h2>订单与成交记录</h2></div></div>
        {detail.orders.length ? <div className="admin-table-wrap"><table><thead><tr><th>订单号</th><th>产品</th><th>金额</th><th>订单状态</th><th>支付状态</th><th>创建时间</th></tr></thead><tbody>
          {detail.orders.map((order) => <tr key={order.id}>
            <td><a className="admin-detail-link" href={`/admin/orders/${encodeURIComponent(order.id)}`}>{order.id}</a></td>
            <td>{order.productName} × {order.quantity}</td>
            <td>{money(order.total)}</td>
            <td>{order.status}</td>
            <td>{order.gatewayStatus}</td>
            <td>{formatAdminDate(order.createdAt)}</td>
          </tr>)}
        </tbody></table></div> : <p className="admin-empty-copy">暂无关联订单。</p>}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">完整访问路径</p>
            <h2>按时间倒序排列</h2>
            <p>当前显示 {timeFilter.summary}，可通过上方时间筛选查看其他访问周期。</p>
          </div>
        </div>
        {journey.items.length ? <ol className="admin-journey-list">
          {journey.items.map((event) => (
            <li key={event.id}>
              <div className="admin-journey-time"><strong>{formatAdminDate(event.timestamp)}</strong><span>{eventLabel(event.type)}</span></div>
              <div className="admin-journey-body"><strong>{event.page || '-'}</strong><span>{event.pageTitle || '未记录页面标题'}</span></div>
              <div className="admin-journey-meta">
                <span>{zhCountry(event.country || 'Unknown')}</span>
                <span>{zhDeviceName(event.device || 'Unknown')} / {zhBrowser(event.browser || 'Unknown')}</span>
                <span>{event.referrer || '直接访问'}</span>
                <span>{event.ip || '未记录 IP'}</span>
              </div>
            </li>
          ))}
        </ol> : <p className="admin-empty-copy">当前时间范围内没有访问记录。</p>}
        <AdminPagination
          basePath={`/admin/visitors/${encodeURIComponent(profile.profileId)}`}
          params={query}
          page={journey.page}
          perPage={journey.perPage}
          total={journey.total}
          totalPages={journey.totalPages}
        />
      </section>
    </AdminShell>
  );
}
