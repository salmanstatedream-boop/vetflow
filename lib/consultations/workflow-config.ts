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
  { key: 'verify', label: 'Verify patient & vaccine' },
  { key: 'administer', label: 'Administer vaccine' },
  { key: 'observe', label: 'Observe 15–20 min' },
  { key: 'record', label: 'Record vaccine details' },
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

export const GROOMING_CONDITION_PRESETS = [
  { key: 'dehydration', label: 'Dehydration' },
  { key: 'ticks', label: 'Ticks' },
  { key: 'fungus', label: 'Fungus' },
  { key: 'fleas', label: 'Fleas' },
] as const;

export const GROOMING_TYPE_OPTIONS = [
  'Bath',
  'Nail cutting',
  'Full groom',
  'Haircut / Trim',
  'Ear cleaning',
  'De-shedding',
  'Other',
] as const;

export function createProcessSteps(keys: { key: string; label: string }[]): ProcessStep[] {
  return keys.map((k) => ({ key: k.key, label: k.label, status: 'not_started', notes: '' }));
}

export const groomingWorkflowConfig: WorkflowConfig = {
  workflowType: 'grooming',
  label: 'Grooming',
  badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  steps: [
    {
      id: 'assessment',
      label: 'Exam & Grooming',
      description: 'Vitals, history, condition checks & grooming type',
    },
    {
      id: 'wrapup',
      label: 'Services & Rx',
      description: 'Notes, optional vet consult, prescription & summary',
    },
  ],
  processStepKeys: GROOMING_PROCESS_STEPS,
};

export const vaccinationWorkflowConfig: WorkflowConfig = {
  workflowType: 'vaccination',
  label: 'Vaccination',
  badgeClass: 'bg-green-500/15 text-green-300 border-green-500/30',
  steps: [
    {
      id: 'clinical',
      label: 'Exam & Fitness',
      description: 'Vitals, exam, fitness & vaccination type',
    },
    {
      id: 'wrapup',
      label: 'Vaccines & Rx',
      description: 'Vaccine products, dates, notes & prescription',
    },
  ],
  processStepKeys: VACCINATION_PROCESS_STEPS,
};

export const dewormingWorkflowConfig: WorkflowConfig = {
  workflowType: 'deworming',
  label: 'Deworming',
  badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  steps: [
    {
      id: 'exam',
      label: 'Exam & Fitness',
      description: 'Vitals, exam, fitness & deworming type',
    },
    {
      id: 'treatment',
      label: 'Deworming & Rx',
      description: 'Dewormer product, dates, notes & prescription',
    },
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

export function normalizeWorkflowStepId(
  workflowType: 'grooming' | 'vaccination' | 'deworming',
  stepId: string
): string {
  const config = getWorkflowConfig(workflowType);
  if (config.steps.some((s) => s.id === stepId)) return stepId;

  if (workflowType === 'vaccination') {
    const clinical = ['arrival', 'screening', 'exam', 'plan', 'process', 'clinical'];
    const wrapup = ['documentation', 'communication', 'checkout', 'followUp', 'report', 'wrapup'];
    if (clinical.includes(stepId)) return 'clinical';
    if (wrapup.includes(stepId)) return 'wrapup';
  }

  if (workflowType === 'deworming') {
    const exam = ['arrival', 'triage', 'exam', 'plan'];
    const treatment = [
      'administration',
      'documentation',
      'communication',
      'checkout',
      'followUp',
      'report',
      'treatment',
      'wrapup',
    ];
    if (exam.includes(stepId)) return 'exam';
    if (treatment.includes(stepId)) return 'treatment';
  }

  if (workflowType === 'grooming') {
    const assessment = ['arrival', 'assignment', 'assessment', 'process', 'upsells'];
    const wrapup = [
      'complete',
      'quality',
      'notification',
      'checkout',
      'report',
      'wrapup',
    ];
    if (assessment.includes(stepId)) return 'assessment';
    if (wrapup.includes(stepId)) return 'wrapup';
  }

  return config.steps[0]?.id ?? stepId;
}
