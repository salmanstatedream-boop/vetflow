import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import DeniedState from '@/components/ui/premium/DeniedState';
import PageHeader from '@/components/ui/premium/PageHeader';
import SalesMonitorClient from '@/components/sales/SalesMonitorClient';
import { getInvoicePaymentMethods } from '@/lib/billing/payment-method';
import {
  addDaysToYmd,
  getTodayYmdInTimezone,
  normalizeClinicTimezone,
} from '@/lib/utils/timezones';
import { BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Retail Sales Monitor',
  description: 'Monitor counter sales and retail revenue.',
};

export default async function SalesMonitorPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const { dateFrom, dateTo } = await searchParams;
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/sales');
  if (denied) return denied;

  if (ctx.role !== 'clinic_admin') {
    return (
      <DeniedState
        title="Sales monitor restricted"
        message="Only clinic administrators can view the retail sales monitor."
      />
    );
  }

  const cookieStore = await cookies();
  let activeBranchId = cookieStore.get('clinix_branch_id')?.value;
  if (!activeBranchId && ctx.branches.length > 0) activeBranchId = ctx.branches[0].id;
  else if (activeBranchId && !ctx.branches.some((b) => b.id === activeBranchId)) {
    activeBranchId = ctx.branches[0]?.id;
  }

  if (!activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        You must be assigned to a clinic branch to view sales.
      </div>
    );
  }

  const supabase = await createClient();

  const { data: appSettings } = await supabase
    .from('app_settings')
    .select('timezone')
    .eq('organization_id', ctx.organizationId!)
    .maybeSingle();

  const clinicTimezone = normalizeClinicTimezone(appSettings?.timezone);
  const todayYmd = getTodayYmdInTimezone(clinicTimezone);
  const sinceYmd = addDaysToYmd(todayYmd, -95);
  const sinceIso = new Date(`${sinceYmd}T00:00:00`).toISOString();

  const { data: retailInvoices } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total,
      created_at,
      created_by,
      customers ( first_name, last_name ),
      invoice_items ( name, quantity ),
      payments ( payment_method, created_at )
    `)
    .eq('branch_id', activeBranchId)
    .eq('sale_type', 'retail')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false });

  const creatorIds = [
    ...new Set(
      (retailInvoices || [])
        .map((i) => i.created_by as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const creatorMap = new Map<string, string>();
  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', creatorIds);
    for (const c of creators || []) {
      creatorMap.set(c.id, `${c.first_name} ${c.last_name}`.trim());
    }
  }

  const sales = (retailInvoices || []).map((inv) => {
    const cust = inv.customers as { first_name?: string; last_name?: string } | null;
    const items = inv.invoice_items as { name: string; quantity: number }[] | null;
    const payments = inv.payments as { payment_method: string; created_at: string }[] | null;
    const itemLines = (items || []).map((i) => ({
      name: i.name,
      quantity: Number(i.quantity) || 0,
    }));
    const itemSummary = itemLines.map((i) => `${i.name} x${i.quantity}`).join(', ');
    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      createdAt: inv.created_at,
      customerName: cust ? `${cust.first_name} ${cust.last_name}`.trim() : '—',
      total: Number(inv.total),
      itemSummary: itemSummary || '—',
      itemLines,
      soldByName: inv.created_by ? creatorMap.get(inv.created_by as string) || '—' : '—',
      paymentMethods: getInvoicePaymentMethods(payments),
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Retail Sales Monitor"
        description="Track counter sales, revenue, and top-selling products."
        icon={BarChart3}
      />
      <SalesMonitorClient
        sales={sales}
        clinicTimezone={clinicTimezone}
        initialDateFrom={dateFrom ?? ''}
        initialDateTo={dateTo ?? ''}
      />
    </div>
  );
}
