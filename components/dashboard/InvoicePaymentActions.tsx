'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateInvoicePaymentFormAction } from '@/lib/services/billing-actions';
import { paymentMethodRequiresProof } from '@/lib/billing/payment-method';
import PaymentProofUpload from '@/components/billing/PaymentProofUpload';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface InvoicePaymentActionsProps {
  invoiceId: string;
  invoiceTotal: number;
  amountPaid: number;
  paymentStatus: string;
}

export default function InvoicePaymentActions({
  invoiceId,
  invoiceTotal,
  amountPaid,
  paymentStatus,
}: InvoicePaymentActionsProps) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remaining = Math.max(0, invoiceTotal - amountPaid);

  if (paymentStatus === 'paid' || remaining <= 0) {
    return null;
  }

  const handlePay = () => {
    const payAmount = amount ? parseFloat(amount) : remaining;
    if (!payAmount || payAmount <= 0 || payAmount > remaining + 0.001) {
      setMessage(`Enter an amount between ${formatCurrency(0.01)} and ${formatCurrency(remaining)}`);
      return;
    }
    if (paymentMethodRequiresProof(paymentMethod) && !paymentProof) {
      setMessage('Upload a payment receipt for card or bank transfer.');
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set(
        'payload',
        JSON.stringify({
          invoiceId,
          paymentMethod,
          paymentReference,
          amount: payAmount,
        })
      );
      if (paymentProof) {
        formData.set('proof', paymentProof);
      }
      const res = await updateInvoicePaymentFormAction(formData);
      if (res.success) {
        setAmount('');
        setPaymentReference('');
        setPaymentProof(null);
        router.refresh();
      } else {
        setMessage(res.error || 'Payment failed');
      }
    });
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <h3 className="text-sm font-bold text-on-surface">Record payment</h3>
      <p className="text-xs text-on-surface-variant">
        Remaining balance: <span className="font-bold text-amber-400">{formatCurrency(remaining)}</span>
      </p>
      {message && (
        <p className="text-xs text-destructive">{message}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min={0.01}
            max={remaining}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={remaining.toFixed(2)}
            className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
            Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              const method = e.target.value as typeof paymentMethod;
              setPaymentMethod(method);
              if (!paymentMethodRequiresProof(method)) setPaymentProof(null);
            }}
            className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs font-bold"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank transfer</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-on-surface-variant uppercase mb-1">
          Reference (optional)
        </label>
        <input
          type="text"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Transaction ID, auth code…"
          className="w-full px-3 py-2 border border-outline-variant rounded-xl text-xs"
        />
      </div>
      {paymentMethodRequiresProof(paymentMethod) && (
        <PaymentProofUpload file={paymentProof} onChange={setPaymentProof} required />
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={isPending}
        className="app-btn-primary app-focus-ring"
      >
        {isPending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CheckCircle2 className="size-3.5" />
            {amount ? 'Record partial payment' : 'Pay remaining balance'}
          </>
        )}
      </button>
    </div>
  );
}
