import { createClient } from '@/lib/supabase/server';

export type AssignableClinician = {
  id: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'clinic_admin';
};

/** Doctors and clinic admins who can be assigned to consultations. */
export async function fetchAssignableClinicians(
  organizationId: string
): Promise<AssignableClinician[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('user_id, role, user_profiles ( first_name, last_name )')
    .eq('organization_id', organizationId)
    .in('role', ['doctor', 'clinic_admin'])
    .eq('is_active', true)
    .order('role', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const profile = row.user_profiles as { first_name?: string; last_name?: string } | null;
    return {
      id: row.user_id,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: row.role as 'doctor' | 'clinic_admin',
    };
  });
}

export function formatClinicianLabel(c: AssignableClinician): string {
  const name = `Dr. ${c.firstName} ${c.lastName}`.trim();
  if (c.role === 'clinic_admin') {
    return `${name} (Admin)`;
  }
  return name;
}
