import type { WorkflowVisitPurpose } from '@/lib/appointments/visit-purpose';

export type ProcessStepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export type ProcessStep = {
  key: string;
  label: string;
  status: ProcessStepStatus;
  notes?: string;
};

export type FitnessOutcome = 'fit' | 'not_fit' | '';

export type WorkflowDocumentIds = {
  before?: string[];
  after?: string[];
  certificate?: string;
};

export type GroomingArrivalSection = {
  confirmOwnerPet?: boolean;
  verifyAppointment?: boolean;
  emergencyContact?: string;
  vaccinationsVerified?: boolean;
  groomingHistoryNotes?: string;
  medicalAlerts?: string;
  behaviorCheck?: string;
  specialNeeds?: string;
  fleasTicksCheck?: boolean;
  beforePhotoIds?: string[];
};

export type GroomingAssignmentSection = {
  groomerId?: string;
  groomerName?: string;
  station?: string;
  estimatedStart?: string;
  estimatedCompletion?: string;
};

export type GroomingAssessmentSection = {
  coatCondition?: string;
  matsTangles?: string;
  skinCondition?: string;
  earCondition?: string;
  nailLength?: string;
  analGlands?: string;
  fleasTicks?: string;
  weightKg?: number | null;
  behaviorToday?: string;
  abnormalFindings?: boolean;
  vetConsultRecommended?: boolean;
  assessmentNotes?: string;
};

export type GroomingUpsellSection = {
  severeMatting?: boolean;
  fleaTickTreatment?: boolean;
  medicatedShampoo?: boolean;
  deSheddingTreatment?: boolean;
  teethBrushing?: boolean;
  nailGrinding?: boolean;
  extraTimeRequired?: boolean;
  ownerApprovalRequired?: boolean;
  additionalFee?: number | null;
  upsellNotes?: string;
};

export type GroomingCompleteSection = {
  coatEven?: boolean;
  nailsTrimmed?: boolean;
  earsCleaned?: boolean;
  eyesCleaned?: boolean;
  pawsTrimmed?: boolean;
  sanitaryClean?: boolean;
  requestsCompleted?: boolean;
  behaviorGood?: boolean;
  afterPhotoIds?: string[];
  groomingNotes?: string;
};

export type GroomingQualitySection = {
  overallQuality?: string;
  allServicesDone?: boolean;
  missedAreas?: string;
  upsellReviewed?: boolean;
  petComfort?: string;
};

export type GroomingNotificationSection = {
  readyForPickup?: boolean;
  channels?: string[];
  summarySent?: boolean;
  invoiceEstimateNotes?: string;
};

export type GroomingCheckoutSection = {
  servicesConfirmed?: boolean;
  productsNotes?: string;
  discountNotes?: string;
  tips?: number | null;
  paymentMethodNotes?: string;
};

export type GroomingWorkflowSections = {
  arrival: GroomingArrivalSection;
  assignment: GroomingAssignmentSection;
  assessment: GroomingAssessmentSection;
  process: ProcessStep[];
  upsells: GroomingUpsellSection;
  complete: GroomingCompleteSection;
  quality: GroomingQualitySection;
  notification: GroomingNotificationSection;
  checkout: GroomingCheckoutSection;
};

export type VaccineRecord = {
  id: string;
  name: string;
  type: 'core' | 'non_core' | 'booster' | 'titer' | '';
  manufacturer?: string;
  lotNumber?: string;
  expiryDate?: string;
  dose?: string;
  route?: string;
  site?: string;
  administeredAt?: string;
  administeredById?: string;
  administeredByName?: string;
  nextDueDate?: string;
  reactionNotes?: string;
};

export type VaccinationArrivalSection = {
  verifyAppointment?: boolean;
  ownerConfirmed?: boolean;
  petConfirmed?: boolean;
  emergencyContact?: string;
  reasonForVisit?: string;
  previousVaccineNotes?: string;
  certificateDocumentId?: string;
};

export type VaccinationScreeningSection = {
  generalHealthCheck?: string;
  temperatureC?: number | null;
  weightKg?: number | null;
  heartRateBpm?: number | null;
  bodyConditionScore?: number | null;
  appetite?: string;
  energyLevel?: string;
  vomitingDiarrhea?: string;
  coughSneezing?: string;
  medications?: string;
  allergies?: string;
  previousReaction?: string;
};

