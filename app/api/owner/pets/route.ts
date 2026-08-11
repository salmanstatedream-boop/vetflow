import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

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
    };
  });

  return Response.json({ success: true, pets: rows });
}
