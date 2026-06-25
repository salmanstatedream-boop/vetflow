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
  return (
    <div
      className={cn(
        'glass-panel p-5 flex flex-col h-full',
        DASHBOARD_DENSITY.kpiCompactH,
        className
      )}
    >
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)] shrink-0 truncate">
        {value}
      </p>
      <p
        className={cn(
          'text-[10px] font-semibold mt-auto shrink-0 truncate',
          DASHBOARD_DENSITY.kpiFooterH,
          trend ? 'text-secondary' : 'text-transparent select-none'
        )}
      >
        {trend || '\u00a0'}
      </p>
    </div>
  );
}
