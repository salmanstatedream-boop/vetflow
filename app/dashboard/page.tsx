import { resolveServerAuthContext } from '@/lib/auth/context';
import { canAccessRoute, canShowWidget, hasCapability, getCapabilitiesForRole } from '@/lib/auth/capabilities';
import { canAccessRouteByFeature } from '@/lib/auth/features';
import { createClient } from '@/lib/supabase/server';
import { isDemoMode } from '@/lib/demo/credentials';
import {
  MOCK_DASHBOARD_KPIS,
  MOCK_LOW_STOCK_ITEMS,
  MOCK_RECENT_VISITS,
} from '@/lib/demo/mock-data';
import { getActiveBranchName } from '@/lib/dashboard/resolve-active-branch';
import RoleDashboardHero from '@/components/dashboard/RoleDashboardHero';
import DashboardWidgetGrid, {
  type DashboardKpi,
} from '@/components/dashboard/DashboardWidgetGrid';
import AttendanceWidgetClient, {
  type MyAttendance,
} from '@/components/dashboard/AttendanceWidgetClient';
import EmptyState from '@/components/ui/premium/EmptyState';
import ReceptionistHomeClient, {
  type ReceptionistAppointmentRow,
  type ReceptionistVisitRow,
  type VisitRecordRow,
} from '@/components/dashboard/ReceptionistHomeClient';
import LiveOperationsPanel, {
  type LiveConsultRow,
} from '@/components/dashboard/LiveOperationsPanel';
import MedicalRecordActivityPanel, {
  type MedicalActivityRow,
} from '@/components/dashboard/MedicalRecordActivityPanel';
import {
  buildMedicalActivityDetail,
  formatMedicalActionLabel,
  isDraftSaveActivity,
} from '@/lib/activity/format-medical-activity';
import { isConsultTrackingEnabled } from '@/lib/auth/features';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ClipboardList,
  Receipt,
  BadgeCheck,
  Banknote,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Heart,
  Stethoscope,
  Activity,
  Clock,
  FileText,
  BriefcaseMedical,
  Search,
  Layers,
  Bot,
  Share2,
} from 'lucide-react';
import type { UserSessionDetails } from '@/lib/services/auth';
import { getTimeGreeting } from '@/lib/utils/greeting';
import { normalizeOneToOne } from '@/lib/supabase/embed';
import { resolveDateFromParam } from '@/lib/utils/date-filters';
import { formatMoney } from '@/lib/utils/currency';
import DashboardQabShell from '@/components/dashboard/DashboardQabShell';
import StaffDashboardGate from '@/components/dashboard/StaffDashboardGate';
import StaffAttendanceOverviewPanel, {
  type StaffAttendanceOverviewRow,
} from '@/components/dashboard/StaffAttendanceOverviewPanel';
import DoctorQueuePanel, {
  type DoctorQueueVisit,
} from '@/components/dashboard/DoctorQueuePanel';
import { fetchAssignableClinicians } from '@/lib/clinical/assignable-clinicians';
import { loadAdminOverviewBundle } from '@/lib/dashboard/admin-overview';
import type { AdminOverviewBundle } from '@/lib/dashboard/admin-overview.types';
import ClinicAdminDashboardClient from '@/components/dashboard/ClinicAdminDashboardClient';

export const metadata = {
  title: 'Dashboard — Overview',
  description: 'Clinic overview with key performance indicators and quick actions.',
};

type VisitRow = {
  id: string;
  reason: string | null;
  status: string;
  checked_in_at: string | null;
  pets: { name: string; species: string } | null;
  customers: { first_name: string; last_name: string } | null;
};

