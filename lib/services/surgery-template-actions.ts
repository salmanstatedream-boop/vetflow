'use server';

import { createClient } from '@/lib/supabase/server';
import {
  assertCapability,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { assertClinicalVisitAccess } from '@/lib/clinical/visit-access';
import { EntityIdSchema } from '@/lib/validations/schemas';
import {
  diagnosisSearchTokens,
  draftSurgeryTemplateWithLlm,
  type SurgeryHistoryCase,
} from '@/lib/ai/surgery-template';
import type { TreatmentPlanObjectiveInput } from '@/lib/ai/treatment-plan-template';
import { normalizeOneToOne } from '@/lib/supabase/embed';

type ClinicalNoteEmbed = {
  visit_type: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  procedure_notes: string | null;
  post_op_medication: string | null;
  created_by: string;
};

type VisitWithNotes = {
  id: string;
  checked_in_at: string | null;
  patient_id: string;
  clinical_notes: ClinicalNoteEmbed[] | ClinicalNoteEmbed | null;
};

function caseFromVisit(
  visit: VisitWithNotes,
  source: SurgeryHistoryCase['source']
): SurgeryHistoryCase | null {
  const note = normalizeOneToOne(visit.clinical_notes);
  if (!note || (note.visit_type || 'standard') !== 'surgery') return null;
  const diagnosis = note.diagnosis?.trim();
  if (!diagnosis) return null;
  const treatmentPlan = note.treatment_plan?.trim() || '';
  const procedureNotes = note.procedure_notes?.trim() || '';
  const postOpMedication = note.post_op_medication?.trim() || '';
  if (!treatmentPlan && !procedureNotes && !postOpMedication) return null;
  return {
    source,
    diagnosis,
    treatmentPlan,
    procedureNotes,
    postOpMedication,
    checkedInAt: visit.checked_in_at,
  };
}

export async function generateSurgeryTemplateAction(payload: {
  visitId: string;
  diagnosis: string;
  objective?: TreatmentPlanObjectiveInput;
}): Promise<
  | {
      success: true;
      fields: {
        treatmentPlan: string;
        procedureNotes: string;
        postOpMedication: string;
      };
    }
  | { success: false; error: string }
> {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) return { success: false, error: 'Unauthorized.' };
    assertOrganization(ctx);
    assertCapability(ctx, 'clinical_queue');

    const visitId = EntityIdSchema.parse(payload.visitId);
    const diagnosis = (payload.diagnosis || '').trim();
    if (diagnosis.length < 2) {
      return {
        success: false,
        error: 'Enter the surgery type / diagnosis in Assessment (A) before generating a surgery template.',
      };
    }

    const supabase = await createClient();
    await assertClinicalVisitAccess(supabase, ctx, visitId);

    const { data: visitRow, error: visitErr } = await supabase
      .from('visits')
      .select('id, patient_id, reason, pets:patients(name, species)')
      .eq('id', visitId)
      .single();

    if (visitErr || !visitRow) {
      return { success: false, error: 'Visit not found.' };
    }

    const pet = normalizeOneToOne(
      visitRow.pets as { name: string; species: string } | { name: string; species: string }[] | null
    );
    const patientId = visitRow.patient_id as string;
    const orgId = ctx.organizationId!;

    const notesSelect = `
      id,
      checked_in_at,
      patient_id,
      clinical_notes (
        visit_type,
        diagnosis,
        treatment_plan,
        procedure_notes,
        post_op_medication,
        created_by
      )
    `;

    const { data: patientHistory } = await supabase
      .from('visits')
      .select(notesSelect)
      .eq('organization_id', orgId)
      .eq('patient_id', patientId)
      .in('status', ['ready_for_checkout', 'completed'])
      .neq('id', visitId)
      .order('checked_in_at', { ascending: false })
      .limit(15);

    const patientCases: SurgeryHistoryCase[] = [];
    for (const v of (patientHistory || []) as VisitWithNotes[]) {
      const c = caseFromVisit(v, 'patient');
      if (c) patientCases.push(c);
    }

    const tokens = diagnosisSearchTokens(diagnosis);
    const similarCases: SurgeryHistoryCase[] = [];
    const seenKeys = new Set(
      patientCases.map(
        (c) => `${c.diagnosis}|${c.treatmentPlan.slice(0, 40)}|${c.procedureNotes.slice(0, 40)}`
      )
    );

    if (tokens.length > 0) {
      const { data: clinicVisits } = await supabase
        .from('visits')
        .select(notesSelect)
        .eq('organization_id', orgId)
        .in('status', ['ready_for_checkout', 'completed'])
        .neq('id', visitId)
        .neq('patient_id', patientId)
        .order('checked_in_at', { ascending: false })
        .limit(80);

      const doctorFirst: SurgeryHistoryCase[] = [];
      const clinicRest: SurgeryHistoryCase[] = [];

      for (const v of (clinicVisits || []) as VisitWithNotes[]) {
        const note = normalizeOneToOne(v.clinical_notes);
        if (!note || (note.visit_type || 'standard') !== 'surgery') continue;
        const dx = (note.diagnosis || '').toLowerCase();
        if (!dx || !tokens.some((t) => dx.includes(t))) continue;
        const source: SurgeryHistoryCase['source'] =
          note.created_by === ctx.userId ? 'doctor_similar' : 'clinic_similar';
        const c = caseFromVisit(v, source);
        if (!c) continue;
        const key = `${c.diagnosis}|${c.treatmentPlan.slice(0, 40)}|${c.procedureNotes.slice(0, 40)}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        if (source === 'doctor_similar') doctorFirst.push(c);
        else clinicRest.push(c);
      }

      similarCases.push(...doctorFirst, ...clinicRest);
      if (similarCases.length > 10) similarCases.length = 10;
    }

    const drafted = await draftSurgeryTemplateWithLlm({
      petName: pet?.name || 'Patient',
      species: pet?.species || 'unknown',
      visitReason: (visitRow.reason as string | null) ?? null,
      diagnosis,
      objective: payload.objective,
      historyCases: [...patientCases, ...similarCases],
    });

    if ('error' in drafted) {
      return { success: false, error: drafted.error };
    }

    return { success: true, fields: drafted.fields };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate surgery template.',
    };
  }
}
