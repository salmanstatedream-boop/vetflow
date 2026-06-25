'use server';

import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import {
  assertBranchAccess,
  assertCapability,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { writeAuditLog } from '@/lib/services/audit';
import { getDeviceTodayYmd } from '@/lib/utils/device-timezone.server';

const DEFAULT_CATEGORIES = [
  { name: 'Clinic bills', sort_order: 1 },
  { name: 'Staff pay', sort_order: 2 },
  { name: 'Restock', sort_order: 3 },
  { name: 'Other', sort_order: 99 },
] as const;

const ExpenseCategorySchema = z.object({
  name: z.string().min(1).max(255),
  sortOrder: z.number().int().optional(),
});

const ExpenseInputSchema = z.object({
  branchId: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional().or(z.literal('')),
});

const ExpenseUpdateSchema = ExpenseInputSchema.extend({
  expenseId: z.string().uuid(),
});

const RevenueRangeSchema = z.object({
  branchId: z.string().uuid(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type RevenueSummary = {
  grossRevenue: number;
  totalExpenses: number;
  netRevenue: number;
};

function assertRevenueAccess(ctx: Awaited<ReturnType<typeof resolveServerAuthContext>>) {
  if (!ctx) throw new Error('Unauthorized: Session is invalid.');
  assertOrganization(ctx);
  if (ctx.role !== 'clinic_admin') {
    throw new Error('Only clinic owners can access revenue data.');
  }
  assertCapability(ctx, 'view_reports');
}

async function ensureDefaultCategories(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  organizationId: string
) {
  const { data: existing } = await admin
    .from('expense_categories')
    .select('id')
    .eq('organization_id', organizationId)
    .limit(1);

  if (existing && existing.length > 0) return;

  await admin.from('expense_categories').insert(
    DEFAULT_CATEGORIES.map((c) => ({
      organization_id: organizationId,
      name: c.name,
      is_system: true,
      sort_order: c.sort_order,
    }))
  );
}

export async function listExpenseCategoriesAction() {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const admin = await createAdminClient();
    await ensureDefaultCategories(admin, ctx!.organizationId!);

    const { data, error } = await admin
      .from('expense_categories')
      .select('id, name, is_system, is_active, sort_order')
      .eq('organization_id', ctx!.organizationId!)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return { success: true as const, categories: data || [] };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to load categories.',
    };
  }
}

export async function upsertExpenseCategoryAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const parsed = ExpenseCategorySchema.parse(payload);
    const admin = await createAdminClient();

    const { data, error } = await admin
      .from('expense_categories')
      .upsert(
        {
          organization_id: ctx!.organizationId!,
          name: parsed.name.trim(),
          is_system: false,
          sort_order: parsed.sortOrder ?? 50,
        },
        { onConflict: 'organization_id,name' }
      )
      .select('id, name, is_system, sort_order')
      .single();

    if (error) throw new Error(error.message);
    return { success: true as const, category: data };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to save category.',
    };
  }
}

export async function createExpenseAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const parsed = ExpenseInputSchema.parse(payload);
    assertBranchAccess(ctx!, parsed.branchId);

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('expenses')
      .insert({
        organization_id: ctx!.organizationId!,
        branch_id: parsed.branchId,
        category_id: parsed.categoryId,
        amount: parsed.amount,
        expense_date: parsed.expenseDate,
        source: 'manual',
        notes: parsed.notes?.trim() || null,
        created_by: ctx!.userId,
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);

    await writeAuditLog({
      organizationId: ctx!.organizationId,
      branchId: parsed.branchId,
      actorUserId: ctx!.userId,
      actorRole: ctx!.role || 'clinic_admin',
      action: 'EXPENSE_CREATED',
      resourceType: 'EXPENSE',
      resourceId: data.id,
      afterData: { amount: parsed.amount, expenseDate: parsed.expenseDate },
    });

    return { success: true as const, expenseId: data.id };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to create expense.',
    };
  }
}

