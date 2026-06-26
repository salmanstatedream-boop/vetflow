import type { CompleteConsultationInput } from '@/lib/validations/schemas';
import type {
  DewormingWorkflowPayload,
  GroomingWorkflowPayload,
  VaccinationWorkflowPayload,
  WorkflowPayload,
} from '@/lib/consultations/workflow-types';

function groomingToSoap(payload: GroomingWorkflowPayload, visitReason: string): Partial<CompleteConsultationInput> {
  const { arrival, assessment, complete, upsells, process } = payload.sections;
  const subjective = [
    arrival.behaviorCheck && `Behavior: ${arrival.behaviorCheck}`,
    arrival.groomingHistoryNotes && `Grooming history: ${arrival.groomingHistoryNotes}`,
    arrival.medicalAlerts && `Medical alerts: ${arrival.medicalAlerts}`,
    arrival.specialNeeds && `Special needs: ${arrival.specialNeeds}`,
  ]
    .filter(Boolean)
    .join('\n');

  const objective = [
    assessment.coatCondition && `Coat: ${assessment.coatCondition}`,
    assessment.matsTangles && `Mats/tangles: ${assessment.matsTangles}`,
    assessment.skinCondition && `Skin: ${assessment.skinCondition}`,
    assessment.earCondition && `Ears: ${assessment.earCondition}`,
    assessment.nailLength && `Nails: ${assessment.nailLength}`,
    assessment.fleasTicks && `Fleas/ticks: ${assessment.fleasTicks}`,
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

  return {
    visitType: 'standard',
    chiefComplaint: visitReason || 'Grooming appointment',
    history: subjective || undefined,
    examinationFindings: objective || undefined,
    diagnosis: assessment.abnormalFindings
      ? 'Grooming assessment — abnormal findings noted'
      : 'Grooming assessment — routine',
    treatmentPlan: [
      completedSteps && `Services performed: ${completedSteps}`,
      upsellList && `Upsells: ${upsellList}`,
      complete.groomingNotes,
      assessment.vetConsultRecommended ? 'Vet consultation recommended.' : '',
    ]
      .filter(Boolean)
      .join('\n'),
    weightKg: assessment.weightKg ?? undefined,
    noPrescriptionNeeded: true,
    prescriptionItems: [],
  };
}

function vaccinationToSoap(
  payload: VaccinationWorkflowPayload,
  visitReason: string
): Partial<CompleteConsultationInput> {
  const { arrival, screening, exam, process } = payload.sections;
  const subjective = [
    arrival.reasonForVisit && `Reason: ${arrival.reasonForVisit}`,
    arrival.previousVaccineNotes && `Previous vaccines: ${arrival.previousVaccineNotes}`,
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
    .map(
      (v) =>
        `${v.name} (${v.type || 'vaccine'}) — Lot ${v.lotNumber || '—'}, ${v.route || ''} ${v.site || ''}, next due ${v.nextDueDate || '—'}`
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
      vaccineSummary,
      process.postCareInstructions,
      exam.fitnessOutcome === 'not_fit' ? exam.treatmentAdvice : '',
    ]
      .filter(Boolean)
      .join('\n'),
    temperatureC: screening.temperatureC ?? undefined,
    heartRateBpm: screening.heartRateBpm ?? undefined,
    weightKg: screening.weightKg ?? undefined,
    bodyConditionScore: screening.bodyConditionScore ?? undefined,
    followUpRecommendation:
      exam.fitnessOutcome === 'not_fit' && exam.recheckDate
        ? `Recheck vaccination: ${exam.recheckDate}`
        : vaccines[0]?.nextDueDate
          ? `Next vaccine due: ${vaccines[0].nextDueDate}`
          : undefined,
    noPrescriptionNeeded: true,
    prescriptionItems: [],
  };
}

function dewormingToSoap(payload: DewormingWorkflowPayload, visitReason: string): Partial<CompleteConsultationInput> {
  const { arrival, triage, exam, administration } = payload.sections;
  const subjective = [
    arrival.reasonForVisit && `Reason: ${arrival.reasonForVisit}`,
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
    administration.weightKg != null && `Weight: ${administration.weightKg} kg`,
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
      administration.dewormerName &&
        `Dewormer: ${administration.dewormerName}, dose ${administration.doseGiven}, route ${administration.route}`,
      administration.batchNumber && `Batch: ${administration.batchNumber}`,
      administration.nextDoseDate && `Next dose: ${administration.nextDoseDate}`,
      administration.postAdvice,
      exam.fitnessOutcome === 'not_fit' ? exam.treatmentAdvice : '',
    ]
      .filter(Boolean)
      .join('\n'),
    weightKg: administration.weightKg ?? undefined,
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
