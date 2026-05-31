import {requireAdminSession} from '@/lib/adminAuth';
import {getCommerceSnapshot} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const snapshot = await getCommerceSnapshot();

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
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr><th>Order</th><th>Product</th><th>Country</th><th>Total</th><th>Status</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {snapshot.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
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
