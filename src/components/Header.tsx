import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header({locale}: {locale: Locale}) {
  const nav = await getTranslations({locale, namespace: 'nav'});
  const common = await getTranslations({locale, namespace: 'common'});

  const links = [
    ['products', '/products'],
    ['applications', '/applications'],
    ['about', '/about'],
    ['factory', '/factory'],
    ['projects', '/projects'],
    ['blog', '/blog'],
    ['contact', '/contact']
  ] as const;

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src="/assets/logo.jpg" alt={common('brand')} />
        <span>{common('brand')}</span>
      </Link>
      <nav className="nav-links">
        {links.map(([key, href]) => (
          <Link key={key} href={href}>
            {nav(key)}
          </Link>
        ))}
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
