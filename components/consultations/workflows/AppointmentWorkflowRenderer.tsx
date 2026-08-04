'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2, Lock, Trash2 } from 'lucide-react';
import type { WorkflowVisitPurpose } from '@/lib/appointments/visit-purpose';
import {
  getWorkflowConfig,
  normalizeWorkflowStepId,
} from '@/lib/consultations/workflow-config';
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
  WorkflowPrescriptionItem,
} from '@/lib/consultations/workflow-types';
import { validateWorkflowStep } from '@/lib/consultations/workflow-validation';
import {
  completeWorkflowConsultationAction,
  saveWorkflowDraftAction,
} from '@/lib/services/clinical-actions';
import {
  isDewormerProductType,
  isVaccineProductType,
  normalizeProductTypeSlug,
} from '@/lib/inventory/product-types';
import GroomingWorkflow, { type StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';
import VaccinationWorkflow from '@/components/consultations/workflows/VaccinationWorkflow';
import DewormingWorkflow from '@/components/consultations/workflows/DewormingWorkflow';
import ConsultationStepProgressBar from '@/components/consultation/ConsultationStepProgressBar';
import type { CatalogProduct } from '@/components/consultations/workflows/WorkflowRxPanel';
import {
  matchCatalogService,
  serviceItemFromCatalog,
} from '@/lib/billing/match-catalog-service';

type CatalogService = {
  id: string;
  name: string;
  price: number;
};

type ServiceLine = {
  serviceId: string;
  name: string;
  unitPrice: number;
  quantity: number;
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
  products: CatalogProduct[];
  visitReason?: string;
  petSpecies?: string | null;
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
  const merged = { ...base, ...partial } as WorkflowSectionsState;
  if (workflowType === 'grooming') {
    const groomingBase = base as GroomingWorkflowSections;
    const groomingMerged = merged as GroomingWorkflowSections;
    groomingMerged.assessment = {
      ...groomingBase.assessment,
      ...groomingMerged.assessment,
      conditionFlags:
        groomingMerged.assessment.conditionFlags?.length
          ? groomingMerged.assessment.conditionFlags
          : groomingBase.assessment.conditionFlags,
    };
  }
  if (workflowType === 'vaccination') {
    const vaxBase = base as VaccinationWorkflowSections;
    const vaxMerged = merged as VaccinationWorkflowSections;
    vaxMerged.exam = { ...vaxBase.exam, ...vaxMerged.exam };
    vaxMerged.process = {
      ...vaxBase.process,
      ...vaxMerged.process,
      vaccines:
        vaxMerged.process.vaccines?.length > 0
          ? vaxMerged.process.vaccines
          : vaxBase.process.vaccines,
    };
  }
  if (workflowType === 'deworming') {
    const dewBase = base as DewormingWorkflowSections;
    const dewMerged = merged as DewormingWorkflowSections;
    dewMerged.exam = { ...dewBase.exam, ...dewMerged.exam };
  }
  return merged;
}

function computeInitialUnlock(
  workflowType: WorkflowVisitPurpose,
  sections: WorkflowSectionsState,
  draftUnlock?: number
): number {
  if (typeof draftUnlock === 'number' && draftUnlock >= 1) return 1;
  const firstStep = getWorkflowConfig(workflowType).steps[0]?.id ?? '';
  const err = validateWorkflowStep(workflowType, firstStep, sections);
  return err ? 0 : 1;
}

export default function AppointmentWorkflowRenderer({
  visitId,
  patientId,
  workflowType,
  initialDraft,
  staffMembers,
  catalogServices,
  products,
  visitReason,
  petSpecies,
}: AppointmentWorkflowRendererProps) {
  const config = getWorkflowConfig(workflowType);
  const [sections, setSections] = useState<WorkflowSectionsState>(() =>
    mergeSections(workflowType, initialDraft?.payload as Partial<WorkflowSectionsState>)
  );
  const [currentStepId, setCurrentStepId] = useState(() =>
    normalizeWorkflowStepId(
      workflowType,
      initialDraft?.currentStepId ?? config.steps[0]?.id ?? 'clinical'
    )
  );
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(() =>
    computeInitialUnlock(
      workflowType,
      mergeSections(workflowType, initialDraft?.payload as Partial<WorkflowSectionsState>),
      initialDraft?.maxUnlockedIndex
    )
  );
  const [serviceItems, setServiceItems] = useState<ServiceLine[]>(() => {
    if (initialDraft?.serviceItems?.length) {
      return initialDraft.serviceItems.map((item) => ({
        serviceId: item.serviceId || '',
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }));
    }
    return serviceItemFromCatalog(
      matchCatalogService(catalogServices, workflowType, petSpecies)
    );
  });
  const [noPrescriptionNeeded, setNoPrescriptionNeeded] = useState(
    initialDraft?.noPrescriptionNeeded ?? false
  );
  const [prescriptionItems, setPrescriptionItems] = useState<WorkflowPrescriptionItem[]>(
    initialDraft?.prescriptionItems ?? []
  );
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vaccineProducts = useMemo(
    () => products.filter((p) => isVaccineProductType(p.type)),
    [products]
  );
  const dewormerProducts = useMemo(
    () => products.filter((p) => isDewormerProductType(p.type)),
    [products]
  );
  const medicineProducts = useMemo(
    () =>
      products.filter((p) => {
        const slug = normalizeProductTypeSlug(p.type);
        return slug === 'medicine' || isVaccineProductType(p.type) || isDewormerProductType(p.type);
      }),
    [products]
  );

  const currentStepIndex = useMemo(
    () => Math.max(0, config.steps.findIndex((s) => s.id === currentStepId)),
    [config.steps, currentStepId]
  );

  const buildPayload = useCallback(():
    | GroomingWorkflowPayload
    | VaccinationWorkflowPayload
    | DewormingWorkflowPayload => {
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

  const saveDraft = useCallback(
    async (stepId = currentStepId, unlock = maxUnlockedIndex) => {
      setSaving(true);
      setError(null);
      const draft: WorkflowConsultDraft = {
        kind: 'workflow',
        workflowType,
        currentStepId: stepId,
        payload: sections,
        serviceItems,
        noPrescriptionNeeded,
        prescriptionItems,
        maxUnlockedIndex: unlock,
      };
      const res = await saveWorkflowDraftAction(visitId, draft);
      setSaving(false);
      if (res.success) {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
        return true;
      }
      setError(res.error ?? 'Failed to save draft');
      return false;
    },
    [
      visitId,
      workflowType,
      currentStepId,
      sections,
      serviceItems,
      noPrescriptionNeeded,
      prescriptionItems,
      maxUnlockedIndex,
    ]
  );

  const trySelectStep = (stepId: string, index: number) => {
    if (index > maxUnlockedIndex) {
      setError('Complete previous sections first.');
      return;
    }
    setError(null);
    setCurrentStepId(stepId);
  };

  const goNext = async () => {
    const validationError = validateWorkflowStep(workflowType, currentStepId, sections);
    if (validationError) {
      setError(validationError);
      return;
    }
    const nextIndex = currentStepIndex + 1;
    const next = config.steps[nextIndex];
    if (!next) return;
    const nextUnlock = Math.max(maxUnlockedIndex, nextIndex);
    setMaxUnlockedIndex(nextUnlock);
    const saved = await saveDraft(next.id, nextUnlock);
    if (!saved) return;
    setError(null);
    setCurrentStepId(next.id);
  };

  const goPrev = () => {
    const prev = config.steps[currentStepIndex - 1];
    if (prev) {
      setError(null);
      setCurrentStepId(prev.id);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    const payload = buildPayload();
    try {
      const res = await completeWorkflowConsultationAction({
        visitId,
        workflowType,
        workflowPayload: payload,
        serviceItems,
        noPrescriptionNeeded,
        prescriptionItems: noPrescriptionNeeded ? [] : prescriptionItems,
      });
      // On success the server action redirects to the final-draft preview.
      if (res && !res.success) {
        setError(res.error ?? 'Failed to complete workflow');
      }
    } catch (err: unknown) {
      const digest =
        err && typeof err === 'object' && 'digest' in err
          ? String((err as { digest: unknown }).digest)
          : '';
      if (digest.startsWith('NEXT_REDIRECT')) return;
      setError(err instanceof Error ? err.message : 'Failed to complete workflow');
    } finally {
      setCompleting(false);
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
          const locked = index > maxUnlockedIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => trySelectStep(step.id, index)}
              disabled={locked}
              title={
                locked
                  ? `${step.label} — complete previous sections first`
                  : step.description || step.label
              }
              className={`shrink-0 px-2.5 py-2 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1 ${
                active
                  ? 'app-btn-primary shadow-sm'
                  : locked
                    ? 'text-on-surface-variant/30 cursor-not-allowed'
                    : done
                      ? 'text-primary bg-primary/10'
                      : 'text-on-surface-variant/60 hover:bg-surface-container/40'
              }`}
            >
              {locked ? <Lock className="w-3 h-3" /> : null}
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

      <div className="glass-panel rounded-xl border border-outline-variant/40 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Billing service
          </p>
          <select
            className="text-[11px] bg-surface-container border border-outline-variant/50 rounded-lg px-2 py-1 text-on-surface max-w-[220px]"
            value=""
            onChange={(e) => {
              const id = e.target.value;
              const svc = catalogServices.find((s) => s.id === id);
              if (!svc) return;
              setServiceItems((prev) => {
                if (prev.some((p) => p.serviceId === svc.id)) return prev;
                return [
                  ...prev,
                  {
                    serviceId: svc.id,
                    name: svc.name,
                    unitPrice: svc.price,
                    quantity: 1,
                  },
                ];
              });
            }}
          >
            <option value="">Add from catalog…</option>
            {catalogServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.price}
              </option>
            ))}
          </select>
        </div>
        {serviceItems.length === 0 ? (
          <p className="text-[11px] text-on-surface-variant">
            No service auto-selected. Add one before completing if this visit should be billed.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {serviceItems.map((item, idx) => (
              <li
                key={`${item.serviceId}-${idx}`}
                className="flex items-center gap-2 text-xs text-on-surface bg-surface-container/50 rounded-lg px-2.5 py-2"
              >
                <span className="flex-1 font-medium truncate">{item.name}</span>
                <span className="text-on-surface-variant shrink-0">
                  ×{item.quantity} @ {item.unitPrice}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setServiceItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-destructive/80 hover:text-destructive p-1"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {workflowType === 'grooming' ? (
        <GroomingWorkflow
          stepId={currentStepId}
          sections={sections as GroomingWorkflowSections}
          onChange={(s) => setSections(s)}
          staffMembers={staffMembers}
          visitId={visitId}
          patientId={patientId}
          visitReason={visitReason}
          medicineProducts={medicineProducts}
          noPrescriptionNeeded={noPrescriptionNeeded}
          onNoPrescriptionNeededChange={setNoPrescriptionNeeded}
          prescriptionItems={prescriptionItems}
          onPrescriptionItemsChange={setPrescriptionItems}
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
          vaccineProducts={vaccineProducts}
          medicineProducts={medicineProducts}
          noPrescriptionNeeded={noPrescriptionNeeded}
          onNoPrescriptionNeededChange={setNoPrescriptionNeeded}
          prescriptionItems={prescriptionItems}
          onPrescriptionItemsChange={setPrescriptionItems}
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
          dewormerProducts={dewormerProducts}
          medicineProducts={medicineProducts}
          noPrescriptionNeeded={noPrescriptionNeeded}
          onNoPrescriptionNeededChange={setNoPrescriptionNeeded}
          prescriptionItems={prescriptionItems}
          onPrescriptionItemsChange={setPrescriptionItems}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentStepIndex <= 0 || saving || completing}
          className="app-btn-secondary app-focus-ring"
        >
          Previous
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void saveDraft()}
            disabled={saving || completing}
            className="app-btn-soft app-focus-ring"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : 'Save draft'}
          </button>
          {isLastStep ? (
            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={completing}
              className="app-btn-primary app-focus-ring"
            >
              {completing ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Complete workflow
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={saving || completing}
              className="app-btn-primary app-focus-ring"
            >
              Next section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
