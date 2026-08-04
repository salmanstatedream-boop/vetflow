import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/credentials';
import { isConsultTrackingEnabled } from '@/lib/auth/features';
import {
  buildMedicalActivityDetail,
  formatMedicalActionLabel,
  isDraftSaveActivity,
} from '@/lib/activity/format-medical-activity';
import { fetchAssignableClinicians } from '@/lib/clinical/assignable-clinicians';
import { normalizeOneToOne } from '@/lib/supabase/embed';
import type { LiveConsultRow } from '@/components/dashboard/LiveOperationsPanel';
import type { MedicalActivityRow } from '@/components/dashboard/MedicalRecordActivityPanel';
import type { StaffAttendanceOverviewRow } from '@/components/dashboard/StaffAttendanceOverviewPanel';
import { countLowStockProducts, fetchLowStockProductList } from '@/lib/inventory/low-stock';
import { toLocalDateKey } from '@/lib/utils/timezones';
import { getDemoAdminOverviewData } from './admin-overview.demo';
import type {
  AdminOverviewBundle,
  AdminScheduleItem,
  ChartPoint,
} from './admin-overview.types';

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function last7Days(today: string): string[] {
  const base = new Date(`${today}T12:00:00`);
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function dayLabel(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function mapLiveVisit(v: {
  id: string;
  status: string;
  reason: string;
  consult_started_at: string | null;
  consult_paused_at: string | null;
  consult_pause_reason: string | null;
  consult_pause_accumulated_sec: number;
  checked_in_at: string;
  is_emergency: boolean;
  pets: { name: string; species: string } | { name: string; species: string }[] | null;
  customers: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
  visit_assignments:
    | {
        user_profiles:
          | { first_name: string; last_name: string }
          | { first_name: string; last_name: string }[]
          | null;
      }
    | {
        user_profiles:
          | { first_name: string; last_name: string }
          | { first_name: string; last_name: string }[]
          | null;
      }[]
    | null;
}): LiveConsultRow {
  const pet = Array.isArray(v.pets) ? v.pets[0] : v.pets;
  const cust = Array.isArray(v.customers) ? v.customers[0] : v.customers;
  const assignment = normalizeOneToOne(v.visit_assignments);
  const doc = normalizeOneToOne(assignment?.user_profiles ?? null);
  return {
    id: v.id,
    status: v.status,
    reason: v.reason,
    consultStartedAt: v.consult_started_at,
    consultPausedAt: v.consult_paused_at,
    consultPauseReason: v.consult_pause_reason,
    consultPauseAccumulatedSec: v.consult_pause_accumulated_sec ?? 0,
    checkedInAt: v.checked_in_at,
    petName: pet?.name || 'Unknown',
    petSpecies: pet?.species || 'N/A',
    customerName: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
    doctorName: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'Unassigned',
    isEmergency: v.is_emergency ?? false,
  };
}

export async function loadAdminOverviewBundle(params: {
  organizationId: string;
  branchId: string;
  today: string;
  deviceTimezone: string;
}): Promise<AdminOverviewBundle> {
  if (isDemoMode()) {
    const demo = getDemoAdminOverviewData();
    return {
      ...demo,
      liveActiveConsults: [],
      liveCheckoutQueue: [],
      showConsultTimer: false,
      medicalActivities: [],
      staffAttendanceRows: [],
    };
  }

  const supabase = await createClient();
  const { organizationId, branchId, today, deviceTimezone } = params;
  const monthStart = `${today.slice(0, 7)}-01`;
  const days7 = last7Days(today);
  const yesterday = days7[days7.length - 2]!;
  const prevMonthStart = (() => {
    const d = new Date(`${monthStart}T12:00:00`);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const vaccWindowEnd = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const expiryWindowEnd = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);

  const [
    settingsRes,
    subRes,
    apptTodayRes,
    apptYesterdayRes,
    invoicesRes,
    visitsActiveRes,
    lowStockCount,
    lowStockList,
    customersMtdRes,
    customersPrevMtdRes,
    apptsWeekRes,
    invoicesWeekRes,
    todayApptsRes,
    todayVisitsRes,
    visitsReasonsRes,
    patientsRes,
    expiringRes,
    followUpsRes,
    followUpsCountRes,
    vaccTodayRes,
    vaccYesterdayRes,
    vaccRes,
    missedRes,
    liveActiveRes,
    liveCheckoutRes,
    auditRes,
    staffRes,
    clinicians,
  ] = await Promise.all([
    supabase.from('app_settings').select('currency').eq('organization_id', organizationId).maybeSingle(),
    supabase.from('subscription_status').select('features').eq('organization_id', organizationId).maybeSingle(),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).eq('preferred_date', today),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).eq('preferred_date', yesterday),
    supabase.from('invoices').select('total, payment_status, paid_at, created_at').eq('branch_id', branchId),
    supabase.from('visits').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).in('status', ['waiting', 'consulting']),
    countLowStockProducts(supabase, branchId),
    fetchLowStockProductList(supabase, branchId, 8),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).gte('created_at', `${monthStart}T00:00:00Z`),
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).gte('created_at', `${prevMonthStart}T00:00:00Z`).lt('created_at', `${monthStart}T00:00:00Z`),
    supabase.from('appointments').select('preferred_date').eq('branch_id', branchId).in('preferred_date', days7),
    supabase.from('invoices').select('total, paid_at').eq('branch_id', branchId).eq('payment_status', 'paid').gte('paid_at', `${days7[0]}T00:00:00Z`),
    supabase.from('appointments').select('id, patient_name, customer_name, preferred_time, status, reason, doctor_id').eq('branch_id', branchId).eq('preferred_date', today).order('preferred_time'),
    supabase.from('visits').select(`id, reason, status, checked_in_at, pets:patients(name, species), customers(first_name, last_name), visit_assignments(user_profiles(first_name, last_name))`).eq('branch_id', branchId).in('status', ['waiting', 'consulting', 'ready_for_checkout']).order('checked_in_at'),
    supabase.from('visits').select('reason').eq('branch_id', branchId).gte('checked_in_at', `${days7[0]}T00:00:00Z`).limit(200),
    supabase.from('patients').select('species').eq('organization_id', organizationId),
    supabase.from('products').select('id, name, expiry_date, stock_quantity').eq('branch_id', branchId).eq('track_expiry', true).not('expiry_date', 'is', null).gte('expiry_date', today).lte('expiry_date', expiryWindowEnd).is('deleted_at', null).order('expiry_date').limit(8),
    supabase.from('appointments').select('id, patient_name, customer_name, preferred_date, reason').eq('branch_id', branchId).not('follow_up_of_visit_id', 'is', null).lte('preferred_date', today).in('status', ['requested', 'confirmed', 'rescheduled']).limit(8),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).not('follow_up_of_visit_id', 'is', null).lte('preferred_date', today).in('status', ['requested', 'confirmed', 'rescheduled']),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).eq('visit_purpose', 'vaccination').eq('preferred_date', today),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('branch_id', branchId).eq('visit_purpose', 'vaccination').eq('preferred_date', yesterday),
    supabase.from('appointments').select('id, patient_name, customer_name, preferred_date, reason').eq('branch_id', branchId).eq('visit_purpose', 'vaccination').gte('preferred_date', today).lte('preferred_date', vaccWindowEnd).in('status', ['requested', 'confirmed', 'rescheduled']).order('preferred_date').limit(8),
    supabase.from('appointments').select('id, patient_name, customer_name, preferred_date, reason').eq('branch_id', branchId).eq('status', 'no_show').gte('preferred_date', days7[0]).limit(8),
    supabase.from('visits').select(`id, reason, status, consult_started_at, consult_paused_at, consult_pause_reason, consult_pause_accumulated_sec, checked_in_at, is_emergency, pets:patients(name, species), customers(first_name, last_name), visit_assignments(user_profiles(first_name, last_name))`).eq('branch_id', branchId).in('status', ['waiting', 'consulting']).order('checked_in_at'),
    supabase.from('visits').select(`id, reason, status, consult_started_at, consult_paused_at, consult_pause_reason, consult_pause_accumulated_sec, checked_in_at, is_emergency, pets:patients(name, species), customers(first_name, last_name), visit_assignments(user_profiles(first_name, last_name))`).eq('branch_id', branchId).eq('status', 'ready_for_checkout').order('completed_at'),
    supabase.from('audit_logs').select('id, action, resource_type, created_at, actor_user_id, actor_role, after_data').eq('organization_id', organizationId).eq('branch_id', branchId).in('action', ['CLINICAL_NOTE_CREATED', 'CLINICAL_NOTE_UPDATED', 'PRESCRIPTION_CREATED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'LAB_ORDER_CREATED', 'LAB_ORDER_UPDATED', 'VISIT_READY_FOR_CHECKOUT']).order('created_at', { ascending: false }).limit(12),
    (async () => {
      const admin = await createAdminClient();
      const todayDate = today;
      const { data: members } = await admin.from('organization_members').select('user_id, role, is_active').eq('organization_id', organizationId).eq('is_active', true).neq('role', 'clinic_admin');
      const userIds = (members || []).map((m) => m.user_id);
      if (userIds.length === 0) return { members: [], profiles: [], attendance: [] as { user_id: string; status: string; check_in_at: string | null; check_out_at: string | null }[] };
      const [{ data: profiles }, { data: attendance }] = await Promise.all([
        admin.from('user_profiles').select('id, first_name, last_name').in('id', userIds),
        admin.from('attendance_records').select('user_id, status, check_in_at, check_out_at').eq('organization_id', organizationId).eq('work_date', todayDate),
      ]);
      return { members: members || [], profiles: profiles || [], attendance: attendance || [] };
    })(),
    fetchAssignableClinicians(organizationId),
  ]);

  const currency = (settingsRes.data?.currency as string) || 'USD';
  const featuresJson = (subRes.data?.features as Record<string, unknown>) || null;
  const showConsultTimer = isConsultTrackingEnabled(featuresJson);

  const invoices = invoicesRes.data || [];
  const todayStart = `${today}T00:00:00`;
  const todayEnd = `${today}T23:59:59`;

  const todayRevenue = invoices
    .filter((i) => i.payment_status === 'paid' && i.paid_at && i.paid_at >= todayStart && i.paid_at <= todayEnd)
    .reduce((s, i) => s + Number(i.total || 0), 0);

  const yesterdayRevenue = invoices
    .filter((i) => i.payment_status === 'paid' && i.paid_at && i.paid_at >= `${yesterday}T00:00:00` && i.paid_at <= `${yesterday}T23:59:59`)
    .reduce((s, i) => s + Number(i.total || 0), 0);

  const outstandingReceivables = invoices
    .filter((i) => i.payment_status === 'unpaid' || i.payment_status === 'partially_paid')
    .reduce((s, i) => s + Number(i.total || 0), 0);

  const unpaidCount = invoices.filter((i) => i.payment_status === 'unpaid').length;
  const lowStockTotal = lowStockCount;
  const followUpsTotal = followUpsCountRes.count || 0;
  const vaccinationsToday = vaccTodayRes.count || 0;
  const checkoutCount = (todayVisitsRes.data || []).filter(
    (v) =>
      v.status === 'ready_for_checkout' &&
      v.checked_in_at &&
      toLocalDateKey(v.checked_in_at as string, deviceTimezone) === today
  ).length;

  const apptByDay = new Map<string, number>();
  for (const d of days7) apptByDay.set(d, 0);
  for (const a of apptsWeekRes.data || []) {
    const d = a.preferred_date as string;
    apptByDay.set(d, (apptByDay.get(d) || 0) + 1);
  }

  const revByDay = new Map<string, number>();
  for (const d of days7) revByDay.set(d, 0);
  for (const inv of invoicesWeekRes.data || []) {
    if (!inv.paid_at) continue;
    const d = (inv.paid_at as string).slice(0, 10);
    if (revByDay.has(d)) revByDay.set(d, (revByDay.get(d) || 0) + Number(inv.total || 0));
  }

  const clinicianMap = new Map(clinicians.map((c) => [c.id, `Dr. ${c.firstName} ${c.lastName}`]));
  const schedule: AdminScheduleItem[] = [];

  const checkedInApptIds = (todayApptsRes.data || [])
    .filter((a) => a.status === 'checked_in')
    .map((a) => a.id as string);
  const visitByAppointmentId = new Map<string, string>();
  if (checkedInApptIds.length > 0) {
    const { data: apptVisits } = await supabase
      .from('visits')
      .select('id, appointment_id')
      .eq('branch_id', branchId)
      .in('appointment_id', checkedInApptIds);
    for (const v of apptVisits || []) {
      if (v.appointment_id) visitByAppointmentId.set(v.appointment_id as string, v.id as string);
    }
  }

  for (const a of todayApptsRes.data || []) {
    const visitId = visitByAppointmentId.get(a.id as string);
    const href =
      a.status === 'checked_in' && visitId
        ? `/dashboard/doctors/${visitId}`
        : '/dashboard/appointments';
    schedule.push({
      id: a.id,
      type: 'appointment',
      time: (a.preferred_time as string)?.slice(0, 5) || '—',
      petName: (a.patient_name as string) || 'Unknown',
      species: null,
      customerName: (a.customer_name as string) || 'Unknown',
      reason: (a.reason as string) || 'Appointment',
      status: a.status as string,
      doctorName: a.doctor_id ? clinicianMap.get(a.doctor_id as string) : undefined,
      href,
    });
  }

  for (const v of todayVisitsRes.data || []) {
    if (
      !v.checked_in_at ||
      toLocalDateKey(v.checked_in_at as string, deviceTimezone) !== today
    ) {
      continue;
    }
    const pet = normalizeOneToOne(v.pets as { name: string; species: string } | null);
    const cust = normalizeOneToOne(v.customers as { first_name: string; last_name: string } | null);
    const assignment = normalizeOneToOne(v.visit_assignments as { user_profiles: { first_name: string; last_name: string } } | null);
    const doc = normalizeOneToOne(assignment?.user_profiles ?? null);
    schedule.push({
      id: v.id,
      type: 'visit',
      time: v.checked_in_at ? new Date(v.checked_in_at as string).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '—',
      petName: pet?.name || 'Unknown',
      species: pet?.species || null,
      customerName: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
      reason: (v.reason as string) || 'Walk-in',
      status: v.status as string,
      doctorName: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : undefined,
      href: '/dashboard/walk-ins',
    });
  }

  schedule.sort((a, b) => a.time.localeCompare(b.time));

  const assignedConsultations = (liveActiveRes.data || [])
    .map((v) => {
      const assignment = normalizeOneToOne(
        v.visit_assignments as {
          user_profiles: { first_name: string; last_name: string } | null;
        } | null
      );
      const doc = normalizeOneToOne(assignment?.user_profiles ?? null);
      if (!doc) return null;
      const pet = normalizeOneToOne(v.pets as { name: string; species: string } | null);
      const cust = normalizeOneToOne(v.customers as { first_name: string; last_name: string } | null);
      return {
        id: v.id as string,
        petName: pet?.name || 'Unknown',
        customerName: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
        doctorName: `Dr. ${doc.first_name} ${doc.last_name}`,
        status: v.status as string,
        href: `/dashboard/doctors/${v.id}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const reasonCounts = new Map<string, number>();
  for (const v of visitsReasonsRes.data || []) {
    const r = ((v.reason as string) || 'General').trim().slice(0, 40);
    reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1);
  }
  const visitReasons: ChartPoint[] = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const speciesCounts = new Map<string, number>();
  for (const p of patientsRes.data || []) {
    const s = ((p.species as string) || 'Other').trim() || 'Other';
    speciesCounts.set(s, (speciesCounts.get(s) || 0) + 1);
  }
  const speciesBreakdown: ChartPoint[] = [...speciesCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const bookedToday = apptTodayRes.count || 0;
  const slotCapacity = Math.max(clinicians.length * 8, 8);

  const aiInsights: string[] = [];
  const revTrend = pctChange(todayRevenue, yesterdayRevenue);
  if (revTrend != null) {
    aiInsights.push(`Today's revenue is ${revTrend >= 0 ? 'up' : 'down'} ${Math.abs(revTrend).toFixed(0)}% vs yesterday.`);
  }
  if (lowStockTotal > 0) {
    aiInsights.push(`${lowStockTotal} inventory item(s) are at or below reorder level.`);
  }
  if (followUpsTotal > 0) {
    aiInsights.push(`${followUpsTotal} follow-up appointment(s) need attention.`);
  }
  if (bookedToday / slotCapacity < 0.5) {
    aiInsights.push('Appointment utilization is below 50% — consider outreach or promotions.');
  }

  const actorIds = [...new Set((auditRes.data || []).map((l) => l.actor_user_id).filter(Boolean))] as string[];
  const actorMap = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: actors } = await supabase.from('user_profiles').select('id, first_name, last_name').in('id', actorIds);
    for (const a of actors || []) {
      actorMap.set(a.id, `${a.first_name} ${a.last_name}`.trim());
    }
  }

  const medicalActivities: MedicalActivityRow[] = (auditRes.data || [])
    .filter((log) => !isDraftSaveActivity(log.after_data as Record<string, unknown> | null))
    .map((log) => {
      const after = log.after_data as Record<string, unknown> | null;
      return {
        id: log.id,
        action: log.action,
        actorName: actorMap.get(log.actor_user_id) || 'Staff',
        actorRole: log.actor_role || 'staff',
        resourceType: log.resource_type,
        createdAt: log.created_at,
        summary: buildMedicalActivityDetail(after, log.resource_type),
        label: formatMedicalActionLabel(log.action),
        petName: typeof after?.patient_name === 'string' ? after.patient_name : undefined,
      };
    });

  const nameById = new Map(
    (staffRes.profiles || []).map((p) => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()])
  );
  const attendanceByUser = new Map<
    string,
    { user_id: string; status: string; check_in_at: string | null; check_out_at: string | null }
  >((staffRes.attendance || []).map((a) => [a.user_id, a]));

  const staffAttendanceRows: StaffAttendanceOverviewRow[] = (staffRes.members || []).map((m) => {
    const rec = attendanceByUser.get(m.user_id);
    let rosterStatus: StaffAttendanceOverviewRow['rosterStatus'] = 'not_scheduled';
    if (rec?.check_in_at && !rec.check_out_at) {
      rosterStatus = rec.status === 'late' ? 'late' : 'on_shift';
    } else if (rec?.check_in_at && rec.check_out_at) {
      rosterStatus = rec.status === 'late' ? 'late' : 'present';
    } else if (rec?.status === 'absent') {
      rosterStatus = 'absent';
    }
    return {
      userId: m.user_id,
      staffName: nameById.get(m.user_id) || 'Unknown',
      role: m.role,
      checkInAt: rec?.check_in_at ?? null,
      checkOutAt: rec?.check_out_at ?? null,
      rosterStatus,
    };
  });

  const kpis = {
    todayAppointments: apptTodayRes.count || 0,
    todayRevenue,
    outstandingReceivables,
    inClinicNow: visitsActiveRes.count || 0,
    inventoryAlerts: lowStockTotal,
    newClientsMtd: customersMtdRes.count || 0,
    vaccinationsToday,
  };

  return {
    currency,
    today,
    kpis,
    kpiTrends: {
      todayAppointments: pctChange(apptTodayRes.count || 0, apptYesterdayRes.count || 0),
      todayRevenue: pctChange(todayRevenue, yesterdayRevenue),
      outstandingReceivables: null,
      inClinicNow: null,
      inventoryAlerts: null,
      newClientsMtd: pctChange(customersMtdRes.count || 0, customersPrevMtdRes.count || 0),
      vaccinationsToday: pctChange(vaccinationsToday, vaccYesterdayRes.count || 0),
    },
    sparklines: {
      appointments: days7.map((d) => apptByDay.get(d) || 0),
      revenue: days7.map((d) => revByDay.get(d) || 0),
    },
    todaySchedule: schedule.slice(0, 12),
    assignedConsultations,
    actionCenter: [
      { id: 'unpaid', label: 'Unpaid invoices', count: unpaidCount, href: '/dashboard/invoices?status=unpaid', variant: 'warning' as const },
      { id: 'stock', label: 'Low stock items', count: lowStockTotal, href: '/dashboard/inventory?lowStock=1', variant: 'danger' as const },
      { id: 'checkout', label: 'Ready for checkout', count: checkoutCount, href: '/dashboard/walk-ins', variant: 'info' as const },
      { id: 'followups', label: 'Follow-ups due', count: followUpsTotal, href: '/dashboard/appointments?tab=followup', variant: 'purple' as const },
    ],
    revenueTrend7d: days7.map((d) => ({ name: dayLabel(d), value: revByDay.get(d) || 0 })),
    utilization: { booked: bookedToday, total: slotCapacity },
    visitReasons,
    speciesBreakdown,
    lowStockItems: lowStockList.map((p) => {
      const cat = normalizeOneToOne(p.product_categories as { name: string } | null);
      return {
        id: p.id,
        name: p.name,
        category: cat?.name || '—',
        stock: p.stock_quantity,
        reorderLevel: p.reorder_level,
      };
    }),
    expiringSoon: (expiringRes.data || []).map((p) => ({
      id: p.id as string,
      productName: p.name as string,
      expiryDate: p.expiry_date as string,
      quantity: (p.stock_quantity as number) ?? 0,
    })),
    followUpsDue: (followUpsRes.data || []).map((a) => ({
      id: a.id,
      petName: a.patient_name as string,
      customerName: a.customer_name as string,
      date: a.preferred_date as string,
      reason: (a.reason as string) || 'Follow-up',
    })),
    vaccinationsDue: (vaccRes.data || []).map((a) => ({
      id: a.id,
      petName: a.patient_name as string,
      customerName: a.customer_name as string,
      date: a.preferred_date as string,
      reason: (a.reason as string) || 'Vaccination',
    })),
    missedAppointments: (missedRes.data || []).map((a) => ({
      id: a.id,
      petName: a.patient_name as string,
      customerName: a.customer_name as string,
      date: a.preferred_date as string,
      reason: (a.reason as string) || 'No show',
    })),
    aiInsights,
    notificationCount: unpaidCount + lowStockTotal,
    liveActiveConsults: (liveActiveRes.data || []).map(mapLiveVisit),
    liveCheckoutQueue: (liveCheckoutRes.data || []).map(mapLiveVisit),
    showConsultTimer,
    medicalActivities,
    staffAttendanceRows,
  };
}
