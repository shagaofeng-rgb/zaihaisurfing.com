'use client';

import {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import AdminIcon, {type AdminIconName} from '@/components/AdminIcon';
import AdminRealtimeSync from '@/components/AdminRealtimeSync';

type NavItem = {label: string; href: string};
type NavGroup = {label: string; icon: AdminIconName; items: NavItem[]};

const groups: NavGroup[] = [
  {label: '工作台', icon: 'dashboard', items: [{label: '经营工作台', href: '/admin'}]},
  {label: '订单', icon: 'orders', items: [
    {label: '订单管理', href: '/admin/orders'},
    {label: '支付与退款', href: '/admin/payments'},
    {label: '发货与物流', href: '/admin/fulfillment'},
    {label: '退换货', href: '/admin/returns'}
  ]},
  {label: '商品', icon: 'products', items: [
    {label: '商品管理', href: '/admin/products'},
    {label: '商品分类', href: '/admin/categories'},
    {label: '库存记录', href: '/admin/inventory'},
    {label: '优惠与促销', href: '/admin/promotions'},
    {label: '商品评价', href: '/admin/reviews'}
  ]},
  {label: '客户', icon: 'customers', items: [
    {label: '客户档案', href: '/admin/customers'},
    {label: '表单与意向信号', href: '/admin/leads'},
    {label: '访客路径', href: '/admin/visitors'},
    {label: '购物车与弃购', href: '/admin/carts'}
  ]},
  {label: '内容', icon: 'content', items: [
    {label: '新闻管理', href: '/admin/news'},
    {label: '博客管理', href: '/admin/blog'},
    {label: '媒体库', href: '/admin/media'},
    {label: 'Facebook 发布', href: '/admin/facebook'},
    {label: '新闻任务记录', href: '/admin/news-autopilot'}
  ]},
  {label: '增长分析', icon: 'analytics', items: [
    {label: '访问分析', href: '/admin/analytics'},
    {label: '来源归因', href: '/admin/analytics/acquisition'},
    {label: 'WhatsApp 点击', href: '/admin/analytics/whatsapp'},
    {label: '转化漏斗', href: '/admin/funnel'},
    {label: 'SEO 数据', href: '/admin/seo'}
  ]},
  {label: '系统', icon: 'system', items: [
    {label: '运营状态', href: '/admin/sync'},
    {label: '账号安全', href: '/admin/users'},
    {label: '操作日志', href: '/admin/audit'},
    {label: '系统设置', href: '/admin/settings'}
  ]}
];

function activeNavItem(pathname: string) {
  return groups.flatMap((group) => group.items.map((item) => ({...item, group: group.label})))
    .filter((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function groupForPath(pathname: string) {
  return activeNavItem(pathname)?.group || '工作台';
}

export default function AdminFrame({email, children}: {email: string; children: React.ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref = activeNavItem(pathname)?.href;
  const [expanded, setExpanded] = useState(() => groupForPath(pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => { setExpanded(groupForPath(pathname)); }, [pathname]);
  const matches = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('zh-CN');
    if (!term) return [];
    return groups.flatMap((group) => group.items.map((item) => ({...item, group: group.label})))
      .filter((item) => `${item.group} ${item.label}`.toLocaleLowerCase('zh-CN').includes(term))
      .slice(0, 6);
  }, [query]);

  function navigateTo(href: string) {
    setQuery('');
    setMobileOpen(false);
    setExpanded(groupForPath(href));
    router.push(href);
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar">
        <button className="admin-mobile-toggle" type="button" aria-label={mobileOpen ? '关闭后台菜单' : '打开后台菜单'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>
          <AdminIcon name="menu" size={24} />
        </button>
        <Link className="admin-brand" href="/admin" onClick={() => setMobileOpen(false)}>
          <span className="admin-brand-image"><Image src="/assets/brand-logo.png" alt="ZAIHAI 在海" width={80} height={40} priority /></span>
          <strong>在海零售后台</strong>
          <span className="admin-brand-english">ZAIHAI SURFING</span>
        </Link>
        <form className="admin-global-search" role="search" onBlur={(event) => {if (!event.currentTarget.contains(event.relatedTarget)) setQuery('');}} onSubmit={(event) => {event.preventDefault(); if (matches[0]) navigateTo(matches[0].href);}}>
          <AdminIcon name="search" size={18} />
          <input aria-label="搜索后台栏目" placeholder="搜索栏目..." value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {if (event.key === 'Escape') {setQuery(''); event.currentTarget.blur();}}} />
          {query ? <button type="button" aria-label="清除搜索" onClick={() => setQuery('')}>×</button> : null}
          {query ? <div className="admin-search-results" role="listbox" aria-label="后台栏目搜索结果">
            {matches.length ? matches.map((item) => <button key={item.href} type="button" role="option" aria-selected="false" onClick={() => navigateTo(item.href)}><span>{item.label}</span><small>{item.group}</small></button>) : <p>未找到匹配的栏目</p>}
          </div> : null}
        </form>
        <AdminRealtimeSync />
        <div className="admin-account" title={email}>
          <span className="admin-account-avatar">{email.slice(0, 1).toUpperCase()}</span>
          <span className="admin-account-copy"><strong>{email.split('@')[0]}</strong><small>管理员</small></span>
        </div>
      </header>
      <aside className={`admin-sidebar${mobileOpen ? ' is-open' : ''}`} aria-label="后台主导航">
        <nav>
          {groups.map((group) => {
            const current = groupForPath(pathname) === group.label;
            const open = expanded === group.label;
            return <div className={`admin-nav-group${current ? ' is-current' : ''}`} key={group.label}>
              <button className="admin-nav-group-button" type="button" aria-expanded={open} onClick={() => setExpanded(open ? '' : group.label)}>
                <AdminIcon name={group.icon} size={21} />
                <span>{group.label}</span>
                {group.items.length > 1 ? <AdminIcon name="chevron" size={15} className="admin-nav-chevron" /> : null}
              </button>
              {open ? <div className="admin-nav-children">
                {group.items.map((item) => {
                  const active = activeHref === item.href;
                  return <Link className={active ? 'is-active' : ''} href={item.href} key={item.href} aria-current={active ? 'page' : undefined} onClick={() => setMobileOpen(false)}>{item.label}</Link>;
                })}
              </div> : null}
            </div>;
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <span>当前账号</span><strong>{email}</strong>
          <form action="/api/admin/logout" method="post"><button type="submit"><AdminIcon name="signout" size={17} />退出登录</button></form>
        </div>
      </aside>
      {mobileOpen ? <button className="admin-sidebar-backdrop" type="button" aria-label="关闭后台菜单" onClick={() => setMobileOpen(false)} /> : null}
      <section className="admin-main">{children}</section>
    </main>
  );
}
