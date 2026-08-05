import { chatCompletion } from '@/lib/ai/llm-client';
import {
  diagnosisSearchTokens,
  stripPlanMarkdownFences,
  type TreatmentPlanObjectiveInput,
} from '@/lib/ai/treatment-plan-template';

export type SurgeryTemplateFields = {
  treatmentPlan: string;
  procedureNotes: string;
  postOpMedication: string;
};

export type SurgeryHistoryCase = {
  source: 'patient' | 'doctor_similar' | 'clinic_similar';
  diagnosis: string;
  treatmentPlan: string;
  procedureNotes: string;
  postOpMedication: string;
  checkedInAt?: string | null;
};

export type SurgeryTemplateContext = {
  petName: string;
  species: string;
  visitReason?: string | null;
  diagnosis: string;
  objective?: TreatmentPlanObjectiveInput;
  historyCases: SurgeryHistoryCase[];
};

export { diagnosisSearchTokens };

function formatHistory(cases: SurgeryHistoryCase[]): string {
  if (!cases.length) return 'No prior surgery exemplars available.';
  return cases
    .map((c, i) => {
      const header = [
        `#${i + 1} [${c.source}]`,
        c.checkedInAt ? `date=${c.checkedInAt.slice(0, 10)}` : null,
        `diagnosis=${c.diagnosis}`,
      ]
        .filter(Boolean)
        .join(' | ');
      return `${header}
Treatment plan: ${c.treatmentPlan || '—'}
Procedure notes: ${c.procedureNotes || '—'}
Post-op medication: ${c.postOpMedication || '—'}`;
    })
    .join('\n\n---\n\n');
}

function parseSurgeryJson(raw: string): SurgeryTemplateFields | null {
  const body = stripPlanMarkdownFences(raw);
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    const treatmentPlan = String(parsed.treatmentPlan ?? parsed.treatment_plan ?? '').trim();
    const procedureNotes = String(parsed.procedureNotes ?? parsed.procedure_notes ?? '').trim();
    const postOpMedication = String(
      parsed.postOpMedication ?? parsed.post_op_medication ?? ''
    ).trim();
    if (!treatmentPlan && !procedureNotes && !postOpMedication) return null;
    return { treatmentPlan, procedureNotes, postOpMedication };
  } catch {
    const start = body.indexOf('{');
    const end = body.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return parseSurgeryJson(body.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function draftSurgeryTemplateWithLlm(
  ctx: SurgeryTemplateContext
): Promise<{ fields: SurgeryTemplateFields } | { error: string }> {
  const system = `You are a veterinary surgical scribe assisting a doctor.
Draft a surgery-specific SOAP Plan template as JSON only with keys:
treatmentPlan, procedureNotes, postOpMedication.
Match the attending doctor's writing style using exemplars (especially [doctor_similar]).
Ground content in the surgery type / diagnosis from Assessment.
Do not invent medications, dosages, or procedures unsupported by the diagnosis or exemplars.
Plain clinical prose in each string field — no markdown fences outside the JSON object.
Return ONLY a JSON object.`;

  const objectiveBlock = ctx.objective
    ? `Objective (optional context):
temperatureF=${ctx.objective.temperatureF ?? '—'}, HR=${ctx.objective.heartRateBpm ?? '—'}, RR=${ctx.objective.respiratoryRate ?? '—'}, weightKg=${ctx.objective.weightKg ?? '—'}
exam=${ctx.objective.examinationFindings?.trim() || '—'}`
    : '';

  const user = `Patient: ${ctx.petName} (${ctx.species})
Visit reason: ${ctx.visitReason?.trim() || '—'}

Surgery type / diagnosis (Assessment A):
${ctx.diagnosis.trim()}

${objectiveBlock}

Prior surgery cases (style + clinical context):
${formatHistory(ctx.historyCases)}

Return JSON now.`;

  const result = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 1200, temperature: 0.35 }
  );

  if ('error' in result) return result;
  const fields = parseSurgeryJson(result.content);
  if (!fields) {
    return { error: 'AI returned an invalid surgery template. Try again.' };
  }
  return { fields };
}
