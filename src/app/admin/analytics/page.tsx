import AdminShell from '@/components/AdminShell';
import {getAdminDashboardData} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const data = await getAdminDashboardData();
  return (
    <AdminShell active="Analytics">
      <div className="admin-title">
        <p className="eyebrow">Visitor behavior</p>
        <h1>Analytics</h1>
        <p>Asynchronous event tracking for page views, product views, CTA clicks, checkout and payment steps.</p>
      </div>
      <div className="admin-metrics">
        <article><span>UV</span><strong>{data.metrics.visitors}</strong><small>Unique anonymous visitor IDs</small></article>
        <article><span>PV</span><strong>{data.metrics.pageViews}</strong><small>Page view events</small></article>
        <article><span>Product views</span><strong>{data.metrics.productViews}</strong><small>Product detail visits</small></article>
        <article><span>Checkout events</span><strong>{data.metrics.checkoutEvents}</strong><small>Checkout or order signals</small></article>
      </div>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Traffic source and country</p>
          <h2>Demand Distribution</h2>
        </div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{data.trafficSources.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}</div>
          <div className="admin-bar-list">{data.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>)}</div>
        </div>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Recent behavior</p>
          <h2>Event Log</h2>
        </div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Event</th><th>Page</th><th>Device</th><th>Country</th><th>Referrer</th></tr></thead>
            <tbody>
              {data.events.map((event) => (
                <tr key={event.id}>
                  <td>{event.timestamp.slice(0, 19).replace('T', ' ')}</td>
                  <td>{event.type}</td>
                  <td>{event.page}</td>
                  <td>{event.device} / {event.browser}</td>
                  <td>{event.country}</td>
                  <td>{event.referrer || 'Direct'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
