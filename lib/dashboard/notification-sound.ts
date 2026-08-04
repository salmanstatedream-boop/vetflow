/**
 * Soft notification bell via Web Audio — no asset files.
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

function tone(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  start: number,
  duration: number,
  peak: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Short two-tone “ding” for new dashboard notifications. */
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
    master.gain.setValueAtTime(0.35, t0);
    master.connect(ctx.destination);

    // Soft bell: fundamental + brief upper partial
    tone(ctx, master, 880, t0, 0.22, 0.12);
    tone(ctx, master, 1318.5, t0 + 0.06, 0.28, 0.08);
    tone(ctx, master, 1760, t0 + 0.1, 0.35, 0.04);

    lastPlayedAt = now;
    return true;
  } catch {
    return false;
  }
}
