'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AlertTriangle, BadgeCheck, Banknote, Bell, Layers, X } from 'lucide-react';
import type { DashboardNotification, DashboardNotificationKind } from '@/lib/dashboard/notifications';
import { useFloatingDropdownPosition } from '@/lib/hooks/useFloatingDropdownPosition';
import { floatingDropdownStyle } from '@/lib/ui/floating-dropdown';
import { cn } from '@/lib/utils';

const KIND_LABELS: Record<DashboardNotificationKind, string> = {
  checkout: 'Checkout',
  unpaid_invoice: 'Billing',
  low_stock: 'Inventory',
  emergency_queue: 'Emergency',
};

function kindIcon(kind: DashboardNotificationKind) {
  switch (kind) {
    case 'checkout':
      return BadgeCheck;
    case 'unpaid_invoice':
      return Banknote;
    case 'low_stock':
      return Layers;
    case 'emergency_queue':
      return AlertTriangle;
    default:
      return Bell;
  }
}

interface DashboardNotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: DashboardNotification[];
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function DashboardNotificationsPanel({
  open,
  onClose,
  notifications,
  triggerRef,
}: DashboardNotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useFloatingDropdownPosition(open, triggerRef, {
    preferredListMaxPx: 360,
    preferPlacement: 'bottom',
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open, onClose, triggerRef]);

  if (!open || !pos || typeof document === 'undefined') return null;

  const panelWidth = Math.max(pos.width, 280);

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="rounded-xl border border-outline-variant/50 bg-surface-container shadow-premium overflow-hidden flex flex-col"
      style={{
        ...floatingDropdownStyle({ ...pos, width: panelWidth }),
        width: panelWidth,
        maxHeight: pos.maxListHeight + 48,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/40 shrink-0">
        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Notifications
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1" style={{ maxHeight: pos.maxListHeight }}>
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-on-surface-variant">
            No alerts right now
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/30">
            {notifications.map((item) => {
              const Icon = kindIcon(item.kind);
              const isCheckout = item.kind === 'checkout';
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors',
                      isCheckout && 'bg-emerald-500/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        isCheckout
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : item.kind === 'emergency_queue'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-on-surface leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-2">
                        {item.body}
                      </p>
                      <span className="text-[9px] font-semibold text-on-surface-variant/70 uppercase tracking-wide mt-1 inline-block">
                        {KIND_LABELS[item.kind]}
                        {isCheckout ? ' · Start checkout' : ''}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
}
