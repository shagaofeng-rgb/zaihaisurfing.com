import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({locale}: {locale: Locale}) {
  const nav = await getTranslations({locale, namespace: 'nav'});
  const common = await getTranslations({locale, namespace: 'common'});

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src="/assets/logo.jpg" alt={common('brand')} />
        <span>{common('brand')}</span>
      </Link>
      <nav className="nav-links">
        <div className="nav-item has-mega">
          <button className="nav-trigger" type="button" aria-haspopup="true">
            {nav('products')}
          </button>
          <div className="mega-panel" role="menu" aria-label="Product mega menu">
            <div className="mega-feature">
              <span>Featured model</span>
              <img src="/assets/catalog/x1-pro/product.png" alt="ZAIHAI X1 Pro electric surfboard" />
              <h3>ZAIHAI X1 Pro</h3>
              <p>12 kW electric surfboard for premium riding, resort demos and high-impact videos.</p>
              <Link href="/products/x1-pro">View X1 Pro details</Link>
            </div>
            <div className="mega-columns">
              <section>
                <p>Electric Surfboards</p>
                <Link href="/products/x1-pro">ZAIHAI X1 Pro</Link>
                <Link href="/products/x1">ZAIHAI X1</Link>
                <Link href="/products">All electric surfboards</Link>
              </section>
              <section>
                <p>Electric Water Karts</p>
                <Link href="/products/rage-shark-x">Rage Shark X</Link>
                <Link href="/products">All water karts</Link>
                <Link href="/contact">Project quote</Link>
              </section>
              <section>
                <p>Fuel-Powered Surfboards</p>
                <Link href="/products/p1-pro">ZAIHAI P1 Pro</Link>
                <Link href="/products/p1">ZAIHAI P1</Link>
                <Link href="/products">All fuel boards</Link>
              </section>
              <section>
                <p>Business Pages</p>
                <Link href="/factory">OEM/ODM customization</Link>
                <Link href="/about">Brand story</Link>
                <Link href="/applications">Global markets</Link>
                <Link href="/contact">Distributor inquiry</Link>
              </section>
            </div>
          </div>
        </div>
        <Link href="/products">Catalog</Link>
        <Link href="/applications">Markets</Link>
        <Link href="/applications">Solutions</Link>
        <Link href="/factory">OEM/ODM</Link>
        <Link href="/blog">News</Link>
        <Link href="/contact">Quote</Link>
        <Link href="/contact">{nav('contact')}</Link>
      </nav>
      <div className="header-tools">
        <LanguageSwitcher locale={locale} />
        <Link className="header-cta" href="/contact">
          {nav('quote')}
        </Link>
      </div>
    </header>
  );
}
