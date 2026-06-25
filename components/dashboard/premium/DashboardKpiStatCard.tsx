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

  const content = (
    <div
      className={cn(
        'dashboard-card flex flex-col gap-2',
        compact ? cn('p-3', DASHBOARD_DENSITY.kpiMinH) : 'p-4 md:p-5 gap-3 min-h-[120px]',
        href && 'hover:border-primary/30 cursor-pointer transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-tight">
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
          'font-bold text-on-surface font-[family-name:var(--font-display)] tracking-tight',
          compact ? 'text-xl' : 'text-2xl'
        )}
      >
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
              <span className="text-on-surface-variant font-medium ml-0.5 hidden sm:inline">{deltaLabel}</span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-on-surface-variant truncate">{deltaLabel || ''}</span>
        )}
        {sparkline && sparkline.length > 1 && (
          <DashboardSparkline
            data={sparkline}
            stroke={sparklineStroke}
            className={compact ? 'h-6 w-16' : 'h-7 w-20'}
          />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
