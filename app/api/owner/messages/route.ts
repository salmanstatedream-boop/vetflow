import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

export async function GET(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  const admin = await createAdminClient();
  const { data: threads, error } = await admin
    .from('owner_clinic_threads')
    .select(
      `
      id, organization_id, customer_id, last_message_at, created_at,
      organizations ( id, name, slug ),
      customers ( id, first_name, last_name )
    `
    )
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false });

  if (error) return jsonError(error.message, 500);

  const threadIds = (threads || []).map((t) => t.id as string);
  const unreadByThread = new Map<string, number>();
  if (threadIds.length) {
    const { data: unread } = await admin
      .from('owner_clinic_messages')
      .select('thread_id')
      .in('thread_id', threadIds)
      .eq('sender_type', 'staff')
      .is('read_at', null);
    for (const row of unread || []) {
      const tid = row.thread_id as string;
      unreadByThread.set(tid, (unreadByThread.get(tid) || 0) + 1);
    }
  }

  const { data: lastMsgs } = threadIds.length
    ? await admin
        .from('owner_clinic_messages')
        .select('thread_id, body, created_at, sender_type')
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
    : { data: [] as { thread_id: string; body: string; created_at: string; sender_type: string }[] };

  const lastByThread = new Map<string, { body: string; createdAt: string; senderType: string }>();
  for (const m of lastMsgs || []) {
    if (!lastByThread.has(m.thread_id)) {
      lastByThread.set(m.thread_id, {
        body: m.body,
        createdAt: m.created_at,
        senderType: m.sender_type,
      });
    }
  }

  return Response.json({
    success: true,
    threads: (threads || []).map((t) => {
      const org = t.organizations as
        | { id: string; name: string; slug: string }
        | { id: string; name: string; slug: string }[]
        | null;
      const o = Array.isArray(org) ? org[0] : org;
      const cust = t.customers as
        | { id: string; first_name: string; last_name: string }
        | { id: string; first_name: string; last_name: string }[]
        | null;
      const c = Array.isArray(cust) ? cust[0] : cust;
      const last = lastByThread.get(t.id as string);
      return {
        id: t.id,
        organizationId: t.organization_id,
        customerId: t.customer_id,
        clinicName: o?.name ?? 'Clinic',
        clinicSlug: o?.slug ?? null,
        customerName: c ? `${c.first_name} ${c.last_name}`.trim() : 'Owner',
        lastMessageAt: t.last_message_at,
        lastMessage: last?.body ?? null,
        lastSenderType: last?.senderType ?? null,
        unreadCount: unreadByThread.get(t.id as string) || 0,
      };
    }),
  });
}

const OpenSchema = z.object({
  organizationId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
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
  const parsed = OpenSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload');

  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id, organization_id')
    .eq('user_id', user.id)
    .eq('organization_id', parsed.data.organizationId);

  const link =
    (links || []).find((l) =>
      parsed.data.customerId ? l.customer_id === parsed.data.customerId : true
    ) || links?.[0];
  if (!link) return jsonError('Clinic not linked to your account', 404);

  const { data: existing } = await admin
    .from('owner_clinic_threads')
    .select('id')
    .eq('user_id', user.id)
    .eq('organization_id', link.organization_id)
    .eq('customer_id', link.customer_id)
    .maybeSingle();

  if (existing) {
    return Response.json({ success: true, threadId: existing.id });
  }

  const { data: created, error } = await admin
    .from('owner_clinic_threads')
    .insert({
      user_id: user.id,
      organization_id: link.organization_id,
      customer_id: link.customer_id,
    })
    .select('id')
    .single();

  if (error) return jsonError(error.message, 500);
  return Response.json({ success: true, threadId: created.id });
}
