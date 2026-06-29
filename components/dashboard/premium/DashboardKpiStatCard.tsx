'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { DASHBOARD_DENSITY } from '@/lib/ui/dashboard-tokens';
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
  density?: 'default' | 'compact';
  href?: string;
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
  density = 'default',
  href,
}: DashboardKpiStatCardProps) {
  const compact = density === 'compact';
  const positive = deltaPercent != null && deltaPercent >= 0;
  const hasDelta = deltaPercent != null && Number.isFinite(deltaPercent);
  const showSparkline = Boolean(sparkline && sparkline.length > 1);
  const valueStr = String(value);

  const content = (
    <div
      className={cn(
        'dashboard-card flex flex-col h-full',
        compact
          ? cn('p-3.5 md:p-4 gap-2.5', DASHBOARD_DENSITY.kpiCompactH)
          : cn('p-4 md:p-5 gap-3', DASHBOARD_DENSITY.kpiDefaultH),
        href && 'hover:border-primary/30 cursor-pointer transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 shrink-0">
        <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant leading-snug line-clamp-2 min-h-[2rem]">
          {label}
        </span>
        <div
          className={cn(
            'rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br',
            compact ? 'w-8 h-8' : 'w-9 h-9',
            accentClass
          )}
        >
          <Icon className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4', iconTextClass)} />
        </div>
      </div>
      <p
        className={cn(
          'font-bold text-on-surface font-[family-name:var(--font-display)] tracking-tight shrink-0 tabular-nums break-words leading-tight',
          compact
            ? valueStr.length > 10
              ? 'text-lg'
              : 'text-xl md:text-2xl'
            : 'text-2xl'
        )}
      >
        {value}
      </p>
      <div
        className={cn(
          'mt-auto shrink-0 flex flex-col gap-1.5 2xl:flex-row 2xl:items-end 2xl:justify-between 2xl:gap-2',
          DASHBOARD_DENSITY.kpiFooterH
        )}
      >
        <div className="min-w-0">
          {hasDelta ? (
            <div
              className={cn(
                'inline-flex flex-wrap items-center gap-0.5 text-[10px] font-bold leading-snug',
                positive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {positive ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
              {positive ? '+' : ''}
              {deltaPercent!.toFixed(0)}%
              {deltaLabel && (
                <span className="text-on-surface-variant font-medium">{deltaLabel}</span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-on-surface-variant line-clamp-2 leading-snug block">
              {deltaLabel || '\u00a0'}
            </span>
          )}
        </div>
        {showSparkline && (
          <div className={cn('shrink-0 w-full 2xl:w-auto', DASHBOARD_DENSITY.kpiSparklineW, 'h-7')}>
            <DashboardSparkline
              data={sparkline!}
              stroke={sparklineStroke}
              className="h-full w-full max-h-7"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
