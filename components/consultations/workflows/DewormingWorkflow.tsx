'use client';

import type {
  DewormingFormType,
  DewormingWorkflowSections,
  WorkflowPrescriptionItem,
} from '@/lib/consultations/workflow-types';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';
import WorkflowRxPanel, {
  type CatalogProduct,
} from '@/components/consultations/workflows/WorkflowRxPanel';
import type { StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';

type DewormingWorkflowProps = {
  stepId: string;
  sections: DewormingWorkflowSections;
  onChange: (sections: DewormingWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
  dewormerProducts: CatalogProduct[];
  medicineProducts: CatalogProduct[];
  noPrescriptionNeeded: boolean;
  onNoPrescriptionNeededChange: (value: boolean) => void;
  prescriptionItems: WorkflowPrescriptionItem[];
  onPrescriptionItemsChange: (items: WorkflowPrescriptionItem[]) => void;
};

function numOrEmpty(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '' : String(v);
}

export default function DewormingWorkflow({
  stepId,
  sections,
  onChange,
  staffMembers,
  dewormerProducts,
  medicineProducts,
  noPrescriptionNeeded,
  onNoPrescriptionNeededChange,
  prescriptionItems,
  onPrescriptionItemsChange,
}: DewormingWorkflowProps) {
  const patch = <K extends keyof DewormingWorkflowSections>(
    key: K,
    value: DewormingWorkflowSections[K]
  ) => onChange({ ...sections, [key]: value });

  if (stepId === 'exam') {
    const exam = sections.exam;
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
                  value={numOrEmpty(exam[key])}
                  onChange={(e) =>
                    patch('exam', {
                      ...exam,
                      [key]: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        </WorkflowSectionCard>

        <WorkflowSectionCard title="Exam & Fitness">
          <div>
            <label className={labelClass}>Physical examination</label>
            <textarea
              value={exam.physicalExam ?? ''}
              onChange={(e) => patch('exam', { ...exam, physicalExam: e.target.value })}
              className={textareaClass}
            />
          </div>
          <div>
            <label className={labelClass}>Medical history</label>
            <textarea
              value={exam.previousHistoryReview ?? ''}
              onChange={(e) => patch('exam', { ...exam, previousHistoryReview: e.target.value })}
              className={textareaClass}
            />
          </div>
          <div>
            <label className={labelClass}>Fitness outcome *</label>
            <select
              value={exam.fitnessOutcome}
              onChange={(e) =>
                patch('exam', {
                  ...exam,
                  fitnessOutcome: e.target.value as typeof exam.fitnessOutcome,
                })
              }
              className={fieldClass}
            >
              <option value="">Select outcome</option>
              <option value="fit">Fit for deworming</option>
              <option value="not_fit">Not fit — reschedule</option>
            </select>
          </div>
          {exam.fitnessOutcome === 'not_fit' ? (
            <div>
              <label className={labelClass}>Reason *</label>
              <textarea
                value={exam.notFitReason ?? ''}
                onChange={(e) => patch('exam', { ...exam, notFitReason: e.target.value })}
                className={textareaClass}
              />
            </div>
          ) : null}
          <div>
            <label className={labelClass}>Deworming type *</label>
            <select
              value={exam.dewormingFormType ?? ''}
              onChange={(e) =>
                patch('exam', {
                  ...exam,
                  dewormingFormType: e.target.value as DewormingFormType,
                })
              }
              className={fieldClass}
            >
              <option value="">Select type</option>
              <option value="liquid">Liquid</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </WorkflowSectionCard>
      </div>
    );
  }

  if (stepId === 'treatment') {
    const admin = sections.administration;
    const exam = sections.exam;
    const summary = [
      `Fitness: ${exam.fitnessOutcome || '—'}`,
      `Form: ${exam.dewormingFormType || '—'}`,
      `${admin.dewormerName || 'Dewormer'} — due ${admin.nextDoseDate || '—'}`,
    ].join('\n');

    return (
      <div className="space-y-4">
        {exam.fitnessOutcome === 'not_fit' ? (
          <WorkflowSectionCard title="Deworming">
            <p className="text-xs text-amber-400">
              Patient not fit — dewormer administration skipped. Complete Rx / notes if needed.
            </p>
          </WorkflowSectionCard>
        ) : (
          <WorkflowSectionCard title="Deworming">
            {dewormerProducts.length === 0 ? (
              <p className="text-xs text-amber-400">
                No inventory products tagged as Deworming. Add a dewormer product in Inventory to
                select it here.
              </p>
            ) : null}
            <div>
              <label className={labelClass}>Type of deworming *</label>
              <select
                value={admin.productId ?? ''}
                onChange={(e) => {
                  const selected = dewormerProducts.find((p) => p.id === e.target.value);
                  patch('administration', {
                    ...admin,
                    productId: e.target.value,
                    dewormerName: selected?.name ?? '',
                    weightKg: admin.weightKg ?? exam.weightKg ?? null,
                    administeredAt:
                      admin.administeredAt || new Date().toISOString().slice(0, 10),
                  });
                }}
                className={fieldClass}
              >
                <option value="">Select dewormer from inventory</option>
                {dewormerProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Administered on *</label>
                <input
                  type="date"
                  value={(admin.administeredAt ?? '').slice(0, 10)}
                  onChange={(e) =>
                    patch('administration', { ...admin, administeredAt: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>Valid until *</label>
                <input
                  type="date"
                  value={admin.nextDoseDate ?? ''}
                  onChange={(e) =>
                    patch('administration', { ...admin, nextDoseDate: e.target.value })
                  }
                  className={fieldClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Dose"
                value={admin.doseGiven ?? ''}
                onChange={(e) =>
                  patch('administration', { ...admin, doseGiven: e.target.value })
                }
                className={fieldClass}
              />
              <select
                value={admin.administeredById ?? ''}
                onChange={(e) => {
                  const m = staffMembers.find((s) => s.id === e.target.value);
                  patch('administration', {
                    ...admin,
                    administeredById: e.target.value,
                    administeredByName: m?.name ?? '',
                  });
                }}
                className={fieldClass}
              >
                <option value="">Administered by</option>
                {staffMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Valid until creates a follow-up deworming appointment on the reception schedule.
            </p>
          </WorkflowSectionCard>
        )}

        <WorkflowRxPanel
          summary={summary}
          notes={sections.communication.careInstructions ?? ''}
          onNotesChange={(value) =>
            patch('communication', { ...sections.communication, careInstructions: value })
          }
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
