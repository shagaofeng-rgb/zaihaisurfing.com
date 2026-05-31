import {requireAdminSession} from '@/lib/adminAuth';
import AdminTimeFilter from '@/components/AdminTimeFilter';
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
  let start = dateInputValue(from);
  let end = dateInputValue(now);
  let note = '';

  if (range === 'day') {
    from = startOfDay(now);
  } else if (range === 'week') {
    from = startOfWeek(now);
  } else if (range === 'year') {
    from = new Date(now.getFullYear(), 0, 1);
  } else if (range === 'custom') {
    const startParam = Array.isArray(searchParams.start) ? searchParams.start[0] : searchParams.start;
    const endParam = Array.isArray(searchParams.end) ? searchParams.end[0] : searchParams.end;
    from = parseDate(startParam, earliestCustomStart);
    to = endOfDay(parseDate(endParam, now));
    if (from < earliestCustomStart) {
      from = earliestCustomStart;
      note = 'Custom query is limited to the latest 2 years.';
    }
    if (from > to) {
      const previousFrom = from;
      from = startOfDay(to);
      to = endOfDay(previousFrom);
    }
  }

  start = dateInputValue(from);
  end = dateInputValue(to);

  return {
    range,
    start,
    end,
    from,
    to,
    summary: `${rangeLabels[range]} · ${start} to ${end}${note ? ` · ${note}` : ''}`
  };
}

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const timeFilter = parseAdminTimeFilter(await searchParams);
  const snapshot = await getCommerceSnapshot({from: timeFilter.from, to: timeFilter.to});

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <span>ZH</span>
          <strong>ZAIHAI Commerce Admin</strong>
        </a>
        <nav>
          <a className="is-active" href="#overview">Overview</a>
          <a href="#orders">Orders</a>
          <a href="#logistics">Logistics</a>
          <a href="#payments">Qianhai Gateway</a>
          <a href="#analytics">Visitor Data</a>
        </nav>
        <div className="admin-sidebar-foot">
          <small>Current account</small>
          <span>{session.email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">Logout</button>
          </form>
        </div>
      </aside>
      <section className="admin-main">
        <div className="admin-title" id="overview">
          <p className="eyebrow">B2B commerce dashboard</p>
          <h1>Orders, Logistics, Payments and Buyer Data</h1>
          <p>Dashboard framework adapted from the cowinmagnet data backend and prepared for ZAIHAI SURFING.</p>
          <AdminTimeFilter range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="Dashboard time range" summary={timeFilter.summary} />
        </div>

        <div className="admin-metrics">
          <article>
            <span>Total orders</span>
            <strong>{snapshot.metrics.orders}</strong>
            <small>Submitted checkout orders</small>
          </article>
          <article>
            <span>Pending payment</span>
            <strong>{snapshot.metrics.pendingPayment}</strong>
            <small>Need card/T/T confirmation</small>
          </article>
          <article>
            <span>Estimated revenue</span>
            <strong>{money(snapshot.metrics.revenue)}</strong>
            <small>Paid/processing/shipped demo logic</small>
          </article>
          <article>
            <span>Visitors captured</span>
            <strong>{snapshot.metrics.visitors}</strong>
            <small>Page/product/checkout events</small>
          </article>
        </div>

        <section className="admin-panel" id="payments">
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

        <section className="admin-panel" id="orders">
          <div>
            <p className="eyebrow">Order statistics</p>
            <h2>Recent Orders</h2>
            <AdminTimeFilter range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="Order time filter" summary={timeFilter.summary} />
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

        <section className="admin-panel" id="logistics">
          <div>
            <p className="eyebrow">Logistics statistics</p>
            <h2>Shipment Tracking</h2>
            <AdminTimeFilter range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="Logistics time filter" summary={timeFilter.summary} />
          </div>
          <div className="admin-grid-list">
            {snapshot.recentOrders.map((order) => (
              <article key={`ship-${order.id}`}>
                <strong>{order.id}</strong>
                <span>{order.logisticsStatus}</span>
                <small>{order.trackingNumber || 'Tracking pending'}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel" id="analytics">
          <div>
            <p className="eyebrow">Buyer data capture</p>
            <h2>Countries and Product Demand</h2>
            <AdminTimeFilter range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="Visitor data time filter" summary={timeFilter.summary} />
          </div>
          <div className="admin-two-col">
            <div className="admin-bar-list">
              {snapshot.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}
            </div>
            <div className="admin-bar-list">
              {snapshot.productDemand.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
