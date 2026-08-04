'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, FileText, Pill, RotateCcw } from 'lucide-react';
import { reopenConsultationForEditAction } from '@/lib/services/visit-actions';
import { formatPrescriptionDosage } from '@/lib/prescriptions/format-dosage';
import Button from '@/components/ui/premium/Button';
import { btnPrimaryClass } from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';
import { celsiusToFahrenheit, roundTemp } from '@/lib/utils/temperature';

export type FinalDraftRxItem = {
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
};

export type FinalDraftNotes = {
  chiefComplaint: string | null;
  history: string | null;
  examinationFindings: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  followUpRecommendation: string | null;
  temperatureC: number | null;
  heartRateBpm: number | null;
  respiratoryRate: number | null;
  weightKg: number | null;
  bodyConditionScore: number | null;
};

type FinalDraftPreviewClientProps = {
  visitId: string;
  petName: string;
  petSpecies: string | null;
  petBreed: string | null;
  ownerName: string;
  doctorName: string;
  diagnosis: string | null;
  notes: FinalDraftNotes | null;
  rxItems: FinalDraftRxItem[];
  noPrescription: boolean;
  services: { name: string; quantity: number; unitPrice: number }[];
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
  const text =
    value === null || value === undefined || value === ''
      ? '—'
      : String(value);
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70">
        {label}
      </p>
      <p className="text-xs text-on-surface whitespace-pre-wrap leading-relaxed">{text}</p>
    </div>
  );
}

export default function FinalDraftPreviewClient({
  visitId,
  petName,
  petSpecies,
  petBreed,
  ownerName,
  doctorName,
  diagnosis,
  notes,
  rxItems,
  noPrescription,
  services,
}: FinalDraftPreviewClientProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<'edit' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBackToEdit = async () => {
    setBusy('edit');
    setError(null);
    const res = await reopenConsultationForEditAction(visitId);
    setBusy(null);
    if (res.success) {
      router.replace(`/dashboard/doctors/${visitId}`);
    } else {
      setError(res.error || 'Could not reopen consultation.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
            Final draft
          </p>
          <h2 className="text-lg font-bold text-on-surface">
            Review before checkout — {petName}
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
            Side-by-side preview of how the prescription and medical file will look. Confirm to
            continue to Checkout &amp; Discharge.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleBackToEdit()}
            disabled={busy !== null}
            loading={busy === 'edit'}
            icon={busy !== 'edit' ? <RotateCcw className="size-3.5" /> : undefined}
          >
            Back to consultation
          </Button>
          <Link
            href={`/dashboard/invoices/create/${visitId}`}
            className={cn(btnPrimaryClass, 'app-focus-ring')}
          >
            <CheckCircle2 className="size-3.5" />
            Confirm &amp; continue to checkout
          </Link>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
          {error}
        </p>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Prescription preview */}
        <section className="relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <Pill className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-on-surface">Prescription (as printed)</h3>
          </div>
          <div className="space-y-4 text-on-surface">
            <div className="flex justify-between gap-3 text-[11px]">
              <div>
                <p className="font-bold text-sm">Veterinary Prescription</p>
                <p className="text-on-surface-variant mt-1">
                  Patient: {petName}
                  {petSpecies ? ` · ${petSpecies}` : ''}
                  {petBreed ? ` (${petBreed})` : ''}
                </p>
                <p className="text-on-surface-variant">Owner: {ownerName}</p>
              </div>
              <div className="text-right text-on-surface-variant">
                <p>Dr. {doctorName}</p>
                <p>Status: Finalized</p>
              </div>
            </div>
            <Field label="Clinical diagnosis" value={diagnosis} />
            {noPrescription || rxItems.length === 0 ? (
              <p className="text-xs text-on-surface-variant italic py-6 text-center border border-dashed border-white/10 rounded-xl">
                {noPrescription
                  ? 'No prescription marked for this visit.'
                  : 'No prescription items recorded.'}
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  Rx
                </p>
                {rxItems.map((item, i) => (
                  <div
                    key={`${item.medicineName}-${i}`}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 space-y-1"
                  >
                    <p className="text-xs font-bold">
                      {i + 1}. {item.medicineName}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {formatPrescriptionDosage(item.dosage, item.medicineName)}
                      {item.frequency ? ` · ${item.frequency}` : ''}
                      {item.duration ? ` · ${item.duration}` : ''}
                    </p>
                    {item.instructions ? (
                      <p className="text-[11px] text-on-surface-variant/80">{item.instructions}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Medical file preview */}
        <section className="relative rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-on-surface">Medical file (this visit)</h3>
          </div>
          <div className="space-y-3.5">
            <Field label="Chief complaint" value={notes?.chiefComplaint} />
            <Field label="History" value={notes?.history} />
            <Field label="Examination findings" value={notes?.examinationFindings} />
            <Field label="Diagnosis" value={notes?.diagnosis ?? diagnosis} />
            <Field label="Treatment plan" value={notes?.treatmentPlan} />
            <Field label="Follow-up" value={notes?.followUpRecommendation} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <Field
                label="Temp °F"
                value={
                  notes?.temperatureC != null
                    ? roundTemp(celsiusToFahrenheit(notes.temperatureC), 1)
                    : null
                }
              />
              <Field label="HR bpm" value={notes?.heartRateBpm} />
              <Field label="RR" value={notes?.respiratoryRate} />
              <Field label="Weight kg" value={notes?.weightKg} />
              <Field label="BCS" value={notes?.bodyConditionScore} />
            </div>
            {services.length > 0 ? (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  Services to bill
                </p>
                {services.map((s, i) => (
                  <p key={`${s.name}-${i}`} className="text-xs text-on-surface">
                    {s.name} ×{s.quantity} @ {s.unitPrice}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