export type VaccinationExamSection = {
  physicalExam?: string;
  medicalHistoryReview?: string;
  fitnessOutcome: FitnessOutcome;
  vaccinePlanDiscussion?: string;
  ownerQuestions?: string;
  consentObtained?: boolean;
  notFitReason?: string;
  treatmentAdvice?: string;
  recheckDate?: string;
};

export type VaccinationPlanSection = {
  coreVaccines?: string;
  nonCoreVaccines?: string;
  boosterNotes?: string;
  travelBoardingNotes?: string;
  ownerConfirmed?: boolean;
  benefitsDiscussed?: boolean;
  sideEffectsDiscussed?: boolean;
  costEstimate?: number | null;
};

export type VaccinationProcessSection = {
  steps: ProcessStep[];
  vaccines: VaccineRecord[];
  observationNotes?: string;
  postCareInstructions?: string;
  certificateGenerated?: boolean;
};

export type VaccinationDocumentationSection = {
  recordsUpdated?: boolean;
  immunizationHistoryUpdated?: boolean;
  reminderSet?: boolean;
  notes?: string;
};

export type VaccinationCommunicationSection = {
  channels?: string[];
  visitSummary?: string;
  careInstructions?: string;
  reactionsToWatch?: string;
};

export type VaccinationCheckoutSection = {
  servicesConfirmed?: boolean;
  vaccineChargesNotes?: string;
  productsNotes?: string;
  paymentMethodNotes?: string;
};

export type VaccinationFollowUpSection = {
  checkInMessage?: string;
  adverseReactionNotes?: string;
  nextReminderDate?: string;
  wellnessReminder?: boolean;
};

export type VaccinationWorkflowSections = {
  arrival: VaccinationArrivalSection;
  screening: VaccinationScreeningSection;
  exam: VaccinationExamSection;
  plan: VaccinationPlanSection;
  process: VaccinationProcessSection;
  documentation: VaccinationDocumentationSection;
  communication: VaccinationCommunicationSection;
  checkout: VaccinationCheckoutSection;
  followUp: VaccinationFollowUpSection;
};

export type DewormingArrivalSection = {
  verifyAppointment?: boolean;
  ownerConfirmed?: boolean;
  petConfirmed?: boolean;
  emergencyContact?: string;
  reasonForVisit?: string;
  previousRecordsNotes?: string;
  dewormingHistory?: string;
  vaccinationRecordNotes?: string;
};

export type DewormingTriageSection = {
  appetite?: string;
  stoolQuality?: string;
  vomitingDiarrhea?: string;
  weightLoss?: string;
  coughSneezing?: string;
  itchingSkin?: string;
  lethargy?: string;
  otherSymptoms?: string;
  medications?: string;
  travelExposure?: string;
};

export type DewormingExamSection = {
  physicalExam?: string;
  hydrationStatus?: string;
  bodyCondition?: string;
  abdominalPalpation?: string;
  parasiteSigns?: string;
  previousHistoryReview?: string;
  fecalTestRequired?: boolean;
  fitnessOutcome: FitnessOutcome;
  notFitReason?: string;
  treatmentAdvice?: string;
  followUpDate?: string;
};

export type DewormingPlanSection = {
  dewormerName?: string;
  dosage?: string;
  route?: string;
  parasiteRisk?: string;
  previousDewormer?: string;
  scheduleNotes?: string;
  ownerConfirmed?: boolean;
  benefitsDiscussed?: boolean;
  sideEffectsDiscussed?: boolean;
  costEstimate?: number | null;
};

export type DewormingAdministrationSection = {
  steps: ProcessStep[];
  dewormerName?: string;
  batchNumber?: string;
  doseGiven?: string;
  route?: string;
  weightKg?: number | null;
  administeredAt?: string;
  administeredById?: string;
  administeredByName?: string;
  nextDoseDate?: string;
  observationNotes?: string;
  postAdvice?: string;
};

export type DewormingDocumentationSection = {
  recordsUpdated?: boolean;
  notes?: string;
};

export type DewormingCommunicationSection = {
  channels?: string[];
  visitSummary?: string;
  careInstructions?: string;
  reactionsToWatch?: string;
  reminderSet?: boolean;
};

export type DewormingCheckoutSection = {
  servicesConfirmed?: boolean;
  dewormerChargeNotes?: string;
  productsNotes?: string;
  paymentMethodNotes?: string;
};

