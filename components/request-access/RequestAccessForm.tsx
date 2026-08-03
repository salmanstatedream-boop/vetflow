'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { RequestAccessSchema, type RequestAccessInput } from '@/lib/validations/auth';
import { requestAccessAction } from '@/lib/services/auth-actions';
import { PRODUCT_NAME } from '@/lib/brand';

const inputCls =
  'w-full px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface';
const labelCls =
  'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2';

type RequestAccessFormProps = {
  /** When rendered inside the modal, provides a Close action on success. */
  onClose?: () => void;
  /** Preselect the clinic type dropdown (e.g. 'vet'). */
  defaultClinicType?: RequestAccessInput['clinicType'];
};

export default function RequestAccessForm({ onClose, defaultClinicType }: RequestAccessFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestAccessInput>({
    resolver: zodResolver(RequestAccessSchema),
    defaultValues: defaultClinicType ? { clinicType: defaultClinicType } : undefined,
  });

  const onSubmit = async (data: RequestAccessInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestAccessAction(data);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to submit your request.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-4 w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-full">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">Request received</h3>
        <p className="text-sm text-on-surface-variant/80 leading-relaxed">
          Thanks for your interest in {PRODUCT_NAME}. Our team will review your request and reach out
          to set up your clinic workspace.
        </p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 btn-sheen bg-primary text-on-primary py-3 px-6 rounded-2xl font-bold text-sm transition-all shadow-premium hover:opacity-90"
          >
            Close
          </button>
        ) : (
          <p className="mt-6 text-xs text-on-surface-variant/70">
            <Link href="/" className="text-primary font-semibold hover:underline">
              Back to home
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelCls}>Your name</label>
          <input {...register('fullName')} className={inputCls} placeholder="Jane Doe" />
          {errors.fullName && (
            <span className="text-xs text-destructive mt-1 block">{errors.fullName.message}</span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" {...register('email')} className={inputCls} placeholder="you@clinic.com" />
            {errors.email && (
              <span className="text-xs text-destructive mt-1 block">{errors.email.message}</span>
            )}
          </div>
          <div>
            <label className={labelCls}>Phone (optional)</label>
            <input {...register('phone')} className={inputCls} placeholder="+1 555 123 4567" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Clinic name</label>
            <input {...register('clinicName')} className={inputCls} placeholder="VetCare Center" />
            {errors.clinicName && (
              <span className="text-xs text-destructive mt-1 block">{errors.clinicName.message}</span>
            )}
          </div>
          <div>
            <label className={labelCls}>Clinic type</label>
            <select {...register('clinicType')} className={inputCls}>
              <option value="">Select…</option>
              <option value="vet">Veterinary</option>
              <option value="dental">Dental</option>
              <option value="general">General</option>
              <option value="specialty">Specialty</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelCls}>Message (optional)</label>
          <textarea
            {...register('message')}
            rows={3}
            className={inputCls}
            placeholder="Tell us about your clinic size, branches, and what you need."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 btn-sheen bg-primary text-on-primary py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-premium flex items-center justify-center gap-2 disabled:opacity-75 hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            'Request access'
          )}
        </button>
      </form>
    </>
  );
}
