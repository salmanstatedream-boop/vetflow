import type { StreamType } from '@/lib/camera/rtsp-builder';

export function buildCustomStreamPath(
  streamType: StreamType,
  customMainPath?: string | null,
  customSubPath?: string | null
): string {
  const path = streamType === 'main' ? customMainPath : customSubPath;
  return path && path.trim().length > 0 ? path : '/';
}

export function buildCustomValidationError(
  streamType: StreamType,
  customMainPath?: string | null,
  customSubPath?: string | null
): string | null {
  if (streamType === 'main' && (!customMainPath || !customMainPath.trim())) {
    return 'Custom main stream path is required.';
  }
  if (streamType === 'sub' && (!customSubPath || !customSubPath.trim())) {
    return 'Custom sub stream path is required.';
  }
  return null;
}

