'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const KPI_STATS = [
  { label: 'Appointments Today', value: '24' },
  { label: 'Patients In Clinic', value: '8' },
  { label: 'Tasks Pending', value: '5' },
  { label: 'Revenue Today', value: '$4.2k' },
] as const;

const SCHEDULE = [
  { time: '09:00', patient: 'Bella — Checkup', width: '72%' },
  { time: '10:30', patient: 'Max — Vaccination', width: '58%' },
  { time: '11:45', patient: 'Luna — Follow-up', width: '45%' },
  { time: '14:00', patient: 'Rocky — Surgery prep', width: '80%' },
] as const;

const ACTIVITY = [
  { text: 'Invoice #1042 sent to owner', time: '2m ago' },
  { text: 'Lab results uploaded for Max', time: '8m ago' },
  { text: 'Queue updated — 3 waiting', time: '12m ago' },
] as const;

const INVENTORY = [
  { label: 'Royal Canine Puppy', pct: 82 },
  { label: 'Cat Litter', pct: 34 },
  { label: 'Rabies Vaccine', pct: 61 },
] as const;

const FLOW_PATH = 'M 8 52 C 48 18, 88 78, 128 44 S 208 22, 248 48 S 288 62, 312 38';

interface LiveDashboardMockupProps {
  animate?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

export default function LiveDashboardMockup({
  animate = false,
  reducedMotion = false,
  className,
}: LiveDashboardMockupProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [dot, setDot] = useState({ x: 160, y: 48 });

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    const mid = path.getPointAtLength(length * 0.5);
    setDot({ x: mid.x, y: mid.y });

    if (reducedMotion || !animate) return;

    const duration = 5000;
    let start: number | null = null;
    let raf = 0;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      const progress = elapsed / duration;
      const point = path.getPointAtLength(progress * length);
      setDot({ x: point.x, y: point.y });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, reducedMotion]);

  return (
    <div className={cn('text-left', className)}>
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        <span className="ml-2 text-xs font-mono text-[#64748B]">phoenix-os / live-demo</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {KPI_STATS.map((kpi) => (
          <div
            key={kpi.label}
            className="phx-panel px-3 py-2.5 border-white/5"
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] leading-tight mb-1">
              {kpi.label}
            </p>
            <p className="text-lg sm:text-xl font-semibold text-[#F8FAFC] tabular-nums">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div className="phx-panel p-3 sm:p-4 border-white/5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-3">
            Today&apos;s Schedule
          </p>
          <div className="space-y-2.5">
            {SCHEDULE.map((slot) => (
              <div key={slot.time} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#64748B] w-9 shrink-0">
                  {slot.time}
                </span>
                <div className="flex-1 h-7 rounded-md bg-white/5 overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-[#22D3EE]/30 to-[#3B82F6]/25 border border-[#22D3EE]/20"
                    style={{ width: slot.width }}
                  />
                  <span className="relative z-10 px-2 text-[11px] text-[#CBD5E1] leading-7 truncate block">
                    {slot.patient}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="phx-panel p-3 sm:p-4 border-white/5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-3">
            Patient Flow
          </p>
          <svg viewBox="0 0 320 80" className="w-full h-20" aria-hidden>
            <defs>
              <linearGradient id="flow-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.5" />
              </linearGradient>
              <filter id="flow-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              ref={pathRef}
              d={FLOW_PATH}
              fill="none"
              stroke="url(#flow-line)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={dot.x}
              cy={dot.y}
              r="5"
              fill="#22D3EE"
              filter="url(#flow-glow)"
            />
            <circle cx={dot.x} cy={dot.y} r="2.5" fill="#F8FAFC" />
          </svg>
          <div className="flex justify-between text-[10px] font-mono text-[#64748B] mt-1">
            <span>Arrival</span>
            <span>Consult</span>
            <span>Checkout</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="phx-panel p-3 sm:p-4 border-white/5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-3">
            Recent Activity
          </p>
          <ul className="space-y-2">
            {ACTIVITY.map((item) => (
              <li key={item.text} className="flex items-start justify-between gap-2">
                <span className="text-[11px] text-[#CBD5E1] leading-snug">{item.text}</span>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="phx-panel p-3 sm:p-4 border-white/5">
          <p className="text-xs font-mono uppercase tracking-wider text-[#64748B] mb-3">
            Inventory Snapshot
          </p>
          <div className="space-y-2.5">
            {INVENTORY.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#CBD5E1]">{item.label}</span>
                  <span
                    className={cn(
                      'font-mono tabular-nums',
                      item.pct < 40 ? 'text-[#EF4444]' : 'text-[#64748B]',
                    )}
                  >
                    {item.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      item.pct < 40
                        ? 'bg-gradient-to-r from-[#EF4444] to-[#F97316]'
                        : 'bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]',
                    )}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
