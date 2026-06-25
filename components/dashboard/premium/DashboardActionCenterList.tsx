'use client';

import Link from 'next/link';
import { Receipt, Layers, BadgeCheck, Calendar, ChevronRight } from 'lucide-react';
import type { AdminActionItem } from '@/lib/dashboard/admin-overview.types';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<
  AdminActionItem['variant'],
  { icon: typeof Receipt; chip: string; iconClass: string }
> = {
  warning: { icon: Receipt, chip: 'bg-amber-500/15 border-amber-500/25', iconClass: 'text-amber-400' },
  danger: { icon: Layers, chip: 'bg-red-500/15 border-red-500/25', iconClass: 'text-red-400' },
  info: { icon: BadgeCheck, chip: 'bg-cyan-500/15 border-cyan-500/25', iconClass: 'text-cyan-400' },
  purple: { icon: Calendar, chip: 'bg-violet-500/15 border-violet-500/25', iconClass: 'text-violet-400' },
};

interface DashboardActionCenterListProps {
  items: AdminActionItem[];
}

export default function DashboardActionCenterList({ items }: DashboardActionCenterListProps) {
  const firstAlert = items.find((i) => i.count > 0);

  return (
    <div className="flex flex-col min-h-0">
      <div className="space-y-1.5">
        {items.map((item) => {
          const style = VARIANT_STYLES[item.variant];
          const Icon = style.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-surface-container/40 transition-colors group"
            >
              <span
                className={cn(
                  'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0',
                  style.chip
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', style.iconClass)} />
              </span>
              <span className="text-[11px] font-medium text-on-surface flex-1 min-w-0 truncate">
                {item.label}
              </span>
              <span className="text-sm font-bold text-on-surface tabular-nums">{item.count}</span>
            </Link>
          );
        })}
      </div>
      {firstAlert && (
        <Link
          href={firstAlert.href}
          className="mt-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-primary hover:text-primary/80"
        >
          View all alerts
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
