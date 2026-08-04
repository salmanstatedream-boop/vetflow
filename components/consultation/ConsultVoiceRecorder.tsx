'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';
import { extractConsultationFromAudioAction } from '@/lib/services/consult-voice-actions';
import type { ConsultVoiceExtract } from '@/lib/ai/consult-voice';

type ConsultVoiceRecorderProps = {
  petName: string;
  species: string;
  visitReason?: string;
  onExtracted: (fields: ConsultVoiceExtract, transcript: string) => void;
  disabled?: boolean;
};

export default function ConsultVoiceRecorder({
  petName,
  species,
  visitReason,
  onExtracted,
  disabled,
}: ConsultVoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupported(
      typeof MediaRecorder !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      mediaRef.current = null;
    };
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void processRecording(recorder.mimeType || 'audio/webm');
      };
      mediaRef.current = recorder;
      recorder.start(250);
      setRecording(true);
    } catch {
      setError('Microphone permission denied or unavailable.');
      stopTracks();
    }
  };

  const stopRecording = () => {
    const recorder = mediaRef.current;
    if (!recorder || recorder.state === 'inactive') {
      setRecording(false);
      stopTracks();
      return;
    }
    recorder.stop();
    setRecording(false);
  };

  const processRecording = async (mimeType: string) => {
    setProcessing(true);
    setError(null);
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];
      stopTracks();
      if (blob.size < 800) {
        setError('Recording too short — try again.');
        return;
      }
      const form = new FormData();
      form.append('audio', blob, 'consult.webm');
      form.append('petName', petName);
      form.append('species', species);
      form.append('visitReason', visitReason || '');
      const res = await extractConsultationFromAudioAction(form);
      if (!res.success) {
        setError(res.error);
        return;
      }
      onExtracted(res.fields, res.transcript);
    } finally {
      setProcessing(false);
      mediaRef.current = null;
    }
  };

  if (!supported) {
    return (
      <p className="text-[10px] text-on-surface-variant">
        Voice fill needs a browser with microphone support.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        disabled={disabled || processing}
        onClick={() => (recording ? stopRecording() : void startRecording())}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border transition-colors disabled:opacity-50 ${
          recording
            ? 'border-destructive/50 bg-destructive/15 text-destructive'
            : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
        }`}
      >
        {processing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : recording ? (
          <Square className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}
        {processing ? 'Extracting…' : recording ? 'Stop & fill form' : 'Record to fill SOAP'}
      </button>
      {error ? <p className="text-[10px] text-destructive">{error}</p> : null}
      {!error && !recording && !processing ? (
        <p className="text-[10px] text-on-surface-variant/80">
          Dictate findings — AI maps them into editable fields (Groq).
        </p>
      ) : null}
    </div>
  );
}
