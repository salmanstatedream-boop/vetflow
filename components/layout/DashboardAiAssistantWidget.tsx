'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, X } from 'lucide-react';
import AiAssistantClient from '@/components/ai/AiAssistantClient';
import { hasCapability } from '@/lib/auth/capabilities';
import { canAccessRouteByFeature } from '@/lib/auth/features';
import type { UserSessionDetails } from '@/lib/services/auth';
import type { Feature } from '@/lib/auth/features';
import { cn } from '@/lib/utils';

interface DashboardAiAssistantWidgetProps {
  role: UserSessionDetails['role'];
  features: Feature[];
}

export default function DashboardAiAssistantWidget({
  role,
  features,
}: DashboardAiAssistantWidgetProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const canShow =
    role &&
    hasCapability(role, 'use_ai_assistant') &&
    canAccessRouteByFeature(features, '/dashboard/ai-assistant');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  if (!canShow) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {open && (
        <div
          ref={panelRef}
          className="pointer-events-auto w-[min(100vw-2.5rem,380px)] max-h-[min(70vh,520px)] flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container/95 backdrop-blur-xl shadow-premium overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">AI Assistant</p>
                <p className="text-[10px] text-on-surface-variant">Clinic workflow help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              aria-label="Minimize AI assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-2">
            <AiAssistantClient variant="widget" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-premium border border-primary/30 transition-all',
          open
            ? 'bg-surface-container text-primary'
            : 'bg-gradient-to-br from-violet-600 to-purple-700 text-white hover:opacity-90'
        )}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  );
}
