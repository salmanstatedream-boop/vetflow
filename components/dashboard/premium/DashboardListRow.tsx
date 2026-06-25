import Link from 'next/link';
import { getPetSpeciesAvatarSrc } from '@/lib/utils/pet-species-avatar';
import DashboardBadge, { statusToBadgeVariant } from './DashboardBadge';

interface DashboardListRowProps {
  href?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  species?: string | null;
  status?: string;
  statusLabel?: string;
  onClick?: () => void;
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
}: DashboardListRowProps) {
  const avatarSrc = getPetSpeciesAvatarSrc(species);
  const content = (
    <>
      <img
        src={avatarSrc}
        alt=""
        className="w-9 h-9 rounded-xl object-cover bg-surface-container-high border border-outline-variant/30 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-on-surface truncate">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-on-surface-variant truncate">{subtitle}</p>
        )}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        {status && (
          <DashboardBadge variant={statusToBadgeVariant(status)}>
            {statusLabel || status.replace(/_/g, ' ')}
          </DashboardBadge>
        )}
        {meta && <span className="text-[10px] text-on-surface-variant">{meta}</span>}
      </div>
    </>
  );

  const className =
    'flex items-center gap-3 py-2.5 px-1 rounded-xl hover:bg-surface-container/40 transition-colors';

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} w-full text-left`}>
      {content}
    </button>
  );
}
