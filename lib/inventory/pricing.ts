/** Calculate selling price from purchase/cost price and markup percent (e.g. 20 = 20%). */
export function calcSellingPrice(purchasePrice: number, markupPercent: number): number {
  if (!Number.isFinite(purchasePrice) || purchasePrice < 0) return 0;
  const markup = Number.isFinite(markupPercent) ? markupPercent : 20;
  const multiplier = 1 + markup / 100;
  return Math.round(purchasePrice * multiplier * 100) / 100;
}

export const DEFAULT_PRODUCT_MARKUP_PERCENT = 20;
