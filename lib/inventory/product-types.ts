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

export type CheckoutLineType = 'service' | 'product' | 'medicine';

const DISPLAY_TYPE_ALIASES: Record<string, string> = {
  service: 'Service',
  medicine: 'Medicine',
  food: 'Product',
  treats: 'Product',
  accessory: 'Product',
  product: 'Product',
  lab_test: 'Lab Test',
  lab: 'Lab Test',
  procedure: 'Procedure',
  vaccine: 'Vaccine',
  vaccination: 'Vaccine',
  grooming: 'Grooming',
  deworming: 'Medicine',
};

/** Map catalog DB type slug to checkout invoice line enum. */
export function mapCatalogTypeToCheckoutLineType(slug: string): CheckoutLineType {
  const normalized = normalizeProductTypeSlug(slug);
  if (normalized === 'service') return 'service';
  if (normalized === 'medicine' || normalized === 'deworming') return 'medicine';
  return 'product';
}

export function formatProductTypeLabel(slug: string): string {
  const normalized = normalizeProductTypeSlug(slug);
  if (DISPLAY_TYPE_ALIASES[normalized]) {
    return DISPLAY_TYPE_ALIASES[normalized];
  }
  if (normalized in TYPE_LABELS) {
    return TYPE_LABELS[normalized as ProductType];
  }
  return slug
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Merge preset types, org-specific slugs, and an optional current value for edit forms. */
export function buildProductTypeOptions(
  existingTypes: string[],
  currentType?: string
): { value: string; label: string }[] {
  const seen = new Set<string>();
  const opts: { value: string; label: string }[] = [];

  const add = (slug: string) => {
    const normalized = normalizeProductTypeSlug(slug);
    if (!normalized || seen.has(normalized)) return;
    opts.push({ value: normalized, label: formatProductTypeLabel(normalized) });
    seen.add(normalized);
  };

  for (const opt of PRODUCT_TYPE_OPTIONS) {
    add(opt.value);
  }
  for (const raw of existingTypes) {
    add(raw);
  }
  if (currentType) {
    add(currentType);
  }

  return opts;
}
