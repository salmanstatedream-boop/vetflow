'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  addStaffTaskReplyAction,
  createStaffTaskAction,
  getStaffTaskAction,
  listStaffTasksAction,
  updateStaffTaskStatusAction,
  type StaffOption,
  type StaffTaskReplyRow,
  type StaffTaskRow,
  type StaffTaskStatus,
} from '@/lib/services/staff-task-actions';
import { createClient } from '@/lib/supabase/client';
import {
  btnPrimaryClass,
  btnSmClass,
  chipActiveClass,
  chipClass,
  inputClass,
} from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  ListTodo,
  MessageSquare,
  Plus,
  Send,
  UserRound,
} from 'lucide-react';

const STATUS_LABEL: Record<StaffTaskStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_META: Record<
  StaffTaskStatus,
  { className: string; dot: string; Icon: typeof CircleDashed }
> = {
  open: {
    className: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400',
    Icon: CircleDashed,
  },
  in_progress: {
    className: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
    dot: 'bg-sky-400',
    Icon: Loader2,
  },
  done: {
    className: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
    Icon: CheckCircle2,
  },
};

function initials(name?: string | null) {
  const parts = (name || 'S').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || 'S') + (parts[1]?.[0] || '')).toUpperCase();
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ');
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function repliesSignature(replies: StaffTaskReplyRow[]) {
  return replies.map((r) => `${r.id}:${r.created_at}`).join('|');
}

type Props = {
  initialTasks: StaffTaskRow[];
  staff: StaffOption[];
  currentUserId: string;
  canCreate: boolean;
};

