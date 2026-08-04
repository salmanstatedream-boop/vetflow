'use client';

import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompleteConsultationSchema, type CompleteConsultationInput } from '@/lib/validations/schemas';
import { completeConsultationAction, saveConsultationDraftAction } from '@/lib/services/clinical-actions';
import { pauseConsultationAction, resumeConsultationAction } from '@/lib/services/visit-actions';
import ConsultationLabsDocsPanel from '@/components/forms/ConsultationLabsDocsPanel';
import ConsultationStepProgressBar from '@/components/consultation/ConsultationStepProgressBar';
import ConsultationStepActions from '@/components/consultation/ConsultationStepActions';
import CatalogItemQuickAddModal from '@/components/inventory/CatalogItemQuickAddModal';
import Select from '@/components/ui/premium/Select';
import CreatableSelect from '@/components/ui/premium/CreatableSelect';
import RequiredLabel from '@/components/ui/RequiredLabel';
import type { ProductType } from '@/lib/inventory/product-types';
import { SoapTabBar, SOAP_TAB_ORDER, getSoapTabTitle, type SoapFlowTab } from '@/components/consultation/SoapTabBar';
import { combineDosageWithUnit } from '@/lib/prescriptions/format-dosage';
import { validateSoapTab, validateAllSoapSteps, isPrescriptionLineComplete } from '@/lib/consultation/soap-validation';
import { getFirstValidationIssue } from '@/lib/consultation/consultation-form-errors';
import { useCurrency } from '@/lib/context/CurrencyContext';
import {
  computeFollowUpPreviews,
  defaultConsecutiveStartDate,
  offsetDatePreview,
  type FollowUpMode,
} from '@/lib/consultation/follow-up-schedule';
import { useSoapFieldNavigation } from '@/lib/hooks/useSoapFieldNavigation';
import type { VisitPurpose } from '@/lib/appointments/visit-purpose';
import { isWorkflowVisitPurpose, visitPurposeLabel } from '@/lib/appointments/visit-purpose';
import type { WorkflowConsultDraft } from '@/lib/consultations/workflow-types';
import { getWorkflowConfig } from '@/lib/consultations/workflow-config';
import AppointmentWorkflowRenderer from '@/components/consultations/workflows/AppointmentWorkflowRenderer';
import {
  celsiusToFahrenheitInput,
  fahrenheitToCelsiusStored,
} from '@/lib/utils/temperature';
import type { StaffMember } from '@/components/consultations/workflows/GroomingWorkflow';
import ConsultVoiceRecorder from '@/components/consultation/ConsultVoiceRecorder';
import type { ConsultVoiceExtract } from '@/lib/ai/consult-voice';
import {
  matchCatalogService,
  serviceItemFromCatalog,
} from '@/lib/billing/match-catalog-service';
import {
  Heart, 
  User, 
  Calendar, 
  Weight, 
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  Plus,
  Trash2,
  Loader2,
  FileCheck2,
  History,
  CheckCircle,
  X,
  Pause,
  Play,
  Pill,
  ExternalLink,
  FileText,
  FlaskConical,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  type: string;
  sellingPrice: number;
}

interface CatalogService {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

const FOLLOW_UP_PRESETS = [3, 5, 7, 14] as const;

interface LabCatalogItem {
  id: string;
  name: string;
}
interface LabOrder {
  id: string;
  testName: string;
  status: string;
  resultText: string | null;
  resultDocumentId: string | null;
  createdAt: string;
}
interface DocumentItem {
  id: string;
  fileName: string;
  category: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
}

interface VisitHistory {
  id: string;
  checkedInAt: string;
  reason: string;
  clinicalNotes: { diagnosis: string; treatmentPlan: string | null } | null;
}

interface ConsultationWorkspaceClientProps {
  visitId: string;
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    gender: string;
    allergies: string | null;
    weightKg: number | null;
    bodyConditionScore?: number | null;
  };
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  history: VisitHistory[];
  products: Product[];
  catalogServices?: CatalogService[];
  visitReason: string;
  isEmergency?: boolean;
  triageNotes?: string | null;
  patientId: string;
  labCatalog: LabCatalogItem[];
  labOrders: LabOrder[];
  documents: DocumentItem[];
  previousDocuments?: DocumentItem[];
  consultStartedAt?: string | null;
  consultPausedAt?: string | null;
  consultPauseReason?: string | null;
  consultPauseAccumulatedSec?: number;
  initialDraft?: Partial<CompleteConsultationInput> | null;
  workflowInitialDraft?: WorkflowConsultDraft | null;
  visitPurpose?: VisitPurpose;
  staffMembers?: StaffMember[];
  activeBranchId: string;
  categories?: { id: string; name: string }[];
  checkedInAt: string;
  isFollowUpPatient?: boolean;
  objectiveSignDefaults?: {
    signVaccination: boolean;
    signDeworming: boolean;
  };
}

