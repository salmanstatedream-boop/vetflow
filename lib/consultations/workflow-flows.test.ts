import { describe, expect, it } from 'vitest';
import {
  createEmptyDewormingSections,
  createEmptyGroomingSections,
  createEmptyVaccinationSections,
  enrichWorkflowPayload,
} from '@/lib/consultations/workflow-chart';
import {
  getWorkflowConfig,
  normalizeWorkflowStepId,
} from '@/lib/consultations/workflow-config';
import {
  validateDewormingComplete,
  validateGroomingComplete,
  validateVaccinationComplete,
  validateWorkflowStep,
} from '@/lib/consultations/workflow-validation';
import { workflowToSoap } from '@/lib/consultations/workflow-to-soap';
import type {
  DewormingWorkflowPayload,
  GroomingWorkflowPayload,
  VaccinationWorkflowPayload,
} from '@/lib/consultations/workflow-types';
import {
  isDewormerProductType,
  isVaccineProductType,
} from '@/lib/inventory/product-types';

describe('specialty workflow configs', () => {
  it('collapses each purpose to two locked pages with drawio labels', () => {
    expect(getWorkflowConfig('vaccination').steps.map((s) => s.id)).toEqual([
      'clinical',
      'wrapup',
    ]);
    expect(getWorkflowConfig('vaccination').steps.map((s) => s.label)).toEqual([
      'Exam & Fitness',
      'Vaccines & Rx',
    ]);
    expect(getWorkflowConfig('deworming').steps.map((s) => [s.id, s.label])).toEqual([
      ['exam', 'Exam & Fitness'],
      ['treatment', 'Deworming & Rx'],
    ]);
    expect(getWorkflowConfig('grooming').steps.map((s) => [s.id, s.label])).toEqual([
      ['assessment', 'Exam & Grooming'],
      ['wrapup', 'Services & Rx'],
    ]);
  });

  it('normalizes legacy step ids into the two-page model', () => {
    expect(normalizeWorkflowStepId('vaccination', 'screening')).toBe('clinical');
    expect(normalizeWorkflowStepId('vaccination', 'followUp')).toBe('wrapup');
    expect(normalizeWorkflowStepId('deworming', 'triage')).toBe('exam');
    expect(normalizeWorkflowStepId('deworming', 'administration')).toBe('treatment');
    expect(normalizeWorkflowStepId('grooming', 'arrival')).toBe('assessment');
    expect(normalizeWorkflowStepId('grooming', 'checkout')).toBe('wrapup');
  });
});

describe('inventory product tagging', () => {
  it('filters vaccine and dewormer catalog types', () => {
    expect(isVaccineProductType('vaccine')).toBe(true);
    expect(isVaccineProductType('Vaccination')).toBe(true);
    expect(isVaccineProductType('medicine')).toBe(false);
    expect(isDewormerProductType('deworming')).toBe(true);
    expect(isDewormerProductType('Dewormer')).toBe(true);
    expect(isDewormerProductType('vaccine')).toBe(false);
  });
});

describe('vaccination complete flow', () => {
  function fitClinical() {
    const sections = createEmptyVaccinationSections();
    sections.screening.weightKg = 12;
    sections.exam = {
      ...sections.exam,
      physicalExam: 'Bright alert responsive',
      fitnessOutcome: 'fit',
      vaccinationScheduleType: 'annual_booster',
    };
    return sections;
  }

  it('locks page 2 until clinical gate passes', () => {
    const empty = createEmptyVaccinationSections();
    expect(validateWorkflowStep('vaccination', 'clinical', empty)).toMatch(/fitness/i);

    const ready = fitClinical();
    expect(validateWorkflowStep('vaccination', 'clinical', ready)).toBeNull();
  });

  it('completes fit path with inventory vaccine, dates, and No Rx', () => {
    const sections = fitClinical();
    sections.process.vaccines = [
      {
        id: 'v1',
        name: 'Biofel PCH',
        productId: '11111111-1111-1111-1111-111111111111',
        type: 'booster',
        administeredAt: '2026-08-03',
        nextDueDate: '2027-08-03',
      },
      {
        id: 'v2',
        name: '',
        productId: '',
        type: '',
        administeredAt: '',
        nextDueDate: '',
      },
    ];

    const payload: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };

    expect(validateVaccinationComplete(payload, true, [])).toBeNull();

    const enriched = enrichWorkflowPayload(payload, 'doctor-1') as VaccinationWorkflowPayload;
    expect(enriched.chartSummary.vaccineName).toBe('Biofel PCH');
    expect(enriched.chartSummary.nextDueDate).toBe('2027-08-03');

    const soap = workflowToSoap(enriched, 'Annual booster');
    expect(soap.diagnosis).toMatch(/Fit for vaccination/i);
    expect(soap.treatmentPlan).toMatch(/Biofel PCH/);
    expect(soap.followUpRecommendation).toMatch(/2027-08-03/);
  });

  it('allows not_fit complete without vaccines when reason + No Rx provided', () => {
    const sections = createEmptyVaccinationSections();
    sections.exam = {
      fitnessOutcome: 'not_fit',
      notFitReason: 'Fever present',
      vaccinationScheduleType: 'first',
      physicalExam: 'Febrile',
    };
    const payload: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateVaccinationComplete(payload, true, [])).toBeNull();
  });

  it('requires Valid until and product on fit path', () => {
    const sections = fitClinical();
    sections.process.vaccines = [
      {
        id: 'v1',
        name: 'Biofel',
        productId: '11111111-1111-1111-1111-111111111111',
        type: '',
        administeredAt: '2026-08-03',
        nextDueDate: '',
      },
    ];
    const payload: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateVaccinationComplete(payload, true, [])).toMatch(/Valid until/i);
  });

  it('requires Rx lines when No Rx is unchecked', () => {
    const sections = fitClinical();
    sections.process.vaccines = [
      {
        id: 'v1',
        name: 'Biofel',
        productId: '11111111-1111-1111-1111-111111111111',
        type: '',
        administeredAt: '2026-08-03',
        nextDueDate: '2027-08-03',
      },
    ];
    const payload: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateVaccinationComplete(payload, false, [])).toMatch(/prescription/i);
    expect(
      validateVaccinationComplete(payload, false, [
        {
          medicineName: 'Antihistamine',
          dosage: '5mg',
          frequency: 'SID',
          duration: '3 days',
          quantityRequested: 1,
        },
      ])
    ).toBeNull();
  });
});

