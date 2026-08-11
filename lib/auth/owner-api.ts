import { createAdminClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function resolveBearerUser(req: Request): Promise<User | null> {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header?.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;

  const admin = await createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
