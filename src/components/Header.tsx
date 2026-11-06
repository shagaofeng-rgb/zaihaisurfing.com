import {ArrowRightIcon, WhatsappLogoIcon} from '@phosphor-icons/react/dist/ssr';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import {uiCopy} from '@/lib/uiCopy';
import HomeHeaderMenu from './HomeHeaderMenu';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import ProductsMegaMenu from './ProductsMegaMenu';

export default async function Header({locale}: {locale: Locale}) {
  const copy = uiCopy[locale];
  const home = await getTranslations({locale, namespace: 'homeOperations'});
  const authItems = [
    {href: '/account/login', label: 'Sign in'},
    {href: '/account/register', label: 'Register'}
  ];
  const editorialItems = [
    {href: '/news', label: copy.nav.news},
    {href: '/blog', label: copy.nav.blog}
  ];
  const applications = {href: '/applications', label: copy.nav.applications};
  const contact = {href: '/contact', label: copy.nav.contact};
  const mobileNavItems = [
    {href: '/', label: copy.nav.home},
    {href: '/products', label: copy.nav.products},
    applications,
    {href: '/factory#oem-distributor', label: copy.nav.oemDistributor},
    ...editorialItems,
    {href: '/about', label: copy.nav.about},
    contact,
    ...authItems
  ];

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="ZAIHAI SURFING home">
        <img src="/assets/home-fast-v1/brand.webp" alt="" aria-hidden="true" width="960" height="450" decoding="async" />
        <span>ZAIHAI SURFING</span>
      </Link>
      <nav className="nav-links">
        <Link className="operations-secondary" href="/" prefetch={false}>{copy.nav.home}</Link>
        <ProductsMegaMenu copy={copy} />
        <HomeHeaderMenu label={copy.nav.applications} items={[
          applications,
          {href: '/applications#resorts-hotels', label: home('resorts')},
          {href: '/applications#rental-businesses', label: home('rentals')},
          {href: '/applications#distributors', label: home('distributors')}
        ]} />
        <Link href="/factory#oem-distributor" prefetch={false}>{copy.nav.oemDistributor}</Link>
        {editorialItems.map((item) => (
          <Link className="operations-secondary" href={item.href} key={item.href} prefetch={false}>{item.label}</Link>
        ))}
        <Link href="/about" prefetch={false}>{copy.nav.about}</Link>
        <Link className="operations-secondary" href="/contact" prefetch={false}>{copy.nav.contact}</Link>
        <HomeHeaderMenu compact label={home('moreNavigation')} items={[...editorialItems, contact, ...authItems]} />
      </nav>
      <div className="header-tools">
        <LanguageSwitcher locale={locale} />
        {authItems.map((item) => (
          <a className="header-account" href={item.href} aria-label={item.label} key={item.href}>
            {item.label}
          </a>
        ))}
        <Link className="header-cta" href="/contact" prefetch={false}>
          <span className="operations-secondary">{copy.nav.quote}</span>
          <span className="operations-only">{home('quoteButton')}</span>
          <ArrowRightIcon className="operations-only" size={15} aria-hidden="true" />
        </Link>
      </div>
      <a className="mobile-header-whatsapp" aria-label="WhatsApp" data-whatsapp-placement="mobile_header" href="https://api.whatsapp.com/send/?phone=8617621485205&text&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer">
        <span>WhatsApp</span><WhatsappLogoIcon size={20} aria-hidden="true" />
      </a>
      <Link className="mobile-header-quote" href="/contact">
        <span className="operations-secondary">{copy.nav.quote}</span>
        <span className="operations-only">{home('quoteButton')}</span>
      </Link>
      <MobileMenu items={mobileNavItems} />
    </header>
  );
}
