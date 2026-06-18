import type { FieldError, FieldErrors } from 'react-hook-form';
import type { SoapFlowTab } from '@/components/consultation/SoapTabBar';
import type { CompleteConsultationInput } from '@/lib/validations/schemas';

const FIELD_TAB_MAP: Record<string, SoapFlowTab> = {
  chiefComplaint: 'S',
  history: 'S',
  examinationFindings: 'O',
  temperatureC: 'O',
  heartRateBpm: 'O',
  respiratoryRate: 'O',
  weightKg: 'O',
  diagnosis: 'A',
  treatmentPlan: 'P',
  procedureNotes: 'P',
  postOpMedication: 'P',
  serviceItems: 'P',
  followUpMode: 'P',
  followUpOffsetDays: 'P',
  followUpConsecutive: 'P',
  followUpDays: 'P',
  followUpRecommendation: 'P',
  prescriptionItems: 'Rx',
  noPrescriptionNeeded: 'Rx',
};

export function mapZodIssueToTab(path: string[]): SoapFlowTab {
  const root = path[0];
  if (!root) return 'S';
  if (root === 'prescriptionItems') return 'Rx';
  if (root === 'serviceItems') return 'P';
  return FIELD_TAB_MAP[root] ?? 'S';
}

function isFieldError(value: unknown): value is FieldError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as FieldError).message === 'string'
  );
}

function findFirstError(
  errors: FieldErrors,
  path: string[] = []
): { path: string[]; message: string } | null {
  for (const key of Object.keys(errors)) {
    const value = errors[key as keyof typeof errors];
    if (value == null) continue;

    const currentPath = [...path, key];

    if (isFieldError(value) && value.message) {
      return { path: currentPath, message: value.message };
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && typeof item === 'object') {
          const nested = findFirstError(item as FieldErrors, [...currentPath, String(i)]);
          if (nested) return nested;
        }
      }
      continue;
    }

    if (typeof value === 'object') {
      const nested = findFirstError(value as FieldErrors, currentPath);
      if (nested) return nested;
    }
  }
  return null;
}

export function getFirstValidationIssue(
  errors: FieldErrors<CompleteConsultationInput>
): { tab: SoapFlowTab; message: string } {
  const found = findFirstError(errors);
  if (!found) {
    return {
      tab: 'S',
      message: 'Please complete all required fields before finalizing.',
    };
  }
  return {
    tab: mapZodIssueToTab(found.path),
    message: found.message,
  };
}
