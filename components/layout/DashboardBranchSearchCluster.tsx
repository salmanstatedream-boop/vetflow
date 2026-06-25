'use client';

import { MapPin, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Branch {
  id: string;
  name: string;
}

interface DashboardBranchSearchClusterProps {
  branches: Branch[];
  activeBranchId?: string;
  activeBranchName?: string;
  isPending?: boolean;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
  onBranchChange: (branchId: string) => void;
  onSearchOpen: () => void;
  className?: string;
}

export default function DashboardBranchSearchCluster({
  branches,
  activeBranchId,
  activeBranchName,
  isPending = false,
  isDropdownOpen,
  onToggleDropdown,
  onCloseDropdown,
  onBranchChange,
  onSearchOpen,
  className,
}: DashboardBranchSearchClusterProps) {
  return (
    <div
      className={cn(
        'flex items-center min-w-0 rounded-xl border border-outline-variant/50 bg-surface-container/30 backdrop-blur-md overflow-hidden',
        className
      )}
    >
      <div className="relative shrink-0">
        {branches.length > 0 ? (
          <>
            <button
              type="button"
              disabled={isPending}
              onClick={onToggleDropdown}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-opacity hover:bg-surface-container/40',
                isPending ? 'opacity-60' : '',
                activeBranchName ? 'text-on-surface' : 'text-on-surface-variant'
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {isPending ? 'Switching…' : activeBranchName || 'Branch'}
              </span>
              <ChevronDown className="w-3 h-3 text-outline shrink-0" />
            </button>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={onCloseDropdown} />
                <div className="absolute left-0 top-full mt-1 w-56 dashboard-card z-30 py-1.5">
                  <span className="block px-4 py-1.5 text-[9px] font-semibold text-outline uppercase">
                    Branch scope
                  </span>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onBranchChange(b.id)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container-high',
                        b.id === activeBranchId ? 'text-primary' : 'text-on-surface'
                      )}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-on-surface-variant">
            <MapPin className="w-3.5 h-3.5" />
            No branch
          </span>
        )}
      </div>

      <div className="w-px self-stretch bg-outline-variant/40 shrink-0" aria-hidden />

      <button
        type="button"
        onClick={onSearchOpen}
        className="flex flex-1 items-center gap-2 px-3 py-2 min-w-0 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
        aria-label="Search clinic records"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate text-left">Search patients, appointments, invoices…</span>
        <span className="hidden sm:inline ml-auto shrink-0 text-[9px] font-semibold opacity-50 border border-outline-variant/40 px-1 rounded">
          ⌘K
        </span>
      </button>
    </div>
  );
}
