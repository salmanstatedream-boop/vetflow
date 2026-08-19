import {
  buildDahuaStreamPath,
  buildDahuaValidationError,
} from '@/lib/camera/providers/dahua';
import {
  buildHikvisionStreamPath,
  buildHikvisionValidationError,
} from '@/lib/camera/providers/hikvision';
import {
  buildUniviewStreamPath,
  buildUniviewValidationError,
} from '@/lib/camera/providers/uniview';
import {
  buildCustomStreamPath,
  buildCustomValidationError,
} from '@/lib/camera/providers/custom';

export type CameraBrand = 'HIKVISION' | 'DAHUA' | 'UNIVIEW' | 'CUSTOM';
export type CameraDeviceType = 'DVR' | 'XVR' | 'NVR' | 'IP_CAMERA';
export type StreamType = 'main' | 'sub';

export type BuildRtspUrlInput = {
  brand: CameraBrand;
  deviceType: CameraDeviceType;
  host: string;
  port: number;
  username?: string | null;
  password?: string | null;
  channel: number;
  streamType: StreamType;
  customMainPath?: string | null;
  customSubPath?: string | null;
};

function buildRtspAuth(username?: string | null, password?: string | null): string {
  if (!username) return '';
  const user = encodeURIComponent(username);
  const pass = password ? `:${encodeURIComponent(password)}` : '';
  return `${user}${pass}@`;
}

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

export function buildRtspStreamPath(input: BuildRtspUrlInput): string {
  const { brand, channel, streamType, deviceType } = input;
  switch (brand) {
    case 'HIKVISION':
      return buildHikvisionStreamPath(channel, streamType);
    case 'DAHUA':
      return buildDahuaStreamPath(channel, streamType);
    case 'UNIVIEW':
      return buildUniviewStreamPath(channel, streamType, deviceType);
    case 'CUSTOM':
      return buildCustomStreamPath(streamType, input.customMainPath, input.customSubPath);
    default:
      return buildCustomStreamPath(streamType, input.customMainPath, input.customSubPath);
  }
}

export function validateProviderConfig(input: BuildRtspUrlInput): string | null {
  const { brand, channel, streamType, deviceType } = input;
  if (!Number.isInteger(channel) || channel < 1 || channel > 64) {
    return 'Channel must be between 1 and 64.';
  }
  switch (brand) {
    case 'HIKVISION':
      return buildHikvisionValidationError(channel, streamType);
    case 'DAHUA':
      return buildDahuaValidationError(channel, streamType);
    case 'UNIVIEW':
      return buildUniviewValidationError(channel, streamType, deviceType);
    case 'CUSTOM':
      return buildCustomValidationError(streamType, input.customMainPath, input.customSubPath);
    default:
      return 'Unsupported camera brand.';
  }
}

export function buildRtspUrl(input: BuildRtspUrlInput): string {
  const path = normalizePath(buildRtspStreamPath(input));
  const auth = buildRtspAuth(input.username, input.password);
  return `rtsp://${auth}${input.host}:${input.port}${path}`;
}

