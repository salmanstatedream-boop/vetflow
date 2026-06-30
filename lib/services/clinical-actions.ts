'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  assertCapability,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { writeAuditLog } from '@/lib/services/audit';
import {
  CompleteConsultationSchema,
  EntityIdSchema,
  type CompleteConsultationInput,
} from '@/lib/validations/schemas';
import { NO_PRESCRIPTION_MARKED_NOTES } from '@/lib/prescriptions/constants';
import { z } from 'zod';
import type { FollowUpScheduleInput } from '@/lib/consultation/follow-up-schedule';
import { followUpPreviewsToDates, computeFollowUpPreviews } from '@/lib/consultation/follow-up-schedule';
import {
  assertDoctorSlotAvailable,
  DEFAULT_APPOINTMENT_DURATION_MINUTES,
} from '@/lib/appointments/slot-conflict';
import { normalizePreferredTimeForDb } from '@/lib/utils/time-parse';
import { assertClinicalVisitAccess } from '@/lib/clinical/visit-access';
import {
  CompleteWorkflowConsultationSchema,
  parseWorkflowPayload,
  validateWorkflowComplete,
  WorkflowConsultDraftSchema,
} from '@/lib/consultations/workflow-validation';
import { enrichWorkflowPayload } from '@/lib/consultations/workflow-chart';
import { workflowToSoap } from '@/lib/consultations/workflow-to-soap';
import type { WorkflowPayload } from '@/lib/consultations/workflow-types';
import type { VisitPurpose } from '@/lib/appointments/visit-purpose';

const ConsultationDraftSchema = z.record(z.string(), z.unknown());

/**
 * Persists in-progress SOAP form state on visits.consult_draft for resume.
 */
export async function saveConsultationDraftAction(visitId: string, draft: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'clinical_queue');

    const parsedVisitId = EntityIdSchema.parse(visitId);
    const parsedDraft = ConsultationDraftSchema.parse(draft);

    const supabase = await createClient();

    const visit = await assertClinicalVisitAccess(supabase, ctx, parsedVisitId, {
      requireStatus: 'consulting',
    });

    const { error } = await supabase
      .from('visits')
      .update({ consult_draft: parsedDraft })
      .eq('id', parsedVisitId);

    if (error) {
      throw new Error(error.message || 'Failed to save draft.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId!,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: 'CLINICAL_NOTE_UPDATED',
      resourceType: 'VISIT',
      resourceId: parsedVisitId,
      afterData: { consult_draft_saved: true },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save draft.';
    return { success: false as const, error: message };
  }
}

function formatTime(d: Date): string {
  return d.toTimeString().slice(0, 8);
}

