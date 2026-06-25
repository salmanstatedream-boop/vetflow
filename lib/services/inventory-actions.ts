'use server';

import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  assertBranchAccess,
  assertCapability,
  assertFeature,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { writeAuditLog } from '@/lib/services/audit';
import {
  ProductSchema,
  StockAdjustmentSchema,
  ConfirmStockIntakeSchema,
  UpdateProductSchema,
  type ProductInput,
  type StockAdjustmentInput,
} from '@/lib/validations/schemas';
import { normalizeProductTypeSlug } from '@/lib/inventory/product-types';
import { calcSellingPrice, DEFAULT_PRODUCT_MARKUP_PERCENT } from '@/lib/inventory/pricing';
import { recordStockIntakeExpense } from '@/lib/services/revenue-actions';

const ApplyProductMarkupSchema = z.object({
  scope: z.enum(['selected', 'all']),
  productIds: z.array(z.string().uuid()).optional(),
  branchId: z.string().uuid().optional(),
  markupPercent: z.number().min(0).max(500).optional(),
});

function canManageProduct(
  ctx: { role?: string | null; userId: string },
  _product: { created_by: string | null }
): boolean {
  if (ctx.role === 'clinic_admin' || ctx.role === 'receptionist') return true;
  return false;
}

export async function createCategoryAction(name: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false as const, error: 'Category name is required.' };
    }

    const id = await findOrCreateCategory(ctx.organizationId!, trimmed);
    return { success: true as const, category: { id, name: trimmed } };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to create category.',
    };
  }
}

async function findOrCreateCategory(organizationId: string, name: string): Promise<string> {
  const admin = await createAdminClient();
  const { data: existing } = await admin
    .from('product_categories')
    .select('id')
    .eq('organization_id', organizationId)
    .ilike('name', name)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: created, error } = await admin
    .from('product_categories')
    .insert({ organization_id: organizationId, name })
    .select('id')
    .single();
  if (error || !created) throw new Error(error?.message || 'Failed to create category.');
  return created.id;
}

export async function createProductAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const parsed = ProductSchema.parse(payload);
    assertBranchAccess(ctx, parsed.branchId);

    let categoryId = parsed.categoryId || null;
    if (!categoryId && parsed.categoryName?.trim()) {
      categoryId = await findOrCreateCategory(ctx.organizationId!, parsed.categoryName.trim());
    }

    const supabase = await createClient();
    const productType = normalizeProductTypeSlug(parsed.type);
    const trackExpiry = productType !== 'service' && parsed.trackExpiry;
    const expiryDate =
      trackExpiry && parsed.expiryDate?.trim() ? parsed.expiryDate.trim().slice(0, 10) : null;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        organization_id: ctx.organizationId,
        branch_id: parsed.branchId,
        category_id: categoryId,
        name: parsed.name,
        brand: parsed.brand || null,
        sku: parsed.sku || null,
        unit: parsed.unit,
        type: productType,
        purchase_price: parsed.purchasePrice,
        selling_price: parsed.sellingPrice,
        stock_quantity: productType === 'service' ? 9999 : parsed.stockQuantity,
        reorder_level: parsed.reorderLevel,
        track_expiry: trackExpiry,
        expiry_date: expiryDate,
        is_active: true,
        created_by: ctx.userId,
      })
      .select()
      .single();

    if (error || !product) {
      throw new Error(error?.message || 'Failed to register catalog product.');
    }

    if (productType !== 'service' && parsed.stockQuantity > 0) {
      await supabase.from('stock_movements').insert({
        organization_id: ctx.organizationId,
        branch_id: parsed.branchId,
        product_id: product.id,
        type: 'purchase_added',
        quantity: parsed.stockQuantity,
        reason: 'Initial stock intake on creation',
        created_by: ctx.userId,
      });
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: parsed.branchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'STOCK_ADJUSTED',
      resourceType: 'PRODUCT',
      resourceId: product.id,
      afterData: product,
    });

    return { success: true, product };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

