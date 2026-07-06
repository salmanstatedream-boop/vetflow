'use client';

import { useRef } from 'react';
import { CursorCard } from '@/components/ui/cursor-card';
import { SECURITY_ITEMS, SECURITY_PREVIEW_IMAGES } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, {
    selector: '[data-security-fade], [data-security-item]',
    staggerMs: 70,
  });

  return (
    <section ref={sectionRef} id="security" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div>
            <div className="phx-section-header max-w-xl">
              <p className="phx-eyebrow" data-security-fade>
                09 / SECURITY
              </p>
              <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-security-fade>
                Secure by design.
              </h2>
              <p className="phx-subtext text-lg" data-security-fade>
                Role-based access, encrypted records, per-clinic data separation, and a complete audit
                trail — so your team can operate with confidence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECURITY_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.id} data-security-item>
                  <CursorCard
                    image={SECURITY_PREVIEW_IMAGES[index] ?? SECURITY_PREVIEW_IMAGES[0]}
                    description={`${item.label} — protected inside Phoenix OS`}
                    href="#security"
                    className="phx-card p-4 min-h-[108px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200 hover:border-[#8B5CF6]/30 phx-focus-ring rounded-2xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
                      <Icon size={18} className="text-[#8B5CF6]" />
                    </div>
                    <p className="text-xs font-medium text-[#F8FAFC] text-center">{item.label}</p>
                  </CursorCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
