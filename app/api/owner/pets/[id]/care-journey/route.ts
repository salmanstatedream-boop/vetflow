import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';
import { mapVisitCareStage } from '@/lib/services/owner-care';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id')
    .eq('user_id', user.id);
  const customerIds = new Set((links || []).map((l) => l.customer_id));

  const { data: pet } = await admin
    .from('patients')
    .select('id, name, customer_id, organization_id')
    .eq('id', patientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!pet || !customerIds.has(pet.customer_id)) {
    return jsonError('Pet not found', 404);
  }

  const { data: visit } = await admin
    .from('visits')
    .select(
      `
      id, reason, status, checked_in_at, completed_at, is_emergency,
      visit_purpose, consult_paused_at, consult_started_at, workflow_payload,
      organization_id
    `
    )
    .eq('patient_id', patientId)
    .in('status', ['waiting', 'consulting', 'ready_for_checkout'])
    .order('checked_in_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!visit) {
    return Response.json({ success: true, active: null });
  }

  const stage = mapVisitCareStage(visit.status, visit.consult_paused_at);
  const { data: org } = await admin
    .from('organizations')
    .select('id, name')
    .eq('id', visit.organization_id)
    .maybeSingle();

  const steps = [
    {
      title: 'Checked in',
      subtitle: visit.checked_in_at
        ? new Date(visit.checked_in_at).toLocaleString()
        : 'At reception',
    },
    {
      title: 'With doctor',
      subtitle: visit.consult_started_at
        ? `Started ${new Date(visit.consult_started_at).toLocaleTimeString()}`
        : 'Waiting for consult',
    },
    {
      title: 'Treatment',
      subtitle:
        visit.status === 'consulting'
          ? visit.consult_paused_at
            ? 'Paused'
            : 'Care in progress'
          : visit.status === 'ready_for_checkout' || visit.status === 'completed'
            ? 'Treatment finished'
            : 'Pending',
    },
    {
      title: 'Ready for pickup',
      subtitle:
        visit.status === 'ready_for_checkout'
          ? 'Please come to reception'
          : visit.completed_at
            ? 'Discharged'
            : 'Pending discharge',
    },
  ];

  return Response.json({
    success: true,
    active: {
      visitId: visit.id,
      reason: visit.reason,
      status: visit.status,
      visitPurpose: visit.visit_purpose,
      isEmergency: visit.is_emergency,
      clinicName: org?.name ?? 'Clinic',
      stageLabel: stage.label,
      activeIndex: stage.activeIndex,
      steps,
      workflowPayload: visit.workflow_payload,
    },
  });
}
