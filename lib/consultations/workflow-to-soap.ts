import type { CompleteConsultationInput } from '@/lib/validations/schemas';
import type {
  DewormingWorkflowPayload,
  GroomingWorkflowPayload,
  VaccinationWorkflowPayload,
  WorkflowPayload,
} from '@/lib/consultations/workflow-types';

function groomingToSoap(payload: GroomingWorkflowPayload, visitReason: string): Partial<CompleteConsultationInput> {
  const { arrival, assessment, complete, upsells, process } = payload.sections;
  const conditions = (assessment.conditionFlags ?? [])
    .filter((f) => f.checked)
    .map((f) => f.label)
    .join(', ');

  const subjective = [
    assessment.medicalHistory && `Medical history: ${assessment.medicalHistory}`,
    arrival.behaviorCheck && `Behavior: ${arrival.behaviorCheck}`,
    arrival.groomingHistoryNotes && `Grooming history: ${arrival.groomingHistoryNotes}`,
    arrival.medicalAlerts && `Medical alerts: ${arrival.medicalAlerts}`,
    arrival.specialNeeds && `Special needs: ${arrival.specialNeeds}`,
  ]
    .filter(Boolean)
    .join('\n');

  const objective = [
    assessment.physicalExam && `Exam: ${assessment.physicalExam}`,
    assessment.coatCondition && `Coat: ${assessment.coatCondition}`,
    conditions && `Conditions: ${conditions}`,
    assessment.behaviorToday && `Behavior today: ${assessment.behaviorToday}`,
  ]
    .filter(Boolean)
    .join('\n');

  const completedSteps = process
    .filter((s) => s.status === 'completed')
    .map((s) => s.label)
    .join(', ');

  const upsellList = Object.entries(upsells)
    .filter(([k, v]) => v === true && k !== 'additionalFee')
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').trim())
    .join(', ');

  const diagnosis =
    assessment.fitnessOutcome === 'not_fit'
      ? 'Grooming assessment — not fit'
      : assessment.abnormalFindings
        ? 'Grooming assessment — abnormal findings noted'
        : 'Grooming assessment — routine';

  return {
    visitType: 'standard',
    chiefComplaint: visitReason || assessment.groomingType || 'Grooming appointment',
    history: subjective || undefined,
    examinationFindings: objective || undefined,
    diagnosis,
    treatmentPlan: [
      assessment.groomingType && `Grooming type: ${assessment.groomingType}`,
      completedSteps && `Services performed: ${completedSteps}`,
      upsellList && `Upsells: ${upsellList}`,
      assessment.vetConsultEnabled && assessment.treatmentPlan
        ? `Vet consult plan: ${assessment.treatmentPlan}`
        : '',
      assessment.administeredMedication &&
        `Administered medication: ${assessment.administeredMedication}`,
      complete.groomingNotes,
    ]
      .filter(Boolean)
      .join('\n'),
    temperatureC: assessment.temperatureC ?? undefined,
    heartRateBpm: assessment.heartRateBpm ?? undefined,
    respiratoryRate: assessment.respiratoryRate ?? undefined,
    weightKg: assessment.weightKg ?? undefined,
    bodyConditionScore: assessment.bodyConditionScore ?? undefined,
    noPrescriptionNeeded: true,
    prescriptionItems: [],
  };
}

function vaccinationToSoap(
  payload: VaccinationWorkflowPayload,
  visitReason: string
): Partial<CompleteConsultationInput> {
  const { arrival, screening, exam, process, communication } = payload.sections;
  const subjective = [
    arrival.reasonForVisit && `Reason: ${arrival.reasonForVisit}`,
    arrival.previousVaccineNotes && `Previous vaccines: ${arrival.previousVaccineNotes}`,
    exam.medicalHistoryReview && `Medical history: ${exam.medicalHistoryReview}`,
    screening.previousReaction && `Previous reaction: ${screening.previousReaction}`,
    screening.medications && `Medications: ${screening.medications}`,
    screening.allergies && `Allergies: ${screening.allergies}`,
    exam.ownerQuestions && `Owner questions: ${exam.ownerQuestions}`,
  ]
    .filter(Boolean)
    .join('\n');

  const objective = [
    screening.generalHealthCheck && `Health check: ${screening.generalHealthCheck}`,
    screening.appetite && `Appetite: ${screening.appetite}`,
    screening.energyLevel && `Energy: ${screening.energyLevel}`,
    exam.physicalExam && `Exam: ${exam.physicalExam}`,
  ]
    .filter(Boolean)
    .join('\n');

  const vaccines = process.vaccines ?? [];
  const vaccineSummary = vaccines
    .filter((v) => v.name?.trim())
    .map(
      (v) =>
        `${v.name} (${exam.vaccinationScheduleType || v.type || 'vaccine'}) — administered ${v.administeredAt || '—'}, valid until ${v.nextDueDate || '—'}`
    )
    .join('\n');

  const diagnosis =
    exam.fitnessOutcome === 'not_fit'
      ? `Not fit for vaccination: ${exam.notFitReason || 'see notes'}`
      : 'Fit for vaccination';

  return {
    visitType: 'standard',
    chiefComplaint: visitReason || arrival.reasonForVisit || 'Vaccination appointment',
    history: subjective || undefined,
    examinationFindings: objective || undefined,
    diagnosis,
    treatmentPlan: [
      exam.vaccinationScheduleType && `Schedule type: ${exam.vaccinationScheduleType}`,
      vaccineSummary,
      process.postCareInstructions,
      communication.careInstructions,
      exam.fitnessOutcome === 'not_fit' ? exam.treatmentAdvice : '',
    ]
      .filter(Boolean)
      .join('\n'),
    temperatureC: screening.temperatureC ?? undefined,
    heartRateBpm: screening.heartRateBpm ?? undefined,
    respiratoryRate: screening.respiratoryRate ?? undefined,
    weightKg: screening.weightKg ?? undefined,
    bodyConditionScore: screening.bodyConditionScore ?? undefined,
    followUpRecommendation:
      exam.fitnessOutcome === 'not_fit' && exam.recheckDate
        ? `Recheck vaccination: ${exam.recheckDate}`
        : vaccines.find((v) => v.nextDueDate)?.nextDueDate
          ? `Next vaccine due: ${vaccines.find((v) => v.nextDueDate)?.nextDueDate}`
          : undefined,
    noPrescriptionNeeded: true,
    prescriptionItems: [],
  };
}

