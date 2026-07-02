'use client';

import { ArrowRight, Stethoscope, Smile, HeartPulse, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { GlowBorderCard } from '@/components/ui/glow-border-card';
import { MoriphingDisclosure } from '@/components/ui/morphing-disclosure';
import { CLINIC_TYPES } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const ICONS = {
  vet: Stethoscope,
  dental: Smile,
  general: HeartPulse,
  specialty: Sparkles,
} as const;

const PHOENIX_GRADIENT = ['#22D3EE', '#3B82F6', '#8B5CF6', '#A855F7', '#22D3EE', '#3B82F6', '#8B5CF6', '#A855F7', '#22D3EE', '#3B82F6'];

export default function ClinicTypes() {
  const sectionRef = useRef<HTMLElement>(null);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-clinic-fade], [data-clinic-card]',
    staggerMs: 90,
  });

  return (
    <section ref={sectionRef} id="clinic-types" className="phx-section">
      <div className="phx-container">
        <p className="phx-eyebrow mb-4" data-clinic-fade>
          04 / CLINIC TYPES
        </p>
        <h2
          className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-10 max-w-3xl"
          data-clinic-fade
        >
          Built for vet clinics first. Ready for every clinic next.
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          {CLINIC_TYPES.map((clinic) => {
            const Icon = ICONS[clinic.id];
            const isAvailable = clinic.status === 'Available Now';

            return (
              <div key={clinic.id} data-clinic-card>
                <GlowBorderCard
                  width="100%"
                  aspectRatio="auto"
                  borderRadius="1rem"
                  colorPreset="custom"
                  gradientColors={PHOENIX_GRADIENT}
                  borderWidth="0.35em"
                  blurAmount="0.45em"
                  inset="-0.4em"
                  animationDuration={6}
                  paused={reducedMotion}
                  className="bg-[#0B1020]/80 border-0 min-h-[220px] !place-content-stretch !place-items-stretch"
                >
                  <div className="p-6 w-full text-left">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center">
                        <Icon size={22} className="text-[#22D3EE]" />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border',
                          isAvailable
                            ? 'text-[#22D3EE] border-[#22D3EE]/30 bg-[#22D3EE]/10'
                            : 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-[#8B5CF6]/10',
                        )}
                      >
                        {clinic.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{clinic.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                      {clinic.description}
                    </p>

                    <MoriphingDisclosure
                      id={`clinic-${clinic.id}`}
                      title="View capabilities"
                      description={clinic.details.join(' · ')}
                      className="rounded-md border-[#22D3EE]/20 bg-[#070A12]/50 text-[#94A3B8] max-w-none"
                      icon={<ArrowRight size={14} className="text-[#22D3EE]" />}
                    />
                  </div>
                </GlowBorderCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
