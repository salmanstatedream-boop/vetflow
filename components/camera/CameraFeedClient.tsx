'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  listCameraDevicesAction,
  listCameraRecordingsAction,
  type CameraRecordingRow,
} from '@/lib/services/camera-actions';
import { Loader2, ExternalLink, Video, Film } from 'lucide-react';

type CameraDevice = {
  id: string;
  name: string;
  snapshot_url: string | null;
  stream_url: string | null;
};

function isMjpegUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('mjpg') || lower.includes('mjpeg') || lower.includes('video.cgi');
}

function LiveFeed({ device }: { device: CameraDevice }) {
  const [snapshotKey, setSnapshotKey] = useState(0);
  const feedUrl = device.stream_url || device.snapshot_url;

  useEffect(() => {
    if (!device.snapshot_url || device.stream_url) return;
    const interval = setInterval(() => setSnapshotKey((k) => k + 1), 8000);
    return () => clearInterval(interval);
  }, [device.snapshot_url, device.stream_url]);

  if (!feedUrl) {
    return (
      <div className="h-48 bg-surface-container/20 flex items-center justify-center text-xs text-on-surface-variant">
        No stream or snapshot URL configured
      </div>
    );
  }

  const displayUrl =
    device.stream_url || `${device.snapshot_url}${device.snapshot_url?.includes('?') ? '&' : '?'}t=${snapshotKey}`;

  if (device.stream_url && isMjpegUrl(device.stream_url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={displayUrl} alt={device.name} className="w-full h-48 object-cover bg-black/20" />
    );
  }

  if (device.stream_url) {
    return (
      <video
        src={device.stream_url}
        autoPlay
        muted
        playsInline
        controls
        className="w-full h-48 object-cover bg-black/20"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={displayUrl} alt={device.name} className="w-full h-48 object-cover bg-black/20" />
  );
}

function formatRecordingTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function CameraFeedClient() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [recordings, setRecordings] = useState<CameraRecordingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [devicesRes, recordingsRes] = await Promise.all([
      listCameraDevicesAction(),
      listCameraRecordingsAction(),
    ]);
    if (devicesRes.success) {
      setDevices(devicesRes.devices);
    } else {
      setError(devicesRes.error || 'Failed to load cameras');
    }
    if (recordingsRes.success) {
      setRecordings(recordingsRes.recordings);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-on-surface">Live feeds</h2>
        </div>
        {devices.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-8 text-center">
            <p className="text-sm text-on-surface-variant">
              No cameras configured for this branch.{' '}
              <Link href="/dashboard/settings" className="text-primary font-bold hover:underline">
                Add devices in Settings
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {devices.map((device) => (
              <div
                key={device.id}
                className="rounded-2xl border border-outline-variant/40 overflow-hidden glass-panel"
              >
                <p className="text-xs font-bold p-3 bg-surface-container/40 border-b border-outline-variant/30">
                  {device.name}
                </p>
                <LiveFeed device={device} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-on-surface">Stored recordings</h2>
        </div>
        {recordings.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 text-center">
            <p className="text-sm text-on-surface-variant italic">No stored recordings for this branch yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {recordings.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-outline-variant/40 glass-panel text-xs"
              >
                <div>
                  <span className="font-bold text-on-surface block">{rec.deviceName}</span>
                  <span className="text-on-surface-variant">
                    {formatRecordingTime(rec.startedAt)}
                    {rec.endedAt ? ` — ${formatRecordingTime(rec.endedAt)}` : ' — in progress'}
                  </span>
                </div>
                <a
                  href={rec.storagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/15 text-primary border border-primary/25 font-bold hover:bg-primary/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
