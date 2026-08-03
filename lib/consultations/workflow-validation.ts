import { z } from 'zod';
import type {
  DewormingWorkflowPayload,
  DewormingWorkflowSections,
  GroomingWorkflowPayload,
  GroomingWorkflowSections,
  VaccinationWorkflowPayload,
  VaccinationWorkflowSections,
  WorkflowPayload,
  WorkflowPrescriptionItem,
} from '@/lib/consultations/workflow-types';
import { normalizeWorkflowStepId } from '@/lib/consultations/workflow-config';

const ProcessStepSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']),
  notes: z.string().optional(),
});

export const WorkflowServiceItemSchema = z.object({
  serviceId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const WorkflowPrescriptionItemSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  medicineName: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  quantityRequested: z.number().positive(),
  instructions: z.string().optional(),
});

export const WorkflowConsultDraftSchema = z.object({
  kind: z.literal('workflow'),
  workflowType: z.enum(['grooming', 'vaccination', 'deworming']),
  currentStepId: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  serviceItems: z.array(WorkflowServiceItemSchema).optional(),
  noPrescriptionNeeded: z.boolean().optional(),
  prescriptionItems: z.array(WorkflowPrescriptionItemSchema).optional(),
  maxUnlockedIndex: z.number().int().nonnegative().optional(),
});

export const CompleteWorkflowConsultationSchema = z.object({
  visitId: z.string().uuid(),
  workflowType: z.enum(['grooming', 'vaccination', 'deworming']),
  workflowPayload: z.record(z.string(), z.unknown()),
  serviceItems: z.array(WorkflowServiceItemSchema).default([]),
  noPrescriptionNeeded: z.boolean().default(false),
  prescriptionItems: z.array(WorkflowPrescriptionItemSchema).default([]),
});

export type CompleteWorkflowConsultationInput = z.infer<typeof CompleteWorkflowConsultationSchema>;

function hasVitalFields(values: {
  temperatureC?: number | null;
  heartRateBpm?: number | null;
  respiratoryRate?: number | null;
  weightKg?: number | null;
  bodyConditionScore?: number | null;
}): boolean {
  return (
    (values.temperatureC != null && !Number.isNaN(values.temperatureC)) ||
    (values.heartRateBpm != null && !Number.isNaN(values.heartRateBpm)) ||
    (values.respiratoryRate != null && !Number.isNaN(values.respiratoryRate)) ||
    (values.weightKg != null && !Number.isNaN(values.weightKg)) ||
    (values.bodyConditionScore != null && !Number.isNaN(values.bodyConditionScore))
  );
}

export function isWorkflowPrescriptionLineComplete(item: WorkflowPrescriptionItem): boolean {
  return Boolean(
    item.medicineName?.trim() &&
      item.dosage?.trim() &&
      item.frequency?.trim() &&
      item.duration?.trim() &&
      item.quantityRequested > 0
  );
}

function validateRxGate(
  noPrescriptionNeeded: boolean,
  prescriptionItems: WorkflowPrescriptionItem[] | undefined
): string | null {
  if (noPrescriptionNeeded) return null;
  const items = prescriptionItems ?? [];
  if (!items.length) {
    return 'Add at least one prescription line or check "No prescription needed".';
  }
  for (let i = 0; i < items.length; i++) {
    if (!isWorkflowPrescriptionLineComplete(items[i])) {
      return `Complete all required fields for prescription line ${i + 1}.`;
    }
  }
  return null;
}

export function validateVaccinationStep(
  stepId: string,
  sections: VaccinationWorkflowSections
): string | null {
  const normalized = normalizeWorkflowStepId('vaccination', stepId);
  if (normalized === 'clinical') {
    const { screening, exam } = sections;
    if (!exam.fitnessOutcome) {
      return 'Select fitness outcome (fit or not fit for vaccination).';
    }
    if (exam.fitnessOutcome === 'not_fit' && !exam.notFitReason?.trim()) {
      return 'Provide reason when patient is not fit for vaccination.';
    }
    if (!exam.vaccinationScheduleType) {
      return 'Select vaccination type (First / Booster / Annual booster).';
    }
    const hasExam = Boolean(exam.physicalExam?.trim() || exam.medicalHistoryReview?.trim());
    if (!hasExam && !hasVitalFields(screening)) {
      return 'Add physical exam / medical history or at least one vital before continuing.';
    }
    return null;
  }
  return null;
}

export function validateDewormingStep(
  stepId: string,
  sections: DewormingWorkflowSections
): string | null {
  const normalized = normalizeWorkflowStepId('deworming', stepId);
  if (normalized === 'exam') {
    const { exam } = sections;
    if (!exam.fitnessOutcome) {
      return 'Select fitness outcome (fit or not fit for deworming).';
    }
    if (exam.fitnessOutcome === 'not_fit' && !exam.notFitReason?.trim()) {
      return 'Provide reason when patient is not fit for deworming.';
    }
    if (!exam.dewormingFormType) {
      return 'Select deworming type (Liquid / Tab).';
    }
    const hasExam = Boolean(exam.physicalExam?.trim() || exam.previousHistoryReview?.trim());
    if (!hasExam && !hasVitalFields(exam)) {
      return 'Add physical exam / medical history or at least one vital before continuing.';
    }
    return null;
  }
  return null;
}