describe('deworming complete flow', () => {
  function fitExam() {
    const sections = createEmptyDewormingSections();
    sections.exam = {
      ...sections.exam,
      weightKg: 8,
      physicalExam: 'Abdomen soft',
      fitnessOutcome: 'fit',
      dewormingFormType: 'liquid',
    };
    return sections;
  }

  it('locks treatment until exam gate passes', () => {
    expect(
      validateWorkflowStep('deworming', 'exam', createEmptyDewormingSections())
    ).toMatch(/fitness/i);
    expect(validateWorkflowStep('deworming', 'exam', fitExam())).toBeNull();
  });

  it('completes fit path with inventory dewormer and Valid until', () => {
    const sections = fitExam();
    sections.administration = {
      ...sections.administration,
      productId: '22222222-2222-2222-2222-222222222222',
      dewormerName: 'Drontal',
      doseGiven: '1 ml',
      administeredAt: '2026-08-03',
      nextDoseDate: '2026-11-03',
    };
    sections.communication.careInstructions = 'Watch for soft stool';

    const payload: DewormingWorkflowPayload = {
      workflowType: 'deworming',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };

    expect(validateDewormingComplete(payload, true, [])).toBeNull();
    const enriched = enrichWorkflowPayload(payload, 'doctor-1') as DewormingWorkflowPayload;
    expect(enriched.chartSummary.dewormerName).toBe('Drontal');
    expect(enriched.chartSummary.nextDoseDue).toBe('2026-11-03');

    const soap = workflowToSoap(enriched, 'Routine deworm');
    expect(soap.treatmentPlan).toMatch(/Drontal/);
    expect(soap.followUpRecommendation).toMatch(/2026-11-03/);
  });
});

describe('grooming complete flow', () => {
  function assessed() {
    const sections = createEmptyGroomingSections();
    sections.assessment = {
      ...sections.assessment,
      groomingType: 'Bath',
      physicalExam: 'Coat healthy',
      weightKg: 10,
      fitnessOutcome: 'fit',
      conditionFlags: (sections.assessment.conditionFlags ?? []).map((f) =>
        f.key === 'fleas' ? { ...f, checked: true } : f
      ),
    };
    sections.complete.groomingNotes = 'Owner tips: brush weekly';
    return sections;
  }

  it('locks wrap-up until assessment gate passes', () => {
    expect(
      validateWorkflowStep('grooming', 'assessment', createEmptyGroomingSections())
    ).toMatch(/grooming type/i);
    expect(validateWorkflowStep('grooming', 'assessment', assessed())).toBeNull();
  });

  it('requires treatment plan when vet consult is enabled', () => {
    const sections = assessed();
    sections.assessment.vetConsultEnabled = true;
    sections.assessment.treatmentPlan = '';
    const payload: GroomingWorkflowPayload = {
      workflowType: 'grooming',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateGroomingComplete(payload, true, [])).toMatch(/treatment plan/i);

    sections.assessment.treatmentPlan = 'Topical flea treatment';
    expect(validateGroomingComplete(payload, true, [])).toBeNull();
  });

  it('maps notes and grooming type into SOAP/chart', () => {
    const sections = assessed();
    sections.assessment.vetConsultEnabled = true;
    sections.assessment.treatmentPlan = 'Spot-on flea product';
    sections.assessment.administeredMedication = 'Frontline 1 pipette';
    const payload: GroomingWorkflowPayload = {
      workflowType: 'grooming',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateGroomingComplete(payload, true, [])).toBeNull();

    const enriched = enrichWorkflowPayload(payload, 'doctor-1') as GroomingWorkflowPayload;
    expect(enriched.chartSummary.servicesPerformed).toMatch(/Bath/);
    expect(enriched.chartSummary.skinEarNailFindings).toMatch(/Fleas|Coat/i);

    const soap = workflowToSoap(enriched, 'Full bath');
    expect(soap.treatmentPlan).toMatch(/Bath/);
    expect(soap.treatmentPlan).toMatch(/Spot-on flea product/);
    expect(soap.treatmentPlan).toMatch(/Frontline/);
  });
});

