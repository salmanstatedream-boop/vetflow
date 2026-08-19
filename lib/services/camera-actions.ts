'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  assertCapability,
  assertOrganization,
  resolveServerAuthContext,
} from '@/lib/auth/context';
import { isCameraFeedEnabled } from '@/lib/auth/features';
import { encryptCredential, decryptCredential } from '@/lib/camera/credential-crypto';
import {
  getPlaybackUrls,
  isGatewayConfigured,
  testCameraConnection,
  type TestResult,
} from '@/lib/camera/media-gateway';
import {
  buildRtspUrl,
  validateProviderConfig,
  type CameraBrand,
  type CameraDeviceType,
  type StreamType,
} from '@/lib/camera/rtsp-builder';
import { writeAuditLog } from '@/lib/services/audit';

async function assertCameraFeedFeature(organizationId: string) {
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from('subscription_status')
    .select('features')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (!isCameraFeedEnabled((sub?.features as Record<string, unknown>) || null)) {
    throw new Error('Camera feed is not enabled for this organization.');
  }
}

// --- Public types (never include credentials) ---

export type CameraDevicePublic = {
  id: string;
  name: string;
  location: string | null;
  protocol: 'rtsp';
  brand: CameraBrand;
  deviceType: CameraDeviceType;
  host: string | null;
  port: number;
  streamPath: string | null; // legacy compatibility
  channelCount: number;
  preferredGridStream: StreamType;
  customMainPath: string | null;
  customSubPath: string | null;
  status: string;
  hasCredentials: boolean;
  snapshotUrl: string | null;
  streamUrl: string | null;
  playbackWhepSub: string | null;
  playbackHlsSub: string | null;
  playbackWhepMain: string | null;
  playbackHlsMain: string | null;
  channels: CameraChannelPublic[];
};

export type { CameraBrand, CameraDeviceType, StreamType };

export type CameraChannelPublic = {
  id: string;
  channelNumber: number;
  name: string;
  location: string | null;
  enabled: boolean;
};

export type CameraRecordingRow = {
  id: string;
  deviceName: string;
  startedAt: string;
  endedAt: string | null;
  storagePath: string;
};

function normalizeBrand(value: unknown): CameraBrand {
  if (
    value === 'HIKVISION' ||
    value === 'DAHUA' ||
    value === 'UNIVIEW' ||
    value === 'CUSTOM'
  ) {
    return value;
  }
  return 'CUSTOM';
}

function normalizeDeviceType(value: unknown): CameraDeviceType {
  if (
    value === 'DVR' ||
    value === 'XVR' ||
    value === 'NVR' ||
    value === 'IP_CAMERA'
  ) {
    return value;
  }
  return 'NVR';
}

function normalizePreferredStream(value: unknown): StreamType {
  return value === 'main' ? 'main' : 'sub';
}

async function ensureCameraChannels(params: {
  deviceId: string;
  organizationId: string;
  branchId: string;
  channelCount: number;
}) {
  const supabase = await createClient();
  const { deviceId, organizationId, branchId, channelCount } = params;

  const { data: existingRows } = await supabase
    .from('camera_channels')
    .select('id, channel_number, name, enabled')
    .eq('camera_device_id', deviceId)
    .eq('organization_id', organizationId)
    .eq('branch_id', branchId);

  const existing = existingRows || [];
  const existingByNumber = new Map(existing.map((r) => [r.channel_number, r]));

  const inserts: Array<{
    camera_device_id: string;
    organization_id: string;
    branch_id: string;
    channel_number: number;
    name: string;
  }> = [];

  for (let c = 1; c <= channelCount; c++) {
    if (!existingByNumber.has(c)) {
      inserts.push({
        camera_device_id: deviceId,
        organization_id: organizationId,
        branch_id: branchId,
        channel_number: c,
        name: `Camera ${c}`,
      });
    }
  }

  if (inserts.length > 0) {
    await supabase.from('camera_channels').insert(inserts);
  }

  const extraChannelIds = existing
    .filter((row) => row.channel_number > channelCount && row.enabled)
    .map((row) => row.id);

  if (extraChannelIds.length > 0) {
    await supabase.from('camera_channels').update({ enabled: false }).in('id', extraChannelIds);
  }
}

