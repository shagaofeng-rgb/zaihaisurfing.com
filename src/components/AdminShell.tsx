import {requireAdminSession} from '@/lib/adminAuth';

const navItems = [
  ['Dashboard', '/admin'],
  ['Products', '/admin/products'],
  ['Categories', '/admin/categories'],
  ['Media', '/admin/media'],
  ['Blog', '/admin/blog'],
  ['News', '/admin/news'],
  ['Orders', '/admin/orders'],
  ['Customers', '/admin/customers'],
  ['Leads', '/admin/leads'],
  ['Analytics', '/admin/analytics'],
  ['Funnel', '/admin/funnel'],
  ['Settings', '/admin/settings']
] as const;

export default async function AdminShell({active, children}: {active: string; children: React.ReactNode}) {
  const session = await requireAdminSession();
  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <span>ZH</span>
          <strong>ZAIHAI Commerce Admin</strong>
        </a>
        <nav>
          {navItems.map(([label, href]) => (
            <a className={active === label ? 'is-active' : ''} href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <small>Current account</small>
          <span>{session.email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">Logout</button>
          </form>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </main>
  );
}
