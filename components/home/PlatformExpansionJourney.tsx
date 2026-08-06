'use client';

import { Sparkles } from 'lucide-react';
import { PLATFORM_EXPANSION } from '@/lib/home-data';
import { cn } from '@/lib/utils';
import { TONE_COLORS } from '@/components/home/PlatformExpansionOrbitMap';

export default function PlatformExpansionJourney({ className }: { className?: string }) {
  const nodes = PLATFORM_EXPANSION.timeline;

  return (
    <div className={cn('w-full', className)} data-platform-fade>
      <div className="mb-8 flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#22D3EE]" />
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#22D3EE]/90">
          {PLATFORM_EXPANSION.journeyTitle}
        </p>
      </div>

      <div className="relative hidden sm:block px-2 lg:px-10 pb-1">
        {/* Labels row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {nodes.map((node) => (
            <p
              key={`label-${node.clinic}`}
              className="text-center text-xs font-semibold leading-snug text-[#F8FAFC] px-1"
            >
              {node.clinic}
            </p>
          ))}
        </div>

        {/* Line + dots share one vertical center */}
        <div className="relative h-5 mb-3">
          <div
            aria-hidden
            className="absolute left-[12.5%] right-[10%] top-1/2 h-[2px] -translate-y-1/2 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, #22D3EE 0%, #8B5CF6 33%, #3B82F6 66%, #F97316 100%)',
              boxShadow: '0 0 12px rgba(34,211,238,0.25)',
            }}
          />
          <span
            aria-hidden
            className="absolute right-[10%] top-1/2 z-10 -translate-y-1/2 translate-x-full border-y-[5px] border-y-transparent border-l-[10px] border-l-[#F97316]"
            style={{ filter: 'drop-shadow(0 0 6px #F97316)' }}
          />
          <div className="absolute inset-0 grid grid-cols-4 gap-2">
            {nodes.map((node) => {
              const color = TONE_COLORS[node.tone];
              return (
                <div key={`dot-${node.clinic}`} className="flex items-center justify-center">
                  <span
                    className={cn(
                      'relative z-10 flex h-[14px] w-[14px] items-center justify-center rounded-full ring-[5px] ring-[#030712]',
                      node.filled && 'shadow-[0_0_18px_currentColor]',
                      !node.filled && 'border-2 bg-[#030712]',
                    )}
                    style={{
                      backgroundColor: node.filled ? color : 'transparent',
                      borderColor: color,
                      color,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Status row */}
        <div className="grid grid-cols-4 gap-2">
          {nodes.map((node) => {
            const color = TONE_COLORS[node.tone];
            return (
              <p
                key={`status-${node.clinic}`}
                className="text-center text-[10px] font-medium tracking-wide"
                style={{ color }}
              >
                {node.note}
              </p>
            );
          })}
        </div>
      </div>

      <ul className="space-y-3 sm:hidden">
        {nodes.map((node) => {
          const color = TONE_COLORS[node.tone];
          return (
            <li
              key={node.clinic}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B1020]/50 px-3 py-2.5"
            >
              <span
                className={cn(
                  'h-3 w-3 shrink-0 rounded-full',
                  !node.filled && 'border-2 bg-transparent',
                )}
                style={{
                  backgroundColor: node.filled ? color : 'transparent',
                  borderColor: color,
                  boxShadow: node.filled ? `0 0 10px ${color}` : undefined,
                }}
              />
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{node.clinic}</p>
                <p className="text-[10px]" style={{ color }}>
                  {node.note}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
