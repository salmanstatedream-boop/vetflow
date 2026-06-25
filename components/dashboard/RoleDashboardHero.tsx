import { Activity } from 'lucide-react';
import type { UserSessionDetails } from '@/lib/services/auth';
import { cn } from '@/lib/utils';

interface RoleDashboardHeroProps {
  firstName: string;
  greeting: string;
  organizationName?: string | null;
  role: UserSessionDetails['role'];
  variant?: 'default' | 'compact';
}

function roleLabel(role: UserSessionDetails['role']): string {
  switch (role) {
    case 'clinic_admin':
      return 'Clinic Admin';
    case 'receptionist':
      return 'Receptionist';
    case 'doctor':
      return 'Doctor';
    default:
      return 'Staff';
  }
}

function roleSubtitle(role: UserSessionDetails['role'], orgName?: string | null): string {
  const org = orgName ? `Managing ${orgName}.` : '';
  switch (role) {
    case 'doctor':
      return `${org} Your clinical queue and appointments at a glance.`.trim();
    case 'receptionist':
      return `${org} Front desk operations, intake, and billing at a glance.`.trim();
    case 'clinic_admin':
      return `${org} Full clinic performance and administration overview.`.trim();
    default:
      return `${org} Here's your clinic at a glance.`.trim();
  }
}

export default function RoleDashboardHero({
  firstName,
  greeting,
  organizationName,
  role,
  variant = 'default',
}: RoleDashboardHeroProps) {
  const compact = variant === 'compact';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl glass-panel border-primary/20 mesh-gradient',
        compact ? 'p-4 md:p-5' : 'p-8 md:p-10'
      )}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-primary blur-3xl" />
        <div className="absolute bottom-0 left-12 w-48 h-48 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="relative z-10">
        <div className={cn('flex items-center gap-2', compact ? 'mb-1' : 'mb-2')}>
          <Activity className={cn('text-primary', compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {roleLabel(role)} · Clinic Dashboard
          </span>
        </div>
        <h1
          className={cn(
            'font-extrabold tracking-tight',
            compact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
          )}
        >
          {greeting}, {firstName}
        </h1>
        <p
          className={cn(
            'text-on-surface-variant max-w-lg',
            compact ? 'text-xs mt-1' : 'text-sm mt-2'
          )}
        >
          {roleSubtitle(role, organizationName)}
        </p>
      </div>
    </div>
  );
}
