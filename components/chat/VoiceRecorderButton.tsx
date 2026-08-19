'use client';

import { useEffect, useRef, useState } from 'react';
import { btnPrimaryClass, chipClass } from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';
import { Loader2, Mic, Square, Trash2, Send } from 'lucide-react';

const MAX_MS = 120_000;

function pickRecorderMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

function normalizeAudioMime(raw: string): string {
  const base = raw.split(';')[0]?.trim().toLowerCase() || 'audio/webm';
  if (base.startsWith('audio/webm')) return 'audio/webm';
  if (base.includes('ogg')) return 'audio/ogg';
  if (base.includes('mp4') || base.includes('aac')) return 'audio/mp4';
  if (base.includes('mpeg') || base.includes('mp3')) return 'audio/mpeg';
  if (base.includes('wav')) return 'audio/wav';
  return 'audio/webm';
}

type Props = {
  disabled?: boolean;
  uploading?: boolean;
  resetKey?: string | number;
  onSend: (blob: Blob, durationSec: number, mimeType: string) => void;
};

export default function VoiceRecorderButton({
  disabled,
  uploading,
  resetKey,
  onSend,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [preview, setPreview] = useState<{
    blob: Blob;
    url: string;
    durationSec: number;
    mimeType: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupStream();
      if (preview?.url) URL.revokeObjectURL(preview.url);
      mediaRecorderRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const startRecording = async () => {
    setError(null);
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const durationSec = Math.max(
          0.5,
          (Date.now() - startedAtRef.current) / 1000
        );
        const type = normalizeAudioMime(recorder.mimeType || mimeType || 'audio/webm');
        const blob = new Blob(chunksRef.current, { type });
        cleanupStream();
        setRecording(false);
        stopTimer();
        if (blob.size < 200) {
          setError('Recording too short');
          return;
        }
        setPreview({
          blob,
          url: URL.createObjectURL(blob),
          durationSec,
          mimeType: type,
        });
      };

      mediaRecorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setRecording(true);
      recorder.start(200);
      timerRef.current = setInterval(() => {
        const next = Date.now() - startedAtRef.current;
        setElapsedMs(next);
        if (next >= MAX_MS) {
          recorder.stop();
        }
      }, 200);
    } catch {
      setError('Microphone permission is required');
      cleanupStream();
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const discardPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const formatElapsed = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  if (preview) {
    return (
      <div className="flex items-center gap-2">
        <audio src={preview.url} controls className="h-9 max-w-[140px]" />
        <button
          type="button"
          onClick={discardPreview}
          disabled={uploading}
          className={cn(chipClass, 'h-11 w-11 !px-0 justify-center')}
          aria-label="Discard voice note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={uploading}
          onClick={() =>
            onSend(
              preview.blob,
              preview.durationSec,
              normalizeAudioMime(preview.mimeType)
            )
          }
          className={cn(btnPrimaryClass, 'h-11 w-11 !px-0 justify-center')}
          aria-label="Send voice note"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className={cn(
            btnPrimaryClass,
            'h-11 px-3 gap-2 !bg-destructive hover:!brightness-110'
          )}
          aria-label="Stop recording"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span className="text-xs tabular-nums font-mono">
            {formatElapsed(elapsedMs)}
          </span>
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => void startRecording()}
          className={cn(chipClass, 'h-11 w-11 !px-0 justify-center')}
          aria-label="Record voice note"
          title="Record voice note"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}
      {error && (
        <p className="text-[10px] text-destructive max-w-[10rem] text-right">{error}</p>
      )}
    </div>
  );
}
