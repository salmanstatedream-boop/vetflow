import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';
import { computeAgeYearsAtDate } from '@/lib/patients/health-timeline';

type Params = { params: Promise<{ id: string }> };

function isPlausibleTempC(value: number): boolean {
  return value >= 35 && value <= 43;
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

  const { data: pet } = await admin
    .from('patients')
    .select('id, name, customer_id, weight_kg, date_of_birth')
    .eq('id', patientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!pet || !customerIds.has(pet.customer_id)) {
    return jsonError('Pet not found', 404);
  }

  const dateOfBirth = pet.date_of_birth as string | null;

  const { data: visits } = await admin
    .from('visits')
    .select(
      `
      id, checked_in_at, completed_at,
      clinical_notes (
        temperature_c, heart_rate_bpm, respiratory_rate, weight_kg,
        body_condition_score, created_at
      )
    `
    )
    .eq('patient_id', patientId)
    .order('checked_in_at', { ascending: true })
    .limit(80);

  const series: {
    date: string;
    weightKg: number | null;
    bodyConditionScore: number | null;
    temperatureC: number | null;
    heartRateBpm: number | null;
    respiratoryRate: number | null;
    ageYears: number | null;
  }[] = [];

  for (const v of visits || []) {
    const notesRaw = v.clinical_notes as Record<string, unknown> | Record<string, unknown>[] | null;
    const notes = Array.isArray(notesRaw) ? notesRaw[0] : notesRaw;
    if (!notes) continue;
    const date = String(
      notes.created_at || v.completed_at || v.checked_in_at || new Date().toISOString()
    );
    const rawTemp =
      notes.temperature_c != null ? Number(notes.temperature_c) : null;
    series.push({
      date,
      weightKg: notes.weight_kg != null ? Number(notes.weight_kg) : null,
      bodyConditionScore:
        notes.body_condition_score != null
          ? Number(notes.body_condition_score)
          : null,
      temperatureC:
        rawTemp != null && isPlausibleTempC(rawTemp) ? rawTemp : null,
      heartRateBpm: notes.heart_rate_bpm != null ? Number(notes.heart_rate_bpm) : null,
      respiratoryRate:
        notes.respiratory_rate != null ? Number(notes.respiratory_rate) : null,
      ageYears: computeAgeYearsAtDate(dateOfBirth, date),
    });
  }

  if (!series.length && pet.weight_kg != null) {
    const date = new Date().toISOString();
    series.push({
      date,
      weightKg: Number(pet.weight_kg),
      bodyConditionScore: null,
      temperatureC: null,
      heartRateBpm: null,
      respiratoryRate: null,
      ageYears: computeAgeYearsAtDate(dateOfBirth, date),
    });
  }

  return Response.json({
    success: true,
    pet: { id: pet.id, name: pet.name, dateOfBirth },
    series,
  });
}
