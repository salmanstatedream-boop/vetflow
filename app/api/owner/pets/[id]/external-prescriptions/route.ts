import { createAdminClient } from '@/lib/supabase/server';
import { jsonError, resolveBearerUser } from '@/lib/auth/owner-api';

type Params = { params: Promise<{ id: string }> };

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

export async function GET(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;
  const ctx = await assertOwnerPet(user.id, patientId);
  if (!ctx) return jsonError('Pet not found', 404);

  const { data, error } = await ctx.admin
    .from('owner_external_prescriptions')
    .select(
      'id, clinic_name, notes, taken_at, storage_path, file_name, created_at'
    )
    .eq('patient_id', patientId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return jsonError(error.message, 500);

  return Response.json({
    success: true,
    prescriptions: (data || []).map((row) => ({
      id: row.id,
      clinicName: row.clinic_name,
      notes: row.notes,
      takenAt: row.taken_at,
      storagePath: row.storage_path,
      fileName: row.file_name,
      createdAt: row.created_at,
    })),
  });
}

export async function POST(req: Request, { params }: Params) {
  const user = await resolveBearerUser(req);
  if (!user) return jsonError('Unauthorized', 401);
  const { id: patientId } = await params;
  const ctx = await assertOwnerPet(user.id, patientId);
  if (!ctx) return jsonError('Pet not found', 404);

  const body = (await req.json().catch(() => ({}))) as {
    clinicName?: string;
    notes?: string;
    takenAt?: string;
    fileBase64?: string;
    fileName?: string;
    contentType?: string;
  };

  const clinicName = String(body.clinicName || '').trim();
  if (!clinicName) return jsonError('Clinic name is required', 400);

  let storagePath: string | null = null;
  let fileName: string | null = body.fileName ? String(body.fileName) : null;

  if (body.fileBase64) {
    const raw = String(body.fileBase64).replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(raw, 'base64');
    if (buffer.byteLength > 6 * 1024 * 1024) {
      return jsonError('File too large (max 6MB)', 400);
    }
    const safeName = (fileName || 'prescription.jpg').replace(/[^\w.\-]+/g, '_');
    storagePath = `${ctx.pet.organization_id}/owner-rx/${patientId}/${Date.now()}-${safeName}`;
    const contentType = body.contentType || 'image/jpeg';
    const { error: uploadError } = await ctx.admin.storage
      .from('clinic-documents')
      .upload(storagePath, buffer, { contentType, upsert: false });
    if (uploadError) return jsonError(uploadError.message, 500);
    fileName = safeName;
  }

  const { data, error } = await ctx.admin
    .from('owner_external_prescriptions')
    .insert({
      user_id: user.id,
      patient_id: patientId,
      organization_id: ctx.pet.organization_id,
      clinic_name: clinicName,
      notes: body.notes?.trim() || null,
      taken_at: body.takenAt || null,
      storage_path: storagePath,
      file_name: fileName,
    })
    .select('id, clinic_name, notes, taken_at, storage_path, file_name, created_at')
    .single();

  if (error) return jsonError(error.message, 500);

  return Response.json({
    success: true,
    prescription: {
      id: data.id,
      clinicName: data.clinic_name,
      notes: data.notes,
      takenAt: data.taken_at,
      storagePath: data.storage_path,
      fileName: data.file_name,
      createdAt: data.created_at,
    },
  });
}
