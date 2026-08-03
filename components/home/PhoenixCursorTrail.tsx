'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

type Intensity = 'normal' | 'lift';
type CursorMode = 'pointer' | 'click' | 'grab' | 'grabbing';

type CursorTrailApi = {
  setIntensity: (next: Intensity) => void;
  setMode: (next: CursorMode) => void;
};

const CursorTrailContext = createContext<CursorTrailApi | null>(null);

/** Control homepage cursor trail / mode. No-ops outside the provider. */
export function usePhoenixCursorTrail(): CursorTrailApi {
  return (
    useContext(CursorTrailContext) ?? {
      setIntensity: () => undefined,
      setMode: () => undefined,
    }
  );
}

const COLORS = ['#22D3EE', '#38BDF8', '#3B82F6', '#67E8F9'] as const;
const TRAIL_COUNT = 9;

const CLICKABLE_SEL = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  'summary',
  'label[for]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[data-phx-clickable]',
].join(',');

type Point = { x: number; y: number };

function useFinePointerDesktop(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const hover = window.matchMedia('(hover: hover)');
    const update = () => setOk(fine.matches && hover.matches);
    update();
    fine.addEventListener('change', update);
    hover.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      hover.removeEventListener('change', update);
    };
  }, []);

  return ok;
}

function PointerArrow() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxPtrBody" x1="4" y1="2" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5F3FC" />
          <stop offset="0.4" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="phxPtrEdge" x1="4" y1="2" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFEFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.15" />
        </linearGradient>
        <filter id="phxPtrSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#022c3a" floodOpacity="0.45" />
        </filter>
      </defs>
      {/* Soft contact glow under tip */}
      <circle cx="5" cy="5" r="3.2" fill="#22D3EE" opacity="0.22" />
      <path
        d="M4.2 2.4 C3.7 2.15 3.15 2.55 3.2 3.15 L4.05 20.4 C4.1 21.15 5.05 21.4 5.5 20.8 L9.35 15.95 L13.9 26.05 C14.15 26.6 14.9 26.7 15.3 26.25 L18.05 23.2 C18.45 22.75 18.35 22 17.85 21.7 L12.95 18.7 L18.9 17.55 C19.65 17.4 19.85 16.4 19.2 16 L4.2 2.4 Z"
        fill="url(#phxPtrBody)"
        stroke="#0E7490"
        strokeWidth="1.15"
        strokeLinejoin="round"
        filter="url(#phxPtrSoft)"
      />
      <path
        d="M5.1 4.6 L5.7 16.8 L9.1 12.7"
        stroke="url(#phxPtrEdge)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function HandClick() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClick" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5F3FC" />
          <stop offset="0.45" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <filter id="phxHandClickSoft" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#022c3a" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Pointing hand — index finger up (link / click affordance) */}
      <g
        fill="url(#phxHandClick)"
        stroke="#0E7490"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#phxHandClickSoft)"
      >
        <path d="M13.2 14.5 V5.6 a1.55 1.55 0 0 1 3.1 0 V14.5" />
        <path d="M16.3 15.2 V10.2 a1.4 1.4 0 0 1 2.8 0 V15.4" />
        <path d="M19.1 15.6 V11.4 a1.35 1.35 0 0 1 2.7 0 V16" />
        <path d="M21.8 16.2 V13.2 a1.3 1.3 0 0 1 2.6 0 V18.2 c0 3.4 -2.2 6.2 -5.4 6.2 h-3.1 c-2.9 0 -5.3 -1.9 -6.2 -4.6 L8.4 16.2 A1.55 1.55 0 0 1 10.9 14.5 H13.2" />
      </g>
      <path
        d="M14.5 8.2 V6.4"
        stroke="#ECFEFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function HandOpen() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandOpen" x1="8" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5F3FC" />
          <stop offset="0.45" stopColor="#22D3EE" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
        <filter id="phxHandSoft" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#022c3a" floodOpacity="0.4" />
        </filter>
      </defs>
      <g
        fill="url(#phxHandOpen)"
        stroke="#0E7490"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#phxHandSoft)"
      >
        <path d="M11.2 14.2 V8.8 a1.55 1.55 0 0 1 3.1 0 V14.2" />
        <path d="M14.3 14.2 V7.4 a1.55 1.55 0 0 1 3.1 0 V14.2" />
        <path d="M17.4 14.2 V8 a1.55 1.55 0 0 1 3.1 0 V14.2" />
        <path d="M20.5 14.2 V10.2 a1.55 1.55 0 0 1 3.1 0 V16.4 c0 3.7 -2.35 6.7 -5.7 6.7 H15.2 c-3.1 0 -5.7 -2.1 -6.7 -5 L7.1 14.6 A1.65 1.65 0 0 1 9.7 13 H11.2" />
      </g>
      <path
        d="M12.4 11.2 V9.4 M15.5 10.6 V8.2 M18.6 11 V9"
        stroke="#ECFEFF"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

function HandClosed() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClosed" x1="8" y1="10" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <filter id="phxHandClosedSoft" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#022c3a" floodOpacity="0.4" />
        </filter>
      </defs>
      <g
        fill="url(#phxHandClosed)"
        stroke="#0E7490"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#phxHandClosedSoft)"
      >
        <path d="M10.6 16 V13.2 a1.45 1.45 0 0 1 2.9 0 V16" />
        <path d="M13.5 16 V12.2 a1.45 1.45 0 0 1 2.9 0 V16" />
        <path d="M16.4 16 V12.4 a1.45 1.45 0 0 1 2.9 0 V16" />
        <path d="M19.3 16 v-1.6 a1.45 1.45 0 0 1 2.9 0 v4 c0 3.1 -2 5.6 -4.9 5.6 h-2.9 c-2.7 0 -4.9 -1.85 -5.7 -4.3 L8.4 16.2 A1.5 1.5 0 0 1 10.7 14.6 H10.6" />
      </g>
    </svg>
  );
}

