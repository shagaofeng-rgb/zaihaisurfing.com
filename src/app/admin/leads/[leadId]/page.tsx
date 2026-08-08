import {notFound} from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import {formatAdminDate} from '@/lib/adminDataViews';
import {zhLeadStatus} from '@/lib/adminZh';
import {getCustomerLeadDetail} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

function fieldValue(value: string) {
  return value || '-';
}

function eventLabel(type: string) {
  const labels: Record<string, string> = {
    page_view: 'Page visit', product_view: 'Product visit', commerce_click: 'Commercial click',
    checkout_start: 'Checkout started', checkout_submit: 'Checkout submitted', contact_inquiry: 'Form submitted',
    form_submit: 'Form submitted', payment_notice: 'Payment notice', payment_return: 'Payment return'
  };
  return labels[type] || type;
}

export default async function AdminLeadDetailPage({params}: {params: Promise<{leadId: string}>}) {
  const {leadId} = await params;
  const detail = await getCustomerLeadDetail(decodeURIComponent(leadId));
  if (!detail) notFound();
  const {lead, formFields, orders, timeline, visitorIds} = detail;

  return (
    <AdminShell active="leads">
      <div className="admin-title admin-detail-title">
        <div>
          <p className="eyebrow">LEAD PROFILE</p>
          <h1>{lead.name}</h1>
          <p>Customer form data, orders, attribution and browsing activity are read from the real order and analytics records.</p>
        </div>
        <a className="admin-detail-link" href="/admin/leads">Back to leads</a>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div><p className="eyebrow">CUSTOMER</p><h2>Customer profile</h2></div>
          <span className="admin-status published">{zhLeadStatus(lead.status)}</span>
        </div>
        <dl className="admin-detail-list">
          <div><dt>Name</dt><dd>{fieldValue(lead.name)}</dd></div>
          <div><dt>Last active</dt><dd>{formatAdminDate(lead.lastActiveTime)}</dd></div>
          <div><dt>Email</dt><dd>{fieldValue(lead.email)}</dd></div>
          <div><dt>Phone</dt><dd>{fieldValue(lead.phone)}</dd></div>
          <div><dt>Company</dt><dd>{fieldValue(lead.company)}</dd></div>
          <div><dt>Country / region</dt><dd>{fieldValue(lead.country)}</dd></div>
          <div><dt>Interested products</dt><dd>{fieldValue(lead.interestedProducts.join(', '))}</dd></div>
          <div><dt>Cart items</dt><dd>{fieldValue(lead.cartItems.join(', '))}</dd></div>
          <div><dt>Lead source</dt><dd>{fieldValue(lead.source)}</dd></div>
          <div><dt>Traffic source</dt><dd>{fieldValue(lead.trafficSource)}</dd></div>
          <div className="admin-detail-span"><dt>Notes / message</dt><dd>{fieldValue(lead.notes)}</dd></div>
        </dl>
      </section>

      <div className="admin-detail-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">FORM DATA</p><h2>Submitted fields</h2></div></div>
          {formFields.length ? <dl className="admin-detail-list admin-detail-single">
            {formFields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>)}
          </dl> : <p className="admin-empty-copy">This lead came from browsing or checkout activity, with no additional form fields.</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="eyebrow">IDENTIFIERS</p><h2>Linked visits</h2></div></div>
          <dl className="admin-detail-list admin-detail-single">
            <div><dt>Visitor identifiers</dt><dd>{visitorIds.length ? visitorIds.join(', ') : 'Not recorded'}</dd></div>
            <div><dt>Browsing events</dt><dd>{timeline.length}</dd></div>
            <div><dt>Linked orders</dt><dd>{orders.length}</dd></div>
          </dl>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">ORDERS</p><h2>Orders and abandoned checkout records</h2></div></div>
        {orders.length ? <div className="admin-table-wrap"><table><thead><tr><th>Order</th><th>Product</th><th>Total</th><th>Order status</th><th>Payment status</th><th>Created</th></tr></thead><tbody>
          {orders.map((order) => <tr key={order.id}><td><a className="admin-detail-link" href={`/admin/orders/${encodeURIComponent(order.id)}`}>{order.id}</a></td><td>{order.productName} x {order.quantity}</td><td>{order.currency} {order.total.toLocaleString()}</td><td>{order.status}</td><td>{order.gatewayStatus}</td><td>{formatAdminDate(order.createdAt)}</td></tr>)}
        </tbody></table></div> : <p className="admin-empty-copy">No linked order record is available.</p>}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading"><div><p className="eyebrow">JOURNEY</p><h2>Browsing path and acquisition information</h2><p>Events are shown in time order to reconstruct the path from first visit to lead or checkout.</p></div></div>
        {timeline.length ? <ol className="admin-journey-list">
          {timeline.map((event) => <li key={event.id}>
            <div className="admin-journey-time"><strong>{formatAdminDate(event.timestamp)}</strong><span>{eventLabel(event.type)}</span></div>
            <div className="admin-journey-body"><strong>{event.page || '-'}</strong><span>{event.pageTitle || 'Page title not recorded'}</span></div>
            <div className="admin-journey-meta"><span>{event.country || 'Unknown country'}</span><span>{event.device || 'Unknown device'} / {event.browser || 'Unknown browser'}</span><span>{event.referrer || 'Direct'}</span><span>{event.ip || 'IP not recorded'}</span></div>
          </li>)}
        </ol> : <p className="admin-empty-copy">No linked browsing path is available.</p>}
      </section>
    </AdminShell>
  );
}