export async function adjustStockAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const parsed = StockAdjustmentSchema.parse(payload);
    assertBranchAccess(ctx, parsed.branchId);

    const adminClient = await createAdminClient();

    const { data: product, error: fetchErr } = await adminClient
      .from('products')
      .select('stock_quantity, type, name')
      .eq('id', parsed.productId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (fetchErr || !product) {
      throw new Error('Product not found or access denied.');
    }

    if (product.type === 'service') {
      throw new Error('Cannot adjust stock on service items.');
    }

    const newQty = product.stock_quantity + parsed.quantity;
    if (newQty < 0) {
      throw new Error('Adjustment would result in negative stock.');
    }

    const { error: updateErr } = await adminClient
      .from('products')
      .update({ stock_quantity: newQty })
      .eq('id', parsed.productId);

    if (updateErr) {
      throw new Error(updateErr.message || 'Failed to update stock quantity.');
    }

    await adminClient.from('stock_movements').insert({
      organization_id: ctx.organizationId,
      branch_id: parsed.branchId,
      product_id: parsed.productId,
      type: parsed.type,
      quantity: parsed.quantity,
      reason: parsed.reason,
      created_by: ctx.userId,
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: parsed.branchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'STOCK_ADJUSTED',
      resourceType: 'PRODUCT',
      resourceId: parsed.productId,
      afterData: { newQty, adjustment: parsed.quantity },
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

async function getProductMarkupPercent(
  supabase: Awaited<ReturnType<typeof createAdminClient>>,
  organizationId: string
): Promise<number> {
  const { data } = await supabase
    .from('app_settings')
    .select('product_markup_percent')
    .eq('organization_id', organizationId)
    .maybeSingle();
  const value = Number(data?.product_markup_percent);
  return Number.isFinite(value) ? value : DEFAULT_PRODUCT_MARKUP_PERCENT;
}

export async function applyProductMarkupAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized: Session is invalid.');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_settings');
    assertFeature(ctx, 'inventory');

    const parsed = ApplyProductMarkupSchema.parse(payload);
    const adminClient = await createAdminClient();
    const markupPercent =
      parsed.markupPercent ?? (await getProductMarkupPercent(adminClient, ctx.organizationId!));

    if (parsed.markupPercent != null) {
      const { data: existing } = await adminClient
        .from('app_settings')
        .select('timezone, currency')
        .eq('organization_id', ctx.organizationId)
        .maybeSingle();
      await adminClient.from('app_settings').upsert(
        {
          organization_id: ctx.organizationId,
          product_markup_percent: markupPercent,
          timezone: existing?.timezone ?? 'UTC',
          currency: existing?.currency ?? 'USD',
        },
        { onConflict: 'organization_id' }
      );
    }

    let query = adminClient
      .from('products')
      .select('id, purchase_price, type')
      .eq('organization_id', ctx.organizationId)
      .neq('type', 'service')
      .gt('purchase_price', 0);

    if (parsed.scope === 'selected') {
      if (!parsed.productIds?.length) {
        throw new Error('Select at least one product.');
      }
      query = query.in('id', parsed.productIds);
    } else if (parsed.branchId) {
      query = query.eq('branch_id', parsed.branchId);
    }

    const { data: products, error: fetchErr } = await query;
    if (fetchErr) throw new Error(fetchErr.message);

    let updated = 0;
    for (const product of products || []) {
      const purchase = Number(product.purchase_price);
      if (!Number.isFinite(purchase) || purchase <= 0) continue;
      const selling = calcSellingPrice(purchase, markupPercent);
      const { error } = await adminClient
        .from('products')
        .update({ selling_price: selling })
        .eq('id', product.id);
      if (!error) updated += 1;
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: parsed.branchId || ctx.activeBranchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'PRODUCT_MARKUP_APPLIED',
      resourceType: 'INVENTORY',
      resourceId: ctx.organizationId!,
      afterData: { scope: parsed.scope, updated, markupPercent },
    });

    return { success: true as const, updated };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to apply markup.',
    };
  }
}

