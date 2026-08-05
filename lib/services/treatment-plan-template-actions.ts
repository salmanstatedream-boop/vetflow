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
  draftTreatmentPlanWithLlm,
  type TreatmentPlanHistoryCase,
  type TreatmentPlanObjectiveInput,
} from '@/lib/ai/treatment-plan-template';
import { normalizeOneToOne } from '@/lib/supabase/embed';

type ClinicalNoteEmbed = {
  diagnosis: string | null;
  treatment_plan: string | null;
  temperature_c: number | null;
  heart_rate_bpm: number | null;
  respiratory_rate: number | null;
  weight_kg: number | null;
  created_by: string;
};

type VisitWithNotes = {
  id: string;
  checked_in_at: string | null;
  patient_id: string;
  clinical_notes: ClinicalNoteEmbed[] | ClinicalNoteEmbed | null;
};

function vitalsLine(note: ClinicalNoteEmbed): string | null {
  const parts: string[] = [];
  if (note.temperature_c != null) {
    parts.push(`T ${Math.round((Number(note.temperature_c) * 9) / 5 + 32)}°F`);
  }
  if (note.heart_rate_bpm != null) parts.push(`HR ${note.heart_rate_bpm}`);
  if (note.respiratory_rate != null) parts.push(`RR ${note.respiratory_rate}`);
  if (note.weight_kg != null) parts.push(`Wt ${note.weight_kg}kg`);
  return parts.length ? parts.join(', ') : null;
}

function caseFromVisit(
  visit: VisitWithNotes,
  source: TreatmentPlanHistoryCase['source']
): TreatmentPlanHistoryCase | null {
  const note = normalizeOneToOne(visit.clinical_notes);
  if (!note) return null;
  const plan = note.treatment_plan?.trim();
  const diagnosis = note.diagnosis?.trim();
  if (!plan || !diagnosis) return null;
  return {
    source,
    diagnosis,
    treatmentPlan: plan,
    vitalsSummary: vitalsLine(note),
    checkedInAt: visit.checked_in_at,
  };
}

export async function generateTreatmentPlanTemplateAction(payload: {
  visitId: string;
  diagnosis: string;
  objective: TreatmentPlanObjectiveInput;
}): Promise<{ success: true; planText: string } | { success: false; error: string }> {
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
        error: 'Enter a diagnosis in Assessment (A) before generating a treatment plan template.',
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
        diagnosis,
        treatment_plan,
        temperature_c,
        heart_rate_bpm,
        respiratory_rate,
        weight_kg,
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
      .limit(10);

    const patientCases: TreatmentPlanHistoryCase[] = [];
    for (const v of (patientHistory || []) as VisitWithNotes[]) {
      const c = caseFromVisit(v, 'patient');
      if (c) patientCases.push(c);
    }

    const tokens = diagnosisSearchTokens(diagnosis);
    const similarCases: TreatmentPlanHistoryCase[] = [];
    const seenKeys = new Set(patientCases.map((c) => c.treatmentPlan.slice(0, 80)));

    if (tokens.length > 0) {
      // Fetch recent completed clinic visits with notes, then filter client-side for diagnosis similarity.
      // Prefer this doctor's notes first.
      const { data: clinicVisits } = await supabase
        .from('visits')
        .select(notesSelect)
        .eq('organization_id', orgId)
        .in('status', ['ready_for_checkout', 'completed'])
        .neq('id', visitId)
        .neq('patient_id', patientId)
        .order('checked_in_at', { ascending: false })
        .limit(60);

      const doctorFirst: TreatmentPlanHistoryCase[] = [];
      const clinicRest: TreatmentPlanHistoryCase[] = [];

      for (const v of (clinicVisits || []) as VisitWithNotes[]) {
        const note = normalizeOneToOne(v.clinical_notes);
        if (!note?.diagnosis?.trim() || !note.treatment_plan?.trim()) continue;
        const dx = note.diagnosis.toLowerCase();
        const matches = tokens.some((t) => dx.includes(t));
        if (!matches) continue;
        const source: TreatmentPlanHistoryCase['source'] =
          note.created_by === ctx.userId ? 'doctor_similar' : 'clinic_similar';
        const c = caseFromVisit(v, source);
        if (!c) continue;
        const key = c.treatmentPlan.slice(0, 80);
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        if (source === 'doctor_similar') doctorFirst.push(c);
        else clinicRest.push(c);
      }

      similarCases.push(...doctorFirst, ...clinicRest);
      if (similarCases.length > 10) similarCases.length = 10;
    }

    const drafted = await draftTreatmentPlanWithLlm({
      petName: pet?.name || 'Patient',
      species: pet?.species || 'unknown',
      visitReason: (visitRow.reason as string | null) ?? null,
      diagnosis,
      objective: payload.objective || {},
      historyCases: [...patientCases, ...similarCases],
    });

    if ('error' in drafted) {
      return { success: false, error: drafted.error };
    }

    return { success: true, planText: drafted.planText };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate treatment plan template.',
    };
  }
}
