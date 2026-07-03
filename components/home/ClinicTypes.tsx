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

const PHOENIX_GRADIENT = ['#0B2535', '#123B52', '#22D3EE', '#123B52', '#0B2535', '#0E2A4A', '#3B82F6', '#0E2A4A', '#0B2535', '#0B2535'];

export default function ClinicTypes() {
  const sectionRef = useRef<HTMLElement>(null);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-clinic-fade], [data-clinic-card]',
    staggerMs: 90,
  });

  return (
    <section ref={sectionRef} id="clinic-types" className="phx-section">
      <div className="phx-container">
        <div className="phx-section-header max-w-3xl">
          <p className="phx-eyebrow" data-clinic-fade>
            04 / CLINIC TYPES
          </p>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-clinic-fade>
            Built for vet clinics first. Ready for every clinic next.
          </h2>
          <p className="phx-subtext text-lg max-w-2xl" data-clinic-fade>
            One live vertical today — with more clinic types on the Phoenix OS roadmap.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 items-stretch">
          {CLINIC_TYPES.map((clinic) => {
            const Icon = ICONS[clinic.id];
            const isAvailable = clinic.status === 'Available Now';
            const extendedDescription =
              'extendedDescription' in clinic ? clinic.extendedDescription : undefined;
            const disclosureDescription = [extendedDescription, clinic.details.join(' · ')]
              .filter(Boolean)
              .join(' ');

            return (
              <div key={clinic.id} data-clinic-card className={cn('h-full', !isAvailable && 'cursor-default')}>
                <GlowBorderCard
                  width="100%"
                  aspectRatio="auto"
                  borderRadius="1rem"
                  colorPreset="custom"
                  gradientColors={PHOENIX_GRADIENT}
                  borderWidth="0.25em"
                  blurAmount="0.55em"
                  inset="-0.3em"
                  animationDuration={12}
                  paused={reducedMotion || !isAvailable}
                  className={cn(
                    'border-0 h-full min-h-[220px] !place-content-stretch !place-items-stretch transition-colors duration-200',
                    isAvailable
                      ? 'bg-[var(--phx-panel)]/90 ring-1 ring-[#22D3EE]/30'
                      : 'phx-panel opacity-75',
                  )}
                >
                  <div className="p-6 w-full h-full flex flex-col text-left">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center',
                          isAvailable
                            ? 'bg-[#22D3EE]/10 border border-[#22D3EE]/20'
                            : 'bg-white/5 border border-white/10',
                        )}
                      >
                        <Icon
                          size={22}
                          className={isAvailable ? 'text-[#22D3EE]' : 'text-[#64748B]'}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border',
                          isAvailable
                            ? 'text-[#22D3EE] border-[#22D3EE]/30 bg-[#22D3EE]/10'
                            : 'text-[#64748B] border-white/15 bg-white/5',
                        )}
                      >
                        {clinic.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{clinic.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed mb-4 flex-1">
                      {clinic.description}
                    </p>

                    <div className="mt-auto">
                      {isAvailable && clinic.details.length > 0 ? (
                        <MoriphingDisclosure
                          id={`clinic-${clinic.id}`}
                          title="View capabilities"
                          description={disclosureDescription}
                          className="rounded-md border-[#22D3EE]/20 bg-[var(--phx-bg-alt)]/50 text-[#94A3B8] max-w-none cursor-pointer phx-focus-ring"
                          icon={<ArrowRight size={14} className="text-[#22D3EE]" />}
                        />
                      ) : (
                        <span className="inline-flex text-[10px] font-mono uppercase tracking-wider text-[#64748B] px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                          Coming soon
                        </span>
                      )}
                    </div>
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
