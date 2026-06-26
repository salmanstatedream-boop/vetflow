import type { ProcessStep } from '@/lib/consultations/workflow-types';

export type WorkflowStepDef = {
  id: string;
  label: string;
  description?: string;
};

export type WorkflowConfig = {
  workflowType: 'grooming' | 'vaccination' | 'deworming';
  label: string;
  badgeClass: string;
  steps: WorkflowStepDef[];
  processStepKeys: { key: string; label: string }[];
};

export const GROOMING_PROCESS_STEPS: { key: string; label: string }[] = [
  { key: 'bath', label: 'Bath' },
  { key: 'rinse', label: 'Rinse' },
  { key: 'dry', label: 'Dry' },
  { key: 'brush_deshed', label: 'Brush / De-shed' },
  { key: 'dematting', label: 'De-matting' },
  { key: 'haircut', label: 'Haircut / Trim' },
  { key: 'nail_trim', label: 'Nail trim / grind' },
  { key: 'ear_cleaning', label: 'Ear cleaning' },
  { key: 'paw_pad', label: 'Paw pad trim' },
  { key: 'sanitary', label: 'Sanitary trim' },
  { key: 'finishing', label: 'Finishing touches' },
];

export const VACCINATION_PROCESS_STEPS: { key: string; label: string }[] = [
  { key: 'prepare', label: 'Prepare' },
  { key: 'verify_patient', label: 'Verify patient' },
  { key: 'verify_vaccine', label: 'Verify vaccine' },
  { key: 'check_expiry', label: 'Check expiry date' },
  { key: 'check_vial', label: 'Check vial condition' },
  { key: 'shake', label: 'Shake if needed' },
  { key: 'prepare_dose', label: 'Prepare dose' },
  { key: 'select_site', label: 'Select injection site' },
  { key: 'administer', label: 'Administer vaccine' },
  { key: 'record', label: 'Record vaccine details' },
  { key: 'observe', label: 'Observe 15–20 min' },
  { key: 'post_care', label: 'Post-vaccine care' },
];

export const DEWORMING_PROCESS_STEPS: { key: string; label: string }[] = [
  { key: 'verify_dewormer', label: 'Verify dewormer' },
  { key: 'check_expiry', label: 'Check expiry date' },
  { key: 'check_dose', label: 'Check dose' },
  { key: 'calculate_dose', label: 'Calculate dose from weight' },
  { key: 'prepare', label: 'Prepare medicine' },
  { key: 'weigh', label: 'Weigh pet' },
  { key: 'confirm_identity', label: 'Confirm identity' },
  { key: 'double_check', label: 'Double-check dose' },
  { key: 'administer', label: 'Administer' },
  { key: 'swallow_check', label: 'Ensure swallow (oral)' },
  { key: 'record', label: 'Record details' },
  { key: 'observe', label: 'Observe 10–15 min' },
];

export function createProcessSteps(keys: { key: string; label: string }[]): ProcessStep[] {
  return keys.map((k) => ({ key: k.key, label: k.label, status: 'not_started', notes: '' }));
}

export const groomingWorkflowConfig: WorkflowConfig = {
  workflowType: 'grooming',
  label: 'Grooming',
  badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  steps: [
    { id: 'arrival', label: 'Arrival / Check-in' },
    { id: 'assignment', label: 'Groomer Assignment' },
    { id: 'assessment', label: 'Grooming Assessment' },
    { id: 'process', label: 'Grooming Process' },
    { id: 'upsells', label: 'Upsell Opportunities' },
    { id: 'complete', label: 'Grooming Complete' },
    { id: 'quality', label: 'Quality Review' },
    { id: 'notification', label: 'Customer Notification' },
    { id: 'checkout', label: 'Checkout Summary' },
    { id: 'report', label: 'Grooming Report' },
  ],
  processStepKeys: GROOMING_PROCESS_STEPS,
};

export const vaccinationWorkflowConfig: WorkflowConfig = {
  workflowType: 'vaccination',
  label: 'Vaccination',
  badgeClass: 'bg-green-500/15 text-green-300 border-green-500/30',
  steps: [
    { id: 'arrival', label: 'Arrival / Check-in' },
    { id: 'screening', label: 'Pre-vaccine Screening' },
    { id: 'exam', label: 'Veterinary Exam' },
    { id: 'plan', label: 'Vaccine Plan' },
    { id: 'process', label: 'Vaccination Process' },
    { id: 'documentation', label: 'Documentation & Records' },
    { id: 'communication', label: 'Owner Communication' },
    { id: 'checkout', label: 'Checkout & Billing' },
    { id: 'followUp', label: 'Follow-up & Aftercare' },
    { id: 'report', label: 'Vaccination Report' },
  ],
  processStepKeys: VACCINATION_PROCESS_STEPS,
};

export const dewormingWorkflowConfig: WorkflowConfig = {
  workflowType: 'deworming',
  label: 'Deworming',
  badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  steps: [
    { id: 'arrival', label: 'Arrival / Check-in' },
    { id: 'triage', label: 'History & Triage' },
    { id: 'exam', label: 'Veterinary Exam' },
    { id: 'plan', label: 'Deworming Plan' },
    { id: 'administration', label: 'Administration Process' },
    { id: 'documentation', label: 'Documentation & Records' },
    { id: 'communication', label: 'Owner Communication' },
    { id: 'checkout', label: 'Checkout & Billing' },
    { id: 'followUp', label: 'Follow-up & Aftercare' },
    { id: 'report', label: 'Deworming Report' },
  ],
  processStepKeys: DEWORMING_PROCESS_STEPS,
};

export function getWorkflowConfig(workflowType: 'grooming' | 'vaccination' | 'deworming'): WorkflowConfig {
  switch (workflowType) {
    case 'grooming':
      return groomingWorkflowConfig;
    case 'vaccination':
      return vaccinationWorkflowConfig;
    case 'deworming':
      return dewormingWorkflowConfig;
  }
}
