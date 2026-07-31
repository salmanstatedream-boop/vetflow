'use client';

import { AlertCircle, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import ProblemChaosDesk from '@/components/home/problem-chaos-desk/ProblemChaosDesk';
import { PROBLEM_SECTION } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, { selector: '[data-problem-fade]', staggerMs: 70, y: 20 });

  const { costCard } = PROBLEM_SECTION;

  return (
    <section ref={sectionRef} id="problem" className="phx-section phx-section-alt relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] gap-10 lg:gap-12 items-center">
          {/* Left column — three stacked blocks, shared left edge + rhythm */}
          <div className="flex flex-col gap-5 w-full max-w-xl">
            <div data-problem-fade className="w-full">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[#C4B5FD] text-[11px] font-mono uppercase tracking-[0.2em] mb-6">
                {PROBLEM_SECTION.eyebrow}
              </span>

              <h2 className="phx-heading text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15] mb-4">
                {PROBLEM_SECTION.headline[0]}{' '}
                <span className="bg-gradient-to-r from-[#A855F7] to-[#3B82F6] bg-clip-text text-transparent">
                  {PROBLEM_SECTION.headline[1]}
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed mb-6">
                Every clinic runs on too many tools, scattered data, and manual work. Interruptions never
                stop. Delays cost time. And time{' '}
                <span className="text-[#A78BFA] font-medium">costs revenue</span>.
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-[#64748B]">
                <span className="inline-flex flex-col items-center justify-center w-6 h-9 rounded-full border border-white/15">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                </span>
                {PROBLEM_SECTION.scrollHint}
              </div>
            </div>

            <div
              className="w-full rounded-2xl border border-[#8B5CF6]/30 bg-[#0B1020]/80 p-5 sm:p-6 shadow-[0_0_40px_rgba(139,92,246,0.12)]"
              data-problem-fade
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#A78BFA] mb-1">
                {costCard.title}
              </p>
              <p className="text-sm text-[#94A3B8] mb-4">{costCard.subtitle}</p>
              <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent leading-none">
                {costCard.total}
              </p>
              <p className="text-sm text-[#64748B] mt-2 mb-5">{costCard.totalLabel}</p>

              <ul className="space-y-2.5 mb-5">
                {costCard.lineItems.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[#CBD5E1]">
                      <span className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                      </span>
                      {item.label}
                    </span>
                    <span className="font-semibold text-[#F87171] tabular-nums">{item.amount}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F8FAFC]">
                  {costCard.totalFooterLabel}
                </span>
                <span className="text-lg font-bold text-[#F97316] tabular-nums">{costCard.total}</span>
              </div>
            </div>

            <div
              className="w-full rounded-2xl border border-[#F97316]/35 bg-gradient-to-r from-[#F97316]/15 via-[#F97316]/10 to-transparent p-4 sm:p-5 shadow-[0_0_32px_rgba(249,115,22,0.12)]"
              data-problem-fade
            >
              <div className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-[#F97316]/20 border border-[#F97316]/45 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(249,115,22,0.25)]">
                  <AlertCircle className="w-5 h-5 text-[#FDBA74]" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FDBA74]/90 mb-0.5">
                    Daily reality
                  </p>
                  <p className="text-base sm:text-lg text-[#E2E8F0] leading-snug">
                    And this repeats all day.{' '}
                    <span className="font-semibold text-[#FDBA74]">Every day.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right chaos canvas */}
          <div data-problem-fade className="w-full">
            <ProblemChaosDesk />
          </div>
        </div>
      </div>
    </section>
  );
}
