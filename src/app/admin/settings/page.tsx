import AdminShell from '@/components/AdminShell';
import {readAdminStore} from '@/lib/backendStore';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage({searchParams}: {searchParams: Promise<{saved?: string}>}) {
  const {saved} = await searchParams;
  const {settings} = await readAdminStore();
  return (
    <AdminShell active="系统设置">
      <div className="admin-title">
        <p className="eyebrow">系统配置</p>
        <h1>系统设置</h1>
        <p>管理企业资料、联系方式与通知配置。</p>
        {saved === '1' ? <p className="admin-save-success" role="status">设置已保存。</p> : null}
      </div>
      <section className="admin-panel">
        <form className="admin-form-grid" action="/api/admin/settings" method="post">
          <label>公司名称<input name="companyName" defaultValue={settings.companyName} placeholder="公司名称" /></label>
          <label>公开联系邮箱<input name="contactEmail" type="email" defaultValue={settings.contactEmail} placeholder="联系邮箱" /></label>
          <label>客户表单与订单通知邮箱<input name="adminNotificationEmail" type="email" defaultValue={settings.adminNotificationEmail} placeholder="通知邮箱" required /></label>
          <label>WhatsApp 联系电话<input name="whatsapp" defaultValue={settings.whatsapp} placeholder="WhatsApp" /></label>
          <label className="admin-settings-address">公司地址<textarea name="address" defaultValue={settings.address} placeholder="公司地址" /></label>
          <label>支付币种<input name="paymentCurrency" defaultValue={settings.paymentCurrency} placeholder="支付币种" /></label>
          <button type="submit">保存设置</button>
        </form>
      </section>
      <section className="admin-panel">
        <div>
          <p className="eyebrow">已保存资料</p>
          <h2>当前配置摘要</h2>
        </div>
        <dl className="admin-config-list">
          <div><dt>联系邮箱</dt><dd>{settings.contactEmail || '未设置'}</dd></div>
          <div><dt>后台通知邮箱</dt><dd>{settings.adminNotificationEmail || '未设置'}</dd></div>
          <div><dt>WhatsApp</dt><dd>{settings.whatsapp || '未设置'}</dd></div>
          <div><dt>支付币种</dt><dd>{settings.paymentCurrency || '未设置'}</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
