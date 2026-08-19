import type {
  CameraDeviceType,
  StreamType,
} from '@/lib/camera/rtsp-builder';

export function buildUniviewStreamPath(
  channel: number,
  streamType: StreamType,
  deviceType: CameraDeviceType
): string {
  if (deviceType === 'IP_CAMERA') {
    return streamType === 'main' ? '/media/video1' : '/media/video2';
  }
  const stream = streamType === 'main' ? '0' : '1';
  return `/unicast/c${channel}/s${stream}/live`;
}

export function buildUniviewValidationError(
  channel: number,
  streamType: StreamType,
  deviceType: CameraDeviceType
): string | null {
  void streamType;
  void deviceType;
  if (!Number.isInteger(channel) || channel < 1 || channel > 64) {
    return 'Uniview channel must be between 1 and 64.';
  }
  return null;
}

