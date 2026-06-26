'use client';

import type { ProcessStep, ProcessStepStatus } from '@/lib/consultations/workflow-types';
import { fieldClass, labelClass } from '@/components/consultations/workflows/WorkflowSectionCard';

const STATUS_OPTIONS: { value: ProcessStepStatus; label: string }[] = [
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
];

type ProcessStepTrackerProps = {
  steps: ProcessStep[];
  onChange: (steps: ProcessStep[]) => void;
};

export default function ProcessStepTracker({ steps, onChange }: ProcessStepTrackerProps) {
  const updateStep = (index: number, patch: Partial<ProcessStep>) => {
    const next = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-2 p-2.5 rounded-lg bg-surface-container/20 border border-outline-variant/30"
        >
          <div>
            <p className="text-xs font-semibold text-on-surface">{step.label}</p>
            <input
              type="text"
              value={step.notes ?? ''}
              onChange={(e) => updateStep(index, { notes: e.target.value })}
              placeholder="Notes (optional)"
              className={`${fieldClass} mt-1.5`}
            />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={step.status}
              onChange={(e) => updateStep(index, { status: e.target.value as ProcessStepStatus })}
              className={fieldClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
