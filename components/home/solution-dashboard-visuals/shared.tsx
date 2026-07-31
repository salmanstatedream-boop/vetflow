'use client';

import type { LucideIcon } from 'lucide-react';
import { Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { SOLUTION_MOCKUP_ASSETS } from '@/lib/solution-mockup-assets';
import { cn } from '@/lib/utils';

export function DashboardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('w-full h-full p-3 sm:p-4', className)}>
      {children}
    </div>
  );
}

const doctorGradients: Record<string, string> = {
  sarah: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  taylor: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  morgan: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
  lee: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  james: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
};

const petGradients: Record<string, string> = {
  golden: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  husky: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
  tabby: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
  beagle: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
  poodle: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
  shiba: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
};

const avatarSizes = {
  sm: { box: 'w-7 h-7', px: 28 },
  md: { box: 'w-9 h-9', px: 36 },
  lg: { box: 'w-11 h-11', px: 44 },
  xl: { box: 'w-14 h-14', px: 56 },
};

export function StockAvatar({
  src,
  alt,
  size = 'md',
  ringColor,
  showCamera,
  className,
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ringColor?: string;
  showCamera?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const { box, px } = avatarSizes[size];

  const fallback = (
    <span
      className={cn('rounded-full shrink-0 border-2 bg-[#8B5CF6]/30 flex items-center justify-center text-[8px] font-semibold text-[#F8FAFC]', box, className)}
      style={{ borderColor: ringColor ?? 'transparent' }}
    >
      {alt.slice(0, 2).toUpperCase()}
    </span>
  );

  if (failed) {
    return showCamera ? (
      <span className="relative shrink-0">
        {fallback}
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0B1020] border border-white/20 flex items-center justify-center text-[8px]">
          📷
        </span>
      </span>
    ) : (
      fallback
    );
  }

  return (
    <span className={cn('relative shrink-0', className)}>
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        className={cn('rounded-full object-cover border-2', box)}
        style={{ borderColor: ringColor ?? 'transparent' }}
        onError={() => setFailed(true)}
      />
      {showCamera && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0B1020] border border-white/20 flex items-center justify-center text-[8px]">
          📷
        </span>
      )}
    </span>
  );
}

export function DoctorStockAvatar({
  variant,
  size = 'md',
  ringColor,
}: {
  variant: keyof typeof doctorGradients;
  size?: 'sm' | 'md' | 'lg';
  ringColor?: string;
}) {
  const name = variant.charAt(0).toUpperCase() + variant.slice(1);
  return (
    <StockAvatar
      src={SOLUTION_MOCKUP_ASSETS.doctors[variant]}
      alt={`Dr. ${name}`}
      size={size}
      ringColor={ringColor}
    />
  );
}

export function PetStockAvatar({
  pet,
  size = 'sm',
  showCamera,
}: {
  pet: keyof typeof SOLUTION_MOCKUP_ASSETS.pets;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCamera?: boolean;
}) {
  const name = pet.charAt(0).toUpperCase() + pet.slice(1);
  return (
    <StockAvatar
      src={SOLUTION_MOCKUP_ASSETS.pets[pet]}
      alt={name}
      size={size}
      showCamera={showCamera}
    />
  );
}

