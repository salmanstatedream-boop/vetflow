'use client';

import type { ReactNode } from 'react';

const fieldClass =
  'w-full h-9 px-2.5 py-1.5 bg-surface-container/40 border border-outline-variant/60 rounded-lg text-xs text-on-surface outline-none focus:border-primary/50';
const labelClass =
  'block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1';
const textareaClass =
  'w-full min-h-[4.5rem] px-2.5 py-2 bg-surface-container/40 border border-outline-variant/60 rounded-lg text-xs text-on-surface outline-none focus:border-primary/50 resize-y';

export { fieldClass, labelClass, textareaClass };

type WorkflowSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function WorkflowSectionCard({ title, description, children }: WorkflowSectionCardProps) {
  return (
    <div className="glass-panel rounded-xl border border-outline-variant/40 p-4 space-y-3">
      <div>
        <h3 className="text-xs font-bold text-on-surface">{title}</h3>
        {description ? (
          <p className="text-[10px] text-on-surface-variant mt-0.5">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
