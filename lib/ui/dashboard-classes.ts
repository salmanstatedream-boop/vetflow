/**
 * Shared Tailwind classes for Phoenix OS dashboard surfaces.
 * Prefer premium components (Button, Input, PageHeader, DataTable, Modal) over raw classes.
 * Page spacing: wrap content in `space-y-8`. Tables: use DataTable + horizontal scroll on mobile.
 */
export const pageTitleClass =
  'app-heading text-xl tracking-tight';
export const pageDescClass = 'text-xs text-on-surface-variant mt-1';
export const cardClass = 'glass-panel rounded-2xl overflow-hidden';
export const cardInnerClass = 'p-5 md:p-6';
export const tableHeadClass =
  'bg-surface-container-high border-b border-outline-variant text-[10px] font-bold font-mono text-on-surface-variant uppercase tracking-wider';
export const tableRowClass =
  'hover:bg-primary/5 even:bg-surface-container/30 transition-colors border-b border-outline-variant/50';
export const inputClass =
  'w-full px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface app-focus-ring';
export const btnPrimaryClass =
  'app-btn-primary app-focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
export const btnSecondaryClass =
  'border border-outline-variant text-on-surface-variant py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-surface-container-high hover:border-primary/25 transition-colors app-focus-ring';
export const badgeActiveClass =
  'inline-flex items-center gap-1 bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold';
export const badgeDangerClass =
  'inline-flex items-center gap-1 bg-destructive/15 text-destructive px-2.5 py-0.5 rounded-full text-[10px] font-bold';
