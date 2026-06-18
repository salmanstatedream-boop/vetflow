import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/forms/ProductForm';
import StockInvoiceIntakeClient from '@/components/inventory/StockInvoiceIntakeClient';
import InventoryTabsClient from '@/components/inventory/InventoryTabsClient';
import InventoryCatalogClient from '@/components/inventory/InventoryCatalogClient';
import Link from 'next/link';
import PageHeader from '@/components/ui/premium/PageHeader';
import { Layers, AlertCircle, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: 'Inventory Catalog',
  description: 'Manage clinic products, services, and branch stock levels.',
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; lowStock?: string }>;
}) {
  const { tab, lowStock } = await searchParams;
  const ctx = await resolveServerAuthContext();
  if (!ctx) {
    redirect('/login');
  }

  const denied = guardRoute(ctx, '/dashboard/inventory');
  if (denied) return denied;

  const session = ctx;

  // 1. Resolve branch context
  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get('clinix_branch_id')?.value;
  let activeBranchId = activeBranchCookie;

  if (!activeBranchId && session.branches.length > 0) {
    activeBranchId = session.branches[0].id;
  } else if (activeBranchId && !session.branches.some((b) => b.id === activeBranchId)) {
    activeBranchId = session.branches[0]?.id;
  }

  if (!activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        You must be assigned to a clinic branch to open the inventory dashboard.
      </div>
    );
  }

  const supabase = await createClient();

  // 2. Fetch catalog products in branch
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      brand,
      sku,
      unit,
      type,
      purchase_price,
      selling_price,
      stock_quantity,
      reorder_level,
      category_id,
      created_by,
      product_categories ( name )
    `)
    .eq('branch_id', activeBranchId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Failed to load catalog products: {error.message}
      </div>
    );
  }

  // 3. Fetch categories for ProductForm dropdown
  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .eq('organization_id', session.organizationId);

  const { data: orgServices } = await supabase
    .from('services')
    .select('id, name, description, price')
    .eq('organization_id', session.organizationId!)
    .eq('is_active', true)
    .order('name');

  const { data: appSettings } = await supabase
    .from('app_settings')
    .select('product_markup_percent')
    .eq('organization_id', session.organizationId!)
    .maybeSingle();

  const defaultMarkupPercent = Number(appSettings?.product_markup_percent ?? 20);

  // Compute stats
  const totalItems = (products?.length || 0) + (orgServices?.length || 0);
  const lowStockItems = products?.filter((p) => p.type !== 'service' && p.stock_quantity <= p.reorder_level) || [];
  const existingProductTypes = Array.from(
    new Set<string>(
      (products || [])
        .map((p) => String(p.type ?? ''))
        .filter((t) => t.length > 0)
    )
  );

  return (
    <div className="space-y-8">
      
      <PageHeader
        title="Inventory & Catalog"
        description="Configure medicines, foods, treats, accessories, services, and check stock levels."
        icon={Layers}
        actions={
          hasCapability(session.role, 'manage_inventory') ? (
            <ProductForm
              categories={categories || []}
              branches={session.branches}
              activeBranchId={activeBranchId}
              defaultMarkupPercent={defaultMarkupPercent}
            />
          ) : undefined
        }
      />

      <InventoryTabsClient initialTab={tab === 'intake' ? 'intake' : 'catalog'} />

      {tab === 'intake' ? (
        <StockInvoiceIntakeClient
          activeBranchId={activeBranchId}
          existingProductTypes={existingProductTypes}
          products={(products || []).map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            type: p.type,
          }))}
        />
      ) : (
        <>
      {/* STATS MATRIX */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-4 shadow-premium">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase block">Total Catalog Items</span>
          <span className="text-lg font-black text-on-surface mt-1 block">{totalItems}</span>
        </div>
        <Link
          href="/dashboard/inventory?lowStock=1"
          className="glass-panel rounded-2xl border border-outline-variant/40 p-4 shadow-premium hover:border-destructive/40 hover:bg-destructive/5 transition-colors group"
        >
          <span className="text-[10px] font-bold text-destructive uppercase block flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Low Stock Alerts
            <span className="ml-auto text-[9px] font-bold text-destructive/70 opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </span>
          <span className="text-lg font-black text-destructive mt-1 block">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'}
          </span>
        </Link>
      </div>

      {/* PRODUCT LIST TABLE */}
      {products && products.length > 0 || (orgServices && orgServices.length > 0) ? (
        <InventoryCatalogClient
          products={products || []}
          orgServices={(orgServices || []).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: Number(s.price),
          }))}
          activeBranchId={activeBranchId}
          role={session.role}
          userId={session.userId}
          categories={categories || []}
          branches={session.branches}
          initialLowStockOnly={lowStock === '1'}
          lowStockCount={lowStockItems.length}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-on-surface mb-1">Catalog is Empty</h4>
          <p className="text-xs text-on-surface-variant/60">
            Create products, medicines, or services to begin prescription and invoicing checkout.
          </p>
          {hasCapability(session.role, 'manage_inventory') && (
            <div className="flex justify-center pt-2">
              <ProductForm
                categories={categories || []}
                branches={session.branches}
                activeBranchId={activeBranchId}
                defaultMarkupPercent={defaultMarkupPercent}
              />
            </div>
          )}
        </div>
      )}
        </>
      )}

    </div>
  );
}

