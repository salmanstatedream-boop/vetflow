export const PRODUCT_TYPES = ['service', 'medicine', 'food', 'treats', 'accessory'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const STOCK_PRODUCT_TYPES = ['medicine', 'food', 'treats', 'accessory'] as const;
export type StockProductType = (typeof STOCK_PRODUCT_TYPES)[number];

const TYPE_LABELS: Record<ProductType, string> = {
  service: 'Service',
  medicine: 'Medicine',
  food: 'Food',
  treats: 'Treats',
  accessory: 'Accessory',
};

export const PRODUCT_TYPE_OPTIONS = PRODUCT_TYPES.map((value) => ({
  value,
  label: TYPE_LABELS[value],
}));

export const STOCK_PRODUCT_TYPE_OPTIONS = STOCK_PRODUCT_TYPES.map((value) => ({
  value,
  label: TYPE_LABELS[value],
}));

/** Normalize free-form type labels to a stable DB slug (lowercase, underscores). */
export function normalizeProductTypeSlug(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
  return slug || 'other';
}

export function formatProductTypeLabel(slug: string): string {
  if (slug in TYPE_LABELS) {
    return TYPE_LABELS[slug as ProductType];
  }
  return slug
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
