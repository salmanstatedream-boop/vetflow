'use client';

import { useRef, useState } from 'react';
import { OS_DEMO } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { BorderBeam } from '@/components/ui/border-beam';
import DashboardPreviewStack from '@/components/home/DashboardPreviewStack';

export default function AnimatedOSDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [demoAnimate, setDemoAnimate] = useState(false);

  const reducedMotion = useScrollReveal(sectionRef, {
    selector: '[data-demo-fade]',
    onReveal: () => setDemoAnimate(true),
    y: 20,
    staggerMs: 80,
  });

  useScrollReveal(sectionRef, {
    selector: '[data-demo-slide-left]',
    x: -24,
    y: 0,
    staggerMs: 70,
  });

  useScrollReveal(sectionRef, {
    selector: '[data-demo-stack]',
    y: 28,
    staggerMs: 0,
    durationMs: 850,
  });

  return (
    <section ref={sectionRef} id="product" className="phx-section phx-section-alt">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <div className="phx-section-header max-w-xl">
              <p className="phx-eyebrow" data-demo-slide-left>
                05 / PRODUCT
              </p>
              <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-demo-slide-left>
                {OS_DEMO.heading}
              </h2>
              <p className="phx-subtext text-lg" data-demo-slide-left>
                {OS_DEMO.subheadline}
              </p>
            </div>
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

          <div className="relative rounded-2xl overflow-hidden" data-demo-stack>
            <DashboardPreviewStack
              className="relative"
              animate={demoAnimate}
              reducedMotion={reducedMotion}
            />
            <BorderBeam colorFrom="#22D3EE" colorTo="#3B82F6" size={160} duration={14} />
          </div>
        </div>
      </div>
    </section>
  );
}
