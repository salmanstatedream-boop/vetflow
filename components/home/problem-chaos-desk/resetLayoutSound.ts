/**
 * Loud short “chaos → resolve” fanfare for Problem Chaos Desk reset.
 * Web Audio only — no external assets. Safe to call from a click handler.
 *
 * Timing is the source of truth for the reset shuffle animation —
 * keep `RESET_FANFARE` and the desk motion variants in lockstep.
 */

/** Shared cue sheet (seconds) for sound + motion. */
export const RESET_FANFARE = {
  /** Dissonant scramble window before cards settle. */
  chaosEnd: 0.48,
  /** Major chord hits during resolve (absolute from start). */
  chords: [0.5, 0.85, 1.2, 1.55] as const,
  /** Final sparkle / last cards settle. */
  sparkle: 2.0,
  /** Total length before re-entry is allowed. */
  total: 2.6,
} as const;

/** ~31 desk children — stagger so the last wave starts near the sparkle. */
export const RESET_SHUFFLE_CHILD_COUNT = 31;
export const RESET_SETTLE_STAGGER =
  (RESET_FANFARE.sparkle - RESET_FANFARE.chaosEnd) / Math.max(RESET_SHUFFLE_CHILD_COUNT - 1, 1);

let playing = false;

function getAudioContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  {
    freq,
    start,
    duration,
    type = 'sawtooth',
    peak = 0.22,
  }: {
    freq: number;
    start: number;
    duration: number;
    type?: OscillatorType;
    peak?: number;
  }
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noiseBurst(ctx: AudioContext, dest: AudioNode, start: number, duration: number) {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.7;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + duration + 0.02);
}

/** Soft percussive tick locked to a chord hit — helps motion feel scored. */
function chordHit(ctx: AudioContext, dest: AudioNode, start: number, brightness: number) {
  const length = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.22));
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1200 + brightness * 400;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.14 + brightness * 0.03, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(start);
  src.stop(start + 0.08);
}

/** Returns false if skipped (already playing / no AudioContext). */
export function playResetLayoutFanfare(): boolean {
  if (playing || typeof window === 'undefined') return false;

  const ctx = getAudioContext();
  if (!ctx) return false;

  playing = true;
  const master = ctx.createGain();
  // Intentionally loud vs soft UI cues
  master.gain.value = 0.55;
  master.connect(ctx.destination);

  const t0 = ctx.currentTime;
  const { chaosEnd, chords, sparkle, total } = RESET_FANFARE;

  void ctx.resume();

  // Phase 1 — chaos: dissonant stack + noise
  noiseBurst(ctx, master, t0, chaosEnd - 0.08);
  tone(ctx, master, { freq: 180, start: t0, duration: chaosEnd - 0.13, type: 'square', peak: 0.18 });
  tone(ctx, master, {
    freq: 233,
    start: t0 + 0.05,
    duration: chaosEnd - 0.18,
    type: 'sawtooth',
    peak: 0.16,
  });
  tone(ctx, master, {
    freq: 311,
    start: t0 + 0.1,
    duration: chaosEnd - 0.2,
    type: 'square',
    peak: 0.14,
  });
  tone(ctx, master, {
    freq: 415,
    start: t0 + 0.15,
    duration: chaosEnd - 0.23,
    type: 'sawtooth',
    peak: 0.12,
  });

  // Phase 2 — resolve: rising major fanfare on chord grid
  const chordRoots = [262, 330, 392, 523]; // C4 E4 G4 C5-ish
  chords.forEach((offset, i) => {
    const root = chordRoots[i]!;
    const start = t0 + offset;
    const dur = i === chords.length - 1 ? sparkle - offset + 0.35 : chords[i + 1]! - offset + 0.05;
    const peak = 0.2 + i * 0.03;
    chordHit(ctx, master, start, i);
    tone(ctx, master, { freq: root, start, duration: dur, type: 'triangle', peak });
    tone(ctx, master, {
      freq: root * 1.25,
      start: start + 0.02,
      duration: dur,
      type: 'triangle',
      peak: peak * 0.75,
    });
    tone(ctx, master, {
      freq: root * 1.5,
      start: start + 0.04,
      duration: dur,
      type: 'sine',
      peak: peak * 0.55,
    });
  });

  // Final sparkle — last cards settle
  tone(ctx, master, {
    freq: 784,
    start: t0 + sparkle,
    duration: 0.45,
    type: 'sine',
    peak: 0.18,
  });
  tone(ctx, master, {
    freq: 1046,
    start: t0 + sparkle + 0.1,
    duration: 0.4,
    type: 'sine',
    peak: 0.12,
  });

  window.setTimeout(() => {
    playing = false;
    void ctx.close().catch(() => undefined);
  }, total * 1000);

  return true;
}

export function isResetLayoutFanfarePlaying(): boolean {
  return playing;
}
