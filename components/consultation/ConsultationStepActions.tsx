'use client';

import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { SoapFlowTab } from '@/components/consultation/SoapTabBar';

interface ConsultationStepActionsProps {
  activeTab: SoapFlowTab;
  tabTitle: string;
  onPrevious: () => void;
  onNext: () => void;
  onFinalize?: () => void;
  isSubmitting?: boolean;
  savingDraft?: boolean;
  tabTransitioning?: boolean;
  consultPaused?: boolean;
  showFinalize?: boolean;
}

export default function ConsultationStepActions({
  activeTab,
  tabTitle,
  onPrevious,
  onNext,
  onFinalize,
  isSubmitting = false,
  savingDraft = false,
  tabTransitioning = false,
  consultPaused = false,
  showFinalize = false,
}: ConsultationStepActionsProps) {
  const isFirst = activeTab === 'S';
  const isLast = activeTab === 'Rx';
  const busy = savingDraft || tabTransitioning || isSubmitting;

  return (
    <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-outline-variant/30">
      <div className="min-w-0">
        {!isFirst && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={busy}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant text-on-surface hover:bg-surface-container-high disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
        )}
      </div>
      <span className="text-[10px] text-on-surface-variant font-semibold hidden sm:inline truncate">
        {tabTitle}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            disabled={busy || consultPaused}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20 disabled:opacity-40 transition-colors"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading…
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
        {showFinalize && isLast && onFinalize && (
          <button
            type="button"
            onClick={onFinalize}
            disabled={busy || consultPaused}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Finalizing…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalize Consultation
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
