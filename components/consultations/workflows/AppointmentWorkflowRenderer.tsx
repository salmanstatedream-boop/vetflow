'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { WorkflowVisitPurpose } from '@/lib/appointments/visit-purpose';
import { getWorkflowConfig } from '@/lib/consultations/workflow-config';
import {
  createEmptyDewormingSections,
  createEmptyGroomingSections,
  createEmptyVaccinationSections,
} from '@/lib/consultations/workflow-chart';
import type {
  DewormingWorkflowPayload,
  DewormingWorkflowSections,
  GroomingWorkflowPayload,
  GroomingWorkflowSections,
  VaccinationWorkflowPayload,
  VaccinationWorkflowSections,
  WorkflowConsultDraft,
} from '@/lib/consultations/workflow-types';
import {
  completeWorkflowConsultationAction,
  saveWorkflowDraftAction,
} from '@/lib/services/clinical-actions';
import GroomingWorkflow, { type StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';
import VaccinationWorkflow from '@/components/consultations/workflows/VaccinationWorkflow';
import DewormingWorkflow from '@/components/consultations/workflows/DewormingWorkflow';
import ConsultationStepProgressBar from '@/components/consultation/ConsultationStepProgressBar';

type CatalogService = {
  id: string;
  name: string;
  price: number;
};

type WorkflowSectionsState =
  | GroomingWorkflowSections
  | VaccinationWorkflowSections
  | DewormingWorkflowSections;

type AppointmentWorkflowRendererProps = {
  visitId: string;
  patientId: string;
  workflowType: WorkflowVisitPurpose;
  initialDraft: WorkflowConsultDraft | null;
  staffMembers: StaffMember[];
  catalogServices: CatalogService[];
};

function initialSections(workflowType: WorkflowVisitPurpose): WorkflowSectionsState {
  switch (workflowType) {
    case 'grooming':
      return createEmptyGroomingSections();
    case 'vaccination':
      return createEmptyVaccinationSections();
    case 'deworming':
      return createEmptyDewormingSections();
  }
}

function mergeSections(
  workflowType: WorkflowVisitPurpose,
  partial: Partial<WorkflowSectionsState> | undefined
): WorkflowSectionsState {
  const base = initialSections(workflowType);
  if (!partial) return base;
  return { ...base, ...partial } as WorkflowSectionsState;
}

export default function AppointmentWorkflowRenderer({
  visitId,
  patientId,
  workflowType,
  initialDraft,
  staffMembers,
  catalogServices,
}: AppointmentWorkflowRendererProps) {
  const router = useRouter();
  const config = getWorkflowConfig(workflowType);
  const [currentStepId, setCurrentStepId] = useState(
    initialDraft?.currentStepId ?? config.steps[0]?.id ?? 'arrival'
  );
  const [sections, setSections] = useState<WorkflowSectionsState>(() =>
    mergeSections(workflowType, initialDraft?.payload as Partial<WorkflowSectionsState>)
  );
  const [serviceItems, setServiceItems] = useState(
    initialDraft?.serviceItems ??
      catalogServices
        .filter((s) => s.name.toLowerCase().includes(workflowType.replace('_', '')))
        .slice(0, 1)
        .map((s) => ({
          serviceId: s.id,
          name: s.name,
          unitPrice: s.price,
          quantity: 1,
        }))
  );
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = useMemo(
    () => config.steps.findIndex((s) => s.id === currentStepId),
    [config.steps, currentStepId]
  );

  const buildPayload = useCallback((): GroomingWorkflowPayload | VaccinationWorkflowPayload | DewormingWorkflowPayload => {
    const groomingSections = sections as GroomingWorkflowSections;
    const vaccinationSections = sections as VaccinationWorkflowSections;
    const base = {
      workflowType,
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
      documentIds: {
        before:
          workflowType === 'grooming' ? groomingSections.arrival.beforePhotoIds : undefined,
        after:
          workflowType === 'grooming' ? groomingSections.complete.afterPhotoIds : undefined,
        certificate:
          workflowType === 'vaccination'
            ? vaccinationSections.arrival.certificateDocumentId
            : undefined,
      },
    };
    return base as GroomingWorkflowPayload | VaccinationWorkflowPayload | DewormingWorkflowPayload;
  }, [workflowType, sections]);

  const saveDraft = useCallback(async () => {
    setSaving(true);
    setError(null);
    const draft: WorkflowConsultDraft = {
      kind: 'workflow',
      workflowType,
      currentStepId,
      payload: sections,
      serviceItems,
      noPrescriptionNeeded: true,
    };
    const res = await saveWorkflowDraftAction(visitId, draft);
    setSaving(false);
    if (res.success) {
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } else {
      setError(res.error ?? 'Failed to save draft');
    }
  }, [visitId, workflowType, currentStepId, sections, serviceItems]);

  const goNext = async () => {
    await saveDraft();
    const next = config.steps[currentStepIndex + 1];
    if (next) setCurrentStepId(next.id);
  };

  const goPrev = () => {
    const prev = config.steps[currentStepIndex - 1];
    if (prev) setCurrentStepId(prev.id);
  };

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    const payload = buildPayload();
    const res = await completeWorkflowConsultationAction({
      visitId,
      workflowType,
      workflowPayload: payload,
      serviceItems,
      noPrescriptionNeeded: true,
    });
    setCompleting(false);
    if (res.success) {
      router.refresh();
    } else {
      setError(res.error ?? 'Failed to complete workflow');
    }
  };

  const isLastStep = currentStepIndex === config.steps.length - 1;

  return (
    <div className="space-y-4">
      <ConsultationStepProgressBar active={saving || completing} />

      <div className="flex items-center gap-1 p-1 glass-panel rounded-xl border border-outline-variant/40 overflow-x-auto">
        {config.steps.map((step, index) => {
          const active = step.id === currentStepId;
          const done = index < currentStepIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStepId(step.id)}
              className={`shrink-0 px-2.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                active
                  ? 'bg-primary text-white'
                  : done
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/60 hover:bg-surface-container/40'
              }`}
            >
              {index + 1}. {step.label}
            </button>
          );
        })}
      </div>

      {draftSaved ? (
        <p className="text-[10px] text-green-400 font-semibold">Draft saved</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      {workflowType === 'grooming' ? (
        <GroomingWorkflow
          stepId={currentStepId}
          sections={sections as GroomingWorkflowSections}
          onChange={(s) => setSections(s)}
          staffMembers={staffMembers}
          visitId={visitId}
          patientId={patientId}
        />
      ) : null}
      {workflowType === 'vaccination' ? (
        <VaccinationWorkflow
          stepId={currentStepId}
          sections={sections as VaccinationWorkflowSections}
          onChange={(s) => setSections(s)}
          staffMembers={staffMembers}
          visitId={visitId}
          patientId={patientId}
        />
      ) : null}
      {workflowType === 'deworming' ? (
        <DewormingWorkflow
          stepId={currentStepId}
          sections={sections as DewormingWorkflowSections}
          onChange={(s) => setSections(s)}
          staffMembers={staffMembers}
          visitId={visitId}
          patientId={patientId}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStepIndex <= 0 || saving || completing}
          className="text-xs font-semibold text-on-surface-variant px-4 py-2 rounded-lg border border-outline-variant/50 disabled:opacity-40"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void saveDraft()}
            disabled={saving || completing}
            className="text-xs font-semibold text-primary px-4 py-2 rounded-lg border border-primary/30 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save draft'}
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={completing}
              className="text-xs font-bold text-white bg-primary px-5 py-2 rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
            >
              {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Complete workflow
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={saving || completing}
              className="text-xs font-bold text-white bg-primary px-5 py-2 rounded-lg disabled:opacity-50"
            >
              Next section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
