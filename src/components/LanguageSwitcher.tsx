'use client';

import {useRef} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname} from 'next/navigation';
import {localeNames, locales, type Locale} from '@/i18n/routing';
import {useDismissDisclosure} from './useDismissDisclosure';

export default function LanguageSwitcher({locale}: {locale: Locale}) {
  const pathname = usePathname();
  const t = useTranslations('language');
  const menu = useRef<HTMLDetailsElement>(null);
  useDismissDisclosure(menu);
  const englishOnly = /^\/(?:en|es|fr|de|ar|pt|ru)\/(?:news|blog|faq|shipping|warranty|returns|privacy|terms)(?:\/|$)/.test(pathname);

  function saveLanguage(nextLocale: Locale) {
    try {
      window.localStorage.setItem('zaihai_locale', nextLocale);
    } catch {
      // The destination URL already carries the language.
    }
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  }

  function pathFor(nextLocale: Locale) {
    const parts = pathname.split('/');
    if (englishOnly && nextLocale !== 'en') return `/${nextLocale}`;
    if (locales.includes(parts[1] as Locale)) {
      parts[1] = nextLocale;
      return parts.join('/') || `/${nextLocale}`;
    }
    return `/${nextLocale}${pathname}`;
  }

  return (
    <details className="language-switcher" ref={menu}>
      <summary className="language-trigger" aria-label={t('label')}>
        <span>{locale.toUpperCase()}</span>
      </summary>
      <div className="language-menu">
        {locales.map((item) => (
          <a key={item} href={pathFor(item)} hrefLang={item} aria-current={item === locale ? 'page' : undefined} onClick={(event) => {
            if (pathname.endsWith('/contact')) {
              const model = new URLSearchParams(window.location.search).get('product');
              if (model && /^[a-z0-9-]{1,40}$/.test(model)) event.currentTarget.href = `${pathFor(item)}?product=${model}#inquiry-form`;
            }
            saveLanguage(item);
          }}>
            <span>{item.toUpperCase()}</span>
            <strong>{localeNames[item]}</strong>
          </a>
        ))}
      </div>
    </details>
  );
}
