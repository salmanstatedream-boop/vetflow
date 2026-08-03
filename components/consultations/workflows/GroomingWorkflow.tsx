'use client';

import { useState } from 'react';
import type {
  FitnessOutcome,
  GroomingConditionFlag,
  GroomingWorkflowSections,
  WorkflowPrescriptionItem,
} from '@/lib/consultations/workflow-types';
import { GROOMING_TYPE_OPTIONS } from '@/lib/consultations/workflow-config';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';
import WorkflowRxPanel, {
  type CatalogProduct,
} from '@/components/consultations/workflows/WorkflowRxPanel';

export type StaffMember = { id: string; name: string };

type GroomingWorkflowProps = {
  stepId: string;
  sections: GroomingWorkflowSections;
  onChange: (sections: GroomingWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
  visitReason?: string;
  medicineProducts: CatalogProduct[];
  noPrescriptionNeeded: boolean;
  onNoPrescriptionNeededChange: (value: boolean) => void;
  prescriptionItems: WorkflowPrescriptionItem[];
  onPrescriptionItemsChange: (items: WorkflowPrescriptionItem[]) => void;
};

function numOrEmpty(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '' : String(v);
}

export default function GroomingWorkflow({
  stepId,
  sections,
  onChange,
  visitReason,
  medicineProducts,
  noPrescriptionNeeded,
  onNoPrescriptionNeededChange,
  prescriptionItems,
  onPrescriptionItemsChange,
}: GroomingWorkflowProps) {
  const [customCondition, setCustomCondition] = useState('');
  const patch = <K extends keyof GroomingWorkflowSections>(
    key: K,
    value: GroomingWorkflowSections[K]
  ) => onChange({ ...sections, [key]: value });

  if (stepId === 'assessment') {
    const assessment = sections.assessment;
    const flags: GroomingConditionFlag[] = assessment.conditionFlags ?? [];
    const typeOptions = Array.from(
      new Set([
        ...GROOMING_TYPE_OPTIONS,
        ...(visitReason?.trim() ? [visitReason.trim()] : []),
        ...(assessment.groomingType ? [assessment.groomingType] : []),
      ])
    );

    return (
      <div className="space-y-4">
        <WorkflowSectionCard title="Vitals">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(
              [
                ['temperatureC', 'Temp (°C)'],
                ['heartRateBpm', 'Heart rate'],
                ['respiratoryRate', 'Resp. rate'],
                ['weightKg', 'Weight (kg)'],
                ['bodyConditionScore', 'Body condition'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input
                  type="number"
                  step="any"
                  value={numOrEmpty(assessment[key])}
                  onChange={(e) =>
                    patch('assessment', {
                      ...assessment,
                      [key]: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Exam & Grooming">
          <div>
            <label className={labelClass}>Medical history</label>
            <textarea
              value={assessment.medicalHistory ?? ''}
              onChange={(e) => patch('assessment', { ...assessment, medicalHistory: e.target.value })}
              className={textareaClass}
            />
          </div>
          <div>
            <label className={labelClass}>Physical examination</label>
            <textarea
              value={assessment.physicalExam ?? ''}
              onChange={(e) => patch('assessment', { ...assessment, physicalExam: e.target.value })}
              className={textareaClass}
              placeholder="Full body scan notes / recommendations"
            />
          </div>
          <div>
            <label className={labelClass}>Condition checks</label>
            <div className="flex flex-wrap gap-2">
              {flags.map((flag) => (
                <label
                  key={flag.key}
                  className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border border-outline-variant/40 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={flag.checked}
                    onChange={(e) =>
                      patch('assessment', {
                        ...assessment,
                        conditionFlags: flags.map((f) =>
                          f.key === flag.key ? { ...f, checked: e.target.checked } : f
                        ),
                      })
                    }
                  />
                  {flag.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Add custom condition"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => {
                  const label = customCondition.trim();
                  if (!label) return;
                  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                  if (flags.some((f) => f.key === key)) return;
                  patch('assessment', {
                    ...assessment,
                    conditionFlags: [...flags, { key, label, checked: true }],
                  });
                  setCustomCondition('');
                }}
                className="text-[10px] font-bold text-primary px-3 rounded-lg border border-primary/30 shrink-0"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Grooming type *</label>
            <select
              value={assessment.groomingType ?? ''}
              onChange={(e) =>
                patch('assessment', { ...assessment, groomingType: e.target.value })
              }
              className={fieldClass}
            >
              <option value="">Select type</option>
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </WorkflowSectionCard>
      </div>
    );
  }

  if (stepId === 'wrapup') {
    const assessment = sections.assessment;
    const complete = sections.complete;
    const checked = (assessment.conditionFlags ?? [])
      .filter((f) => f.checked)
      .map((f) => f.label)
      .join(', ');
    const summary = [
      `Grooming type: ${assessment.groomingType || '—'}`,
      checked ? `Conditions: ${checked}` : null,
      `Fitness: ${assessment.fitnessOutcome || '—'}`,
      assessment.vetConsultEnabled ? 'Vet consult: yes' : 'Vet consult: no',
    ]
      .filter(Boolean)
      .join('\n');

    return (
      <div className="space-y-4">
        <WorkflowSectionCard title="Services">
          <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(assessment.vetConsultEnabled)}
              onChange={(e) =>
                patch('assessment', { ...assessment, vetConsultEnabled: e.target.checked })
              }
            />
            Vet consult
          </label>
          {assessment.vetConsultEnabled ? (
            <div className="space-y-3 pt-2 border-t border-outline-variant/30">
              <div>
                <label className={labelClass}>Vet consultation / treatment plan *</label>
                <textarea
                  value={assessment.treatmentPlan ?? ''}
                  onChange={(e) =>
                    patch('assessment', { ...assessment, treatmentPlan: e.target.value })
                  }
                  className={textareaClass}
                />
              </div>
              <div>
                <label className={labelClass}>Administered medication</label>
                <textarea
                  value={assessment.administeredMedication ?? ''}
                  onChange={(e) =>
                    patch('assessment', {
                      ...assessment,
                      administeredMedication: e.target.value,
                    })
                  }
                  className={textareaClass}
                />
              </div>
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Fitness outcome *</label>
            <select
              value={assessment.fitnessOutcome ?? ''}
              onChange={(e) =>
                patch('assessment', {
                  ...assessment,
                  fitnessOutcome: e.target.value as FitnessOutcome,
                })
              }
              className={fieldClass}
            >
              <option value="">Select outcome</option>
              <option value="fit">Fit</option>
              <option value="not_fit">Not fit</option>
            </select>
          </div>
        </WorkflowSectionCard>

        <WorkflowRxPanel
          summary={summary}
          notes={complete.groomingNotes ?? ''}
          onNotesChange={(value) => patch('complete', { ...complete, groomingNotes: value })}
          notesLabel="Notes / recommendations (shown on owner prescription copy) *"
          noPrescriptionNeeded={noPrescriptionNeeded}
          onNoPrescriptionNeededChange={onNoPrescriptionNeededChange}
          prescriptionItems={prescriptionItems}
          onPrescriptionItemsChange={onPrescriptionItemsChange}
          medicineProducts={medicineProducts}
        />
      </div>
    );
  }

  return null;
}
