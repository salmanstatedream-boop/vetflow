import { normalizeOneToOne } from '@/lib/supabase/embed';

export type VisitNoteMetrics = {
  weight_kg: number | null;
  body_condition_score: number | null;
};

export function resolvePatientDisplayMetrics(
  profile: { weightKg: number | null; bodyConditionScore: number | null },
  visitFallback?: VisitNoteMetrics | null
): { weightKg: number | null; bodyConditionScore: number | null } {
  return {
    weightKg:
      profile.weightKg ??
      (visitFallback?.weight_kg != null ? Number(visitFallback.weight_kg) : null),
    bodyConditionScore:
      profile.bodyConditionScore ??
      (visitFallback?.body_condition_score != null
        ? Number(visitFallback.body_condition_score)
        : null),
  };
}

/** Newest visits first; fills first available weight/BCS per patient from clinical notes. */
export function buildLatestVisitMetricsByPatient(
  visits: Array<{
    patient_id: string;
    clinical_notes: VisitNoteMetrics | VisitNoteMetrics[] | null;
  }>
): Map<string, VisitNoteMetrics> {
  const result = new Map<string, VisitNoteMetrics>();

  for (const visit of visits) {
    const pid = visit.patient_id;
    const entry = result.get(pid) ?? { weight_kg: null, body_condition_score: null };
    const note = normalizeOneToOne(visit.clinical_notes);

    if (entry.weight_kg == null && note?.weight_kg != null) {
      entry.weight_kg = Number(note.weight_kg);
    }
    if (entry.body_condition_score == null && note?.body_condition_score != null) {
      entry.body_condition_score = Number(note.body_condition_score);
    }

    result.set(pid, entry);
  }

  return result;
}
