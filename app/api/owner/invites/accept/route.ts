import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

const AcceptSchema = z.object({
  token: z.string().min(10).max(128),
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

  const parsed = AcceptSchema.safeParse(body);
  if (!parsed.success) return jsonError('Invalid invite token');

  const admin = await createAdminClient();
  const { data: invite, error } = await admin
    .from('owner_invites')
    .select('id, customer_id, organization_id, email, expires_at, accepted_at')
    .eq('token', parsed.data.token.trim())
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!invite) return jsonError('Invite not found', 404);
  if (invite.accepted_at) return jsonError('Invite already used');
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    return jsonError('Invite expired');
  }

  if (invite.email && user.email) {
    if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
      return jsonError('Sign in with the invited email address');
    }
  }

  const { error: linkError } = await admin.from('customer_account_links').upsert(
    {
      user_id: user.id,
      customer_id: invite.customer_id,
      organization_id: invite.organization_id,
    },
    { onConflict: 'user_id,customer_id' }
  );
  if (linkError) return jsonError(linkError.message, 500);

  await admin
    .from('owner_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  // Auto-link other customers with same email across orgs (multi-clinic).
  if (user.email) {
    const { data: matches } = await admin
      .from('customers')
      .select('id, organization_id')
      .ilike('email', user.email)
      .is('deleted_at', null);
    for (const c of matches || []) {
      await admin.from('customer_account_links').upsert(
        {
          user_id: user.id,
          customer_id: c.id,
          organization_id: c.organization_id,
        },
        { onConflict: 'user_id,customer_id' }
      );
    }
  }

  return Response.json({ success: true });
}