export async function confirmStockIntakeAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const parsed = ConfirmStockIntakeSchema.parse(payload);
    assertBranchAccess(ctx, parsed.branchId);

    const adminClient = await createAdminClient();
    const reasonBase = [
      parsed.supplierName && `Supplier: ${parsed.supplierName}`,
      parsed.invoiceNumber && `Invoice: ${parsed.invoiceNumber}`,
      parsed.invoiceDate && `Date: ${parsed.invoiceDate}`,
    ]
      .filter(Boolean)
      .join(' · ');

    const markupPercent = await getProductMarkupPercent(adminClient, ctx.organizationId!);
    let intakeTotalCost = 0;

    for (const line of parsed.lines) {
      if (line.productId) {
        const { data: product } = await adminClient
          .from('products')
          .select('stock_quantity, type, name')
          .eq('id', line.productId)
          .eq('organization_id', ctx.organizationId)
          .single();

        if (!product || product.type === 'service') continue;

        const updates: { stock_quantity: number; purchase_price?: number; selling_price?: number } = {
          stock_quantity: product.stock_quantity + line.quantity,
        };
        if (line.updatePrices && line.unitPrice > 0) {
          updates.purchase_price = line.unitPrice;
          updates.selling_price = calcSellingPrice(line.unitPrice, markupPercent);
        }

        const newQty = updates.stock_quantity;
        await adminClient
          .from('products')
          .update(updates)
          .eq('id', line.productId);

        await adminClient.from('stock_movements').insert({
          organization_id: ctx.organizationId,
          branch_id: parsed.branchId,
          product_id: line.productId,
          type: 'purchase_added',
          quantity: line.quantity,
          reason: reasonBase || `Stock invoice intake — ${line.name}`,
          created_by: ctx.userId,
        });
      } else if (line.createNew) {
        const productType = normalizeProductTypeSlug(line.type ?? 'medicine');

        const { data: product, error } = await adminClient
          .from('products')
          .insert({
            organization_id: ctx.organizationId,
            branch_id: parsed.branchId,
            name: line.name,
            sku: line.sku || null,
            unit: line.unit || 'pcs',
            type: productType,
            category_id: null,
            purchase_price: line.unitPrice,
            selling_price: calcSellingPrice(line.unitPrice, markupPercent),
            stock_quantity: line.quantity,
            reorder_level: 5,
            is_active: true,
            created_by: ctx.userId,
          })
          .select()
          .single();

        if (error || !product) {
          throw new Error(error?.message || `Failed to create product: ${line.name}`);
        }

        await adminClient.from('stock_movements').insert({
          organization_id: ctx.organizationId,
          branch_id: parsed.branchId,
          product_id: product.id,
          type: 'purchase_added',
          quantity: line.quantity,
          reason: reasonBase || 'New product from invoice intake',
          created_by: ctx.userId,
        });
      }
      intakeTotalCost += line.unitPrice * line.quantity;
    }

    const expenseNotes = [
      reasonBase,
      `Lines: ${parsed.lines.length}`,
    ]
      .filter(Boolean)
      .join(' · ');

    await recordStockIntakeExpense({
      organizationId: ctx.organizationId!,
      branchId: parsed.branchId,
      userId: ctx.userId,
      totalCost: intakeTotalCost,
      notes: expenseNotes || 'Stock invoice intake',
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: parsed.branchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'receptionist',
      action: 'STOCK_INVOICE_INTAKE',
      resourceType: 'INVENTORY',
      resourceId: parsed.branchId,
      afterData: {
        supplierName: parsed.supplierName,
        invoiceNumber: parsed.invoiceNumber,
        lineCount: parsed.lines.length,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to confirm stock intake.',
    };
  }
}

export async function toggleProductStatusAction(productId: string, isActive: boolean) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .update({ is_active: isActive })
      .eq('id', productId)
      .eq('organization_id', ctx.organizationId)
      .select('branch_id')
      .single();

    if (error || !product) {
      throw new Error(error?.message || 'Failed to update product status.');
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

export async function updateProductAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized: Session is invalid.');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const parsed = UpdateProductSchema.parse(payload);
    assertBranchAccess(ctx, parsed.branchId);

    const admin = await createAdminClient();
    const { data: existing, error: fetchErr } = await admin
      .from('products')
      .select('id, branch_id, created_by, deleted_at')
      .eq('id', parsed.productId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (fetchErr || !existing || existing.deleted_at) {
      throw new Error('Product not found or access denied.');
    }

    if (!canManageProduct(ctx, { created_by: existing.created_by })) {
      throw new Error('You can only edit products you created.');
    }

    let categoryId = parsed.categoryId || null;
    if (!categoryId && parsed.categoryName?.trim()) {
      categoryId = await findOrCreateCategory(ctx.organizationId!, parsed.categoryName.trim());
    }

    const productType = normalizeProductTypeSlug(parsed.type);
    const trackExpiry = productType !== 'service' && parsed.trackExpiry;
    const expiryDate =
      trackExpiry && parsed.expiryDate?.trim() ? parsed.expiryDate.trim().slice(0, 10) : null;

    const { data: product, error } = await admin
      .from('products')
      .update({
        branch_id: parsed.branchId,
        category_id: categoryId,
        name: parsed.name,
        brand: parsed.brand || null,
        sku: parsed.sku || null,
        unit: parsed.unit,
        type: productType,
        purchase_price: parsed.purchasePrice,
        selling_price: parsed.sellingPrice,
        reorder_level: parsed.reorderLevel,
        track_expiry: trackExpiry,
        expiry_date: expiryDate,
      })
      .eq('id', parsed.productId)
      .select()
      .single();

    if (error || !product) {
      throw new Error(error?.message || 'Failed to update product.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: existing.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'PRODUCT_UPDATED',
      resourceType: 'PRODUCT',
      resourceId: product.id,
      afterData: product,
    });

    return { success: true, product };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized: Session is invalid.');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_inventory');
    assertFeature(ctx, 'inventory');

    const admin = await createAdminClient();
    const { data: existing, error: fetchErr } = await admin
      .from('products')
      .select('id, branch_id, name, created_by, deleted_at')
      .eq('id', productId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (fetchErr || !existing || existing.deleted_at) {
      throw new Error('Product not found or access denied.');
    }

    if (!canManageProduct(ctx, { created_by: existing.created_by })) {
      throw new Error('You can only delete products you created.');
    }

    assertBranchAccess(ctx, existing.branch_id);

    const { error } = await admin
      .from('products')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) throw new Error(error.message || 'Failed to delete product.');

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: existing.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'PRODUCT_DELETED',
      resourceType: 'PRODUCT',
      resourceId: productId,
      beforeData: { name: existing.name },
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }
}
