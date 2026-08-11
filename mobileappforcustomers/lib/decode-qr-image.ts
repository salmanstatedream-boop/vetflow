import * as ImageManipulator from 'expo-image-manipulator';
import jsQR from 'jsqr';
// jpeg-js has no great ESM types in RN; require-style import is fine
import jpeg from 'jpeg-js';

function base64ToUint8Array(base64: string) {
  const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Decode a QR string from a local image URI (gallery / downloads). */
export async function decodeQrFromImageUri(uri: string): Promise<string | null> {
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );
  if (!manipulated.base64) return null;

  const raw = base64ToUint8Array(manipulated.base64);
  const decoded = jpeg.decode(raw, { useTArray: true });
  if (!decoded?.data || !decoded.width || !decoded.height) return null;

  const code = jsQR(
    new Uint8ClampedArray(decoded.data as Uint8Array),
    decoded.width,
    decoded.height,
    { inversionAttempts: 'attemptBoth' }
  );
  return code?.data?.trim() || null;
}
