'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { VaccinationWorkflowSections, VaccineRecord } from '@/lib/consultations/workflow-types';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';
import ChecklistFields from '@/components/consultations/workflows/ChecklistFields';
import ProcessStepTracker from '@/components/consultations/workflows/ProcessStepTracker';
import WorkflowDocumentUpload from '@/components/consultations/workflows/WorkflowDocumentUpload';
import type { StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';

type VaccinationWorkflowProps = {
  stepId: string;
  sections: VaccinationWorkflowSections;
  onChange: (sections: VaccinationWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
};

const NOTIFICATION_CHANNELS = ['SMS', 'Email', 'App', 'WhatsApp'];

function newVaccine(): VaccineRecord {
  return {
    id: crypto.randomUUID(),
    name: '',
    type: '',
    manufacturer: '',
    lotNumber: '',
    expiryDate: '',
    dose: '',
    route: '',
    site: '',
    administeredAt: new Date().toISOString().slice(0, 16),
    administeredById: '',
    administeredByName: '',
    nextDueDate: '',
    reactionNotes: '',
  };
}

export default function VaccinationWorkflow({
  stepId,
  sections,
  onChange,
  staffMembers,
  visitId,
  patientId,
}: VaccinationWorkflowProps) {
  const patch = <K extends keyof VaccinationWorkflowSections>(
    key: K,
    value: VaccinationWorkflowSections[K]
  ) => onChange({ ...sections, [key]: value });

  if (stepId === 'arrival') {
    const s = sections.arrival;
    return (
      <WorkflowSectionCard title="Arrival / Check-in">
        <ChecklistFields
          items={[
            { key: 'verifyAppointment', label: 'Verify appointment' },
            { key: 'ownerConfirmed', label: 'Confirm owner identity' },
            { key: 'petConfirmed', label: 'Confirm pet details' },
            { key: 'emergencyContact', label: 'Emergency contact', type: 'text' },
            { key: 'reasonForVisit', label: 'Reason for visit', type: 'text' },
            { key: 'previousVaccineNotes', label: 'Previous vaccine records', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('arrival', { ...s, [key]: value })}
        />
        <WorkflowDocumentUpload
          visitId={visitId}
          patientId={patientId}
          category="vaccine"
          label="Upload vaccine certificate (if any)"
          documentIds={s.certificateDocumentId ? [s.certificateDocumentId] : []}
          onDocumentIdsChange={(ids) =>
            patch('arrival', { ...s, certificateDocumentId: ids[ids.length - 1] })
          }
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'screening') {
    const s = sections.screening;
    return (
      <WorkflowSectionCard title="Pre-vaccine Screening">
        <ChecklistFields
          items={[
            { key: 'generalHealthCheck', label: 'General health check', type: 'textarea' },
            { key: 'temperatureC', label: 'Temperature (°C)', type: 'number' },
            { key: 'weightKg', label: 'Weight (kg)', type: 'number' },
            { key: 'heartRateBpm', label: 'Heart rate (bpm)', type: 'number' },
            { key: 'bodyConditionScore', label: 'Body condition (1-9)', type: 'number' },
            { key: 'appetite', label: 'Appetite', type: 'text' },
            { key: 'energyLevel', label: 'Energy level', type: 'text' },
            { key: 'vomitingDiarrhea', label: 'Vomiting/diarrhea', type: 'text' },
            { key: 'coughSneezing', label: 'Cough/sneezing', type: 'text' },
            { key: 'medications', label: 'Medications', type: 'textarea' },
            { key: 'allergies', label: 'Allergies', type: 'textarea' },
            { key: 'previousReaction', label: 'Previous vaccine reaction', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('screening', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'exam') {
    const s = sections.exam;
    return (
      <WorkflowSectionCard title="Veterinary Exam">
        <ChecklistFields
          items={[
            { key: 'physicalExam', label: 'Physical examination', type: 'textarea' },
            { key: 'medicalHistoryReview', label: 'Medical history review', type: 'textarea' },
            { key: 'vaccinePlanDiscussion', label: 'Vaccine plan discussion', type: 'textarea' },
            { key: 'ownerQuestions', label: 'Owner questions', type: 'textarea' },
            { key: 'consentObtained', label: 'Consent obtained' },
          ]}
          values={s}
          onChange={(key, value) => patch('exam', { ...s, [key]: value })}
        />
        <div>
          <label className={labelClass}>Fitness outcome *</label>
          <select
            value={s.fitnessOutcome}
            onChange={(e) =>
              patch('exam', { ...s, fitnessOutcome: e.target.value as typeof s.fitnessOutcome })
            }
            className={fieldClass}
          >
            <option value="">Select outcome</option>
            <option value="fit">Fit for vaccination</option>
            <option value="not_fit">Not fit — reschedule</option>
          </select>
        </div>
        {s.fitnessOutcome === 'not_fit' ? (
          <div className="space-y-3 pt-2 border-t border-outline-variant/30">
            <div>
              <label className={labelClass}>Explain condition / reason *</label>
              <textarea
                value={s.notFitReason ?? ''}
                onChange={(e) => patch('exam', { ...s, notFitReason: e.target.value })}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Treatment / advice</label>
              <textarea
                value={s.treatmentAdvice ?? ''}
                onChange={(e) => patch('exam', { ...s, treatmentAdvice: e.target.value })}
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Recheck date</label>
              <input
                type="date"
                value={s.recheckDate ?? ''}
                onChange={(e) => patch('exam', { ...s, recheckDate: e.target.value })}
                className={fieldClass}
              />
            </div>
          </div>
        ) : null}
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'plan') {
    const s = sections.plan;
    return (
      <WorkflowSectionCard title="Vaccine Plan">
        <ChecklistFields
          items={[
            { key: 'coreVaccines', label: 'Core vaccines', type: 'textarea' },
            { key: 'nonCoreVaccines', label: 'Non-core vaccines', type: 'textarea' },
            { key: 'boosterNotes', label: 'Booster / annual', type: 'textarea' },
            { key: 'travelBoardingNotes', label: 'Travel/boarding requirements', type: 'textarea' },
            { key: 'ownerConfirmed', label: 'Owner confirmed plan' },
            { key: 'benefitsDiscussed', label: 'Benefits discussed' },
            { key: 'sideEffectsDiscussed', label: 'Side effects discussed' },
            { key: 'costEstimate', label: 'Cost estimate', type: 'number' },
          ]}
          values={s}
          onChange={(key, value) => patch('plan', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'process') {
    const proc = sections.process;
    const vaccines = proc.vaccines ?? [];

    const updateVaccine = (id: string, patchV: Partial<VaccineRecord>) => {
      patch('process', {
        ...proc,
        vaccines: vaccines.map((v) => (v.id === id ? { ...v, ...patchV } : v)),
      });
    };

    return (
      <WorkflowSectionCard title="Vaccination Process">
        {sections.exam.fitnessOutcome === 'not_fit' ? (
          <p className="text-xs text-amber-400">Patient not fit — administration steps skipped.</p>
        ) : (
          <>
            <ProcessStepTracker
              steps={proc.steps}
              onChange={(steps) => patch('process', { ...proc, steps })}
            />
            <div className="space-y-3 pt-3 border-t border-outline-variant/30">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-primary uppercase">Vaccines administered</p>
                <button
                  type="button"
                  onClick={() =>
                    patch('process', { ...proc, vaccines: [...vaccines, newVaccine()] })
                  }
                  className="text-[10px] font-bold text-primary inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add vaccine
                </button>
              </div>
              {vaccines.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-lg bg-surface-container/20 border border-outline-variant/30 space-y-2"
                >
                  <div className="flex justify-between">
                    <p className="text-xs font-semibold text-on-surface">Vaccine record</p>
                    <button
                      type="button"
                      onClick={() =>
                        patch('process', {
                          ...proc,
                          vaccines: vaccines.filter((x) => x.id !== v.id),
                        })
                      }
                      className="text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      placeholder="Vaccine name *"
                      value={v.name}
                      onChange={(e) => updateVaccine(v.id, { name: e.target.value })}
                      className={fieldClass}
                    />
                    <select
                      value={v.type}
                      onChange={(e) =>
                        updateVaccine(v.id, { type: e.target.value as VaccineRecord['type'] })
                      }
                      className={fieldClass}
                    >
                      <option value="">Type</option>
                      <option value="core">Core</option>
                      <option value="non_core">Non-core</option>
                      <option value="booster">Booster</option>
                      <option value="titer">Titer</option>
                    </select>
                    <input
                      placeholder="Manufacturer"
                      value={v.manufacturer ?? ''}
                      onChange={(e) => updateVaccine(v.id, { manufacturer: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      placeholder="Lot number *"
                      value={v.lotNumber ?? ''}
                      onChange={(e) => updateVaccine(v.id, { lotNumber: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      type="date"
                      placeholder="Expiry"
                      value={v.expiryDate ?? ''}
                      onChange={(e) => updateVaccine(v.id, { expiryDate: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      placeholder="Dose"
                      value={v.dose ?? ''}
                      onChange={(e) => updateVaccine(v.id, { dose: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      placeholder="Route *"
                      value={v.route ?? ''}
                      onChange={(e) => updateVaccine(v.id, { route: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      placeholder="Site"
                      value={v.site ?? ''}
                      onChange={(e) => updateVaccine(v.id, { site: e.target.value })}
                      className={fieldClass}
                    />
                    <input
                      type="date"
                      placeholder="Next due *"
                      value={v.nextDueDate ?? ''}
                      onChange={(e) => updateVaccine(v.id, { nextDueDate: e.target.value })}
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
                      <option value="">Administered by *</option>
                      {staffMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>Post-vaccine care instructions</label>
              <textarea
                value={proc.postCareInstructions ?? ''}
                onChange={(e) =>
                  patch('process', { ...proc, postCareInstructions: e.target.value })
                }
                className={textareaClass}
              />
            </div>
            <div>
              <label className={labelClass}>Observation notes</label>
              <textarea
                value={proc.observationNotes ?? ''}
                onChange={(e) => patch('process', { ...proc, observationNotes: e.target.value })}
                className={textareaClass}
              />
            </div>
          </>
        )}
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'documentation') {
    const s = sections.documentation;
    return (
      <WorkflowSectionCard title="Documentation & Records">
        <ChecklistFields
          items={[
            { key: 'recordsUpdated', label: 'Medical record updated' },
            { key: 'immunizationHistoryUpdated', label: 'Immunization history updated' },
            { key: 'reminderSet', label: 'Next due reminder set' },
            { key: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('documentation', { ...s, [key]: value })}
        />
        <p className="text-[10px] text-on-surface-variant">
          Vaccine certificate can be generated after completing the workflow.
        </p>
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'communication') {
    const s = sections.communication;
    return (
      <WorkflowSectionCard title="Owner Communication">
        <ChecklistFields
          items={[
            { key: 'visitSummary', label: 'Visit summary', type: 'textarea' },
            { key: 'careInstructions', label: 'Care instructions', type: 'textarea' },
            { key: 'reactionsToWatch', label: 'Reactions to watch', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('communication', { ...s, [key]: value })}
        />
        <div className="flex flex-wrap gap-2">
          {NOTIFICATION_CHANNELS.map((ch) => {
            const selected = s.channels?.includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  const channels = s.channels ?? [];
                  patch('communication', {
                    ...s,
                    channels: selected ? channels.filter((c) => c !== ch) : [...channels, ch],
                  });
                }}
                className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
                  selected ? 'bg-primary/20 border-primary text-primary' : 'border-outline-variant/50'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'checkout') {
    const s = sections.checkout;
    return (
      <WorkflowSectionCard title="Checkout & Billing">
        <ChecklistFields
          items={[
            { key: 'servicesConfirmed', label: 'Services confirmed' },
            { key: 'vaccineChargesNotes', label: 'Vaccine charges', type: 'textarea' },
            { key: 'productsNotes', label: 'Products', type: 'textarea' },
            { key: 'paymentMethodNotes', label: 'Payment method', type: 'text' },
          ]}
          values={s}
          onChange={(key, value) => patch('checkout', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'followUp') {
    const s = sections.followUp;
    return (
      <WorkflowSectionCard title="Follow-up & Aftercare">
        <ChecklistFields
          items={[
            { key: 'checkInMessage', label: 'Check-in message', type: 'textarea' },
            { key: 'adverseReactionNotes', label: 'Adverse reaction record', type: 'textarea' },
            { key: 'nextReminderDate', label: 'Next reminder date', type: 'text' },
            { key: 'wellnessReminder', label: 'Annual wellness reminder' },
          ]}
          values={s}
          onChange={(key, value) => patch('followUp', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'report') {
    const v = sections.process.vaccines?.[0];
    return (
      <WorkflowSectionCard title="Vaccination Report">
        <p className="text-xs text-on-surface-variant">
          Complete to save to Vaccination Chart and proceed to checkout.
        </p>
        <div className="text-[10px] text-on-surface-variant space-y-1 mt-2">
          <p>Outcome: {sections.exam.fitnessOutcome || '—'}</p>
          <p>Vaccine: {v?.name || '—'}</p>
          <p>Next due: {v?.nextDueDate || '—'}</p>
        </div>
      </WorkflowSectionCard>
    );
  }

  return null;
}
