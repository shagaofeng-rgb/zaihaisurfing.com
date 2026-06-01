import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'es', 'ru', 'ar', 'fr', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ru: 'Russian',
  ar: 'Arabic',
  fr: 'Français',
  pt: 'Português'
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const pathnames = [
  '',
  '/products',
  '/products/x1',
  '/products/x1-pro',
  '/products/rage-shark-x',
  '/products/p1',
  '/products/p1-pro',
  '/applications',
  '/about',
  '/factory',
  '/projects',
  '/blog',
  '/contact'
] as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
