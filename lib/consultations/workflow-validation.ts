import { z } from 'zod';
import type {
  DewormingWorkflowPayload,
  GroomingWorkflowPayload,
  VaccinationWorkflowPayload,
  WorkflowPayload,
} from '@/lib/consultations/workflow-types';

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

export const WorkflowConsultDraftSchema = z.object({
  kind: z.literal('workflow'),
  workflowType: z.enum(['grooming', 'vaccination', 'deworming']),
  currentStepId: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  serviceItems: z.array(WorkflowServiceItemSchema).optional(),
  noPrescriptionNeeded: z.boolean().optional(),
});

export const CompleteWorkflowConsultationSchema = z.object({
  visitId: z.string().uuid(),
  workflowType: z.enum(['grooming', 'vaccination', 'deworming']),
  workflowPayload: z.record(z.string(), z.unknown()),
  serviceItems: z.array(WorkflowServiceItemSchema).default([]),
  noPrescriptionNeeded: z.boolean().default(true),
});

export type CompleteWorkflowConsultationInput = z.infer<typeof CompleteWorkflowConsultationSchema>;

function hasProcessProgress(steps: { status: string }[] | undefined): boolean {
  if (!steps?.length) return false;
  return steps.some((s) => s.status === 'completed' || s.status === 'skipped');
}

export function validateGroomingComplete(payload: GroomingWorkflowPayload): string | null {
  const { assignment, assessment, process, complete } = payload.sections;
  if (!assignment.groomerName?.trim() && !assignment.groomerId) {
    return 'Assign a groomer before completing.';
  }
  if (!assessment.coatCondition?.trim()) {
    return 'Coat condition is required in grooming assessment.';
  }
  if (!hasProcessProgress(process)) {
    return 'Mark at least one grooming process step as completed or skipped.';
  }
  if (!complete.coatEven) {
    return 'Confirm coat is even/neat in the completion checklist.';
  }
  if (!complete.nailsTrimmed) {
    return 'Confirm nails are trimmed in the completion checklist.';
  }
  if (!complete.groomingNotes?.trim()) {
    return 'Grooming notes are required before completing.';
  }
  return null;
}

export function validateVaccinationComplete(payload: VaccinationWorkflowPayload): string | null {
  const { exam, process } = payload.sections;
  if (!exam.fitnessOutcome) {
    return 'Select fitness outcome (fit or not fit for vaccination).';
  }
  if (exam.fitnessOutcome === 'not_fit') {
    if (!exam.notFitReason?.trim()) {
      return 'Provide reason when patient is not fit for vaccination.';
    }
    return null;
  }
  const vaccines = process.vaccines ?? [];
  if (vaccines.length === 0) {
    return 'Record at least one vaccine administered.';
  }
  const first = vaccines[0];
  if (!first.name?.trim()) return 'Vaccine name is required.';
  if (!first.lotNumber?.trim()) return 'Lot number is required.';
  if (!first.route?.trim()) return 'Route is required.';
  if (!first.administeredByName?.trim() && !first.administeredById) {
    return 'Administered by is required.';
  }
  const hasDue = vaccines.some((v) => v.nextDueDate?.trim());
  if (!hasDue) return 'Next due date is required for at least one vaccine.';
  return null;
}

export function validateDewormingComplete(payload: DewormingWorkflowPayload): string | null {
  const { exam, administration } = payload.sections;
  if (!exam.fitnessOutcome) {
    return 'Select fitness outcome (fit or not fit for deworming).';
  }
  if (exam.fitnessOutcome === 'not_fit') {
    if (!exam.notFitReason?.trim()) {
      return 'Provide reason when patient is not fit for deworming.';
    }
    return null;
  }
  if (!administration.dewormerName?.trim()) return 'Dewormer name is required.';
  if (!administration.doseGiven?.trim()) return 'Dose is required.';
  if (!administration.route?.trim()) return 'Route is required.';
  if (administration.weightKg == null || Number.isNaN(administration.weightKg)) {
    return 'Weight at visit is required.';
  }
  if (!administration.administeredByName?.trim() && !administration.administeredById) {
    return 'Administered by is required.';
  }
  if (!administration.nextDoseDate?.trim()) {
    return 'Next dose due date is required.';
  }
  return null;
}

export function validateWorkflowComplete(payload: WorkflowPayload): string | null {
  switch (payload.workflowType) {
    case 'grooming':
      return validateGroomingComplete(payload);
    case 'vaccination':
      return validateVaccinationComplete(payload);
    case 'deworming':
      return validateDewormingComplete(payload);
  }
}

export function parseWorkflowPayload(raw: unknown): WorkflowPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.workflowType;
  if (type !== 'grooming' && type !== 'vaccination' && type !== 'deworming') return null;
  return raw as WorkflowPayload;
}
