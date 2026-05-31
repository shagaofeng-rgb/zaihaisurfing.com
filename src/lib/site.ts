import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaihaisurfing.com';

export const productSlugs = ['x1', 'x1-pro', 'rage-shark-x', 'p1', 'p1-pro'] as const;
export type ProductSlug = (typeof productSlugs)[number];

export const products = {
  x1: {
    name: 'ZAIHAI X1 Electric Surfboard',
    image: '/assets/catalog/x1/main.png',
    category: 'Electric Surfboards',
    price: 'USD 3,200',
    priceAmount: 3200,
    specs: ['10 kW', '72 V', '0-51 km/h', '60-80 min']
  },
  'x1-pro': {
    name: 'ZAIHAI X1 Pro Electric Surfboard',
    image: '/assets/catalog/x1-pro/main.png',
    category: 'Electric Surfboards',
    price: 'USD 3,600',
    priceAmount: 3600,
    specs: ['12 kW', '72 V', '0-61 km/h', 'IP67']
  },
  'rage-shark-x': {
    name: 'Rage Shark X Electric Kart Boat',
    image: '/assets/catalog/rage-shark-x/main.png',
    category: 'Electric Water Karts',
    price: 'USD 4,000',
    priceAmount: 4000,
    specs: ['15 kW', '76 Ah', '0-51 km/h', '60-80 min']
  },
  p1: {
    name: 'ZAIHAI P1 Fuel-Powered Surfboard',
    image: '/assets/catalog/p1/main.png',
    category: 'Fuel-Powered Surfboards',
    price: 'USD 5,800',
    priceAmount: 5800,
    specs: ['10.5 kW', '62 km/h', '110 cc', '3.5 L']
  },
  'p1-pro': {
    name: 'ZAIHAI P1 Pro Fuel-Powered Surfboard',
    image: '/assets/catalog/p1-pro/main.png',
    category: 'Fuel-Powered Surfboards',
    price: 'USD 6,499',
    priceAmount: 6499,
    specs: ['10.5 kW', '64 km/h', '110 cc', '3.5 L']
  }
} satisfies Record<ProductSlug, {name: string; image: string; category: string; price: string; priceAmount: number; specs: string[]}>;

export const routeKeys = {
  home: '',
  products: '/products',
  applications: '/applications',
  about: '/about',
  factory: '/factory',
  projects: '/projects',
  blog: '/blog',
  contact: '/contact'
} as const;

export function localizedPath(locale: Locale, path = '') {
  return `/${locale}${path}`;
}

export function alternatesFor(path = '') {
  return Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}${localizedPath(locale, path)}`]));
}

export function canonicalFor(locale: Locale, path = '') {
  return `${siteUrl}${localizedPath(locale, path)}`;
}
