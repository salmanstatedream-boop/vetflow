'use client';

import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardSparkline from './DashboardSparkline';

interface DashboardKpiStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentClass?: string;
  iconTextClass?: string;
  sparklineStroke?: string;
  sparkline?: number[];
  deltaPercent?: number | null;
  deltaLabel?: string;
  className?: string;
}

export default function DashboardKpiStatCard({
  label,
  value,
  icon: Icon,
  accentClass = 'from-violet-500/20 to-purple-600/10',
  iconTextClass = 'text-violet-400',
  sparklineStroke = '#A855F7',
  sparkline,
  deltaPercent,
  deltaLabel,
  className,
}: DashboardKpiStatCardProps) {
  const positive = deltaPercent != null && deltaPercent >= 0;
  const hasDelta = deltaPercent != null && Number.isFinite(deltaPercent);

  return (
    <div className={cn('dashboard-card p-4 md:p-5 flex flex-col gap-3 min-h-[120px]', className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-tight">
          {label}
        </span>
        <div
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br',
            accentClass
          )}
        >
          <Icon className={cn('w-4 h-4', iconTextClass)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)] tracking-tight">
        {value}
      </p>
      <div className="flex items-end justify-between gap-2 mt-auto">
        {hasDelta ? (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 text-[10px] font-bold',
              positive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {positive ? '+' : ''}
            {deltaPercent!.toFixed(0)}%
            {deltaLabel && (
              <span className="text-on-surface-variant font-medium ml-0.5">{deltaLabel}</span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-on-surface-variant">{deltaLabel || ''}</span>
        )}
        {sparkline && sparkline.length > 1 && (
          <DashboardSparkline data={sparkline} stroke={sparklineStroke} className="h-7 w-20" />
        )}
      </div>
    </div>
  );
}
