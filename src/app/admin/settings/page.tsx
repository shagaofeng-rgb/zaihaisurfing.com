import AdminShell from '@/components/AdminShell';
import {readAdminStore} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const {settings} = await readAdminStore();
  return (
    <AdminShell active="Settings">
      <div className="admin-title">
        <p className="eyebrow">System settings</p>
        <h1>Settings</h1>
        <p>Manage company information, email notifications, payment credentials and privacy readiness.</p>
      </div>
      <section className="admin-panel">
        <form className="admin-form-grid" action="/api/admin/settings" method="post">
          <input name="companyName" defaultValue={settings.companyName} placeholder="Company name" />
          <input name="contactEmail" defaultValue={settings.contactEmail} placeholder="Contact email" />
          <input name="adminNotificationEmail" defaultValue={settings.adminNotificationEmail} placeholder="Admin notification email" />
          <input name="whatsapp" defaultValue={settings.whatsapp} placeholder="WhatsApp" />
          <textarea name="address" defaultValue={settings.address} placeholder="Company address" />
          <input name="paymentCurrency" defaultValue={settings.paymentCurrency} placeholder="Payment currency" />
          <button type="submit">Save Settings</button>
        </form>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">Environment checklist</p>
          <h2>Required Production Secrets</h2>
        </div>
        <dl className="admin-config-list">
          <div><dt>Admin auth</dt><dd>ADMIN_EMAIL, ADMIN_PASSWORD_HASH or ADMIN_PASSWORD, ADMIN_JWT_SECRET</dd></div>
          <div><dt>Database</dt><dd>DATABASE_URL is reserved for Postgres migration.</dd></div>
          <div><dt>Email</dt><dd>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM</dd></div>
          <div><dt>Payment</dt><dd>QIANHAI_MERCHANT_ID, QIANHAI_GATEWAY_URL, QIANHAI_SECRET_KEY</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
