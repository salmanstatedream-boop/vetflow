'use client';

import { useState, useRef } from 'react';
import { ArrowRight, ShoppingBag, UserPlus } from 'lucide-react';
import AppLink from '@/components/layout/AppLink';
import QuickWalkInModal from '@/components/reception/QuickWalkInModal';

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
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setWalkInOpen(true)}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-premium hover:opacity-90 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Quick walk-in — patient just arrived
          <ArrowRight className="w-4 h-4 opacity-80" />
        </button>
        <AppLink
          href="/dashboard/sales/new"
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-violet-600 text-white font-bold text-sm shadow-premium hover:opacity-90 transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          Retail sale — products & services
          <ArrowRight className="w-4 h-4 opacity-80" />
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