export async function updateExpenseAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const parsed = ExpenseUpdateSchema.parse(payload);
    assertBranchAccess(ctx!, parsed.branchId);

    const admin = await createAdminClient();
    const { error } = await admin
      .from('expenses')
      .update({
        branch_id: parsed.branchId,
        category_id: parsed.categoryId,
        amount: parsed.amount,
        expense_date: parsed.expenseDate,
        notes: parsed.notes?.trim() || null,
      })
      .eq('id', parsed.expenseId)
      .eq('organization_id', ctx!.organizationId!);

    if (error) throw new Error(error.message);
    return { success: true as const };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to update expense.',
    };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const admin = await createAdminClient();
    const { error } = await admin
      .from('expenses')
      .delete()
      .eq('id', expenseId)
      .eq('organization_id', ctx!.organizationId!);

    if (error) throw new Error(error.message);
    return { success: true as const };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to delete expense.',
    };
  }
}

export async function getRevenueSummaryAction(payload: unknown): Promise<
  | { success: true; summary: RevenueSummary }
  | { success: false; error: string }
> {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);

    const parsed = RevenueRangeSchema.parse(payload);
    assertBranchAccess(ctx!, parsed.branchId);

    const summary = await computeRevenueSummary(
      ctx!.organizationId!,
      parsed.branchId,
      parsed.dateFrom,
      parsed.dateTo
    );

    return { success: true, summary };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load revenue summary.',
    };
  }
}

export async function computeRevenueSummary(
  organizationId: string,
  branchId: string,
  dateFrom: string,
  dateTo: string
): Promise<RevenueSummary> {
  const admin = await createAdminClient();
  const fromIso = `${dateFrom}T00:00:00.000Z`;
  const toIso = `${dateTo}T23:59:59.999Z`;

  const [{ data: invoices }, { data: expenseRows }] = await Promise.all([
    admin
      .from('invoices')
      .select('total')
      .eq('organization_id', organizationId)
      .eq('branch_id', branchId)
      .eq('payment_status', 'paid')
      .gte('paid_at', fromIso)
      .lte('paid_at', toIso),
    admin
      .from('expenses')
      .select('amount')
      .eq('organization_id', organizationId)
      .eq('branch_id', branchId)
      .gte('expense_date', dateFrom)
      .lte('expense_date', dateTo),
  ]);

  const grossRevenue = (invoices || []).reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalExpenses = (expenseRows || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return {
    grossRevenue,
    totalExpenses,
    netRevenue: grossRevenue - totalExpenses,
  };
}

export async function listExpensesAction(payload: {
  branchId: string;
  dateFrom: string;
  dateTo: string;
}) {
  try {
    const ctx = await resolveServerAuthContext();
    assertRevenueAccess(ctx);
    assertBranchAccess(ctx!, payload.branchId);

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('expenses')
      .select(
        'id, amount, expense_date, source, notes, category_id, created_at, expense_categories(name)'
      )
      .eq('organization_id', ctx!.organizationId!)
      .eq('branch_id', payload.branchId)
      .gte('expense_date', payload.dateFrom)
      .lte('expense_date', payload.dateTo)
      .order('expense_date', { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true as const, expenses: data || [] };
  } catch (err: unknown) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : 'Failed to load expenses.',
    };
  }
}

/** Auto-record restock expense after stock invoice intake. */
export async function recordStockIntakeExpense(params: {
  organizationId: string;
  branchId: string;
  userId: string;
  totalCost: number;
  notes: string;
}) {
  if (params.totalCost <= 0) return;

  const admin = await createAdminClient();
  await ensureDefaultCategories(admin, params.organizationId);

  const { data: category } = await admin
    .from('expense_categories')
    .select('id')
    .eq('organization_id', params.organizationId)
    .eq('name', 'Restock')
    .maybeSingle();

  if (!category?.id) return;

  const today = await getDeviceTodayYmd();
  await admin.from('expenses').insert({
    organization_id: params.organizationId,
    branch_id: params.branchId,
    category_id: category.id,
    amount: params.totalCost,
    expense_date: today,
    source: 'stock_intake',
    notes: params.notes,
    created_by: params.userId,
  });
}
