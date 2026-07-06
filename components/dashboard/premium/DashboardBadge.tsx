import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  danger: 'bg-red-500/15 text-red-400 border-red-500/25',
  info: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  purple: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  neutral: 'bg-surface-container-high text-on-surface-variant border-outline-variant/40',
};

interface DashboardBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function DashboardBadge({
  children,
  variant = 'neutral',
  className,
}: DashboardBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'checked_in':
    case 'confirmed':
    case 'consulting':
      return 'success';
    case 'waiting':
    case 'requested':
    case 'rescheduled':
      return 'warning';
    case 'no_show':
    case 'cancelled':
      return 'danger';
    case 'ready_for_checkout':
      return 'purple';
    default:
      return 'neutral';
  }
}
