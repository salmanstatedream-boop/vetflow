import type { WorkflowChartRow } from '@/lib/consultations/workflow-types';

export function deriveObjectiveSignDefaults(records: WorkflowChartRow[]) {
  return {
    signVaccination: records.some((r) => r.workflowType === 'vaccination'),
    signDeworming: records.some((r) => r.workflowType === 'deworming'),
  };
}
