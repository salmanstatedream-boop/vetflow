'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { GlowBorderCard } from '@/components/ui/glow-border-card';
import { PRICING_TIERS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

// Calm sheen: deep navy base with one soft cyan and one blue highlight sweeping around
const PHOENIX_GRADIENT = ['#0B2535', '#123B52', '#22D3EE', '#123B52', '#0B2535', '#0E2A4A', '#3B82F6', '#0E2A4A', '#0B2535', '#0B2535'];

export default function PricingPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-pricing-fade], [data-pricing-card]',
    staggerMs: 100,
  });

  return (
    <section ref={sectionRef} id="pricing" className="phx-section relative">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="phx-section-header text-center max-w-xl mx-auto">
          <p className="phx-eyebrow" data-pricing-fade>
            09 / PRICING
          </p>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-pricing-fade>
            Start simple. Scale when ready.
          </h2>
          <p className="phx-subtext text-lg" data-pricing-fade>
            Choose the plan that fits your clinic today. Upgrade when your team grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4 max-w-5xl mx-auto items-start">
          {PRICING_TIERS.map((tier) => {
            const isFeatured = 'featured' in tier && tier.featured;
            const isHovered = hoveredId === tier.id;
            const isDimmed = hoveredId !== null && !isHovered;

            return (
              <div
                key={tier.id}
                data-pricing-card
                className={cn(
                  'transition-opacity duration-200',
                  isDimmed && 'opacity-60',
                )}
                onMouseEnter={() => setHoveredId(tier.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocusCapture={() => setHoveredId(tier.id)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setHoveredId(null);
                  }
                }}
              >
                <GlowBorderCard
                  width="100%"
                  aspectRatio="unset"
                  borderRadius="1rem"
                  colorPreset="custom"
                  gradientColors={PHOENIX_GRADIENT}
                  borderWidth={isFeatured ? '0.3em' : '0.2em'}
                  blurAmount="0.5em"
                  inset="-0.25em"
                  animationDuration={isFeatured ? 10 : 14}
                  paused={reducedMotion || hoveredId !== null}
                  className={cn(
                    'border-0 min-h-[340px] !place-content-stretch !place-items-stretch transition-colors duration-200 cursor-default',
                    isHovered
                      ? 'bg-gradient-to-b from-[#0E2A4A]/95 to-[var(--phx-panel)]/95 ring-1 ring-[#22D3EE]/50 shadow-[0_16px_48px_rgba(34,211,238,0.16)]'
                      : isFeatured
                        ? 'bg-[var(--phx-panel)]/85 ring-1 ring-[#22D3EE]/40'
                        : 'bg-[var(--phx-panel)]/85',
                  )}
                >
                  <div className="p-4 sm:p-5 flex flex-col h-full w-full text-left">
                    {isFeatured && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#22D3EE] mb-3">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">{tier.name}</h3>
                    <p className="text-sm text-[#94A3B8] mb-6">{tier.description}</p>
                    <ul className="space-y-2 mb-4">
                      {tier.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-center gap-2 text-xs text-[#94A3B8]"
                        >
                          <Check size={14} className="text-[#22D3EE] shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    <AnimatePresence initial={false}>
                      {(isHovered || reducedMotion) && (
                        <motion.div
                          key="details"
                          initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#22D3EE]/20 pt-4 mb-4">
                            <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#22D3EE] mb-2.5">
                              <Sparkles size={12} />
                              What&apos;s included
                            </p>
                            <ul className="space-y-1.5">
                              {tier.details.map((detail) => (
                                <li
                                  key={detail}
                                  className="flex items-start gap-2 text-xs text-[#CBD5E1]"
                                >
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#3B82F6] shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="button"
                      onClick={() => router.push('/request-access')}
                      className={cn(
                        'w-full mt-auto transition-colors duration-200 phx-focus-ring cursor-pointer',
                        isFeatured || isHovered ? 'phx-btn-primary' : 'phx-btn-ghost',
                      )}
                    >
                      Request Access
                    </button>
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
