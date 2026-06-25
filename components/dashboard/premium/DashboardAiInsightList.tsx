'use client';

import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function insightIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('revenue') && (lower.includes('up') || lower.includes('down'))) {
    return lower.includes('down') ? TrendingDown : TrendingUp;
  }
  if (lower.includes('inventory') || lower.includes('stock') || lower.includes('reorder')) {
    return AlertTriangle;
  }
  if (lower.includes('follow-up') || lower.includes('appointment') || lower.includes('utilization')) {
    return Calendar;
  }
  return Sparkles;
}

function insightColor(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('down') || lower.includes('below') || lower.includes('alert')) {
    return 'text-amber-400 bg-amber-500/15 border-amber-500/25';
  }
  if (lower.includes('up') || lower.includes('above')) {
    return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25';
  }
  return 'text-violet-400 bg-violet-500/15 border-violet-500/25';
}

interface DashboardAiInsightListProps {
  insights: string[];
  reportHref?: string;
}

export default function DashboardAiInsightList({
  insights,
  reportHref = '/dashboard/reports',
}: DashboardAiInsightListProps) {
  if (insights.length === 0) {
    return <p className="text-[10px] text-on-surface-variant italic py-4 text-center">No insights for today.</p>;
  }

  return (
    <div className="flex flex-col min-h-0">
      <ul className="space-y-2">
        {insights.map((line, i) => {
          const Icon = insightIcon(line);
          const color = insightColor(line);
          return (
            <li key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  'w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5',
                  color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <p className="text-[10px] text-on-surface-variant leading-relaxed flex-1">{line}</p>
            </li>
          );
        })}
      </ul>
      <Link
        href={reportHref}
        className="mt-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:text-primary/80"
      >
        View full report
        <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
