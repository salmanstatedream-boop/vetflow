import Link from 'next/link';
import { getPetSpeciesAvatarSrc } from '@/lib/utils/pet-species-avatar';
import DashboardBadge, { statusToBadgeVariant } from './DashboardBadge';
import { cn } from '@/lib/utils';

interface DashboardListRowProps {
  href?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  species?: string | null;
  status?: string;
  statusLabel?: string;
  onClick?: () => void;
  density?: 'default' | 'compact';
}

export default function DashboardListRow({
  href,
  title,
  subtitle,
  meta,
  species,
  status,
  statusLabel,
  onClick,
  density = 'default',
}: DashboardListRowProps) {
  const compact = density === 'compact';
  const avatarSrc = getPetSpeciesAvatarSrc(species);
  const content = (
    <>
      <img
        src={avatarSrc}
        alt=""
        className={cn(
          'rounded-xl object-cover bg-surface-container-high border border-outline-variant/30 shrink-0',
          compact ? 'w-8 h-8' : 'w-9 h-9'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-on-surface truncate', compact ? 'text-[11px]' : 'text-xs')}>
          {title}
        </p>
        {subtitle && (
          <p className={cn('text-on-surface-variant truncate', compact ? 'text-[9px]' : 'text-[10px]')}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
        {status && (
          <DashboardBadge variant={statusToBadgeVariant(status)} className={compact ? 'text-[8px] px-1.5 py-0' : undefined}>
            {statusLabel || status.replace(/_/g, ' ')}
          </DashboardBadge>
        )}
        {meta && (
          <span className={cn('text-on-surface-variant', compact ? 'text-[9px]' : 'text-[10px]')}>{meta}</span>
        )}
      </div>
    </>
  );

  const className = cn(
    'flex items-center gap-2.5 px-1 rounded-xl hover:bg-surface-container/40 transition-colors w-full text-left',
    compact ? 'py-2' : 'py-2.5'
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
