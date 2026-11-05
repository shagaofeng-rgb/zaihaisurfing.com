'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {LockKeyIcon, UserCircleIcon} from '@phosphor-icons/react';
import VisualIcon from '@/components/VisualIcon';

const sections = [
  {href: '/account', label: 'Overview', icon: <UserCircleIcon size={20} />},
  {href: '/account/orders', label: 'Orders', icon: <VisualIcon name="order" size={20} />},
  {href: '/account/profile', label: 'Profile', icon: <UserCircleIcon size={20} />},
  {href: '/account/security', label: 'Security', icon: <LockKeyIcon size={20} />}
];

export default function AccountChrome({children}: {children: React.ReactNode}) {
  const pathname = usePathname();
  const isAuth = /\/(login|register|forgot-password|reset-password)$/.test(pathname);
  if (isAuth) return <div className="customer-design customer-auth">{children}</div>;

  return <div className="customer-design">
    <div className="customer-area">
      <nav className="customer-nav" aria-label="Customer account">
        {sections.map(({href, label, icon}) => {
          const active = pathname === href || (href !== '/account' && pathname.startsWith(href + '/'));
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined}>{icon}{label}</Link>;
        })}
      </nav>
      {children}
    </div>
  </div>;
}
