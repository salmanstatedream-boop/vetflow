'use client';

import type { DewormingWorkflowSections } from '@/lib/consultations/workflow-types';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';
import ChecklistFields from '@/components/consultations/workflows/ChecklistFields';
import ProcessStepTracker from '@/components/consultations/workflows/ProcessStepTracker';
import type { StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';

type DewormingWorkflowProps = {
  stepId: string;
  sections: DewormingWorkflowSections;
  onChange: (sections: DewormingWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
};

const NOTIFICATION_CHANNELS = ['SMS', 'Email', 'App', 'WhatsApp'];

export default function DewormingWorkflow({
  stepId,
  sections,
  onChange,
  staffMembers,
}: DewormingWorkflowProps) {
  const patch = <K extends keyof DewormingWorkflowSections>(
    key: K,
    value: DewormingWorkflowSections[K]
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
            { key: 'previousRecordsNotes', label: 'Previous records', type: 'textarea' },
            { key: 'dewormingHistory', label: 'Deworming history', type: 'textarea' },
            { key: 'vaccinationRecordNotes', label: 'Vaccination record', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('arrival', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'triage') {
    const s = sections.triage;
    return (
      <WorkflowSectionCard title="History & Triage">
        <ChecklistFields
          items={[
            { key: 'appetite', label: 'Appetite', type: 'text' },
            { key: 'stoolQuality', label: 'Stool quality', type: 'text' },
            { key: 'vomitingDiarrhea', label: 'Vomiting/diarrhea', type: 'text' },
            { key: 'weightLoss', label: 'Weight loss', type: 'text' },
            { key: 'coughSneezing', label: 'Cough/sneezing', type: 'text' },
            { key: 'itchingSkin', label: 'Itching/skin issues', type: 'text' },
            { key: 'lethargy', label: 'Lethargy', type: 'text' },
            { key: 'otherSymptoms', label: 'Other symptoms', type: 'textarea' },
            { key: 'medications', label: 'Current medications', type: 'textarea' },
            { key: 'travelExposure', label: 'Travel/exposure', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('triage', { ...s, [key]: value })}
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
            { key: 'hydrationStatus', label: 'Hydration status', type: 'text' },
            { key: 'bodyCondition', label: 'Body condition', type: 'text' },
            { key: 'abdominalPalpation', label: 'Abdominal palpation', type: 'textarea' },
            { key: 'parasiteSigns', label: 'Signs of parasites', type: 'textarea' },
            { key: 'previousHistoryReview', label: 'Previous deworming history', type: 'textarea' },
            { key: 'fecalTestRequired', label: 'Fecal test required' },
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
            <option value="fit">Fit for deworming</option>
            <option value="not_fit">Not fit — treatment/reschedule</option>
          </select>
        </div>
        {s.fitnessOutcome === 'not_fit' ? (
          <div className="space-y-3 pt-2 border-t border-outline-variant/30">
            <div>
              <label className={labelClass}>Reason *</label>
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
              <label className={labelClass}>Follow-up date</label>
              <input
                type="date"
                value={s.followUpDate ?? ''}
                onChange={(e) => patch('exam', { ...s, followUpDate: e.target.value })}
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
      <WorkflowSectionCard title="Deworming Plan">
        <ChecklistFields
          items={[
            { key: 'dewormerName', label: 'Dewormer name', type: 'text' },
            { key: 'dosage', label: 'Dosage', type: 'text' },
            { key: 'route', label: 'Route', type: 'text' },
            { key: 'parasiteRisk', label: 'Parasite risk/type', type: 'text' },
            { key: 'previousDewormer', label: 'Previous dewormer', type: 'text' },
            { key: 'scheduleNotes', label: 'Schedule', type: 'textarea' },
            { key: 'ownerConfirmed', label: 'Owner confirmed' },
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

  if (stepId === 'administration') {
    const adm = sections.administration;
  if (sections.exam.fitnessOutcome === 'not_fit') {
      return (
        <WorkflowSectionCard title="Deworming Administration">
          <p className="text-xs text-amber-400">Patient not fit — administration skipped.</p>
        </WorkflowSectionCard>
      );
    }
    return (
      <WorkflowSectionCard title="Deworming Administration Process">
        <ProcessStepTracker
          steps={adm.steps}
          onChange={(steps) => patch('administration', { ...adm, steps })}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-outline-variant/30">
          <div>
            <label className={labelClass}>Dewormer name *</label>
            <input
              value={adm.dewormerName ?? sections.plan.dewormerName ?? ''}
              onChange={(e) => patch('administration', { ...adm, dewormerName: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Batch number</label>
            <input
              value={adm.batchNumber ?? ''}
              onChange={(e) => patch('administration', { ...adm, batchNumber: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dose given *</label>
            <input
              value={adm.doseGiven ?? sections.plan.dosage ?? ''}
              onChange={(e) => patch('administration', { ...adm, doseGiven: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Route *</label>
            <input
              value={adm.route ?? sections.plan.route ?? ''}
              onChange={(e) => patch('administration', { ...adm, route: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              value={adm.weightKg ?? ''}
              onChange={(e) =>
                patch('administration', {
                  ...adm,
                  weightKg: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Next dose due *</label>
            <input
              type="date"
              value={adm.nextDoseDate ?? ''}
              onChange={(e) => patch('administration', { ...adm, nextDoseDate: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Administered by *</label>
            <select
              value={adm.administeredById ?? ''}
              onChange={(e) => {
                const m = staffMembers.find((s) => s.id === e.target.value);
                patch('administration', {
                  ...adm,
                  administeredById: e.target.value,
                  administeredByName: m?.name ?? '',
                });
              }}
              className={fieldClass}
            >
              <option value="">Select staff</option>
              {staffMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Observation notes</label>
          <textarea
            value={adm.observationNotes ?? ''}
            onChange={(e) => patch('administration', { ...adm, observationNotes: e.target.value })}
            className={textareaClass}
          />
        </div>
        <div>
          <label className={labelClass}>Post-deworming advice</label>
          <textarea
            value={adm.postAdvice ?? ''}
            onChange={(e) => patch('administration', { ...adm, postAdvice: e.target.value })}
            className={textareaClass}
          />
        </div>
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'documentation') {
    const s = sections.documentation;
    return (
      <WorkflowSectionCard title="Documentation & Records">
        <ChecklistFields
          items={[
            { key: 'recordsUpdated', label: 'Records updated' },
            { key: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('documentation', { ...s, [key]: value })}
        />
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
            { key: 'reminderSet', label: 'Reminder set' },
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
            { key: 'dewormerChargeNotes', label: 'Dewormer charge', type: 'textarea' },
            { key: 'productsNotes', label: 'Products/add-ons', type: 'textarea' },
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
            { key: 'adverseReactionNotes', label: 'Adverse reaction', type: 'textarea' },
            { key: 'nextReminderDate', label: 'Next reminder', type: 'text' },
            { key: 'wellnessReminder', label: 'Wellness reminder' },
          ]}
          values={s}
          onChange={(key, value) => patch('followUp', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'report') {
    const adm = sections.administration;
    return (
      <WorkflowSectionCard title="Deworming Report">
        <p className="text-xs text-on-surface-variant">
          Complete to save to Deworming Chart and proceed to checkout.
        </p>
        <div className="text-[10px] text-on-surface-variant space-y-1 mt-2">
          <p>Outcome: {sections.exam.fitnessOutcome || '—'}</p>
          <p>Dewormer: {adm.dewormerName || sections.plan.dewormerName || '—'}</p>
          <p>Next dose: {adm.nextDoseDate || '—'}</p>
        </div>
      </WorkflowSectionCard>
    );
  }

  return null;
}
