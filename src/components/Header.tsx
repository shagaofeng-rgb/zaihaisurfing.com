import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

export default async function Header({locale}: {locale: Locale}) {
  const copy = uiCopy[locale];
  const authItems = [
    {href: '/account/login', label: 'Sign in'},
    {href: '/account/register', label: 'Register'}
  ];
  const mobileNavItems = [
    {href: '/', label: copy.nav.home},
    {href: '/products', label: copy.nav.products},
    {href: '/factory#oem-distributor', label: copy.nav.oemDistributor},
    {href: '/news', label: copy.nav.news},
    {href: '/about', label: copy.nav.about},
    {href: '/contact', label: copy.nav.contact},
    ...authItems
  ];

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ZAIHAI SURFING home">
        <img src="/assets/brand-logo.png" alt="" aria-hidden="true" width="960" height="450" decoding="async" />
        <span>ZAIHAI SURFING</span>
      </Link>
      <MobileMenu items={mobileNavItems} />
      <a className="mobile-header-whatsapp" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <Link className="mobile-header-quote" href="/contact">
        {copy.nav.quote}
      </Link>
      <nav className="nav-links">
        <Link href="/" prefetch={false}>{copy.nav.home}</Link>
        <div className="nav-item has-mega">
          <button className="nav-trigger" type="button" aria-haspopup="true">
            {copy.nav.products}
          </button>
          <div className="mega-panel" aria-label="Product mega menu">
            <div className="mega-feature">
              <span>{copy.mega.featured}</span>
              <img src="/assets/catalog/x1-pro/product-mega-thumb.jpg" alt="ZAIHAI X1 Pro electric surfboard" loading="lazy" decoding="async" width="268" height="336" />
              <h3>ZAIHAI X1 Pro</h3>
              <p>{copy.mega.featuredText}</p>
              <Link href="/products/x1-pro" prefetch={false}>{copy.mega.featuredLink}</Link>
            </div>
            <div className="mega-columns">
              <section>
                <p>{copy.mega.electricSurfboards}</p>
                <Link href="/products/x1-pro" prefetch={false}>ZAIHAI X1 Pro</Link>
                <Link href="/products/x1" prefetch={false}>ZAIHAI X1</Link>
                <Link href="/products" prefetch={false}>{copy.mega.allProducts}</Link>
              </section>
              <section>
                <p>{copy.mega.electricWaterKarts}</p>
                <Link href="/products/rage-shark-x" prefetch={false}>Rage Shark X</Link>
                <Link href="/products" prefetch={false}>{copy.mega.accessories}</Link>
                <Link href="/contact">{copy.nav.quote}</Link>
              </section>
              <section>
                <p>{copy.mega.fuelSurfboards}</p>
                <Link href="/products/p1-pro" prefetch={false}>ZAIHAI P1 Pro</Link>
                <Link href="/products/p1" prefetch={false}>ZAIHAI P1</Link>
                <Link href="/products" prefetch={false}>{copy.mega.allProducts}</Link>
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
        <Link href="/factory#oem-distributor" prefetch={false}>{copy.nav.oemDistributor}</Link>
        <Link href="/news" prefetch={false}>{copy.nav.news}</Link>
        <Link href="/about" prefetch={false}>{copy.nav.about}</Link>
        <Link href="/contact" prefetch={false}>{copy.nav.contact}</Link>
      </nav>
      <div className="header-tools">
        <LanguageSwitcher locale={locale} />
        {authItems.map((item) => (
          <a className="header-account" href={item.href} aria-label={item.label} key={item.href}>
            {item.label}
          </a>
        ))}
        <Link className="header-cta" href="/contact" prefetch={false}>
          {copy.nav.quote}
        </Link>
      </div>
    </header>
  );
}
