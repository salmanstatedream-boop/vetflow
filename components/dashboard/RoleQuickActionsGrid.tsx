'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import DashboardQuickActionTile from '@/components/dashboard/premium/DashboardQuickActionTile';
import { groupQabItems, type QabItem } from '@/components/dashboard/role-qab-config';
import { cn } from '@/lib/utils';

export type QabLayout = 'compact' | 'dashboard';

interface RoleQuickActionsGridProps {
  items: QabItem[];
  onAction: (item: QabItem) => void;
  pendingId?: string | null;
  layout?: QabLayout;
  showHeading?: boolean;
}

const GRID_CLASS: Record<QabLayout, string> = {
  dashboard: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5',
  compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5',
};

export default function RoleQuickActionsGrid({
  items,
  onAction,
  pendingId = null,
  layout = 'compact',
  showHeading = true,
}: RoleQuickActionsGridProps) {
  if (items.length === 0) return null;

  if (layout === 'dashboard') {
    const groups = groupQabItems(items);
    return (
      <div className="space-y-5">
        {groups.map((section) => (
          <div key={section.group}>
            <p className="sidebar-section-label mb-2">{section.label}</p>
            <div className={GRID_CLASS.dashboard}>
              {section.items.map((item) => (
                <DashboardQuickActionTile
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  group={item.group}
                  onClick={() => onAction(item)}
                  loading={pendingId === item.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showHeading && (
        <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Quick Actions
        </h3>
      )}
      <div className={cn(GRID_CLASS.compact)}>
        {items.map((item) => (
          <DashboardQuickActionTile
            key={item.id}
            label={item.label}
            description={item.description}
            icon={item.icon}
            group={item.group}
            onClick={() => onAction(item)}
            loading={pendingId === item.id}
          />
        ))}
      </div>
    </div>
  );
}

export function useQabNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = (item: QabItem, openModal: (id: string) => void) => {
    if (item.launcher === 'page' && item.href) {
      startTransition(() => {
        router.push(item.href!);
      });
      return;
    }
    if (item.modalId) {
      openModal(item.modalId);
    }
  };

  return { navigate, isPending };
}