export type DewormingFollowUpSection = {
  checkInMessage?: string;
  adverseReactionNotes?: string;
  nextReminderDate?: string;
  wellnessReminder?: boolean;
};

export type DewormingWorkflowSections = {
  arrival: DewormingArrivalSection;
  triage: DewormingTriageSection;
  exam: DewormingExamSection;
  plan: DewormingPlanSection;
  administration: DewormingAdministrationSection;
  documentation: DewormingDocumentationSection;
  communication: DewormingCommunicationSection;
  checkout: DewormingCheckoutSection;
  followUp: DewormingFollowUpSection;
};

export type GroomingChartSummary = {
  groomerName?: string;
  servicesPerformed?: string;
  coatCondition?: string;
  skinEarNailFindings?: string;
  behaviorNotes?: string;
  upsells?: string;
  qualityReviewStatus?: string;
  totalCharge?: number | null;
  notes?: string;
};

export type VaccinationChartSummary = {
  vaccineName?: string;
  vaccineType?: string;
  manufacturer?: string;
  lotNumber?: string;
  expiryDate?: string;
  dose?: string;
  routeSite?: string;
  administeredByName?: string;
  nextDueDate?: string;
  notes?: string;
};

export type DewormingChartSummary = {
  dewormerName?: string;
  dose?: string;
  route?: string;
  weightKg?: number | null;
  batchNumber?: string;
  parasiteRisk?: string;
  administeredByName?: string;
  nextDoseDue?: string;
  notes?: string;
};

export type WorkflowPayloadBase = {
  workflowType: WorkflowVisitPurpose;
  workflowStatus: string;
  completedAt?: string;
  completedBy?: string;
  documentIds?: WorkflowDocumentIds;
};

export type GroomingWorkflowPayload = WorkflowPayloadBase & {
  workflowType: 'grooming';
  sections: GroomingWorkflowSections;
  chartSummary: GroomingChartSummary;
};

export type VaccinationWorkflowPayload = WorkflowPayloadBase & {
  workflowType: 'vaccination';
  sections: VaccinationWorkflowSections;
  chartSummary: VaccinationChartSummary;
};

export type DewormingWorkflowPayload = WorkflowPayloadBase & {
  workflowType: 'deworming';
  sections: DewormingWorkflowSections;
  chartSummary: DewormingChartSummary;
};

export type WorkflowPayload =
  | GroomingWorkflowPayload
  | VaccinationWorkflowPayload
  | DewormingWorkflowPayload;

export type WorkflowConsultDraft = {
  kind: 'workflow';
  workflowType: WorkflowVisitPurpose;
  currentStepId: string;
  payload: Partial<GroomingWorkflowSections | VaccinationWorkflowSections | DewormingWorkflowSections>;
  serviceItems?: Array<{
    serviceId?: string | null;
    name: string;
    unitPrice: number;
    quantity: number;
  }>;
  noPrescriptionNeeded?: boolean;
};

export type WorkflowChartRowBase = {
  visitId: string;
  date: string;
  visitPurpose: WorkflowVisitPurpose;
};

export type VaccinationChartRow = WorkflowChartRowBase & {
  workflowType: 'vaccination';
  vaccineName: string;
  vaccineType: string;
  manufacturer: string;
  lotNumber: string;
  expiryDate: string;
  dose: string;
  routeSite: string;
  administeredBy: string;
  nextDueDate: string;
  certificateDocumentId?: string;
  notes: string;
};

export type DewormingChartRow = WorkflowChartRowBase & {
  workflowType: 'deworming';
  dewormerName: string;
  dose: string;
  route: string;
  weightAtVisit: string;
  batchNumber: string;
  parasiteRisk: string;
  administeredBy: string;
  nextDoseDue: string;
  notes: string;
};

export type GroomingChartRow = WorkflowChartRowBase & {
  workflowType: 'grooming';
  groomer: string;
  servicesPerformed: string;
  coatCondition: string;
  skinEarNailFindings: string;
  behaviorNotes: string;
  beforePhotoIds: string[];
  afterPhotoIds: string[];
  upsells: string;
  qualityReviewStatus: string;
  totalCharge: string;
  notes: string;
};

export type WorkflowChartRow = VaccinationChartRow | DewormingChartRow | GroomingChartRow;
