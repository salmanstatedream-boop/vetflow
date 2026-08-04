'use client';

import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { SoapFlowTab } from '@/components/consultation/SoapTabBar';
import Button from '@/components/ui/premium/Button';

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
          <Button
            type="button"
            variant="secondary"
            onClick={onPrevious}
            disabled={busy}
            icon={<ChevronLeft className="size-3.5" />}
          >
            Previous
          </Button>
        )}
      </div>
      <span className="text-[10px] text-on-surface-variant font-semibold hidden sm:inline truncate">
        {tabTitle}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {!isLast && (
          <Button
            type="button"
            variant="soft"
            onClick={onNext}
            disabled={busy || consultPaused}
            loading={busy}
          >
            {!busy ? (
              <>
                Next
                <ChevronRight className="size-3.5" />
              </>
            ) : (
              'Loading…'
            )}
          </Button>
        )}
        {showFinalize && isLast && onFinalize && (
          <Button
            type="button"
            variant="primary"
            onClick={onFinalize}
            disabled={busy || consultPaused}
            loading={isSubmitting}
            icon={!isSubmitting ? <CheckCircle2 className="size-3.5" /> : undefined}
          >
            {isSubmitting ? 'Finalizing…' : 'Finalize Consultation'}
          </Button>
        )}
      </div>
    </div>
  );
}
