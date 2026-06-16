import {readStoreObject, writeStoreObject} from '@/lib/durableStore';
import {calculatePricing, tierForQuantity, type PricingTierKey} from '@/lib/pricingMath';

const PRICING_STORE_FILE = 'pricing-admin-store.json';

export type PricingProduct = {
  id: string;
  name: string;
  retailUsd: number;
  tiers: Record<PricingTierKey, number>;
};

export type PricingOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  country: string;
  salesperson: string;
  productId: string;
  productName: string;
  quantity: number;
  retailUnitUsd: number;
  saleUnitUsd: number;
  costUnitUsd: number;
  extraCostUsd: number;
  commissionRate: number;
  exchangeRate: number;
  grossProfitUsd: number;
  grossProfitCny: number;
  salespersonCommissionUsd: number;
  salespersonCommissionCny: number;
  note: string;
};

export type PricingStore = {
  products: PricingProduct[];
  orders: PricingOrder[];
  manualExchangeRate: number | null;
  updatedAt: string;
};

export const defaultPricingProducts: PricingProduct[] = [
  {id: 'x1', name: 'X1', retailUsd: 3699, tiers: {tier1: 3150, tier2: 3000, tier3: 2850, tier4: 2600}},
  {id: 'x1-pro', name: 'X1 PRO', retailUsd: 4099, tiers: {tier1: 3250, tier2: 3350, tier3: 3100, tier4: 2900}},
  {id: 'rage-shark-x', name: '卡丁船', retailUsd: 4300, tiers: {tier1: 3850, tier2: 3650, tier3: 3200, tier4: 3200}},
  {id: 'p1', name: 'P1', retailUsd: 5999, tiers: {tier1: 5700, tier2: 5550, tier3: 5300, tier4: 5000}},
  {id: 'p1-pro', name: 'P1 PRO', retailUsd: 6799, tiers: {tier1: 6300, tier2: 6200, tier3: 5950, tier4: 5700}}
];

function seedStore(): PricingStore {
  return {
    products: defaultPricingProducts,
    orders: [],
    manualExchangeRate: null,
    updatedAt: new Date().toISOString()
  };
}

function mergeProducts(products: PricingProduct[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  let changed = false;
  const merged = defaultPricingProducts.map((product) => {
    const existing = byId.get(product.id);
    if (!existing) {
      changed = true;
      return product;
    }
    return existing;
  });
  return {changed, products: merged};
}

export async function readPricingStore() {
  const stored = await readStoreObject<PricingStore>(PRICING_STORE_FILE);
  if (!stored) {
    const seeded = seedStore();
    await writeStoreObject(PRICING_STORE_FILE, seeded);
    return seeded;
  }
  const merged = mergeProducts(stored.products || []);
  if (merged.changed) {
    const next = {...stored, products: merged.products, updatedAt: new Date().toISOString()};
    await writeStoreObject(PRICING_STORE_FILE, next);
    return next;
  }
  return {...stored, products: merged.products, orders: stored.orders || [], manualExchangeRate: stored.manualExchangeRate ?? null};
}

export async function writePricingStore(updater: (store: PricingStore) => PricingStore) {
  const current = await readPricingStore();
  const next = updater(current);
  await writeStoreObject(PRICING_STORE_FILE, next);
  return next;
}

export {calculatePricing, tierForQuantity};

export async function fetchUsdCnyRate(manualExchangeRate?: number | null) {
  if (manualExchangeRate && manualExchangeRate > 0) {
    return {rate: manualExchangeRate, source: '手动汇率', updatedAt: new Date().toISOString(), fallback: false};
  }
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {cache: 'no-store'});
    if (!response.ok) throw new Error(`exchange api ${response.status}`);
    const payload = await response.json() as {rates?: Record<string, number>; time_last_update_utc?: string};
    const rate = Number(payload.rates?.CNY);
    if (Number.isFinite(rate) && rate > 0) {
      return {rate, source: 'open.er-api.com USD/CNY', updatedAt: payload.time_last_update_utc || new Date().toISOString(), fallback: false};
    }
  } catch {
    // Use a conservative fallback only when the public exchange endpoint is unreachable.
  }
  return {rate: 7.2, source: '临时备用汇率', updatedAt: new Date().toISOString(), fallback: true};
}
