'use client';

import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import type {UiCopy} from '@/lib/uiCopy';

type ProductsMegaMenuProps = {
  copy: UiCopy;
};

export default function ProductsMegaMenu({copy}: ProductsMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function closeSoon() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      if (!panel.current?.contains(document.activeElement)) setOpen(false);
    }, 140);
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <div
      className={`nav-item has-mega${open ? ' is-open' : ''}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        clearCloseTimer();
        setOpen(true);
      }}
      onPointerLeave={closeSoon}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          clearCloseTimer();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        className="nav-trigger"
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="products-mega-menu"
        onClick={(event) => {
          clearCloseTimer();
          if (event.detail > 0 && window.matchMedia('(hover: hover)').matches) setOpen(true);
          else setOpen((current) => !current);
        }}
      >
        {copy.nav.products}
      </button>
      <div ref={panel} className="mega-panel" id="products-mega-menu" aria-hidden={!open} inert={!open}>
        <div className="mega-feature">
          <span>{copy.mega.featured}</span>
          <img src="/assets/catalog/x1-pro/product-mega-thumb.jpg" alt="ZAIHAI X1 Pro electric surfboard" loading="lazy" decoding="async" width="268" height="336" />
          <h3>ZAIHAI X1 Pro</h3>
          <p>{copy.mega.featuredText}</p>
          <Link href="/products/x1-pro" prefetch={false} onClick={() => setOpen(false)}>{copy.mega.featuredLink}</Link>
        </div>
        <div className="mega-columns">
          <section>
            <p>{copy.mega.electricSurfboards}</p>
            <Link href="/products/x1-pro" prefetch={false} onClick={() => setOpen(false)}>ZAIHAI X1 Pro</Link>
            <Link href="/products/x1" prefetch={false} onClick={() => setOpen(false)}>ZAIHAI X1</Link>
            <Link href="/products" prefetch={false} onClick={() => setOpen(false)}>{copy.mega.allProducts}</Link>
          </section>
          <section>
            <p>{copy.mega.electricWaterKarts}</p>
            <Link href="/products/rage-shark-x" prefetch={false} onClick={() => setOpen(false)}>Rage Shark X</Link>
            <Link href="/products" prefetch={false} onClick={() => setOpen(false)}>{copy.mega.accessories}</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>{copy.nav.quote}</Link>
          </section>
          <section>
            <p>{copy.mega.fuelSurfboards}</p>
            <Link href="/products/p1-pro" prefetch={false} onClick={() => setOpen(false)}>ZAIHAI P1 Pro</Link>
            <Link href="/products/p1" prefetch={false} onClick={() => setOpen(false)}>ZAIHAI P1</Link>
            <Link href="/products" prefetch={false} onClick={() => setOpen(false)}>{copy.mega.allProducts}</Link>
          </section>
          <section>
            <p>{copy.mega.supportTitle}</p>
            <Link href="/factory" onClick={() => setOpen(false)}>{copy.mega.oem}</Link>
            <Link href="/factory" onClick={() => setOpen(false)}>{copy.mega.shipping}</Link>
            <Link href="/applications" onClick={() => setOpen(false)}>{copy.mega.rental}</Link>
            <Link href="/contact" onClick={() => setOpen(false)}>{copy.mega.distributor}</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
