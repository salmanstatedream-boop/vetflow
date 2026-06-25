'use server';

import { createClient } from '@/lib/supabase/server';
import {
  assertActiveBranch,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { hasCapability } from '@/lib/auth/capabilities';
import {
  notificationBadgeCount,
  sortDashboardNotifications,
  type DashboardNotification,
} from '@/lib/dashboard/notifications';
import { filterLowStockProducts } from '@/lib/inventory/low-stock';
import { normalizeOneToOne } from '@/lib/supabase/embed';

const MAX_NOTIFICATIONS = 10;

export async function getDashboardNotificationsAction(): Promise<{
  success: boolean;
  notifications: DashboardNotification[];
  count: number;
}> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx?.role) {
      return { success: false, notifications: [], count: 0 };
    }

    assertOrganization(ctx);
    if (!ctx.activeBranchId) {
      return { success: true, notifications: [], count: 0 };
    }
    assertActiveBranch(ctx);

    const role = ctx.role;
    const branchId = ctx.activeBranchId;
    const supabase = await createClient();
    const notifications: DashboardNotification[] = [];

    if (hasCapability(role, 'billing_checkout')) {
      const { data: checkoutVisits } = await supabase
        .from('visits')
        .select(
          'id, reason, completed_at, pets:patients(name), customers(first_name, last_name)'
        )
        .eq('branch_id', branchId)
        .eq('status', 'ready_for_checkout')
        .order('completed_at', { ascending: true })
        .limit(5);

      for (const v of checkoutVisits || []) {
        const pet = normalizeOneToOne(
          v.pets as { name: string } | { name: string }[] | null
        );
        const cust = normalizeOneToOne(
          v.customers as { first_name: string; last_name: string } | null
        );
        const petName = pet?.name || 'Patient';
        const customerName = cust
          ? `${cust.first_name} ${cust.last_name}`.trim()
          : 'Owner';
        notifications.push({
          id: `checkout-${v.id}`,
          kind: 'checkout',
          title: `${petName} ready for checkout`,
          body: `${customerName} — proceed to billing`,
          href: `/dashboard/invoices/create/${v.id}`,
          priority: 1,
          createdAt: (v.completed_at as string | null) ?? null,
        });
      }

      const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select(
          'id, invoice_number, total, payment_status, created_at, customers(first_name, last_name), pets:patients(name)'
        )
        .eq('branch_id', branchId)
        .in('payment_status', ['unpaid', 'partially_paid'])
        .order('created_at', { ascending: false })
        .limit(5);

      for (const inv of unpaidInvoices || []) {
        const cust = normalizeOneToOne(
          inv.customers as { first_name: string; last_name: string } | null
        );
        const pet = normalizeOneToOne(inv.pets as { name: string } | null);
        const customerName = cust
          ? `${cust.first_name} ${cust.last_name}`.trim()
          : 'Customer';
        const statusLabel =
          inv.payment_status === 'partially_paid' ? 'Partially paid' : 'Unpaid';
        notifications.push({
          id: `unpaid-${inv.id}`,
          kind: 'unpaid_invoice',
          title: `Invoice ${inv.invoice_number} — ${statusLabel}`,
          body: pet?.name
            ? `${pet.name} · ${customerName}`
            : customerName,
          href: `/dashboard/invoices/${inv.id}`,
          priority: 2,
          createdAt: inv.created_at as string,
        });
      }
    }

    if (hasCapability(role, 'manage_inventory')) {
      type ProductRow = {
        id: string;
        name: string;
        stock_quantity: number;
        reorder_level: number;
        type: string;
      };

      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock_quantity, reorder_level, type')
        .eq('branch_id', branchId)
        .is('deleted_at', null)
        .neq('type', 'service')
        .order('stock_quantity', { ascending: true });

      const lowStock = filterLowStockProducts(products as ProductRow[] | null).slice(0, 3);
      for (const p of lowStock) {
        notifications.push({
          id: `low-stock-${p.id}`,
          kind: 'low_stock',
          title: `Low stock: ${p.name}`,
          body: `${p.stock_quantity} left (reorder at ${p.reorder_level})`,
          href: '/dashboard/inventory',
          priority: 3,
        });
      }
    }

    if (hasCapability(role, 'manage_walk_ins')) {
      const { data: emergencies } = await supabase
        .from('visits')
        .select('id, reason, checked_in_at, pets:patients(name), customers(first_name, last_name)')
        .eq('branch_id', branchId)
        .eq('status', 'waiting')
        .eq('is_emergency', true)
        .order('checked_in_at', { ascending: true })
        .limit(3);

      for (const v of emergencies || []) {
        const pet = normalizeOneToOne(
          v.pets as { name: string } | { name: string }[] | null
        );
        const cust = normalizeOneToOne(
          v.customers as { first_name: string; last_name: string } | null
        );
        const petName = pet?.name || 'Patient';
        const customerName = cust
          ? `${cust.first_name} ${cust.last_name}`.trim()
          : 'Owner';
        notifications.push({
          id: `emergency-${v.id}`,
          kind: 'emergency_queue',
          title: `Emergency: ${petName}`,
          body: `${customerName} — ${v.reason || 'Walk-in waiting'}`,
          href: '/dashboard/walk-ins',
          priority: 0,
          createdAt: (v.checked_in_at as string | null) ?? null,
        });
      }
    }

    const sorted = sortDashboardNotifications(notifications).slice(0, MAX_NOTIFICATIONS);
    return {
      success: true,
      notifications: sorted,
      count: notificationBadgeCount(notifications),
    };
  } catch {
    return { success: false, notifications: [], count: 0 };
  }
}
