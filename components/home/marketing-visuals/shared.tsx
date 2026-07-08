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
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-white',
        'bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] hover:opacity-90 transition-opacity phx-focus-ring shrink-0',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function OutlinedPillButton({
  href,
  children,
  tone = 'cyan',
  className,
}: {
  href: string;
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

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[11px] font-medium transition-colors phx-focus-ring',
        tones[tone],
        className,
      )}
    >
      {children}
    </Link>
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
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
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

        const x1 = hubX + ux * (hubRadius * 0.92);
        const y1 = hubY + uy * (hubRadius * 0.92);
        const x2 = endX - ux * (anchor === 'edge' ? 2 : 8);
        const y2 = endY - uy * (anchor === 'edge' ? 2 : 8);

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const perpX = -uy;
        const perpY = ux;
        const curveOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.28 + 24;
        const ctrlX = midX + perpX * curveOffset * (i % 2 === 0 ? 1 : -1);
        const ctrlY = midY + perpY * curveOffset * (i % 2 === 0 ? 1 : -1);

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

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [containerRef, measure]);

  useEffect(() => {
    if (!revealed || !shouldAnimate || reducedMotion || !lines.length) {
      if (lines.length) {
        pathRefs.current.forEach((path) => {
          if (!path) return;
          path.style.strokeDasharray = '4 6';
          path.style.strokeDashoffset = '0';
          path.style.opacity = revealed ? '1' : '0.35';
        });
        nodeRefs.current.forEach((node) => {
          if (node) node.style.opacity = revealed ? '1' : '0.5';
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

      const hubNode = nodeRefs.current[lineIndex * 2];
      const cardNode = nodeRefs.current[lineIndex * 2 + 1];
      if (hubNode) hubNode.style.opacity = '0';
      if (cardNode) cardNode.style.opacity = '0';

      animate(path, {
        strokeDashoffset: [length, 0],
        duration: 700,
        delay: orderIndex * 100,
        ease: 'outExpo',
        onComplete: () => {
          path.style.strokeDasharray = '4 6';
          path.style.strokeDashoffset = '0';
          if (hubNode) {
            animate(hubNode, { opacity: [0, 0.9], duration: 300, ease: 'outExpo' });
          }
          if (cardNode) {
            animate(cardNode, { opacity: [0, 0.85], duration: 300, delay: 80, ease: 'outExpo' });
          }
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
          />
          <circle
            ref={(el) => {
              nodeRefs.current[i * 2] = el;
            }}
            cx={line.x1}
            cy={line.y1}
            r="4"
            fill={line.color}
            filter={`url(#${filterId})`}
            opacity={revealed ? 0.9 : 0.5}
          />
          <circle
            ref={(el) => {
              nodeRefs.current[i * 2 + 1] = el;
            }}
            cx={line.x2}
            cy={line.y2}
            r="3.5"
            fill={line.color}
            filter={`url(#${filterId})`}
            opacity={revealed ? 0.85 : 0.45}
          />
        </g>
      ))}
    </svg>
  );
}
