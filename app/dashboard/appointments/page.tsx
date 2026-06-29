import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import { fetchAssignableClinicians } from '@/lib/clinical/assignable-clinicians';
import AppointmentsPageHeader from '@/components/dashboard/AppointmentsPageHeader';
import AppointmentsListClient from '@/components/dashboard/AppointmentsListClient';
import { Suspense } from 'react';

export const metadata = {
  title: 'Appointments Scheduler',
  description: 'Manage clinic appointments and online bookings.',
};

export default async function AppointmentsPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) {
    redirect('/login');
  }

  const denied = guardRoute(ctx, '/dashboard/appointments');
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
        You must be assigned to a clinic branch to open the appointments dashboard.
      </div>
    );
  }

  const supabase = await createClient();

  const isDoctor = session.role === 'doctor';

  // 2. Fetch appointments in active branch (doctors see only their own)
  let appointmentsQuery = supabase
    .from('appointments')
    .select('*')
    .eq('branch_id', activeBranchId);

  if (isDoctor) {
    appointmentsQuery = appointmentsQuery.eq('doctor_id', session.userId);
  }

  const { data: appointmentsRaw, error } = await appointmentsQuery
    .order('preferred_date', { ascending: true })
    .order('preferred_time', { ascending: true });

  const creatorIds = [
    ...new Set(
      (appointmentsRaw || [])
        .map((a) => a.created_by as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const creatorMap = new Map<string, { firstName: string; lastName: string }>();
  if (creatorIds.length > 0) {
    const { data: creators } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', creatorIds);
    for (const c of creators || []) {
      creatorMap.set(c.id, {
        firstName: c.first_name || '',
        lastName: c.last_name || '',
      });
    }
  }

  const appointments = (appointmentsRaw || []).map((a) => {
    const creator = a.created_by ? creatorMap.get(a.created_by as string) : null;
    return {
      ...a,
      creatorName: creator ? `${creator.firstName} ${creator.lastName}`.trim() : null,
    };
  });

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Failed to load appointments: {error.message}
      </div>
    );
  }

  const clinicians = await fetchAssignableClinicians(session.organizationId!);
  const doctors = clinicians.map((d) => ({
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
  }));

  // 4. Resolve slug and public booking URL
  // Fetch organization slug
  const { data: org } = await supabase
    .from('organizations')
    .select('slug')
    .eq('id', session.organizationId)
    .single();

  const publicBookingUrl = org ? `/book/${org.slug}` : '#';

  return (
    <div className="space-y-8">
      
      <Suspense fallback={null}>
        <AppointmentsPageHeader
          orgSlug={org?.slug}
          publicBookingUrl={publicBookingUrl}
          doctors={doctors}
          activeBranchId={activeBranchId}
          userRole={session.role}
        />
      </Suspense>

      {/* APPOINTMENTS LIST */}
      <Suspense fallback={null}>
        <AppointmentsListClient
          initialAppointments={appointments || []}
          doctors={doctors}
          userRole={session.role}
          readOnly={isDoctor}
        />
      </Suspense>

    </div>
  );
}

