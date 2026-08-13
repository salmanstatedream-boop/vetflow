import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

type Params = { params: Promise<{ id: string }> };

function extractDeworming(payload: Record<string, unknown>, visitPurpose: string | null) {
  const rows: { name: string; detail: string | null; administeredAt: string | null }[] = [];
  const sections = (payload.sections || {}) as Record<string, unknown>;
  const process = (sections.process || {}) as Record<string, unknown>;
  const candidates = [
    process.deworming,
    process.dewormings,
    process.parasite_control,
    payload.deworming,
  ];
  for (const raw of candidates) {
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const d = item as Record<string, unknown>;
        rows.push({
          name: String(d.name || d.product || d.medicine || 'Deworming'),
          detail: [d.dose, d.dosage, d.notes].filter(Boolean).map(String).join(' · ') || null,
          administeredAt: d.administeredAt
            ? String(d.administeredAt)
            : d.date
              ? String(d.date)
              : null,
        });
      }
    } else if (raw && typeof raw === 'object') {
      const d = raw as Record<string, unknown>;
      rows.push({
        name: String(d.name || d.product || 'Deworming'),
        detail: [d.dose, d.notes].filter(Boolean).map(String).join(' · ') || null,
        administeredAt: d.administeredAt ? String(d.administeredAt) : null,
      });
    }
  }
  if (!rows.length && (visitPurpose || '').toLowerCase() === 'deworming') {
    rows.push({ name: 'Deworming visit', detail: null, administeredAt: null });
  }
  return rows;
}

export async function GET(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id')
    .eq('user_id', user.id);
  const customerIds = new Set((links || []).map((l) => l.customer_id));

  const { data: pet, error: petError } = await admin
    .from('patients')
    .select(
      `
      id, name, species, breed, color, gender, date_of_birth, weight_kg,
      microchip_number, allergies, medical_notes, customer_id, organization_id,
      organizations ( id, name, slug )
    `
    )
    .eq('id', patientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (petError) return jsonError(petError.message, 500);
  if (!pet || !customerIds.has(pet.customer_id)) {
    return jsonError('Pet not found', 404);
  }

  const { data: visits } = await admin
    .from('visits')
    .select(
      `
      id, reason, status, checked_in_at, completed_at, is_emergency,
      visit_purpose, consult_paused_at, workflow_payload,
      clinical_notes (
        chief_complaint, diagnosis, treatment_plan, follow_up_recommendation,
        temperature_c, heart_rate_bpm, respiratory_rate, weight_kg,
        visit_type, procedure_notes, post_op_medication
      ),
      prescriptions (
        id, created_at,
        prescription_items ( medicine_name, dosage, frequency, duration, instructions )
      )
    `
    )
    .eq('patient_id', patientId)
    .order('checked_in_at', { ascending: false })
    .limit(40);

  const org = pet.organizations as
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null;
  const o = Array.isArray(org) ? org[0] : org;

  const history = (visits || []).map((v) => {
    const notesRaw = v.clinical_notes as Record<string, unknown> | Record<string, unknown>[] | null;
    const notes = Array.isArray(notesRaw) ? notesRaw[0] : notesRaw;
    const rxRaw = v.prescriptions as Record<string, unknown> | Record<string, unknown>[] | null;
    const rxList = Array.isArray(rxRaw) ? rxRaw : rxRaw ? [rxRaw] : [];
    const payload = (v.workflow_payload || {}) as Record<string, unknown>;
    const sections = (payload.sections || {}) as Record<string, unknown>;
    const process = (sections.process || {}) as Record<string, unknown>;
    const vaccines = Array.isArray(process.vaccines) ? process.vaccines : [];
    const visitType = notes?.visit_type ? String(notes.visit_type) : null;
    const isSurgery =
      visitType === 'surgery' ||
      (v.visit_purpose || '').toLowerCase() === 'surgery' ||
      /surg|spay|neuter|castrat/i.test(String(v.reason || ''));

    return {
      id: v.id,
      reason: v.reason,
      status: v.status,
      visitPurpose: v.visit_purpose,
      checkedInAt: v.checked_in_at,
      completedAt: v.completed_at,
      isEmergency: v.is_emergency,
      consultPausedAt: v.consult_paused_at,
      isSurgery,
      notes: notes
        ? {
            chiefComplaint: notes.chief_complaint,
            diagnosis: notes.diagnosis,
            treatmentPlan: notes.treatment_plan,
            followUp: notes.follow_up_recommendation,
            temperatureC: notes.temperature_c,
            heartRate: notes.heart_rate_bpm,
            respiratoryRate: notes.respiratory_rate,
            weightKg: notes.weight_kg,
            visitType,
            procedureNotes: notes.procedure_notes,
            postOpMedication: notes.post_op_medication,
          }
        : null,
      prescriptions: rxList.map((rx) => {
        const itemsRaw = (rx.prescription_items as Record<string, unknown>[] | null) || [];
        return {
          id: rx.id,
          createdAt: rx.created_at,
          items: itemsRaw.map((item) => ({
            medicineName: item.medicine_name,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions,
          })),
        };
      }),
      vaccines: vaccines.map((raw) => {
        const vac = raw as Record<string, unknown>;
        return {
          name: String(vac.name || 'Vaccine'),
          lotNumber: vac.lotNumber ? String(vac.lotNumber) : null,
          administeredAt: vac.administeredAt ? String(vac.administeredAt) : null,
          nextDueDate: vac.nextDueDate ? String(vac.nextDueDate) : null,
        };
      }),
      deworming: extractDeworming(payload, v.visit_purpose as string | null),
    };
  });

  let photoUrl: string | null = null;
  const { data: photoDoc } = await admin
    .from('documents')
    .select('bucket_id, storage_path')
    .eq('patient_id', patientId)
    .eq('organization_id', pet.organization_id)
    .eq('category', 'profile_photo')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (photoDoc?.storage_path) {
    const { data: signed } = await admin.storage
      .from(photoDoc.bucket_id || 'clinic-documents')
      .createSignedUrl(photoDoc.storage_path, 60 * 60);
    photoUrl = signed?.signedUrl ?? null;
  }

  return Response.json({
    success: true,
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      gender: pet.gender,
      dateOfBirth: pet.date_of_birth,
      weightKg: pet.weight_kg,
      microchipNumber: pet.microchip_number,
      allergies: pet.allergies,
      medicalNotes: pet.medical_notes,
      clinicName: o?.name ?? 'Clinic',
      clinicSlug: o?.slug ?? null,
      organizationId: pet.organization_id,
      customerId: pet.customer_id,
      photoUrl,
    },
    history,
  });
}
