'use client';

import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Heart, Network, PawPrint, Smile, type LucideIcon } from 'lucide-react';
import { CLINIC_TYPES, PLATFORM_EXPANSION } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export type ClinicId = (typeof CLINIC_TYPES)[number]['id'];

const ICONS: Record<ClinicId, LucideIcon> = {
  vet: PawPrint,
  dental: Smile,
  general: Heart,
  specialty: Network,
};

export const TONE_COLORS = {
  cyan: '#22D3EE',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  orange: '#F97316',
} as const;

/** Start angles (0 = top). Shared orbit period keeps the formation intact. */
const NODE_LAYOUT: Record<ClinicId, { startDeg: number }> = {
  vet: { startDeg: 315 },
  dental: { startDeg: 45 },
  general: { startDeg: 225 },
  specialty: { startDeg: 135 },
};

const ORBIT_DURATION_SEC = 48;

type Props = {
  selectedId: ClinicId;
  onSelect: (id: ClinicId) => void;
  activeBallRef?: RefObject<HTMLElement | null>;
  className?: string;
};

export default function PlatformExpansionOrbitMap({
  selectedId,
  onSelect,
  activeBallRef,
  className,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  /** Pause only while a specialty ball is hovered, focused, or held after click */
  const [paused, setPaused] = useState(false);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      className={cn(
        'phx-expansion-orbit-stage relative mx-auto aspect-square w-full max-w-[520px] min-h-[340px] sm:min-h-[440px]',
        className,
      )}
      data-orbit-paused={paused ? 'true' : 'false'}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,rgba(59,130,246,0.06)_42%,transparent_70%)]"
      />

      {/* Rings */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-[4%] rounded-full border border-dashed border-white/[0.12]',
          !reducedMotion && 'phx-expansion-orbit-spin',
        )}
        style={!reducedMotion ? { animationDuration: '64s' } : undefined}
      />
      <div
        aria-hidden
        className="absolute inset-[14%] rounded-full border border-dashed border-[#8B5CF6]/20"
      />
      <div
        aria-hidden
        className={cn(
          'absolute inset-[24%] rounded-full border border-dashed border-[#22D3EE]/18',
          !reducedMotion && 'phx-expansion-orbit-spin',
        )}
        style={
          !reducedMotion
            ? { animationDuration: '80s', animationDirection: 'reverse' }
            : undefined
        }
      />

      {/* Center hub — fixed */}
      <div className="absolute left-1/2 top-1/2 z-10 flex w-[42%] max-w-[180px] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
        <div className="relative mb-3 flex h-[88px] w-[88px] items-center justify-center sm:h-[100px] sm:w-[100px]">
          <div
            aria-hidden
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.4)_0%,rgba(59,130,246,0.12)_45%,transparent_72%)] blur-[2px]"
          />
          <div
            aria-hidden
            className="absolute inset-[10%] rounded-full border border-[#22D3EE]/25 bg-[#050B18]/70 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
          />
          <div className="relative h-14 w-14 sm:h-16 sm:w-16">
            <Image
              src="/phoenix-logo-mark.png"
              alt=""
              fill
              className="object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.55)]"
              sizes="64px"
            />
          </div>
        </div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#F8FAFC] sm:text-[11px]">
          {PLATFORM_EXPANSION.hub.brand}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold text-[#22D3EE] sm:text-xs">
          {PLATFORM_EXPANSION.hub.title}
        </p>
        <p className="mt-1.5 max-w-[140px] text-[9px] leading-snug text-[#64748B] sm:text-[10px]">
          {PLATFORM_EXPANSION.hub.tagline}
        </p>
      </div>

      {/* Orbiting specialty balls */}
      <div className="absolute inset-[8%] z-20">
        {CLINIC_TYPES.map((clinic) => {
          const { startDeg } = NODE_LAYOUT[clinic.id];
          const Icon = ICONS[clinic.id];
          const color = TONE_COLORS[clinic.tone];
          const isActive = clinic.id === selectedId;
          const delaySec = -((startDeg / 360) * ORBIT_DURATION_SEC);

          const ballInner = (
            <>
              <span
                ref={isActive ? activeBallRef : undefined}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] bg-[#070D1C]/95 sm:h-[52px] sm:w-[52px]"
                style={{
                  borderColor: color,
                  color,
                  boxShadow: isActive
                    ? `0 0 0 4px ${color}22, 0 0 34px ${color}75`
                    : `0 0 18px ${color}45`,
                }}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-[-7px] rounded-full border opacity-70"
                    style={{ borderColor: `${color}70` }}
                  />
                )}
                <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.2} />
              </span>
              <span className="flex flex-col items-center text-center">
                <span className="text-[10px] font-semibold leading-tight text-[#F8FAFC] sm:text-[12px]">
                  {clinic.title}
                </span>
                <span
                  className="mt-1 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[7px] font-mono uppercase tracking-wider sm:text-[8px]"
                  style={{
                    borderColor: `${color}66`,
                    backgroundColor: `${color}14`,
                    color,
                    boxShadow: isActive ? `0 0 12px ${color}33` : undefined,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
                  {clinic.statusBadge}
                </span>
              </span>
            </>
          );

          const ball = (
            <button
              type="button"
              aria-pressed={isActive}
              aria-label={`${clinic.title}, ${clinic.statusBadge}`}
              onClick={() => {
                pause();
                onSelect(clinic.id);
              }}
              onPointerEnter={pause}
              onPointerLeave={resume}
              onFocus={pause}
              onBlur={resume}
              className={cn(
                'group flex w-[118px] flex-col items-center gap-1.5 rounded-full phx-focus-ring sm:w-[132px]',
                isActive && 'scale-[1.05]',
              )}
            >
              {ballInner}
            </button>
          );

          if (reducedMotion) {
            const rad = ((startDeg - 90) * Math.PI) / 180;
            const left = 50 + 50 * Math.cos(rad);
            const top = 50 + 50 * Math.sin(rad);
            return (
              <div
                key={clinic.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                {ball}
              </div>
            );
          }

          return (
            <div
              key={clinic.id}
              className="pointer-events-none absolute inset-0 phx-expansion-orbit-spin"
              style={{
                animationDuration: `${ORBIT_DURATION_SEC}s`,
                animationDelay: `${delaySec}s`,
              }}
            >
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="pointer-events-auto phx-expansion-orbit-counter"
                  style={{
                    animationDuration: `${ORBIT_DURATION_SEC}s`,
                    animationDelay: `${delaySec}s`,
                  }}
                >
                  {ball}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Straight dashed line from active ball → detail card (tracks while orbiting). */
export function PlatformExpansionConnector({
  containerRef,
  ballRef,
  cardRef,
  color,
  enabled = true,
}: {
  containerRef: RefObject<HTMLElement | null>;
  ballRef: RefObject<HTMLElement | null>;
  cardRef: RefObject<HTMLElement | null>;
  color: string;
  enabled?: boolean;
}) {
  const lineRef = useRef<SVGLineElement>(null);
  const startDotRef = useRef<SVGCircleElement>(null);
  const endDotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    const update = () => {
      const container = containerRef.current;
      const ball = ballRef.current;
      const card = cardRef.current;
      const line = lineRef.current;
      if (!container || !ball || !card || !line) {
        raf = requestAnimationFrame(update);
        return;
      }

      const c = container.getBoundingClientRect();
      const b = ball.getBoundingClientRect();
      const t = card.getBoundingClientRect();

      const x1 = b.left + b.width / 2 - c.left;
      const y1 = b.top + b.height / 2 - c.top;
      // Aim at the vertical center of the card's left edge
      const x2 = t.left - c.left;
      const y2 = t.top + t.height / 2 - c.top;

      line.setAttribute('x1', String(x1));
      line.setAttribute('y1', String(y1));
      line.setAttribute('x2', String(x2));
      line.setAttribute('y2', String(y2));
      line.setAttribute('stroke', color);

      startDotRef.current?.setAttribute('cx', String(x1));
      startDotRef.current?.setAttribute('cy', String(y1));
      startDotRef.current?.setAttribute('fill', color);
      endDotRef.current?.setAttribute('cx', String(x2));
      endDotRef.current?.setAttribute('cy', String(y2));
      endDotRef.current?.setAttribute('fill', color);

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [ballRef, cardRef, color, containerRef, enabled]);

  if (!enabled) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[15] h-full w-full overflow-visible"
    >
      <line
        ref={lineRef}
        x1={0}
        y1={0}
        x2={0}
        y2={0}
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.75}
        strokeDasharray="5 5"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <circle ref={startDotRef} r={3.5} fill={color} fillOpacity={0.95} />
      <circle ref={endDotRef} r={3} fill={color} fillOpacity={0.9} />
    </svg>
  );
}

export { ICONS as CLINIC_ICONS };
