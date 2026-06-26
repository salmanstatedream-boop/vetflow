import type {
  DewormingChartRow,
  DewormingWorkflowPayload,
  GroomingChartRow,
  GroomingWorkflowPayload,
  VaccinationChartRow,
  VaccinationWorkflowPayload,
  WorkflowChartRow,
  WorkflowPayload,
} from '@/lib/consultations/workflow-types';
import {
  createProcessSteps,
  DEWORMING_PROCESS_STEPS,
  GROOMING_PROCESS_STEPS,
  VACCINATION_PROCESS_STEPS,
} from '@/lib/consultations/workflow-config';

function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function upsellLabels(upsells: GroomingWorkflowPayload['sections']['upsells']): string {
  const items: string[] = [];
  if (upsells.severeMatting) items.push('Severe matting');
  if (upsells.fleaTickTreatment) items.push('Flea/tick treatment');
  if (upsells.medicatedShampoo) items.push('Medicated shampoo');
  if (upsells.deSheddingTreatment) items.push('De-shedding');
  if (upsells.teethBrushing) items.push('Teeth brushing');
  if (upsells.nailGrinding) items.push('Nail grinding');
  if (upsells.extraTimeRequired) items.push('Extra time');
  if (upsells.additionalFee) items.push(`+$${upsells.additionalFee}`);
  return items.join(', ') || '—';
}

export function buildGroomingChartSummary(payload: GroomingWorkflowPayload): GroomingWorkflowPayload['chartSummary'] {
  const { assignment, assessment, complete, quality, process } = payload.sections;
  const services = process
    .filter((s) => s.status === 'completed')
    .map((s) => s.label)
    .join(', ');
  return {
    groomerName: assignment.groomerName,
    servicesPerformed: services,
    coatCondition: assessment.coatCondition,
    skinEarNailFindings: [assessment.skinCondition, assessment.earCondition, assessment.nailLength]
      .filter(Boolean)
      .join('; '),
    behaviorNotes: assessment.behaviorToday || complete.groomingNotes,
    upsells: upsellLabels(payload.sections.upsells),
    qualityReviewStatus: quality.overallQuality || (quality.allServicesDone ? 'Approved' : '—'),
    notes: complete.groomingNotes,
  };
}

export function buildVaccinationChartSummary(
  payload: VaccinationWorkflowPayload
): VaccinationWorkflowPayload['chartSummary'] {
  const v = payload.sections.process.vaccines?.[0];
  return {
    vaccineName: v?.name,
    vaccineType: v?.type || '',
    manufacturer: v?.manufacturer,
    lotNumber: v?.lotNumber,
    expiryDate: v?.expiryDate,
    dose: v?.dose,
    routeSite: [v?.route, v?.site].filter(Boolean).join(' / '),
    administeredByName: v?.administeredByName,
    nextDueDate: v?.nextDueDate,
    notes: v?.reactionNotes || payload.sections.documentation.notes,
  };
}

export function buildDewormingChartSummary(
  payload: DewormingWorkflowPayload
): DewormingWorkflowPayload['chartSummary'] {
  const { administration, plan } = payload.sections;
  return {
    dewormerName: administration.dewormerName || plan.dewormerName,
    dose: administration.doseGiven || plan.dosage,
    route: administration.route || plan.route,
    weightKg: administration.weightKg,
    batchNumber: administration.batchNumber,
    parasiteRisk: plan.parasiteRisk,
    administeredByName: administration.administeredByName,
    nextDoseDue: administration.nextDoseDate,
    notes: payload.sections.documentation.notes || administration.observationNotes,
  };
}

export function groomingPayloadToChartRow(
  visitId: string,
  date: string,
  payload: GroomingWorkflowPayload,
  totalCharge?: number | null
): GroomingChartRow {
  const s = payload.chartSummary;
  return {
    visitId,
    date,
    visitPurpose: 'grooming',
    workflowType: 'grooming',
    groomer: s.groomerName || '—',
    servicesPerformed: s.servicesPerformed || '—',
    coatCondition: s.coatCondition || '—',
    skinEarNailFindings: s.skinEarNailFindings || '—',
    behaviorNotes: s.behaviorNotes || '—',
    beforePhotoIds: payload.documentIds?.before ?? payload.sections.arrival.beforePhotoIds ?? [],
    afterPhotoIds: payload.documentIds?.after ?? payload.sections.complete.afterPhotoIds ?? [],
    upsells: s.upsells || '—',
    qualityReviewStatus: s.qualityReviewStatus || '—',
    totalCharge: totalCharge != null ? String(totalCharge) : '—',
    notes: s.notes || '—',
  };
}

