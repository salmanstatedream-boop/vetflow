import { chatCompletion } from '@/lib/ai/llm-client';

export type TreatmentPlanObjectiveInput = {
  temperatureF?: number | null;
  heartRateBpm?: number | null;
  respiratoryRate?: number | null;
  weightKg?: number | null;
  bodyConditionScore?: number | null;
  dehydrationPercent?: number | null;
  signs?: string[];
  examinationFindings?: string | null;
};

export type TreatmentPlanHistoryCase = {
  source: 'patient' | 'doctor_similar' | 'clinic_similar';
  diagnosis: string;
  treatmentPlan: string;
  vitalsSummary?: string | null;
  checkedInAt?: string | null;
};

export type TreatmentPlanTemplateContext = {
  petName: string;
  species: string;
  visitReason?: string | null;
  diagnosis: string;
  objective: TreatmentPlanObjectiveInput;
  historyCases: TreatmentPlanHistoryCase[];
};

function formatObjective(objective: TreatmentPlanObjectiveInput): string {
  const lines: string[] = [];
  if (objective.temperatureF != null && Number.isFinite(objective.temperatureF)) {
    lines.push(`Temperature: ${objective.temperatureF} °F`);
  }
  if (objective.heartRateBpm != null && Number.isFinite(objective.heartRateBpm)) {
    lines.push(`Heart rate: ${objective.heartRateBpm} bpm`);
  }
  if (objective.respiratoryRate != null && Number.isFinite(objective.respiratoryRate)) {
    lines.push(`Respiratory rate: ${objective.respiratoryRate}/min`);
  }
  if (objective.weightKg != null && Number.isFinite(objective.weightKg)) {
    lines.push(`Weight: ${objective.weightKg} kg`);
  }
  if (objective.bodyConditionScore != null && Number.isFinite(objective.bodyConditionScore)) {
    lines.push(`BCS: ${objective.bodyConditionScore}/9`);
  }
  if (objective.dehydrationPercent != null && Number.isFinite(objective.dehydrationPercent)) {
    lines.push(`Dehydration: ${objective.dehydrationPercent}%`);
  }
  if (objective.signs?.length) {
    lines.push(`Clinical signs: ${objective.signs.join(', ')}`);
  }
  if (objective.examinationFindings?.trim()) {
    lines.push(`Examination: ${objective.examinationFindings.trim()}`);
  }
  return lines.length ? lines.join('\n') : 'No objective metrics recorded yet.';
}

function formatHistoryCases(cases: TreatmentPlanHistoryCase[]): string {
  if (!cases.length) return 'No prior treatment-plan exemplars available.';
  return cases
    .map((c, i) => {
      const header = [
        `#${i + 1} [${c.source}]`,
        c.checkedInAt ? `date=${c.checkedInAt.slice(0, 10)}` : null,
        `diagnosis=${c.diagnosis}`,
        c.vitalsSummary ? `vitals=${c.vitalsSummary}` : null,
      ]
        .filter(Boolean)
        .join(' | ');
      return `${header}\nPlan:\n${c.treatmentPlan}`;
    })
    .join('\n\n---\n\n');
}

/** Significant tokens for ILIKE similarity (skip tiny words). */
export function diagnosisSearchTokens(diagnosis: string): string[] {
  const stop = new Set([
    'the',
    'and',
    'with',
    'from',
    'this',
    'that',
    'into',
    'for',
    'due',
    'suspected',
    'likely',
    'possible',
    'mild',
    'moderate',
    'severe',
    'acute',
    'chronic',
  ]);
  const raw = diagnosis
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/[\s/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));
  const unique: string[] = [];
  for (const t of raw) {
    if (!unique.includes(t)) unique.push(t);
    if (unique.length >= 4) break;
  }
  return unique;
}

export function stripPlanMarkdownFences(text: string): string {
  const fenced = text.match(/```(?:\w+)?\s*([\s\S]*?)```/);
  return (fenced?.[1] || text).trim();
}

export async function draftTreatmentPlanWithLlm(
  ctx: TreatmentPlanTemplateContext
): Promise<{ planText: string } | { error: string }> {
  const system = `You are a veterinary clinical scribe assisting a doctor writing SOAP Plan notes.
Draft ONLY a treatment plan & recommendations in free-form clinical prose.
Match the attending doctor's writing style using the exemplar plans (especially [doctor_similar]).
Ground the draft in the current diagnosis and objective findings; note clinically relevant changes vs patient history when present.
Do not invent medications, dosages, or procedures that are not supported by the diagnosis, objective data, or exemplars.
Do not use markdown headings, bullet markers unless exemplars clearly use them, or code fences.
Return plain text only — the draft the doctor will edit.`;

  const user = `Patient: ${ctx.petName} (${ctx.species})
Visit reason: ${ctx.visitReason?.trim() || '—'}

Current diagnosis (Assessment):
${ctx.diagnosis.trim()}

Current objective findings:
${formatObjective(ctx.objective)}

Prior plans / similar clinic cases (style + clinical context):
${formatHistoryCases(ctx.historyCases)}

Write the treatment plan & recommendations draft now.`;

  const result = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 900, temperature: 0.35 }
  );

  if ('error' in result) return result;
  const planText = stripPlanMarkdownFences(result.content);
  if (!planText) return { error: 'AI returned an empty treatment plan.' };
  return { planText };
}
