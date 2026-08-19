'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  listCameraDevicesAction,
  listCameraRecordingsAction,
  createCameraDeviceAction,
  updateCameraDeviceAction,
  deleteCameraDeviceAction,
  testCameraConnectionAction,
  updateCameraChannelsAction,
  type CameraBrand,
  type CameraDeviceType,
  type CameraDevicePublic,
  type CameraChannelPublic,
  type CameraRecordingRow,
} from '@/lib/services/camera-actions';
import CameraPlayer from '@/components/camera/CameraPlayer';
import FormModal from '@/components/ui/premium/FormModal';
import Button from '@/components/ui/premium/Button';
import Input from '@/components/ui/premium/Input';
import EmptyState from '@/components/ui/premium/EmptyState';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Video,
  MapPin,
  Wifi,
  WifiOff,
  Film,
  Zap,
  Server,
} from 'lucide-react';

type FormData = {
  name: string;
  brand: CameraBrand;
  deviceType: CameraDeviceType;
  location: string;
  host: string;
  port: string;
  channelCount: string;
  preferredGridStream: 'main' | 'sub';
  username: string;
  password: string;
  customMainPath: string;
  customSubPath: string;
  streamPath: string; // legacy
  snapshotUrl: string;
  streamUrl: string;
};

const EMPTY_FORM: FormData = {
  name: '',
  brand: 'HIKVISION',
  deviceType: 'NVR',
  location: '',
  host: '',
  port: '554',
  channelCount: '8',
  preferredGridStream: 'sub',
  streamPath: '',
  username: '',
  password: '',
  customMainPath: '',
  customSubPath: '',
  snapshotUrl: '',
  streamUrl: '',
};

type ChannelDraft = {
  id?: string;
  channelNumber: number;
  name: string;
  location: string;
  enabled: boolean;
};

const BRAND_OPTIONS: Array<{ value: CameraBrand; label: string }> = [
  { value: 'HIKVISION', label: 'Hikvision' },
  { value: 'DAHUA', label: 'Dahua' },
  { value: 'UNIVIEW', label: 'Uniview' },
  { value: 'CUSTOM', label: 'Other / Custom RTSP' },
];

const DEVICE_OPTIONS: Array<{ value: CameraDeviceType; label: string }> = [
  { value: 'DVR', label: 'DVR' },
  { value: 'XVR', label: 'XVR' },
  { value: 'NVR', label: 'NVR' },
  { value: 'IP_CAMERA', label: 'IP Camera' },
];

function mapChannelDraft(channels: CameraChannelPublic[], count: number): ChannelDraft[] {
  const existing = new Map(channels.map((c) => [c.channelNumber, c]));
  const out: ChannelDraft[] = [];
  for (let i = 1; i <= count; i++) {
    const ex = existing.get(i);
    out.push({
      id: ex?.id,
      channelNumber: i,
      name: ex?.name || `Camera ${i}`,
      location: ex?.location || '',
      enabled: ex?.enabled ?? true,
    });
  }
  return out;
}

function statusBadge(status: string) {
  switch (status) {
    case 'online':
      return { label: 'Online', color: 'bg-emerald-500/15 text-emerald-400', icon: Wifi };
    case 'offline':
    case 'unreachable':
      return { label: 'Offline', color: 'bg-red-500/15 text-red-400', icon: WifiOff };
    case 'auth_failed':
      return { label: 'Auth failed', color: 'bg-amber-500/15 text-amber-400', icon: WifiOff };
    default:
      return { label: 'Unknown', color: 'bg-surface-container-high text-on-surface-variant', icon: Wifi };
  }
}

function formatRecordingTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function CameraFeedClient() {
  const [devices, setDevices] = useState<CameraDevicePublic[]>([]);
  const [recordings, setRecordings] = useState<CameraRecordingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gatewayConfigured, setGatewayConfigured] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState<'system' | 'channels'>('system');
  const [channelDrafts, setChannelDrafts] = useState<ChannelDraft[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [devicesRes, recordingsRes] = await Promise.all([
        listCameraDevicesAction(),
        listCameraRecordingsAction(),
      ]);
      if (devicesRes.success) {
        setDevices(devicesRes.devices);
      } else {
        setError(devicesRes.error || 'Failed to load cameras');
      }
      setGatewayConfigured(Boolean(devicesRes.gatewayConfigured));
      if (recordingsRes.success) {
        setRecordings(recordingsRes.recordings);
      }
    } catch {
      setError('Unable to load cameras right now. Please refresh and try again.');
      setGatewayConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setStep('system');
    setChannelDrafts([]);
    setForm(EMPTY_FORM);
    setFormError(null);
    setTestStatus(null);
    setModalOpen(true);
  };

  const openEdit = (d: CameraDevicePublic) => {
    setEditingId(d.id);
    setStep('system');
    setForm({
      name: d.name,
      brand: d.brand,
      deviceType: d.deviceType,
      location: d.location || '',
      host: d.host || '',
      port: String(d.port),
      channelCount: String(d.channelCount || 1),
      preferredGridStream: d.preferredGridStream || 'sub',
      streamPath: d.streamPath || '',
      username: '',
      password: '',
      customMainPath: d.customMainPath || '',
      customSubPath: d.customSubPath || '',
      snapshotUrl: d.snapshotUrl || '',
      streamUrl: d.streamUrl || '',
    });
    setChannelDrafts(mapChannelDraft(d.channels || [], d.channelCount || 1));
    setFormError(null);
    setTestStatus(null);
    setModalOpen(true);
  };

  const effectiveChannelCount =
    form.deviceType === 'IP_CAMERA'
      ? 1
      : Math.min(64, Math.max(1, Number(form.channelCount) || 1));

  const saveSystem = async () => {
    if (!form.name.trim()) { setFormError('Camera name is required.'); return; }
    if (!form.host.trim()) { setFormError('IP address / host is required.'); return; }
    if (!form.username.trim() && !editingId) { setFormError('Username is required.'); return; }
    if (!form.password.trim() && !editingId) { setFormError('Password is required.'); return; }
    if (form.brand === 'CUSTOM' && !form.customMainPath.trim()) {
      setFormError('Custom Main Stream Path is required.');
      return;
    }
    if (form.brand === 'CUSTOM' && !form.customSubPath.trim()) {
      setFormError('Custom Sub Stream Path is required.');
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      brand: form.brand,
      deviceType: form.deviceType,
      location: form.location,
      host: form.host,
      port: Number(form.port) || 554,
      channelCount: effectiveChannelCount,
      preferredGridStream: form.preferredGridStream,
      customMainPath: form.customMainPath,
      customSubPath: form.customSubPath,
      streamPath: form.streamPath,
      username: form.username,
      password: form.password,
      snapshotUrl: form.snapshotUrl,
      streamUrl: form.streamUrl,
    };

    const res: { success: boolean; error?: string; deviceId?: string } = editingId
      ? await updateCameraDeviceAction({ ...payload, deviceId: editingId })
      : await createCameraDeviceAction(payload);

    setSaving(false);
    if (!res.success) {
      setFormError(res.error || 'Failed to save camera.');
      return;
    }

    const deviceId = editingId || res.deviceId;
    if (!deviceId) {
      setFormError('Camera system ID missing after save.');
      return;
    }
    setEditingId(deviceId);
    setChannelDrafts((prev) =>
      prev.length > 0 ? prev.slice(0, effectiveChannelCount) : mapChannelDraft([], effectiveChannelCount)
    );
    setStep('channels');
  };

  const saveChannels = async () => {
    if (!editingId) return;
    setSaving(true);
    setFormError(null);
    const res = await updateCameraChannelsAction({
      deviceId: editingId,
      channels: channelDrafts.map((ch) => ({
        id: ch.id,
        channelNumber: ch.channelNumber,
        name: ch.name.trim() || `Camera ${ch.channelNumber}`,
        location: ch.location,
        enabled: ch.enabled,
      })),
    });
    setSaving(false);
    if (res.success) {
      setModalOpen(false);
      setStep('system');
      load();
    } else {
      setFormError(res.error || 'Failed to save camera channels.');
    }
  };

  const handleTest = async () => {
    if (!form.host.trim()) { setTestStatus('Enter a host/IP address first.'); return; }
    setTesting(true);
    setTestStatus('Connecting...');
    const res = await testCameraConnectionAction({
      host: form.host,
      port: Number(form.port) || 554,
      brand: form.brand,
      deviceType: form.deviceType,
      channel: 1,
      streamType: form.preferredGridStream,
      customMainPath: form.customMainPath,
      customSubPath: form.customSubPath,
      username: form.username,
      password: form.password,
      streamPath: form.streamPath,
      deviceId: editingId || undefined,
    });
    setTesting(false);
    setTestStatus(res.result?.message || res.error || 'Test completed.');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove camera "${name}"?`)) return;
    setDeletingId(id);
    const res = await deleteCameraDeviceAction(id);
    setDeletingId(null);
    if (res.success) load();
    else setError(res.error || 'Failed to remove camera.');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-sm rounded-xl">
          {error}
        </div>
      )}
      {!gatewayConfigured && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm rounded-xl flex items-start gap-2">
          <Server className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Camera Gateway Required</p>
            <p className="text-xs mt-1">
              A camera gateway must be connected to this clinic before local CCTV systems can be viewed remotely.
            </p>
          </div>
        </div>
      )}

      {/* Camera grid */}
      <section className="space-y-4">
        {devices.length === 0 ? (
          <EmptyState
            icon={Video}
            title="No cameras connected"
            description="Add your clinic cameras to monitor live feeds from your dashboard."
            action={
              <Button onClick={openAdd} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Camera
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => {
              const badge = statusBadge(device.status);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={device.id}
                  className="rounded-2xl border border-outline-variant/40 overflow-hidden glass-panel"
                >
                  <div className="flex items-center justify-between p-3 bg-surface-container/40 border-b border-outline-variant/30">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{device.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {device.brand} {device.deviceType} • {device.channelCount} channels
                      </p>
                      {device.location && (
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {device.location}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  <CameraPlayer
                    whepUrl={device.preferredGridStream === 'main' ? device.playbackWhepMain : device.playbackWhepSub}
                    hlsUrl={device.preferredGridStream === 'main' ? device.playbackHlsMain : device.playbackHlsSub}
                    fallbackWhepUrl={device.playbackWhepSub}
                    fallbackHlsUrl={device.playbackHlsSub}
                    fullscreenWhepUrl={device.playbackWhepMain}
                    fullscreenHlsUrl={device.playbackHlsMain}
                    snapshotUrl={device.snapshotUrl}
                    legacyStreamUrl={device.streamUrl}
                    cameraName={device.name}
                    status={device.status}
                  />

                  <div className="flex items-center justify-end gap-1.5 p-2 border-t border-outline-variant/30">
                    <button
                      type="button"
                      onClick={() => openEdit(device)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container/60 transition-colors"
                      aria-label="Edit camera"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(device.id, device.name)}
                      disabled={deletingId === device.id}
                      className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      aria-label="Remove camera"
                    >
                      {deletingId === device.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recordings */}
      {recordings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-on-surface">Recordings</h2>
          </div>
          <div className="glass-panel rounded-2xl border border-outline-variant/40 divide-y divide-outline-variant/30">
            {recordings.map((rec) => (
              <div key={rec.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">{rec.deviceName}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {formatRecordingTime(rec.startedAt)}
                    {rec.endedAt && ` — ${formatRecordingTime(rec.endedAt)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add / Edit Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Camera' : 'Add Camera'}
        description={
          step === 'system'
            ? (editingId ? 'Update CCTV system details.' : 'Add CCTV system')
            : 'Name each channel before saving.'
        }
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)} size="sm">
              Cancel
            </Button>
            {step === 'channels' && (
              <Button variant="secondary" size="sm" onClick={() => setStep('system')} disabled={saving}>
                Back
              </Button>
            )}
            <Button onClick={step === 'system' ? saveSystem : saveChannels} size="sm" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {step === 'system' ? 'Continue' : 'Save Cameras'}
            </Button>
          </>
        }
      >
        {step === 'system' ? (
          <div className="space-y-4">
          {formError && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">
                Brand
              </label>
              <select
                value={form.brand}
                onChange={(e) =>
                  setForm({
                    ...form,
                    brand: e.target.value as CameraBrand,
                    port: form.port || '554',
                    preferredGridStream: 'sub',
                  })
                }
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs bg-surface-container text-on-surface"
              >
                {BRAND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">
                Device Type
              </label>
              <select
                value={form.deviceType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deviceType: e.target.value as CameraDeviceType,
                    channelCount: e.target.value === 'IP_CAMERA' ? '1' : form.channelCount,
                  })
                }
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs bg-surface-container text-on-surface"
              >
                {DEVICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input label="System Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Clinic CCTV" required />
          <Input label="Location (optional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Main Reception" />

          <div className="pt-2 border-t border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              Recorder Connection
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Host / IP" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="192.168.1.120" />
              <Input label="Port" type="number" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder="554" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={editingId ? 'Leave blank to keep current' : 'admin'} autoComplete="off" />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? 'Leave blank to keep current' : '••••••••'} autoComplete="off" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-outline-variant/30">
            <Input
              label="Number of Channels"
              type="number"
              value={form.deviceType === 'IP_CAMERA' ? '1' : form.channelCount}
              onChange={(e) => setForm({ ...form, channelCount: e.target.value })}
              disabled={form.deviceType === 'IP_CAMERA'}
            />
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider">
                Preferred Grid Stream
              </label>
              <select
                value={form.preferredGridStream}
                onChange={(e) =>
                  setForm({ ...form, preferredGridStream: e.target.value as 'main' | 'sub' })
                }
                className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs bg-surface-container text-on-surface"
              >
                <option value="sub">Sub Stream</option>
                <option value="main">Main Stream</option>
              </select>
            </div>
          </div>

          {form.brand === 'CUSTOM' && (
            <div className="pt-2 border-t border-outline-variant/30">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                Custom RTSP Paths
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  label="Main Stream Path"
                  value={form.customMainPath}
                  onChange={(e) => setForm({ ...form, customMainPath: e.target.value })}
                  placeholder="/custom/main/path"
                />
                <Input
                  label="Sub Stream Path"
                  value={form.customSubPath}
                  onChange={(e) => setForm({ ...form, customSubPath: e.target.value })}
                  placeholder="/custom/sub/path"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-outline-variant/30">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Legacy / Direct URLs (optional)</p>
            <Input label="Snapshot URL" value={form.snapshotUrl} onChange={(e) => setForm({ ...form, snapshotUrl: e.target.value })} placeholder="http://192.168.1.120/snapshot.jpg" className="mb-3" />
            <Input label="Stream URL (MJPEG/HTTP)" value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} placeholder="http://192.168.1.120/video.cgi" />
          </div>

          <div className="pt-2 border-t border-outline-variant/30">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
              Test Connection
            </Button>
            {testStatus && (
              <p className="text-xs text-on-surface-variant mt-2">{testStatus}</p>
            )}
          </div>
          </div>
        ) : (
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-xl">
                {formError}
              </div>
            )}
            <div className="glass-panel rounded-xl border border-outline-variant/40 p-4">
              <p className="text-sm font-bold text-on-surface">{form.name}</p>
              <p className="text-xs text-on-surface-variant mt-1">
                {BRAND_OPTIONS.find((b) => b.value === form.brand)?.label} {form.deviceType}
              </p>
              <p className="text-xs text-emerald-400 mt-2">Connected configuration ready</p>
              <p className="text-xs text-on-surface-variant mt-1">{effectiveChannelCount} Cameras</p>
            </div>

            <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
              {channelDrafts.map((ch, idx) => (
                <div key={ch.channelNumber} className="rounded-xl border border-outline-variant/40 p-3 space-y-2">
                  <p className="text-[11px] font-bold text-on-surface-variant">
                    Channel {String(ch.channelNumber).padStart(2, '0')}
                  </p>
                  <Input
                    label="Name"
                    value={ch.name}
                    onChange={(e) =>
                      setChannelDrafts((prev) =>
                        prev.map((row, i) =>
                          i === idx ? { ...row, name: e.target.value } : row
                        )
                      )
                    }
                    placeholder={`Camera ${ch.channelNumber}`}
                  />
                  <Input
                    label="Location (optional)"
                    value={ch.location}
                    onChange={(e) =>
                      setChannelDrafts((prev) =>
                        prev.map((row, i) =>
                          i === idx ? { ...row, location: e.target.value } : row
                        )
                      )
                    }
                    placeholder="Reception"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
