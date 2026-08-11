import { createAdminClient } from '@/lib/supabase/server';

export async function notifyOwner(input: {
  userId: string;
  organizationId?: string | null;
  kind: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const admin = await createAdminClient();
  await admin.from('owner_notifications').insert({
    user_id: input.userId,
    organization_id: input.organizationId ?? null,
    kind: input.kind,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
  });
}

export function mapVisitCareStage(status: string, consultPausedAt?: string | null) {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'cancelled') {
    return {
      activeIndex: s === 'completed' ? 3 : 0,
      label: s === 'completed' ? 'Completed' : 'Cancelled',
    };
  }
  if (s === 'ready_for_checkout') {
    return { activeIndex: 3, label: 'Ready for pickup' };
  }
  if (s === 'consulting') {
    return {
      activeIndex: consultPausedAt ? 1 : 2,
      label: consultPausedAt ? 'Consult paused' : 'In treatment',
    };
  }
  // waiting / default
  return { activeIndex: 0, label: 'Checked in' };
}
