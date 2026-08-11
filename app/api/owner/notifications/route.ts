import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

export async function GET(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get('unread') === '1';

  const admin = await createAdminClient();
  let q = admin
    .from('owner_notifications')
    .select('id, kind, title, body, data, read_at, created_at, organization_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (unreadOnly) q = q.is('read_at', null);

  const { data, error } = await q;
  if (error) return jsonError(error.message, 500);

  return Response.json({
    success: true,
    notifications: (data || []).map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      data: n.data,
      readAt: n.read_at,
      createdAt: n.created_at,
      organizationId: n.organization_id,
    })),
    unreadCount: (data || []).filter((n) => !n.read_at).length,
  });
}

const PatchSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON');
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid payload');

  const admin = await createAdminClient();
  const now = new Date().toISOString();
  let q = admin
    .from('owner_notifications')
    .update({ read_at: now })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (parsed.data.ids?.length) {
    q = q.in('id', parsed.data.ids);
  } else if (!parsed.data.all) {
    return jsonError('Provide ids or all: true');
  }

  const { error } = await q;
  if (error) return jsonError(error.message, 500);
  return Response.json({ success: true });
}
