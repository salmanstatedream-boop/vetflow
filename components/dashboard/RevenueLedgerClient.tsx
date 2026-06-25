'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  createExpenseAction,
  deleteExpenseAction,
  upsertExpenseCategoryAction,
} from '@/lib/services/revenue-actions';
import { useCurrency } from '@/lib/context/CurrencyContext';
import Select from '@/components/ui/premium/Select';
import KpiCard from '@/components/ui/premium/KpiCard';
import { DollarSign, TrendingDown, TrendingUp, Plus, Trash2, Loader2 } from 'lucide-react';
import type { RevenueSummary } from '@/lib/services/revenue-actions';

type ExpenseCategory = {
  id: string;
  name: string;
  is_system: boolean;
};

type ExpenseRow = {
  id: string;
  amount: number;
  expense_date: string;
  source: string;
  notes: string | null;
  category_id: string;
  expense_categories: { name: string } | null;
};

interface RevenueLedgerClientProps {
  activeBranchId: string;
  initialSummary: RevenueSummary;
  initialExpenses: ExpenseRow[];
  categories: ExpenseCategory[];
  dateFrom: string;
  dateTo: string;
}

export default function RevenueLedgerClient({
  activeBranchId,
  initialSummary,
  initialExpenses,
  categories,
  dateFrom: initialFrom,
  dateTo: initialTo,
}: RevenueLedgerClientProps) {
  const { formatCurrency } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [form, setForm] = useState({
    categoryId: categories[0]?.id || '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const applyRange = () => {
    startTransition(() => {
      router.push(
        `/dashboard/revenue?from=${encodeURIComponent(dateFrom)}&to=${encodeURIComponent(dateTo)}`
      );
    });
  };

  const handleAddExpense = async () => {
    const amount = Number(form.amount);
    if (!form.categoryId || !Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid amount and category.');
      return;
    }
    setSaving(true);
    setError(null);
    const res = await createExpenseAction({
      branchId: activeBranchId,
      categoryId: form.categoryId,
      amount,
      expenseDate: form.expenseDate,
      notes: form.notes,
    });
    setSaving(false);
    if (res.success) {
      setShowForm(false);
      setForm((f) => ({ ...f, amount: '', notes: '' }));
      router.refresh();
    } else {
      setError(res.error || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense entry?')) return;
    const res = await deleteExpenseAction(id);
    if (res.success) router.refresh();
    else alert(res.error || 'Delete failed');
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    const res = await upsertExpenseCategoryAction({ name });
    if (res.success) {
      setNewCategory('');
      router.refresh();
    } else {
      alert(res.error || 'Failed to add category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
          />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={applyRange}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/95 disabled:opacity-60"
        >
          {isPending ? 'Loading…' : 'Apply range'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Gross revenue"
          value={formatCurrency(initialSummary.grossRevenue)}
          icon={TrendingUp}
          trend="Paid invoices"
        />
        <KpiCard
          label="Expenses"
          value={formatCurrency(initialSummary.totalExpenses)}
          icon={TrendingDown}
          trend="Ledger entries"
        />
        <KpiCard
          label="Net revenue"
          value={formatCurrency(initialSummary.netRevenue)}
          icon={DollarSign}
          trend="Gross − expenses"
        />
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-on-surface">Expenses</h3>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container-high"
          >
            <Plus className="w-3.5 h-3.5" />
            Add expense
          </button>
        </div>

        {showForm && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-container/20 border border-outline-variant/30">
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              options={categoryOptions}
            />
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-on-surface/80 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddExpense}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Save expense'}
              </button>
              {error && <span className="text-xs text-destructive">{error}</span>}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead>
              <tr className="text-[9px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/40">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Notes</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {initialExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant italic">
                    No expenses in this period.
                  </td>
                </tr>
              ) : (
                initialExpenses.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pr-3">{row.expense_date}</td>
                    <td className="py-2.5 pr-3 font-medium">
                      {row.expense_categories?.name || '—'}
                    </td>
                    <td className="py-2.5 pr-3 capitalize text-on-surface-variant">
                      {row.source.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 pr-3 text-on-surface-variant max-w-[200px] truncate">
                      {row.notes || '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-bold">
                      {formatCurrency(Number(row.amount))}
                    </td>
                    <td className="py-2.5 text-right">
                      {row.source === 'manual' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-6 space-y-3">
        <h3 className="text-sm font-bold text-on-surface">Expense categories</h3>
        <p className="text-xs text-on-surface-variant">
          System categories: Clinic bills, Staff pay, Restock, Other. Add custom categories below.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-outline-variant/50 bg-surface-container/30"
            >
              {c.name}
              {c.is_system ? ' (system)' : ''}
            </span>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-3 py-2 rounded-xl border border-outline-variant/80 bg-surface-container/30 text-sm"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-outline-variant hover:bg-surface-container-high"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
