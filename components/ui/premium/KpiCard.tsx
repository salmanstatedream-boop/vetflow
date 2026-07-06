import type { LucideIcon } from 'lucide-react';
import { DASHBOARD_DENSITY } from '@/lib/ui/dashboard-tokens';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  const valueStr = String(value);

  return (
    <div
      className={cn(
        'glass-panel p-4 md:p-5 flex flex-col h-full',
        DASHBOARD_DENSITY.kpiCompactH,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant leading-snug line-clamp-2">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl dashboard-kpi-icon flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p
        className={cn(
          'font-bold text-on-surface font-[family-name:var(--font-display)] shrink-0 tabular-nums break-words leading-tight',
          valueStr.length > 10 ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          'text-[10px] font-semibold mt-auto shrink-0 line-clamp-2 leading-snug',
          DASHBOARD_DENSITY.kpiFooterH,
          trend ? 'text-secondary' : 'text-transparent select-none'
        )}
      >
        {trend || '\u00a0'}
      </p>
    </div>
  );
}
