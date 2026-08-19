'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, WifiOff, AlertCircle, Maximize, RotateCcw } from 'lucide-react';

type PlayerState = 'loading' | 'live' | 'offline' | 'error';

interface CameraPlayerProps {
  whepUrl: string | null;
  hlsUrl: string | null;
  fallbackWhepUrl?: string | null;
  fallbackHlsUrl?: string | null;
  fullscreenWhepUrl?: string | null;
  fullscreenHlsUrl?: string | null;
  snapshotUrl: string | null;
  legacyStreamUrl: string | null;
  cameraName: string;
  status: string;
}

export default function CameraPlayer({
  whepUrl,
  hlsUrl,
  fallbackWhepUrl,
  fallbackHlsUrl,
  fullscreenWhepUrl,
  fullscreenHlsUrl,
  snapshotUrl,
  legacyStreamUrl,
  cameraName,
  status,
}: CameraPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PlayerState>(status === 'offline' ? 'offline' : 'loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [snapshotKey, setSnapshotKey] = useState(0);
  const [useFullscreenSource, setUseFullscreenSource] = useState(false);

  const primaryHls = useFullscreenSource ? fullscreenHlsUrl || hlsUrl : hlsUrl;
  const fallbackHls = fallbackHlsUrl || null;
  const hasGatewayStream = Boolean(primaryHls || whepUrl || fallbackWhepUrl || fullscreenWhepUrl);
  const hasLegacy = Boolean(legacyStreamUrl || snapshotUrl);

  const attachHls = useCallback((src: string) => {
    if (!videoRef.current) return;
    videoRef.current.src = src;
    videoRef.current.load();
    videoRef.current.play().catch(() => {
      setErrorMsg(
        'This camera stream may be using an unsupported codec. Configure recorder substream to H.264 and try again.'
      );
      setState('error');
    });
  }, []);

  const attemptPlay = useCallback(() => {
    setState('loading');
    setErrorMsg(null);

    if (hasGatewayStream && primaryHls && videoRef.current) {
      attachHls(primaryHls);
      return;
    }

    if (hasLegacy && (legacyStreamUrl || snapshotUrl)) {
      setState('live');
      return;
    }

    if (status === 'offline' || status === 'unreachable') {
      setState('offline');
    } else {
      setErrorMsg('No stream source configured.');
      setState('error');
    }
  }, [attachHls, hasGatewayStream, hasLegacy, legacyStreamUrl, primaryHls, snapshotUrl, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    attemptPlay();
  }, [attemptPlay]);

  useEffect(() => {
    if (state === 'live' && snapshotUrl && !legacyStreamUrl && !hasGatewayStream) {
      const interval = setInterval(() => setSnapshotKey((k) => k + 1), 8000);
      return () => clearInterval(interval);
    }
  }, [state, snapshotUrl, legacyStreamUrl, hasGatewayStream]);

  const handleFullscreen = () => {
    setUseFullscreenSource(true);
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        setUseFullscreenSource(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const isMjpeg = (url: string) => {
    const l = url.toLowerCase();
    return l.includes('mjpg') || l.includes('mjpeg') || l.includes('video.cgi');
  };

  return (
    <div ref={containerRef} className="relative w-full h-48 bg-black/30 overflow-hidden group">
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {state === 'offline' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <WifiOff className="w-6 h-6" />
          <span className="text-[10px] font-bold">Offline</span>
        </div>
      )}

      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-[10px]">{errorMsg || 'Stream error'}</span>
          <button
            type="button"
            onClick={attemptPlay}
            className="mt-1 text-[10px] text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <RotateCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {state === 'live' && hasGatewayStream && primaryHls && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls
          className="w-full h-full object-cover"
          onError={() => {
            if (fallbackHls && primaryHls !== fallbackHls) {
              attachHls(fallbackHls);
              return;
            }
            setState('error');
            setErrorMsg(
              'This camera stream may be using an unsupported codec. Configure recorder substream to H.264 and try again.'
            );
          }}
          onPlaying={() => setState('live')}
          onCanPlay={() => setState('live')}
        />
      )}

      {state === 'live' && !hasGatewayStream && legacyStreamUrl && isMjpeg(legacyStreamUrl) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={legacyStreamUrl} alt={cameraName} className="w-full h-full object-cover" />
      )}

      {state === 'live' && !hasGatewayStream && legacyStreamUrl && !isMjpeg(legacyStreamUrl) && (
        <video
          src={legacyStreamUrl}
          autoPlay
          muted
          playsInline
          controls
          className="w-full h-full object-cover"
          onError={() => { setState('error'); setErrorMsg('Stream playback failed.'); }}
        />
      )}

      {state === 'live' && !hasGatewayStream && !legacyStreamUrl && snapshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${snapshotUrl}${snapshotUrl.includes('?') ? '&' : '?'}t=${snapshotKey}`}
          alt={cameraName}
          className="w-full h-full object-cover"
        />
      )}

      {(state === 'live' || (state === 'loading' && (hasGatewayStream || hasLegacy))) && (
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Fullscreen"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