describe('end-to-end journey simulation (locking → complete)', () => {
  it('vaccination: blocked → unlock → incomplete wrap-up → complete with follow-up fields', () => {
    const sections = createEmptyVaccinationSections();
    expect(validateWorkflowStep('vaccination', 'clinical', sections)).not.toBeNull();

    sections.screening.temperatureC = 38.5;
    sections.exam.physicalExam = 'NAD';
    sections.exam.fitnessOutcome = 'fit';
    sections.exam.vaccinationScheduleType = 'booster';
    expect(validateWorkflowStep('vaccination', 'clinical', sections)).toBeNull();

    const incomplete: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateVaccinationComplete(incomplete, true, [])).toMatch(/vaccine/i);

    sections.process.vaccines = [
      {
        id: 'v1',
        name: 'Nobivac DHP',
        productId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        type: 'booster',
        administeredAt: '2026-08-03',
        nextDueDate: '2027-08-03',
      },
    ];
    sections.communication.careInstructions = 'Monitor injection site';
    const ready: VaccinationWorkflowPayload = {
      workflowType: 'vaccination',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateVaccinationComplete(ready, true, [])).toBeNull();

    const soap = workflowToSoap(
      enrichWorkflowPayload(ready, 'doc') as VaccinationWorkflowPayload,
      'Booster'
    );
    expect(soap.followUpRecommendation).toContain('2027-08-03');
    expect(soap.treatmentPlan).toContain('Monitor injection site');
  });

  it('deworming: Liquid/Tab form gate → inventory product → Valid until follow-up', () => {
    const sections = createEmptyDewormingSections();
    sections.exam.weightKg = 6;
    sections.exam.physicalExam = 'OK';
    sections.exam.fitnessOutcome = 'fit';
    expect(validateWorkflowStep('deworming', 'exam', sections)).toMatch(/Liquid|Tab|type/i);

    sections.exam.dewormingFormType = 'tab';
    expect(validateWorkflowStep('deworming', 'exam', sections)).toBeNull();

    sections.administration.productId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    sections.administration.dewormerName = 'Milbemax';
    sections.administration.administeredAt = '2026-08-03';
    sections.administration.nextDoseDate = '2026-11-03';
    sections.communication.careInstructions = 'Give with food';

    const payload: DewormingWorkflowPayload = {
      workflowType: 'deworming',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateDewormingComplete(payload, true, [])).toBeNull();
    const soap = workflowToSoap(
      enrichWorkflowPayload(payload, 'doc') as DewormingWorkflowPayload,
      'Deworm'
    );
    expect(soap.treatmentPlan).toMatch(/Milbemax|tab/i);
    expect(soap.followUpRecommendation).toContain('2026-11-03');
  });

  it('grooming: type + conditions → vet consult gate → notes + No Rx', () => {
    const sections = createEmptyGroomingSections();
    expect(validateWorkflowStep('grooming', 'assessment', sections)).toMatch(/grooming type/i);

    sections.assessment.groomingType = 'Nail cutting';
    sections.assessment.medicalHistory = 'No prior issues';
    sections.assessment.conditionFlags = (sections.assessment.conditionFlags ?? []).map((f) =>
      f.key === 'ticks' ? { ...f, checked: true } : f
    );
    expect(validateWorkflowStep('grooming', 'assessment', sections)).toBeNull();

    sections.assessment.fitnessOutcome = 'fit';
    sections.assessment.vetConsultEnabled = true;
    sections.complete.groomingNotes = 'Nails trimmed short';
    const payload: GroomingWorkflowPayload = {
      workflowType: 'grooming',
      workflowStatus: 'in_progress',
      sections,
      chartSummary: {},
    };
    expect(validateGroomingComplete(payload, true, [])).toMatch(/treatment plan/i);

    sections.assessment.treatmentPlan = 'Continue topical tick prevention';
    expect(validateGroomingComplete(payload, true, [])).toBeNull();

    const soap = workflowToSoap(
      enrichWorkflowPayload(payload, 'doc') as GroomingWorkflowPayload,
      'Nails'
    );
    expect(soap.treatmentPlan).toMatch(/Nail cutting/);
    expect(soap.treatmentPlan).toMatch(/tick prevention/i);
  });
});
