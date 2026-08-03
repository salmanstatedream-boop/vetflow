'use client';

import { useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type {
  VaccinationScheduleType,
  VaccinationWorkflowSections,
  VaccineRecord,
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

type VaccinationWorkflowProps = {
  stepId: string;
  sections: VaccinationWorkflowSections;
  onChange: (sections: VaccinationWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
  vaccineProducts: CatalogProduct[];
  medicineProducts: CatalogProduct[];
  noPrescriptionNeeded: boolean;
  onNoPrescriptionNeededChange: (value: boolean) => void;
  prescriptionItems: WorkflowPrescriptionItem[];
  onPrescriptionItemsChange: (items: WorkflowPrescriptionItem[]) => void;
};

function newVaccine(): VaccineRecord {
  return {
    id: crypto.randomUUID(),
    name: '',
    productId: '',
    type: '',
    administeredAt: new Date().toISOString().slice(0, 10),
    nextDueDate: '',
    lotNumber: '',
    route: '',
    administeredById: '',
    administeredByName: '',
  };
}

function numOrEmpty(v: number | null | undefined): string {
  return v == null || Number.isNaN(v) ? '' : String(v);
}

export default function VaccinationWorkflow({
  stepId,
  sections,
  onChange,
  staffMembers,
  vaccineProducts,
  medicineProducts,
  noPrescriptionNeeded,
  onNoPrescriptionNeededChange,
  prescriptionItems,
  onPrescriptionItemsChange,
}: VaccinationWorkflowProps) {
  const patch = <K extends keyof VaccinationWorkflowSections>(
    key: K,
    value: VaccinationWorkflowSections[K]
  ) => onChange({ ...sections, [key]: value });

  useEffect(() => {
    if (stepId !== 'wrapup') return;
    if ((sections.process.vaccines?.length ?? 0) > 0) return;
    onChange({
      ...sections,
      process: { ...sections.process, vaccines: [newVaccine()] },
    });
    // Seed once when wrap-up opens with an empty vaccine list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  if (stepId === 'clinical') {
    const screening = sections.screening;
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
                  value={numOrEmpty(screening[key])}
                  onChange={(e) =>
                    patch('screening', {
                      ...screening,
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
              value={exam.medicalHistoryReview ?? ''}
              onChange={(e) => patch('exam', { ...exam, medicalHistoryReview: e.target.value })}
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
              <option value="fit">Fit for vaccination</option>
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
            <label className={labelClass}>Vaccination type *</label>
            <select
              value={exam.vaccinationScheduleType ?? ''}
              onChange={(e) =>
                patch('exam', {
                  ...exam,
                  vaccinationScheduleType: e.target.value as VaccinationScheduleType,
                })
              }
              className={fieldClass}
            >
              <option value="">Select type</option>
              <option value="first">First</option>
              <option value="booster">Booster</option>
              <option value="annual_booster">Annual booster</option>
            </select>
          </div>
        </WorkflowSectionCard>
      </div>
    );
  }

  if (stepId === 'wrapup') {
    const proc = sections.process;
    const vaccines = proc.vaccines.length > 0 ? proc.vaccines : [newVaccine()];

    const writeVaccines = (next: VaccineRecord[]) => {
      patch('process', { ...proc, vaccines: next });
    };

    const updateVaccine = (id: string, patchV: Partial<VaccineRecord>) => {
      writeVaccines(vaccines.map((v) => (v.id === id ? { ...v, ...patchV } : v)));
    };

    const summary = [
      `Fitness: ${sections.exam.fitnessOutcome || '—'}`,
      `Schedule: ${sections.exam.vaccinationScheduleType || '—'}`,
      ...vaccines
        .filter((v) => v.name || v.productId)
        .map((v) => `${v.name || 'Vaccine'} — due ${v.nextDueDate || '—'}`),
    ].join('\n');

    return (
      <div className="space-y-4">
        {sections.exam.fitnessOutcome === 'not_fit' ? (
          <WorkflowSectionCard title="Vaccine">
            <p className="text-xs text-amber-400">
              Patient not fit — vaccine administration skipped. Complete Rx / notes if needed.
            </p>
          </WorkflowSectionCard>
        ) : (
          <WorkflowSectionCard title="Vaccine">
            {vaccineProducts.length === 0 ? (
              <p className="text-xs text-amber-400">
                No inventory products tagged as Vaccine. Add a vaccine product in Inventory to
                select it here.
              </p>
            ) : null}
            {vaccines.map((v, index) => (
              <div
                key={v.id}
                className="p-3 rounded-lg bg-surface-container/20 border border-outline-variant/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-on-surface">
                    {index === 0 ? 'Primary vaccine *' : 'Optional vaccine'}
                  </p>
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => writeVaccines(vaccines.filter((x) => x.id !== v.id))}
                      className="text-destructive"
                      aria-label="Remove optional vaccine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Type of vaccination *</label>
                  <select
                    value={v.productId ?? ''}
                    onChange={(e) => {
                      const selected = vaccineProducts.find((p) => p.id === e.target.value);
                      updateVaccine(v.id, {
                        productId: e.target.value,
                        name: selected?.name ?? '',
                        administeredAt:
                          v.administeredAt || new Date().toISOString().slice(0, 10),
                      });
                    }}
                    className={fieldClass}
                  >
                    <option value="">Select vaccine from inventory</option>
                    {vaccineProducts.map((p) => (
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
                      value={(v.administeredAt ?? '').slice(0, 10)}
                      onChange={(e) => updateVaccine(v.id, { administeredAt: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Valid until *</label>
                    <input
                      type="date"
                      value={v.nextDueDate ?? ''}
                      onChange={(e) => updateVaccine(v.id, { nextDueDate: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Lot number"
                    value={v.lotNumber ?? ''}
                    onChange={(e) => updateVaccine(v.id, { lotNumber: e.target.value })}
                    className={fieldClass}
                  />
                  <select
                    value={v.administeredById ?? ''}
                    onChange={(e) => {
                      const m = staffMembers.find((s) => s.id === e.target.value);
                      updateVaccine(v.id, {
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
              </div>
            ))}
            {vaccines.length < 2 ? (
              <button
                type="button"
                onClick={() => writeVaccines([...vaccines, newVaccine()])}
                className="text-[10px] font-bold text-primary inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add optional vaccine
              </button>
            ) : null}
            <p className="text-[10px] text-on-surface-variant">
              Valid until creates a follow-up vaccination appointment on the reception schedule.
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
