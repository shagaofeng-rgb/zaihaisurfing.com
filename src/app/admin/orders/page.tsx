import AdminShell from '@/components/AdminShell';
import {readStoreOrders} from '@/lib/commerceStore';

export const dynamic = 'force-dynamic';

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

export default async function AdminOrdersPage() {
  const orders = (await readStoreOrders()).slice().reverse();
  return (
    <AdminShell active="Orders">
      <div className="admin-title">
        <p className="eyebrow">Order management</p>
        <h1>Orders</h1>
        <p>Track order status, payment status, shipment workflow and buyer notes.</p>
      </div>
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Payment</th><th>Shipping</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong><br /><small>{order.status}</small></td>
                  <td>{order.customer.name}<br /><small>{order.customer.email} | {order.customer.country}</small></td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{money(order.total)}</td>
                  <td>{order.paymentMethod}<br /><small>{order.gatewayStatus}</small></td>
                  <td>{order.logisticsStatus}<br /><small>{order.trackingNumber || 'Tracking pending'}</small></td>
                  <td>{order.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
