import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({locale}: {locale: Locale}) {
  const copy = uiCopy[locale];

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src="/assets/logo.jpg" alt="ZAIHAI SURFING" />
        <span>ZAIHAI SURFING</span>
      </Link>
      <nav className="nav-links">
        <Link href="/">{copy.nav.home}</Link>
        <div className="nav-item has-mega">
          <button className="nav-trigger" type="button" aria-haspopup="true">
            {copy.nav.products}
          </button>
          <div className="mega-panel" role="menu" aria-label="Product mega menu">
            <div className="mega-feature">
              <span>{copy.mega.featured}</span>
              <img src="/assets/catalog/x1-pro/product.png" alt="ZAIHAI X1 Pro electric surfboard" />
              <h3>ZAIHAI X1 Pro</h3>
              <p>{copy.mega.featuredText}</p>
              <Link href="/products/x1-pro">{copy.mega.featuredLink}</Link>
            </div>
            <div className="mega-columns">
              <section>
                <p>{copy.mega.electricSurfboards}</p>
                <Link href="/products/x1-pro">ZAIHAI X1 Pro</Link>
                <Link href="/products/x1">ZAIHAI X1</Link>
                <Link href="/products">{copy.mega.allProducts}</Link>
              </section>
              <section>
                <p>{copy.mega.electricWaterKarts}</p>
                <Link href="/products/rage-shark-x">Rage Shark X</Link>
                <Link href="/products">{copy.mega.accessories}</Link>
                <Link href="/contact">{copy.nav.quote}</Link>
              </section>
              <section>
                <p>{copy.mega.fuelSurfboards}</p>
                <Link href="/products/p1-pro">ZAIHAI P1 Pro</Link>
                <Link href="/products/p1">ZAIHAI P1</Link>
                <Link href="/products">{copy.mega.allProducts}</Link>
              </section>
              <section>
                <p>{copy.mega.supportTitle}</p>
                <Link href="/factory">{copy.mega.oem}</Link>
                <Link href="/factory">{copy.mega.shipping}</Link>
                <Link href="/applications">{copy.mega.rental}</Link>
                <Link href="/contact">{copy.mega.distributor}</Link>
              </section>
            </div>
          </div>
        </div>
        <Link href="/applications">{copy.nav.applications}</Link>
        <Link href="/factory">{copy.nav.support}</Link>
        <Link href="/blog">{copy.nav.news}</Link>
        <Link href="/about">{copy.nav.about}</Link>
        <Link href="/contact">{copy.nav.contact}</Link>
      </nav>
      <div className="header-tools">
        <LanguageSwitcher locale={locale} />
        <Link className="header-cta" href="/contact">
          {copy.nav.quote}
        </Link>
      </div>
    </header>
  );
}
