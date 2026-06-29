import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/ui/premium/PageHeader';
import { fetchAssignableClinicians } from '@/lib/clinical/assignable-clinicians';
import ScheduleDayCalendarClient from '@/components/schedule/ScheduleDayCalendarClient';
import { resolveDashboardFilterDate } from '@/lib/utils/date-filters';
import { formatAppointmentTime, normalizeDateYmd } from '@/lib/utils/time-parse';
import { getDeviceTimezoneFromCookies } from '@/lib/utils/device-timezone.server';
import { getClinicTimezoneShortLabel, normalizeClinicTimezone } from '@/lib/utils/timezones';
import { UPCOMING_APPOINTMENT_STATUSES } from '@/lib/appointments/status';
import { Calendar } from 'lucide-react';

export const metadata = {
  title: 'Schedule',
  description: 'Multi-provider day calendar for clinic appointments.',
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;

  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/schedule');
  if (denied) return denied;

  const cookieStore = await cookies();
  let activeBranchId = cookieStore.get('clinix_branch_id')?.value;
  if (!activeBranchId && ctx.branches.length > 0) {
    activeBranchId = ctx.branches[0].id;
  } else if (activeBranchId && !ctx.branches.some((b) => b.id === activeBranchId)) {
    activeBranchId = ctx.branches[0]?.id;
  }

  if (!activeBranchId) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-6 rounded-2xl">
        You must be assigned to a clinic branch to view the schedule.
      </div>
    );
  }

  const supabase = await createClient();
  const deviceTimezone = await getDeviceTimezoneFromCookies();
  const selectedDate = resolveDashboardFilterDate(dateParam, deviceTimezone);

  const [{ data: appSettings }, clinicians] = await Promise.all([
    supabase
      .from('app_settings')
      .select('timezone')
      .eq('organization_id', ctx.organizationId!)
      .maybeSingle(),
    fetchAssignableClinicians(ctx.organizationId!),
  ]);

  const clinicTimezone = normalizeClinicTimezone(appSettings?.timezone);

  let appointmentsQuery = supabase
    .from('appointments')
    .select(
      'id, patient_name, customer_name, reason, status, preferred_date, preferred_time, doctor_id, is_emergency, duration_minutes'
    )
    .eq('branch_id', activeBranchId)
    .eq('preferred_date', selectedDate)
    .in('status', [...UPCOMING_APPOINTMENT_STATUSES])
    .order('preferred_time', { ascending: true });

  if (ctx.role === 'doctor') {
    appointmentsQuery = appointmentsQuery.eq('doctor_id', ctx.userId);
  }

  const { data: appointmentsRaw } = await appointmentsQuery;

  const checkedInIds = (appointmentsRaw || [])
    .filter((a) => a.status === 'checked_in')
    .map((a) => a.id);

  const visitByAppointmentId = new Map<string, string>();
  if (checkedInIds.length > 0) {
    const { data: linkedVisits } = await supabase
      .from('visits')
      .select('id, appointment_id')
      .eq('branch_id', activeBranchId)
      .in('appointment_id', checkedInIds);
    for (const v of linkedVisits || []) {
      if (v.appointment_id) visitByAppointmentId.set(v.appointment_id as string, v.id as string);
    }
  }

  const doctors = clinicians.map((d) => ({
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
  }));

  const appointments = (appointmentsRaw || []).map((a) => ({
    id: a.id,
    patientName: a.patient_name,
    customerName: a.customer_name,
    reason: a.reason,
    status: a.status,
    preferredDate: normalizeDateYmd(a.preferred_date as string),
    preferredTime: formatAppointmentTime(a.preferred_time as string),
    durationMinutes: Math.max(15, (a.duration_minutes as number) || 30),
    doctorId: a.doctor_id as string | null,
    isEmergency: a.is_emergency ?? false,
    visitId: visitByAppointmentId.get(a.id as string) ?? null,
  }));

  return (
    <div className="flex flex-col gap-8 min-h-[calc(100vh-6rem)]">
      <PageHeader
        title="Clinic schedule"
        description={`Day view by provider · dates use your local timezone (${getClinicTimezoneShortLabel(deviceTimezone)})`}
        icon={Calendar}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <ScheduleDayCalendarClient
        doctors={doctors}
        appointments={appointments}
        selectedDate={selectedDate}
        currentUserId={ctx.userId}
        currentRole={ctx.role}
        activeBranchId={activeBranchId}
        clinicTimezone={clinicTimezone}
        />
      </div>
    </div>
  );
}
