import AdminShell from '@/components/AdminShell';
import {buildCustomerLeads} from '@/lib/backendStore';
import {readAnalyticsEvents, readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const customers = buildCustomerLeads(orders, events).filter((lead) => lead.email || lead.phone);
  return (
    <AdminShell active="Customers">
      <div className="admin-title">
        <p className="eyebrow">CRM</p>
        <h1>Customers</h1>
        <p>Customers captured from checkout and inquiry workflows. Sales can follow status and notes here.</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Contact</th><th>Company</th><th>Country</th><th>Products</th><th>Status</th><th>Last active</th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong><br /><small>{customer.source}</small></td>
                  <td>{customer.email}<br /><small>{customer.phone}</small></td>
                  <td>{customer.company || '-'}</td>
                  <td>{customer.country || '-'}</td>
                  <td>{customer.interestedProducts.join(', ')}</td>
                  <td><span className="admin-status published">{customer.status}</span></td>
                  <td>{customer.lastActiveTime.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
