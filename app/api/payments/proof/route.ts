import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveServerAuthContext } from '@/lib/auth/context';

const DOCUMENTS_BUCKET = 'clinic-documents';

export async function GET(request: NextRequest) {
  const ctx = await resolveServerAuthContext();
  if (!ctx?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const invoiceId = request.nextUrl.searchParams.get('invoiceId');
  const paymentId = request.nextUrl.searchParams.get('paymentId');
  if (!invoiceId && !paymentId) {
    return NextResponse.json({ error: 'Missing invoiceId or paymentId' }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from('payments')
    .select('id, invoice_id, proof_storage_path, proof_file_name, organization_id')
    .eq('organization_id', ctx.organizationId)
    .not('proof_storage_path', 'is', null);

  if (paymentId) {
    query = query.eq('id', paymentId);
  } else {
    query = query.eq('invoice_id', invoiceId!).order('created_at', { ascending: false }).limit(1);
  }

  const { data: payment, error } = await query.maybeSingle();
  if (error || !payment?.proof_storage_path) {
    return NextResponse.json({ error: 'Payment receipt not found' }, { status: 404 });
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(payment.proof_storage_path, 60, {
      download: payment.proof_file_name || 'payment-receipt',
    });

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
