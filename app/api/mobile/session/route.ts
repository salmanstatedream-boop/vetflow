import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

const BodySchema = z.object({
  accessToken: z.string().min(20),
  refreshToken: z.string().min(10).optional(),
});

/**
 * Exchanges a mobile Supabase session for Set-Cookie headers so a WebView
 * can open /dashboard already authenticated.
 */
export async function POST(req: Request) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON');
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return jsonError('Invalid session payload');

  const admin = await createAdminClient();
  const { data: memberships } = await admin
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1);

  if (!memberships?.length) {
    return jsonError('Staff access required', 403);
  }

  // Verify the provided access token still belongs to this user.
  const { data: check, error } = await admin.auth.getUser(parsed.data.accessToken);
  if (error || !check.user || check.user.id !== user.id) {
    return jsonError('Invalid access token', 401);
  }

  const projectRef = (() => {
    try {
      const host = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname;
      return host.split('.')[0] || 'sb';
    } catch {
      return 'sb';
    }
  })();

  const cookieName = `sb-${projectRef}-auth-token`;
  const payload = JSON.stringify({
    access_token: parsed.data.accessToken,
    refresh_token: parsed.data.refreshToken || '',
    token_type: 'bearer',
    user: check.user,
  });

  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    `${cookieName}=${encodeURIComponent(payload)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24 * 7}`,
    isProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  return new Response(JSON.stringify({ success: true, dashboardPath: '/dashboard' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}
