'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/premium/Modal';
import { generateTreatmentPlanTemplateAction } from '@/lib/services/treatment-plan-template-actions';
import type { TreatmentPlanObjectiveInput } from '@/lib/ai/treatment-plan-template';

type TreatmentPlanAiTemplateButtonProps = {
  visitId: string;
  diagnosis: string;
  existingPlan: string;
  objective: TreatmentPlanObjectiveInput;
  disabled?: boolean;
  onApply: (planText: string, mode: 'replace' | 'append') => void;
  onRequireDiagnosis: () => void;
};

export default function TreatmentPlanAiTemplateButton({
  visitId,
  diagnosis,
  existingPlan,
  objective,
  disabled,
  onApply,
  onRequireDiagnosis,
}: TreatmentPlanAiTemplateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const runGenerate = async (mode: 'replace' | 'append') => {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await generateTreatmentPlanTemplateAction({
        visitId,
        diagnosis,
        objective,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      onApply(res.planText, mode);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setError(null);
    if (!diagnosis.trim()) {
      onRequireDiagnosis();
      return;
    }
    if (existingPlan.trim()) {
      setConfirmOpen(true);
      return;
    }
    void runGenerate('replace');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Drafting…' : 'AI template (Groq)'}
        </button>
        <p className="text-[10px] text-on-surface-variant/70">
          Uses diagnosis, vitals, patient history, and similar clinic plans.
        </p>
      </div>
      {error && (
        <p className="text-[11px] text-destructive" role="alert">
          {error}
        </p>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Apply AI treatment plan?"
        description="Treatment Plan already has text. Replace it, or append the AI draft below?"
        size="sm"
      >
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => void runGenerate('replace')}
            className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary/90"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => void runGenerate('append')}
            className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant/60 text-on-surface hover:bg-surface-container-high"
          >
            Append
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
