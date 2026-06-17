import type { SupabaseClient } from '@supabase/supabase-js';

const PAYMENT_PROOF_BUCKET = 'clinic-documents';
const MAX_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.heic']);

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function isAllowedProofFile(file: File): boolean {
  if (file.type && ALLOWED_MIME.has(file.type)) return true;
  return ALLOWED_EXTENSIONS.has(fileExtension(file.name));
}

export type PaymentProofUpload = {
  storagePath: string;
  fileName: string;
};

export async function uploadPaymentProofFile(
  supabase: SupabaseClient,
  organizationId: string,
  invoiceId: string,
  file: File
): Promise<PaymentProofUpload> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Payment receipt file is required for card and bank transfer.');
  }
  if (file.size > MAX_PAYMENT_PROOF_BYTES) {
    throw new Error('Receipt file exceeds the 5 MB limit.');
  }
  if (!isAllowedProofFile(file)) {
    throw new Error('Unsupported file type. Use PDF, JPG, PNG, or WEBP.');
  }

  const safeName = sanitizeFileName(file.name || 'receipt');
  const storagePath = `${organizationId}/payments/${invoiceId}/${Date.now()}-${safeName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload payment receipt.');
  }

  return { storagePath, fileName: file.name || safeName };
}

export async function attachProofToPayment(
  adminClient: SupabaseClient,
  paymentId: string,
  proof: PaymentProofUpload
): Promise<void> {
  const { error } = await adminClient
    .from('payments')
    .update({
      proof_storage_path: proof.storagePath,
      proof_file_name: proof.fileName,
    })
    .eq('id', paymentId);

  if (error) {
    throw new Error(error.message || 'Failed to attach payment receipt.');
  }
}
