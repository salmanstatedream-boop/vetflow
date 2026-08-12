'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  listOwnerInboxMessagesAction,
  listOwnerInboxThreadsAction,
  replyOwnerInboxAction,
  type OwnerInboxMessage,
  type OwnerInboxThread,
} from '@/lib/services/owner-inbox-actions';

export default function OwnerInboxClient({
  initialThreads,
}: {
  initialThreads: OwnerInboxThread[];
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(initialThreads[0]?.id || null);
  const [messages, setMessages] = useState<OwnerInboxMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    startTransition(async () => {
      const res = await listOwnerInboxMessagesAction(activeId);
      if (!res.success) {
        setError(res.error);
        setMessages([]);
        return;
      }
      setError(null);
      setMessages(res.messages);
    });
  }, [activeId]);

  const refreshThreads = () => {
    startTransition(async () => {
      const res = await listOwnerInboxThreadsAction();
      if (res.success) setThreads(res.threads);
    });
  };

  const send = () => {
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft('');
    startTransition(async () => {
      const res = await replyOwnerInboxAction({ threadId: activeId, body });
      if (!res.success) {
        setError(res.error || 'Send failed');
        setDraft(body);
        return;
      }
      setMessages((prev) => [...prev, res.message!]);
      refreshThreads();
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[60vh]">
      <aside className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/30 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          Owner conversations
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {threads.length === 0 ? (
            <p className="p-4 text-sm text-on-surface-variant">No owner messages yet.</p>
          ) : (
            threads.map((t) => {
              const active = t.id === activeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-4 py-3 border-b border-outline-variant/20 transition-colors ${
                    active ? 'bg-primary/10' : 'hover:bg-surface-container/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-on-surface truncate">
                      {t.customerName}
                    </span>
                    {t.unreadCount > 0 ? (
                      <span className="text-[10px] font-bold bg-primary text-on-primary rounded-full px-1.5 py-0.5">
                        {t.unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-on-surface-variant truncate mt-1">
                    {t.lastMessage || 'No messages'}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container/20 flex flex-col min-h-[60vh]">
        {error ? (
          <div className="m-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
            {error}
          </div>
        ) : null}
        {!activeId ? (
          <div className="flex-1 grid place-items-center text-sm text-on-surface-variant">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const mine = m.senderType === 'staff';
                return (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'ml-auto bg-primary text-on-primary'
                        : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    <p>{m.body}</p>
                    <p className={`text-[10px] mt-1 ${mine ? 'opacity-80' : 'text-on-surface-variant'}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
              {pending && messages.length === 0 ? (
                <p className="text-xs text-on-surface-variant">Loading…</p>
              ) : null}
            </div>
            <div className="p-3 border-t border-outline-variant/30 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Reply to owner…"
                className="flex-1 rounded-xl bg-surface-container/40 border border-outline-variant/50 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={pending || !draft.trim()}
                onClick={send}
                className="rounded-xl bg-primary text-on-primary px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
