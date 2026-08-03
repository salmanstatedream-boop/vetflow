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
    <svg viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxPtrBody" x1="1" y1="1" x2="12" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path
        d="M1.2 1.1 L1.2 15.4 L5 11.8 L8.2 18.6 L11 17.2 L7.7 10.3 L13.2 10.3 Z"
        fill="url(#phxPtrBody)"
        stroke="#0E7490"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M2.4 3 L2.55 12.2 L5.1 9.7"
        stroke="#ECFEFF"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

function HandClick() {
  return (
    <svg viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClick" x1="6" y1="2" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandClick)"
        stroke="#0E7490"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8.2 11.2 V3.4 a1.25 1.25 0 0 1 2.5 0 V11.2" />
        <path d="M10.7 11.6 V8.2 a1.1 1.1 0 0 1 2.2 0 V12" />
        <path d="M12.9 12 V9.4 a1 1 0 0 1 2 0 V13.2 c0 2.4 -1.55 4.4 -3.85 4.4 H9.2 c-2 0 -3.7 -1.3 -4.35 -3.2 L4.1 12.2 A1.15 1.15 0 0 1 6 10.9 H8.2" />
      </g>
    </svg>
  );
}

function HandOpen() {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandOpen" x1="6" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandOpen)"
        stroke="#0E7490"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.4 10.2 V6.6 a1.15 1.15 0 0 1 2.3 0 V10.2" />
        <path d="M9.7 10.2 V5.6 a1.15 1.15 0 0 1 2.3 0 V10.2" />
        <path d="M12 10.2 V6.2 a1.15 1.15 0 0 1 2.3 0 V10.2" />
        <path d="M14.3 10.2 V7.6 a1.15 1.15 0 0 1 2.3 0 V12 c0 2.6 -1.65 4.7 -4.05 4.7 H9.9 c-2.2 0 -4 -1.45 -4.7 -3.5 L4.4 10.6 A1.2 1.2 0 0 1 6.3 9.3 H7.4" />
      </g>
    </svg>
  );
}

function HandClosed() {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClosed" x1="6" y1="6" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67E8F9" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandClosed)"
        stroke="#0E7490"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.2 11.2 V9.2 a1.05 1.05 0 0 1 2.1 0 V11.2" />
        <path d="M9.3 11.2 V8.5 a1.05 1.05 0 0 1 2.1 0 V11.2" />
        <path d="M11.4 11.2 V8.7 a1.05 1.05 0 0 1 2.1 0 V11.2" />
        <path d="M13.5 11.2 V10 a1.05 1.05 0 0 1 2.1 0 v2.8 c0 2.2 -1.4 4 -3.5 4 H10 c-1.9 0 -3.5 -1.3 -4.05 -3.05 L5.4 11.4 A1.1 1.1 0 0 1 7.1 10.2 H7.2" />
      </g>
    </svg>
  );
}

/**
 * Compact cyan pointer tip + mode API for Chaos Desk.
 * Tube trails come from TubesCursor (threejs-components).
 * Disabled on touch / reduced-motion.
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

  const tipRef = useRef<HTMLSpanElement>(null);
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
      applyAutoMode(e.target);
    };

    const onLeave = () => {
      activeRef.current = false;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const tick = () => {
      const hand = modeRef.current !== 'pointer';
      const target = targetRef.current;
      const tip = tipRef.current;
      if (tip) {
        const ox = hand ? -7 : -1.2;
        const oy = hand ? -4 : -1.1;
        tip.style.transform = `translate3d(${target.x + ox}px, ${target.y + oy}px, 0)`;
        tip.style.opacity = activeRef.current ? '1' : '0';
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
        <span
          ref={tipRef}
          className="phx-cursor-tip"
          data-mode={mode}
          data-intensity={intensity}
          aria-hidden
        >
          {tipGlyph}
        </span>
      )}
    </CursorTrailContext.Provider>
  );
}
