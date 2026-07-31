'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  FileText,
  Mic,
  Pill,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import JourneyDashboardVisual from '@/components/home/journey-dashboard-visuals';
import { motionSpring } from '@/components/home/marketing-visuals/animations';
import { GradientPillButton } from '@/components/home/marketing-visuals/shared';
import { SOLUTION_JOURNEY } from '@/lib/home-data';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const GLOW_MS = 4500;
const STEP_WIDTH = 128;
const INITIAL_ACTIVE_STEP = 0;

const STEP_ICONS = [CalendarCheck, UserCheck, Mic, FileText, Pill, Receipt, Bell];

type ConnectorLine = { x1: number; y1: number; x2: number; y2: number };

export default function SolutionJourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRowRef = useRef<HTMLDivElement>(null);
  const stepScrollRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stepButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const [activeStep, setActiveStep] = useState(INITIAL_ACTIVE_STEP);
  const [paused, setPaused] = useState(false);
  const [connector, setConnector] = useState<ConnectorLine | null>(null);
  const steps = SOLUTION_JOURNEY.steps;

  useScrollReveal(sectionRef, { selector: '[data-journey-fade]', staggerMs: 60, y: 18 });

  const measureConnector = useCallback(() => {
    const row = stepRowRef.current;
    const badges = badgeRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!row || badges.length < 2) {
      setConnector(null);
      return;
    }

    const rowRect = row.getBoundingClientRect();
    const first = badges[0].getBoundingClientRect();
    const last = badges[badges.length - 1].getBoundingClientRect();

    setConnector({
      x1: first.left + first.width / 2 - rowRect.left,
      y1: first.top + first.height / 2 - rowRect.top,
      x2: last.left + last.width / 2 - rowRect.left,
      y2: last.top + last.height / 2 - rowRect.top,
    });
  }, []);

  useEffect(() => {
    measureConnector();
    const row = stepRowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(measureConnector);
    observer.observe(row);
    window.addEventListener('resize', measureConnector);
    const t = window.setTimeout(measureConnector, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureConnector);
      window.clearTimeout(t);
    };
  }, [measureConnector, steps.length]);

  useEffect(() => {
    const scroller = stepScrollRef.current;
    const btn = stepButtonRefs.current[activeStep];
    if (!scroller || !btn) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const target =
      scroller.scrollLeft +
      btnRect.left -
      scrollerRect.left -
      (scroller.clientWidth - btnRect.width) / 2;

    scroller.scrollTo({
      left: Math.max(0, Math.min(target, scroller.scrollWidth - scroller.clientWidth)),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [activeStep, reducedMotion]);

  const selectStep = useCallback((index: number) => {
    setActiveStep(index);
    setPaused(true);
  }, []);

  const goNext = useCallback(() => {
    setActiveStep((i) => (i + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setInterval(goNext, GLOW_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused, reducedMotion]);

  const active = steps[activeStep];
  const stepBadge = `${String(active.index).padStart(2, '0')} / 07 ${active.title.toUpperCase()}`;

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="phx-section phx-section-alt overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative max-w-7xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto phx-section-header mb-10">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-journey-fade
          >
            {SOLUTION_JOURNEY.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-journey-fade>
            {SOLUTION_JOURNEY.headline[0]}{' '}
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] bg-clip-text text-transparent">
              {SOLUTION_JOURNEY.headline[1]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-journey-fade>
            {SOLUTION_JOURNEY.subheadline}
          </p>
        </div>

        {/* Interactive stepper */}
        <div
          ref={stepScrollRef}
          className="overflow-x-auto pb-2 mb-6 scrollbar-none xl:overflow-visible"
          data-journey-fade
        >
          <div className="relative min-w-max px-1 pt-2 mx-auto xl:flex xl:justify-center">
            <div ref={stepRowRef} className="relative">
              {connector && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  aria-hidden
                >
                  <line
                    x1={connector.x1}
                    y1={connector.y1}
                    x2={connector.x2}
                    y2={connector.y2}
                    stroke="#64748B"
                    strokeOpacity="0.5"
                    strokeWidth="1"
                    strokeDasharray="3 7"
                  />
                </svg>
              )}
              <div className="flex gap-1 sm:gap-2 relative" role="tablist" aria-label="Patient journey steps">
                {steps.map((step, index) => {
                  const isActive = index === activeStep;
                  const Icon = STEP_ICONS[index] ?? ClipboardList;
                  return (
                    <button
                      key={step.id}
                      ref={(el) => {
                        stepButtonRefs.current[index] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => selectStep(index)}
                      className="text-center shrink-0 group"
                      style={{ width: STEP_WIDTH }}
                    >
                      <div className="flex justify-center mb-3 relative z-10">
                        <motion.span
                          ref={(el: HTMLSpanElement | null) => {
                            badgeRefs.current[index] = el;
                          }}
                          layout
                          animate={{ scale: isActive ? 1.08 : 1 }}
                          transition={reducedMotion ? { duration: 0 } : motionSpring}
                          className={cn(
                            'w-11 h-11 rounded-full flex items-center justify-center transition-colors duration-300',
                            isActive
                              ? 'bg-[#8B5CF6] text-white shadow-[0_0_28px_rgba(139,92,246,0.65),0_0_8px_rgba(139,92,246,0.4)] ring-4 ring-[#8B5CF6]/25'
                              : 'bg-[#0B0B0F] text-[#94A3B8] border border-white/20 group-hover:border-[#8B5CF6]/40 group-hover:text-[#C4B5FD]',
                          )}
                        >
                          <Icon className="w-4 h-4" strokeWidth={isActive ? 2.25 : 1.75} />
                        </motion.span>
                      </div>
                      <p className="text-[9px] font-mono text-[#64748B] mb-0.5">
                        {String(step.index).padStart(2, '0')}
                      </p>
                      <p
                        className={cn(
                          'text-[11px] font-semibold leading-tight',
                          isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]',
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-[8px] text-[#64748B] mt-1 leading-snug line-clamp-2 px-1">
                        {step.caption}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step badge */}
        <div className="mb-3 flex justify-start" data-journey-fade>
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[10px] font-mono uppercase tracking-[0.14em] text-[#C4B5FD]">
            {stepBadge}
          </span>
        </div>

        {/* Coded dashboard screen — JourneyFrame supplies the single border shell */}
        <div className="mb-8 relative" data-journey-fade>
          <div className="relative rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <JourneyDashboardVisual visual={active.visual} reducedMotion={reducedMotion} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl border border-white/10 bg-[#0B0B0F]/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
          data-journey-fade
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-12 h-12 shrink-0">
              <Image src="/phoenix-logo.png" alt="" fill className="object-contain" sizes="48px" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[#F8FAFC]">{SOLUTION_JOURNEY.cta.headline}</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-xl">{SOLUTION_JOURNEY.cta.sub}</p>
            </div>
          </div>
          <GradientPillButton href="/request-access" className="hover:scale-[1.02] transition-transform">
            {SOLUTION_JOURNEY.cta.button} →
          </GradientPillButton>
        </div>
      </div>
    </section>
  );
}