// --- List ---

export async function listCameraDevicesAction() {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'view_camera_feed');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('camera_devices')
      .select(
        'id, name, location, protocol, brand, device_type, host, port, stream_path, channel_count, preferred_grid_stream, custom_main_path, custom_sub_path, status, username_enc, snapshot_url, stream_url, is_active'
      )
      .eq('branch_id', ctx.activeBranchId)
      .eq('is_active', true);

    if (error) throw new Error(error.message);

    const deviceIds = (data || []).map((d) => d.id);
    const { data: channelsData } = await supabase
      .from('camera_channels')
      .select('id, camera_device_id, channel_number, name, location, enabled')
      .in('camera_device_id', deviceIds.length ? deviceIds : ['00000000-0000-0000-0000-000000000000'])
      .order('channel_number', { ascending: true });

    const channelsByDevice = new Map<string, CameraChannelPublic[]>();
    for (const row of channelsData || []) {
      const list = channelsByDevice.get(row.camera_device_id) || [];
      list.push({
        id: row.id,
        channelNumber: row.channel_number,
        name: row.name,
        location: row.location ?? null,
        enabled: row.enabled,
      });
      channelsByDevice.set(row.camera_device_id, list);
    }

    const gatewayUp = isGatewayConfigured();
    const devices: CameraDevicePublic[] = (data || []).map((d) => {
      const streamNameSub = `cam-${d.id.slice(0, 8)}-sub`;
      const streamNameMain = `cam-${d.id.slice(0, 8)}-main`;
      const playbackSub = gatewayUp ? getPlaybackUrls(streamNameSub) : null;
      const playbackMain = gatewayUp ? getPlaybackUrls(streamNameMain) : null;
      return {
        id: d.id,
        name: d.name,
        location: d.location ?? null,
        protocol: 'rtsp',
        brand: normalizeBrand(d.brand),
        deviceType: normalizeDeviceType(d.device_type),
        host: d.host ?? null,
        port: d.port ?? 554,
        streamPath: d.stream_path ?? null,
        channelCount: d.channel_count ?? 1,
        preferredGridStream: normalizePreferredStream(d.preferred_grid_stream),
        customMainPath: d.custom_main_path ?? null,
        customSubPath: d.custom_sub_path ?? null,
        status: d.status ?? 'unknown',
        hasCredentials: Boolean(d.username_enc),
        snapshotUrl: d.snapshot_url ?? null,
        streamUrl: d.stream_url ?? null,
        playbackWhepSub: playbackSub?.whep ?? null,
        playbackHlsSub: playbackSub?.hls ?? null,
        playbackWhepMain: playbackMain?.whep ?? null,
        playbackHlsMain: playbackMain?.hls ?? null,
        channels: channelsByDevice.get(d.id) || [],
      };
    });

    return { success: true, devices, gatewayConfigured: gatewayUp };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      devices: [] as CameraDevicePublic[],
      gatewayConfigured: false,
    };
  }
}

// --- Create ---

const CreateDeviceSchema = z.object({
  name: z.string().min(1).max(255),
  brand: z.enum(['HIKVISION', 'DAHUA', 'UNIVIEW', 'CUSTOM']),
  deviceType: z.enum(['DVR', 'XVR', 'NVR', 'IP_CAMERA']),
  location: z.string().max(255).optional().or(z.literal('')),
  host: z.string().max(255).optional().or(z.literal('')),
  port: z.number().int().min(1).max(65535).default(554),
  channelCount: z.number().int().min(1).max(64).default(1),
  preferredGridStream: z.enum(['main', 'sub']).default('sub'),
  username: z.string().max(255).optional().or(z.literal('')),
  password: z.string().max(255).optional().or(z.literal('')),
  customMainPath: z.string().max(500).optional().or(z.literal('')),
  customSubPath: z.string().max(500).optional().or(z.literal('')),
  streamPath: z.string().max(500).optional().or(z.literal('')), // legacy
  snapshotUrl: z.string().max(2000).optional().or(z.literal('')),
  streamUrl: z.string().max(2000).optional().or(z.literal('')),
});

