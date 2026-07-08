'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PetStockAvatar } from '@/components/home/solution-dashboard-visuals/shared';
import { INTERACTIVE_WORKFLOW } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const GLOW_MS = 2500;

export default function InteractiveWorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const steps = INTERACTIVE_WORKFLOW.steps;

  useScrollReveal(sectionRef, { selector: '[data-workflow-fade]', staggerMs: 60, y: 18 });

  const goNext = useCallback(() => {
    setActiveStep((i) => (i + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setInterval(goNext, GLOW_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="workflows"
      className="phx-section phx-section-alt overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header mb-10">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-workflow-fade
          >
            {INTERACTIVE_WORKFLOW.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-workflow-fade>
            {INTERACTIVE_WORKFLOW.headline[0]}{' '}
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {INTERACTIVE_WORKFLOW.headline[1]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-workflow-fade>
            {INTERACTIVE_WORKFLOW.subheadline}
          </p>
        </div>

        <div className="overflow-x-auto pb-2 mb-8 scrollbar-none" data-workflow-fade>
          <div className="flex gap-3 min-w-max px-1">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <motion.div
                  key={step.id}
                  className={cn(
                    'w-[140px] shrink-0 rounded-xl border p-3 transition-all duration-300',
                    isActive
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-[0_0_24px_rgba(139,92,246,0.35)]'
                      : 'border-white/10 bg-white/[0.03] opacity-70',
                  )}
                >
                  <span className="text-[10px] font-mono text-[#8B5CF6]">{String(step.index).padStart(2, '0')}</span>
                  <div className="h-12 rounded-md bg-[#0B1020]/80 border border-white/5 my-2 flex items-center justify-center">
                    <span className="text-[8px] text-[#64748B] text-center px-1">{step.title}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC] leading-tight">{step.title}</p>
                  <p className="text-[8px] text-[#64748B] mt-1 leading-snug">{step.caption}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_220px] gap-4 mb-8" data-workflow-fade>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#0B1020]/80 p-4">
              <p className="text-[10px] font-mono uppercase text-[#64748B] mb-3">Visit in Progress</p>
              <div className="flex items-start gap-3">
                <PetStockAvatar pet="max" size="md" />
                <div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">Bruno</p>
                  <p className="text-[10px] text-[#64748B]">3y · Male · 32kg</p>
                  <p className="text-[10px] text-[#94A3B8] mt-2">Sarah Johnson</p>
                  <p className="text-[10px] text-[#64748B]">Vomiting, loss of appetite</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1020]/80 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-mono uppercase text-[#64748B]">AI Voice Capture</p>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#C4B5FD]">Live</span>
              </div>
              <div className="flex items-end gap-0.5 h-8 mb-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-[#8B5CF6]/60"
                    style={{ height: `${20 + (i % 5) * 12}%` }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-[#94A3B8] leading-relaxed italic">
                &quot;Dr. Smith, Bruno has been vomiting since yesterday…&quot;
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0B1020]/80 p-4">
              <p className="text-[10px] font-mono uppercase text-[#64748B] mb-3">Generated SOAP (Preview)</p>
              <div className="space-y-1.5 text-[9px] text-[#94A3B8]">
                <p><span className="text-[#C4B5FD]">S:</span> Vomiting, reduced appetite</p>
                <p><span className="text-[#C4B5FD]">O:</span> Mild dehydration noted</p>
                <p><span className="text-[#C4B5FD]">A:</span> Acute gastroenteritis</p>
                <p><span className="text-[#C4B5FD]">P:</span> Fluids, anti-emetic, recheck 48h</p>
              </div>
              <button type="button" className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-[10px] font-semibold text-white">
                Approve & Continue
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0B1020]/80 p-4">
            <p className="text-sm font-semibold text-[#22D3EE] mb-4">The Phoenix OS Advantage</p>
            <ul className="space-y-3">
              {INTERACTIVE_WORKFLOW.advantages.map((item) => (
                <li key={item.title}>
                  <p className="text-[11px] font-semibold text-[#F8FAFC]">{item.title}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 justify-between"
          data-workflow-fade
        >
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
              <Image src="/phoenix-logo.png" alt="" fill className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">{INTERACTIVE_WORKFLOW.cta.headline}</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-xl">{INTERACTIVE_WORKFLOW.cta.sub}</p>
            </div>
          </div>
          <Link href="/request-access" className="phx-btn-primary text-sm px-5 py-2.5 shrink-0 phx-focus-ring">
            {INTERACTIVE_WORKFLOW.cta.button} →
          </Link>
        </div>
      </div>
    </section>
  );
}