export default function ConsultationWorkspaceClient({
  visitId,
  pet,
  customer,
  history,
  products,
  catalogServices = [],
  visitReason,
  isEmergency = false,
  triageNotes,
  patientId,
  labCatalog,
  labOrders,
  documents,
  previousDocuments = [],
  consultStartedAt = null,
  consultPausedAt: initialPausedAt = null,
  consultPauseReason: initialPauseReason = null,
  consultPauseAccumulatedSec = 0,
  initialDraft = null,
  workflowInitialDraft = null,
  visitPurpose = 'other',
  staffMembers = [],
  activeBranchId,
  categories = [],
  checkedInAt,
  isFollowUpPatient = false,
  objectiveSignDefaults,
}: ConsultationWorkspaceClientProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const isWorkflowVisit = isWorkflowVisitPurpose(visitPurpose);
  const workflowConfig = isWorkflowVisit ? getWorkflowConfig(visitPurpose) : null;
  const [dosageUnits, setDosageUnits] = useState<Record<number, string>>({});
  const followUpBaseDate = checkedInAt.slice(0, 10);
  const [localProducts, setLocalProducts] = useState(products);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<ProductType>('medicine');
  const [quickAddTarget, setQuickAddTarget] = useState<{ kind: 'product'; index: number } | null>(null);
  const [activeSoapTab, setActiveSoapTab] = useState<SoapFlowTab>('S');
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [maxUnlockedIndex, setMaxUnlockedIndex] = useState(() => {
    if (!initialDraft) return 0;
    let max = 0;
    if ((initialDraft.chiefComplaint?.trim().length ?? 0) >= 3) max = 1;
    if (
      max >= 1 &&
      (Boolean(initialDraft.examinationFindings?.trim()) ||
        initialDraft.temperatureC != null ||
        initialDraft.heartRateBpm != null)
    ) {
      max = 2;
    }
    if (max >= 2 && (initialDraft.diagnosis?.trim().length ?? 0) >= 3) max = 3;
    if (max >= 3 && (initialDraft.treatmentPlan?.trim().length ?? 0) >= 3) max = 4;
    return Math.min(max, SOAP_TAB_ORDER.length - 1);
  });
  const [tabError, setTabError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [visitType, setVisitType] = useState<'standard' | 'lab' | 'surgery'>(
    initialDraft?.visitType ?? 'standard'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFollowUpDay, setCustomFollowUpDay] = useState('');
  const [consecutiveCountInput, setConsecutiveCountInput] = useState(
    String(initialDraft?.followUpConsecutive?.count ?? 3)
  );
  const [consecutiveStartDate, setConsecutiveStartDate] = useState(
    initialDraft?.followUpConsecutive?.startDate ?? defaultConsecutiveStartDate(followUpBaseDate)
  );
  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<CompleteConsultationInput | null>(null);
  const [consultPausedAt, setConsultPausedAt] = useState<string | null>(initialPausedAt);
  const [consultPauseReason, setConsultPauseReason] = useState<string | null>(initialPauseReason);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseReasonInput, setPauseReasonInput] = useState('');
  const [pauseLoading, setPauseLoading] = useState(false);
  const [applyingFollowUp, setApplyingFollowUp] = useState(false);
  const [followUpScheduled, setFollowUpScheduled] = useState(false);
  const [showCompleteSuccess, setShowCompleteSuccess] = useState(false);
  const [completedPrescriptionId, setCompletedPrescriptionId] = useState<string | null>(null);
  const tabErrorRef = useRef<HTMLDivElement>(null);
  const soapWorkspaceRef = useRef<HTMLFormElement>(null);
  const diagnosticsPanelRef = useRef<HTMLDivElement>(null);
  const lastServiceRowRef = useRef<HTMLDivElement>(null);
  const pendingServiceScrollRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CompleteConsultationInput>({
    resolver: zodResolver(CompleteConsultationSchema),
    defaultValues: {
      visitId,
      visitType: initialDraft?.visitType ?? 'standard',
      chiefComplaint: initialDraft?.chiefComplaint ?? visitReason,
      history: initialDraft?.history ?? '',
      examinationFindings: initialDraft?.examinationFindings ?? '',
      diagnosis: initialDraft?.diagnosis ?? '',
      treatmentPlan: initialDraft?.treatmentPlan ?? '',
      internalNotes: initialDraft?.internalNotes ?? '',
      followUpRecommendation: initialDraft?.followUpRecommendation ?? '',
      followUpDays: initialDraft?.followUpDays ?? initialDraft?.followUpOffsetDays ?? [],
      followUpMode: initialDraft?.followUpMode ?? 'none',
      followUpOffsetDays: initialDraft?.followUpOffsetDays ?? initialDraft?.followUpDays ?? [],
      followUpConsecutive: initialDraft?.followUpConsecutive,
      noPrescriptionNeeded: initialDraft?.noPrescriptionNeeded ?? false,
      procedureNotes: initialDraft?.procedureNotes ?? '',
      postOpMedication: initialDraft?.postOpMedication ?? '',
      temperatureC: celsiusToFahrenheitInput(initialDraft?.temperatureC),
      heartRateBpm: initialDraft?.heartRateBpm ?? undefined,
      respiratoryRate: initialDraft?.respiratoryRate ?? undefined,
      weightKg: initialDraft?.weightKg ?? pet.weightKg ?? undefined,
      bodyConditionScore:
        initialDraft?.bodyConditionScore ?? pet.bodyConditionScore ?? undefined,
      dehydrationPercent: initialDraft?.dehydrationPercent ?? undefined,
      signVomiting: initialDraft?.signVomiting ?? false,
      signAnorexia: initialDraft?.signAnorexia ?? false,
      signDiarrhoea: initialDraft?.signDiarrhoea ?? false,
      signConstipation: initialDraft?.signConstipation ?? false,
      signVaccination:
        initialDraft?.signVaccination ?? objectiveSignDefaults?.signVaccination ?? false,
      signDeworming:
        initialDraft?.signDeworming ?? objectiveSignDefaults?.signDeworming ?? false,
      prescriptionItems: initialDraft?.prescriptionItems ?? [],
      serviceItems: initialDraft?.serviceItems?.length
        ? initialDraft.serviceItems
        : serviceItemFromCatalog(
            matchCatalogService(catalogServices, 'consult', pet.species)
          ),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prescriptionItems',
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: 'serviceItems',
  });

  useEffect(() => {
    if (!pendingServiceScrollRef.current) return;
    pendingServiceScrollRef.current = false;
    requestAnimationFrame(() => {
      lastServiceRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [serviceFields.length]);

  const handleAddService = () => {
    pendingServiceScrollRef.current = true;
    appendService({ serviceId: null, name: '', unitPrice: 0, quantity: 1 });
  };

  const prescriptionItemsWatch = watch('prescriptionItems');
  const noPrescriptionNeeded = watch('noPrescriptionNeeded');
  const followUpMode = (watch('followUpMode') ?? 'none') as FollowUpMode;
  const followUpOffsetDays = watch('followUpOffsetDays') ?? [];
  const chiefComplaintWatch = watch('chiefComplaint');
  const examinationWatch = watch('examinationFindings');
  const diagnosisWatch = watch('diagnosis');
  const treatmentPlanWatch = watch('treatmentPlan');

  const soapCompleted: Partial<Record<SoapFlowTab, boolean>> = {
    S: Boolean(chiefComplaintWatch?.trim()),
    O:
      Boolean(examinationWatch?.trim()) ||
      Boolean(watch('temperatureC')) ||
      Boolean(watch('dehydrationPercent')) ||
      Boolean(watch('signVomiting')) ||
      Boolean(watch('signAnorexia')) ||
      Boolean(watch('signDiarrhoea')) ||
      Boolean(watch('signConstipation')) ||
      Boolean(watch('signVaccination')) ||
      Boolean(watch('signDeworming')),
    A: Boolean(diagnosisWatch?.trim()),
    P: Boolean(treatmentPlanWatch?.trim()) || serviceFields.length > 0,
    Rx:
      noPrescriptionNeeded ||
      prescriptionItemsWatch.some((line) => isPrescriptionLineComplete(line)),
  };

  const scrollSoapToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soapWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const focusDiagnosticsPanel = () => {
    setShowHistory(false);
    requestAnimationFrame(() => {
      diagnosticsPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const navigateToSoapTab = (tab: SoapFlowTab) => {
    if (tab === activeSoapTab) return;
    setTabTransitioning(true);
    setTabError(null);
    scrollSoapToTop();
    window.setTimeout(() => {
      setActiveSoapTab(tab);
      setTabTransitioning(false);
    }, 280);
  };

  useEffect(() => {
    if (noPrescriptionNeeded) {
      setValue('prescriptionItems', []);
    }
  }, [noPrescriptionNeeded, setValue]);

  const prescriptionProductOptions = useMemo(
    () =>
      localProducts.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.type}) — ${formatCurrency(p.sellingPrice)}`,
      })),
    [localProducts, formatCurrency]
  );

  const soapContext = useMemo(
    () => ({
      visitType,
      labOrderCount: labOrders.length,
      noPrescriptionNeeded: Boolean(noPrescriptionNeeded),
    }),
    [visitType, labOrders.length, noPrescriptionNeeded]
  );

  const followUpPreviews = useMemo(() => {
    if (followUpMode === 'offset') {
      return computeFollowUpPreviews(
        { mode: 'offset', offsetDays: followUpOffsetDays },
        followUpBaseDate
      );
    }
    if (followUpMode === 'consecutive') {
      const count = parseInt(consecutiveCountInput, 10);
      if (!count || count < 1) return [];
      return computeFollowUpPreviews(
        {
          mode: 'consecutive',
          offsetDays: [],
          consecutive: { count, startDate: consecutiveStartDate },
        },
        followUpBaseDate
      );
    }
    return [];
  }, [followUpMode, followUpOffsetDays, consecutiveCountInput, consecutiveStartDate, followUpBaseDate]);

  useEffect(() => {
    if (followUpMode !== 'consecutive') return;
    const count = parseInt(consecutiveCountInput, 10);
    if (count >= 1 && consecutiveStartDate) {
      setValue('followUpConsecutive', { count, startDate: consecutiveStartDate }, { shouldValidate: true });
    }
  }, [followUpMode, consecutiveCountInput, consecutiveStartDate, setValue]);

  useEffect(() => {
    if (followUpMode === 'consecutive' && !getValues('followUpConsecutive')) {
      const count = parseInt(consecutiveCountInput, 10) || 3;
      setValue('followUpConsecutive', { count, startDate: consecutiveStartDate });
    }
  }, [followUpMode, consecutiveCountInput, consecutiveStartDate, getValues, setValue]);

  const showPriorVisitsCard = isFollowUpPatient || history.length > 0;
  const priorVisitsPreview = history.slice(0, 3);

  const goToNextSoapTab = async () => {
    const idx = SOAP_TAB_ORDER.indexOf(activeSoapTab);
    if (idx >= SOAP_TAB_ORDER.length - 1) return;
    await validateAndAdvanceTab(SOAP_TAB_ORDER[idx + 1]);
  };

  const goToPrevSoapTab = () => {
    const idx = SOAP_TAB_ORDER.indexOf(activeSoapTab);
    if (idx > 0) {
      navigateToSoapTab(SOAP_TAB_ORDER[idx - 1]);
    }
  };

  const validateTab = (tab: SoapFlowTab): string | null =>
    validateSoapTab(tab, getValues(), soapContext);

  const validateAndAdvanceTab = async (targetTab: SoapFlowTab) => {
    const currentIdx = SOAP_TAB_ORDER.indexOf(activeSoapTab);
    const targetIdx = SOAP_TAB_ORDER.indexOf(targetTab);

    if (targetIdx <= currentIdx) {
      navigateToSoapTab(targetTab);
      return;
    }
    if (targetIdx > maxUnlockedIndex + 1) return;

    const err = validateTab(activeSoapTab);
    if (err) {
      setTabError(err);
      return;
    }

    setTabTransitioning(true);
    setSavingDraft(true);
    setTabError(null);
    const res = await saveConsultationDraftAction(visitId, buildSubmitPayload(getValues()));
    setSavingDraft(false);

    if (!res.success) {
      setTabTransitioning(false);
      setTabError(res.error || 'Failed to save draft.');
      return;
    }

    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
    const nextUnlocked = Math.max(maxUnlockedIndex, currentIdx + 1);
    setMaxUnlockedIndex(nextUnlocked);
    const nextTab = targetIdx <= nextUnlocked ? targetTab : SOAP_TAB_ORDER[nextUnlocked];
    scrollSoapToTop();
    window.setTimeout(() => {
      setActiveSoapTab(nextTab);
      setTabTransitioning(false);
    }, 320);
  };

  const handleSoapTabChange = (tab: SoapFlowTab) => {
    const targetIdx = SOAP_TAB_ORDER.indexOf(tab);
    if (targetIdx <= maxUnlockedIndex) {
      navigateToSoapTab(tab);
      return;
    }
    void validateAndAdvanceTab(tab);
  };

  const onInvalidSubmit = (fieldErrors: FieldErrors<CompleteConsultationInput>) => {
    const issue = getFirstValidationIssue(fieldErrors);
    navigateToSoapTab(issue.tab);
    setTabError(issue.message);
    requestAnimationFrame(() => {
      tabErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const { handleFormKeyDown } = useSoapFieldNavigation(activeSoapTab, goToNextSoapTab);

  const setFollowUpMode = (mode: FollowUpMode) => {
    setValue('followUpMode', mode);
    if (mode === 'none') {
      setValue('followUpOffsetDays', []);
      setValue('followUpDays', []);
      setValue('followUpConsecutive', undefined);
    } else if (mode === 'consecutive') {
      setValue('followUpOffsetDays', []);
      const count = parseInt(consecutiveCountInput, 10) || 3;
      setValue('followUpConsecutive', { count, startDate: consecutiveStartDate });
    }
  };

  const toggleFollowUpDay = (day: number) => {
    const current = getValues('followUpOffsetDays') ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b);
    setValue('followUpMode', 'offset');
    setValue('followUpOffsetDays', next);
    setValue('followUpDays', next);
    setCustomFollowUpDay('');
  };

  const removeFollowUpDay = (day: number) => {
    const next = (getValues('followUpOffsetDays') ?? []).filter((d) => d !== day);
    setValue('followUpOffsetDays', next);
    setValue('followUpDays', next);
    if (next.length === 0) setValue('followUpMode', 'none');
  };

  const clearFollowUpDays = () => {
    setValue('followUpMode', 'none');
    setValue('followUpOffsetDays', []);
    setValue('followUpDays', []);
    setValue('followUpConsecutive', undefined);
    setCustomFollowUpDay('');
  };

  const addCustomFollowUpDay = () => {
    const day = parseInt(customFollowUpDay, 10);
    if (!day || day < 1) return;
    const current = getValues('followUpOffsetDays') ?? [];
    if (!current.includes(day)) {
      const next = [...current, day].sort((a, b) => a - b);
      setValue('followUpMode', 'offset');
      setValue('followUpOffsetDays', next);
      setValue('followUpDays', next);
    }
    setCustomFollowUpDay('');
  };

  const applyConsecutiveFollowUp = async () => {
    const count = parseInt(consecutiveCountInput, 10);
    if (!count || count < 1 || !consecutiveStartDate) {
      setTabError('Enter a valid number of days and start date for follow-up scheduling.');
      return;
    }
    setApplyingFollowUp(true);
    setTabError(null);
    setValue('followUpMode', 'consecutive');
    setValue('followUpOffsetDays', []);
    setValue('followUpDays', []);
    setValue('followUpConsecutive', { count, startDate: consecutiveStartDate }, { shouldValidate: true });
    await new Promise((r) => setTimeout(r, 300));
    setApplyingFollowUp(false);
    setFollowUpScheduled(true);
    setTimeout(() => setFollowUpScheduled(false), 2000);
  };

  const buildSubmitPayload = (data: CompleteConsultationInput): CompleteConsultationInput => {
    const hasCompleteRx = (data.prescriptionItems ?? []).some((line) =>
      isPrescriptionLineComplete(line)
    );
    const noRxNeeded = hasCompleteRx ? false : Boolean(data.noPrescriptionNeeded);
    const storedTemp = fahrenheitToCelsiusStored(data.temperatureC);
    const base: CompleteConsultationInput = {
      ...data,
      temperatureC:
        storedTemp == null || Number.isNaN(storedTemp as number) ? undefined : storedTemp,
      noPrescriptionNeeded: noRxNeeded,
      prescriptionItems: noRxNeeded ? [] : (data.prescriptionItems ?? []),
    };
    const mode = base.followUpMode ?? 'none';
    if (mode === 'consecutive') {
      const count = parseInt(consecutiveCountInput, 10) || base.followUpConsecutive?.count || 0;
      return {
        ...base,
        followUpMode: 'consecutive',
        followUpConsecutive: { count, startDate: consecutiveStartDate },
        followUpOffsetDays: [],
        followUpDays: [],
      };
    }
    if (mode === 'offset') {
      const days = base.followUpOffsetDays ?? [];
      if (days.length === 0) {
        return {
          ...base,
          followUpMode: 'none',
          followUpOffsetDays: [],
          followUpDays: [],
          followUpConsecutive: undefined,
        };
      }
      return {
        ...base,
        followUpMode: 'offset',
        followUpOffsetDays: days,
        followUpDays: days,
        followUpConsecutive: undefined,
      };
    }
    return {
      ...base,
      followUpMode: 'none',
      followUpOffsetDays: [],
      followUpDays: [],
      followUpConsecutive: undefined,
    };
  };

  const executeComplete = async (data: CompleteConsultationInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = buildSubmitPayload(data);
      const res = await completeConsultationAction(payload);
      // On success the server action redirects to the final-draft preview.
      if (res && !res.success) {
        setError(res.error || 'Failed to complete consultation');
      }
    } catch (err: unknown) {
      // redirect() from the server action surfaces as NEXT_REDIRECT — not a real failure
      const digest =
        err && typeof err === 'object' && 'digest' in err
          ? String((err as { digest: unknown }).digest)
          : '';
      if (digest.startsWith('NEXT_REDIRECT')) return;
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setShowFollowUpConfirm(false);
      setPendingSubmitData(null);
    }
  };

  const onSubmit = async (data: CompleteConsultationInput) => {
    if (consultPausedAt) {
      setError('Resume the consultation before completing.');
      return;
    }

    const payload = buildSubmitPayload(data);
    const validationFailure = validateAllSoapSteps(payload, soapContext);
    if (validationFailure) {
      if (validationFailure.focusDiagnostics) {
        focusDiagnosticsPanel();
      } else {
        navigateToSoapTab(validationFailure.tab);
      }
      setTabError(validationFailure.message);
      return;
    }

    setTabError(null);

    if ((payload.followUpMode ?? 'none') !== 'none' && followUpPreviews.length > 0) {
      setPendingSubmitData(payload);
      setShowFollowUpConfirm(true);
      return;
    }

    await executeComplete(payload);
  };

  const submitConsultation = handleSubmit(onSubmit, onInvalidSubmit);

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const items = getValues('prescriptionItems') ?? [];
    const hasCompleteRx = items.some((line) => isPrescriptionLineComplete(line));
    if (hasCompleteRx) {
      setValue('noPrescriptionNeeded', false);
    } else if (getValues('noPrescriptionNeeded')) {
      setValue('prescriptionItems', []);
    }
    const mode = getValues('followUpMode') ?? 'none';
    if (mode === 'offset' && (getValues('followUpOffsetDays') ?? []).length === 0) {
      setValue('followUpMode', 'none');
      setValue('followUpOffsetDays', []);
      setValue('followUpDays', []);
    }
    submitConsultation(event);
  };

  const confirmFollowUpAndComplete = async () => {
    if (!pendingSubmitData) return;
    await executeComplete(pendingSubmitData);
  };

  const handleSelectService = (index: number, serviceId: string) => {
    if (!serviceId) return;
    const selected = catalogServices.find((s) => s.id === serviceId);
    if (selected) {
      setValue(`serviceItems.${index}.serviceId`, selected.id, { shouldValidate: true });
      setValue(`serviceItems.${index}.name`, selected.name, { shouldValidate: true });
      setValue(`serviceItems.${index}.unitPrice`, selected.price, { shouldValidate: true });
    }
  };

  const handleSelectProduct = (index: number, productId: string) => {
    if (!productId) {
      setValue(`prescriptionItems.${index}.productId`, null);
      return;
    }
    const selected = localProducts.find((p) => p.id === productId);
    if (selected) {
      setValue(`prescriptionItems.${index}.medicineName`, selected.name, { shouldValidate: true });
      setValue(`prescriptionItems.${index}.productId`, selected.id, { shouldValidate: true });
    }
  };

  const handleVisitTypeChange = (type: 'standard' | 'surgery') => {
    setVisitType(type);
    setValue('visitType', type);
    if (type === 'surgery') {
      const surgerySvc = matchCatalogService(catalogServices, 'surgery', pet.species);
      if (surgerySvc && serviceFields.length > 0) {
        setValue('serviceItems.0.serviceId', surgerySvc.id);
        setValue('serviceItems.0.name', surgerySvc.name);
        setValue('serviceItems.0.unitPrice', surgerySvc.price);
      }
    }
  };

  const applyVoiceExtract = (fields: ConsultVoiceExtract) => {
    const strKeys = [
      'chiefComplaint',
      'history',
      'examinationFindings',
      'diagnosis',
      'treatmentPlan',
      'followUpRecommendation',
    ] as const;
    for (const key of strKeys) {
      const val = fields[key];
      if (typeof val === 'string' && val.trim()) {
        setValue(key, val.trim(), { shouldDirty: true, shouldValidate: true });
      }
    }
    const numKeys = [
      'temperatureC',
      'heartRateBpm',
      'respiratoryRate',
      'weightKg',
      'bodyConditionScore',
      'dehydrationPercent',
    ] as const;
    for (const key of numKeys) {
      const val = fields[key];
      if (typeof val === 'number' && !Number.isNaN(val)) {
        setValue(key, val, { shouldDirty: true, shouldValidate: true });
      }
    }
    const boolKeys = [
      'signVomiting',
      'signAnorexia',
      'signDiarrhoea',
      'signConstipation',
      'signVaccination',
      'signDeworming',
    ] as const;
    for (const key of boolKeys) {
      if (typeof fields[key] === 'boolean') {
        setValue(key, fields[key] as boolean, { shouldDirty: true });
      }
    }
    if (fields.prescriptionItems?.length) {
      setValue('noPrescriptionNeeded', false);
      for (const item of fields.prescriptionItems) {
        if (!item.medicineName?.trim()) continue;
        append({
          productId: null,
          medicineName: item.medicineName.trim(),
          dosage: item.dosage?.trim() || 'as directed',
          frequency: item.frequency?.trim() || 'as directed',
          duration: item.duration?.trim() || 'as directed',
          instructions: item.instructions?.trim() || '',
          quantityRequested: 1,
        });
      }
    }
  };

  const handlePauseConsult = async () => {
    setPauseLoading(true);
    setError(null);
    const res = await pauseConsultationAction(visitId, pauseReasonInput);
    if (res.success) {
      setConsultPausedAt(new Date().toISOString());
      setConsultPauseReason(pauseReasonInput.trim());
      setShowPauseModal(false);
      setPauseReasonInput('');
      router.refresh();
    } else {
      setError(res.error || 'Failed to pause consultation.');
    }
    setPauseLoading(false);
  };

  const handleResumeConsult = async () => {
    setPauseLoading(true);
    setError(null);
    const res = await resumeConsultationAction(visitId);
    if (res.success) {
      setConsultPausedAt(null);
      setConsultPauseReason(null);
      router.refresh();
    } else {
      setError(res.error || 'Failed to resume consultation.');
    }
    setPauseLoading(false);
  };

  return (
    <div className="space-y-4 relative">
      <ConsultationStepProgressBar active={tabTransitioning || savingDraft} />
      {isEmergency && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-black text-destructive uppercase tracking-wide">Emergency patient</p>
            <p className="text-xs text-destructive/80">This visit was flagged as an emergency at intake.</p>
          </div>
        </div>
      )}

      {triageNotes && (
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5 shadow-premium">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Intake / initial history</h3>
          </div>
          <p className="text-xs text-on-surface-variant/80 whitespace-pre-wrap">{triageNotes}</p>
        </div>
      )}

      {consultPausedAt && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
          <Pause className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-cyan-300 uppercase tracking-wide">Consultation paused</p>
            <p className="text-xs text-cyan-200/80 mt-1">{consultPauseReason}</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-1">Reception can see this status. Resume when ready to continue charting.</p>
          </div>
        </div>
      )}

      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 max-w-md w-full shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Pause consultation</h3>
            <p className="text-xs text-on-surface-variant">Reception and clinic admin will see the paused status and your reason.</p>
            <textarea
              value={pauseReasonInput}
              onChange={(e) => setPauseReasonInput(e.target.value)}
              placeholder="e.g. Waiting for lab results, owner stepped out..."
              rows={3}
              className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant rounded-xl text-sm outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-outline-variant"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePauseConsult}
                disabled={pauseLoading || pauseReasonInput.trim().length < 3}
                className="px-4 py-2 rounded-xl text-xs font-bold app-btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                {pauseLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Pause Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {showFollowUpConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 max-w-md w-full shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Create follow-up appointment requests?</h3>
            <p className="text-xs text-on-surface-variant">
              The following appointment requests will be created for receptionist confirmation:
            </p>
            <ul className="text-xs space-y-2 max-h-48 overflow-y-auto">
              {followUpPreviews.map((preview) => (
                <li key={preview.preferredDate + preview.label} className="flex items-start gap-2 text-on-surface-variant">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold text-on-surface">{preview.preferredDate}</span>
                    {' — '}
                    {preview.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowFollowUpConfirm(false);
                  setPendingSubmitData(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-outline-variant"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => void confirmFollowUpAndComplete()}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm &amp; Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 max-w-md w-full shadow-premium space-y-4">
            <h3 className="text-sm font-bold text-on-surface">Consultation finalized</h3>
            <p className="text-xs text-on-surface-variant">
              {pet.name} has been sent to checkout. Print documents or return to your queue.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`/api/visits/${visitId}/treatment-pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container/40"
              >
                <FileCheck2 className="w-4 h-4" />
                Print treatment summary
              </a>
              {completedPrescriptionId && (
                <a
                  href={`/api/prescriptions/${completedPrescriptionId}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Pill className="w-4 h-4" />
                  Print prescription
                </a>
              )}
              <Link
                href="/dashboard/prescriptions"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container/40"
              >
                <FileText className="w-4 h-4" />
                View prescriptions
              </Link>
              <Link
                href={`/dashboard/doctors/patients/${patientId}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container/40"
              >
                <ExternalLink className="w-4 h-4" />
                View patient record
              </Link>
              <button
                type="button"
                onClick={() => router.replace('/dashboard/doctors')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-on-primary"
              >
                Back to queue
              </button>
            </div>
          </div>
        </div>
      )}

      {isWorkflowVisit && workflowConfig ? (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${workflowConfig.badgeClass}`}
            >
              {workflowConfig.label} workflow
            </span>
            <span className="text-[10px] text-on-surface-variant">
              {visitPurposeLabel(visitPurpose)} · {visitReason}
            </span>
          </div>
          {!consultPausedAt ? (
            <button
              type="button"
              onClick={() => setShowPauseModal(true)}
              disabled={pauseLoading || isSubmitting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-primary/30 text-cyan-300 hover:bg-primary/10 disabled:opacity-60"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResumeConsult}
              disabled={pauseLoading || isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-500/40 text-emerald-400 bg-surface/95 hover:bg-emerald-500/10 disabled:opacity-60"
            >
              {pauseLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Resume
            </button>
          )}
        </div>
      ) : !isWorkflowVisit ? (
        <div className="flex justify-end">
          {!consultPausedAt ? (
            <button
              type="button"
              onClick={() => setShowPauseModal(true)}
              disabled={pauseLoading || isSubmitting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-primary/30 text-cyan-300 hover:bg-primary/10 disabled:opacity-60"
            >
              <Pause className="w-3 h-3" />
              Pause
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResumeConsult}
              disabled={pauseLoading || isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-500/40 text-emerald-400 bg-surface/95 hover:bg-emerald-500/10 disabled:opacity-60"
            >
              {pauseLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Resume
            </button>
          )}
        </div>
      ) : null}

    <div className="grid md:grid-cols-12 gap-4 lg:gap-5 items-start">
      
      {/* LEFT: patient brief + diagnostics */}
      <div className="md:col-span-4 flex flex-col gap-3">
        
        {/* PATIENT PROFILE BRIEF */}
        <div className="glass-panel rounded-xl border border-outline-variant/40 p-3.5 shadow-premium shrink-0">
          <div className="flex items-start justify-between gap-3 border-b border-outline-variant/35 pb-3 mb-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">Patient Brief</span>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <h3 className="text-sm font-bold text-on-surface">{pet.name}</h3>
                <span className="bg-primary/5 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
                  {pet.species}
                </span>
              </div>
            </div>
            <Link
              href={`/dashboard/doctors/patients/${patientId}`}
              className="text-[10px] font-semibold text-primary hover:underline shrink-0"
            >
              Full patient history
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-on-surface">Breed</span>
              <span className="text-on-surface-variant">{pet.breed || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-on-surface">Gender</span>
              <span className="text-on-surface-variant">{pet.gender}</span>
            </div>
            {pet.weightKg != null && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 text-primary/70" />
                  Weight
                </span>
                <span className="text-on-surface-variant">{pet.weightKg} kg</span>
              </div>
            )}
            {pet.bodyConditionScore != null && (
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-on-surface">Body condition</span>
                <span className="text-on-surface-variant">{pet.bodyConditionScore} / 9</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-on-surface flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-primary/70" />
                Owner
              </span>
              <span className="text-on-surface-variant">{customer.firstName} {customer.lastName}</span>
            </div>
          </div>

          {pet.allergies && pet.allergies !== 'None' && (
            <div className="mt-4 p-3.5 bg-destructive/5 border border-destructive/20 text-destructive text-[11px] font-bold rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span>ALLERGY WARNING:</span>
                <p className="mt-0.5 font-medium">{pet.allergies}</p>
              </div>
            </div>
          )}
        </div>

        {showPriorVisitsCard && (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-4 shadow-premium space-y-3 shrink-0 max-h-28 overflow-y-auto overscroll-contain">
            <div className="flex items-center gap-2 border-b border-outline-variant/35 pb-3">
              <History className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Previous visits</h3>
            </div>
            {priorVisitsPreview.length > 0 ? (
              <div className="space-y-3">
                {priorVisitsPreview.map((h) => (
                  <div key={h.id} className="text-xs space-y-1 border-b border-outline-variant/20 pb-2 last:border-0 last:pb-0">
                    <p className="text-[10px] font-bold text-on-surface-variant">
                      {new Date(h.checkedInAt).toLocaleDateString()}
                    </p>
                    <p className="text-on-surface-variant/80">
                      <span className="font-semibold text-on-surface">Reason:</span> {h.reason}
                    </p>
                    {h.clinicalNotes && (
                      <>
                        <p className="text-on-surface-variant/80">
                          <span className="font-semibold text-on-surface">Diagnosis:</span>{' '}
                          {h.clinicalNotes.diagnosis}
                        </p>
                        {h.clinicalNotes.treatmentPlan && (
                          <p className="text-on-surface-variant/80">
                            <span className="font-semibold text-on-surface">Plan:</span>{' '}
                            {h.clinicalNotes.treatmentPlan}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/60 italic">Follow-up visit — see full history tab for details.</p>
            )}
          </div>
        )}

        {/* NAVIGATION: History sidebar */}
        <div className="flex glass-panel p-1 rounded-xl border border-outline-variant/40 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all ${
              !showHistory
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            Consultation
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              showHistory
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant/60 hover:text-on-surface'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({history.length})
          </button>
        </div>

        {showHistory && (
          <div className="space-y-3 shrink-0 max-h-36 overflow-y-auto overscroll-contain pr-0.5 rounded-xl">
            {history.length > 0 ? (
              history.map((h) => (
                <div key={h.id} className="glass-panel rounded-xl border border-outline-variant/40 p-4 shadow-sm space-y-2">
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <span className="text-[10px] text-on-surface-variant/50 font-bold">
                      {new Date(h.checkedInAt).toLocaleDateString()}
                    </span>
                    <span className="bg-primary/5 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Consult Completed
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5">
                    <p className="font-semibold text-on-surface">
                      Reason: <span className="font-normal text-on-surface-variant/80">{h.reason}</span>
                    </p>
                    {h.clinicalNotes && (
                      <>
                        <p className="font-semibold text-on-surface">
                          Diagnosis: <span className="text-primary">{h.clinicalNotes.diagnosis}</span>
                        </p>
                        {h.clinicalNotes.treatmentPlan && (
                          <p className="font-semibold text-on-surface">
                            Plan: <span className="font-normal text-on-surface-variant/70">{h.clinicalNotes.treatmentPlan}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel rounded-xl border border-outline-variant/40 p-8 text-center text-xs text-on-surface-variant/50 italic">
                No past consultations logged.
              </div>
            )}
          </div>
        )}

        <div
          ref={diagnosticsPanelRef}
          className="flex flex-col flex-1 min-h-[12rem] min-w-0 rounded-2xl border border-outline-variant/40 bg-surface-container/10 shadow-premium overflow-hidden"
        >
          <div className="shrink-0 px-3.5 py-2.5 border-b border-outline-variant/30 bg-surface-container/25">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  Diagnostics
                </h3>
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5 leading-snug">
                  Labs &amp; files — add anytime during this consult.
                </p>
              </div>
              {(labOrders.length > 0 || documents.length > 0) && (
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {labOrders.length} lab · {documents.length} doc
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-3 scroll-smooth [scrollbar-gutter:stable]">
            <ConsultationLabsDocsPanel
              variant="sidebar"
              visitId={visitId}
              patientId={patientId}
              labCatalog={labCatalog}
              labOrders={labOrders}
              documents={documents}
              previousDocuments={previousDocuments}
            />
          </div>
        </div>

      </div>

      {/* RIGHT: workflow or SOAP workspace */}
      {isWorkflowVisit ? (
        <div className="md:col-span-8 flex flex-col space-y-4 relative">
          <AppointmentWorkflowRenderer
            visitId={visitId}
            patientId={patientId}
            workflowType={visitPurpose}
            initialDraft={workflowInitialDraft}
            staffMembers={staffMembers}
            catalogServices={catalogServices}
            products={localProducts.map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              sellingPrice: p.sellingPrice,
            }))}
            visitReason={visitReason}
            petSpecies={pet.species}
          />
        </div>
      ) : (
      <form
        ref={soapWorkspaceRef}
        onSubmit={onFormSubmit}
        onKeyDown={handleFormKeyDown}
        className="md:col-span-8 flex flex-col space-y-4 relative"
      >
          {error && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-xl">
              {error}
            </div>
          )}

          <input type="hidden" {...register('followUpMode')} />
          <input type="hidden" {...register('followUpOffsetDays')} />

          {/* VISIT TYPE SELECTOR */}
          <div className="glass-panel rounded-xl border border-outline-variant/40 p-4 shadow-premium">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-2">Visit type</span>
            {visitType === 'lab' && (
              <p className="text-xs text-amber-400 mb-2">
                Legacy lab-focused visit — select Standard or Surgery to update.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {(['standard', 'surgery'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleVisitTypeChange(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                    visitType === t
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SOAP → Rx TAB BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SoapTabBar
              active={activeSoapTab}
              onChange={handleSoapTabChange}
              completed={soapCompleted}
              maxUnlockedIndex={maxUnlockedIndex}
              draftSaved={draftSaved}
            />
            <ConsultVoiceRecorder
              petName={pet.name}
              species={pet.species}
              visitReason={visitReason}
              disabled={isSubmitting || Boolean(consultPausedAt)}
              onExtracted={(fields) => applyVoiceExtract(fields)}
            />
          </div>

          {tabError && (
            <div
              ref={tabErrorRef}
              className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs rounded-xl"
            >
              {tabError}
            </div>
          )}

          <div
            key={activeSoapTab}
            className={`min-h-[12rem] transition-opacity duration-300 ${
              tabTransitioning ? 'opacity-0 pointer-events-none' : 'opacity-100 consult-soap-panel-enter'
            }`}
          >

          {/* S — Subjective */}
          {activeSoapTab === 'S' && (
          <div className="glass-panel rounded-xl border border-outline-variant/40 p-4 shadow-premium space-y-4">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">SOAP Subjective</h3>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">Chief complaint and patient-reported history.</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                <RequiredLabel>Chief Complaint / Reason for Visit</RequiredLabel>
              </label>
              <input
                type="text"
                data-soap-tab="S"
                data-soap-field="chiefComplaint"
                {...register('chiefComplaint')}
                className="w-full px-3 py-2.5 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-on-surface outline-none"
              />
              {errors.chiefComplaint && (
                <span className="text-[10px] text-destructive mt-1 block">{errors.chiefComplaint.message}</span>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                Anamnesis / History
              </label>
              <textarea
                {...register('history')}
                placeholder="Record anamnesis details, signs onset, symptoms..."
                rows={8}
                className="w-full px-3 py-2.5 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-on-surface outline-none"
              />
            </div>
          </div>
          )}

          {/* O — Objective */}
          {activeSoapTab === 'O' && (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">SOAP Objective</h3>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">Physical exam findings and structured vitals.</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                <RequiredLabel>Examination Findings</RequiredLabel>
                <span className="text-on-surface-variant/50 font-normal normal-case ml-1">(or fill vitals below)</span>
              </label>
              <textarea
                data-soap-tab="O"
                data-soap-field="examinationFindings"
                {...register('examinationFindings')}
                placeholder="Record clinical checks (temperature, cardiac, visual check)..."
                rows={8}
                className="w-full px-3 py-2.5 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-on-surface outline-none"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container/20 border border-outline-variant/30">
              <p className="col-span-full text-[10px] font-semibold text-primary uppercase tracking-wider">
                Vitals <span className="text-on-surface-variant/50 font-normal normal-case">(at least one required if no exam notes)</span>
              </p>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Temp (°F)</label>
                <input type="number" step="0.1" data-soap-tab="O" data-soap-field="temperatureC" {...register('temperatureC', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Heart rate</label>
                <input type="number" data-soap-tab="O" data-soap-field="heartRateBpm" {...register('heartRateBpm', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Resp. rate</label>
                <input type="number" data-soap-tab="O" data-soap-field="respiratoryRate" {...register('respiratoryRate', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Weight (kg)</label>
                <input type="number" step="0.1" data-soap-tab="O" data-soap-field="weightKg" {...register('weightKg', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Body condition (1–9)</label>
                <input type="number" min={1} max={9} step={1} data-soap-tab="O" data-soap-field="bodyConditionScore" {...register('bodyConditionScore', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">Dehydration %</label>
                <input type="number" min={0} max={100} step={1} data-soap-tab="O" data-soap-field="dehydrationPercent" {...register('dehydrationPercent', { valueAsNumber: true })} className="w-full h-9 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container/20 border border-outline-variant/30 space-y-3">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Clinical signs</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  [
                    ['signVomiting', 'Vomiting'],
                    ['signAnorexia', 'Anorexia'],
                    ['signDiarrhoea', 'Diarrhoea'],
                    ['signConstipation', 'Constipation'],
                    ['signVaccination', 'Vaccination'],
                    ['signDeworming', 'Deworming'],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      data-soap-tab="O"
                      data-soap-field={field}
                      {...register(field)}
                      className="rounded border-outline-variant text-primary focus:ring-primary/40"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* A — Assessment */}
          {activeSoapTab === 'A' && (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">SOAP Assessment</h3>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">Clinical diagnosis and assessment.</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                <RequiredLabel>Diagnosis / Assessment</RequiredLabel>
              </label>
              <textarea
                data-soap-tab="A"
                data-soap-field="diagnosis"
                {...register('diagnosis')}
                placeholder="e.g. Feline Infectious Enteritis, Otitis Externa"
                rows={4}
                className="w-full px-3 py-2.5 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-on-surface outline-none font-semibold"
              />
              {errors.diagnosis && (
                <span className="text-[10px] text-destructive mt-1 block">{errors.diagnosis.message}</span>
              )}
            </div>
          </div>
          )}

          {/* P — Plan */}
          {activeSoapTab === 'P' && (
          <div className="space-y-6">
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">SOAP Plan</h3>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">Treatment plan, follow-up, and services performed.</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                <RequiredLabel>Treatment Plan & Recommendations</RequiredLabel>
              </label>
              <textarea
                data-soap-tab="P"
                data-soap-field="treatmentPlan"
                {...register('treatmentPlan')}
                placeholder="Specify general directions, clinical advice, or home care details..."
                rows={5}
                className="w-full px-3 py-2.5 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm text-on-surface outline-none"
              />
            </div>

            {visitType === 'surgery' && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                    Procedure notes
                  </label>
                  <textarea
                    {...register('procedureNotes')}
                    placeholder="Surgical procedure details, anesthesia notes..."
                    rows={3}
                    className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant focus:border-primary rounded-xl text-xs text-on-surface outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                    Post-op medication
                  </label>
                  <textarea
                    {...register('postOpMedication')}
                    placeholder="Pain management, antibiotics, wound care..."
                    rows={2}
                    className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant focus:border-primary rounded-xl text-xs text-on-surface outline-none"
                  />
                </div>
              </>
            )}

            <div className="p-4 bg-surface-container/20 border border-outline-variant/40 rounded-xl space-y-4">
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">
                Follow-up Schedule
              </label>
              <p className="text-[10px] text-on-surface-variant/60">
                Schedule follow-up appointment requests from check-in date ({followUpBaseDate}).
              </p>

              <div className="flex flex-wrap gap-2">
                {(['none', 'offset', 'consecutive'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFollowUpMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all capitalize ${
                      followUpMode === mode
                        ? 'bg-primary text-on-primary border-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    {mode === 'none' ? 'None' : mode === 'offset' ? 'After N days' : 'Consecutive days'}
                  </button>
                ))}
              </div>

              {followUpMode === 'offset' && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-on-surface-variant">Offset from check-in</p>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOW_UP_PRESETS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleFollowUpDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                          followUpOffsetDays.includes(day)
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        {day}d → {offsetDatePreview(followUpBaseDate, day)}
                      </button>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={customFollowUpDay}
                        onChange={(e) => setCustomFollowUpDay(e.target.value)}
                        placeholder="Custom"
                        className="w-16 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-[10px]"
                      />
                      <button type="button" onClick={addCustomFollowUpDay} className="text-[10px] font-bold text-primary hover:underline">
                        Add
                      </button>
                    </div>
                  </div>
                  {followUpOffsetDays.length > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {followUpOffsetDays.map((d) => (
                        <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {d}d ({offsetDatePreview(followUpBaseDate, d)})
                          <button type="button" onClick={() => removeFollowUpDay(d)} className="hover:text-destructive" aria-label={`Remove ${d} day follow-up`}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button type="button" onClick={clearFollowUpDays} className="text-[10px] font-bold text-on-surface-variant hover:text-destructive underline">
                        Clear
                      </button>
                    </div>
                  )}
                  {errors.followUpOffsetDays && (
                    <p className="text-[10px] text-destructive font-semibold">
                      {errors.followUpOffsetDays.message as string}
                    </p>
                  )}
                </div>
              )}

              {followUpMode === 'consecutive' && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-on-surface-variant">Back-to-back daily appointments</p>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-[9px] font-semibold text-on-surface-variant uppercase mb-1">Number of days</label>
                      <input
                        type="number"
                        min={1}
                        value={consecutiveCountInput}
                        onChange={(e) => setConsecutiveCountInput(e.target.value)}
                        className="w-20 px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-[10px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-on-surface-variant uppercase mb-1">Start date</label>
                      <input
                        type="date"
                        value={consecutiveStartDate}
                        onChange={(e) => setConsecutiveStartDate(e.target.value)}
                        className="px-2 py-1.5 bg-surface border border-outline-variant rounded-lg text-[10px]"
                      />
                    </div>
                    <button type="button" onClick={() => void applyConsecutiveFollowUp()} disabled={applyingFollowUp} className="text-[10px] font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-60">
                      {applyingFollowUp ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Scheduling…
                        </>
                      ) : followUpScheduled ? (
                        'Scheduled'
                      ) : (
                        'Confirm Schedule'
                      )}
                    </button>
                  </div>
                  {errors.followUpConsecutive && (
                    <p className="text-[10px] text-destructive font-semibold">
                      {errors.followUpConsecutive.message as string}
                    </p>
                  )}
                  {followUpPreviews.length > 0 && (
                    <p className="text-[10px] text-primary font-semibold">
                      Preview: {followUpPreviews.map((p) => p.preferredDate).join(', ')}
                    </p>
                  )}
                </div>
              )}

              <input
                type="text"
                {...register('followUpRecommendation')}
                placeholder="Follow-up notes (e.g. ear recheck, wound inspection)"
                className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-xs text-on-surface outline-none"
              />
            </div>
          </div>

          {/* SERVICES PERFORMED */}
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-primary" />
                Services Performed
              </h3>
              <button
                type="button"
                onClick={handleAddService}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary border border-primary/30 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </button>
            </div>

            {serviceFields.length > 0 ? (
              <div className="space-y-3">
                {serviceFields.map((field, idx) => (
                  <div
                    key={field.id}
                    ref={idx === serviceFields.length - 1 ? lastServiceRowRef : undefined}
                    className="p-4 bg-surface-container/20 border border-outline-variant/40 rounded-xl grid grid-cols-12 gap-3 items-end"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                        Service
                      </label>
                      <Select
                        size="compact"
                        preferPlacement="auto"
                        value={watch(`serviceItems.${idx}.serviceId`) || ''}
                        onChange={(v) => handleSelectService(idx, v)}
                        options={[
                          { value: '', label: '— Select service —' },
                          ...catalogServices.map((s) => ({
                            value: s.id,
                            label: `${s.name} (${formatCurrency(s.price)})`,
                          })),
                        ]}
                        placeholder="Select service…"
                        onAddNew={() => router.push('/dashboard/settings')}
                        addNewLabel="Add service in settings"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`serviceItems.${idx}.unitPrice`, { valueAsNumber: true })}
                        className="w-full px-2.5 py-1.5 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        {...register(`serviceItems.${idx}.quantity`, { valueAsNumber: true })}
                        min={1}
                        className="w-full px-2.5 py-1.5 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none font-bold"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeService(idx)}
                        className="text-destructive hover:bg-destructive/5 p-1 rounded transition-all"
                        title="Remove service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="hidden" {...register(`serviceItems.${idx}.name`)} />
                    <input type="hidden" {...register(`serviceItems.${idx}.serviceId`)} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/50 italic text-center py-4 bg-surface-container/10 rounded-xl border border-outline-variant/20">
                No services added. Consultation fee is auto-suggested when catalog is available.
              </p>
            )}
          </div>
          </div>
          )}

          {/* Rx — Prescription */}
          {activeSoapTab === 'Rx' && (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 shadow-premium space-y-5">
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Prescription (Rx)</h3>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">Medicines and items to dispense at checkout.</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/30 border border-outline-variant/40 space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-primary tracking-wider">Consultation summary</h4>
              <p className="text-xs text-on-surface">
                <span className="font-semibold">Chief complaint:</span>{' '}
                {chiefComplaintWatch?.trim() || '—'}
              </p>
              <p className="text-xs text-on-surface">
                <span className="font-semibold">Diagnosis:</span>{' '}
                {diagnosisWatch?.trim() || '—'}
              </p>
              <p className="text-xs text-on-surface">
                <span className="font-semibold">Treatment plan:</span>{' '}
                {treatmentPlanWatch?.trim() || '—'}
                {serviceFields.length > 0 ? ` (${serviceFields.length} service${serviceFields.length === 1 ? '' : 's'})` : ''}
              </p>
              <p className="text-xs text-on-surface">
                <span className="font-semibold">Labs &amp; docs:</span>{' '}
                {labOrders.length} lab{labOrders.length === 1 ? '' : 's'}, {documents.length} doc{documents.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-on-surface">
                <span className="font-semibold">Prescription:</span>{' '}
                {noPrescriptionNeeded
                  ? 'No prescription needed'
                  : prescriptionItemsWatch.length > 0
                    ? `${prescriptionItemsWatch.length} line${prescriptionItemsWatch.length === 1 ? '' : 's'}`
                    : '—'}
              </p>
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl border border-outline-variant/40 bg-surface-container/20 cursor-pointer">
              <input
                type="checkbox"
                {...register('noPrescriptionNeeded', {
                  onChange: (e) => {
                    if (e.target.checked) {
                      setValue('prescriptionItems', []);
                    }
                  },
                })}
                className="rounded border-outline-variant"
              />
              <span className="text-xs font-semibold text-on-surface">No prescription needed for this visit</span>
            </label>

            {!noPrescriptionNeeded && (
            <>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-primary" />
                Items dispensed
              </h4>
              <button
                type="button"
                onClick={() => append({ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '', quantityRequested: 1 })}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-primary border border-primary/30 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            {fields.length > 0 ? (
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div 
                    key={field.id} 
                    className="p-4 bg-surface-container/20 border border-outline-variant/40 rounded-xl grid grid-cols-12 gap-3 items-start relative"
                  >
                    {/* Catalog linker selection */}
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <CreatableSelect
                        label="Link Inventory Product"
                        size="compact"
                        allowCreate={false}
                        showAddButton={false}
                        searchPlaceholder="Search catalog…"
                        value={watch(`prescriptionItems.${idx}.productId`) || ''}
                        onChange={(v) => handleSelectProduct(idx, v)}
                        options={[
                          { value: '', label: '— Custom / free-text —' },
                          ...prescriptionProductOptions,
                        ]}
                        placeholder="Link product…"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddType('medicine');
                          setQuickAddTarget({ kind: 'product', index: idx });
                          setQuickAddOpen(true);
                        }}
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Add catalog item
                      </button>
                    </div>

                    <div className="col-span-12 sm:col-span-8 grid grid-cols-4 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                          <RequiredLabel>Medicine Name</RequiredLabel>
                        </label>
                        <input
                          type="text"
                          data-soap-tab="Rx"
                          data-soap-field="prescription-medicine"
                          {...register(`prescriptionItems.${idx}.medicineName`)}
                          placeholder="e.g. Amoxicillin"
                          className="w-full px-2.5 py-1.5 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
                          <RequiredLabel>Dosage</RequiredLabel>
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            data-soap-tab="Rx"
                            data-soap-field="prescription-dosage"
                            {...register(`prescriptionItems.${idx}.dosage`)}
                            onBlur={(e) => {
                              const unit = dosageUnits[idx] || 'ml';
                              const combined = combineDosageWithUnit(e.target.value, unit);
                              if (combined !== e.target.value) {
                                setValue(`prescriptionItems.${idx}.dosage`, combined, { shouldValidate: true });
                              }
                            }}
                            placeholder="e.g. 5"
                            className="flex-1 min-w-0 px-2.5 py-1.5 glass-panel border border-outline-variant rounded-lg text-xs text-on-surface outline-none"
                            required
                          />
                          <select
                            value={dosageUnits[idx] || 'ml'}
                            onChange={(e) => {
                              const unit = e.target.value;
                              setDosageUnits((prev) => ({ ...prev, [idx]: unit }));
                              const current = watch(`prescriptionItems.${idx}.dosage`) || '';
                              const combined = combineDosageWithUnit(current, unit);
                              if (combined !== current) {
                                setValue(`prescriptionItems.${idx}.dosage`, combined, { shouldValidate: true });
                              }
                            }}
                            className="w-16 px-1 py-1.5 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                          >
                            <option value="ml">ml</option>
                            <option value="tablet">tab</option>
                            <option value="capsule">cap</option>
                            <option value="drops">drops</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                          <RequiredLabel>Qty</RequiredLabel>
                        </label>
                        <input
                          type="number"
                          data-soap-tab="Rx"
                          data-soap-field="prescription-qty"
                          {...register(`prescriptionItems.${idx}.quantityRequested`, { valueAsNumber: true })}
                          className="w-full px-2.5 py-1.5 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none font-bold"
                          min={1}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-span-12 grid grid-cols-12 gap-2 mt-2 pt-2 border-t border-outline-variant/25">
                      <div className="col-span-5">
                        <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                          <RequiredLabel>Frequency</RequiredLabel>
                        </label>
                        <input
                          type="text"
                          data-soap-tab="Rx"
                          data-soap-field="prescription-frequency"
                          {...register(`prescriptionItems.${idx}.frequency`)}
                          placeholder="e.g. Twice daily"
                          className="w-full px-2 py-1 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                          <RequiredLabel>Duration</RequiredLabel>
                        </label>
                        <input
                          type="text"
                          data-soap-tab="Rx"
                          data-soap-field="prescription-duration"
                          {...register(`prescriptionItems.${idx}.duration`)}
                          placeholder="e.g. 7 days"
                          className="w-full px-2 py-1 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-on-surface-variant/40 uppercase mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          {...register(`prescriptionItems.${idx}.instructions`)}
                          placeholder="With food"
                          className="w-full px-2 py-1 glass-panel border border-outline-variant rounded-lg text-[10px] text-on-surface outline-none"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="text-destructive hover:bg-destructive/5 p-1 rounded transition-all mt-3"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/50 italic text-center py-4 bg-surface-container/10 rounded-xl border border-outline-variant/20">
                No items prescribed. Click &quot;Add Medicine&quot; to prescribe items.
              </p>
            )}
            </>
            )}
          </div>
          )}

          </div>

          <ConsultationStepActions
            activeTab={activeSoapTab}
            tabTitle={getSoapTabTitle(activeSoapTab)}
            onPrevious={goToPrevSoapTab}
            onNext={() => void goToNextSoapTab()}
            onFinalize={() => soapWorkspaceRef.current?.requestSubmit()}
            isSubmitting={isSubmitting}
            savingDraft={savingDraft}
            tabTransitioning={tabTransitioning}
            consultPaused={Boolean(consultPausedAt)}
            showFinalize={activeSoapTab === 'Rx'}
          />

          {/* Internal notes — visible on all tabs */}
          <div className="glass-panel rounded-xl border border-outline-variant/30 p-4">
            <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
              Internal Notes (Doctor Only)
            </label>
            <input
              type="text"
              {...register('internalNotes')}
              placeholder="Private findings not visible on client receipts"
              className="w-full px-3 py-2 bg-surface-container/20 border border-outline-variant rounded-xl text-xs text-on-surface outline-none"
            />
          </div>

        </form>
      )}

      <CatalogItemQuickAddModal
        open={quickAddOpen}
        onClose={() => {
          setQuickAddOpen(false);
          setQuickAddTarget(null);
        }}
        categories={categories}
        activeBranchId={activeBranchId}
        defaultType={quickAddType}
        onSuccess={(product) => {
          setLocalProducts((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            return [
              ...prev,
              {
                id: product.id,
                name: product.name,
                type: product.type,
                sellingPrice: product.sellingPrice,
              },
            ];
          });
          if (quickAddTarget?.kind === 'product') {
            handleSelectProduct(quickAddTarget.index, product.id);
          }
        }}
      />

    </div>
    </div>
  );
}

