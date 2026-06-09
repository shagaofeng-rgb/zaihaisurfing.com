import type {Locale} from '@/i18n/routing';
import {locales} from '@/i18n/routing';

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zaihaisurfing.com';

export const productSlugs = ['x1', 'x1-pro', 'rage-shark-x', 'p1', 'p1-pro'] as const;
export type ProductSlug = (typeof productSlugs)[number];
export const checkoutProductSlugs = [...productSlugs, 'payment-test'] as const;
export type CheckoutProductSlug = (typeof checkoutProductSlugs)[number];

export type ProductSpecRow = {
  label: string;
  value: string;
};

export const products = {
  x1: {
    name: 'ZAIHAI X1 Electric Surfboard',
    image: '/assets/catalog/optimized/x1.jpg',
    category: 'Electric Surfboards',
    price: 'USD 3,200',
    priceAmount: 3200,
    specs: ['10 kW', '72 V', '0-51 km/h', '60-80 min']
  },
  'x1-pro': {
    name: 'ZAIHAI X1 Pro Electric Surfboard',
    image: '/assets/catalog/optimized/x1-pro.jpg',
    category: 'Electric Surfboards',
    price: 'USD 3,600',
    priceAmount: 3600,
    specs: ['12 kW', '72 V', '0-61 km/h', 'IP67']
  },
  'rage-shark-x': {
    name: 'Rage Shark X Electric Go-Kart Boat',
    image: '/assets/catalog/optimized/rage-shark-x.jpg',
    category: 'Electric Go-Kart Boats',
    price: 'USD 4,000',
    priceAmount: 4000,
    specs: ['15 kW', '76 Ah', '0-51 km/h', '60-80 min']
  },
  p1: {
    name: 'ZAIHAI P1 Fuel-Powered Surfboard',
    image: '/assets/catalog/optimized/p1.jpg',
    category: 'Fuel-Powered Surfboards',
    price: 'USD 5,800',
    priceAmount: 5800,
    specs: ['10.5 kW', '62 km/h', '110 cc', '3.5 L']
  },
  'p1-pro': {
    name: 'ZAIHAI P1 Pro Fuel-Powered Surfboard',
    image: '/assets/catalog/optimized/p1-pro.jpg',
    category: 'Fuel-Powered Surfboards',
    price: 'USD 6,499',
    priceAmount: 6499,
    specs: ['10.5 kW', '64 km/h', '110 cc', '3.5 L']
  },
  'payment-test': {
    name: 'ZAIHAI Payment Gateway Test Product',
    image: '/assets/catalog/optimized/x1.jpg',
    category: 'Payment Test',
    price: 'USD 10',
    priceAmount: 10,
    specs: ['Test order', 'No shipment', 'Gateway check', 'USD 10']
  }
} satisfies Record<CheckoutProductSlug, {name: string; image: string; category: string; price: string; priceAmount: number; specs: string[]}>;

