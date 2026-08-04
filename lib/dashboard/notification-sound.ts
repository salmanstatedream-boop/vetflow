/**
 * Slack-style knock/brush notification via Web Audio — no asset files.
 * Browsers block audio until a user gesture; call unlockNotificationAudio() from shell input.
 */

let sharedCtx: AudioContext | null = null;
let lastPlayedAt = 0;

const MIN_INTERVAL_MS = 1200;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      sharedCtx = new Ctx();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

/** Call from a user gesture so later poll-driven chimes can play. */
export function unlockNotificationAudio(): void {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}

function knock(
  ctx: AudioContext,
  dest: AudioNode,
  {
    freq,
    start,
    duration,
    peak,
    type = 'triangle',
  }: {
    freq: number;
    start: number;
    duration: number;
    peak: number;
    type?: OscillatorType;
  }
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.55, 80), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function brushNoise(ctx: AudioContext, dest: AudioNode, start: number, duration: number, peak: number) {
  const samples = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    const env = 1 - i / samples;
    data[i] = (Math.random() * 2 - 1) * env * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1800, start);
  filter.Q.setValueAtTime(0.7, start);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + duration + 0.02);
}

/** Louder Slack-like knock/brush for new dashboard notifications. */
export function playNotificationBell(): boolean {
  if (typeof window === 'undefined') return false;
  if (document.visibilityState !== 'visible') return false;

  const now = Date.now();
  if (now - lastPlayedAt < MIN_INTERVAL_MS) return false;

  const ctx = getCtx();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    // Near-full output — previous soft chime was ~0.35 × 0.12 peaks
    master.gain.setValueAtTime(0.95, t0);
    master.connect(ctx.destination);

    // Brush + double knock (Slack knock_brush character)
    brushNoise(ctx, master, t0, 0.09, 0.55);
    knock(ctx, master, { freq: 520, start: t0, duration: 0.14, peak: 0.72, type: 'triangle' });
    knock(ctx, master, { freq: 780, start: t0 + 0.07, duration: 0.16, peak: 0.58, type: 'triangle' });
    knock(ctx, master, { freq: 1100, start: t0 + 0.04, duration: 0.1, peak: 0.28, type: 'sine' });

    lastPlayedAt = now;
    return true;
  } catch {
    return false;
  }
}
