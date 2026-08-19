import type { StreamType } from '@/lib/camera/rtsp-builder';

export function buildHikvisionStreamPath(
  channel: number,
  streamType: StreamType
): string {
  const suffix = streamType === 'main' ? '01' : '02';
  return `/Streaming/Channels/${channel}${suffix}`;
}

export function buildHikvisionValidationError(
  channel: number,
  streamType: StreamType
): string | null {
  void streamType;
  if (!Number.isInteger(channel) || channel < 1 || channel > 64) {
    return 'Hikvision channel must be between 1 and 64.';
  }
  return null;
}

