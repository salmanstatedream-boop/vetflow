'use client';

import { animate, createTimeline, stagger, svg } from 'animejs';
import { HeartPulse, Smile, Sparkles, Stethoscope } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PHOENIX_NODES } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';
import PhoenixLogoMark from './PhoenixLogoMark';

const GRID_SIZE = 10;
const CENTER = { x: 200, y: 200 };
const VIEWBOX = 400;

const NODE_ICONS = {
  stethoscope: Stethoscope,
  smile: Smile,
  'heart-pulse': HeartPulse,
  sparkles: Sparkles,
} as const;

function bezierPath(cx: number, cy: number, nx: number, ny: number) {
  const mx = (cx + nx) / 2;
  const my = (cy + ny) / 2;
  const dx = nx - cx;
  const dy = ny - cy;
  const ctrlX = mx - dy * 0.18;
  const ctrlY = my + dx * 0.18;
  return `M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${nx} ${ny}`;
}

function pct(value: number) {
  return `${(value / VIEWBOX) * 100}%`;
}

export default function AnimatedPhoenixGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const activeNodeData = PHOENIX_NODES.find((n) => n.id === activeNode);

  const runIntro = useCallback(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;

    const dots = root.querySelectorAll('[data-phx-dot]');
    const lines = root.querySelectorAll('[data-phx-line]');
    const core = root.querySelector('[data-phx-core]');
    const nodes = root.querySelectorAll('[data-phx-node]');
    const rings = root.querySelectorAll('[data-phx-ring]');

    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(dots, {
      opacity: [0, 0.45],
      scale: [0, 1],
      duration: 500,
      delay: stagger(25, { grid: [GRID_SIZE, GRID_SIZE], from: 'center' }),
    });

    lines.forEach((line) => {
      const drawable = svg.createDrawable(line as SVGPathElement);
      tl.add(
        drawable,
        { draw: ['0 0', '0 1', '1 1'], duration: 1000, ease: 'inOut(3)' },
        '-=400',
      );
    });

    if (rings.length) {
      tl.add(
        rings,
        { opacity: [0, 1], scale: [0.85, 1], duration: 700 },
        '-=600',
      );
    }

    if (core) {
      tl.add(
        core,
        { scale: [0.5, 1], opacity: [0, 1], duration: 700, ease: 'outElastic(1, .55)' },
        '-=450',
      );
    }

    tl.add(
      nodes,
      {
        scale: [0.4, 1],
        opacity: [0, 1],
        duration: 650,
        delay: stagger(220),
        ease: 'outBack(1.6)',
      },
      '-=300',
    );
  }, [reducedMotion]);

  useEffect(() => {
    runIntro();
  }, [runIntro]);

  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;

    const travelers = root.querySelectorAll('[data-phx-traveler]');
    const cleanups: Array<() => void> = [];

    travelers.forEach((traveler, i) => {
      const nodeId = PHOENIX_NODES[i]?.id;
      if (!nodeId) return;
      const path = root.querySelector(`[data-phx-line-path="${nodeId}"]`);
      if (!path) return;

      const anim = animate(traveler, {
        ...svg.createMotionPath(path),
        duration: 3200 + i * 250,
        loop: true,
        ease: 'linear',
        opacity: [0.35, 1, 0.35],
      });
      cleanups.push(() => anim.revert());
    });

    return () => cleanups.forEach((fn) => fn());
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !activeNode) return;
    const root = rootRef.current;
    if (!root) return;

    const line = root.querySelector(`[data-phx-line="${activeNode}"]`);
    if (!line) return;

    const anim = animate(line, {
      strokeOpacity: [0.45, 1, 0.45],
      duration: 1200,
      loop: true,
      ease: 'inOutSine',
    });

    return () => {
      anim.revert();
    };
  }, [activeNode, reducedMotion]);

  const gridDots = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const col = i % GRID_SIZE;
    const row = Math.floor(i / GRID_SIZE);
    const padding = 32;
    const span = VIEWBOX - padding * 2;
    const step = span / (GRID_SIZE - 1);
    return {
      id: i,
      x: padding + col * step,
      y: padding + row * step,
    };
  });

  return (
    <div ref={rootRef} className="relative w-full max-w-[520px] mx-auto" aria-hidden>
      <div className="relative rounded-2xl overflow-hidden">
        <div className="phx-panel overflow-hidden phx-glow">
        {/* Panel header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-[#070A12]/60">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
          <span className="ml-2 text-[11px] font-mono text-[#64748B] tracking-wide">
            phoenix-os / clinic-network
          </span>
        </div>

        {/* Canvas area */}
        <div className="relative aspect-square bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06)_0%,transparent_65%)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(34,211,238,0.35) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <svg
            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="phx-core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </radialGradient>
              <filter id="phx-path-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {PHOENIX_NODES.map((node) => (
                <linearGradient
                  key={`grad-${node.id}`}
                  id={`phx-line-grad-${node.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={CENTER.x}
                  y1={CENTER.y}
                  x2={node.x}
                  y2={node.y}
                >
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                  <stop offset="100%" stopColor={node.color} stopOpacity="0.9" />
                </linearGradient>
              ))}
            </defs>

            {gridDots.map((dot) => (
              <circle
                key={dot.id}
                data-phx-dot
                cx={dot.x}
                cy={dot.y}
                r="1"
                fill="#22D3EE"
                opacity={reducedMotion ? 0.25 : 0}
              />
            ))}

            {/* Orbit rings */}
            <circle
              data-phx-ring
              cx={CENTER.x}
              cy={CENTER.y}
              r="72"
              fill="none"
              stroke="rgba(34,211,238,0.12)"
              strokeWidth="1"
              strokeDasharray="4 6"
              opacity={reducedMotion ? 1 : 0}
            />
            <circle
              data-phx-ring
              cx={CENTER.x}
              cy={CENTER.y}
              r="108"
              fill="none"
              stroke="rgba(139,92,246,0.1)"
              strokeWidth="1"
              strokeDasharray="3 8"
              className={cn(!reducedMotion && 'phx-orbit-spin')}
              opacity={reducedMotion ? 1 : 0}
              style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}
            />

            {/* Connector paths + travelers */}
            {PHOENIX_NODES.map((node) => (
              <g key={node.id}>
                <path
                  data-phx-line={node.id}
                  data-phx-line-path={node.id}
                  d={bezierPath(CENTER.x, CENTER.y, node.x, node.y)}
                  stroke={`url(#phx-line-grad-${node.id})`}
                  strokeWidth="2"
                  strokeOpacity={activeNode === node.id ? 1 : 0.4}
                  fill="none"
                  filter="url(#phx-path-glow)"
                  opacity={reducedMotion ? 1 : 0}
                />
                <circle
                  data-phx-traveler
                  r="3.5"
                  fill={node.color}
                  opacity={reducedMotion ? 0 : 0}
                />
              </g>
            ))}

            <circle cx={CENTER.x} cy={CENTER.y} r="56" fill="url(#phx-core-glow)" />
          </svg>

          {/* Central core — HTML */}
          <div
            data-phx-core
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: pct(CENTER.x),
              top: pct(CENTER.y),
              transform: 'translate(-50%, -50%)',
              opacity: reducedMotion ? 1 : 0,
            }}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-[#22D3EE]/10 blur-md" />
              <div className="relative w-[72px] h-[72px] rounded-2xl bg-[#0B1020] border-2 border-[#22D3EE]/50 flex items-center justify-center shadow-[0_0_32px_rgba(34,211,238,0.2)]">
                <PhoenixLogoMark size={36} />
              </div>
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F8FAFC] tracking-tight whitespace-nowrap">
              Phoenix OS
            </span>
          </div>

          {/* Clinic node chips — HTML */}
          {PHOENIX_NODES.map((node) => {
            const Icon = NODE_ICONS[node.icon];
            const isActive = activeNode === node.id;

            return (
              <button
                key={node.id}
                type="button"
                data-phx-node
                className={cn(
                  'absolute z-30 flex flex-col items-center gap-1.5 cursor-pointer',
                  'transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/50 rounded-xl',
                )}
                style={{
                  left: pct(node.x),
                  top: pct(node.y),
                  transform: isActive
                    ? 'translate(-50%, calc(-50% - 2px))'
                    : 'translate(-50%, -50%)',
                  opacity: reducedMotion ? 1 : 0,
                }}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                onFocus={() => setActiveNode(node.id)}
                onBlur={() => setActiveNode(null)}
              >
                <div
                  className={cn(
                    'relative w-11 h-11 rounded-xl flex items-center justify-center',
                    'bg-[#0B1020] border transition-all duration-300',
                    isActive
                      ? 'border-opacity-80 shadow-lg scale-110'
                      : 'border-white/10 hover:border-white/25 hover:scale-105',
                  )}
                  style={{
                    borderColor: isActive ? node.color : undefined,
                    boxShadow: isActive ? `0 8px 24px ${node.color}33` : undefined,
                  }}
                >
                  {node.live && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#0B1020]" />
                  )}
                  <Icon size={20} style={{ color: node.color }} />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                    'bg-[#0B1020]/90 border border-white/10',
                    isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]',
                  )}
                  style={isActive ? { borderColor: `${node.color}55` } : undefined}
                >
                  {node.label}
                </span>
              </button>
            );
          })}

          {/* Detail card */}
          {activeNodeData && (
            <div
              className="absolute bottom-3 left-3 right-3 z-40 phx-panel px-4 py-3 border-l-2"
              style={{ borderLeftColor: activeNodeData.color }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeNodeData.color }}
                />
                <p className="text-xs font-semibold text-[#F8FAFC]">{activeNodeData.label}</p>
                {activeNodeData.live && (
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#22C55E] px-1.5 py-0.5 rounded bg-[#22C55E]/10">
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed pl-3.5">
                {activeNodeData.detail}
              </p>
            </div>
          )}
        </div>
        </div>
        <BorderBeam
          colorFrom="#22D3EE"
          colorTo="#8B5CF6"
          size={180}
          duration={12}
          borderWidth={1.5}
        />
      </div>
    </div>
  );
}
