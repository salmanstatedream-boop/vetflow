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
import { isNotificationKindEnabled, type NotificationPrefs } from '@/lib/dashboard/notification-prefs';
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

    const { data: appSettings } = await supabase
      .from('app_settings')
      .select('notification_prefs')
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle();
    const prefs = (appSettings?.notification_prefs ?? {}) as NotificationPrefs;

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

    if (role === 'doctor' || role === 'clinic_admin') {
      const { data: myAssigned } = await supabase
        .from('visits')
        .select(
          'id, reason, status, checked_in_at, pets:patients(name), customers(first_name, last_name), visit_assignments!inner(doctor_id)'
        )
        .eq('branch_id', branchId)
        .eq('status', 'waiting')
        .eq('visit_assignments.doctor_id', ctx.userId)
        .order('checked_in_at', { ascending: true })
        .limit(5);

      for (const v of myAssigned || []) {
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
          id: `assigned-me-${v.id}`,
          kind: 'assigned_to_me',
          title: `${petName} assigned to you`,
          body: `${customerName} — ${v.reason || 'Consultation'} (${(v.status as string).replace(/_/g, ' ')})`,
          href: `/dashboard/doctors/${v.id}`,
          priority: 0,
          createdAt: (v.checked_in_at as string | null) ?? null,
        });
      }
    }

    if (role === 'clinic_admin') {
      const { data: clinicAssigned } = await supabase
        .from('visits')
        .select(
          `id, reason, status, checked_in_at, pets:patients(name), customers(first_name, last_name),
          visit_assignments!inner(doctor_id, user_profiles(first_name, last_name))`
        )
        .eq('branch_id', branchId)
        .in('status', ['waiting', 'consulting'])
        .order('checked_in_at', { ascending: true })
        .limit(5);

      for (const v of clinicAssigned || []) {
        const pet = normalizeOneToOne(
          v.pets as { name: string } | { name: string }[] | null
        );
        const cust = normalizeOneToOne(
          v.customers as { first_name: string; last_name: string } | null
        );
        const assignment = normalizeOneToOne(
          v.visit_assignments as {
            user_profiles: { first_name: string; last_name: string } | null;
          } | null
        );
        const doc = normalizeOneToOne(assignment?.user_profiles ?? null);
        const petName = pet?.name || 'Patient';
        const customerName = cust
          ? `${cust.first_name} ${cust.last_name}`.trim()
          : 'Owner';
        const doctorName = doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Doctor';
        notifications.push({
          id: `assigned-clinic-${v.id}`,
          kind: 'assigned_in_clinic',
          title: `${petName} — ${doctorName}`,
          body: `${customerName} · ${v.reason || 'Consultation'}`,
          href: `/dashboard/doctors/${v.id}`,
          priority: 1,
          createdAt: (v.checked_in_at as string | null) ?? null,
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

    const filtered = notifications.filter((n) => isNotificationKindEnabled(prefs, n.kind));
    const sorted = sortDashboardNotifications(filtered).slice(0, MAX_NOTIFICATIONS);
    return {
      success: true,
      notifications: sorted,
      count: notificationBadgeCount(filtered),
    };
  } catch {
    return { success: false, notifications: [], count: 0 };
  }
}
