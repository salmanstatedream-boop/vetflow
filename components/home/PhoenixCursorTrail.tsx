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
import { SmoothCursor } from '@/components/ui/smooth-cursor';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';

type Intensity = 'normal' | 'lift';
type CursorMode = 'pointer' | 'click' | 'grab' | 'grabbing';

type CursorTrailApi = {
  setIntensity: (next: Intensity) => void;
  setMode: (next: CursorMode) => void;
};

const CursorTrailContext = createContext<CursorTrailApi | null>(null);

/** Control homepage cursor mode. No-ops outside the provider. */
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

const LAVA_HI = '#FF6B2C';
const LAVA_LO = '#EA580C';
const LAVA_STROKE = '#9A3412';

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

function LavaPointer() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      aria-hidden
      style={{ scale: 0.5 }}
    >
      <g filter="url(#phxLavaPtrShadow)">
        <path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill="url(#phxLavaPtrFill)"
        />
        <path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke={LAVA_STROKE}
          strokeWidth={2.25825}
        />
      </g>
      <defs>
        <linearGradient
          id="phxLavaPtrFill"
          x1="12"
          y1="6"
          x2="38"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={LAVA_HI} />
          <stop offset="1" stopColor={LAVA_LO} />
        </linearGradient>
        <filter
          id="phxLavaPtrShadow"
          x={0.602397}
          y={0.952444}
          width={49.0584}
          height={52.428}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={2.25825} />
          <feGaussianBlur stdDeviation={2.25825} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.98 0 0 0 0 0.35 0 0 0 0 0.08 0 0 0 0.28 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="drop" />
          <feBlend mode="normal" in="SourceGraphic" in2="drop" result="shape" />
        </filter>
      </defs>
    </svg>
  );
}

function HandClick() {
  return (
    <svg viewBox="0 0 20 24" width={20} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClickLava" x1="6" y1="2" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={LAVA_HI} />
          <stop offset="1" stopColor={LAVA_LO} />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandClickLava)"
        stroke={LAVA_STROKE}
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
    <svg viewBox="0 0 22 22" width={22} height={22} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandOpenLava" x1="6" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={LAVA_HI} />
          <stop offset="1" stopColor={LAVA_LO} />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandOpenLava)"
        stroke={LAVA_STROKE}
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
    <svg viewBox="0 0 22 22" width={22} height={22} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="phxHandClosedLava" x1="6" y1="6" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor={LAVA_HI} />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <g
        fill="url(#phxHandClosedLava)"
        stroke={LAVA_STROKE}
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
 * Magic UI SmoothCursor + lava orange mode glyphs for Chaos Desk.
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
      applyAutoMode(e.target);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
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
      <LavaPointer />
    );

  return (
    <CursorTrailContext.Provider value={api}>
      {children}
      {enabled && (
        <SmoothCursor
          enableRotation={mode === 'pointer'}
          cursor={
            <span
              className="phx-cursor-tip"
              data-mode={mode}
              data-intensity={intensity}
              aria-hidden
            >
              {tipGlyph}
            </span>
          }
        />
      )}
    </CursorTrailContext.Provider>
  );
}
