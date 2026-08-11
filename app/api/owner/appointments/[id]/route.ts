import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';
import { notifyOwner } from '@/lib/services/owner-care';

type Params = { params: Promise<{ id: string }> };

async function loadLinkedAppointment(userId: string, appointmentId: string) {
  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id')
    .eq('user_id', userId);
  const customerIds = new Set((links || []).map((l) => l.customer_id));

  const { data: appt, error } = await admin
    .from('appointments')
    .select(
      'id, status, customer_id, organization_id, preferred_date, preferred_time, reason, patient_name'
    )
    .eq('id', appointmentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!appt || !appt.customer_id || !customerIds.has(appt.customer_id)) {
    return null;
  }
  return appt;
}

const PatchSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({
    action: z.literal('reschedule'),
    preferredDate: z.string().min(8),
    preferredTime: z.string().min(4),
  }),
]);

export async function PATCH(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON');
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload');

  let appt;
  try {
    appt = await loadLinkedAppointment(user.id, id);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Lookup failed', 500);
  }
  if (!appt) return jsonError('Appointment not found', 404);

  const cancellable = ['requested', 'confirmed', 'rescheduled'];
  if (!cancellable.includes(appt.status)) {
    return jsonError(`Cannot update appointment in status "${appt.status}"`);
  }

  const admin = await createAdminClient();

  if (parsed.data.action === 'cancel') {
    const { error } = await admin
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) return jsonError(error.message, 500);

    await notifyOwner({
      userId: user.id,
      organizationId: appt.organization_id,
      kind: 'appointment_cancelled',
      title: 'Appointment cancelled',
      body: `${appt.patient_name || 'Pet'} · ${appt.preferred_date} ${String(appt.preferred_time).slice(0, 5)}`,
      data: { appointmentId: id },
    });

    return Response.json({ success: true, appointment: { id, status: 'cancelled' } });
  }

  const preferredDate = parsed.data.preferredDate.slice(0, 10);
  if (preferredDate < new Date().toISOString().slice(0, 10)) {
    return jsonError('Preferred date cannot be in the past');
  }
  const preferredTime =
    parsed.data.preferredTime.trim().length === 5
      ? `${parsed.data.preferredTime.trim()}:00`
      : parsed.data.preferredTime.trim();

  const nextStatus = appt.status === 'requested' ? 'requested' : 'rescheduled';
  const { error } = await admin
    .from('appointments')
    .update({
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      status: nextStatus,
    })
    .eq('id', id);
  if (error) return jsonError(error.message, 500);

  await notifyOwner({
    userId: user.id,
    organizationId: appt.organization_id,
    kind: 'appointment_rescheduled',
    title: 'Appointment rescheduled',
    body: `${appt.patient_name || 'Pet'} · ${preferredDate} ${preferredTime.slice(0, 5)}`,
    data: { appointmentId: id },
  });

  return Response.json({
    success: true,
    appointment: {
      id,
      status: nextStatus,
      preferredDate,
      preferredTime,
    },
  });
}
