'use client';

import { ClipboardList, Layers, ShieldCheck, Stethoscope } from 'lucide-react';
import { useRef, useState } from 'react';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { STATS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

const STAT_ICONS = {
  modules: Layers,
  sync: ShieldCheck,
  audit: ClipboardList,
  types: Stethoscope,
} as const;

export default function StatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const [counted, setCounted] = useState(false);

  useScrollReveal(sectionRef, {
    selector: '[data-stat-fade]',
    staggerMs: 100,
    onReveal: () => setCounted(true),
  });

  return (
    <section ref={sectionRef} className="phx-stats-band">
      <div className="phx-container">
        <p
          className="text-center text-xs font-mono uppercase tracking-[0.2em] text-[#64748B] mb-6"
          data-stat-fade
        >
          Built for modern vet practices
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATS.map((stat) => {
            const Icon = STAT_ICONS[stat.id as keyof typeof STAT_ICONS] ?? Layers;
            return (
              <div key={stat.id} className="phx-metric-card text-center" data-stat-fade>
                <div className="flex justify-center mb-3">
                  <span className="w-9 h-9 rounded-lg bg-[#22D3EE]/8 border border-[#22D3EE]/15 flex items-center justify-center">
                    <Icon size={18} className="text-[#22D3EE]" />
                  </span>
                </div>
                <div className="flex items-baseline justify-center gap-0.5 text-3xl sm:text-4xl font-bold text-[#F8FAFC] tabular-nums">
                  <AnimatedNumber value={counted ? stat.value : 0} />
                  {stat.suffix && <span className="phx-gradient-text">{stat.suffix}</span>}
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#64748B]">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
