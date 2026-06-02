import AdminShell from '@/components/AdminShell';
import {getAdminDashboardData} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminFunnelPage() {
  const data = await getAdminDashboardData();
  return (
    <AdminShell active="Funnel">
      <div className="admin-title">
        <p className="eyebrow">Conversion analytics</p>
        <h1>Funnel</h1>
        <p>Understand where buyers drop from visit, product view, checkout, order and payment.</p>
      </div>
      <section className="admin-panel">
        <div className="admin-funnel">
          {data.funnel.map((step, index) => (
            <article key={step.label} style={{width: `${Math.max(32, 100 - index * 10)}%`}}>
              <strong>{step.label}</strong>
              <span>{step.value.toLocaleString()}</span>
              <small>{step.conversion}% conversion from previous step</small>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
