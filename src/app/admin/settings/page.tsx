import AdminShell from '@/components/AdminShell';
import {readAdminStore} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const {settings} = await readAdminStore();
  return (
    <AdminShell active="系统设置">
      <div className="admin-title">
        <p className="eyebrow">系统配置</p>
        <h1>系统设置</h1>
        <p>管理公司信息、邮箱通知、支付接口和隐私合规准备状态。</p>
      </div>
      <section className="admin-panel">
        <form className="admin-form-grid" action="/api/admin/settings" method="post">
          <input name="companyName" defaultValue={settings.companyName} placeholder="公司名称" />
          <input name="contactEmail" defaultValue={settings.contactEmail} placeholder="联系邮箱" />
          <input name="adminNotificationEmail" defaultValue={settings.adminNotificationEmail} placeholder="管理员通知邮箱" />
          <input name="whatsapp" defaultValue={settings.whatsapp} placeholder="WhatsApp" />
          <textarea name="address" defaultValue={settings.address} placeholder="公司地址" />
          <input name="paymentCurrency" defaultValue={settings.paymentCurrency} placeholder="支付币种" />
          <button type="submit">保存设置</button>
        </form>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">环境变量检查</p>
          <h2>生产环境必须配置</h2>
        </div>
        <dl className="admin-config-list">
          <div><dt>后台登录</dt><dd>ADMIN_EMAIL, ADMIN_PASSWORD_HASH 或 ADMIN_PASSWORD, ADMIN_JWT_SECRET</dd></div>
          <div><dt>数据库</dt><dd>DATABASE_URL 后续用于迁移到 Postgres，避免 Vercel 临时文件存储丢失。</dd></div>
          <div><dt>邮件</dt><dd>SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM</dd></div>
          <div><dt>支付</dt><dd>QIANHAI_MERCHANT_ID, QIANHAI_GATEWAY_URL, QIANHAI_SECRET_KEY</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
