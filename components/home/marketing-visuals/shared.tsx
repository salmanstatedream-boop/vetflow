'use client';

import Link from 'next/link';
import { animate } from 'animejs';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export function GradientPillButton({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-white',
    'bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] hover:opacity-90 transition-opacity phx-focus-ring shrink-0',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, 'cursor-pointer')}>
      {children}
    </button>
  );
}

export function OutlinedPillButton({
  href,
  onClick,
  children,
  tone = 'cyan',
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  tone?: 'cyan' | 'purple' | 'blue' | 'orange';
  className?: string;
}) {
  const tones = {
    cyan: 'border-[#22D3EE]/40 text-[#22D3EE] hover:bg-[#22D3EE]/10',
    purple: 'border-[#8B5CF6]/40 text-[#C4B5FD] hover:bg-[#8B5CF6]/10',
    blue: 'border-[#3B82F6]/40 text-[#93C5FD] hover:bg-[#3B82F6]/10',
    orange: 'border-[#F97316]/40 text-[#FDBA74] hover:bg-[#F97316]/10',
  };

  const classes = cn(
    'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-medium transition-colors phx-focus-ring',
    tones[tone],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(classes, 'cursor-pointer')}>
      {children}
    </button>
  );
}

export function OutlinedModuleIcon({
  icon: Icon,
  tone = 'purple',
  className,
}: {
  icon: LucideIcon;
  tone?: 'purple' | 'blue' | 'orange' | 'green';
  className?: string;
}) {
  const tones = {
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
    orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
    green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
  };

  return (
    <span className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', tones[tone], className)}>
      <Icon className="w-4 h-4" />
    </span>
  );
}

type ConnectorPoint = { x: number; y: number };

export function ConnectorHub({
  lines,
  className,
  hubRadius = 48,
}: {
  lines: ConnectorPoint[];
  className?: string;
  hubRadius?: number;
}) {
  const cx = 50;
  const cy = 50;

  return (
    <svg
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {lines.map((point, i) => {
        const dx = point.x - cx;
        const dy = point.y - cy;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const startX = cx + ux * hubRadius * 0.18;
        const startY = cy + uy * hubRadius * 0.18;
        const endX = point.x - ux * 4;
        const endY = point.y - uy * 4;

        return (
          <line
            key={i}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#8B5CF6"
            strokeOpacity="0.35"
            strokeWidth="0.4"
            strokeDasharray="1.2 1.8"
          />
        );
      })}
    </svg>
  );
}

export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em]">
      {children}
    </span>
  );
}

type HubConnectorOverlayProps = {
  containerRef: RefObject<HTMLElement | null>;
  hubRef: RefObject<HTMLElement | null>;
  cardRefs: RefObject<(HTMLElement | null)[]>;
  className?: string;
  anchor?: 'center' | 'edge';
  animate?: boolean;
  revealed?: boolean;
};

type HubConnectorLine = {
  path: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
};

export function HubConnectorOverlay({
  containerRef,
  hubRef,
  cardRefs,
  className,
  anchor = 'center',
  animate: shouldAnimate = true,
  revealed = false,
}: HubConnectorOverlayProps) {
  const [lines, setLines] = useState<HubConnectorLine[]>([]);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const hasDrawnRef = useRef(false);
  const filterId = useId().replace(/:/g, '');

  const measure = useCallback(() => {
    const container = containerRef.current;
    const hub = hubRef.current;
    const cards = cardRefs.current?.filter(Boolean) as HTMLElement[] | undefined;
    if (!container || !hub || !cards?.length) {
      setLines([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();
    const hubX = hubRect.left + hubRect.width / 2 - containerRect.left;
    const hubY = hubRect.top + hubRect.height / 2 - containerRect.top;
    const hubRadius = Math.min(hubRect.width, hubRect.height) / 2;

    setLines(
      cards.map((card, i) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2 - containerRect.left;
        const cardCenterY = cardRect.top + cardRect.height / 2 - containerRect.top;

        let endX = cardCenterX;
        let endY = cardCenterY;

        if (anchor === 'edge') {
          const cardOnLeft = cardCenterX < hubX;
          endX = cardOnLeft
            ? cardRect.right - containerRect.left
            : cardRect.left - containerRect.left;
          endY = cardCenterY;
        }

        const dx = endX - hubX;
        const dy = endY - hubY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / len;
        const uy = dy / len;

        // Start on hub ring edge; end at vertical midpoint of card inner edge
        const x1 = hubX + ux * hubRadius;
        const y1 = hubY + uy * hubRadius;
        const x2 = endX;
        const y2 = endY;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const perpX = -uy;
        const perpY = ux;
        // Gentler curve so lines land cleanly without overshooting
        const curveOffset = Math.min(40, Math.abs(dx) * 0.12 + Math.abs(dy) * 0.08 + 12);
        const sideSign = cardCenterX < hubX ? 1 : -1;
        const ctrlX = midX + perpX * curveOffset * sideSign * (i % 2 === 0 ? 0.6 : -0.35);
        const ctrlY = midY + perpY * curveOffset * sideSign * (i % 2 === 0 ? 0.6 : -0.35);

        return {
          path: `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`,
          x1,
          y1,
          x2,
          y2,
          color: i % 2 === 0 ? '#8B5CF6' : '#3B82F6',
        };
      }),
    );
  }, [anchor, containerRef, hubRef, cardRefs]);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    window.addEventListener('resize', measure);

    const t1 = window.setTimeout(measure, 0);
    const t2 = window.setTimeout(measure, 150);
    const t3 = window.setTimeout(measure, 400);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [containerRef, measure]);

  useEffect(() => {
    if (!revealed) return;
    const t1 = window.setTimeout(measure, 80);
    const t2 = window.setTimeout(measure, 350);
    const t3 = window.setTimeout(measure, 600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [revealed, measure]);

  useEffect(() => {
    if (!revealed || !shouldAnimate || reducedMotion || !lines.length) {
      if (lines.length) {
        pathRefs.current.forEach((path) => {
          if (!path) return;
          path.style.strokeDasharray = '4 6';
          path.style.strokeDashoffset = '0';
          path.style.opacity = revealed ? '1' : '0.35';
        });
      }
      return;
    }
    if (hasDrawnRef.current) return;

    const leftIndices = lines.map((_, i) => i).filter((i) => lines[i].x2 < lines[i].x1);
    const rightIndices = lines.map((_, i) => i).filter((i) => lines[i].x2 >= lines[i].x1);
    const drawOrder = [...leftIndices, ...rightIndices];

    let completed = 0;
    drawOrder.forEach((lineIndex, orderIndex) => {
      const path = pathRefs.current[lineIndex];
      if (!path) return;

      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      animate(path, {
        strokeDashoffset: [length, 0],
        duration: 700,
        delay: orderIndex * 100,
        ease: 'outExpo',
        onComplete: () => {
          path.style.strokeDasharray = '4 6';
          path.style.strokeDashoffset = '0';
          completed += 1;
          if (completed === drawOrder.length) hasDrawnRef.current = true;
        },
      });
    });
  }, [lines, reducedMotion, revealed, shouldAnimate]);

  if (!lines.length) return null;

  return (
    <svg
      className={cn('absolute inset-0 w-full h-full pointer-events-none hidden lg:block', className)}
      aria-hidden
    >
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {lines.map((line, i) => (
        <g key={i}>
          <path
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={line.path}
            fill="none"
            stroke={line.color}
            strokeOpacity={revealed ? 0.55 : 0.35}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
        </g>
      ))}
    </svg>
  );
}
