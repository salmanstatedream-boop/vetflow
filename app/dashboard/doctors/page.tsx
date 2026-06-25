import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  assertCapability,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { isConsultTrackingEnabled } from '@/lib/auth/features';
import DeniedState from '@/components/ui/premium/DeniedState';
import { createClient } from '@/lib/supabase/server';
import DoctorQueueClient from '@/components/dashboard/DoctorQueueClient';
import PageHeader from '@/components/ui/premium/PageHeader';
import { normalizeOneToOne } from '@/lib/supabase/embed';
import { BriefcaseMedical } from 'lucide-react';

export const metadata = {
  title: 'Consultations',
  description: 'Clinical consultation workspace and patient queue.',
};

type VisitAssignmentEmbed = {
  doctor_id: string;
  user_profiles: { first_name: string; last_name: string } | null;
};

function mapQueueVisit(v: Record<string, unknown>) {
  const pets = v.pets as {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    gender: string;
  };
  const customers = v.customers as { first_name: string; last_name: string; phone: string };
  const assignment = normalizeOneToOne(v.visit_assignments as VisitAssignmentEmbed | VisitAssignmentEmbed[] | null);
  const profile = assignment?.user_profiles;

  return {
    id: v.id as string,
    reason: v.reason as string,
    status: v.status as string,
    checkedInAt: v.checked_in_at as string,
    consultStartedAt: (v.consult_started_at as string | null) ?? null,
    consultPausedAt: (v.consult_paused_at as string | null) ?? null,
    consultPauseReason: (v.consult_pause_reason as string | null) ?? null,
    consultPauseAccumulatedSec: (v.consult_pause_accumulated_sec as number) ?? 0,
    isEmergency: (v.is_emergency as boolean) ?? false,
    triageNotes: (v.triage_notes as string | null) ?? null,
    pet: {
      id: pets.id,
      name: pets.name,
      species: pets.species,
      breed: pets.breed,
      gender: pets.gender,
    },
    customer: {
      firstName: customers.first_name,
      lastName: customers.last_name,
      phone: customers.phone,
    },
    assignedDoctorName: profile
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : null,
  };
}

export default async function DoctorDashboardPage() {
  const ctx = await resolveServerAuthContext();
  if (!ctx) {
    redirect('/login');
  }

  try {
    assertCapability(ctx, 'clinical_queue');
  } catch {
    return (
      <DeniedState
        title="Clinical workspace restricted"
        message="Only doctors and clinic administrators can access the clinical queue."
      />
    );
  }

  const session = ctx;
  const isSupervisoryView = session.role === 'clinic_admin';

  const cookieStore = await cookies();
  let activeBranchId = cookieStore.get('clinix_branch_id')?.value;
  if (!activeBranchId && session.branches.length > 0) {
    activeBranchId = session.branches[0].id;
  } else if (activeBranchId && !session.branches.some((b) => b.id === activeBranchId)) {
    activeBranchId = session.branches[0]?.id;
  }

  const supabase = await createClient();

  const { data: sub } = await supabase
    .from('subscription_status')
    .select('features')
    .eq('organization_id', session.organizationId)
    .maybeSingle();

  const showConsultTimer = isConsultTrackingEnabled(
    (sub?.features as Record<string, unknown>) || null
  );

  let visitsQuery = supabase
    .from('visits')
    .select(`
      id,
      reason,
      status,
      checked_in_at,
      consult_started_at,
      consult_paused_at,
      consult_pause_reason,
      consult_pause_accumulated_sec,
      is_emergency,
      triage_notes,
      pets:patients ( id, name, species, breed, gender ),
      customers ( first_name, last_name, phone ),
      visit_assignments (
        doctor_id,
        user_profiles ( first_name, last_name )
      )
    `)
    .in('status', ['waiting', 'consulting'])
    .order('is_emergency', { ascending: false })
    .order('checked_in_at', { ascending: true });

  if (isSupervisoryView && activeBranchId) {
    visitsQuery = visitsQuery.eq('branch_id', activeBranchId);
  } else {
    visitsQuery = supabase
      .from('visits')
      .select(`
        id,
        reason,
        status,
        checked_in_at,
        consult_started_at,
        consult_paused_at,
        consult_pause_reason,
        consult_pause_accumulated_sec,
        is_emergency,
        triage_notes,
        pets:patients ( id, name, species, breed, gender ),
        customers ( first_name, last_name, phone ),
        visit_assignments!inner (
          doctor_id,
          user_profiles ( first_name, last_name )
        )
      `)
      .eq('visit_assignments.doctor_id', session.userId)
      .in('status', ['waiting', 'consulting'])
      .order('is_emergency', { ascending: false })
      .order('checked_in_at', { ascending: true });
  }

  const { data: visitsData, error } = await visitsQuery;

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Failed to load assigned patient queue: {error.message}
      </div>
    );
  }

  const visits = (visitsData || []).map((v) => mapQueueVisit(v as Record<string, unknown>));

  const waitingVisits = visits.filter((v) => v.status === 'waiting');
  const consultingVisits = visits.filter((v) => v.status === 'consulting');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let completedQuery = supabase
    .from('visits')
    .select(`
      id, reason, status, checked_in_at,
      pets:patients ( id, name, species, breed, gender ),
      customers ( first_name, last_name, phone ),
      prescriptions ( id ),
      visit_assignments (
        doctor_id,
        user_profiles ( first_name, last_name )
      )
    `)
    .eq('status', 'ready_for_checkout')
    .gte('completed_at', todayStart.toISOString())
    .order('completed_at', { ascending: false })
    .limit(10);

  if (isSupervisoryView && activeBranchId) {
    completedQuery = completedQuery.eq('branch_id', activeBranchId);
  } else {
    completedQuery = supabase
      .from('visits')
      .select(`
        id, reason, status, checked_in_at,
        pets:patients ( id, name, species, breed, gender ),
        customers ( first_name, last_name, phone ),
        prescriptions ( id ),
        visit_assignments!inner (
          doctor_id,
          user_profiles ( first_name, last_name )
        )
      `)
      .eq('visit_assignments.doctor_id', session.userId)
      .eq('status', 'ready_for_checkout')
      .gte('completed_at', todayStart.toISOString())
      .order('completed_at', { ascending: false })
      .limit(10);
  }

  const { data: completedData } = await completedQuery;

  const completedVisits =
    completedData?.map((v) => {
      const mapped = mapQueueVisit(v as Record<string, unknown>);
      const rxList = v.prescriptions as { id: string }[] | { id: string } | null;
      const rx = Array.isArray(rxList) ? rxList[0] : rxList;
      return { ...mapped, prescriptionId: rx?.id ?? null };
    }) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Consultations"
        description={
          isSupervisoryView
            ? 'All active consultations in your branch — cases assigned to any clinician.'
            : 'Review your active consultation room and queue assignments.'
        }
        icon={BriefcaseMedical}
      />

      <DoctorQueueClient
        waitingVisits={waitingVisits}
        consultingVisits={consultingVisits}
        completedVisits={completedVisits}
        doctorFirstName={session.firstName || ''}
        doctorLastName={session.lastName || ''}
        showConsultTimer={showConsultTimer}
        isSupervisoryView={isSupervisoryView}
      />
    </div>
  );
}
