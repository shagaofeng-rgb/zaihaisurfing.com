import AdminShell from '@/components/AdminShell';
import AdminTimeFilter from '@/components/AdminTimeFilter';
import {getAdminDashboardData} from '@/lib/backendStore';
import {getCommerceSnapshot} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

const rangeLabels: Record<string, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
  custom: 'Custom range'
};

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  const start = startOfDay(date);
  start.setDate(start.getDate() - day + 1);
  return start;
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function parseAdminTimeFilter(searchParams: Record<string, string | string[] | undefined>) {
  const now = new Date();
  const rangeParam = Array.isArray(searchParams.range) ? searchParams.range[0] : searchParams.range;
  const range = (['day', 'week', 'month', 'year', 'custom'].includes(rangeParam || '') ? rangeParam : 'month') as 'day' | 'week' | 'month' | 'year' | 'custom';
  const earliestCustomStart = new Date(now);
  earliestCustomStart.setFullYear(earliestCustomStart.getFullYear() - 2);
  let from = new Date(now.getFullYear(), now.getMonth(), 1);
  let to = endOfDay(now);
  let note = '';

  if (range === 'day') from = startOfDay(now);
  if (range === 'week') from = startOfWeek(now);
  if (range === 'year') from = new Date(now.getFullYear(), 0, 1);
  if (range === 'custom') {
    const startParam = Array.isArray(searchParams.start) ? searchParams.start[0] : searchParams.start;
    const endParam = Array.isArray(searchParams.end) ? searchParams.end[0] : searchParams.end;
    from = parseDate(startParam, earliestCustomStart);
    to = endOfDay(parseDate(endParam, now));
    if (from < earliestCustomStart) {
      from = earliestCustomStart;
      note = 'Custom query is limited to the latest 2 years.';
    }
    if (from > to) [from, to] = [startOfDay(to), endOfDay(from)];
  }

  const start = dateInputValue(from);
  const end = dateInputValue(to);
  return {range, start, end, from, to, summary: `${rangeLabels[range]} | ${start} to ${end}${note ? ` | ${note}` : ''}`};
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const timeFilter = parseAdminTimeFilter(await searchParams);
  const [snapshot, backend] = await Promise.all([
    getCommerceSnapshot({from: timeFilter.from, to: timeFilter.to}),
    getAdminDashboardData()
  ]);

  return (
    <AdminShell active="Dashboard">
      <div className="admin-title" id="overview">
        <p className="eyebrow">B2B + B2C commerce backend</p>
        <h1>Orders, Leads, Content and Conversion Data</h1>
        <p>The backend is prepared for CMS management, checkout tracking, Qianhai payment ports and conversion analytics without changing the approved storefront design.</p>
        <AdminTimeFilter range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="Dashboard time range" summary={timeFilter.summary} />
      </div>

      <div className="admin-metrics">
        <article><span>Today / Range orders</span><strong>{snapshot.metrics.orders}</strong><small>Submitted checkout orders</small></article>
        <article><span>Pending payment</span><strong>{snapshot.metrics.pendingPayment}</strong><small>Need card/T/T confirmation</small></article>
        <article><span>Estimated revenue</span><strong>{money(snapshot.metrics.revenue)}</strong><small>Paid/processing/shipped</small></article>
        <article><span>Visitors captured</span><strong>{snapshot.metrics.visitors}</strong><small>Anonymous visitor IDs</small></article>
        <article><span>Products</span><strong>{backend.metrics.publishedProducts}/{backend.metrics.products}</strong><small>Published / total</small></article>
        <article><span>Content posts</span><strong>{backend.metrics.posts}</strong><small>Blog and news CMS</small></article>
        <article><span>Leads</span><strong>{backend.metrics.leads}</strong><small>Orders + abandoned checkout</small></article>
        <article><span>Conversion</span><strong>{backend.metrics.conversionRate}%</strong><small>Orders / unique visitors</small></article>
      </div>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Payment Gateway</p>
          <h2>Qianhai Credit Card Port</h2>
          <p>Status: <strong>{snapshot.paymentGateway.status}</strong></p>
        </div>
        <dl className="admin-config-list">
          <div><dt>Create payment</dt><dd>{snapshot.paymentGateway.createEndpoint}</dd></div>
          <div><dt>Payment callback</dt><dd>{snapshot.paymentGateway.notifyEndpoint}</dd></div>
          <div><dt>Provider</dt><dd>{snapshot.paymentGateway.provider}</dd></div>
          <div><dt>Required env</dt><dd>QIANHAI_MERCHANT_ID, QIANHAI_GATEWAY_URL, QIANHAI_SECRET_KEY</dd></div>
        </dl>
      </section>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Conversion funnel</p>
          <h2>Buyer Journey</h2>
        </div>
        <div className="admin-grid-list">
          {backend.funnel.map((step) => (
            <article key={step.label}>
              <strong>{step.label}</strong>
              <span>{step.value.toLocaleString()} users/events</span>
              <small>{step.conversion}% from previous step</small>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Recent orders</p>
          <h2>Order Feed</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Date</th><th>Product</th><th>Country</th><th>Total</th><th>Status</th><th>Payment</th></tr>
            </thead>
            <tbody>
              {snapshot.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.createdAt.slice(0, 10)}</td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{order.customer.country}</td>
                  <td>{money(order.total)}</td>
                  <td>{order.status}</td>
                  <td>{order.gatewayStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div>
          <p className="eyebrow">Demand signals</p>
          <h2>Countries and Product Demand</h2>
        </div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{backend.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}</div>
          <div className="admin-bar-list">{backend.popularProducts.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}</div>
        </div>
      </section>
    </AdminShell>
  );
}
