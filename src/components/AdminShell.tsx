import {requireAdminSession} from '@/lib/adminAuth';
import AdminRealtimeSync from '@/components/AdminRealtimeSync';

const navSections = [
  {
    title: '经营',
    items: [
      {key: 'dashboard', label: '数据概览', href: '/admin'},
      {key: 'orders', label: '订单管理', href: '/admin/orders'},
      {key: 'payments', label: '支付与退款', href: '/admin/payments'},
      {key: 'fulfillment', label: '发货与物流', href: '/admin/fulfillment'},
      {key: 'returns', label: '退换货管理', href: '/admin/returns'}
    ]
  },
  {
    title: '商品',
    items: [
      {key: 'products', label: '商品管理', href: '/admin/products'},
      {key: 'categories', label: '商品分类', href: '/admin/categories'},
      {key: 'inventory', label: '库存管理', href: '/admin/inventory'},
      {key: 'promotions', label: '优惠与促销', href: '/admin/promotions'},
      {key: 'reviews', label: '评价管理', href: '/admin/reviews'}
    ]
  },
  {
    title: '客户与内容',
    items: [
      {key: 'customers', label: '客户管理', href: '/admin/customers'},
      {key: 'leads', label: '客户表单', href: '/admin/leads'},
      {key: 'carts', label: '购物车与弃购', href: '/admin/carts'},
      {key: 'news', label: '新闻管理', href: '/admin/news'},
      {key: 'blog', label: '博客管理', href: '/admin/blog'},
      {key: 'media', label: '媒体库', href: '/admin/media'}
    ]
  },
  {
    title: '数据与系统',
    items: [
      {key: 'analytics', label: '访问分析', href: '/admin/analytics'},
      {key: 'acquisition', label: '来源归因', href: '/admin/analytics/acquisition'},
      {key: 'funnel', label: '转化漏斗', href: '/admin/funnel'},
      {key: 'seo', label: 'SEO 数据', href: '/admin/seo'},
      {key: 'sync', label: '数据同步', href: '/admin/sync'},
      {key: 'users', label: '用户与权限', href: '/admin/users'},
      {key: 'audit', label: '操作日志', href: '/admin/audit'},
      {key: 'settings', label: '系统设置', href: '/admin/settings'}
    ]
  }
] as const;

export default async function AdminShell({active, children}: {active: string; children: React.ReactNode}) {
  const session = await requireAdminSession();
  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <span>ZH</span>
          <strong>在海零售后台</strong>
        </a>
        <nav aria-label="后台主导航">
          {navSections.map((section) => (
            <div className="admin-nav-section" key={section.title}>
              <small>{section.title}</small>
              {section.items.map((item) => (
                <a className={active === item.key || active === item.label || active === item.href ? 'is-active' : ''} href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
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
      <section className="admin-main">
        <AdminRealtimeSync />
        {children}
      </section>
    </main>
  );
}
