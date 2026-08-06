'use client';

import { useState } from 'react';
import { ArrowRight, CalendarPlus, ShoppingBag, UserPlus } from 'lucide-react';
import AppLink from '@/components/layout/AppLink';
import QuickWalkInModal from '@/components/reception/QuickWalkInModal';
import { btnLgClass, btnPrimaryClass } from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';

interface ReceptionistPrimaryActionsProps {
  activeBranchId: string;
  branches: { id: string; name: string }[];
  doctors: { id: string; firstName: string; lastName: string }[];
}

export default function ReceptionistPrimaryActions({
  activeBranchId,
  branches,
  doctors,
}: ReceptionistPrimaryActionsProps) {
  const [walkInOpen, setWalkInOpen] = useState(false);

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setWalkInOpen(true)}
          className={cn(btnPrimaryClass, btnLgClass, 'w-full shadow-premium')}
        >
          <UserPlus className="size-5" />
          Quick walk-in — patient just arrived
          <ArrowRight className="size-4 opacity-80" />
        </button>
        <AppLink
          href="/dashboard/schedule"
          className={cn(btnPrimaryClass, btnLgClass, 'w-full shadow-premium')}
        >
          <CalendarPlus className="size-5" />
          Create an appointment
          <ArrowRight className="size-4 opacity-80" />
        </AppLink>
        <AppLink
          href="/dashboard/sales/new"
          className={cn(btnPrimaryClass, btnLgClass, 'w-full shadow-premium')}
        >
          <ShoppingBag className="size-5" />
          Retail sale — products & services
          <ArrowRight className="size-4 opacity-80" />
        </AppLink>
      </div>

      <QuickWalkInModal
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        activeBranchId={activeBranchId}
        branches={branches}
        doctors={doctors}
      />
    </>
  );
}
