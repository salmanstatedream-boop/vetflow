'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { generateAiAnalyticsReportAction } from '@/lib/services/ai-analytics-actions';
import { useCurrency } from '@/lib/context/CurrencyContext';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface-container/40 border border-outline-variant/30">
      <span className="text-[9px] font-bold uppercase text-on-surface-variant">{label}</span>
      <p className="text-lg font-bold text-on-surface">{value}</p>
    </div>
  );
}

interface AiAnalyticsClientProps {
  showChartsLink?: boolean;
  onChartsLinkClick?: () => void;
}

export default function AiAnalyticsClient({
  showChartsLink = true,
  onChartsLinkClick,
}: AiAnalyticsClientProps) {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [narrative, setNarrative] = useState('');
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    generateAiAnalyticsReportAction().then((res) => {
      if (res.success) {
        setNarrative(res.narrative || '');
        setMetrics(res.metrics || null);
      } else {
        setError(res.error || 'Failed to generate report.');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-xs p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Revenue (MTD)" value={formatCurrency(metrics.paidTotal ?? 0, { decimals: 0 })} />
          <MetricCard label="Unpaid" value={formatCurrency(metrics.unpaidTotal ?? 0, { decimals: 0 })} />
          <MetricCard label="Visits (MTD)" value={String(metrics.visitCount)} />
          <MetricCard label="Low stock" value={String(metrics.lowStockCount)} />
        </div>
      )}
      <div className="glass-panel rounded-2xl border border-outline-variant/40 p-5">
        <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">{narrative}</p>
      </div>
      {showChartsLink && (
        <Link
          href="/dashboard/reports"
          onClick={onChartsLinkClick}
          className="text-xs text-primary font-bold hover:underline inline-block"
        >
          View detailed charts →
        </Link>
      )}
    </div>
  );
}
