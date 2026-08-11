import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

type Params = { params: Promise<{ threadId: string }> };

async function assertOwnerThread(userId: string, threadId: string) {
  const admin = await createAdminClient();
  const { data: thread } = await admin
    .from('owner_clinic_threads')
    .select('id, organization_id, user_id')
    .eq('id', threadId)
    .eq('user_id', userId)
    .maybeSingle();
  return thread;
}

export async function GET(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { threadId } = await params;

  const thread = await assertOwnerThread(user.id, threadId);
  if (!thread) return jsonError('Thread not found', 404);

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from('owner_clinic_messages')
    .select('id, body, sender_type, sender_user_id, created_at, read_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) return jsonError(error.message, 500);

  // Mark staff messages as read
  await admin
    .from('owner_clinic_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('thread_id', threadId)
    .eq('sender_type', 'staff')
    .is('read_at', null);

  return Response.json({
    success: true,
    messages: (data || []).map((m) => ({
      id: m.id,
      body: m.body,
      senderType: m.sender_type as 'owner' | 'staff',
      senderUserId: m.sender_user_id,
      createdAt: m.created_at,
      readAt: m.read_at,
    })),
  });
}

const SendSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export async function POST(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { threadId } = await params;

  const thread = await assertOwnerThread(user.id, threadId);
  if (!thread) return jsonError('Thread not found', 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON');
  }
  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload');

  const admin = await createAdminClient();
  const now = new Date().toISOString();
  const { data: msg, error } = await admin
    .from('owner_clinic_messages')
    .insert({
      thread_id: threadId,
      organization_id: thread.organization_id,
      sender_type: 'owner',
      sender_user_id: user.id,
      body: parsed.data.body,
    })
    .select('id, body, sender_type, created_at')
    .single();

  if (error) return jsonError(error.message, 500);

  await admin
    .from('owner_clinic_threads')
    .update({ last_message_at: now })
    .eq('id', threadId);

  return Response.json({
    success: true,
    message: {
      id: msg.id,
      body: msg.body,
      senderType: msg.sender_type,
      createdAt: msg.created_at,
    },
  });
}
