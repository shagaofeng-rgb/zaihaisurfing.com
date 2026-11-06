'use client';

import {ListIcon} from '@phosphor-icons/react';
import {useRef} from 'react';
import {Link} from '@/i18n/navigation';
import {useDismissDisclosure} from './useDismissDisclosure';

type MobileMenuProps = {
  items: {
    href: string;
    label: string;
    className?: string;
  }[];
};

export default function MobileMenu({items}: MobileMenuProps) {
  const menu = useRef<HTMLDetailsElement>(null);
  useDismissDisclosure(menu);

  function closeMenu() {
    if (menu.current) menu.current.open = false;
  }

  return (
    <details className="mobile-menu" ref={menu}>
      <summary aria-label="Menu"><ListIcon className="mobile-menu-symbol" size={24} aria-hidden="true" /><span>Menu</span></summary>
      <div>
        {items.map((item) => (
          item.href.startsWith('/account') ? (
            <a href={item.href} key={`${item.href}-${item.label}`} onClick={closeMenu}>
              {item.label}
            </a>
          ) : (
            <Link className={item.className} href={item.href} key={`${item.href}-${item.label}`} onClick={closeMenu} prefetch={false}>
              {item.label}
            </Link>
          )
        ))}
      </div>
    </details>
  );
}