async function createFollowUpAppointments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>,
  visit: {
    id: string;
    branch_id: string;
    patient_id: string;
    customer_id: string;
    doctor_id: string | null;
    checked_in_at: string;
    appointment_id: string | null;
  },
  schedule: FollowUpScheduleInput,
  followUpNote: string | null,
  diagnosis: string
) {
  const baseDate = visit.checked_in_at.slice(0, 10);
  const previews = computeFollowUpPreviews(schedule, baseDate);
  if (!previews.length) return;

  const { data: patient } = await supabase
    .from('patients')
    .select('name, species')
    .eq('id', visit.patient_id)
    .single();

  const { data: customer } = await supabase
    .from('customers')
    .select('first_name, last_name, email, phone')
    .eq('id', visit.customer_id)
    .single();

  if (!patient || !customer) return;

  let doctorId = visit.doctor_id;
  if (!doctorId) {
    const { data: assignment } = await supabase
      .from('visit_assignments')
      .select('doctor_id')
      .eq('visit_id', visit.id)
      .maybeSingle();
    doctorId = assignment?.doctor_id ?? null;
  }

  const baseTime = new Date(visit.checked_in_at);
  const customerName = `${customer.first_name} ${customer.last_name}`.trim();

  const { data: existingFollowUps } = await supabase
    .from('appointments')
    .select('id, preferred_date, status')
    .eq('follow_up_of_visit_id', visit.id)
    .eq('organization_id', ctx.organizationId);

  const existingDates = new Set(
    (existingFollowUps || [])
      .filter((a) => a.status === 'requested')
      .map((a) => a.preferred_date as string)
  );

  const desiredDates = new Set(followUpPreviewsToDates(previews));

  // Cancel stale requested follow-ups that are no longer selected
  for (const appt of existingFollowUps || []) {
    if (appt.status === 'requested' && !desiredDates.has(appt.preferred_date as string)) {
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appt.id);
    }
  }

  for (const preview of previews) {
    const preferredDate = preview.preferredDate;
    if (existingDates.has(preferredDate)) continue;

    const reason = followUpNote?.trim()
      ? `${preview.label}: ${followUpNote}`
      : `${preview.label} â€” ${diagnosis}`;

    const preferredTime = normalizePreferredTimeForDb(formatTime(baseTime));

    if (doctorId) {
      await assertDoctorSlotAvailable(supabase, {
        organizationId: ctx.organizationId!,
        branchId: visit.branch_id,
        doctorId,
        preferredDate,
        preferredTime,
        durationMinutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
      });
    }

    const { data: appt, error } = await supabase.from('appointments').insert({
      organization_id: ctx.organizationId,
      branch_id: visit.branch_id,
      patient_id: visit.patient_id,
      customer_id: visit.customer_id,
      customer_name: customerName,
      customer_email: customer.email || '',
      customer_phone: customer.phone || '',
      patient_name: patient.name,
      patient_species: patient.species,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      reason,
      status: 'requested',
      doctor_id: doctorId,
      is_emergency: false,
      source: 'staff',
      created_by: ctx.userId,
      created_by_role: ctx.role || 'doctor',
      follow_up_of_visit_id: visit.id,
      duration_minutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
    }).select('id').single();

    if (!error && appt) {
      await writeAuditLog({
        organizationId: ctx.organizationId,
        branchId: visit.branch_id,
        actorUserId: ctx.userId,
        actorRole: ctx.role || 'doctor',
        action: 'APPOINTMENT_CREATED',
        resourceType: 'APPOINTMENT',
        resourceId: appt.id,
        afterData: { status: 'requested', follow_up_of_visit_id: visit.id, date: preferredDate },
      });
    }
  }
}

async function persistVisitPrescription(
  params: {
    organizationId: string;
    branchId: string;
    visitId: string;
    patientId: string;
    doctorId: string;
    prescriptionItems: CompleteConsultationInput['prescriptionItems'];
    treatmentPlan: string | null | undefined;
    noPrescriptionNeeded?: boolean;
    activityBase: { visit_id: string; patient_name: string; visit_reason: string };
    actorRole: string;
  }
): Promise<string> {
  const admin = await createAdminClient();
  const notes = params.noPrescriptionNeeded
    ? NO_PRESCRIPTION_MARKED_NOTES
    : params.treatmentPlan?.trim() || null;

  const { data: existing } = await admin
    .from('prescriptions')
    .select('id, revision_number')
    .eq('visit_id', params.visitId)
    .eq('organization_id', params.organizationId)
    .maybeSingle();

  let prescriptionId: string;
  let isUpdate = false;

  if (existing) {
    isUpdate = true;
    prescriptionId = existing.id;
    const { error: updateErr } = await admin
      .from('prescriptions')
      .update({
        doctor_id: params.doctorId,
        is_finalized: true,
        notes,
      })
      .eq('id', prescriptionId);

    if (updateErr) {
      throw new Error(updateErr.message || 'Failed to update prescription.');
    }

    const { error: deleteItemsErr } = await admin
      .from('prescription_items')
      .delete()
      .eq('prescription_id', prescriptionId);

    if (deleteItemsErr) {
      throw new Error(deleteItemsErr.message || 'Failed to update prescription items.');
    }
  } else {
    const { data: prescription, error: presError } = await admin
      .from('prescriptions')
      .insert({
        organization_id: params.organizationId,
        branch_id: params.branchId,
        visit_id: params.visitId,
        patient_id: params.patientId,
        doctor_id: params.doctorId,
        is_finalized: true,
        revision_number: 1,
        notes,
      })
      .select('id')
      .single();

    if (presError || !prescription) {
      throw new Error(presError?.message || 'Failed to initialize prescription.');
    }
    prescriptionId = prescription.id;
  }

  if (params.prescriptionItems.length > 0) {
    const itemInserts = params.prescriptionItems.map((item) => ({
      prescription_id: prescriptionId,
      product_id: item.productId || null,
      medicine_name: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions || null,
      quantity_requested: item.quantityRequested,
    }));

    const { error: itemsError } = await admin.from('prescription_items').insert(itemInserts);

    if (itemsError) {
      if (!isUpdate) {
        await admin.from('prescriptions').delete().eq('id', prescriptionId);
      }
      throw new Error(itemsError.message || 'Failed to add prescription items.');
    }
  }

  await writeAuditLog({
    organizationId: params.organizationId,
    branchId: params.branchId,
    actorUserId: params.doctorId,
    actorRole: params.actorRole,
    action: isUpdate ? 'PRESCRIPTION_UPDATED' : 'PRESCRIPTION_CREATED',
    resourceType: 'PRESCRIPTION',
    resourceId: prescriptionId,
    afterData: {
      ...params.activityBase,
      no_prescription_needed: Boolean(params.noPrescriptionNeeded),
      medicine_names: params.prescriptionItems.map((item) => item.medicineName),
      medicine_count: params.prescriptionItems.length,
    },
  });

  return prescriptionId;
}

