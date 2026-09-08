import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {zhBrowser, zhCountry, zhDeviceName, zhSourceDetail, zhTrafficPlatform, zhTrafficSource} from '@/lib/adminLabels';
import {formatAdminDate} from '@/lib/adminDataViews';
import {parseAdminPagination} from '@/lib/adminPagination';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {getVisitorRecords} from '@/lib/visitorRecords';

export const dynamic = 'force-dynamic';

function exportHref(params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === 'page' || key === 'perPage') return;
    if (Array.isArray(value)) value.forEach((item) => item && search.append(key, item));
    else if (value) search.set(key, value);
  });
  search.set('format', 'csv');
  return `/api/admin/visitors?${search.toString()}`;
}

export default async function AdminVisitorsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const q = typeof params.q === 'string' ? params.q : '';
  const country = typeof params.country === 'string' ? params.country : '';
  const source = typeof params.source === 'string' ? params.source : '';
  const report = await getVisitorRecords({
    from: timeFilter.from,
    to: timeFilter.to,
    q,
    country,
    source,
    page,
    perPage
  });
  const pageVisits = report.records.reduce((sum, record) => sum + record.periodVisits, 0);
  const pageForms = report.records.reduce((sum, record) => sum + record.formSubmissions, 0);
  const pageOrders = report.records.reduce((sum, record) => sum + record.orderCount, 0);

  return (
    <AdminShell active="visitors">
      <div className="admin-title">
        <p className="eyebrow">客户访问中心</p>
        <h1>访客与访问路径</h1>
        <p>同一客户的访问事件已归并为稳定档案。列表展示客户级摘要，详情页保留完整访问路径、表单、WhatsApp 点击和订单关联。</p>
        <AdminTimeFilter action="/admin/visitors" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="客户活跃时间" summary={timeFilter.summary} params={params} />
      </div>

      <section className="admin-metrics">
        <article><span>匹配客户</span><strong>{report.total}</strong><small>当前时间与筛选条件</small></article>
        <article><span>本页访问</span><strong>{pageVisits}</strong><small>按客户合并后的页面访问</small></article>
        <article><span>表单记录</span><strong>{pageForms}</strong><small>当前页客户累计</small></article>
        <article><span>关联订单</span><strong>{pageOrders}</strong><small>当前页客户累计</small></article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">客户档案</p>
            <h2>按客户归属显示</h2>
            <p>数据源：{report.store.provider}；{report.store.configured ? '稳定存储已连接' : '当前存储未配置为持久模式'}；更新时间：{formatAdminDate(report.generatedAt)}</p>
          </div>
          <a className="button secondary small" href={exportHref(params)}>导出当前筛选 CSV</a>
        </div>
        <form className="admin-filter-row" action="/admin/visitors" method="get">
          <input name="range" type="hidden" value={timeFilter.range} />
          {timeFilter.start ? <input name="start" type="hidden" value={timeFilter.start} /> : null}
          {timeFilter.end ? <input name="end" type="hidden" value={timeFilter.end} /> : null}
          <input name="page" type="hidden" value="1" />
          <input name="perPage" type="hidden" value={perPage} />
          <label><span>搜索</span><input name="q" placeholder="客户编号、姓名、邮箱、页面或 IP" defaultValue={q} /></label>
          <label><span>国家/地区</span><input name="country" placeholder="例如 美国 / 菲律宾 / US" defaultValue={country} /></label>
          <label><span>流量来源</span><input name="source" placeholder="例如 Google / Meta / 直接访问" defaultValue={source} /></label>
          <button type="submit">筛选查询</button>
          <a className="button secondary small" href="/admin/visitors">清除筛选</a>
        </form>

        <div className="admin-table-wrap">
          <table className="admin-customer-table">
            <thead>
              <tr>
                <th>客户</th>
                <th>最近访问</th>
                <th>访问概况</th>
                <th>来源</th>
                <th>位置与设备</th>
                <th>业务信号</th>
                <th>最近页面</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {report.records.length ? report.records.map((record) => (
                <tr key={record.profileId}>
                  <td>
                    <strong>{record.name || record.customerNo}</strong>
                    <small>{record.name ? record.customerNo : '匿名客户档案'}</small>
                    {record.email ? <small>{record.email}</small> : null}
                    {record.phone ? <small>{record.phone}</small> : null}
                  </td>
                  <td><strong>{formatAdminDate(record.lastSeenAt)}</strong><small>首次：{formatAdminDate(record.firstSeenAt)}</small></td>
                  <td><strong>本期 {record.periodVisits} 次</strong><small>累计 {record.totalVisits} 次 / {record.sessions} 会话</small><small>{record.pages} 个页面 / {record.visitDays} 个访问日</small></td>
                  <td><strong>{zhTrafficSource(record.source)}</strong><small>{zhTrafficPlatform(record.sourcePlatform)}</small><small>{zhSourceDetail(record.sourceDetail)}</small></td>
                  <td><strong>{zhCountry(record.country)}</strong><small>{zhDeviceName(record.device)} / {zhBrowser(record.browser)}</small><small>{record.ip || '未记录 IP'}</small></td>
                  <td><span className="admin-status published">{record.customerTag}</span><small>表单 {record.formSubmissions} / WhatsApp {record.whatsappClicks} / 订单 {record.orderCount}</small></td>
                  <td className="admin-path-cell">{record.lastPage}</td>
                  <td><a className="admin-detail-link" href={`/admin/visitors/${encodeURIComponent(record.profileId)}?range=${timeFilter.range}&start=${timeFilter.start}&end=${timeFilter.end}`}>查看访问详情</a></td>
                </tr>
              )) : <tr><td colSpan={8}>当前条件下暂无真实客户访问记录。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/visitors" params={params} page={report.page} perPage={report.perPage} total={report.total} totalPages={report.totalPages} />
      </section>
    </AdminShell>
  );
}
