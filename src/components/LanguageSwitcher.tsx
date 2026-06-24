'use client';

import {usePathname} from 'next/navigation';
import {localeNames, locales, type Locale} from '@/i18n/routing';

export default function LanguageSwitcher({locale}: {locale: Locale}) {
  const pathname = usePathname();

  function saveLanguage(nextLocale: Locale) {
    try {
      window.localStorage.setItem('zaihai_locale', nextLocale);
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }

  function pathFor(nextLocale: Locale) {
    const parts = pathname.split('/');
    if (locales.includes(parts[1] as Locale)) {
      parts[1] = nextLocale;
      return parts.join('/') || `/${nextLocale}`;
    }
    return `/${nextLocale}${pathname}`;
  }

  return (
    <div className="language-switcher">
      <button className="language-trigger" type="button" title="Change language">
        <span>{locale.toUpperCase()}</span>
      </button>
      <div className="language-menu">
        {locales.map((item) => (
          <a key={item} href={pathFor(item)} aria-current={item === locale ? 'page' : undefined} onClick={() => saveLanguage(item)}>
            <span>{item.toUpperCase()}</span>
            <strong>{localeNames[item]}</strong>
          </a>
        ))}
      </div>
    </div>
  );
}
