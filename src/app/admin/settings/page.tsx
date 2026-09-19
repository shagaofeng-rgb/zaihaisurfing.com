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
          <p className="eyebrow">服务状态</p>
          <h2>业务服务运行状态</h2>
        </div>
        <dl className="admin-config-list">
          <div><dt>后台访问</dt><dd>账号访问保护已启用。</dd></div>
          <div><dt>订单与客户</dt><dd>业务记录已接入长期保存与查询服务。</dd></div>
          <div><dt>邮件通知</dt><dd>客户表单将同步通知至 info@zaihaisurfing.com。</dd></div>
          <div><dt>在线支付</dt><dd>支付服务状态由财务与运营流程统一跟进。</dd></div>
        </dl>
      </section>
    </AdminShell>
  );
}
