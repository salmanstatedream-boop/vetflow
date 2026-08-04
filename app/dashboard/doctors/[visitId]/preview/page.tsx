import { redirect } from 'next/navigation';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { guardRoute } from '@/lib/auth/page-guards';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/ui/premium/PageHeader';
import PageBackNav from '@/components/layout/PageBackNav';
import { ClipboardCheck } from 'lucide-react';
import FinalDraftPreviewClient, {
  type FinalDraftNotes,
  type FinalDraftRxItem,
} from '@/components/consultations/FinalDraftPreviewClient';
import { NO_PRESCRIPTION_MARKED_NOTES } from '@/lib/prescriptions/constants';

export const metadata = {
  title: 'Final draft preview',
  description: 'Review prescription and medical file before checkout.',
};

export default async function ConsultationFinalDraftPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const ctx = await resolveServerAuthContext();
  if (!ctx) redirect('/login');

  const denied = guardRoute(ctx, '/dashboard/doctors');
  if (denied) return denied;

  const supabase = await createClient();

  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .select(
      `
      id,
      status,
      reason,
      pets:patients ( id, name, species, breed ),
      customers ( first_name, last_name )
    `
    )
    .eq('id', visitId)
    .eq('organization_id', ctx.organizationId!)
    .maybeSingle();

  if (visitError || !visit) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-sm p-6 rounded-2xl">
        Visit not found or access denied.
      </div>
    );
  }

  if (visit.status === 'completed') {
    const { data: invoice } = await supabase
      .from('invoices')
      .select('id')
      .eq('visit_id', visitId)
      .maybeSingle();
    if (invoice) redirect(`/dashboard/invoices/${invoice.id}`);
    redirect('/dashboard/doctors');
  }

  if (visit.status === 'consulting' || visit.status === 'waiting') {
    redirect(`/dashboard/doctors/${visitId}`);
  }

  if (visit.status !== 'ready_for_checkout') {
    redirect('/dashboard/doctors');
  }

  const [{ data: notes }, { data: prescription }, { data: services }, { data: profile }] =
    await Promise.all([
      supabase.from('clinical_notes').select('*').eq('visit_id', visitId).maybeSingle(),
      supabase
        .from('prescriptions')
        .select('id, notes, prescription_items ( medicine_name, dosage, frequency, duration, instructions )')
        .eq('visit_id', visitId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('visit_services')
        .select('name, quantity, unit_price')
        .eq('visit_id', visitId),
      supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', ctx.userId)
        .maybeSingle(),
    ]);

  const pet = visit.pets as {
    name?: string;
    species?: string;
    breed?: string;
  } | null;
  const customer = visit.customers as {
    first_name?: string;
    last_name?: string;
  } | null;

  const rxRaw = (prescription?.prescription_items ?? []) as {
    medicine_name?: string;
    dosage?: string | null;
    frequency?: string | null;
    duration?: string | null;
    instructions?: string | null;
  }[];

  const rxItems: FinalDraftRxItem[] = rxRaw.map((item) => ({
    medicineName: item.medicine_name || 'Medicine',
    dosage: item.dosage ?? null,
    frequency: item.frequency ?? null,
    duration: item.duration ?? null,
    instructions: item.instructions ?? null,
  }));

  const noPrescription =
    (prescription?.notes || '').includes(NO_PRESCRIPTION_MARKED_NOTES) ||
    (!rxItems.length && Boolean(prescription));

  const draftNotes: FinalDraftNotes | null = notes
    ? {
        chiefComplaint: notes.chief_complaint ?? null,
        history: notes.history ?? null,
        examinationFindings: notes.examination_findings ?? null,
        diagnosis: notes.diagnosis ?? null,
        treatmentPlan: notes.treatment_plan ?? null,
        followUpRecommendation: notes.follow_up_recommendation ?? null,
        temperatureC: notes.temperature_c != null ? Number(notes.temperature_c) : null,
        heartRateBpm: notes.heart_rate_bpm != null ? Number(notes.heart_rate_bpm) : null,
        respiratoryRate:
          notes.respiratory_rate != null ? Number(notes.respiratory_rate) : null,
        weightKg: notes.weight_kg != null ? Number(notes.weight_kg) : null,
        bodyConditionScore:
          notes.body_condition_score != null ? Number(notes.body_condition_score) : null,
      }
    : null;

  const doctorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Doctor';

  return (
    <div className="flex flex-col gap-4">
      <div className="shrink-0 space-y-4">
        <PageBackNav items={[{ label: 'Back to consultations', href: '/dashboard/doctors' }]} />
        <PageHeader
          title="Final draft preview"
          description="Confirm chart and prescription before billing."
          icon={ClipboardCheck}
        />
      </div>

      <FinalDraftPreviewClient
        visitId={visitId}
        petName={pet?.name || 'Patient'}
        petSpecies={pet?.species ?? null}
        petBreed={pet?.breed ?? null}
        ownerName={[customer?.first_name, customer?.last_name].filter(Boolean).join(' ') || 'Owner'}
        doctorName={doctorName}
        diagnosis={draftNotes?.diagnosis ?? null}
        notes={draftNotes}
        rxItems={rxItems}
        noPrescription={noPrescription}
        services={(services || []).map((s) => ({
          name: s.name,
          quantity: Number(s.quantity) || 1,
          unitPrice: Number(s.unit_price) || 0,
        }))}
      />
    </div>
  );
}
