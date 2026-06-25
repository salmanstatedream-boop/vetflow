'use client';

import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import type { QabGroup } from '@/components/dashboard/role-qab-config';
import { QAB_GROUP_ACCENTS } from '@/lib/ui/dashboard-tokens';
import { cn } from '@/lib/utils';

interface DashboardQuickActionTileProps {
  label: string;
  description: string;
  icon: LucideIcon;
  group: QabGroup;
  onClick: () => void;
  loading?: boolean;
}

export default function DashboardQuickActionTile({
  label,
  description,
  icon: Icon,
  group,
  onClick,
  loading = false,
}: DashboardQuickActionTileProps) {
  const accent = QAB_GROUP_ACCENTS[group];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={`${label}: ${description}`}
      className={cn(
        'group relative flex items-center gap-3 w-full min-h-[56px] px-3 py-2.5 rounded-xl',
        'border border-outline-variant/30 bg-surface-container/20',
        'hover:bg-surface-container/40 hover:-translate-y-px',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'transition-all duration-150 disabled:opacity-70',
        accent.hover
      )}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/60 backdrop-blur-[1px] z-10">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </span>
      )}
      <span
        className={cn(
          'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
          accent.chip,
          'group-hover:brightness-110'
        )}
      >
        <Icon className="w-4 h-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="text-xs font-semibold text-on-surface block truncate leading-tight">
          {label}
        </span>
        <span className="text-[10px] text-on-surface-variant/75 block truncate mt-0.5">
          {description}
        </span>
      </span>
    </button>
  );
}
