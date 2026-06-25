import type { SupabaseClient } from '@supabase/supabase-js';

export const CLINIC_LOGO_BUCKET = 'clinic-logos';
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

export function isHttpLogoUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith('http://') || value.startsWith('https://');
}

export function isStorageLogoPath(value: string | null | undefined): boolean {
  if (!value) return false;
  return !isHttpLogoUrl(value);
}

export function clinicLogoApiUrl(): string {
  return '/api/branding/logo';
}

export async function uploadClinicLogoFile(
  supabase: SupabaseClient,
  organizationId: string,
  file: File
): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Logo file is required.');
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error('Logo file exceeds the 2 MB limit.');
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error('Unsupported file type. Use PNG, JPG, WEBP, or SVG.');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const storagePath = `${organizationId}/logo.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(CLINIC_LOGO_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'image/png',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload clinic logo.');
  }

  return storagePath;
}
