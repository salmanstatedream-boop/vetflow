'use client';

import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useRef } from 'react';
import AnimatedButton from '@/components/ui/animated-button';
import { GlowBorderCard } from '@/components/ui/glow-border-card';
import { PRICING_TIERS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const PHOENIX_GRADIENT = ['#22D3EE', '#3B82F6', '#8B5CF6', '#A855F7', '#22D3EE', '#3B82F6', '#8B5CF6', '#A855F7', '#22D3EE', '#3B82F6'];

export default function PricingPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-pricing-fade], [data-pricing-card]',
    staggerMs: 100,
  });

  return (
    <section ref={sectionRef} id="pricing" className="phx-section">
      <div className="phx-container">
        <p className="phx-eyebrow mb-4 text-center" data-pricing-fade>
          07 / PRICING
        </p>
        <h2
          className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4 text-center"
          data-pricing-fade
        >
          Start simple. Scale when ready.
        </h2>
        <p className="phx-subtext text-lg text-center mb-10 max-w-xl mx-auto" data-pricing-fade>
          Choose the plan that fits your clinic today. Every tier includes secure, audit-ready
          workflows.
        </p>

        <div className="grid md:grid-cols-3 gap-6 md:gap-4 max-w-5xl mx-auto items-stretch">
          {PRICING_TIERS.map((tier) => {
            const isFeatured = 'featured' in tier && tier.featured;

            return (
              <div
                key={tier.id}
                data-pricing-card
                className={cn('h-full', isFeatured && 'md:-translate-y-2')}
              >
                <GlowBorderCard
                  width="100%"
                  height="100%"
                  aspectRatio="unset"
                  borderRadius="1rem"
                  colorPreset="custom"
                  gradientColors={PHOENIX_GRADIENT}
                  borderWidth={isFeatured ? '0.35em' : '0.25em'}
                  blurAmount="0.35em"
                  inset="-0.3em"
                  animationDuration={isFeatured ? 4 : 7}
                  paused={reducedMotion}
                  className="bg-[#0B1020]/85 border-0 h-full !place-content-stretch !place-items-stretch min-h-[340px]"
                >
                  <div className="p-4 sm:p-5 flex flex-col h-full w-full text-left">
                    {isFeatured && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#22D3EE] mb-3">
                        Most popular
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-[#F8FAFC] mb-2">{tier.name}</h3>
                    <p className="text-sm text-[#94A3B8] mb-6 flex-1">{tier.description}</p>
                    <ul className="space-y-2 mb-6">
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
                    {isFeatured ? (
                      <AnimatedButton
                        type="button"
                        onClick={() => router.push('/request-access')}
                        className="w-full !bg-[#22D3EE]/10 !border-[#22D3EE]/30 !text-[#F8FAFC] hover:!bg-[#22D3EE]/20"
                      >
                        Request Access
                      </AnimatedButton>
                    ) : (
                      <button
                        type="button"
                        onClick={() => router.push('/request-access')}
                        className="phx-btn-ghost w-full"
                      >
                        Request Access
                      </button>
                    )}
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
