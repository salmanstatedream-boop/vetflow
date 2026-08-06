import Link from 'next/link';
import { ChevronRight, ListTodo } from 'lucide-react';
import type { StaffTaskRow } from '@/lib/services/staff-task-actions';
import { cn } from '@/lib/utils';

const STATUS_META: Record<string, { label: string; dot: string; chip: string }> = {
  open: {
    label: 'Open',
    dot: 'bg-amber-400',
    chip: 'text-amber-300 bg-amber-500/10',
  },
  in_progress: {
    label: 'In progress',
    dot: 'bg-sky-400',
    chip: 'text-sky-300 bg-sky-500/10',
  },
  done: {
    label: 'Done',
    dot: 'bg-emerald-400',
    chip: 'text-emerald-300 bg-emerald-500/10',
  },
};

type Props = {
  tasks: StaffTaskRow[];
};

export default function MyTasksCard({ tasks }: Props) {
  const openCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <section className="dashboard-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center shrink-0">
            <ListTodo className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-on-surface">My tasks</h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              <span className="tabular-nums font-semibold text-on-surface/80">{openCount}</span>
              {' '}open
              <span className="mx-1.5 opacity-40">·</span>
              <span className="tabular-nums">{tasks.length}</span> assigned
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/40 px-4 py-6 text-center">
          <p className="text-xs text-on-surface-variant">You’re all caught up — no open tasks.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {tasks.slice(0, 5).map((task) => {
            const meta = STATUS_META[task.status] || STATUS_META.open!;
            return (
              <li key={task.id}>
                <Link
                  href="/dashboard/tasks"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-container/50 transition-colors active:scale-[0.99]"
                >
                  <span className={cn('h-2 w-2 rounded-full shrink-0', meta.dot)} />
                  <span className="text-sm text-on-surface line-clamp-1 flex-1 min-w-0">
                    {task.title}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md',
                      meta.chip
                    )}
                  >
                    {meta.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