export async function createCameraDeviceAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_camera_devices');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const parsed = CreateDeviceSchema.parse(payload);
    const host = parsed.host?.trim() || '';
    const username = parsed.username?.trim() || '';
    const password = parsed.password?.trim() || '';
    if (!host) {
      throw new Error('IP address / hostname is required.');
    }
    if (!username) {
      throw new Error('Username is required.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('camera_devices')
      .insert({
        organization_id: ctx.organizationId,
        branch_id: ctx.activeBranchId,
        name: parsed.name,
        location: parsed.location || null,
        protocol: 'rtsp',
        brand: parsed.brand,
        device_type: parsed.deviceType,
        host: host || null,
        port: parsed.port,
        channel_count: parsed.deviceType === 'IP_CAMERA' ? 1 : parsed.channelCount,
        preferred_grid_stream: parsed.preferredGridStream,
        custom_main_path: parsed.customMainPath || null,
        custom_sub_path: parsed.customSubPath || null,
        stream_path: parsed.streamPath || null,
        username_enc: username ? encryptCredential(username) : null,
        password_enc: password ? encryptCredential(password) : null,
        snapshot_url: parsed.snapshotUrl || null,
        stream_url: parsed.streamUrl || null,
        status: 'unknown',
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    await ensureCameraChannels({
      deviceId: data.id,
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      channelCount: parsed.deviceType === 'IP_CAMERA' ? 1 : parsed.channelCount,
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'CAMERA_ADDED',
      resourceType: 'CAMERA_DEVICE',
      resourceId: data.id,
      afterData: {
        name: parsed.name,
        location: parsed.location,
        host: host,
        brand: parsed.brand,
        deviceType: parsed.deviceType,
      },
    });

    return { success: true, deviceId: data.id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// --- Update ---

const UpdateDeviceSchema = z.object({
  deviceId: z.string().uuid(),
  name: z.string().min(1).max(255),
  brand: z.enum(['HIKVISION', 'DAHUA', 'UNIVIEW', 'CUSTOM']),
  deviceType: z.enum(['DVR', 'XVR', 'NVR', 'IP_CAMERA']),
  location: z.string().max(255).optional().or(z.literal('')),
  host: z.string().max(255).optional().or(z.literal('')),
  port: z.number().int().min(1).max(65535).default(554),
  channelCount: z.number().int().min(1).max(64).default(1),
  preferredGridStream: z.enum(['main', 'sub']).default('sub'),
  customMainPath: z.string().max(500).optional().or(z.literal('')),
  customSubPath: z.string().max(500).optional().or(z.literal('')),
  streamPath: z.string().max(500).optional().or(z.literal('')),
  username: z.string().max(255).optional().or(z.literal('')),
  password: z.string().max(255).optional().or(z.literal('')),
  snapshotUrl: z.string().max(2000).optional().or(z.literal('')),
  streamUrl: z.string().max(2000).optional().or(z.literal('')),
});

export async function updateCameraDeviceAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_camera_devices');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const parsed = UpdateDeviceSchema.parse(payload);
    const supabase = await createClient();

    const updateData: Record<string, unknown> = {
      name: parsed.name,
      brand: parsed.brand,
      device_type: parsed.deviceType,
      location: parsed.location || null,
      host: parsed.host || null,
      port: parsed.port,
      channel_count: parsed.deviceType === 'IP_CAMERA' ? 1 : parsed.channelCount,
      preferred_grid_stream: parsed.preferredGridStream,
      custom_main_path: parsed.customMainPath || null,
      custom_sub_path: parsed.customSubPath || null,
      stream_path: parsed.streamPath || null,
      snapshot_url: parsed.snapshotUrl || null,
      stream_url: parsed.streamUrl || null,
    };

    if (parsed.username) {
      updateData.username_enc = encryptCredential(parsed.username);
    }
    if (parsed.password) {
      updateData.password_enc = encryptCredential(parsed.password);
    }

    const { error } = await supabase
      .from('camera_devices')
      .update(updateData)
      .eq('id', parsed.deviceId)
      .eq('branch_id', ctx.activeBranchId)
      .eq('organization_id', ctx.organizationId);

    if (error) throw new Error(error.message);
    await ensureCameraChannels({
      deviceId: parsed.deviceId,
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      channelCount: parsed.deviceType === 'IP_CAMERA' ? 1 : parsed.channelCount,
    });

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'CAMERA_UPDATED',
      resourceType: 'CAMERA_DEVICE',
      resourceId: parsed.deviceId,
      afterData: {
        name: parsed.name,
        host: parsed.host,
        brand: parsed.brand,
        deviceType: parsed.deviceType,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// --- Delete (soft) ---

export async function deleteCameraDeviceAction(deviceId: string) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_camera_devices');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const supabase = await createClient();
    const { error } = await supabase
      .from('camera_devices')
      .update({ is_active: false })
      .eq('id', deviceId)
      .eq('branch_id', ctx.activeBranchId)
      .eq('organization_id', ctx.organizationId);

    if (error) throw new Error(error.message);

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'CAMERA_REMOVED',
      resourceType: 'CAMERA_DEVICE',
      resourceId: deviceId,
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// --- Test Connection ---

export async function testCameraConnectionAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_camera_devices');
    await assertCameraFeedFeature(ctx.organizationId);

    const schema = z.object({
      brand: z.enum(['HIKVISION', 'DAHUA', 'UNIVIEW', 'CUSTOM']).optional(),
      deviceType: z.enum(['DVR', 'XVR', 'NVR', 'IP_CAMERA']).optional(),
      host: z.string().min(1),
      port: z.number().int().min(1).max(65535).default(554),
      username: z.string().optional().or(z.literal('')),
      password: z.string().optional().or(z.literal('')),
      streamType: z.enum(['main', 'sub']).default('sub'),
      streamPath: z.string().optional().or(z.literal('')), // legacy
      customMainPath: z.string().optional().or(z.literal('')),
      customSubPath: z.string().optional().or(z.literal('')),
      channel: z.number().int().min(1).max(64).default(1),
      deviceId: z.string().uuid().optional(),
    });
    const parsed = schema.parse(payload);

    let brand: CameraBrand = parsed.brand || 'CUSTOM';
    let deviceType: CameraDeviceType = parsed.deviceType || 'NVR';
    let username = parsed.username || '';
    let password = parsed.password || '';
    let customMainPath = parsed.customMainPath || '';
    let customSubPath = parsed.customSubPath || '';

    if (parsed.deviceId) {
      const supabase = await createClient();
      const { data: dev } = await supabase
        .from('camera_devices')
        .select('username_enc, password_enc, brand, device_type, custom_main_path, custom_sub_path')
        .eq('id', parsed.deviceId)
        .eq('organization_id', ctx.organizationId)
        .eq('branch_id', ctx.activeBranchId)
        .maybeSingle();
      if (!dev) throw new Error('Camera system not found.');
      brand = normalizeBrand(dev.brand);
      deviceType = normalizeDeviceType(dev.device_type);
      customMainPath = customMainPath || dev.custom_main_path || '';
      customSubPath = customSubPath || dev.custom_sub_path || '';
      if (dev?.username_enc && !username) username = decryptCredential(dev.username_enc);
      if (dev?.password_enc && !password) password = decryptCredential(dev.password_enc);
    }

    const validationError = validateProviderConfig({
      brand,
      deviceType,
      host: parsed.host,
      port: parsed.port,
      username,
      password,
      channel: parsed.channel,
      streamType: parsed.streamType,
      customMainPath,
      customSubPath,
    });
    if (validationError) {
      return {
        success: true,
        result: { status: 'invalid_config' as const, message: validationError },
      };
    }

    const rtspUrl = buildRtspUrl({
      brand,
      deviceType,
      host: parsed.host,
      port: parsed.port,
      username: username || undefined,
      password: password || undefined,
      channel: parsed.channel,
      streamType: parsed.streamType,
      customMainPath,
      customSubPath,
    });

    const result: TestResult = await testCameraConnection(rtspUrl);
    const mappedResult: TestResult = (() => {
      switch (result.status) {
        case 'connected':
          return { status: 'connected', message: 'Connected successfully.' };
        case 'auth_failed':
          return {
            status: 'auth_failed',
            message: 'Authentication failed. Check the CCTV username and password.',
          };
        case 'invalid_config':
          return { status: 'invalid_config', message: 'Invalid RTSP configuration.' };
        case 'unreachable':
          return {
            status: 'unreachable',
            message: 'Recorder could not be reached. Check the IP address and network.',
          };
        case 'gateway_unavailable':
          return {
            status: 'gateway_unavailable',
            message:
              'Camera Gateway Required. A camera gateway must be connected before local CCTV systems can be viewed remotely.',
          };
        default:
          return result;
      }
    })();

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId || null,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'CAMERA_CONNECTION_TESTED',
      resourceType: 'CAMERA_DEVICE',
      resourceId: parsed.deviceId,
      afterData: {
        brand,
        deviceType,
        host: parsed.host,
        port: parsed.port,
        channel: parsed.channel,
        streamType: parsed.streamType,
        status: mappedResult.status,
      },
    });
    return { success: true, result: mappedResult };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      result: { status: 'invalid_config' as const, message: 'Test failed.' },
    };
  }
}

const ChannelUpdateSchema = z.object({
  deviceId: z.string().uuid(),
  channels: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        channelNumber: z.number().int().min(1).max(64),
        name: z.string().min(1).max(255),
        location: z.string().max(255).optional().or(z.literal('')),
        enabled: z.boolean().default(true),
      })
    )
    .min(1)
    .max(64),
});

