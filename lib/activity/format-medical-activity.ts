export const MEDICAL_ACTIVITY_ACTIONS = [
  'CLINICAL_NOTE_CREATED',
  'CLINICAL_NOTE_UPDATED',
  'PRESCRIPTION_CREATED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_DELETED',
  'LAB_ORDER_CREATED',
  'LAB_ORDER_UPDATED',
  'VISIT_READY_FOR_CHECKOUT',
] as const;

const ACTION_LABELS: Record<string, string> = {
  CLINICAL_NOTE_CREATED: 'Consultation recorded',
  CLINICAL_NOTE_UPDATED: 'Clinical notes updated',
  PRESCRIPTION_CREATED: 'Prescription issued',
  DOCUMENT_UPLOADED: 'Document uploaded',
  DOCUMENT_DELETED: 'Document removed',
  LAB_ORDER_CREATED: 'Lab order placed',
  LAB_ORDER_UPDATED: 'Lab results updated',
  VISIT_READY_FOR_CHECKOUT: 'Consultation finalized',
};

export function isDraftSaveActivity(after: Record<string, unknown> | null): boolean {
  return after?.consult_draft_saved === true;
}

export function formatMedicalActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildMedicalActivityDetail(after: Record<string, unknown> | null, resourceType: string): string {
  if (!after) return resourceType;

  const parts: string[] = [];
  const petName = after.patient_name ?? after.pet_name;
  if (typeof petName === 'string' && petName.trim()) parts.push(petName.trim());

  const reason = after.visit_reason ?? after.reason;
  if (typeof reason === 'string' && reason.trim()) parts.push(reason.trim());

  if (after.diagnosis && typeof after.diagnosis === 'string') parts.push(after.diagnosis.trim());

  const medicines = after.medicine_names;
  if (Array.isArray(medicines) && medicines.length > 0) {
    parts.push(`${medicines.length} medicine${medicines.length === 1 ? '' : 's'}`);
  } else if (typeof after.medicine_count === 'number' && after.medicine_count > 0) {
    parts.push(`${after.medicine_count} medicine${after.medicine_count === 1 ? '' : 's'}`);
  }

  if (after.file_name && typeof after.file_name === 'string') parts.push(after.file_name);

  if (after.status && typeof after.status === 'string' && parts.length === 0) {
    parts.push(after.status);
  }

  return parts.length > 0 ? parts.join(' · ') : resourceType;
}
