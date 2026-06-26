'use client';

import type { GroomingWorkflowSections } from '@/lib/consultations/workflow-types';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';
import ChecklistFields from '@/components/consultations/workflows/ChecklistFields';
import ProcessStepTracker from '@/components/consultations/workflows/ProcessStepTracker';
import WorkflowDocumentUpload from '@/components/consultations/workflows/WorkflowDocumentUpload';

export type StaffMember = { id: string; name: string };

type GroomingWorkflowProps = {
  stepId: string;
  sections: GroomingWorkflowSections;
  onChange: (sections: GroomingWorkflowSections) => void;
  staffMembers: StaffMember[];
  visitId: string;
  patientId: string;
};

const NOTIFICATION_CHANNELS = ['SMS', 'Email', 'App', 'WhatsApp'];

export default function GroomingWorkflow({
  stepId,
  sections,
  onChange,
  staffMembers,
  visitId,
  patientId,
}: GroomingWorkflowProps) {
  const patch = <K extends keyof GroomingWorkflowSections>(
    key: K,
    value: GroomingWorkflowSections[K]
  ) => onChange({ ...sections, [key]: value });

  if (stepId === 'arrival') {
    const s = sections.arrival;
    return (
      <WorkflowSectionCard title="Arrival / Check-in" description="Confirm patient details and pre-groom checks">
        <ChecklistFields
          items={[
            { key: 'confirmOwnerPet', label: 'Confirm owner and pet' },
            { key: 'verifyAppointment', label: 'Verify appointment' },
            { key: 'vaccinationsVerified', label: 'Vaccinations verified' },
            { key: 'fleasTicksCheck', label: 'Fleas/ticks check' },
            { key: 'emergencyContact', label: 'Emergency contact', type: 'text' },
            { key: 'groomingHistoryNotes', label: 'Grooming history', type: 'textarea' },
            { key: 'medicalAlerts', label: 'Medical alerts', type: 'textarea' },
            { key: 'behaviorCheck', label: 'Behavior check', type: 'text' },
            { key: 'specialNeeds', label: 'Senior/pregnant/special needs', type: 'text' },
          ]}
          values={s}
          onChange={(key, value) => patch('arrival', { ...s, [key]: value })}
        />
        <WorkflowDocumentUpload
          visitId={visitId}
          patientId={patientId}
          category="grooming_before"
          label="Upload before photos"
          documentIds={s.beforePhotoIds ?? []}
          onDocumentIdsChange={(ids) => patch('arrival', { ...s, beforePhotoIds: ids })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'assignment') {
    const s = sections.assignment;
    return (
      <WorkflowSectionCard title="Groomer Assignment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Groomer</label>
            <select
              value={s.groomerId ?? ''}
              onChange={(e) => {
                const member = staffMembers.find((m) => m.id === e.target.value);
                patch('assignment', {
                  ...s,
                  groomerId: e.target.value,
                  groomerName: member?.name ?? '',
                });
              }}
              className={fieldClass}
            >
              <option value="">Select groomer</option>
              {staffMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Grooming station</label>
            <input
              value={s.station ?? ''}
              onChange={(e) => patch('assignment', { ...s, station: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Est. start</label>
            <input
              type="datetime-local"
              value={s.estimatedStart ?? ''}
              onChange={(e) => patch('assignment', { ...s, estimatedStart: e.target.value })}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Est. completion</label>
            <input
              type="datetime-local"
              value={s.estimatedCompletion ?? ''}
              onChange={(e) => patch('assignment', { ...s, estimatedCompletion: e.target.value })}
              className={fieldClass}
            />
          </div>
        </div>
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'assessment') {
    const s = sections.assessment;
    return (
      <WorkflowSectionCard title="Grooming Assessment">
        <ChecklistFields
          items={[
            { key: 'coatCondition', label: 'Coat condition *', type: 'text' },
            { key: 'matsTangles', label: 'Mats/tangles', type: 'text' },
            { key: 'skinCondition', label: 'Skin condition', type: 'text' },
            { key: 'earCondition', label: 'Ear condition', type: 'text' },
            { key: 'nailLength', label: 'Nail length', type: 'text' },
            { key: 'analGlands', label: 'Anal glands', type: 'text' },
            { key: 'fleasTicks', label: 'Fleas/ticks', type: 'text' },
            { key: 'weightKg', label: 'Weight (kg)', type: 'number' },
            { key: 'behaviorToday', label: 'Behavior today', type: 'text' },
            { key: 'abnormalFindings', label: 'Abnormal findings' },
            { key: 'vetConsultRecommended', label: 'Vet consultation recommended' },
            { key: 'assessmentNotes', label: 'Assessment notes', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('assessment', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'process') {
    return (
      <WorkflowSectionCard title="Grooming Process" description="Track each grooming step">
        <ProcessStepTracker
          steps={sections.process}
          onChange={(steps) => patch('process', steps)}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'upsells') {
    const s = sections.upsells;
    return (
      <WorkflowSectionCard title="Upsell Opportunities">
        <ChecklistFields
          items={[
            { key: 'severeMatting', label: 'Severe matting' },
            { key: 'fleaTickTreatment', label: 'Flea/tick treatment' },
            { key: 'medicatedShampoo', label: 'Medicated shampoo' },
            { key: 'deSheddingTreatment', label: 'De-shedding treatment' },
            { key: 'teethBrushing', label: 'Teeth brushing' },
            { key: 'nailGrinding', label: 'Nail grinding' },
            { key: 'extraTimeRequired', label: 'Extra time required' },
            { key: 'ownerApprovalRequired', label: 'Owner approval required' },
            { key: 'additionalFee', label: 'Additional fee', type: 'number' },
            { key: 'upsellNotes', label: 'Notes', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('upsells', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'complete') {
    const s = sections.complete;
    return (
      <WorkflowSectionCard title="Grooming Complete">
        <ChecklistFields
          items={[
            { key: 'coatEven', label: 'Coat even/neat' },
            { key: 'nailsTrimmed', label: 'Nails trimmed' },
            { key: 'earsCleaned', label: 'Ears cleaned' },
            { key: 'eyesCleaned', label: 'Eyes cleaned' },
            { key: 'pawsTrimmed', label: 'Paws trimmed' },
            { key: 'sanitaryClean', label: 'Sanitary area clean' },
            { key: 'requestsCompleted', label: 'Requests completed' },
            { key: 'behaviorGood', label: 'Behavior good' },
            { key: 'groomingNotes', label: 'Grooming notes *', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('complete', { ...s, [key]: value })}
        />
        <WorkflowDocumentUpload
          visitId={visitId}
          patientId={patientId}
          category="grooming_after"
          label="Upload after photos"
          documentIds={s.afterPhotoIds ?? []}
          onDocumentIdsChange={(ids) => patch('complete', { ...s, afterPhotoIds: ids })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'quality') {
    const s = sections.quality;
    return (
      <WorkflowSectionCard title="Quality Review">
        <ChecklistFields
          items={[
            { key: 'overallQuality', label: 'Overall quality', type: 'text' },
            { key: 'allServicesDone', label: 'All services done' },
            { key: 'missedAreas', label: 'Missed areas', type: 'textarea' },
            { key: 'upsellReviewed', label: 'Upsell services reviewed' },
            { key: 'petComfort', label: 'Pet comfort', type: 'text' },
          ]}
          values={s}
          onChange={(key, value) => patch('quality', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'notification') {
    const s = sections.notification;
    return (
      <WorkflowSectionCard title="Customer Notification">
        <ChecklistFields
          items={[
            { key: 'readyForPickup', label: 'Pet ready for pickup' },
            { key: 'summarySent', label: 'Summary prepared' },
            { key: 'invoiceEstimateNotes', label: 'Invoice estimate notes', type: 'textarea' },
          ]}
          values={s}
          onChange={(key, value) => patch('notification', { ...s, [key]: value })}
        />
        <div>
          <p className={labelClass}>Notification channels (recorded only)</p>
          <div className="flex flex-wrap gap-2">
            {NOTIFICATION_CHANNELS.map((ch) => {
              const selected = s.channels?.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => {
                    const channels = s.channels ?? [];
                    patch('notification', {
                      ...s,
                      channels: selected
                        ? channels.filter((c) => c !== ch)
                        : [...channels, ch],
                    });
                  }}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${
                    selected
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'border-outline-variant/50 text-on-surface-variant'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">
            Delivery not configured — preferences are saved to the record.
          </p>
        </div>
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'checkout') {
    const s = sections.checkout;
    return (
      <WorkflowSectionCard title="Checkout Summary" description="Finalize workflow to proceed to billing">
        <ChecklistFields
          items={[
            { key: 'servicesConfirmed', label: 'Services confirmed' },
            { key: 'productsNotes', label: 'Products', type: 'textarea' },
            { key: 'discountNotes', label: 'Discounts', type: 'textarea' },
            { key: 'tips', label: 'Tips', type: 'number' },
            { key: 'paymentMethodNotes', label: 'Payment method notes', type: 'text' },
          ]}
          values={s}
          onChange={(key, value) => patch('checkout', { ...s, [key]: value })}
        />
      </WorkflowSectionCard>
    );
  }

  if (stepId === 'report') {
    return (
      <WorkflowSectionCard title="Grooming Report" description="Review and complete the grooming workflow">
        <p className="text-xs text-on-surface-variant">
          Completing this workflow saves the grooming record to the pet&apos;s medical file and Grooming
          Chart tab, then moves the visit to checkout.
        </p>
        <div className="text-[10px] text-on-surface-variant space-y-1 mt-2">
          <p>Groomer: {sections.assignment.groomerName || '—'}</p>
          <p>Coat: {sections.assessment.coatCondition || '—'}</p>
          <p>Notes: {sections.complete.groomingNotes || '—'}</p>
        </div>
      </WorkflowSectionCard>
    );
  }

  return null;
}
