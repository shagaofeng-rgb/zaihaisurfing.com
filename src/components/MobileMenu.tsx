'use client';

import {useState} from 'react';
import {Link} from '@/i18n/navigation';

type MobileMenuProps = {
  items: {
    href: string;
    label: string;
  }[];
};

export default function MobileMenu({items}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <details className="mobile-menu" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>Menu</summary>
      <div>
        {items.map((item) => (
          item.href.startsWith('/account') ? (
            <a href={item.href} key={`${item.href}-${item.label}`} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ) : (
            <Link href={item.href} key={`${item.href}-${item.label}`} onClick={() => setOpen(false)} prefetch={false}>
              {item.label}
            </Link>
          )
        ))}
      </div>
    </details>
  );
}