/**
 * Saves clinical notes, services, prescriptions, follow-up appointments,
 * and sets visit to ready_for_checkout.
 */
export async function completeConsultationAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'clinical_queue');

    const parsed = CompleteConsultationSchema.parse(payload);
    const supabase = await createClient();

    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select('*, patients ( name )')
      .eq('id', parsed.visitId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (visitError || !visit) {
      throw new Error('Visit record not found or access denied.');
    }

    const patientName = (visit.patients as { name?: string } | null)?.name ?? 'Patient';
    const visitReason = (visit.reason as string) || '';
    const activityBase = {
      visit_id: visit.id,
      patient_name: patientName,
      visit_reason: visitReason,
    };

    if (parsed.visitType === 'lab') {
      const { count: labOrderCount } = await supabase
        .from('lab_orders')
        .select('id', { count: 'exact', head: true })
        .eq('visit_id', parsed.visitId);

      if (!labOrderCount) {
        throw new Error('Lab-focused visit: order at least one lab test before completing.');
      }
    }

    const numOrNull = (v: number | undefined) =>
      v !== undefined && !Number.isNaN(v) ? v : null;

    const notePayload = {
      visit_type: parsed.visitType || 'standard',
      chief_complaint: parsed.chiefComplaint,
      history: parsed.history || null,
      examination_findings: parsed.examinationFindings || null,
      diagnosis: parsed.diagnosis,
      treatment_plan: parsed.treatmentPlan || null,
      procedure_notes: parsed.procedureNotes || null,
      post_op_medication: parsed.postOpMedication || null,
      internal_notes: parsed.internalNotes || null,
      follow_up_recommendation: parsed.followUpRecommendation || null,
      follow_up_days:
        parsed.followUpMode === 'offset' && (parsed.followUpOffsetDays?.length ?? 0) > 0
          ? parsed.followUpOffsetDays
          : parsed.followUpDays?.length
            ? parsed.followUpDays
            : null,
      temperature_c: numOrNull(parsed.temperatureC),
      heart_rate_bpm: numOrNull(parsed.heartRateBpm),
      respiratory_rate: numOrNull(parsed.respiratoryRate),
      weight_kg: numOrNull(parsed.weightKg),
      body_condition_score: numOrNull(parsed.bodyConditionScore),
      dehydration_percent: numOrNull(parsed.dehydrationPercent),
      sign_vomiting: parsed.signVomiting ?? false,
      sign_anorexia: parsed.signAnorexia ?? false,
      sign_diarrhoea: parsed.signDiarrhoea ?? false,
      sign_constipation: parsed.signConstipation ?? false,
      sign_vaccination: parsed.signVaccination ?? false,
      sign_deworming: parsed.signDeworming ?? false,
    };

    const { data: existingNotes } = await supabase
      .from('clinical_notes')
      .select('id')
      .eq('visit_id', parsed.visitId)
      .maybeSingle();

    const isUpdate = Boolean(existingNotes);
    const notesResult = existingNotes
      ? await supabase
          .from('clinical_notes')
          .update(notePayload)
          .eq('id', existingNotes.id)
          .select()
          .single()
      : await supabase
          .from('clinical_notes')
          .insert({ visit_id: parsed.visitId, ...notePayload, created_by: ctx.userId })
          .select()
          .single();

    if (notesResult.error) {
      throw new Error(notesResult.error.message || 'Failed to save clinical notes.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: isUpdate ? 'CLINICAL_NOTE_UPDATED' : 'CLINICAL_NOTE_CREATED',
      resourceType: 'CLINICAL_NOTE',
      resourceId: notesResult.data?.id,
      afterData: { ...activityBase, diagnosis: parsed.diagnosis },
    });

    // Persist visit services
    if (parsed.serviceItems && parsed.serviceItems.length > 0) {
      await supabase.from('visit_services').delete().eq('visit_id', visit.id);

      const serviceInserts = parsed.serviceItems.map((item) => ({
        visit_id: visit.id,
        service_id: item.serviceId || null,
        name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        added_by: ctx.userId,
      }));

      const { error: svcError } = await supabase.from('visit_services').insert(serviceInserts);
      if (svcError) {
        throw new Error(svcError.message || 'Failed to save services performed.');
      }
    }

    let prescriptionId: string | null = null;
    if (parsed.prescriptionItems.length > 0) {
      prescriptionId = await persistVisitPrescription({
        organizationId: ctx.organizationId!,
        branchId: visit.branch_id,
        visitId: visit.id,
        patientId: visit.patient_id,
        doctorId: ctx.userId,
        prescriptionItems: parsed.prescriptionItems,
        treatmentPlan: parsed.treatmentPlan,
        activityBase,
        actorRole: ctx.role || 'doctor',
      });
    } else if (parsed.noPrescriptionNeeded) {
      prescriptionId = await persistVisitPrescription({
        organizationId: ctx.organizationId!,
        branchId: visit.branch_id,
        visitId: visit.id,
        patientId: visit.patient_id,
        doctorId: ctx.userId,
        prescriptionItems: [],
        treatmentPlan: parsed.treatmentPlan,
        noPrescriptionNeeded: true,
        activityBase,
        actorRole: ctx.role || 'doctor',
      });
    }

    // Auto-create follow-up appointments
    if (parsed.followUpMode && parsed.followUpMode !== 'none') {
      const schedule: FollowUpScheduleInput = {
        mode: parsed.followUpMode,
        offsetDays: parsed.followUpOffsetDays ?? [],
        consecutive: parsed.followUpConsecutive,
      };
      await createFollowUpAppointments(
        supabase,
        ctx,
        visit,
        schedule,
        parsed.followUpRecommendation || null,
        parsed.diagnosis
      );
    } else if (parsed.followUpDays && parsed.followUpDays.length > 0) {
      await createFollowUpAppointments(
        supabase,
        ctx,
        visit,
        { mode: 'offset', offsetDays: parsed.followUpDays },
        parsed.followUpRecommendation || null,
        parsed.diagnosis
      );
    }

    const { data: updatedVisit, error: visitUpdateError } = await supabase
      .from('visits')
      .update({
        status: 'ready_for_checkout',
        completed_at: new Date().toISOString(),
        consult_draft: null,
      })
      .eq('id', visit.id)
      .select('id, status')
      .single();

    if (visitUpdateError || updatedVisit?.status !== 'ready_for_checkout') {
      throw new Error(visitUpdateError?.message || 'Failed to transition visit to checkout.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: 'VISIT_READY_FOR_CHECKOUT',
      resourceType: 'VISIT',
      resourceId: visit.id,
      afterData: { ...activityBase, status: 'ready_for_checkout', diagnosis: parsed.diagnosis },
    });

    return { success: true, visitId: visit.id, prescriptionId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Persists in-progress workflow consultation draft on visits.consult_draft.
 */
export async function saveWorkflowDraftAction(visitId: string, draft: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'clinical_queue');

    const parsedVisitId = EntityIdSchema.parse(visitId);
    const parsedDraft = WorkflowConsultDraftSchema.parse(draft);

    const supabase = await createClient();
    const visit = await assertClinicalVisitAccess(supabase, ctx, parsedVisitId, {
      requireStatus: 'consulting',
    });

    const { error } = await supabase
      .from('visits')
      .update({ consult_draft: parsedDraft })
      .eq('id', parsedVisitId);

    if (error) {
      throw new Error(error.message || 'Failed to save workflow draft.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId!,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: 'CLINICAL_NOTE_UPDATED',
      resourceType: 'VISIT',
      resourceId: parsedVisitId,
      afterData: { consult_draft_saved: true, workflow: parsedDraft.workflowType },
    });

    return { success: true as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save workflow draft.';
    return { success: false as const, error: message };
  }
}

async function createWorkflowDueAppointment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>,
  visit: {
    id: string;
    branch_id: string;
    patient_id: string;
    customer_id: string;
    doctor_id: string | null;
    checked_in_at: string;
  },
  dueDate: string,
  reason: string,
  visitPurpose: VisitPurpose
) {
  const { data: patient } = await supabase
    .from('patients')
    .select('name, species')
    .eq('id', visit.patient_id)
    .single();

  const { data: customer } = await supabase
    .from('customers')
    .select('first_name, last_name, email, phone')
    .eq('id', visit.customer_id)
    .single();

  if (!patient || !customer) return;

  let doctorId = visit.doctor_id;
  if (!doctorId) {
    const { data: assignment } = await supabase
      .from('visit_assignments')
      .select('doctor_id')
      .eq('visit_id', visit.id)
      .maybeSingle();
    doctorId = assignment?.doctor_id ?? null;
  }

  const preferredTime = normalizePreferredTimeForDb(
    formatTime(new Date(visit.checked_in_at))
  );
  const customerName = `${customer.first_name} ${customer.last_name}`.trim();

  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('follow_up_of_visit_id', visit.id)
    .eq('preferred_date', dueDate)
    .eq('visit_purpose', visitPurpose)
    .in('status', ['requested', 'confirmed'])
    .maybeSingle();

  if (existing) return;

  if (doctorId) {
    await assertDoctorSlotAvailable(supabase, {
      organizationId: ctx.organizationId!,
      branchId: visit.branch_id,
      doctorId,
      preferredDate: dueDate,
      preferredTime,
      durationMinutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
    });
  }

  await supabase.from('appointments').insert({
    organization_id: ctx.organizationId,
    branch_id: visit.branch_id,
    patient_id: visit.patient_id,
    customer_id: visit.customer_id,
    customer_name: customerName,
    customer_email: customer.email || '',
    customer_phone: customer.phone || '',
    patient_name: patient.name,
    patient_species: patient.species,
    preferred_date: dueDate,
    preferred_time: preferredTime,
    reason,
    status: 'requested',
    doctor_id: doctorId,
    is_emergency: false,
    source: 'staff',
    created_by: ctx.userId,
    created_by_role: ctx.role || 'doctor',
    follow_up_of_visit_id: visit.id,
    visit_purpose: visitPurpose,
    duration_minutes: DEFAULT_APPOINTMENT_DURATION_MINUTES,
  });
}

