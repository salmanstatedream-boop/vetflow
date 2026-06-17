export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export type PaymentFilter = 'all' | PaymentMethod;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank transfer',
};

export function paymentMethodRequiresProof(method: string): boolean {
  return method === 'card' || method === 'bank_transfer';
}

export function getInvoicePaymentMethods(
  payments: { payment_method: string }[] | null | undefined
): PaymentMethod[] {
  if (!payments?.length) return [];
  const methods = new Set<PaymentMethod>();
  for (const p of payments) {
    if (p.payment_method === 'cash' || p.payment_method === 'card' || p.payment_method === 'bank_transfer') {
      methods.add(p.payment_method);
    }
  }
  return [...methods];
}

export function formatPaymentMethods(methods: PaymentMethod[]): string {
  if (methods.length === 0) return '—';
  return methods.map((m) => PAYMENT_METHOD_LABELS[m]).join(', ');
}

export function matchesPaymentFilter(filter: PaymentFilter, methods: PaymentMethod[]): boolean {
  if (filter === 'all') return true;
  if (methods.length === 0) return false;
  return methods.includes(filter);
}
