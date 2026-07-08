import AdminShell from '@/components/AdminShell';

export const dynamic = 'force-dynamic';

const roles = [
  ['超级管理员', '拥有全部后台、支付、退款、系统设置和用户权限管理能力'],
  ['管理员', '管理订单、客户、商品、内容和数据分析'],
  ['商品运营', '维护商品、分类、库存和促销'],
  ['内容编辑', '维护新闻、博客、媒体库和 SEO 内容'],
  ['客服人员', '查看订单、客户表单、物流和售后'],
  ['仓库人员', '查看待发货订单并更新物流'],
  ['财务人员', '查看支付、退款、订单金额和邮件日志'],
  ['市场人员', '查看来源归因、访客、促销和转化漏斗'],
  ['数据分析', '查看只读数据报表和 SEO 数据'],
  ['只读用户', '只读访问，无写入权限']
];

export default async function AdminUsersPage() {
  const adminEmail = process.env.ADMIN_EMAIL || 'davidsha@zaihaisurfing.com';
  const hasHash = Boolean(process.env.ADMIN_PASSWORD_HASH);
  const hasSecret = Boolean(process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET);

  return (
    <AdminShell active="users">
      <div className="admin-title">
        <p className="eyebrow">用户与权限</p>
        <h1>后台账号安全与角色模型</h1>
        <p>当前项目使用服务端 Cookie 会话和环境变量管理员账号。权限模型先以角色清单落地，后续可接入多账号数据表。</p>
      </div>
      <div className="admin-metrics">
        <article><span>管理员账号</span><strong>1</strong><small>{adminEmail}</small></article>
        <article><span>密码哈希</span><strong>{hasHash ? '已启用' : '待升级'}</strong><small>建议生产环境使用 ADMIN_PASSWORD_HASH</small></article>
        <article><span>会话密钥</span><strong>{hasSecret ? '已配置' : '待配置'}</strong><small>ADMIN_JWT_SECRET / SESSION_SECRET</small></article>
        <article><span>会话周期</span><strong>7 天</strong><small>服务端签名 Cookie</small></article>
      </div>
      <section className="admin-panel">
        <h2>建议角色与权限边界</h2>
        <div className="admin-grid-list">
          {roles.map(([role, desc]) => <article key={role}><strong>{role}</strong><small>{desc}</small></article>)}
        </div>
      </section>
    </AdminShell>
  );
}
