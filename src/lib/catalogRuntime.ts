import {unstable_cache} from 'next/cache';
import {cache} from 'react';
import type {AdminStore} from '@/lib/backendStore';
import {readStoreObject} from '@/lib/durableStore';
import {products, type CheckoutProductSlug} from '@/lib/site';

const STORE_FILE = 'admin-store.json';
export const PUBLIC_CATALOG_CACHE_TAG = 'zaihai-public-catalog';

async function readCatalog() {
  return (await readStoreObject<AdminStore>(STORE_FILE))?.products || [];
}

const readPublicCatalog = cache(unstable_cache(readCatalog, ['public-catalog-v1'], {
  revalidate: 60,
  tags: [PUBLIC_CATALOG_CACHE_TAG]
}));

export type RuntimeCatalogProduct = {
  slug: CheckoutProductSlug;
  name: string;
  image: string;
  thumbnail: string;
  category: string;
  price: string;
  priceAmount: number;
  specs: string[];
  galleryImages: string[];
  status: 'published' | 'unpublished';
  stock: number | null;
  showOnHome: boolean;
  allowDirectOrder: boolean;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

function usd(amount: number) {
  return `USD ${amount.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
}

function catalogProduct(slug: CheckoutProductSlug, catalog: AdminStore['products']): RuntimeCatalogProduct | null {
  const fallback = products[slug];
  const adminProduct = catalog.find((product) => product.slug === slug);
  if (adminProduct && adminProduct.status !== 'published') return null;
  if (!adminProduct) {
    return {
      slug,
      ...fallback,
      galleryImages: [],
      status: 'published',
      stock: null,
      showOnHome: true,
      allowDirectOrder: true,
      seoTitle: `${fallback.name} for Resorts, Rentals and Distributors | ZAIHAI SURFING`,
      seoDescription: `${fallback.name}: commercial specifications, buyer use cases, pricing and export support for water sports projects.`,
      updatedAt: '2026-06-24'
    };
  }

  const priceAmount = (adminProduct.salePriceCents || adminProduct.priceCents) / 100;
  return {
    slug,
    name: adminProduct.name || fallback.name,
    image: adminProduct.coverImage || fallback.image,
    thumbnail: adminProduct.coverImage || fallback.thumbnail,
    category: adminProduct.categoryName || fallback.category,
    price: usd(priceAmount),
    priceAmount,
    specs: adminProduct.keyFeatures.length ? adminProduct.keyFeatures : fallback.specs,
    galleryImages: adminProduct.galleryImages,
    status: 'published',
    stock: adminProduct.stock,
    showOnHome: adminProduct.showOnHome,
    allowDirectOrder: adminProduct.allowDirectOrder,
    seoTitle: adminProduct.seoTitle || `${adminProduct.name || fallback.name} | ZAIHAI SURFING`,
    seoDescription: adminProduct.seoDescription || `${adminProduct.name || fallback.name}: commercial specifications, buyer use cases, pricing and export support for water sports projects.`,
    updatedAt: adminProduct.updatedAt
  };
}

export async function getRuntimeCatalogProduct(slug: CheckoutProductSlug) {
  return catalogProduct(slug, await readCatalog());
}

export async function getPublicCatalogProduct(slug: CheckoutProductSlug) {
  return catalogProduct(slug, await readPublicCatalog());
}

export async function listRuntimeCatalogProducts(slugs: readonly CheckoutProductSlug[]) {
  const catalog = await readPublicCatalog();
  const rows = slugs.map((slug) => catalogProduct(slug, catalog));
  return rows.filter((row): row is RuntimeCatalogProduct => Boolean(row));
}