export const productDetailedSpecs: Record<ProductSlug, ProductSpecRow[]> = {
  x1: [
    {label: 'Model', value: 'ZAIHAI X1'},
    {label: 'Motor power', value: '10 kW'},
    {label: 'Voltage', value: '72 V'},
    {label: 'Board size', value: '1720 x 840 x 520 mm'},
    {label: 'Battery capacity', value: '50 Ah'},
    {label: 'Battery weight', value: '25 kg'},
    {label: 'Material', value: 'EPP'},
    {label: 'Top speed', value: '0-51 km/h'},
    {label: 'Endurance', value: '60-80 minutes'},
    {label: 'Highlights', value: 'Fully solid board, no drainage required; quick-release battery; sun-resistant textured surface'}
  ],
  'x1-pro': [
    {label: 'Model', value: 'ZAIHAI X1 Pro'},
    {label: 'Motor power', value: '12 kW'},
    {label: 'Voltage', value: '72 V'},
    {label: 'Board size', value: '1720 x 840 x 520 mm'},
    {label: 'Battery capacity', value: '50 Ah'},
    {label: 'Battery weight', value: '25 kg'},
    {label: 'Material', value: 'EPP'},
    {label: 'Top speed', value: '0-61 km/h'},
    {label: 'Endurance', value: '45 minutes'},
    {label: 'Waterproof rating', value: 'IP67 waterproof'},
    {label: 'Highlights', value: 'Fully solid board, no drainage required; quick-release battery; IP67 waterproof structure'}
  ],
  'rage-shark-x': [
    {label: 'Model', value: 'Rage Shark X'},
    {label: 'Product type', value: '15 kW electric go-kart boat'},
    {label: 'Hull size', value: '1720 x 840 x 520 mm'},
    {label: 'Rated power', value: '15 kW'},
    {label: 'Rated voltage', value: '72 V'},
    {label: 'Battery capacity', value: '76 Ah'},
    {label: 'Battery weight', value: '33 kg'},
    {label: 'Hull weight', value: '46 kg'},
    {label: 'Material', value: 'EPP'},
    {label: 'Speed', value: '0-51 km/h'},
    {label: 'Endurance', value: '60-80 minutes'},
    {label: 'Standard accessories', value: 'Battery, charger, life jacket and matched accessory package'}
  ],
  p1: [
    {label: 'Model', value: 'ZAIHAI P1'},
    {label: 'Power', value: '10.5 kW / 8700 rpm'},
    {label: 'Max speed', value: '62 km/h'},
    {label: 'Recommended operating power', value: '7800-8700 rpm'},
    {label: 'Max load', value: '150 kg'},
    {label: 'Gasoline', value: 'Unleaded gasoline No.95 and above'},
    {label: 'Fuel ratio', value: '50:1'},
    {label: 'Fuel tank volume', value: '3.5 L'},
    {label: 'Engine type', value: 'Two-stroke water-cooled engine'},
    {label: 'Engine displacement', value: '110 cc'},
    {label: 'Ignition mode', value: 'CDI igniter'},
    {label: 'Compression ratio', value: '13:1'},
    {label: 'Recommended lubricating oil', value: 'Fully synthetic 2T lubricating oil'},
    {label: 'Spark plug', value: 'NGK BPR7HIX'},
    {label: 'Cylinder diameter x stroke', value: '53 x 50'},
    {label: 'Board size', value: '1795 x 620 x 155 mm'},
    {label: 'Board weight', value: '22.5 kg'},
    {label: 'Board packing size', value: '1930 x 720 x 350 mm'},
    {label: 'Start mode', value: 'Electric start'},
    {label: 'Warranty', value: '12 months'}
  ],
  'p1-pro': [
    {label: 'Model', value: 'ZAIHAI P1 Pro'},
    {label: 'Power', value: '10.5 kW / 8700 rpm'},
    {label: 'Max speed', value: '64 km/h'},
    {label: 'Recommended operating power', value: '7800-8200 rpm'},
    {label: 'Max load', value: '150 kg'},
    {label: 'Gasoline', value: 'Unleaded gasoline No.95 and above'},
    {label: 'Fuel ratio', value: '50:1'},
    {label: 'Fuel tank volume', value: '3.5 L'},
    {label: 'Engine type', value: 'Two-stroke water-cooled engine'},
    {label: 'Engine displacement', value: '110 cc'},
    {label: 'Ignition mode', value: 'CDI igniter'},
    {label: 'Compression ratio', value: '13:1'},
    {label: 'Recommended lubricating oil', value: 'Fully synthetic 2T lubricating oil'},
    {label: 'Spark plug', value: 'NGK BPR7HIX'},
    {label: 'Cylinder diameter x stroke', value: '53 x 50'},
    {label: 'Board size', value: '1795 x 620 x 155 mm'},
    {label: 'Board weight', value: '22 kg'},
    {label: 'Board packing size', value: '1930 x 720 x 350 mm'},
    {label: 'Start mode', value: 'Electric start'},
    {label: 'Warranty', value: '12 months'}
  ]
};

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
