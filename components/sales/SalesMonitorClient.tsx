'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/lib/context/CurrencyContext';
import {
  formatPaymentMethods,
  matchesPaymentFilter,
  PAYMENT_METHOD_LABELS,
  type PaymentFilter,
  type PaymentMethod,
} from '@/lib/billing/payment-method';
import {
  addDaysToYmd,
  getTodayYmdInTimezone,
  toLocalDateKey,
} from '@/lib/utils/timezones';
import { DollarSign, ShoppingBag, TrendingUp, Printer } from 'lucide-react';

export type RetailSaleRow = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName: string;
  total: number;
  itemSummary: string;
  itemLines: { name: string; quantity: number }[];
  soldByName: string;
  paymentMethods: PaymentMethod[];
};

interface SalesMonitorClientProps {
  sales: RetailSaleRow[];
  clinicTimezone: string;
}

export default function SalesMonitorClient({
  sales,
  clinicTimezone,
}: SalesMonitorClientProps) {
  const { formatCurrency } = useCurrency();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  const todayYmd = useMemo(() => getTodayYmdInTimezone(clinicTimezone), [clinicTimezone]);
  const thirtyDaysAgoYmd = useMemo(
    () => addDaysToYmd(todayYmd, -30),
    [todayYmd]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sales.filter((s) => {
      const d = toLocalDateKey(s.createdAt, clinicTimezone);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      if (!matchesPaymentFilter(paymentFilter, s.paymentMethods)) return false;
      if (!q) return true;
      return (
        s.customerName.toLowerCase().includes(q) ||
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.itemSummary.toLowerCase().includes(q)
      );
    });
  }, [sales, dateFrom, dateTo, search, paymentFilter, clinicTimezone]);

  const todaySales = useMemo(
    () => sales.filter((s) => toLocalDateKey(s.createdAt, clinicTimezone) === todayYmd),
    [sales, todayYmd, clinicTimezone]
  );

  const todayRevenue = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.total, 0),
    [todaySales]
  );

  const topProducts = useMemo(() => {
    const productQty = new Map<string, number>();
    for (const sale of sales) {
      if (toLocalDateKey(sale.createdAt, clinicTimezone) < thirtyDaysAgoYmd) continue;
      for (const item of sale.itemLines) {
        productQty.set(item.name, (productQty.get(item.name) || 0) + item.quantity);
      }
    }
    return [...productQty.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [sales, thirtyDaysAgoYmd, clinicTimezone]);

  const filteredRevenue = useMemo(
    () => filtered.reduce((sum, s) => sum + s.total, 0),
    [filtered]
  );

  const usingDateFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase">
              {usingDateFilter ? 'Filtered retail revenue' : "Today's retail revenue"}
            </span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {formatCurrency(usingDateFilter ? filteredRevenue : todayRevenue)}
          </p>
          {usingDateFilter && (
            <p className="text-[10px] text-on-surface-variant mt-1">
              {filtered.length} transaction{filtered.length === 1 ? '' : 's'} in range
            </p>
          )}
        </div>
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase">
              {usingDateFilter ? 'Transactions in range' : 'Transactions today'}
            </span>
          </div>
          <p className="text-2xl font-black text-on-surface">
            {usingDateFilter ? filtered.length : todaySales.length}
          </p>
        </div>
        <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5">
          <div className="flex items-center gap-2 text-on-surface-variant mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase">Top products (30d)</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-on-surface-variant/60 italic">No data yet</p>
          ) : (
            <ul className="text-xs space-y-1">
              {topProducts.slice(0, 5).map((p) => (
                <li key={p.name} className="flex justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <span className="font-bold shrink-0">{p.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'cash', 'card', 'bank_transfer'] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPaymentFilter(method)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-colors ${
              paymentFilter === method
                ? 'bg-primary text-white'
                : 'bg-surface-container border border-outline-variant text-on-surface-variant'
            }`}
          >
            {method === 'all' ? 'All payments' : PAYMENT_METHOD_LABELS[method]}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search customer, invoice #…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-outline-variant rounded-xl text-xs"
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="px-3 py-2 border border-outline-variant rounded-xl text-xs"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="px-3 py-2 border border-outline-variant rounded-xl text-xs"
          title="To date"
        />
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant text-on-surface-variant hover:text-on-surface"
          >
            Clear dates
          </button>
        )}
        <Link
          href="/dashboard/sales/new"
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold text-center"
        >
          New sale
        </Link>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-surface-container/40 border-b border-outline-variant/30 text-[10px] uppercase text-on-surface-variant">
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Sold by</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-on-surface-variant/60 italic">
                  No retail sales match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container/20">
                  <td className="px-5 py-3 text-on-surface-variant">
                    {new Date(s.createdAt).toLocaleString(undefined, { timeZone: clinicTimezone })}
                  </td>
                  <td className="px-5 py-3 font-mono font-bold">{s.invoiceNumber}</td>
                  <td className="px-5 py-3">{s.customerName}</td>
                  <td className="px-5 py-3 text-on-surface-variant max-w-xs truncate">{s.itemSummary}</td>
                  <td className="px-5 py-3 text-on-surface-variant">{s.soldByName}</td>
                  <td className="px-5 py-3 text-on-surface-variant capitalize">
                    {formatPaymentMethods(s.paymentMethods)}
                  </td>
                  <td className="px-5 py-3 text-right font-bold">{formatCurrency(s.total)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/invoices/${s.id}`} className="text-primary font-bold hover:underline">
                        View
                      </Link>
                      <a
                        href={`/api/invoices/${s.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-primary"
                        title="Print PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