export default function StaffTasksClient({
  initialTasks,
  staff,
  currentUserId,
  canCreate,
}: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTasks[0]?.id ?? null
  );
  const [filterMine, setFilterMine] = useState(!canCreate);
  const [replies, setReplies] = useState<StaffTaskReplyRow[]>([]);
  const [replyBody, setReplyBody] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [assigneeId, setAssigneeId] = useState(staff[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selectedIdRef = useRef<string | null>(selectedId);
  const repliesSigRef = useRef('');

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const visible = useMemo(() => {
    if (!filterMine) return tasks;
    return tasks.filter((t) => t.assignee_id === currentUserId);
  }, [tasks, filterMine, currentUserId]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      mine: tasks.filter((t) => t.assignee_id === currentUserId).length,
    }),
    [tasks, currentUserId]
  );

  const selected = visible.find((t) => t.id === selectedId) ?? null;

  const applyDetail = useCallback(
    (task: StaffTaskRow, nextReplies: StaffTaskReplyRow[], quiet: boolean) => {
      setTasks((prev) => {
        const idx = prev.findIndex((t) => t.id === task.id);
        if (idx < 0) return [task, ...prev];
        const cur = prev[idx]!;
        if (
          cur.status === task.status &&
          cur.title === task.title &&
          cur.body === task.body &&
          cur.updated_at === task.updated_at &&
          cur.assignee_name === task.assignee_name
        ) {
          return prev;
        }
        const copy = [...prev];
        copy[idx] = { ...cur, ...task };
        return copy;
      });

      const sig = repliesSignature(nextReplies);
      if (!quiet || sig !== repliesSigRef.current) {
        repliesSigRef.current = sig;
        setReplies(nextReplies);
      }
    },
    []
  );

  const loadDetail = useCallback(
    async (taskId: string, opts?: { quiet?: boolean; select?: boolean }) => {
      const quiet = opts?.quiet ?? false;
      const select = opts?.select ?? true;
      if (select) setSelectedId(taskId);
      if (!quiet) {
        setDetailLoading(true);
        setError(null);
      }
      try {
        const res = await getStaffTaskAction(taskId);
        if (selectedIdRef.current !== taskId && quiet) return;
        if (!res.success || !res.task) {
          if (!quiet) {
            setError(res.error || 'Failed to load task');
            setReplies([]);
          }
          return;
        }
        applyDetail(res.task, res.replies, quiet);
      } finally {
        if (!quiet && selectedIdRef.current === taskId) {
          setDetailLoading(false);
        }
      }
    },
    [applyDetail]
  );

  const refreshList = useCallback(async () => {
    const res = await listStaffTasksAction();
    if (!res.success) return;
    setTasks((prev) => {
      const byId = new Map(res.tasks.map((t) => [t.id, t]));
      const merged = prev.map((t) => {
        const next = byId.get(t.id);
        return next ? { ...t, ...next } : t;
      });
      for (const t of res.tasks) {
        if (!merged.some((m) => m.id === t.id)) merged.push(t);
      }
      const ids = new Set(res.tasks.map((t) => t.id));
      return merged
        .filter((t) => ids.has(t.id))
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
    });
  }, []);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId, { select: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedId && !visible.some((t) => t.id === selectedId)) {
      const next = visible[0]?.id ?? null;
      setSelectedId(next);
      if (next) void loadDetail(next);
      else setReplies([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMine, visible.length]);

  useEffect(() => {
    if (!selectedId) return;
    const taskId = selectedId;

    const poll = setInterval(() => {
      if (selectedIdRef.current !== taskId) return;
      void loadDetail(taskId, { quiet: true, select: false });
      void refreshList();
    }, 4500);

    const supabase = createClient();
    const channel = supabase
      .channel(`staff-task-${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'staff_tasks',
          filter: `id=eq.${taskId}`,
        },
        () => {
          if (selectedIdRef.current === taskId) {
            void loadDetail(taskId, { quiet: true, select: false });
            void refreshList();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'staff_task_replies',
          filter: `task_id=eq.${taskId}`,
        },
        () => {
          if (selectedIdRef.current === taskId) {
            void loadDetail(taskId, { quiet: true, select: false });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [selectedId, loadDetail, refreshList]);

  const handleCreate = () => {
    setError(null);
    startTransition(async () => {
      const res = await createStaffTaskAction({ title, body, assigneeId });
      if (!res.success || !res.task) {
        setError(res.error || 'Failed to create');
        return;
      }
      setTasks((prev) => [res.task!, ...prev]);
      setShowCreate(false);
      setTitle('');
      setBody('');
      setFilterMine(false);
      setSelectedId(res.task.id);
      await loadDetail(res.task.id);
      router.refresh();
    });
  };

  const handleStatus = (status: StaffTaskStatus) => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await updateStaffTaskStatusAction({
        taskId: selected.id,
        status,
      });
      if (!res.success) {
        setError(res.error || 'Failed to update');
        return;
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === selected.id ? { ...t, status } : t))
      );
      router.refresh();
    });
  };

  const handleReply = () => {
    if (!selected || !replyBody.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await addStaffTaskReplyAction({
        taskId: selected.id,
        body: replyBody,
      });
      if (!res.success || !res.reply) {
        setError(res.error || 'Failed to reply');
        return;
      }
      setReplies((prev) => {
        const next = [...prev, { ...res.reply!, author_name: 'You' }];
        repliesSigRef.current = repliesSignature(next);
        return next;
      });
      setReplyBody('');
      router.refresh();
    });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-3 md:gap-4 h-[min(720px,calc(100dvh-11rem))] min-h-[540px]">
      <aside className="lg:col-span-4 dashboard-card overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-3.5 border-b border-outline-variant/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface-container/60">
            <button
              type="button"
              onClick={() => setFilterMine(false)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors',
                !filterMine ? chipActiveClass : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              All
              <span className="ml-1 opacity-70 tabular-nums">{counts.all}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMine(true)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors',
                filterMine ? chipActiveClass : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              Mine
              <span className="ml-1 opacity-70 tabular-nums">{counts.mine}</span>
            </button>
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className={cn(
                btnSmClass,
                showCreate ? btnPrimaryClass : chipClass,
                'inline-flex items-center gap-1 active:scale-[0.97]'
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              {showCreate ? 'Close' : 'New'}
            </button>
          )}
        </div>

        {showCreate && canCreate && (
          <div className="p-4 border-b border-outline-variant/30 space-y-3 bg-surface-container/25 shrink-0">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className={cn(inputClass, 'py-2.5 rounded-xl')}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Details
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Context, deadline, or notes (optional)"
                rows={3}
                className={cn(inputClass, 'py-2.5 rounded-xl resize-none')}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                Assign to
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={cn(inputClass, 'py-2.5 rounded-xl capitalize')}
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatRole(s.role)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={pending || !title.trim() || !assigneeId}
              onClick={handleCreate}
              className={cn(btnPrimaryClass, 'w-full justify-center active:scale-[0.98]')}
            >
              {pending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create task'
              )}
            </button>
          </div>
        )}

        <ul className="flex-1 overflow-y-auto min-h-0">
          {visible.length === 0 ? (
            <li className="h-full min-h-[220px] flex flex-col items-center justify-center px-6 text-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                <ListTodo className="w-5 h-5 text-primary/70" />
              </div>
              <p className="text-sm font-semibold text-on-surface">No tasks here</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[14rem]">
                {canCreate
                  ? 'Create a ticket and assign it to a team member.'
                  : 'Assigned work will show up in this list.'}
              </p>
            </li>
          ) : (
            visible.map((task) => {
              const meta = STATUS_META[task.status];
              const active = selectedId === task.id;
              return (
                <li key={task.id} className="border-b border-outline-variant/15 last:border-0">
                  <button
                    type="button"
                    onClick={() => void loadDetail(task.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 transition-colors active:scale-[0.995]',
                      active
                        ? 'bg-primary/[0.08] border-l-2 border-l-primary'
                        : 'hover:bg-surface-container/45 border-l-2 border-l-transparent'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn('mt-1.5 h-2 w-2 rounded-full shrink-0', meta.dot)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
                            {task.title}
                          </p>
                          <span
                            className={cn(
                              'shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border',
                              meta.className
                            )}
                          >
                            {STATUS_LABEL[task.status]}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-on-surface-variant">
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <UserRound className="w-3 h-3 shrink-0 opacity-70" />
                            <span className="truncate">{task.assignee_name || 'Assignee'}</span>
                          </span>
                          <span className="opacity-40">·</span>
                          <span className="shrink-0 tabular-nums">
                            {relativeTime(task.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <section className="lg:col-span-8 dashboard-card overflow-hidden flex flex-col min-h-0">
        {error && (
          <div className="mx-5 mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive shrink-0">
            {error}
          </div>
        )}

        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-on-surface-variant/50" />
            </div>
            <p className="text-sm font-semibold text-on-surface">Select a task</p>
            <p className="text-[11px] text-on-surface-variant max-w-xs">
              Choose a ticket from the list to view details, update status, and reply.
            </p>
          </div>
        ) : detailLoading && replies.length === 0 && !selected.body ? (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <header className="px-5 py-4 border-b border-outline-variant/30 shrink-0 space-y-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-on-surface leading-snug">{selected.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-on-surface-variant">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                      {initials(selected.assignee_name)}
                    </span>
                    Assigned to {selected.assignee_name}
                  </span>
                  <span className="opacity-40">·</span>
                  <span>Created by {selected.creator_name}</span>
                  <span className="opacity-40">·</span>
                  <span className="tabular-nums">{relativeTime(selected.updated_at)}</span>
                </div>
              </div>

              <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-surface-container/70">
                {(['open', 'in_progress', 'done'] as StaffTaskStatus[]).map((status) => {
                  const meta = STATUS_META[status];
                  const Icon = meta.Icon;
                  const active = selected.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={pending || active}
                      onClick={() => handleStatus(status)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors active:scale-[0.97]',
                        active
                          ? cn('border', meta.className)
                          : 'text-on-surface-variant hover:bg-surface-container-high/60 disabled:opacity-40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3 h-3',
                          status === 'in_progress' && active && 'animate-spin'
                        )}
                      />
                      {STATUS_LABEL[status]}
                    </button>
                  );
                })}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto min-h-0 px-5 py-4 space-y-5">
              {selected.body ? (
                <div className="rounded-2xl border border-outline-variant/25 bg-surface-container/30 px-4 py-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Description
                  </p>
                  <p className="text-sm text-on-surface/90 whitespace-pre-wrap leading-relaxed">
                    {selected.body}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant/70 italic">No description provided.</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Discussion
                  </p>
                  <span className="text-[10px] text-on-surface-variant/60 tabular-nums">
                    {replies.length}
                  </span>
                </div>

                {replies.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/70 py-2">
                    No replies yet. Leave the first update for your team.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {replies.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-2xl border border-outline-variant/20 bg-surface-container/35 px-3.5 py-3"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-surface-container-high text-[9px] font-bold text-on-surface flex items-center justify-center shrink-0">
                              {initials(r.author_name)}
                            </span>
                            <span className="text-[11px] font-semibold text-on-surface truncate">
                              {r.author_name}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant tabular-nums shrink-0">
                            {relativeTime(r.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant whitespace-pre-wrap pl-8 leading-relaxed">
                          {r.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant/30 shrink-0 bg-surface-container/15">
              <div className="flex items-end gap-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write an update…"
                  rows={1}
                  className={cn(
                    inputClass,
                    'flex-1 py-2.5 rounded-xl resize-none min-h-[44px] max-h-28'
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={pending || !replyBody.trim()}
                  onClick={handleReply}
                  className={cn(
                    btnPrimaryClass,
                    'h-11 w-11 shrink-0 !px-0 justify-center active:scale-[0.96]'
                  )}
                  aria-label="Send reply"
                >
                  {pending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-on-surface-variant/60 pl-1">
                Enter to send · Shift+Enter for a new line
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
