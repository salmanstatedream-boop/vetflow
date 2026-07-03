'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, HeartPulse, Smile, Sparkles, Stethoscope, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlowBorderCard } from '@/components/ui/glow-border-card';
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

const CLINIC_CARD_HOVER =
  'cursor-default transition-colors duration-200 hover:border-[#22D3EE]/35 hover:bg-[color-mix(in_srgb,var(--phx-panel)_88%,var(--phx-cyan))] hover:shadow-[0_8px_32px_rgba(34,211,238,0.1)]';

export default function ClinicTypes() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeClinicId, setActiveClinicId] = useState<string | null>(null);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-clinic-fade], [data-clinic-card]',
    staggerMs: 90,
  });

  const activeClinic = CLINIC_TYPES.find((clinic) => clinic.id === activeClinicId) ?? null;
  const ActiveIcon = activeClinic ? ICONS[activeClinic.id] : null;

  useEffect(() => {
    if (!activeClinicId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveClinicId(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeClinicId]);

  return (
    <section ref={sectionRef} id="clinic-types" className="phx-section">
      <AnimatePresence>
        {activeClinic && ActiveIcon && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm cursor-pointer"
              aria-label="Close capabilities"
              onClick={() => setActiveClinicId(null)}
            />
            <div className="fixed inset-0 z-[10001] grid place-items-center p-4 pointer-events-none">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="clinic-capabilities-title"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[#22D3EE]/25 bg-[#0B1020] shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4 p-6 border-b border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#22D3EE]/10 border border-[#22D3EE]/20">
                      <ActiveIcon size={22} className="text-[#22D3EE]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#22D3EE] mb-1">
                        {activeClinic.status}
                      </p>
                      <h3 id="clinic-capabilities-title" className="text-lg font-semibold text-[#F8FAFC]">
                        {activeClinic.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveClinicId(null)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#22D3EE]/30 transition-colors duration-200 cursor-pointer phx-focus-ring shrink-0"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[min(70vh,28rem)] overflow-y-auto">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {activeClinic.description}
                  </p>
                  {'extendedDescription' in activeClinic && activeClinic.extendedDescription && (
                    <p className="text-sm text-[#CBD5E1] leading-relaxed">
                      {activeClinic.extendedDescription}
                    </p>
                  )}
                  {activeClinic.details.length > 0 && (
                    <ul className="space-y-2">
                      {activeClinic.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2 text-sm text-[#94A3B8] leading-relaxed"
                        >
                          <ArrowRight size={14} className="text-[#22D3EE] mt-0.5 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

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

        <div className="grid sm:grid-cols-2 gap-5 items-stretch auto-rows-fr">
          {CLINIC_TYPES.map((clinic) => {
            const Icon = ICONS[clinic.id];
            const isAvailable = clinic.status === 'Available Now';

            return (
              <div key={clinic.id} data-clinic-card className="h-full min-h-[280px]">
                <GlowBorderCard
                  width="100%"
                  height="100%"
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
                    'border-0 h-full min-h-[280px] !place-content-stretch !place-items-stretch',
                    '[&>div:last-child]:items-stretch [&>div:last-child]:justify-start [&>div:last-child]:!p-0',
                    CLINIC_CARD_HOVER,
                    isAvailable
                      ? 'bg-[var(--phx-panel)]/90 ring-1 ring-[#22D3EE]/30 hover:ring-[#22D3EE]/45'
                      : 'phx-panel opacity-80 hover:opacity-95',
                  )}
                >
                  <div className="p-6 w-full h-full min-h-[280px] flex flex-col text-left">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
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
                          'text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0',
                          isAvailable
                            ? 'text-[#22D3EE] border-[#22D3EE]/30 bg-[#22D3EE]/10'
                            : 'text-[#64748B] border-white/15 bg-white/5',
                        )}
                      >
                        {clinic.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">{clinic.title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed flex-1 min-h-[3.5rem]">
                      {clinic.description}
                    </p>

                    <div className="mt-auto pt-4 min-h-[2.75rem] flex items-end w-full">
                      {isAvailable && clinic.details.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setActiveClinicId(clinic.id)}
                          className="w-full flex items-center justify-between gap-3 rounded-md border border-[#22D3EE]/20 bg-[var(--phx-bg-alt)]/50 text-[#94A3B8] px-4 py-2 text-sm cursor-pointer phx-focus-ring transition-colors duration-200 hover:border-[#22D3EE]/35 hover:text-[#F8FAFC]"
                        >
                          <span className="flex items-center gap-2">
                            <ArrowRight size={14} className="text-[#22D3EE]" />
                            View capabilities
                          </span>
                          <span className="text-[#64748B]">+</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center min-h-[2.75rem] text-[10px] font-mono uppercase tracking-wider text-[#64748B] px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
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
