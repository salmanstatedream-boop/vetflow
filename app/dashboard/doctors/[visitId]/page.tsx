import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import ConsultationWorkspaceClient from '@/components/forms/ConsultationWorkspaceClient';
import { STOCK_PRODUCT_TYPES } from '@/lib/inventory/product-types';
import PageHeader from '@/components/ui/premium/PageHeader';
import Link from 'next/link';
import PageBackNav from '@/components/layout/PageBackNav';
import { Stethoscope } from 'lucide-react';
import type { VisitPurpose } from '@/lib/appointments/visit-purpose';
import type { WorkflowConsultDraft } from '@/lib/consultations/workflow-types';
import type { CompleteConsultationInput } from '@/lib/validations/schemas';
import { workflowPayloadToChartRow } from '@/lib/consultations/workflow-chart';
import { parseWorkflowPayload } from '@/lib/consultations/workflow-validation';
import { deriveObjectiveSignDefaults } from '@/lib/patients/objective-sign-defaults';

export const metadata = {
  title: 'Consultation Room',
  description: 'Active medical charting and prescription room.',
};

export default async function ConsultationRoomPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/doctors');
  if (denied) return denied;

  const session = ctx;

  const supabase = await createClient();

  // 1. Fetch visit details
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select(`
      id,
      reason,
      status,
      branch_id,
      checked_in_at,
      appointment_id,
      consult_started_at,
      consult_paused_at,
      consult_pause_reason,
      consult_pause_accumulated_sec,
      consult_draft,
      visit_purpose,
      workflow_payload,
      pet_id:patient_id,
      is_emergency,
      triage_notes,
      pets:patients (
        id,
        name,
        species,
        breed,
        gender,
        allergies,
        weight_kg,
        body_condition_score
      ),
      customers (
        first_name,
        last_name,
        phone
      )
    `)
    .eq('id', visitId)
    .eq('organization_id', session.organizationId)
    .single();

  if (visitError || !visit) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Visit record not found or access denied.
      </div>
    );
  }

  // 2. Auto-advance visit from waiting to consulting on load
  if (visit.status === 'waiting') {
    await supabase
      .from('visits')
      .update({
        status: 'consulting',
        consult_started_at: new Date().toISOString(),
      })
      .eq('id', visitId);
    visit.status = 'consulting';
  }

  // Consultation already finalized — lock the room and point to checkout / queue
  if (visit.status === 'ready_for_checkout' || visit.status === 'completed') {
    const petName =
      (visit.pets as { name?: string } | null)?.name ?? 'Patient';
    const isReady = visit.status === 'ready_for_checkout';
    return (
      <div className="flex flex-col gap-4">
        <div className="shrink-0 space-y-4">
          <PageBackNav items={[{ label: 'Back to consultations', href: '/dashboard/doctors' }]} />
          <PageHeader
            title="Consultation complete"
            description={
              isReady
                ? `${petName} is ready for checkout and discharge.`
                : `${petName} has already been checked out.`
            }
            icon={Stethoscope}
          />
        </div>
        <div className="glass-panel rounded-2xl border border-emerald-500/30 p-6 sm:p-8 space-y-4 shadow-premium max-w-lg">
          <p className="text-sm text-on-surface-variant">
            {isReady
              ? 'This consultation is finalized. Proceed to billing or return to your queue for the next patient.'
              : 'This visit is complete. Return to the consultation queue for who is next.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {isReady ? (
              <>
                <Link
                  href={`/dashboard/doctors/${visitId}/preview`}
                  className="app-btn-primary app-focus-ring"
                >
                  Review final draft
                </Link>
                <Link
                  href={`/dashboard/invoices/create/${visitId}`}
                  className="app-btn-secondary app-focus-ring"
                >
                  Start checkout
                </Link>
              </>
            ) : null}
            <Link
              href="/dashboard/doctors"
              className="app-btn-ghost app-focus-ring"
            >
              Back to consultation queue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Fetch pet visit history
  const { data: historyData } = await supabase
    .from('visits')
    .select(`
      id,
      checked_in_at,
      reason,
      clinical_notes ( diagnosis, treatment_plan )
    `)
    .eq('patient_id', visit.pet_id)
    .in('status', ['ready_for_checkout', 'completed'])
    .neq('id', visitId)
    .order('checked_in_at', { ascending: false });

  const history = historyData?.map((h) => ({
    id: h.id,
    checkedInAt: h.checked_in_at,
    reason: h.reason,
    clinicalNotes: h.clinical_notes?.[0]
      ? {
          diagnosis: h.clinical_notes[0].diagnosis,
          treatmentPlan: h.clinical_notes[0].treatment_plan,
        }
      : null,
  })) || [];

  // 4. Fetch branch catalog products (all stock types — not filtered by stock level)
  const { data: productsData } = await supabase
    .from('products')
    .select('id, name, type, selling_price')
    .eq('organization_id', session.organizationId)
    .eq('branch_id', visit.branch_id)
    .in('type', [...STOCK_PRODUCT_TYPES])
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  const products = productsData?.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    sellingPrice: Number(p.selling_price),
  })) || [];

  const { data: servicesData } = await supabase
    .from('services')
    .select('id, name, description, price')
    .eq('organization_id', session.organizationId)
    .eq('is_active', true)
    .order('name');

  const catalogServices = (servicesData || []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description as string | null,
    price: Number(s.price),
  }));

  const { data: categoriesData } = await supabase
    .from('product_categories')
    .select('id, name')
    .eq('organization_id', session.organizationId);

  const categories = categoriesData || [];

  // 5. Lab test catalog, lab orders, current visit docs, and patient history docs
  const patientIdForDocs = visit.pet_id as string;
  const [
    { data: labCatalogData },
    { data: labOrdersData },
    { data: documentsData },
    { data: previousDocsData },
  ] = await Promise.all([
    supabase
      .from('lab_tests')
      .select('id, name')
      .eq('organization_id', session.organizationId)
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('lab_orders')
      .select('id, test_name, status, result_text, result_document_id, created_at')
      .eq('visit_id', visitId)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, file_name, category, mime_type, size_bytes, created_at, description')
      .eq('visit_id', visitId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, file_name, category, mime_type, size_bytes, created_at, description, visit_id')
      .eq('patient_id', patientIdForDocs)
      .neq('visit_id', visitId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const labCatalog = (labCatalogData || []).map((t) => ({ id: t.id, name: t.name }));
  const labOrders = (labOrdersData || []).map((o) => ({
    id: o.id,
    testName: o.test_name,
    status: o.status as string,
    resultText: o.result_text as string | null,
    resultDocumentId: o.result_document_id as string | null,
    createdAt: o.created_at as string,
  }));
  const mapDoc = (d: {
    id: string;
    file_name: string;
    category: string;
    mime_type: string | null;
    size_bytes: number | null;
    created_at: string;
    description?: string | null;
  }) => ({
    id: d.id,
    fileName: d.file_name,
    category: d.category as string,
    mimeType: d.mime_type as string | null,
    sizeBytes: d.size_bytes as number | null,
    createdAt: d.created_at as string,
    description: (d.description as string | null) ?? null,
  });

  const documents = (documentsData || []).map(mapDoc);
  const previousDocuments = (previousDocsData || []).map(mapDoc);

  let isFollowUpPatient = history.length > 0;
  if (visit.appointment_id) {
    const { data: linkedAppt } = await supabase
      .from('appointments')
      .select('follow_up_of_visit_id, visit_purpose')
      .eq('id', visit.appointment_id as string)
      .maybeSingle();
    if (linkedAppt?.follow_up_of_visit_id) {
      isFollowUpPatient = true;
    }
    if (linkedAppt?.visit_purpose && !visit.visit_purpose) {
      visit.visit_purpose = linkedAppt.visit_purpose;
    }
  }

  let visitPurpose = (visit.visit_purpose as VisitPurpose) || 'other';
  if (visit.appointment_id && visitPurpose === 'other') {
    const { data: apptPurpose } = await supabase
      .from('appointments')
      .select('visit_purpose')
      .eq('id', visit.appointment_id as string)
      .maybeSingle();
    if (apptPurpose?.visit_purpose) {
      visitPurpose = apptPurpose.visit_purpose as VisitPurpose;
    }
  }

  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', session.organizationId)
    .eq('is_active', true);

  const userIds = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = userIds.length
    ? await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', userIds)
    : { data: [] };

  const staffMembers =
    profiles?.map((profile) => ({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`.trim() || 'Staff',
    })) ?? [];

  const { data: workflowVisits } = await supabase
    .from('visits')
    .select('id, checked_in_at, completed_at, workflow_payload')
    .eq('patient_id', visit.pet_id)
    .not('workflow_payload', 'is', null)
    .in('status', ['ready_for_checkout', 'completed']);

  const workflowRecords = (workflowVisits ?? []).flatMap((v) => {
    const payload = parseWorkflowPayload(v.workflow_payload);
    if (!payload) return [];
    return [
      workflowPayloadToChartRow(
        v.id,
        v.checked_in_at as string | null,
        v.completed_at as string | null,
        payload,
        undefined
      ),
    ];
  });
  const objectiveSignDefaults = deriveObjectiveSignDefaults(workflowRecords);

  const rawDraft = visit.consult_draft as Record<string, unknown> | null;
  let soapInitialDraft: CompleteConsultationInput | null = null;
  let workflowInitialDraft: WorkflowConsultDraft | null = null;
  if (rawDraft?.kind === 'workflow') {
    workflowInitialDraft = rawDraft as unknown as WorkflowConsultDraft;
  } else if (rawDraft) {
    soapInitialDraft = rawDraft as CompleteConsultationInput;
  }

  const checkedInAt =
    (visit.checked_in_at as string | null) ??
    (visit.consult_started_at as string | null) ??
    new Date().toISOString();

  const petDetails = visit.pets as any;
  const customerDetails = visit.customers as any;

  return (
    <div className="flex flex-col gap-4">
      
      <div className="shrink-0 space-y-4">
      <PageBackNav items={[{ label: 'Back to consultations', href: '/dashboard/doctors' }]} />

      <PageHeader
        title="Active Consultation Room"
        description="Attending Vet workspace for patient diagnosis, notes, and prescriptions."
        icon={Stethoscope}
      />
      </div>

      <ConsultationWorkspaceClient
        visitId={visit.id}
        pet={{
          id: petDetails.id,
          name: petDetails.name,
          species: petDetails.species,
          breed: petDetails.breed,
          gender: petDetails.gender,
          allergies: petDetails.allergies,
          weightKg: petDetails.weight_kg ? Number(petDetails.weight_kg) : null,
          bodyConditionScore: petDetails.body_condition_score
            ? Number(petDetails.body_condition_score)
            : null,
        }}
        customer={{
          firstName: customerDetails.first_name,
          lastName: customerDetails.last_name,
          phone: customerDetails.phone,
        }}
        history={history}
        products={products}
        catalogServices={catalogServices}
        visitReason={visit.reason}
        isEmergency={visit.is_emergency ?? false}
        triageNotes={visit.triage_notes as string | null}
        patientId={visit.pet_id as string}
        labCatalog={labCatalog}
        labOrders={labOrders}
        documents={documents}
        previousDocuments={previousDocuments}
        consultStartedAt={visit.consult_started_at as string | null}
        consultPausedAt={visit.consult_paused_at as string | null}
        consultPauseReason={visit.consult_pause_reason as string | null}
        consultPauseAccumulatedSec={(visit.consult_pause_accumulated_sec as number) ?? 0}
        initialDraft={soapInitialDraft}
        workflowInitialDraft={workflowInitialDraft}
        visitPurpose={visitPurpose}
        staffMembers={staffMembers}
        activeBranchId={visit.branch_id as string}
        categories={categories}
        checkedInAt={checkedInAt}
        isFollowUpPatient={isFollowUpPatient}
        objectiveSignDefaults={objectiveSignDefaults}
      />

    </div>
  );
}
