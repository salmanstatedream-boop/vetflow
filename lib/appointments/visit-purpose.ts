import { z } from 'zod';

export const VISIT_PURPOSE_VALUES = [
  'vaccination',
  'wellness',
  'sick_visit',
  'surgery',
  'grooming',
  'follow_up',
  'other',
] as const;

export type VisitPurpose = (typeof VISIT_PURPOSE_VALUES)[number];

export const VisitPurposeSchema = z.enum(VISIT_PURPOSE_VALUES);

export const VISIT_PURPOSE_LABELS: Record<VisitPurpose, string> = {
  vaccination: 'Vaccination',
  wellness: 'Wellness / Check-up',
  sick_visit: 'Sick visit',
  surgery: 'Surgery',
  grooming: 'Grooming',
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