async function scheduleWorkflowReminders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ctx: NonNullable<Awaited<ReturnType<typeof resolveServerAuthContext>>>,
  visit: {
    id: string;
    branch_id: string;
    patient_id: string;
    customer_id: string;
    doctor_id: string | null;
    checked_in_at: string;
  },
  payload: WorkflowPayload
) {
  if (payload.workflowType === 'vaccination') {
    const vaccine = payload.sections.process.vaccines?.[0];
    if (vaccine?.nextDueDate) {
      await createWorkflowDueAppointment(
        supabase,
        ctx,
        visit,
        vaccine.nextDueDate.slice(0, 10),
        `Vaccination booster â€” ${vaccine.name}`,
        'vaccination'
      );
    }
  }
  if (payload.workflowType === 'deworming') {
    const next = payload.sections.administration.nextDoseDate;
    if (next) {
      await createWorkflowDueAppointment(
        supabase,
        ctx,
        visit,
        next.slice(0, 10),
        `Deworming follow-up â€” ${payload.sections.administration.dewormerName || 'dewormer'}`,
        'deworming'
      );
    }
  }
}

/**
 * Completes a grooming/vaccination/deworming workflow consultation.
 */
export async function completeWorkflowConsultationAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) {
      throw new Error('Unauthorized: Session is invalid.');
    }
    assertOrganization(ctx);
    assertCapability(ctx, 'clinical_queue');

    const parsed = CompleteWorkflowConsultationSchema.parse(payload);
    const supabase = await createClient();

    const { data: visit, error: visitError } = await supabase
      .from('visits')
      .select('*, patients ( name )')
      .eq('id', parsed.visitId)
      .eq('organization_id', ctx.organizationId)
      .single();

    if (visitError || !visit) {
      throw new Error('Visit record not found or access denied.');
    }

    const rawPayload = parseWorkflowPayload(parsed.workflowPayload);
    if (!rawPayload || rawPayload.workflowType !== parsed.workflowType) {
      throw new Error('Invalid workflow payload.');
    }

    const workflowPayload = enrichWorkflowPayload(rawPayload, ctx.userId);
    const validationError = validateWorkflowComplete(workflowPayload);
    if (validationError) {
      throw new Error(validationError);
    }

    const patientName = (visit.patients as { name?: string } | null)?.name ?? 'Patient';
    const visitReason = (visit.reason as string) || '';
    const activityBase = {
      visit_id: visit.id,
      patient_name: patientName,
      visit_reason: visitReason,
    };

    const soapPartial = workflowToSoap(workflowPayload, visitReason);
    const numOrNull = (v: number | undefined) =>
      v !== undefined && !Number.isNaN(v) ? v : null;

    const notePayload = {
      visit_type: 'standard',
      chief_complaint: soapPartial.chiefComplaint || visitReason,
      history: soapPartial.history || null,
      examination_findings: soapPartial.examinationFindings || null,
      diagnosis: soapPartial.diagnosis || 'Workflow completed',
      treatment_plan: soapPartial.treatmentPlan || null,
      procedure_notes: null,
      post_op_medication: null,
      internal_notes: null,
      follow_up_recommendation: soapPartial.followUpRecommendation || null,
      follow_up_days: null,
      temperature_c: numOrNull(soapPartial.temperatureC),
      heart_rate_bpm: numOrNull(soapPartial.heartRateBpm),
      respiratory_rate: numOrNull(soapPartial.respiratoryRate),
      weight_kg: numOrNull(soapPartial.weightKg),
      body_condition_score: numOrNull(soapPartial.bodyConditionScore),
    };

    const { data: existingNotes } = await supabase
      .from('clinical_notes')
      .select('id')
      .eq('visit_id', parsed.visitId)
      .maybeSingle();

    const isUpdate = Boolean(existingNotes);
    const notesResult = existingNotes
      ? await supabase
          .from('clinical_notes')
          .update(notePayload)
          .eq('id', existingNotes.id)
          .select()
          .single()
      : await supabase
          .from('clinical_notes')
          .insert({ visit_id: parsed.visitId, ...notePayload, created_by: ctx.userId })
          .select()
          .single();

    if (notesResult.error) {
      throw new Error(notesResult.error.message || 'Failed to save clinical notes.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: isUpdate ? 'CLINICAL_NOTE_UPDATED' : 'CLINICAL_NOTE_CREATED',
      resourceType: 'CLINICAL_NOTE',
      resourceId: notesResult.data?.id,
      afterData: { ...activityBase, workflow_type: parsed.workflowType },
    });

    if (parsed.serviceItems.length > 0) {
      await supabase.from('visit_services').delete().eq('visit_id', visit.id);
      const serviceInserts = parsed.serviceItems.map((item) => ({
        visit_id: visit.id,
        service_id: item.serviceId || null,
        name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        added_by: ctx.userId,
      }));
      const { error: svcError } = await supabase.from('visit_services').insert(serviceInserts);
      if (svcError) {
        throw new Error(svcError.message || 'Failed to save services performed.');
      }
    }

    if (parsed.noPrescriptionNeeded) {
      await persistVisitPrescription({
        organizationId: ctx.organizationId!,
        branchId: visit.branch_id,
        visitId: visit.id,
        patientId: visit.patient_id,
        doctorId: ctx.userId,
        prescriptionItems: [],
        treatmentPlan: soapPartial.treatmentPlan,
        noPrescriptionNeeded: true,
        activityBase,
        actorRole: ctx.role || 'doctor',
      });
    }

    await scheduleWorkflowReminders(supabase, ctx, visit, workflowPayload);

    const { data: updatedVisit, error: visitUpdateError } = await supabase
      .from('visits')
      .update({
        status: 'ready_for_checkout',
        completed_at: new Date().toISOString(),
        consult_draft: null,
        workflow_payload: workflowPayload as unknown as Record<string, unknown>,
      })
      .eq('id', visit.id)
      .select('id, status')
      .single();

    if (visitUpdateError || updatedVisit?.status !== 'ready_for_checkout') {
      throw new Error(visitUpdateError?.message || 'Failed to transition visit to checkout.');
    }

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: visit.branch_id,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'doctor',
      action: 'VISIT_READY_FOR_CHECKOUT',
      resourceType: 'VISIT',
      resourceId: visit.id,
      afterData: {
        ...activityBase,
        status: 'ready_for_checkout',
        workflow_type: parsed.workflowType,
      },
    });

    return { success: true, visitId: visit.id, workflowType: parsed.workflowType };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
