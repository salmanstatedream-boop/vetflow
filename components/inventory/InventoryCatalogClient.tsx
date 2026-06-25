'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StockAdjustmentForm from '@/components/forms/StockAdjustmentForm';
import ProductEditModal from '@/components/inventory/ProductEditModal';
import Select from '@/components/ui/premium/Select';
import { deleteProductAction, applyProductMarkupAction } from '@/lib/services/inventory-actions';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { ShieldAlert, Trash2, Loader2, Settings, Search, X } from 'lucide-react';
import type { UserSessionDetails } from '@/lib/services/auth';
import { formatProductTypeLabel } from '@/lib/inventory/product-types';

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  sku: string | null;
  unit: string | null;
  type: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  reorder_level: number;
  track_expiry: boolean;
  expiry_date: string | null;
  created_by: string | null;
  product_categories: { name: string } | null;
}

export interface OrgServiceRow {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

type CatalogRow =
  | { source: 'product'; product: ProductRow }
  | { source: 'org_service'; service: OrgServiceRow };

interface InventoryCatalogClientProps {
  products: ProductRow[];
  orgServices: OrgServiceRow[];
  activeBranchId: string;
  role: UserSessionDetails['role'];
  userId: string;
  categories: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  initialLowStockOnly?: boolean;
  lowStockCount?: number;
  existingProductTypes?: string[];
}

function isLowStockProduct(product: ProductRow): boolean {
  return product.type !== 'service' && product.stock_quantity <= product.reorder_level;
}

function canManageRow(role: UserSessionDetails['role']): boolean {
  return role === 'clinic_admin' || role === 'receptionist';
}

export default function InventoryCatalogClient({
  products,
  orgServices,
  activeBranchId,
  role,
  userId,
  categories,
  branches,
  initialLowStockOnly = false,
  lowStockCount = 0,
  existingProductTypes = [],
}: InventoryCatalogClientProps) {
  const { formatCurrency } = useCurrency();
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStockOnly);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [markupApplying, setMarkupApplying] = useState(false);
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialLowStockOnly) {
      setLowStockOnly(true);
      requestAnimationFrame(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [initialLowStockOnly]);

  const typeFilterOptions = useMemo(() => {
    const slugs = new Set<string>();
    for (const p of products) {
      if (p.type) slugs.add(p.type);
    }
    if (orgServices.length > 0 || products.some((p) => p.type === 'service')) {
      slugs.add('service');
    }
    const sorted = [...slugs].sort((a, b) =>
      formatProductTypeLabel(a).localeCompare(formatProductTypeLabel(b))
    );
    return [
      { value: 'all', label: 'All types' },
      ...sorted.map((slug) => ({ value: slug, label: formatProductTypeLabel(slug) })),
    ];
  }, [products, orgServices]);

  const catalogRows = useMemo((): CatalogRow[] => {
    const productRows: CatalogRow[] = products.map((p) => ({ source: 'product', product: p }));
    const serviceRows: CatalogRow[] = orgServices.map((s) => ({ source: 'org_service', service: s }));
    return [...productRows, ...serviceRows];
  }, [products, orgServices]);

  const filtered = useMemo(() => {
    let rows = catalogRows;

    if (typeFilter === 'service') {
      rows = rows.filter(
        (r) => r.source === 'org_service' || (r.source === 'product' && r.product.type === 'service')
      );
    } else if (typeFilter !== 'all') {
      rows = rows.filter((r) => r.source === 'product' && r.product.type === typeFilter);
    }

    if (lowStockOnly) {
      rows = rows.filter((r) => r.source === 'product' && isLowStockProduct(r.product));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => {
        if (r.source === 'org_service') {
          return (
            r.service.name.toLowerCase().includes(q) ||
            (r.service.description?.toLowerCase().includes(q) ?? false)
          );
        }
        const p = r.product;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          (p.sku?.toLowerCase().includes(q) ?? false)
        );
      });
    }

    return rows;
  }, [catalogRows, typeFilter, lowStockOnly, searchQuery]);

  const showLowStock = () => {
    setLowStockOnly(true);
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApplyMarkup = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Apply default markup to ${selectedIds.size} selected product(s)?`)) return;
    setMarkupApplying(true);
    try {
      const res = await applyProductMarkupAction({
        scope: 'selected',
        productIds: [...selectedIds],
        branchId: activeBranchId,
      });
      if (res.success) {
        setSelectedIds(new Set());
        router.refresh();
      } else {
        alert(res.error || 'Failed to apply markup');
      }
    } finally {
      setMarkupApplying(false);
    }
  };

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Remove "${name}" from the catalog?`)) return;
    setDeletingId(productId);
    try {
      const res = await deleteProductAction(productId);
      if (res.success) router.refresh();
      else alert(res.error || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (catalogRows.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end gap-3 flex-wrap">
        <div className="w-full sm:w-52 shrink-0">
          <Select
            label="Filter by type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeFilterOptions}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            Search by name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/50 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Product or service name…"
              className="w-full pl-9 pr-9 py-2.5 bg-surface-container/30 border border-outline-variant/80 rounded-xl text-sm text-on-surface outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {role === 'clinic_admin' && selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleApplyMarkup}
              disabled={markupApplying}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-primary/40 text-primary hover:bg-primary/5 disabled:opacity-60"
            >
              {markupApplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Apply markup ({selectedIds.size})
            </button>
          )}
          <button
            type="button"
            onClick={showLowStock}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              lowStockOnly
                ? 'bg-destructive/10 border-destructive/40 text-destructive'
                : 'border-destructive/30 text-destructive hover:bg-destructive/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Low stock
            {lowStockCount > 0 && (
              <span className="bg-destructive/15 px-1.5 py-0.5 rounded-md text-[10px]">
                {lowStockCount}
              </span>
            )}
          </button>
          {lowStockOnly && (
            <button
              type="button"
              onClick={() => setLowStockOnly(false)}
              className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface underline"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {(searchQuery || lowStockOnly) && (
        <p className="text-[11px] text-on-surface-variant">
          Showing {filtered.length} of {catalogRows.length} catalog items
          {lowStockOnly ? ' (low stock only)' : ''}
          {searchQuery ? ` matching “${searchQuery.trim()}”` : ''}
        </p>
      )}

      <div
        ref={tableRef}
        className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden shadow-premium"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/40 border-b border-outline-variant/40 text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">
              {role === 'clinic_admin' && <th className="px-4 py-4 w-10" />}
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Type & Category</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4">Stock Balance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={role === 'clinic_admin' ? 6 : 5} className="px-6 py-8 text-center text-on-surface-variant/60 italic">
                  {lowStockOnly
                    ? 'No low-stock items match your filters.'
                    : searchQuery
                      ? 'No products match your search.'
                      : 'No items in this category.'}
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                if (row.source === 'org_service') {
                  const svc = row.service;
                  return (
                    <tr key={`svc-${svc.id}`} className="hover:bg-surface-container/10 transition-colors">
                      {role === 'clinic_admin' && <td className="px-4 py-4" />}
                      <td className="px-6 py-4">
                        <span className="font-bold text-on-surface block">{svc.name}</span>
                        {svc.description && (
                          <span className="text-[10px] text-on-surface-variant/50 block line-clamp-1">
                            {svc.description}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-on-surface capitalize">service</span>
                        <span className="inline-flex ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          Org service
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant/80">
                        {formatCurrency(Number(svc.price))}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-on-surface-variant/50 italic font-semibold">No stock</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/dashboard/settings"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors"
                        >
                          <Settings className="w-3 h-3" />
                          Edit in Settings
                        </Link>
                      </td>
                    </tr>
                  );
                }

                const prod = row.product;
                const isLowStock = isLowStockProduct(prod);
                const manageable = canManageRow(role);

                return (
                  <tr key={prod.id} className="hover:bg-surface-container/10 transition-colors">
                    {role === 'clinic_admin' && prod.type !== 'service' && Number(prod.purchase_price) > 0 && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(prod.id)}
                          onChange={() => toggleSelect(prod.id)}
                          className="rounded border-outline-variant/60"
                          aria-label={`Select ${prod.name}`}
                        />
                      </td>
                    )}
                    {role === 'clinic_admin' && (prod.type === 'service' || Number(prod.purchase_price) <= 0) && (
                      <td className="px-4 py-4" />
                    )}
                    <td className="px-6 py-4">
                      <span className="font-bold text-on-surface block">{prod.name}</span>
                      <span className="text-[10px] text-on-surface-variant/50 block">
                        {prod.brand && `Brand: ${prod.brand}`} {prod.sku && `• SKU: ${prod.sku}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-on-surface-variant/70">
                      <span className="font-semibold text-on-surface">
                        {formatProductTypeLabel(prod.type)}
                      </span>
                      {prod.type === 'service' && (
                        <span className="inline-flex ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                          Catalog
                        </span>
                      )}
                      {prod.product_categories && (
                        <span className="text-on-surface-variant/60 block text-[10px]">
                          Category: {prod.product_categories.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-y-0.5 text-on-surface-variant/80 font-medium">
                      <div>Sell: {formatCurrency(Number(prod.selling_price))}</div>
                      <div className="text-[10px] text-on-surface-variant/50">
                        Buy: {formatCurrency(Number(prod.purchase_price))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {prod.type === 'service' ? (
                        <span className="text-on-surface-variant/50 italic font-semibold">
                          Virtual Service
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span
                            className={`font-bold ${isLowStock ? 'text-destructive' : 'text-on-surface'}`}
                          >
                            {prod.stock_quantity} {prod.unit || 'pcs'}
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-destructive bg-destructive/5 border border-destructive/20 px-2 py-0.5 rounded-lg w-max">
                              <ShieldAlert className="w-3 h-3" />
                              Low Stock (Limit {prod.reorder_level})
                            </span>
                          )}
                          {prod.track_expiry && prod.expiry_date && (
                            <span className="block text-[9px] font-semibold text-amber-400">
                              Exp: {new Date(prod.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end gap-2">
                        {manageable && (
                          <div className="flex items-center gap-2">
                            <ProductEditModal
                              product={prod}
                              categories={categories}
                              branches={branches}
                              activeBranchId={activeBranchId}
                              existingProductTypes={existingProductTypes}
                            />
                            <button
                              type="button"
                              disabled={deletingId !== null}
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
                            >
                              {deletingId === prod.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </button>
                          </div>
                        )}
                        {prod.type !== 'service' ? (
                          <StockAdjustmentForm
                            productId={prod.id}
                            productName={prod.name}
                            branchId={activeBranchId}
                            currentStock={prod.stock_quantity}
                          />
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/40 italic">
                            Billed Service
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
