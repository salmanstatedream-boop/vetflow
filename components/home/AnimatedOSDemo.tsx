'use client';

import { createTimeline } from 'animejs';
import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { OS_DEMO } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { BorderBeam } from '@/components/ui/border-beam';

export default function AnimatedOSDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-demo-fade]',
    onReveal: () => {
      const demo = demoRef.current;
      if (!demo || timelineRef.current) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const panels = demo.querySelectorAll('[data-demo-step]');
      const bars = demo.querySelectorAll('[data-demo-bar]');
      const checks = demo.querySelectorAll('[data-demo-check]');

      const timeline = createTimeline({ loop: true, defaults: { ease: 'outExpo' } });

      panels.forEach((panel, i) => {
        timeline.add(
          panel,
          { opacity: [0.35, 1, 0.35], x: [-8, 0, 0], duration: 600 },
          i === 0 ? 0 : '-=200',
        );
        if (bars[i]) {
          timeline.add(bars[i], { width: ['0%', '100%'], duration: 500, ease: 'inOutQuad' }, '<');
        }
        if (checks[i]) {
          timeline.add(
            checks[i],
            { scale: [0, 1.2, 1], opacity: [0, 1], duration: 400, ease: 'outBack(1.4)' },
            '<+=200',
          );
        }
      });

      timeline.add({}, { duration: 1200 });
      timelineRef.current = timeline;
    },
  });

  useEffect(() => {
    return () => {
      timelineRef.current?.pause();
      timelineRef.current = null;
    };
  }, []);

  return (
    <section ref={sectionRef} id="product" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <p className="phx-eyebrow mb-4" data-demo-fade>
              01 / PRODUCT
            </p>
            <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-demo-fade>
              {OS_DEMO.heading}
            </h2>
            <p className="phx-subtext text-lg mb-8" data-demo-fade>
              {OS_DEMO.subheadline}
            </p>
            <ul className="space-y-3">
              {OS_DEMO.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 text-[#94A3B8]"
                  data-demo-fade
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#22D3EE] shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-2xl overflow-hidden" data-demo-fade>
            <div ref={demoRef} className="phx-panel p-5 sm:p-6 phx-glow relative">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <span className="ml-2 text-xs font-mono text-[#64748B]">
                  phoenix-os / live-demo
                </span>
              </div>

              <div className="space-y-3">
                {OS_DEMO.steps.map((step, i) => (
                  <div
                    key={step.id}
                    data-demo-step
                    className={cn(
                      'phx-panel p-3 sm:p-4 transition-colors',
                      i === 0 ? 'border-[#22D3EE]/30' : '',
                    )}
                    style={{ opacity: reducedMotion ? (i === 0 ? 1 : 0.5) : 0.35 }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{step.label}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{step.detail}</p>
                      </div>
                      <div
                        data-demo-check
                        className="w-6 h-6 rounded-full bg-[#22D3EE]/15 flex items-center justify-center shrink-0"
                        style={{ opacity: reducedMotion && i === 0 ? 1 : 0, transform: 'scale(0)' }}
                      >
                        <Check size={14} className="text-[#22D3EE]" />
                      </div>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        data-demo-bar
                        className="h-full bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] rounded-full"
                        style={{ width: reducedMotion && i === 0 ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <BorderBeam colorFrom="#22D3EE" colorTo="#3B82F6" size={160} duration={14} />
          </div>
        </div>
      </div>
    </section>
  );
}
