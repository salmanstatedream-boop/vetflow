import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

const DOCUMENTS_BUCKET = 'clinic-documents';
const SIGNED_URL_TTL = 60 * 60;

export async function GET(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id, organization_id')
    .eq('user_id', user.id);

  if (!links?.length) {
    return Response.json({ success: true, pets: [] });
  }

  const customerIds = links.map((l) => l.customer_id);
  const { data: pets, error } = await admin
    .from('patients')
    .select(
      `
      id, name, species, breed, color, gender, date_of_birth, weight_kg,
      microchip_number, allergies, medical_notes, customer_id, organization_id,
      customers ( id, first_name, last_name ),
      organizations ( id, name, slug )
    `
    )
    .in('customer_id', customerIds)
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return jsonError(error.message, 500);

  const petIds = (pets || []).map((p) => p.id);
  const photoByPatient = new Map<string, string>();

  if (petIds.length) {
    const { data: docs } = await admin
      .from('documents')
      .select('id, patient_id, bucket_id, storage_path, created_at')
      .in('patient_id', petIds)
      .eq('category', 'profile_photo')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const seen = new Set<string>();
    for (const doc of docs || []) {
      if (!doc.patient_id || seen.has(doc.patient_id) || !doc.storage_path) continue;
      seen.add(doc.patient_id);
      const { data: signed } = await admin.storage
        .from(doc.bucket_id || DOCUMENTS_BUCKET)
        .createSignedUrl(doc.storage_path, SIGNED_URL_TTL);
      if (signed?.signedUrl) photoByPatient.set(doc.patient_id, signed.signedUrl);
    }
  }

  const rows = (pets || []).map((p) => {
    const org = p.organizations as
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
    const o = Array.isArray(org) ? org[0] : org;
    return {
      id: p.id,
      name: p.name,
      species: p.species,
      breed: p.breed,
      color: p.color,
      gender: p.gender,
      dateOfBirth: p.date_of_birth,
      weightKg: p.weight_kg,
      microchipNumber: p.microchip_number,
      allergies: p.allergies,
      medicalNotes: p.medical_notes,
      customerId: p.customer_id,
      organizationId: p.organization_id,
      clinicName: o?.name ?? 'Clinic',
      clinicSlug: o?.slug ?? null,
      photoUrl: photoByPatient.get(p.id) ?? null,
    };
  });

  return Response.json({ success: true, pets: rows });
}