export default async function DashboardOverview({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const filterDate = resolveDateFromParam(dateParam);
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');
  if (ctx.isSuperAdmin && !ctx.isImpersonating) redirect('/super-admin/dashboard');

  const session = ctx;
  const activeBranchId = ctx.activeBranchId;
  const role = session.role;
  const greeting = getTimeGreeting();

  if (!activeBranchId) {
    return (
      <div className="space-y-8">
        <RoleDashboardHero
          firstName={session.firstName || 'User'}
          greeting={greeting}
          organizationName={session.organizationName}
          role={role}
          variant={role === 'clinic_admin' ? 'compact' : 'default'}
        />
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm p-6 rounded-2xl">
          {ctx.isImpersonating ? (
            <>
              This clinic has no active branches yet. Finish provisioning from{' '}
              <Link href="/super-admin/organizations" className="text-primary font-semibold hover:underline">
                Clinics
              </Link>{' '}
              (add a branch) before dashboard metrics can load.
            </>
          ) : (
            <>
              You must be assigned to a clinic branch to view dashboard metrics. Please contact your
              clinic administrator to get branch access.
            </>
          )}
        </div>
      </div>
    );
  }

  const today = filterDate;

  let todayAppointments = 0;
  let waitingWalkIns = 0;
  let unpaidInvoices = 0;
  let lowStockItems: { id: string; name: string; stock_quantity: number; reorder_level: number }[] =
    [];
  let recentVisits: VisitRow[] = [];
  let totalCustomers = 0;
  let totalPets = 0;
  let readyForCheckout = 0;
  let myQueueCount = 0;
  let activeConsultations = 0;
  let emergencyCount = 0;
  let openPrescriptions = 0;
  let receptionistUpcoming: ReceptionistAppointmentRow[] = [];
  let receptionistWaiting: ReceptionistVisitRow[] = [];
  let receptionistConsulting: ReceptionistVisitRow[] = [];
  let receptionistCheckout: ReceptionistVisitRow[] = [];
  let receptionistVisitRecords: VisitRecordRow[] = [];
  let myAttendance: MyAttendance = {
    checkedIn: false,
    checkedOut: false,
    status: null,
    checkInAt: null,
    checkOutAt: null,
  };
  let liveActiveConsults: LiveConsultRow[] = [];
  let liveCheckoutQueue: LiveConsultRow[] = [];
  let medicalActivities: MedicalActivityRow[] = [];
  let showConsultTimer = false;
  let featuresJson: Record<string, unknown> | null = null;
  let doctors: { id: string; firstName: string; lastName: string }[] = [];
  const staffAttendanceRows: StaffAttendanceOverviewRow[] = [];
  let doctorQueueWaiting: DoctorQueueVisit[] = [];
  let doctorQueueConsulting: DoctorQueueVisit[] = [];
  let productCategories: { id: string; name: string }[] = [];
  let adminOverview: AdminOverviewBundle | null = null;
  const netRevenueMtd: number | null = null;
  const clinicCurrency = 'USD';
  const showAttendance = hasCapability(role, 'mark_attendance');

  if (isDemoMode()) {
    todayAppointments = MOCK_DASHBOARD_KPIS.todayAppointments;
    waitingWalkIns = MOCK_DASHBOARD_KPIS.waitingWalkIns;
    unpaidInvoices = MOCK_DASHBOARD_KPIS.unpaidInvoices;
    lowStockItems = MOCK_LOW_STOCK_ITEMS;
    recentVisits = MOCK_RECENT_VISITS as VisitRow[];
    totalCustomers = MOCK_DASHBOARD_KPIS.totalCustomers;
    totalPets = MOCK_DASHBOARD_KPIS.totalPets;
    myQueueCount = 2;
    activeConsultations = 1;
    emergencyCount = 1;
    openPrescriptions = 3;
    readyForCheckout = 1;
    if (role === 'receptionist') {
      receptionistUpcoming = [
        {
          id: 'ap1',
          petName: 'Max',
          customerName: 'John Doe',
          customerPhone: '555-9090',
          preferredTime: '10:00',
          isEmergency: false,
        },
        {
          id: 'ap2',
          petName: 'Bella',
          customerName: 'Jane Smith',
          customerPhone: '555-8080',
          preferredTime: '14:30',
          isEmergency: true,
        },
      ];
      receptionistWaiting = [
        { id: 'v1', petName: 'Bella', customerName: 'Jane Smith', reason: 'Ear check', status: 'waiting' },
      ];
      receptionistCheckout = [
        { id: 'v3', petName: 'Rocky', customerName: 'Bob Johnson', reason: 'Vaccination', status: 'ready_for_checkout' },
      ];
    }
  } else {
    const supabase = await createClient();
    const queries: Promise<void>[] = [];

    if (canShowWidget(role, 'todayAppointments')) {
      queries.push(
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .eq('preferred_date', today)
          .then((r) => {
            todayAppointments = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'waitingWalkIns')) {
      queries.push(
        supabase
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .in('status', ['waiting', 'consulting'])
          .then((r) => {
            waitingWalkIns = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'readyForCheckout')) {
      queries.push(
        supabase
          .from('visits')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .eq('status', 'ready_for_checkout')
          .then((r) => {
            readyForCheckout = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'unpaidInvoices')) {
      queries.push(
        supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .eq('payment_status', 'unpaid')
          .then((r) => {
            unpaidInvoices = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'lowStock')) {
      queries.push(
        supabase
          .from('products')
          .select('id, name, stock_quantity, reorder_level')
          .eq('branch_id', activeBranchId)
          .eq('is_active', true)
          .filter('stock_quantity', 'lte', 'reorder_level')
          .limit(5)
          .then((r) => {
            lowStockItems = r.data || [];
          })
      );
    }

    if (canShowWidget(role, 'totalCustomers')) {
      queries.push(
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .then((r) => {
            totalCustomers = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'totalPets')) {
      queries.push(
        supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', session.organizationId || '')
          .then((r) => {
            totalPets = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'clinicalQueue') && role === 'doctor') {
      queries.push(
        supabase
          .from('visits')
          .select(`
            id, reason, status, checked_in_at, consult_started_at, consult_paused_at, consult_pause_reason, consult_pause_accumulated_sec, is_emergency, triage_notes,
            pets:patients ( id, name, species, breed ),
            customers ( first_name, last_name ),
            visit_assignments!inner ( doctor_id )
          `)
          .eq('visit_assignments.doctor_id', session.userId)
          .in('status', ['waiting', 'consulting'])
          .order('is_emergency', { ascending: false })
          .order('checked_in_at', { ascending: true })
          .then((r) => {
            const mapped =
              r.data?.map((v) => ({
                id: v.id,
                reason: v.reason,
                status: v.status,
                checkedInAt: v.checked_in_at as string,
                consultStartedAt: v.consult_started_at as string | null,
                consultPausedAt: v.consult_paused_at as string | null,
                consultPauseReason: v.consult_pause_reason as string | null,
                consultPauseAccumulatedSec: (v.consult_pause_accumulated_sec as number) ?? 0,
                isEmergency: v.is_emergency ?? false,
                triageNotes: v.triage_notes as string | null,
                pet: {
                  id: (v.pets as { id: string; name: string; species: string; breed: string | null }).id,
                  name: (v.pets as { name: string }).name,
                  species: (v.pets as { species: string }).species,
                  breed: (v.pets as { breed: string | null }).breed,
                },
                customer: {
                  firstName: (v.customers as { first_name: string }).first_name,
                  lastName: (v.customers as { last_name: string }).last_name,
                },
              })) || [];
            doctorQueueWaiting = mapped.filter((x) => x.status === 'waiting');
            doctorQueueConsulting = mapped.filter((x) => x.status === 'consulting');
            myQueueCount = mapped.length;
          })
      );
      queries.push(
        supabase
          .from('visits')
          .select('id, visit_assignments!inner(doctor_id)', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .eq('visit_assignments.doctor_id', session.userId)
          .eq('status', 'consulting')
          .then((r) => {
            activeConsultations = r.count || 0;
          })
      );
      queries.push(
        supabase
          .from('visits')
          .select('id, visit_assignments!inner(doctor_id)', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .eq('visit_assignments.doctor_id', session.userId)
          .eq('is_emergency', true)
          .in('status', ['waiting', 'consulting'])
          .then((r) => {
            emergencyCount = r.count || 0;
          })
      );
    }

    if (canShowWidget(role, 'openPrescriptions')) {
      queries.push(
        supabase
          .from('prescriptions')
          .select('id', { count: 'exact', head: true })
          .eq('branch_id', activeBranchId)
          .then((r) => {
            openPrescriptions = r.count || 0;
          })
      );
    }

    let visitsQuery = supabase
      .from('visits')
      .select(
        `
        id, reason, status, checked_in_at, is_emergency,
        pets:patients ( name, species ),
        customers ( first_name, last_name )
        ${role === 'doctor' ? ', visit_assignments!inner ( doctor_id )' : ''}
      `
      )
      .eq('branch_id', activeBranchId)
      .order('checked_in_at', { ascending: false })
      .limit(5);

    if (role === 'doctor') {
      visitsQuery = visitsQuery.eq('visit_assignments.doctor_id', session.userId);
    }

    queries.push(
      visitsQuery.then((r) => {
        recentVisits = (r.data as VisitRow[]) || [];
      })
    );

    if (role === 'receptionist') {
      const mapVisit = (v: {
        id: string;
        reason: string;
        status: string;
        pets: { name: string } | { name: string }[] | null;
        customers: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
      }): ReceptionistVisitRow => {
        const pet = Array.isArray(v.pets) ? v.pets[0] : v.pets;
        const cust = Array.isArray(v.customers) ? v.customers[0] : v.customers;
        return {
          id: v.id,
          petName: pet?.name || 'Unknown',
          customerName: cust ? `${cust.first_name} ${cust.last_name}` : 'Unknown',
          reason: v.reason,
          status: v.status,
        };
      };

      queries.push(
        supabase
          .from('appointments')
          .select('id, patient_name, customer_name, customer_phone, preferred_time, is_emergency')
          .eq('branch_id', activeBranchId)
          .eq('preferred_date', today)
          .in('status', ['confirmed', 'rescheduled', 'requested'])
          .order('preferred_time', { ascending: true })
          .limit(5)
          .then((r) => {
            receptionistUpcoming =
              r.data?.map((a) => ({
                id: a.id,
                petName: a.patient_name,
                customerName: a.customer_name,
                customerPhone: a.customer_phone || '',
                preferredTime: a.preferred_time?.slice(0, 5) || '',
                isEmergency: a.is_emergency ?? false,
              })) || [];
          })
      );
      queries.push(
        supabase
          .from('visits')
          .select('id, reason, status, pets:patients(name), customers(first_name, last_name)')
          .eq('branch_id', activeBranchId)
          .eq('status', 'waiting')
          .order('checked_in_at', { ascending: true })
          .limit(5)
          .then((r) => {
            receptionistWaiting = (r.data || []).map(mapVisit);
          })
      );
      queries.push(
        supabase
          .from('visits')
          .select(`
            id, reason, status, consult_paused_at, consult_pause_reason,
            pets:patients(name),
            customers(first_name, last_name),
            visit_assignments(user_profiles(first_name, last_name))
          `)
          .eq('branch_id', activeBranchId)
          .eq('status', 'consulting')
          .order('consult_started_at', { ascending: false })
          .limit(5)
          .then((r) => {
            receptionistConsulting = (r.data || []).map((v) => {
              const base = mapVisit(v);
              const assignment = normalizeOneToOne(
                v.visit_assignments as
                  | { user_profiles: { first_name: string; last_name: string } | null }
                  | { user_profiles: { first_name: string; last_name: string } | null }[]
                  | null
              );
              const doc = normalizeOneToOne(assignment?.user_profiles ?? null);
              return {
                ...base,
                doctorName: doc ? `Dr. ${doc.first_name} ${doc.last_name}` : undefined,
                consultPausedAt: v.consult_paused_at as string | null,
                consultPauseReason: v.consult_pause_reason as string | null,
              };
            });
          })
      );
      queries.push(
        supabase
          .from('visits')
          .select('id, reason, status, pets:patients(name), customers(first_name, last_name)')
          .eq('branch_id', activeBranchId)
          .eq('status', 'ready_for_checkout')
          .order('checked_in_at', { ascending: true })
          .limit(5)
          .then((r) => {
            receptionistCheckout = (r.data || []).map(mapVisit);
          })
      );
      queries.push(
        supabase
          .from('invoices')
          .select(
            'id, invoice_number, visit_id, sale_type, total, payment_status, created_at, customers(first_name, last_name), pets:patients(name)'
          )
          .eq('branch_id', activeBranchId)
          .order('created_at', { ascending: false })
          .limit(50)
          .then((r) => {
            receptionistVisitRecords =
              r.data?.map((inv) => {
                const cust = Array.isArray(inv.customers) ? inv.customers[0] : inv.customers;
                const pet = Array.isArray(inv.pets) ? inv.pets[0] : inv.pets;
                return {
                  id: inv.id,
                  invoiceNumber: inv.invoice_number,
                  visitId: inv.visit_id,
                  saleType: (inv.sale_type as 'clinical' | 'retail') || (inv.visit_id ? 'clinical' : 'retail'),
                  customerName: cust
                    ? `${(cust as { first_name: string }).first_name} ${(cust as { last_name: string }).last_name}`
                    : 'Unknown',
                  petName: (pet as { name?: string } | null)?.name || '—',
                  total: Number(inv.total) || 0,
                  paymentStatus: inv.payment_status,
                  createdAt: inv.created_at,
                };
              }) || [];
          })
      );
    }

    if (role === 'clinic_admin' || role === 'receptionist') {
      const { data: subRow } = await supabase
        .from('subscription_status')
        .select('features')
        .eq('organization_id', session.organizationId || '')
        .maybeSingle();
      featuresJson = (subRow?.features as Record<string, unknown>) || null;
      showConsultTimer = isConsultTrackingEnabled(featuresJson);
    }

    if (role === 'clinic_admin' || role === 'receptionist' || role === 'doctor') {
      const clinicians = await fetchAssignableClinicians(session.organizationId || '');
      doctors = clinicians.map((d) => ({
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
      }));
    }

    if (role === 'receptionist') {
      const mapLiveVisit = (v: {
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
        visit_assignments: { user_profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null } | { user_profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null }[] | null;
      }): LiveConsultRow => {
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
      };

      queries.push(
        supabase
          .from('visits')
          .select(`
            id, reason, status, consult_started_at, consult_paused_at, consult_pause_reason, consult_pause_accumulated_sec, checked_in_at, is_emergency,
            pets:patients ( name, species ),
            customers ( first_name, last_name ),
            visit_assignments ( user_profiles ( first_name, last_name ) )
          `)
          .eq('branch_id', activeBranchId)
          .in('status', ['waiting', 'consulting'])
          .order('checked_in_at', { ascending: true })
          .then((r) => {
            liveActiveConsults = (r.data || []).map(mapLiveVisit);
          })
      );

      queries.push(
        supabase
          .from('visits')
          .select(`
            id, reason, status, consult_started_at, consult_paused_at, consult_pause_reason, consult_pause_accumulated_sec, checked_in_at, is_emergency,
            pets:patients ( name, species ),
            customers ( first_name, last_name ),
            visit_assignments ( user_profiles ( first_name, last_name ) )
          `)
          .eq('branch_id', activeBranchId)
          .eq('status', 'ready_for_checkout')
          .order('completed_at', { ascending: true })
          .then((r) => {
            liveCheckoutQueue = (r.data || []).map(mapLiveVisit);
          })
      );

      queries.push(
        supabase
          .from('audit_logs')
          .select('id, action, resource_type, created_at, actor_user_id, actor_role, after_data')
          .eq('organization_id', session.organizationId || '')
          .eq('branch_id', activeBranchId)
          .in('action', [
            'CLINICAL_NOTE_CREATED',
            'CLINICAL_NOTE_UPDATED',
            'PRESCRIPTION_CREATED',
            'DOCUMENT_UPLOADED',
            'DOCUMENT_DELETED',
            'LAB_ORDER_CREATED',
            'LAB_ORDER_UPDATED',
            'VISIT_READY_FOR_CHECKOUT',
          ])
          .order('created_at', { ascending: false })
          .limit(12)
          .then(async (r) => {
            const logs = r.data || [];
            const actorIds = [...new Set(logs.map((l) => l.actor_user_id).filter(Boolean))] as string[];
            const actorMap = new Map<string, string>();
            if (actorIds.length > 0) {
              const { data: actors } = await supabase
                .from('user_profiles')
                .select('id, first_name, last_name')
                .in('id', actorIds);
              for (const a of actors || []) {
                actorMap.set(a.id, `${a.first_name} ${a.last_name}`.trim());
              }
            }
            medicalActivities = logs
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
          })
      );
    }

    if (showAttendance && session.organizationId) {
      const todayDate = new Date().toISOString().slice(0, 10);
      queries.push(
        supabase
          .from('attendance_records')
          .select('status, check_in_at, check_out_at')
          .eq('organization_id', session.organizationId)
          .eq('user_id', session.userId)
          .eq('work_date', todayDate)
          .maybeSingle()
          .then((r) => {
            const rec = r.data as
              | { status: string | null; check_in_at: string | null; check_out_at: string | null }
              | null;
            if (rec) {
              myAttendance = {
                checkedIn: Boolean(rec.check_in_at),
                checkedOut: Boolean(rec.check_out_at),
                status: rec.status,
                checkInAt: rec.check_in_at,
                checkOutAt: rec.check_out_at,
              };
            }
          })
      );
    }

    if (hasCapability(role, 'manage_inventory') && session.organizationId) {
      queries.push(
        supabase
          .from('product_categories')
          .select('id, name')
          .eq('organization_id', session.organizationId)
          .then((r) => {
            productCategories = r.data || [];
          })
      );
    }

    await Promise.all(queries);

    if (role === 'clinic_admin' && session.organizationId && activeBranchId) {
      adminOverview = await loadAdminOverviewBundle({
        organizationId: session.organizationId,
        branchId: activeBranchId,
        today: filterDate,
      });
    }
  }

  const features = session.features;
  const canLink = (href: string) =>
    canAccessRoute(role, href) && canAccessRouteByFeature(features, href);

  const netRevenueMtdLabel =
    netRevenueMtd !== null ? formatMoney(netRevenueMtd, clinicCurrency) : null;

  const kpis = buildKpis(role, {
    todayAppointments,
    waitingWalkIns,
    readyForCheckout,
    unpaidInvoices,
    lowStockCount: lowStockItems.length,
    myQueueCount,
    activeConsultations,
    emergencyCount,
    openPrescriptions,
    totalCustomers,
    totalPets,
    netRevenueMtdLabel,
  }, canLink);
  const quickActions =
    role === 'clinic_admin' || role === 'receptionist' || role === 'doctor'
      ? []
      : buildQuickActions(role, readyForCheckout, canLink);
  const showLowStock = canShowWidget(role, 'lowStock') && lowStockItems.length > 0;
  const showSecondary =
    canShowWidget(role, 'totalCustomers') ||
    canShowWidget(role, 'totalPets') ||
    role === 'clinic_admin';

  const staffGateLocked =
    role !== 'clinic_admin' && role !== 'doctor' && showAttendance && !myAttendance.checkedIn;

  return (
    <div className="space-y-8">
      <RoleDashboardHero
        firstName={session.firstName || 'User'}
        greeting={greeting}
        organizationName={session.organizationName}
        role={role}
        variant={role === 'clinic_admin' ? 'compact' : 'default'}
      />

      {showAttendance && role !== 'clinic_admin' && (
        <AttendanceWidgetClient initial={myAttendance} />
      )}

      <StaffDashboardGate locked={staffGateLocked}>
      {role === 'clinic_admin' && adminOverview ? (
        <ClinicAdminDashboardClient
          {...adminOverview}
          role={role}
          capabilities={getCapabilitiesForRole(role)}
          features={session.features}
          featuresJson={featuresJson}
          doctors={doctors}
          activeBranchId={activeBranchId}
          organizationId={session.organizationId || ''}
          clinicName={session.organizationName || 'Clinic'}
          branches={ctx.branches}
          categories={productCategories}
        />
      ) : (
        <>
      <DashboardQabShell
        role={role}
        capabilities={getCapabilitiesForRole(role)}
        features={session.features}
        featuresJson={featuresJson}
        doctors={doctors}
        activeBranchId={activeBranchId}
        organizationId={session.organizationId || ''}
        clinicName={session.organizationName || 'Clinic'}
        liveActiveConsults={liveActiveConsults}
        liveCheckoutQueue={liveCheckoutQueue}
        showConsultTimer={showConsultTimer}
        branches={session.branches}
        categories={productCategories}
      />

      {role === 'doctor' && !staffGateLocked && (
        <DoctorQueuePanel
          waitingVisits={doctorQueueWaiting}
          consultingVisits={doctorQueueConsulting}
          showConsultTimer={showConsultTimer}
          compact
        />
      )}

      {kpis.length > 0 && role !== 'receptionist' && role !== 'doctor' && (
        <DashboardWidgetGrid kpis={kpis} />
      )}

      {role === 'clinic_admin' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <LiveOperationsPanel
            activeConsults={liveActiveConsults}
            readyForCheckout={liveCheckoutQueue}
            showConsultTimer={showConsultTimer}
          />
          <MedicalRecordActivityPanel activities={medicalActivities} />
        </div>
      )}

      {role === 'clinic_admin' && (
        <StaffAttendanceOverviewPanel
          rows={staffAttendanceRows}
          attendanceDate={new Date().toISOString().slice(0, 10)}
        />
      )}

      {role === 'receptionist' && (
        <ReceptionistHomeClient
          upcomingAppointments={receptionistUpcoming}
          waitingVisits={receptionistWaiting}
          consultingVisits={receptionistConsulting}
          checkoutVisits={receptionistCheckout}
          visitRecords={receptionistVisitRecords}
          activeBranchId={activeBranchId}
          branches={ctx.branches}
          doctors={doctors}
        />
      )}

      {showSecondary && role !== 'receptionist' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {canShowWidget(role, 'totalCustomers') && (
            <SecondaryStat icon={Users} label="Total Customers" value={totalCustomers} />
          )}
          {canShowWidget(role, 'totalPets') && (
            <SecondaryStat icon={Heart} label="Total Pets" value={totalPets} />
          )}
          <div className="col-span-2 lg:col-span-1 glass-panel rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                Active Branch
              </span>
              <span className="text-sm font-bold text-on-surface truncate block">
                {getActiveBranchName(ctx) || 'No branch'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {quickActions.length > 0 && (
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <QuickAction
                  key={action.key}
                  href={action.href}
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                />
              ))}
            </div>
          </div>
        )}

        <div className={quickActions.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4">
            Recent Activity
          </h3>
          <div className="glass-panel rounded-2xl overflow-hidden">
            {recentVisits.length > 0 ? (
              <div className="divide-y divide-outline-variant/30">
                {recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="px-5 py-4 flex items-center justify-between hover:bg-surface-container/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(visit.status)}`} />
                      <div>
                        <span className="text-xs font-bold text-on-surface block">
                          {visit.pets?.name || 'Unknown Pet'}{' '}
                          <span className="text-on-surface-variant font-normal">
                            ({visit.pets?.species || 'N/A'})
                          </span>
                        </span>
                        <span className="text-[10px] text-on-surface-variant block">
                          Owner: {visit.customers?.first_name} {visit.customers?.last_name} ·{' '}
                          {visit.reason?.substring(0, 40)}
                          {(visit.reason?.length || 0) > 40 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadge(
                          visit.status
                        )}`}
                      >
                        {visit.status?.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(visit.checked_in_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description={
                  role === 'doctor'
                    ? 'No visits assigned to you yet today.'
                    : 'No recent visits recorded for this branch.'
                }
                action={
                  role === 'receptionist' && canShowWidget(role, 'waitingWalkIns') ? (
                    <Link
                      href="/dashboard/walk-ins"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Check in a walk-in →
                    </Link>
                  ) : role === 'doctor' ? (
                    <Link
                      href="/dashboard/doctors"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Open clinical queue →
                    </Link>
                  ) : undefined
                }
              />
            )}
          </div>
        </div>
      </div>

      {showLowStock && (
        <div className="bg-amber-500/10 rounded-2xl border border-amber-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Low Stock Alerts
            </h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <span className="text-xs font-bold text-on-surface">{item.name}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {item.stock_quantity} / {item.reorder_level} min
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/inventory"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 mt-3 inline-flex items-center gap-1"
          >
            View full inventory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
        </>
      )}
      </StaffDashboardGate>
    </div>
  );
}

function buildKpis(
  role: UserSessionDetails['role'],
  data: {
    todayAppointments: number;
    waitingWalkIns: number;
    readyForCheckout: number;
    unpaidInvoices: number;
    lowStockCount: number;
    myQueueCount: number;
    activeConsultations: number;
    emergencyCount: number;
    openPrescriptions: number;
    totalCustomers: number;
    totalPets: number;
    netRevenueMtdLabel: string | null;
  },
  canLink: (href: string) => boolean
): DashboardKpi[] {
  const kpis: DashboardKpi[] = [];

  if (role === 'clinic_admin' && data.netRevenueMtdLabel && canLink('/dashboard/revenue')) {
    kpis.push({
      key: 'net-revenue',
      label: 'Net Revenue (MTD)',
      value: data.netRevenueMtdLabel,
      icon: DollarSign,
      href: '/dashboard/revenue',
      trend: 'Paid invoices − expenses',
    });
  }

  if (role === 'doctor') {
    return [];
  }

  if (canShowWidget(role, 'todayAppointments')) {
    kpis.push({
      key: 'appt',
      label: "Today's Appointments",
      value: data.todayAppointments,
      icon: Calendar,
      href: '/dashboard/appointments',
    });
  }
  if (canShowWidget(role, 'waitingWalkIns')) {
    kpis.push({
      key: 'walkin',
      label: 'Walk-ins Waiting',
      value: data.waitingWalkIns,
      icon: ClipboardList,
      href: '/dashboard/walk-ins',
    });
  }
  if (canShowWidget(role, 'readyForCheckout')) {
    kpis.push({
      key: 'checkout',
      label: 'Ready for Checkout',
      value: data.readyForCheckout,
      icon: BadgeCheck,
      href: '/dashboard/walk-ins',
    });
  }
  if (canShowWidget(role, 'unpaidInvoices')) {
    kpis.push({
      key: 'unpaid',
      label: 'Unpaid Invoices',
      value: data.unpaidInvoices,
      icon: Banknote,
      href: '/dashboard/invoices',
    });
  }
  if (canShowWidget(role, 'lowStock')) {
    kpis.push({
      key: 'stock',
      label: 'Low Stock Alerts',
      value: data.lowStockCount,
      icon: AlertTriangle,
      href: '/dashboard/inventory',
    });
  }

  return kpis.filter((k) => !k.href || canLink(k.href)).slice(0, role === 'clinic_admin' ? 5 : 4);
}

type QuickActionItem = {
  key: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
};

function buildQuickActions(
  role: UserSessionDetails['role'],
  readyForCheckout: number,
  canLink: (href: string) => boolean
): QuickActionItem[] {
  if (role === 'doctor') {
    return [
      {
        key: 'queue',
        href: '/dashboard/doctors',
        icon: <BriefcaseMedical className="w-4 h-4" />,
        label: 'Consultations',
        description: 'View assigned patients',
      },
      {
        key: 'appt',
        href: '/dashboard/appointments',
        icon: <Calendar className="w-4 h-4" />,
        label: 'Appointments',
        description: "Today's schedule",
      },
      {
        key: 'rx',
        href: '/dashboard/prescriptions',
        icon: <FileText className="w-4 h-4" />,
        label: 'Prescriptions',
        description: 'Review issued prescriptions',
      },
    ].filter((a) => canLink(a.href));
  }

  if (role === 'receptionist') {
    const actions: QuickActionItem[] = [
      {
        key: 'walkin',
        href: '/dashboard/walk-ins',
        icon: <ClipboardList className="w-4 h-4" />,
        label: 'Check-in Walk-in',
        description: 'Register a new patient visit',
      },
      {
        key: 'new-appt',
        href: '/dashboard/appointments?new=1',
        icon: <Calendar className="w-4 h-4" />,
        label: 'New appointment',
        description: 'Book linked customer & pet',
      },
      {
        key: 'appt',
        href: '/dashboard/appointments',
        icon: <ClipboardList className="w-4 h-4" />,
        label: 'View Appointments',
        description: "Manage today's bookings",
      },
      {
        key: 'customer',
        href: '/dashboard/customers?focus=phone',
        icon: <Search className="w-4 h-4" />,
        label: 'Search patient',
        description: 'Find owner by phone number',
      },
      {
        key: 'inventory',
        href: '/dashboard/inventory?tab=intake',
        icon: <Layers className="w-4 h-4" />,
        label: 'Stock intake',
        description: 'Manual or scan supplier invoice',
      },
      {
        key: 'unpaid',
        href: '/dashboard/invoices?status=unpaid',
        icon: <Receipt className="w-4 h-4" />,
        label: 'Unpaid invoices',
        description: 'Follow up on outstanding bills',
      },
    ];
    if (readyForCheckout > 0) {
      actions.push({
        key: 'checkout',
        href: '/dashboard/walk-ins',
        icon: <Receipt className="w-4 h-4" />,
        label: `Checkout queue (${readyForCheckout})`,
        description: 'Patients ready for billing',
      });
    }
    return actions.filter((a) => canLink(a.href));
  }

  const adminActions: QuickActionItem[] = [
    {
      key: 'staff',
      href: '/dashboard/staff',
      icon: <Users className="w-4 h-4" />,
      label: 'Manage Staff',
      description: 'Invite and assign team members',
    },
    {
      key: 'reports',
      href: '/dashboard/reports',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'View Reports',
      description: 'Sales and performance analytics',
    },
    {
      key: 'walkin',
      href: '/dashboard/walk-ins',
      icon: <ClipboardList className="w-4 h-4" />,
      label: 'Walk-in Queue',
      description: 'Monitor front desk operations',
    },
    {
      key: 'settings',
      href: '/dashboard/settings',
      icon: <Stethoscope className="w-4 h-4" />,
      label: 'Clinic Settings',
      description: 'Branding and preferences',
    },
    {
      key: 'ai',
      href: '/dashboard/ai-assistant',
      icon: <Bot className="w-4 h-4" />,
      label: 'AI Assistant',
      description: 'Workflow help and draft communications',
    },
    {
      key: 'social',
      href: '/dashboard/social',
      icon: <Share2 className="w-4 h-4" />,
      label: 'Social posts',
      description: 'AI-generated clinic social content',
    },
  ];
  return adminActions.filter((a) => canLink(a.href));
}

function SecondaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
          {label}
        </span>
        <span className="text-xl font-bold text-on-surface">{value}</span>
      </div>
    </div>
  );
}

function QuickAction({ href, icon, label, description }: QuickActionItem) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 glass-panel rounded-2xl p-4 hover:border-primary/30 transition-all group"
    >
      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
        {icon}
      </div>
      <div>
        <span className="text-xs font-bold text-on-surface block">{label}</span>
        <span className="text-[10px] text-on-surface-variant">{description}</span>
      </div>
    </Link>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'waiting':
      return 'bg-amber-500';
    case 'consulting':
      return 'bg-blue-500';
    case 'ready_for_checkout':
      return 'bg-emerald-500';
    case 'completed':
      return 'bg-on-surface-variant/30';
    case 'cancelled':
      return 'bg-destructive';
    default:
      return 'bg-on-surface-variant/20';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'waiting':
      return 'bg-amber-500/15 text-amber-400';
    case 'consulting':
      return 'bg-blue-500/15 text-blue-400';
    case 'consult_paused':
      return 'bg-violet-500/15 text-violet-400';
    case 'ready_for_checkout':
      return 'bg-emerald-500/15 text-emerald-400';
    case 'completed':
      return 'bg-on-surface-variant/10 text-on-surface-variant';
    case 'cancelled':
      return 'bg-destructive/15 text-destructive';
    default:
      return 'bg-on-surface-variant/10 text-on-surface-variant';
  }
}

function formatTime(isoString: string | null) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
