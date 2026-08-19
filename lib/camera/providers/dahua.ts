import type { StreamType } from '@/lib/camera/rtsp-builder';

export function buildDahuaStreamPath(
  channel: number,
  streamType: StreamType
): string {
  const subtype = streamType === 'main' ? '0' : '1';
  return `/cam/realmonitor?channel=${channel}&subtype=${subtype}`;
}

export function buildDahuaValidationError(
  channel: number,
  streamType: StreamType
): string | null {
  void streamType;
  if (!Number.isInteger(channel) || channel < 1 || channel > 64) {
    return 'Dahua channel must be between 1 and 64.';
  }
  return null;
}

