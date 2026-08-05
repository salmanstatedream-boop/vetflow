'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Modal from '@/components/ui/premium/Modal';
import { generateSurgeryTemplateAction } from '@/lib/services/surgery-template-actions';
import type { SurgeryTemplateFields } from '@/lib/ai/surgery-template';
import type { TreatmentPlanObjectiveInput } from '@/lib/ai/treatment-plan-template';

type SurgeryAiTemplateButtonProps = {
  visitId: string;
  diagnosis: string;
  existing: {
    treatmentPlan: string;
    procedureNotes: string;
    postOpMedication: string;
  };
  objective?: TreatmentPlanObjectiveInput;
  disabled?: boolean;
  onApply: (fields: SurgeryTemplateFields, mode: 'replace' | 'empty_only') => void;
  onRequireDiagnosis: () => void;
};

export default function SurgeryAiTemplateButton({
  visitId,
  diagnosis,
  existing,
  objective,
  disabled,
  onApply,
  onRequireDiagnosis,
}: SurgeryAiTemplateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const anyExisting =
    Boolean(existing.treatmentPlan.trim()) ||
    Boolean(existing.procedureNotes.trim()) ||
    Boolean(existing.postOpMedication.trim());

  const runGenerate = async (mode: 'replace' | 'empty_only') => {
    setConfirmOpen(false);
    setLoading(true);
    setError(null);
    try {
      const res = await generateSurgeryTemplateAction({
        visitId,
        diagnosis,
        objective,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      onApply(res.fields, mode);
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
    if (anyExisting) {
      setConfirmOpen(true);
      return;
    }
    void runGenerate('replace');
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? 'Drafting…' : 'AI Template'}
      </button>
      {error ? (
        <p className="text-[10px] text-destructive" role="alert">
          {error}
        </p>
      ) : !loading ? (
        <p className="text-[10px] text-on-surface-variant/80">
          Surgery draft from diagnosis + prior surgery notes (Groq).
        </p>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Apply surgery AI template?"
        description="One or more surgery plan fields already have text. Replace all three, or only fill empty fields?"
        size="sm"
      >
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            onClick={() => void runGenerate('replace')}
            className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary/90"
          >
            Replace all
          </button>
          <button
            type="button"
            onClick={() => void runGenerate('empty_only')}
            className="flex-1 min-w-[100px] px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant/60 text-on-surface hover:bg-surface-container-high"
          >
            Fill empty only
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
