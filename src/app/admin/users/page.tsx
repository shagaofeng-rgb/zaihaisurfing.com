import AdminShell from '@/components/AdminShell';
import {requireAdminSession} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await requireAdminSession();
  const adminEmail = process.env.ADMIN_EMAIL || session.email || '未配置';
  const hasHash = Boolean(process.env.ADMIN_PASSWORD_HASH);
  const hasSecret = Boolean(process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET);

  return (
    <AdminShell active="users">
      <div className="admin-title">
        <p className="eyebrow">系统</p>
        <h1>账号安全</h1>
        <p>查看当前后台账号与登录保护状态。</p>
      </div>
      <div className="admin-metrics">
        <article><span>当前账号</span><strong>1</strong><small>{adminEmail}</small></article>
        <article><span>密码保护</span><strong>{hasHash ? '已启用' : '需检查'}</strong><small>登录凭据状态</small></article>
        <article><span>会话保护</span><strong>{hasSecret ? '已启用' : '需检查'}</strong><small>服务端登录校验</small></article>
      </div>
      <section className="admin-panel">
        <h2>管理员账号</h2>
        <div className="admin-table-wrap"><table><thead><tr><th>邮箱</th><th>访问权限</th><th>登录方式</th></tr></thead><tbody>
          <tr><td>{adminEmail}</td><td>后台管理员</td><td>账号密码</td></tr>
        </tbody></table></div>
      </section>
    </AdminShell>
  );
}
