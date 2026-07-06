'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { RequestAccessSchema, type RequestAccessInput } from '@/lib/validations/auth';
import { requestAccessAction } from '@/lib/services/auth-actions';
import AuthPageShell from '@/components/layout/AuthPageShell';
import RequestAccessLayout from '@/components/request-access/RequestAccessLayout';
import { PRODUCT_NAME } from '@/lib/brand';
import { Loader2, CheckCircle2 } from 'lucide-react';

const inputCls =
  'w-full px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface';
const labelCls =
  'block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2';

export default function RequestAccessPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestAccessInput>({
    resolver: zodResolver(RequestAccessSchema),
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
      <AuthPageShell
        title="Request"
        titleAccent="received"
        subtitle="Trustworthy veterinary business platform"
        headerIcon={
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-full">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        }
        footer={
          <Link href="/" className="text-primary font-semibold hover:underline">
            Back to home
          </Link>
        }
      >
        <p className="text-sm text-on-surface-variant/80 text-center leading-relaxed">
          Thanks for your interest in {PRODUCT_NAME}. Our team will review your request and reach out to
          set up your clinic workspace.
        </p>
      </AuthPageShell>
    );
  }

  return (
    <RequestAccessLayout
      title="Request"
      titleAccent="access"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </>
      }
    >
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
    </RequestAccessLayout>
  );
}
