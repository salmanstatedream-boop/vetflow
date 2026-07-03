'use client';

import { animate, svg } from 'animejs';
import { useRef } from 'react';
import { WORKFLOW_STEPS } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';
import { LightLines } from '@/components/ui/light-lines';

const WORKFLOW_CARD_HOVER =
  'cursor-default transition-colors duration-200 hover:border-[#22D3EE]/45 hover:bg-[color-mix(in_srgb,var(--phx-panel)_88%,var(--phx-cyan))] hover:shadow-[0_8px_32px_rgba(34,211,238,0.12)]';

export default function AnimatedWorkflow() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pathAnimatedRef = useRef(false);

  const drawPath = () => {
    const path = pathRef.current;
    if (!path || pathAnimatedRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      path.style.strokeDashoffset = '0';
      pathAnimatedRef.current = true;
      return;
    }
    pathAnimatedRef.current = true;
    const drawable = svg.createDrawable(path);
    animate(drawable, {
      draw: ['0 0', '0 1'],
      duration: 1800,
      delay: 250,
      ease: 'inOut(3)',
    });
  };

  useScrollReveal(sectionRef, {
    selector: '[data-workflow-fade], [data-workflow-card]',
    staggerMs: 55,
    y: 16,
    durationMs: 550,
    onReveal: drawPath,
  });

  const pathD = `M 24 24 ${WORKFLOW_STEPS.map((_, i) => {
    const x = 24 + i * 112;
    return `L ${x} 24`;
  }).join(' ')}`;

  return (
    <section ref={sectionRef} id="workflows" className="phx-section phx-section-alt overflow-hidden relative">
      <div aria-hidden className="phx-section-divider" />
      <LightLines
        className="absolute inset-0 pointer-events-none opacity-40 phx-fade-mask"
        showBackground={false}
        linesOpacity={0.04}
        lightsOpacity={0.35}
        gradientFrom="#3B82F6"
        gradientTo="#8B5CF6"
        lightColor="#8B5CF6"
        lineColor="#3B82F6"
      />
      <div className="phx-container relative">
        <div className="phx-section-header max-w-3xl mb-8 lg:mb-10">
          <p className="phx-eyebrow" data-workflow-fade>
            02 / WORKFLOWS
          </p>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl" data-workflow-fade>
            From front desk to final invoice.
          </h2>
        </div>

        {/* Desktop horizontal workflow */}
        <div className="hidden lg:block">
          <div className="phx-workflow-scroll mb-5">
            <svg
              viewBox={`0 0 ${24 + (WORKFLOW_STEPS.length - 1) * 112} 48`}
              className="w-full h-10 min-w-[56rem]"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="url(#workflow-grad)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="workflow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="50%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="phx-workflow-grid">
              {WORKFLOW_STEPS.map((step, i) => (
                <div
                  key={step.id}
                  data-workflow-card
                  className={cn(
                    'phx-card p-4 h-full min-h-[8.5rem] flex flex-col min-w-0',
                    WORKFLOW_CARD_HOVER,
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center text-xs font-mono text-[#22D3EE] mb-3 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1 leading-snug">
                    {step.label}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed mt-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile vertical workflow */}
        <div className="lg:hidden relative pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-[#22D3EE] via-[#3B82F6] to-[#8B5CF6]" />
          <div className="space-y-4">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={step.id}
                data-workflow-card
                className={cn(
                  'phx-card p-4 relative min-h-[5.5rem]',
                  WORKFLOW_CARD_HOVER,
                  i === 0 && 'border-[#22D3EE]/30',
                )}
              >
                <div className="absolute -left-[1.35rem] top-5 w-3 h-3 rounded-full bg-[#0B1020] border-2 border-[#22D3EE]" />
                <div className="text-xs font-mono text-[#22D3EE] mb-1">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">{step.label}</h3>
                <p className="text-xs text-[#64748B]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
