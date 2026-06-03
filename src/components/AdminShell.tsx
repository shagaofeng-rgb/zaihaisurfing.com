import {requireAdminSession} from '@/lib/adminAuth';

const navItems = [
  ['数据总览', '/admin'],
  ['产品管理', '/admin/products'],
  ['分类管理', '/admin/categories'],
  ['媒体库', '/admin/media'],
  ['博客管理', '/admin/blog'],
  ['新闻管理', '/admin/news'],
  ['订单管理', '/admin/orders'],
  ['客户管理', '/admin/customers'],
  ['线索/弃单', '/admin/leads'],
  ['访问统计', '/admin/analytics'],
  ['转化漏斗', '/admin/funnel'],
  ['系统设置', '/admin/settings']
] as const;

export default async function AdminShell({active, children}: {active: string; children: React.ReactNode}) {
  const session = await requireAdminSession();
  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <span>ZH</span>
          <strong>在海后台管理</strong>
        </a>
        <nav>
          {navItems.map(([label, href]) => (
            <a className={active === label ? 'is-active' : ''} href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <small>当前账号</small>
          <span>{session.email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">退出登录</button>
          </form>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