function dewormingToSoap(payload: DewormingWorkflowPayload, visitReason: string): Partial<CompleteConsultationInput> {
  const { arrival, triage, exam, administration, communication } = payload.sections;
  const subjective = [
    arrival.reasonForVisit && `Reason: ${arrival.reasonForVisit}`,
    exam.previousHistoryReview && `Medical history: ${exam.previousHistoryReview}`,
    triage.appetite && `Appetite: ${triage.appetite}`,
    triage.stoolQuality && `Stool: ${triage.stoolQuality}`,
    triage.vomitingDiarrhea && `V/D: ${triage.vomitingDiarrhea}`,
    triage.travelExposure && `Exposure: ${triage.travelExposure}`,
    arrival.dewormingHistory && `Deworming history: ${arrival.dewormingHistory}`,
  ]
    .filter(Boolean)
    .join('\n');

  const objective = [
    exam.physicalExam && `Exam: ${exam.physicalExam}`,
    exam.hydrationStatus && `Hydration: ${exam.hydrationStatus}`,
    exam.bodyCondition && `Body condition: ${exam.bodyCondition}`,
    exam.parasiteSigns && `Parasite signs: ${exam.parasiteSigns}`,
    (administration.weightKg ?? exam.weightKg) != null &&
      `Weight: ${administration.weightKg ?? exam.weightKg} kg`,
  ]
    .filter(Boolean)
    .join('\n');

  const diagnosis =
    exam.fitnessOutcome === 'not_fit'
      ? `Not fit for deworming: ${exam.notFitReason || 'see notes'}`
      : exam.fecalTestRequired
        ? 'Fit for deworming — fecal test indicated'
        : 'Fit for deworming';

  return {
    visitType: 'standard',
    chiefComplaint: visitReason || arrival.reasonForVisit || 'Deworming appointment',
    history: subjective || undefined,
    examinationFindings: objective || undefined,
    diagnosis,
    treatmentPlan: [
      exam.dewormingFormType && `Form: ${exam.dewormingFormType}`,
      administration.dewormerName &&
        `Dewormer: ${administration.dewormerName}, dose ${administration.doseGiven || '—'}, administered ${administration.administeredAt || '—'}`,
      administration.batchNumber && `Batch: ${administration.batchNumber}`,
      administration.nextDoseDate && `Valid until: ${administration.nextDoseDate}`,
      administration.postAdvice,
      communication.careInstructions,
      exam.fitnessOutcome === 'not_fit' ? exam.treatmentAdvice : '',
    ]
      .filter(Boolean)
      .join('\n'),
    temperatureC: exam.temperatureC ?? undefined,
    heartRateBpm: exam.heartRateBpm ?? undefined,
    respiratoryRate: exam.respiratoryRate ?? undefined,
    weightKg: administration.weightKg ?? exam.weightKg ?? undefined,
    bodyConditionScore: exam.bodyConditionScore ?? undefined,
    followUpRecommendation: administration.nextDoseDate
      ? `Next deworming due: ${administration.nextDoseDate}`
      : exam.followUpDate
        ? `Follow-up: ${exam.followUpDate}`
        : undefined,
    noPrescriptionNeeded: true,
    prescriptionItems: [],
  };
}

export function workflowToSoap(
  payload: WorkflowPayload,
  visitReason: string
): Partial<CompleteConsultationInput> {
  switch (payload.workflowType) {
    case 'grooming':
      return groomingToSoap(payload, visitReason);
    case 'vaccination':
      return vaccinationToSoap(payload, visitReason);
    case 'deworming':
      return dewormingToSoap(payload, visitReason);
  }
}
