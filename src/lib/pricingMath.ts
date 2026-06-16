export type PricingTierKey = 'tier1' | 'tier2' | 'tier3' | 'tier4';

export const tierLabels: Record<PricingTierKey, string> = {
  tier1: '1-5 台',
  tier2: '5-10 台',
  tier3: '10-30 台',
  tier4: '30 台以上'
};

export function tierForQuantity(quantity: number): PricingTierKey {
  if (quantity >= 30) return 'tier4';
  if (quantity >= 10) return 'tier3';
  if (quantity >= 5) return 'tier2';
  return 'tier1';
}

export function calculatePricing(input: {
  quantity: number;
  saleUnitUsd: number;
  costUnitUsd: number;
  extraCostUsd: number;
  commissionRate: number;
  exchangeRate: number;
}) {
  const quantity = Math.max(1, Math.floor(input.quantity || 1));
  const grossProfitUsd = Number(((input.saleUnitUsd - input.costUnitUsd) * quantity - input.extraCostUsd).toFixed(2));
  const grossProfitCny = Number((grossProfitUsd * input.exchangeRate).toFixed(2));
  const salespersonCommissionUsd = Number((Math.max(0, grossProfitUsd) * Math.max(0, input.commissionRate) / 100).toFixed(2));
  const salespersonCommissionCny = Number((salespersonCommissionUsd * input.exchangeRate).toFixed(2));
  return {grossProfitUsd, grossProfitCny, salespersonCommissionUsd, salespersonCommissionCny};
}
