'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  listCameraDevicesAction,
  type CameraDevicePublic,
} from '@/lib/services/camera-actions';
import { Loader2, Video, ExternalLink } from 'lucide-react';

export default function CameraDevicesClient() {
  const [devices, setDevices] = useState<CameraDevicePublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCameraDevicesAction().then((res) => {
      if (res.success) setDevices(res.devices);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin" />;

  return (
    <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 space-y-4">
      <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
        <Video className="w-4 h-4 text-primary" />
        Camera devices
      </h3>
      <p className="text-xs text-on-surface-variant">
        {devices.length} camera{devices.length !== 1 ? 's' : ''} configured.{' '}
        <Link href="/dashboard/camera" className="text-primary font-bold hover:underline inline-flex items-center gap-1">
          Manage cameras <ExternalLink className="w-3 h-3" />
        </Link>
      </p>

      {devices.length > 0 && (
        <ul className="space-y-2 text-xs">
          {devices.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-outline-variant/40"
            >
              <div className="min-w-0">
                <span className="font-bold">{d.name}</span>
                {d.location && (
                  <span className="text-[10px] text-on-surface-variant block truncate">
                    {d.location}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                d.status === 'online' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                {d.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