export function validateGroomingStep(
  stepId: string,
  sections: GroomingWorkflowSections
): string | null {
  const normalized = normalizeWorkflowStepId('grooming', stepId);
  if (normalized === 'assessment') {
    const { assessment } = sections;
    if (!assessment.groomingType?.trim()) {
      return 'Select a grooming type before continuing.';
    }
    const hasExam = Boolean(
      assessment.physicalExam?.trim() ||
        assessment.medicalHistory?.trim() ||
        assessment.assessmentNotes?.trim()
    );
    if (!hasExam && !hasVitalFields(assessment)) {
      return 'Add physical exam / medical history or at least one vital before continuing.';
    }
    return null;
  }
  return null;
}

export function validateWorkflowStep(
  workflowType: 'grooming' | 'vaccination' | 'deworming',
  stepId: string,
  sections: GroomingWorkflowSections | VaccinationWorkflowSections | DewormingWorkflowSections
): string | null {
  switch (workflowType) {
    case 'vaccination':
      return validateVaccinationStep(stepId, sections as VaccinationWorkflowSections);
    case 'deworming':
      return validateDewormingStep(stepId, sections as DewormingWorkflowSections);
    case 'grooming':
      return validateGroomingStep(stepId, sections as GroomingWorkflowSections);
  }
}

export function validateVaccinationComplete(
  payload: VaccinationWorkflowPayload,
  noPrescriptionNeeded = false,
  prescriptionItems: WorkflowPrescriptionItem[] = []
): string | null {
  const stepError = validateVaccinationStep('clinical', payload.sections);
  if (stepError) return stepError;

  const { exam, process } = payload.sections;
  if (exam.fitnessOutcome === 'not_fit') {
    return validateRxGate(noPrescriptionNeeded, prescriptionItems);
  }

  const vaccines = process.vaccines ?? [];
  if (vaccines.length === 0) {
    return 'Record at least one vaccine administered.';
  }
  const first = vaccines[0];
  if (!first.productId?.trim()) {
    return 'Select a vaccine from inventory.';
  }
  if (!first.name?.trim()) return 'Vaccine name is required.';
  if (!first.administeredAt?.trim()) return 'Administered on date is required.';
  if (!first.nextDueDate?.trim()) return 'Valid until date is required for the primary vaccine.';

  const rxError = validateRxGate(noPrescriptionNeeded, prescriptionItems);
  if (rxError) return rxError;
  return null;
}

export function validateDewormingComplete(
  payload: DewormingWorkflowPayload,
  noPrescriptionNeeded = false,
  prescriptionItems: WorkflowPrescriptionItem[] = []
): string | null {
  const stepError = validateDewormingStep('exam', payload.sections);
  if (stepError) return stepError;

  const { exam, administration } = payload.sections;
  if (exam.fitnessOutcome === 'not_fit') {
    return validateRxGate(noPrescriptionNeeded, prescriptionItems);
  }

  if (!administration.productId?.trim()) {
    return 'Select a dewormer from inventory.';
  }
  if (!administration.dewormerName?.trim()) return 'Dewormer name is required.';
  if (!administration.administeredAt?.trim()) return 'Administered on date is required.';
  if (!administration.nextDoseDate?.trim()) return 'Valid until date is required.';

  const rxError = validateRxGate(noPrescriptionNeeded, prescriptionItems);
  if (rxError) return rxError;
  return null;
}

export function validateGroomingComplete(
  payload: GroomingWorkflowPayload,
  noPrescriptionNeeded = false,
  prescriptionItems: WorkflowPrescriptionItem[] = []
): string | null {
  const stepError = validateGroomingStep('assessment', payload.sections);
  if (stepError) return stepError;

  const { assessment, complete } = payload.sections;
  if (!complete.groomingNotes?.trim() && !assessment.assessmentNotes?.trim()) {
    return 'Add notes / recommendations before completing.';
  }
  if (assessment.vetConsultEnabled && !assessment.treatmentPlan?.trim()) {
    return 'Enter a treatment plan when Vet consult is checked.';
  }
  if (!assessment.fitnessOutcome) {
    return 'Select fitness outcome before completing.';
  }
  if (assessment.fitnessOutcome === 'not_fit' && !assessment.assessmentNotes?.trim()) {
    return 'Add notes when patient is not fit.';
  }

  const rxError = validateRxGate(noPrescriptionNeeded, prescriptionItems);
  if (rxError) return rxError;
  return null;
}

export function validateWorkflowComplete(
  payload: WorkflowPayload,
  noPrescriptionNeeded = false,
  prescriptionItems: WorkflowPrescriptionItem[] = []
): string | null {
  switch (payload.workflowType) {
    case 'grooming':
      return validateGroomingComplete(payload, noPrescriptionNeeded, prescriptionItems);
    case 'vaccination':
      return validateVaccinationComplete(payload, noPrescriptionNeeded, prescriptionItems);
    case 'deworming':
      return validateDewormingComplete(payload, noPrescriptionNeeded, prescriptionItems);
  }
}

export function parseWorkflowPayload(raw: unknown): WorkflowPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.workflowType;
  if (type !== 'grooming' && type !== 'vaccination' && type !== 'deworming') return null;
  return raw as WorkflowPayload;
}

/** Kept for schema consumers that previously imported ProcessStepSchema indirectly. */
export { ProcessStepSchema };
