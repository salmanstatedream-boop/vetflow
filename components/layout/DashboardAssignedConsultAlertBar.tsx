'use client';

import Link from 'next/link';
import { ArrowRight, Stethoscope } from 'lucide-react';
import { assignedToMeNotifications } from '@/lib/dashboard/notifications';
import { useDashboardShell } from '@/lib/context/DashboardShellContext';

export default function DashboardAssignedConsultAlertBar() {
  const shell = useDashboardShell();
  const assigned = assignedToMeNotifications(shell?.notifications ?? []);

  if (assigned.length === 0) return null;

  const first = assigned[0]!;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 md:px-6 py-2.5 bg-blue-500/15 border-b border-blue-500/30">
      <div className="min-w-0 flex items-start gap-2">
        <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
            {assigned.length} consultation{assigned.length > 1 ? 's' : ''} assigned to you
          </p>
          <p className="text-[10px] text-blue-600/90 dark:text-blue-500/80 truncate">
            {first.title} — open the consult workspace when ready.
          </p>
        </div>
      </div>
      <Link
        href={first.href}
        className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
      >
        Open consult
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
