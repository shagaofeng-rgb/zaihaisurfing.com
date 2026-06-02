import AdminShell from '@/components/AdminShell';
import {buildCustomerLeads} from '@/lib/backendStore';
import {readAnalyticsEvents, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const leads = buildCustomerLeads(orders, events);
  return (
    <AdminShell active="Leads">
      <div className="admin-title">
        <p className="eyebrow">Abandoned checkout and sales leads</p>
        <h1>Leads</h1>
        <p>Track checkout-started, contact-captured, order-created and payment-pending buyer signals.</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Lead</th><th>Status</th><th>Interested products</th><th>Source page</th><th>Traffic source</th><th>Notes</th><th>Last active</th></tr></thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td><strong>{lead.name}</strong><br /><small>{lead.email || lead.id}</small></td>
                  <td><span className="admin-status draft">{lead.status}</span></td>
                  <td>{lead.interestedProducts.join(', ')}</td>
                  <td>{lead.source}</td>
                  <td>{lead.trafficSource}</td>
                  <td>{lead.notes}</td>
                  <td>{lead.lastActiveTime.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