/**
 * Sophisticated cyan pointer + bubble trail for the marketing homepage.
 * Chaos Desk swaps to open / closed hand modes. Disabled on touch / reduced-motion.
 */
export default function PhoenixCursorTrail({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointerDesktop();
  const enabled = finePointer && !reducedMotion;

  const [intensity, setIntensityState] = useState<Intensity>('normal');
  const [mode, setModeState] = useState<CursorMode>('pointer');
  const intensityRef = useRef<Intensity>('normal');
  const modeRef = useRef<CursorMode>('pointer');
  /** Desk grab/grabbing locks mode; otherwise auto pointer/click from hit-target. */
  const forcedModeRef = useRef<'grab' | 'grabbing' | null>(null);

  const setIntensity = useCallback((next: Intensity) => {
    intensityRef.current = next;
    setIntensityState(next);
  }, []);

  const setMode = useCallback((next: CursorMode) => {
    if (next === 'grab' || next === 'grabbing') {
      forcedModeRef.current = next;
    } else {
      forcedModeRef.current = null;
    }
    modeRef.current = next;
    setModeState(next);
  }, []);

  const api = useMemo(() => ({ setIntensity, setMode }), [setIntensity, setMode]);

  const applyAutoMode = useCallback((el: EventTarget | null) => {
    if (forcedModeRef.current) {
      const forced = forcedModeRef.current;
      if (modeRef.current !== forced) {
        modeRef.current = forced;
        setModeState(forced);
      }
      return;
    }
    const node = el instanceof Element ? el : null;
    const next: CursorMode = node?.closest(CLICKABLE_SEL) ? 'click' : 'pointer';
    if (modeRef.current !== next) {
      modeRef.current = next;
      setModeState(next);
    }
  }, []);

  const layerRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const bubbleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointsRef = useRef<Point[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -100, y: -100 })),
  );
  const targetRef = useRef<Point>({ x: -100, y: -100 });
  const activeRef = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    document.querySelector('.phx-page')?.classList.add('phx-cursor-active');
    return () => {
      document.querySelector('.phx-page')?.classList.remove('phx-cursor-active');
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      activeRef.current = true;
      if (layerRef.current) layerRef.current.dataset.active = '1';
      applyAutoMode(e.target);
    };

    const onLeave = () => {
      activeRef.current = false;
      if (layerRef.current) layerRef.current.dataset.active = '0';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const tick = () => {
      const lift = intensityRef.current === 'lift' || modeRef.current === 'click';
      const hand = modeRef.current !== 'pointer';
      const points = pointsRef.current;
      const target = targetRef.current;

      const headLerp = lift ? 0.42 : 0.28;
      const tailLerp = lift ? 0.22 : 0.14;

      points[0]!.x += (target.x - points[0]!.x) * headLerp;
      points[0]!.y += (target.y - points[0]!.y) * headLerp;

      for (let i = 1; i < TRAIL_COUNT; i++) {
        const prev = points[i - 1]!;
        const cur = points[i]!;
        const t = tailLerp * (1 - i * 0.03);
        cur.x += (prev.x - cur.x) * t;
        cur.y += (prev.y - cur.y) * t;
      }

      const tip = tipRef.current;
      if (tip) {
        const ox = hand ? -10 : -4;
        const oy = hand ? -8 : -3;
        tip.style.transform = `translate3d(${target.x + ox}px, ${target.y + oy}px, 0)`;
        tip.style.opacity = activeRef.current ? '1' : '0';
      }

      const baseSize = lift ? 24 : 15;
      const opacityBoost = lift ? 1.3 : 1;

      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = bubbleRefs.current[i];
        if (!el) continue;
        const p = points[i]!;
        const t = i / (TRAIL_COUNT - 1);
        const size = baseSize * (1 - t * 0.55);
        const opacity = activeRef.current ? (0.5 - t * 0.4) * opacityBoost : 0;
        el.style.transform = `translate3d(${p.x - size / 2}px, ${p.y - size / 2}px, 0) scale(${1 - t * 0.35})`;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [applyAutoMode, enabled]);

  const tipGlyph =
    mode === 'grab' ? (
      <HandOpen />
    ) : mode === 'grabbing' ? (
      <HandClosed />
    ) : mode === 'click' ? (
      <HandClick />
    ) : (
      <PointerArrow />
    );

  return (
    <CursorTrailContext.Provider value={api}>
      {children}
      {enabled && (
        <>
          <span
            ref={tipRef}
            className="phx-cursor-tip"
            data-mode={mode}
            data-intensity={intensity}
            aria-hidden
          >
            {tipGlyph}
          </span>
          <div
            ref={layerRef}
            className="phx-cursor-trail"
            data-active="0"
            data-intensity={intensity}
            data-mode={mode}
            aria-hidden
          >
            {Array.from({ length: TRAIL_COUNT }, (_, i) => {
              const color = COLORS[i % COLORS.length]!;
              return (
                <span
                  key={i}
                  ref={(node) => {
                    bubbleRefs.current[i] = node;
                  }}
                  className="phx-cursor-bubble"
                  style={{
                    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                    boxShadow: `0 0 18px ${color}55`,
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </CursorTrailContext.Provider>
  );
}
