import AdminPagination from '@/components/AdminPagination';
import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {paginate, parseAdminPagination} from '@/lib/adminPagination';
import {parseAdminTimeFilter} from '@/lib/adminTimeFilter';
import {formatAdminDate} from '@/lib/adminDataViews';
import {zhLeadStatus} from '@/lib/adminZh';
import {buildCustomerLeads, type CustomerLead} from '@/lib/backendStore';
import {readAnalyticsEvents, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function inRange(timestamp: string, from: Date, to: Date) {
  const value = new Date(timestamp).getTime();
  return Number.isFinite(value) && value >= from.getTime() && value <= to.getTime();
}

function customerKey(customer: CustomerLead) {
  const email = customer.email.trim().toLowerCase();
  const phone = customer.phone.replace(/\D/g, '');
  return email ? `email:${email}` : phone ? `phone:${phone}` : `lead:${customer.id}`;
}

function mergeCustomers(customers: CustomerLead[]) {
  const grouped = new Map<string, CustomerLead>();
  customers.forEach((customer) => {
    const key = customerKey(customer);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, customer);
      return;
    }
    const latest = customer.lastActiveTime > existing.lastActiveTime ? customer : existing;
    grouped.set(key, {
      ...latest,
      interestedProducts: [...new Set([...existing.interestedProducts, ...customer.interestedProducts])],
      cartItems: [...new Set([...existing.cartItems, ...customer.cartItems])],
      notes: [existing.notes, customer.notes].filter(Boolean).join(' | ')
    });
  });
  return [...grouped.values()].sort((a, b) => b.lastActiveTime.localeCompare(a.lastActiveTime));
}

export default async function AdminCustomersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const {page, perPage} = parseAdminPagination(params);
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const customers = mergeCustomers(
    buildCustomerLeads(orders, events)
      .filter((lead) => lead.email || lead.phone)
      .filter((lead) => inRange(lead.lastActiveTime, timeFilter.from, timeFilter.to))
  );
  const pagedCustomers = paginate(customers, page, perPage);

  return (
    <AdminShell active="customers">
      <div className="admin-title">
        <p className="eyebrow">CRM</p>
        <h1>客户管理</h1>
        <p>按邮箱或手机号归并同一客户，保留询盘、结账和订单产生的真实联系方式。</p>
        <AdminTimeFilter action="/admin/customers" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="客户活跃时间" summary={timeFilter.summary} params={params} />
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>客户</th><th>联系方式</th><th>公司</th><th>国家/地区</th><th>关注产品</th><th>状态</th><th>最后活跃</th><th>操作</th></tr></thead>
            <tbody>
              {pagedCustomers.items.length ? pagedCustomers.items.map((customer) => (
                <tr key={customerKey(customer)}>
                  <td><strong>{customer.name}</strong><br /><small>{customer.source}</small></td>
                  <td>{customer.email}<br /><small>{customer.phone}</small></td>
                  <td>{customer.company || '-'}</td>
                  <td>{customer.country || '-'}</td>
                  <td>{customer.interestedProducts.join(', ') || '-'}</td>
                  <td><span className="admin-status published">{zhLeadStatus(customer.status)}</span></td>
                  <td>{formatAdminDate(customer.lastActiveTime)}</td>
                  <td><a className="admin-detail-link" href={`/admin/leads/${encodeURIComponent(customer.id)}`}>查看客户详情</a></td>
                </tr>
              )) : <tr><td colSpan={8}>当前时间范围内暂无真实客户数据。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination basePath="/admin/customers" params={params} page={pagedCustomers.page} perPage={pagedCustomers.perPage} total={pagedCustomers.total} totalPages={pagedCustomers.totalPages} />
      </section>
    </AdminShell>
  );
}
