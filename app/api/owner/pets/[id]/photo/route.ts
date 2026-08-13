import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

type Params = { params: Promise<{ id: string }> };

const DOCUMENTS_BUCKET = 'clinic-documents';
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const SIGNED_URL_TTL = 60 * 60;

async function assertOwnerPet(userId: string, patientId: string) {
  const admin = await createAdminClient();
  const { data: links } = await admin
    .from('customer_account_links')
    .select('customer_id, organization_id')
    .eq('user_id', userId);
  const byCustomer = new Map(
    (links || []).map((l) => [l.customer_id as string, l.organization_id as string])
  );
  const { data: pet } = await admin
    .from('patients')
    .select('id, name, customer_id, organization_id')
    .eq('id', patientId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!pet || !byCustomer.has(pet.customer_id)) return null;
  return { admin, pet };
}

async function signedPhotoUrl(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  patientId: string,
  organizationId: string
) {
  const { data: doc } = await admin
    .from('documents')
    .select('id, bucket_id, storage_path, file_name')
    .eq('patient_id', patientId)
    .eq('organization_id', organizationId)
    .eq('category', 'profile_photo')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!doc?.storage_path) return null;

  const { data: signed } = await admin.storage
    .from(doc.bucket_id || DOCUMENTS_BUCKET)
    .createSignedUrl(doc.storage_path, SIGNED_URL_TTL);

  return signed?.signedUrl ?? null;
}

export async function GET(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;
  const ctx = await assertOwnerPet(user.id, patientId);
  if (!ctx) return jsonError('Pet not found', 404);

  const photoUrl = await signedPhotoUrl(
    ctx.admin,
    patientId,
    ctx.pet.organization_id
  );

  return Response.json({ success: true, photoUrl });
}

export async function POST(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;
  const ctx = await assertOwnerPet(user.id, patientId);
  if (!ctx) return jsonError('Pet not found', 404);

  const body = (await req.json().catch(() => ({}))) as {
    fileBase64?: string;
    fileName?: string;
    contentType?: string;
  };

  if (!body.fileBase64) return jsonError('Photo is required', 400);

  const raw = String(body.fileBase64).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');
  if (!buffer.byteLength) return jsonError('Photo is required', 400);
  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    return jsonError('Photo exceeds the 8 MB limit', 400);
  }

  const contentType = body.contentType || 'image/jpeg';
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(contentType)) {
    return jsonError('Unsupported image type. Use JPG, PNG, or WebP.', 400);
  }

  const safeName = (body.fileName || 'pet-photo.jpg').replace(/[^\w.\-]+/g, '_');
  const storagePath = `${ctx.pet.organization_id}/profile-photos/${patientId}/${Date.now()}-${safeName}`;

  await ctx.admin
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('patient_id', patientId)
    .eq('organization_id', ctx.pet.organization_id)
    .eq('category', 'profile_photo')
    .is('deleted_at', null);

  const { error: uploadError } = await ctx.admin.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadError) return jsonError(uploadError.message || 'Failed to upload photo', 500);

  const { data: doc, error: docError } = await ctx.admin
    .from('documents')
    .insert({
      organization_id: ctx.pet.organization_id,
      branch_id: null,
      patient_id: patientId,
      visit_id: null,
      uploaded_by: null,
      bucket_id: DOCUMENTS_BUCKET,
      storage_path: storagePath,
      file_name: safeName,
      mime_type: contentType,
      size_bytes: buffer.byteLength,
      category: 'profile_photo',
      description: 'Patient profile photo',
    })
    .select('id')
    .single();

  if (docError || !doc) {
    await ctx.admin.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return jsonError(docError?.message || 'Failed to save photo record', 500);
  }

  const { data: signed } = await ctx.admin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  return Response.json({
    success: true,
    photoUrl: signed?.signedUrl ?? null,
    documentId: doc.id,
  });
}
