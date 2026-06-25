import type { SupabaseClient } from '@supabase/supabase-js';

export type LowStockProductRow = {
  id: string;
  name: string;
  stock_quantity: number;
  reorder_level: number;
  type: string;
  product_categories?: { name: string } | { name: string }[] | null;
};

export function isLowStockProduct(p: {
  type: string;
  stock_quantity: number;
  reorder_level: number;
}): boolean {
  return p.type !== 'service' && p.stock_quantity <= p.reorder_level;
}

export function filterLowStockProducts<T extends { type: string; stock_quantity: number; reorder_level: number }>(
  products: T[] | null | undefined
): T[] {
  return (products ?? []).filter(isLowStockProduct);
}

export async function countLowStockProducts(
  supabase: SupabaseClient,
  branchId: string
): Promise<number> {
  const { data } = await supabase
    .from('products')
    .select('stock_quantity, reorder_level, type')
    .eq('branch_id', branchId)
    .is('deleted_at', null)
    .neq('type', 'service');
  return filterLowStockProducts(data).length;
}

export async function fetchLowStockProductList(
  supabase: SupabaseClient,
  branchId: string,
  limit = 8
): Promise<LowStockProductRow[]> {
  const { data } = await supabase
    .from('products')
    .select('id, name, stock_quantity, reorder_level, type, product_categories(name)')
    .eq('branch_id', branchId)
    .is('deleted_at', null)
    .neq('type', 'service')
    .order('stock_quantity', { ascending: true });
  return filterLowStockProducts(data as LowStockProductRow[] | null).slice(0, limit);
}
