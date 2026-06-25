import { redirect } from 'next/navigation';
import {
  assertCapability,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import DeniedState from '@/components/ui/premium/DeniedState';
import PageHeader from '@/components/ui/premium/PageHeader';
import RevenueLedgerClient from '@/components/dashboard/RevenueLedgerClient';
import {
  computeRevenueSummary,
  listExpenseCategoriesAction,
} from '@/lib/services/revenue-actions';
import { createAdminClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Revenue',
  description: 'Owner revenue ledger: gross sales, expenses, and net revenue.',
};

function monthToDateRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const to = now.toISOString().slice(0, 10);
  return { from, to };
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  if (ctx.role !== 'clinic_admin') {
    return (
      <DeniedState
        title="Revenue restricted"
        message="Only clinic owners can access the revenue ledger."
      />
    );
  }

  try {
    assertCapability(ctx, 'view_reports');
  } catch {
    return (
      <DeniedState
        title="Revenue restricted"
        message="You do not have permission to view revenue reports."
      />
    );
  }

  const activeBranchId = ctx.activeBranchId;
  if (!activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        Select an active branch to view revenue.
      </div>
    );
  }

  const params = await searchParams;
  const defaultRange = monthToDateRange();
  const dateFrom = params.from?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.from : defaultRange.from;
  const dateTo = params.to?.match(/^\d{4}-\d{2}-\d{2}$/) ? params.to : defaultRange.to;

  const [summary, categoriesRes] = await Promise.all([
    computeRevenueSummary(ctx.organizationId!, activeBranchId, dateFrom, dateTo),
    listExpenseCategoriesAction(),
  ]);

  const admin = await createAdminClient();
  const { data: expenses } = await admin
    .from('expenses')
    .select(
      'id, amount, expense_date, source, notes, category_id, created_at, expense_categories(name)'
    )
    .eq('organization_id', ctx.organizationId!)
    .eq('branch_id', activeBranchId)
    .gte('expense_date', dateFrom)
    .lte('expense_date', dateTo)
    .order('expense_date', { ascending: false });

  const categories = categoriesRes.success ? categoriesRes.categories : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Revenue"
        description="Track paid invoice revenue against clinic expenses. Restock costs are recorded automatically from stock intake."
      />
      <RevenueLedgerClient
        activeBranchId={activeBranchId}
        initialSummary={summary}
        initialExpenses={(expenses || []) as Parameters<typeof RevenueLedgerClient>[0]['initialExpenses']}
        categories={categories}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  );
}
