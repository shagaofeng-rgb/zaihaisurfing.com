import AdminShell from '@/components/AdminShell';
import {getAdminDashboardData} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminFunnelPage() {
  const data = await getAdminDashboardData();
  return (
    <AdminShell active="转化漏斗">
      <div className="admin-title">
        <p className="eyebrow">转化分析</p>
        <h1>转化漏斗</h1>
        <p>查看客户从访问、产品浏览、进入结账、创建订单到支付的真实流失情况。</p>
      </div>
      <section className="admin-panel">
        <div className="admin-funnel">
          {data.funnel.map((step, index) => (
            <article key={step.label} style={{width: `${Math.max(32, 100 - index * 10)}%`}}>
              <strong>{step.label}</strong>
              <span>{step.value.toLocaleString()}</span>
              <small>相对上一步转化率 {step.conversion}%</small>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