export async function updateCameraChannelsAction(payload: unknown) {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'manage_camera_devices');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const parsed = ChannelUpdateSchema.parse(payload);
    const supabase = await createClient();
    const { data: device } = await supabase
      .from('camera_devices')
      .select('id')
      .eq('id', parsed.deviceId)
      .eq('organization_id', ctx.organizationId)
      .eq('branch_id', ctx.activeBranchId)
      .maybeSingle();
    if (!device) throw new Error('Camera system not found.');

    const updates = parsed.channels.map((ch) => ({
      camera_device_id: parsed.deviceId,
      organization_id: ctx.organizationId,
      branch_id: ctx.activeBranchId,
      channel_number: ch.channelNumber,
      name: ch.name,
      location: ch.location || null,
      enabled: ch.enabled,
    }));

    const { error } = await supabase
      .from('camera_channels')
      .upsert(updates, { onConflict: 'camera_device_id,channel_number' });

    if (error) throw new Error(error.message);

    await writeAuditLog({
      organizationId: ctx.organizationId,
      branchId: ctx.activeBranchId,
      actorUserId: ctx.userId,
      actorRole: ctx.role || 'clinic_admin',
      action: 'CAMERA_CHANNELS_UPDATED',
      resourceType: 'CAMERA_DEVICE',
      resourceId: parsed.deviceId,
      afterData: { channelCount: parsed.channels.length },
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// --- Recordings ---

export async function listCameraRecordingsAction() {
  try {
    const ctx = await resolveServerAuthContext();
    if (!ctx) throw new Error('Unauthorized');
    assertOrganization(ctx);
    assertCapability(ctx, 'view_camera_feed');
    await assertCameraFeedFeature(ctx.organizationId);
    if (!ctx.activeBranchId) throw new Error('Select a branch');

    const supabase = await createClient();
    const { data: devices, error: devicesError } = await supabase
      .from('camera_devices')
      .select('id, name')
      .eq('branch_id', ctx.activeBranchId)
      .eq('is_active', true);

    if (devicesError) throw new Error(devicesError.message);
    const deviceIds = (devices || []).map((d) => d.id);
    if (deviceIds.length === 0) {
      return { success: true, recordings: [] as CameraRecordingRow[] };
    }

    const deviceNameById = new Map((devices || []).map((d) => [d.id, d.name]));

    const { data, error } = await supabase
      .from('camera_recordings')
      .select('id, device_id, started_at, ended_at, storage_path')
      .in('device_id', deviceIds)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);

    const recordings: CameraRecordingRow[] = (data || []).map((row) => ({
      id: row.id,
      deviceName: deviceNameById.get(row.device_id) || 'Camera',
      startedAt: row.started_at,
      endedAt: row.ended_at,
      storagePath: row.storage_path,
    }));

    return { success: true, recordings };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed',
      recordings: [] as CameraRecordingRow[],
    };
  }
}
