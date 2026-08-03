'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { checkoutNotifications } from '@/lib/dashboard/notifications';
import { useDashboardShell } from '@/lib/context/DashboardShellContext';

export default function DashboardCheckoutAlertBar() {
  const shell = useDashboardShell();
  const pathname = usePathname();
  const checkouts = checkoutNotifications(shell?.notifications ?? []).filter((n) => {
    // Hide banner CTA when already on that visit's checkout page
    if (pathname && n.href && pathname.startsWith(n.href.split('?')[0]!)) return false;
    return true;
  });

  if (checkouts.length === 0) return null;

  const first = checkouts[0]!;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 md:px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30">
      <div className="min-w-0">
        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {checkouts.length} patient{checkouts.length > 1 ? 's' : ''} ready for checkout
        </p>
        <p className="text-[10px] text-emerald-600/90 dark:text-emerald-500/80 truncate">
          Doctor completed consultation — proceed to billing.
        </p>
      </div>
      <Link
        href={first.href}
        className="shrink-0 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
      >
        Start checkout
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
