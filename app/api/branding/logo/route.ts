import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { resolveServerAuthContext } from '@/lib/auth/context';
import { CLINIC_LOGO_BUCKET, isHttpLogoUrl } from '@/lib/branding/clinic-logo';

export async function GET() {
  const ctx = await resolveServerAuthContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('clinic_logo_url')
    .eq('organization_id', ctx.organizationId)
    .maybeSingle();

  const logoUrl = settings?.clinic_logo_url as string | null;
  if (!logoUrl) {
    return NextResponse.json({ error: 'No logo configured' }, { status: 404 });
  }

  if (isHttpLogoUrl(logoUrl)) {
    return NextResponse.redirect(logoUrl);
  }

  const admin = await createAdminClient();
  const { data: signed, error } = await admin.storage
    .from(CLINIC_LOGO_BUCKET)
    .createSignedUrl(logoUrl, 3600);

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Failed to load logo' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
