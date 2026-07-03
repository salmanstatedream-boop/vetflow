import {
  BarChart3,
  LayoutList,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PALETTE = [
  ['#22D3EE', '#3B82F6'],
  ['#3B82F6', '#8B5CF6'],
  ['#8B5CF6', '#A855F7'],
  ['#22D3EE', '#8B5CF6'],
] as const;

const ROLE_ICONS: Record<string, LucideIcon> = {
  reception: LayoutList,
  vet: Stethoscope,
  owner: BarChart3,
  manager: Users,
};

export function stripQuote(text: string) {
  return text.replace(/^["“]|["”]$/g, '').trim();
}

export interface TestimonialCardProps {
  id: string;
  title: string;
  description: string;
  index?: number;
  className?: string;
}

export default function TestimonialCard({
  id,
  title,
  description,
  index = 0,
  className,
}: TestimonialCardProps) {
  const [from, to] = PALETTE[index % PALETTE.length];
  const Icon = ROLE_ICONS[id] ?? LayoutList;
  const quote = stripQuote(description);

  return (
    <article
      className={cn(
        'phx-card relative overflow-hidden p-6 sm:p-7 min-h-[220px] h-full flex flex-col cursor-default transition-colors duration-200 hover:border-[#22D3EE]/25',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute top-4 right-5 text-5xl leading-none font-serif text-[#22D3EE]/15 select-none"
        aria-hidden
      >
        &ldquo;
      </span>

      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${from}14`,
            borderColor: `${from}33`,
          }}
        >
          <Icon size={18} style={{ color: from }} />
        </span>
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#64748B]">
          {title}
        </span>
      </div>

      <div
        className="h-0.5 w-12 rounded-full mb-5 shrink-0"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        aria-hidden
      />

      <blockquote className="flex-1 text-base lg:text-[1.05rem] text-[#CBD5E1] leading-[1.65] mb-6">
        {quote}
      </blockquote>

      <footer className="mt-auto pt-4 border-t border-white/5">
        <p className="font-semibold text-[#F8FAFC]">{title}</p>
        <p className="text-xs text-[#64748B] mt-1">Early-access clinic</p>
      </footer>
    </article>
  );
}
