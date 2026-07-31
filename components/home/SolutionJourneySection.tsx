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

const GLOW_MS = 3200;
const STEP_CARD_WIDTH = 118;
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

  const goNext = useCallback(() => {
    setActiveStep((i) => (i + 1) % steps.length);
  }, [steps.length]);

  useEffect(() => {
    if (reducedMotion || paused) return;
    const timer = window.setInterval(goNext, GLOW_MS);
    return () => window.clearInterval(timer);
  }, [goNext, paused, reducedMotion]);

  const active = steps[activeStep];

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="phx-section phx-section-alt overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header mb-10">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-journey-fade
          >
            {SOLUTION_JOURNEY.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-journey-fade>
            {SOLUTION_JOURNEY.headline[0]}{' '}
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {SOLUTION_JOURNEY.headline[1]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-journey-fade>
            {SOLUTION_JOURNEY.subheadline}
          </p>
        </div>

        <div
          ref={stepScrollRef}
          className="overflow-x-auto pb-2 mb-8 scrollbar-none xl:overflow-visible"
          data-journey-fade
        >
          <div className="relative min-w-max px-1 pt-1 mx-auto xl:flex xl:justify-center">
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
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                </svg>
              )}
              <div className="flex gap-2 relative">
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
                      onClick={() => setActiveStep(index)}
                      className="text-left shrink-0"
                      style={{ width: STEP_CARD_WIDTH }}
                    >
                      <motion.div
                        layout
                        animate={{
                          scale: isActive ? 1.02 : 0.98,
                          opacity: isActive ? 1 : 0.72,
                        }}
                        transition={reducedMotion ? { duration: 0 } : motionSpring}
                        className={cn(
                          'rounded-xl border p-2.5 h-full text-center',
                          isActive
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 ring-2 ring-[#8B5CF6]/35'
                            : 'border-white/10 bg-white/[0.03]',
                        )}
                        style={{
                          boxShadow: isActive
                            ? '0 0 40px rgba(139, 92, 246, 0.45), 0 0 12px rgba(139, 92, 246, 0.2)'
                            : 'none',
                        }}
                      >
                        <div className="flex justify-center mb-2 relative z-10">
                          <span
                            ref={(el) => {
                              badgeRefs.current[index] = el;
                            }}
                            className={cn(
                              'w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300',
                              isActive
                                ? 'bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]'
                                : 'bg-white/10 text-[#64748B] border border-white/10',
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                        </div>
                        <p className="text-[8px] font-mono text-[#64748B] mb-0.5">
                          {String(step.index).padStart(2, '0')}
                        </p>
                        <p
                          className={cn(
                            'text-[10px] font-semibold leading-tight',
                            isActive ? 'text-[#F8FAFC]' : 'text-[#94A3B8]',
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-[8px] text-[#64748B] mt-1 leading-snug line-clamp-2">
                          {step.caption}
                        </p>
                      </motion.div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 relative" data-journey-fade>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]"
          />
          <div className="relative rounded-2xl border border-white/10 ring-1 ring-white/[0.06] bg-[#0B1020] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <JourneyDashboardVisual visual={active.visual} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-[#0B1020]/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
          data-journey-fade
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-12 h-12 shrink-0">
              <Image src="/phoenix-logo.png" alt="" fill className="object-contain" />
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
