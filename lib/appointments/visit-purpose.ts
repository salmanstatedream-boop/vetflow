import { z } from 'zod';

export const VISIT_PURPOSE_VALUES = [
  'vaccination',
  'wellness',
  'sick_visit',
  'surgery',
  'grooming',
  'deworming',
  'follow_up',
  'other',
] as const;

export const WORKFLOW_VISIT_PURPOSES = ['grooming', 'vaccination', 'deworming'] as const;
export type WorkflowVisitPurpose = (typeof WORKFLOW_VISIT_PURPOSES)[number];

export function isWorkflowVisitPurpose(
  purpose: string | null | undefined
): purpose is WorkflowVisitPurpose {
  return WORKFLOW_VISIT_PURPOSES.includes(purpose as WorkflowVisitPurpose);
}

export type VisitPurpose = (typeof VISIT_PURPOSE_VALUES)[number];

export const VisitPurposeSchema = z.enum(VISIT_PURPOSE_VALUES);

export const VISIT_PURPOSE_LABELS: Record<VisitPurpose, string> = {
  vaccination: 'Vaccination',
  wellness: 'Wellness / Check-up',
  sick_visit: 'Sick visit',
  surgery: 'Surgery',
  grooming: 'Grooming',
  deworming: 'Deworming',
  follow_up: 'Follow-up',
  other: 'Other',
};

export const VISIT_PURPOSE_OPTIONS = VISIT_PURPOSE_VALUES.map((value) => ({
  value,
  label: VISIT_PURPOSE_LABELS[value],
}));

export function visitPurposeLabel(purpose: string | null | undefined): string {
  if (!purpose) return VISIT_PURPOSE_LABELS.other;
  return VISIT_PURPOSE_LABELS[purpose as VisitPurpose] ?? purpose;
}

export function defaultReasonForVisitPurpose(purpose: VisitPurpose): string {
  return VISIT_PURPOSE_LABELS[purpose];
}