export function ProductThumb({
  product,
  className,
}: {
  product: keyof typeof SOLUTION_MOCKUP_ASSETS.products;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className={cn('w-6 h-6 rounded-md shrink-0 border border-white/10 bg-white/5', className)} />;
  }
  return (
    <Image
      src={SOLUTION_MOCKUP_ASSETS.products[product]}
      alt={product}
      width={24}
      height={24}
      className={cn('w-6 h-6 rounded-md shrink-0 border border-white/10 object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}

export function DoctorAvatar({
  variant,
  size = 'md',
  ringColor,
}: {
  variant: keyof typeof doctorGradients;
  size?: 'sm' | 'md' | 'lg';
  ringColor?: string;
}) {
  return <DoctorStockAvatar variant={variant} size={size} ringColor={ringColor} />;
}

const petVariantMap: Record<keyof typeof petGradients, keyof typeof SOLUTION_MOCKUP_ASSETS.pets> = {
  golden: 'bella',
  husky: 'max',
  tabby: 'luna',
  beagle: 'rocky',
  poodle: 'milo',
  shiba: 'cooper',
};

export function PetAvatar({
  variant,
  size = 'sm',
  showCamera,
}: {
  variant: keyof typeof petGradients;
  size?: 'sm' | 'md' | 'lg';
  showCamera?: boolean;
}) {
  const mappedSize = size === 'lg' ? 'xl' : size;
  return <PetStockAvatar pet={petVariantMap[variant]} size={mappedSize} showCamera={showCamera} />;
}

export function AvatarChip({
  name,
  color,
  size = 'sm',
}: {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  return (
    <span
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        size === 'sm' ? 'w-6 h-6 text-[8px]' : 'w-8 h-8 text-[9px]',
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}

export type ScheduleBlock = {
  col: number;
  rowStart: number;
  rowSpan: number;
  label: string;
  sub: string;
  color: string;
};

export function ScheduleGrid({
  times,
  doctors,
  blocks,
}: {
  times: string[];
  doctors: { name: string; role: string; variant: keyof typeof doctorGradients; color: string }[];
  blocks: ScheduleBlock[];
}) {
  const totalRows = times.length;

  return (
    <div className="overflow-x-auto scrollbar-none">
      <div
        className="min-w-[540px] grid gap-px bg-white/5"
        style={{
          gridTemplateColumns: `44px repeat(${doctors.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${totalRows}, 32px)`,
        }}
      >
        <div className="bg-[#0B1020]" />
        {doctors.map((doc) => (
          <div key={doc.name} className="bg-[#0B1020] px-1 py-2 text-center">
            <DoctorAvatar variant={doc.variant} size="md" ringColor={doc.color} />
            <p className="text-[8px] font-medium text-[#F8FAFC] mt-1 truncate">{doc.name}</p>
            <p className="text-[7px] text-[#64748B] truncate">{doc.role}</p>
          </div>
        ))}

        {times.map((time, rowIdx) => (
          <div key={time} className="contents">
            <span className="bg-[#0B1020] text-[8px] text-[#64748B] pt-1 pr-1 text-right">{time}</span>
            {doctors.map((_, colIdx) => (
              <div key={`${time}-${colIdx}`} className="bg-[#0B1020]/80 border-t border-white/5 relative" />
            ))}
          </div>
        ))}

        {blocks.map((block) => (
          <div
            key={`${block.col}-${block.rowStart}-${block.label}`}
            className="rounded-md px-1.5 py-1 border text-[7px] leading-tight z-10 m-0.5"
            style={{
              gridColumn: block.col + 2,
              gridRow: `${block.rowStart + 2} / span ${block.rowSpan}`,
              backgroundColor: `${block.color}22`,
              borderColor: `${block.color}55`,
            }}
          >
            <p className="font-semibold text-[#F8FAFC]">{block.label}</p>
            <p style={{ color: block.color }}>{block.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Record<string, ReactNode>[];
}) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <div
        className="grid gap-1 px-2 py-1.5 bg-white/[0.04] text-[7px] font-medium text-[#64748B] uppercase"
        style={{ gridTemplateColumns: columns.map((c) => c.className ?? '1fr').join(' ') }}
      >
        {columns.map((col) => (
          <span key={col.key}>{col.label}</span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className={cn(
            'grid gap-1 px-2 py-1.5 border-t border-white/5 text-[8px] items-center',
            i % 2 === 1 && 'bg-white/[0.02]',
          )}
          style={{ gridTemplateColumns: columns.map((c) => c.className ?? '1fr').join(' ') }}
        >
          {columns.map((col) => (
            <div key={col.key} className="min-w-0 truncate">
              {row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center min-w-[56px]">
      <p className="text-[7px] text-[#64748B]">{label}</p>
      <p className="text-[9px] font-semibold text-[#F8FAFC] mt-0.5">{value}</p>
    </div>
  );
}

export function InsightRing({
  value,
  label,
  tone = 'purple',
}: {
  value: string;
  label: string;
  tone?: 'purple' | 'green' | 'red';
}) {
  const ringColors = {
    purple: 'border-[#8B5CF6] text-[#C4B5FD]',
    green: 'border-[#22C55E] text-[#86EFAC]',
    red: 'border-[#EF4444] text-[#FCA5A5]',
  };
  return (
    <div className="flex items-center gap-2 rounded-md border border-white/10 p-2">
      <span
        className={cn(
          'w-10 h-10 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0',
          ringColors[tone],
        )}
      >
        {value}
      </span>
      <p className="text-[8px] text-[#64748B] leading-snug">{label}</p>
    </div>
  );
}

export function CategoryBar({
  label,
  pct,
  tone = 'purple',
}: {
  label: string;
  pct: number;
  tone?: 'purple' | 'blue' | 'orange' | 'green';
}) {
  const colors = {
    purple: 'bg-[#8B5CF6]',
    blue: 'bg-[#3B82F6]',
    orange: 'bg-[#F97316]',
    green: 'bg-[#22C55E]',
  };
  return (
    <div>
      <div className="flex justify-between text-[8px] mb-0.5">
        <span className="text-[#94A3B8]">{label}</span>
        <span className="text-[#64748B]">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={cn('h-full rounded-full', colors[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function MiniStatCard({
  label,
  value,
  delta,
  deltaTone = 'green',
  icon: Icon,
  iconTone = 'purple',
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'green' | 'orange' | 'red';
  icon: LucideIcon;
  iconTone?: 'purple' | 'blue' | 'orange' | 'red' | 'green';
}) {
  const iconColors = {
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/25',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/25',
    orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/25',
    red: 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/25',
    green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/25',
  };
  const deltaColors = {
    green: 'text-[#86EFAC]',
    orange: 'text-[#FDBA74]',
    red: 'text-[#FCA5A5]',
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex flex-col gap-1.5">
          <p className="text-base sm:text-lg font-bold text-[#F8FAFC] leading-snug">{value}</p>
          <p className="text-[10px] text-[#94A3B8] leading-snug">{label}</p>
          {delta && (
            <p className={cn('text-[9px] leading-snug truncate', deltaColors[deltaTone])}>{delta}</p>
          )}
        </div>
        <span className={cn('w-7 h-7 rounded-lg border flex items-center justify-center shrink-0', iconColors[iconTone])}>
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export function StatusPill({
  label,
  tone = 'green',
}: {
  label: string;
  tone?: 'green' | 'blue' | 'orange' | 'red' | 'purple';
}) {
  const tones = {
    green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30',
    orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30',
    red: 'bg-[#EF4444]/15 text-[#FCA5A5] border-[#EF4444]/30',
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
  };
  return (
    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[8px] font-medium border', tones[tone])}>
      {label}
    </span>
  );
}

export function TabBar({
  tabs,
  active,
  badge,
}: {
  tabs: string[];
  active: string;
  badge?: Record<string, number>;
}) {
  return (
    <div className="flex gap-3 border-b border-white/10 pb-1.5 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <span
          key={tab}
          className={cn(
            'text-[9px] whitespace-nowrap pb-1 border-b-2 transition-colors flex items-center gap-1',
            tab === active
              ? 'text-[#C4B5FD] border-[#8B5CF6]'
              : 'text-[#64748B] border-transparent',
          )}
        >
          {tab}
          {badge?.[tab] !== undefined && (
            <span className="px-1 py-0 rounded-full bg-[#EF4444]/20 text-[#FCA5A5] text-[7px]">{badge[tab]}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function SearchRow({ placeholder = 'Search...' }: { placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5">
        <span className="text-[#64748B] text-[10px]">⌕</span>
        <span className="text-[9px] text-[#64748B] truncate">{placeholder}</span>
      </div>
      <div className="w-7 h-7 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#64748B] text-xs shrink-0">
        ☰
      </div>
    </div>
  );
}

export function ProgressBar({
  pct,
  tone = 'purple',
}: {
  pct: number;
  tone?: 'purple' | 'blue' | 'orange' | 'green';
}) {
  const colors = {
    purple: 'bg-[#8B5CF6]',
    blue: 'bg-[#3B82F6]',
    orange: 'bg-[#F97316]',
    green: 'bg-[#22C55E]',
  };
  return (
    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className={cn('h-full rounded-full', colors[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function DonutRing({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { pct: number; color: string; label: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  let offset = 0;
  const r = 28;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[72px] h-[72px] shrink-0">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          {segments.map((seg) => {
            const dash = (seg.pct / 100) * c;
            const el = (
              <circle
                key={seg.label}
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-bold text-[#F8FAFC]">{centerValue}</p>
          <p className="text-[7px] text-[#64748B] text-center leading-tight px-1">{centerLabel}</p>
        </div>
      </div>
      <div className="space-y-1 min-w-0 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-[8px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-[#94A3B8] truncate">{seg.label}</span>
            <span className="text-[#64748B] ml-auto">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PanelHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
      <h4 className="text-xs font-semibold text-[#F8FAFC]">{title}</h4>
      {actions}
    </div>
  );
}

export function ToolbarButton({ children, primary }: { children: ReactNode; primary?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-md text-[8px] font-medium border whitespace-nowrap transition-colors',
        primary
          ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_14px_rgba(139,92,246,0.35)]'
          : 'border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.06] text-[#C4B5FD]',
      )}
    >
      {children}
    </span>
  );
}

export function ChannelIcon({ channel }: { channel: 'WhatsApp' | 'SMS' | 'Email' }) {
  const styles = {
    WhatsApp: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30',
    SMS: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30',
    Email: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30',
  };
  return (
    <span className={cn('inline-flex w-5 h-5 rounded-full border items-center justify-center shrink-0', styles[channel])}>
      {channel === 'Email' ? <Mail className="w-2.5 h-2.5" /> : <MessageCircle className="w-2.5 h-2.5" />}
    </span>
  );
}

export function JourneyStep({
  title,
  subtitle,
  active,
  last,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
  last?: boolean;
}) {
  return (
    <div className={cn('relative pl-4 pb-3', last && 'pb-0')}>
      {!last && <span className="absolute left-[5px] top-3 bottom-0 w-px bg-white/10" />}
      <span
        className={cn(
          'absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2',
          active ? 'bg-[#8B5CF6] border-[#8B5CF6]' : 'bg-[#0B1020] border-[#64748B]',
        )}
      />
      <p className={cn('text-[8px] font-medium', active ? 'text-[#F8FAFC]' : 'text-[#94A3B8]')}>{title}</p>
      <p className="text-[7px] text-[#64748B]">{subtitle}</p>
    </div>
  );
}

export function PaymentDonut({
  collectedPct,
  centerValue,
}: {
  collectedPct: number;
  centerValue: string;
}) {
  return (
    <DonutRing
      centerValue={centerValue}
      centerLabel="Collected"
      segments={[
        { pct: collectedPct, color: '#22C55E', label: 'Collected' },
        { pct: 100 - collectedPct, color: '#334155', label: 'Outstanding' },
      ]}
    />
  );
}

export function CategoryPill({
  label,
  tone = 'purple',
}: {
  label: string;
  tone?: 'purple' | 'blue' | 'orange' | 'green';
}) {
  const tones = {
    purple: 'bg-[#8B5CF6]/15 text-[#C4B5FD] border-[#8B5CF6]/30',
    blue: 'bg-[#3B82F6]/15 text-[#93C5FD] border-[#3B82F6]/30',
    orange: 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30',
    green: 'bg-[#22C55E]/15 text-[#86EFAC] border-[#22C55E]/30',
  };
  return (
    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[7px] font-medium border', tones[tone])}>
      {label}
    </span>
  );
}

export function PaginationPills({ total = 12, active = 1 }: { total?: number; active?: number }) {
  const pages = [1, 2, 3];
  return (
    <div className="flex items-center justify-center gap-1 text-[7px] text-[#64748B]">
      <span className="px-1">&lt;</span>
      {pages.map((page) => (
        <span
          key={page}
          className={cn(
            'w-4 h-4 rounded flex items-center justify-center',
            page === active ? 'bg-[#8B5CF6]/20 text-[#C4B5FD] font-semibold' : '',
          )}
        >
          {page}
        </span>
      ))}
      <span>…</span>
      <span>{total}</span>
      <span className="px-1">&gt;</span>
    </div>
  );
}

export function FileCountCard({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: 'purple' | 'blue' | 'green' | 'orange';
}) {
  const tones = {
    purple: 'text-[#C4B5FD] bg-[#8B5CF6]/10 border-[#8B5CF6]/25',
    blue: 'text-[#93C5FD] bg-[#3B82F6]/10 border-[#3B82F6]/25',
    green: 'text-[#86EFAC] bg-[#22C55E]/10 border-[#22C55E]/25',
    orange: 'text-[#FDBA74] bg-[#F97316]/10 border-[#F97316]/25',
  };
  return (
    <div className={cn('rounded-md border p-2 text-center', tones[tone])}>
      <p className="text-sm font-bold text-[#F8FAFC]">{count}</p>
      <p className="text-[7px] text-[#64748B] mt-0.5">{label}</p>
    </div>
  );
}
