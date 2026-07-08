'use client';

import { useRef } from 'react';
import OverviewDashboardVisual from '@/components/home/overview-dashboard-visual/OverviewDashboardVisual';
import { DASHBOARD_PREVIEW } from '@/lib/home-data';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export default function DashboardPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, { selector: '[data-dashboard-fade]', staggerMs: 70, y: 20 });

  return (
    <section ref={sectionRef} id="dashboard" className="phx-section phx-section-alt relative overflow-hidden">
      <div aria-hidden className="phx-section-divider" />
      <div className="phx-container relative">
        <div className="text-center max-w-3xl mx-auto phx-section-header">
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE] text-[11px] font-mono uppercase tracking-[0.2em] mb-6"
            data-dashboard-fade
          >
            {DASHBOARD_PREVIEW.eyebrow}
          </span>
          <h2 className="phx-heading text-3xl sm:text-4xl lg:text-5xl mb-4" data-dashboard-fade>
            {DASHBOARD_PREVIEW.headline[0]}{' '}
            <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
              {DASHBOARD_PREVIEW.headline[1]}
            </span>
          </h2>
          <p className="phx-subtext text-lg" data-dashboard-fade>
            {DASHBOARD_PREVIEW.subheadline}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto" data-dashboard-fade>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 bg-gradient-to-br from-[#22D3EE]/8 via-transparent to-[#8B5CF6]/8 blur-3xl"
          />
          <div className="relative rounded-2xl border border-white/10 bg-[#0B1020] overflow-x-auto shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <OverviewDashboardVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
