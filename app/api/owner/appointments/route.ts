import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';
import { notifyOwner } from '@/lib/services/owner-care';

export async function GET(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id')
    .eq('user_id', user.id);
  const customerIds = (links || []).map((l) => l.customer_id);
  if (!customerIds.length) {
    return Response.json({ success: true, appointments: [] });
  }

  const { data, error } = await admin
    .from('appointments')
    .select(
      `
      id, preferred_date, preferred_time, reason, status, source,
      patient_name, patient_species, customer_id, patient_id, organization_id,
      organizations ( id, name, slug )
    `
    )
    .in('customer_id', customerIds)
    .order('preferred_date', { ascending: false })
    .order('preferred_time', { ascending: false })
    .limit(100);

  if (error) return jsonError(error.message, 500);

  const appointments = (data || []).map((a) => {
    const org = a.organizations as
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
    const o = Array.isArray(org) ? org[0] : org;
    return {
      id: a.id,
      preferredDate: a.preferred_date,
      preferredTime: a.preferred_time,
      reason: a.reason,
      status: a.status,
      source: a.source,
      patientName: a.patient_name,
      patientSpecies: a.patient_species,
      patientId: a.patient_id,
      customerId: a.customer_id,
      organizationId: a.organization_id,
      clinicName: o?.name ?? 'Clinic',
      clinicSlug: o?.slug ?? null,
    };
  });

  return Response.json({ success: true, appointments });
}

const BookSchema = z.object({
  patientId: z.string().uuid(),
  preferredDate: z.string().min(8),
  preferredTime: z.string().min(4),
  reason: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON');
  }

  const parsed = BookSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload');

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id, organization_id')
    .eq('user_id', user.id);
  const linkByCustomer = new Map(
    (links || []).map((l) => [l.customer_id as string, l.organization_id as string])
  );

  const { data: pet } = await admin
    .from('patients')
    .select(
      'id, name, species, customer_id, organization_id, customers ( id, first_name, last_name, email, phone, branch_id )'
    )
    .eq('id', parsed.data.patientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!pet || !linkByCustomer.has(pet.customer_id)) {
    return jsonError('Pet not found or not linked to your account', 404);
  }

  const custRaw = pet.customers as Record<string, unknown> | Record<string, unknown>[] | null;
  const cust = (Array.isArray(custRaw) ? custRaw[0] : custRaw) as Record<string, unknown> | null;
  if (!cust) return jsonError('Customer profile missing', 400);

  let resolvedBranch = (cust.branch_id as string) || null;
  if (!resolvedBranch) {
    const { data: branch } = await admin
      .from('branches')
      .select('id')
      .eq('organization_id', pet.organization_id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    resolvedBranch = branch?.id ?? null;
  }
  if (!resolvedBranch) return jsonError('Clinic has no active branch', 400);

  const preferredDate = parsed.data.preferredDate.slice(0, 10);
  if (preferredDate < new Date().toISOString().slice(0, 10)) {
    return jsonError('Preferred date cannot be in the past');
  }

  const { data: appointment, error } = await admin
    .from('appointments')
    .insert({
      organization_id: pet.organization_id,
      branch_id: resolvedBranch,
      patient_id: pet.id,
      customer_id: pet.customer_id,
      customer_name: `${cust.first_name || ''} ${cust.last_name || ''}`.trim() || 'Owner',
      customer_email: (cust.email as string) || user.email || '',
      customer_phone: (cust.phone as string) || '',
      patient_name: pet.name,
      patient_species: pet.species,
      preferred_date: preferredDate,
      preferred_time: parsed.data.preferredTime,
      reason: parsed.data.reason.trim(),
      status: 'requested',
      source: 'owner_app',
    })
    .select('id, preferred_date, preferred_time, status, reason')
    .single();

  if (error) return jsonError(error.message, 500);

  await notifyOwner({
    userId: user.id,
    organizationId: pet.organization_id,
    kind: 'appointment_requested',
    title: 'Appointment requested',
    body: `${pet.name} · ${preferredDate} · ${parsed.data.reason.trim()}`,
    data: { appointmentId: appointment.id },
  });

  return Response.json({
    success: true,
    appointment: {
      id: appointment.id,
      preferredDate: appointment.preferred_date,
      preferredTime: appointment.preferred_time,
      status: appointment.status,
      reason: appointment.reason,
    },
  });
}
