import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

export async function GET(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  const admin = await createAdminClient();

  const { data: memberships } = await admin
    .from('organization_members')
    .select('organization_id, role, organizations ( id, name, slug )')
    .eq('user_id', user.id)
    .eq('is_active', true);

  const staffOrgs = (memberships || []).map((m) => {
    const org = m.organizations as
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
    const o = Array.isArray(org) ? org[0] : org;
    return {
      organizationId: m.organization_id as string,
      role: m.role as string,
      name: o?.name ?? 'Clinic',
      slug: o?.slug ?? null,
    };
  });

  const { data: links } = await admin
    .from('customer_account_links')
    .select(
      `
      id,
      customer_id,
      organization_id,
      customers (
        id, first_name, last_name, email, phone,
        organizations ( id, name, slug )
      )
    `
    )
    .eq('user_id', user.id);

  const clinics = await Promise.all(
    (links || []).map(async (link) => {
      const cust = link.customers as Record<string, unknown> | Record<string, unknown>[] | null;
      const c = (Array.isArray(cust) ? cust[0] : cust) as Record<string, unknown> | null;
      const orgRaw = c?.organizations as
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null
        | undefined;
      const org = Array.isArray(orgRaw) ? orgRaw[0] : orgRaw;
      const organizationId = link.organization_id as string;

      const [{ data: settings }, { data: branch }] = await Promise.all([
        admin
          .from('app_settings')
          .select('clinic_phone, emergency_call_prompt, after_hours_note')
          .eq('organization_id', organizationId)
          .maybeSingle(),
        admin
          .from('branches')
          .select('phone, address')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

      const clinicName = org?.name ?? 'Clinic';
      return {
        linkId: link.id as string,
        customerId: link.customer_id as string,
        organizationId,
        clinicName,
        clinicSlug: org?.slug ?? null,
        clinicPhone: (settings?.clinic_phone as string) || (branch?.phone as string) || null,
        clinicAddress: (branch?.address as string) || null,
        emergencyCallPrompt:
          (settings?.emergency_call_prompt as string) || `Call ${clinicName}?`,
        afterHoursNote:
          (settings?.after_hours_note as string) ||
          'If this is a life-threatening emergency and the clinic is closed, contact your nearest emergency veterinary hospital.',
        firstName: (c?.first_name as string) || '',
        lastName: (c?.last_name as string) || '',
        email: (c?.email as string) || user.email || null,
        phone: (c?.phone as string) || null,
      };
    })
  );

  const isStaff = staffOrgs.length > 0;
  const isOwner = clinics.length > 0;

  return Response.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
    },
    isStaff,
    isOwner,
    staffOrgs,
    clinics,
    defaultMode: isOwner ? 'owner' : isStaff ? 'staff' : 'none',
  });
}