export function vaccinationPayloadToChartRow(
  visitId: string,
  date: string,
  payload: VaccinationWorkflowPayload
): VaccinationChartRow {
  const s = payload.chartSummary;
  return {
    visitId,
    date,
    visitPurpose: 'vaccination',
    workflowType: 'vaccination',
    vaccineName: s.vaccineName || '—',
    vaccineType: s.vaccineType || '—',
    manufacturer: s.manufacturer || '—',
    lotNumber: s.lotNumber || '—',
    expiryDate: s.expiryDate || '—',
    dose: s.dose || '—',
    routeSite: s.routeSite || '—',
    administeredBy: s.administeredByName || '—',
    nextDueDate: s.nextDueDate || '—',
    certificateDocumentId: payload.documentIds?.certificate,
    notes: s.notes || '—',
  };
}

export function dewormingPayloadToChartRow(
  visitId: string,
  date: string,
  payload: DewormingWorkflowPayload
): DewormingChartRow {
  const s = payload.chartSummary;
  return {
    visitId,
    date,
    visitPurpose: 'deworming',
    workflowType: 'deworming',
    dewormerName: s.dewormerName || '—',
    dose: s.dose || '—',
    route: s.route || '—',
    weightAtVisit: s.weightKg != null ? `${s.weightKg} kg` : '—',
    batchNumber: s.batchNumber || '—',
    parasiteRisk: s.parasiteRisk || '—',
    administeredBy: s.administeredByName || '—',
    nextDoseDue: s.nextDoseDue || '—',
    notes: s.notes || '—',
  };
}

export function workflowPayloadToChartRow(
  visitId: string,
  checkedInAt: string | null,
  completedAt: string | null,
  payload: WorkflowPayload,
  invoiceTotal?: number | null
): WorkflowChartRow {
  const date = formatDate(completedAt || checkedInAt);
  switch (payload.workflowType) {
    case 'grooming':
      return groomingPayloadToChartRow(visitId, date, payload, invoiceTotal);
    case 'vaccination':
      return vaccinationPayloadToChartRow(visitId, date, payload);
    case 'deworming':
      return dewormingPayloadToChartRow(visitId, date, payload);
  }
}

export function enrichWorkflowPayload(
  payload: WorkflowPayload,
  completedBy: string
): WorkflowPayload {
  const base = {
    ...payload,
    completedAt: payload.completedAt || new Date().toISOString(),
    completedBy: payload.completedBy || completedBy,
    workflowStatus: 'recorded',
  };
  switch (payload.workflowType) {
    case 'grooming':
      return {
        ...base,
        chartSummary: buildGroomingChartSummary(payload),
      };
    case 'vaccination':
      return {
        ...base,
        chartSummary: buildVaccinationChartSummary(payload),
      };
    case 'deworming':
      return {
        ...base,
        chartSummary: buildDewormingChartSummary(payload),
      };
  }
}

export function createEmptyGroomingSections(): GroomingWorkflowPayload['sections'] {
  return {
    arrival: {},
    assignment: {},
    assessment: {},
    process: createProcessSteps(GROOMING_PROCESS_STEPS),
    upsells: {},
    complete: {},
    quality: {},
    notification: {},
    checkout: {},
  };
}

export function createEmptyVaccinationSections(): VaccinationWorkflowPayload['sections'] {
  return {
    arrival: {},
    screening: {},
    exam: { fitnessOutcome: '' },
    plan: {},
    process: { steps: createProcessSteps(VACCINATION_PROCESS_STEPS), vaccines: [] },
    documentation: {},
    communication: {},
    checkout: {},
    followUp: {},
  };
}

export function createEmptyDewormingSections(): DewormingWorkflowPayload['sections'] {
  return {
    arrival: {},
    triage: {},
    exam: { fitnessOutcome: '' },
    plan: {},
    administration: { steps: createProcessSteps(DEWORMING_PROCESS_STEPS) },
    documentation: {},
    communication: {},
    checkout: {},
    followUp: {},
  };
}
