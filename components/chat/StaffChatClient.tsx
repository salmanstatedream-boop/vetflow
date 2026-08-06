'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  getOrCreateConversationAction,
  listStaffConversationsAction,
  listStaffMessagesAction,
  sendStaffMessageAction,
  type StaffChatCoworker,
  type StaffConversationRow,
  type StaffMessageRow,
} from '@/lib/services/staff-chat-actions';
import { createClient } from '@/lib/supabase/client';
import {
  btnPrimaryClass,
  btnSmClass,
  chipClass,
  inputClass,
} from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';
import {
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Send,
  X,
} from 'lucide-react';

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
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

type Props = {
  initialConversations: StaffConversationRow[];
  coworkers: StaffChatCoworker[];
  currentUserId: string;
};

export default function StaffChatClient({
  initialConversations,
  coworkers,
  currentUserId,
}: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialConversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<StaffMessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [coworkerQuery, setCoworkerQuery] = useState('');
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const filteredCoworkers = useMemo(() => {
    const q = coworkerQuery.trim().toLowerCase();
    if (!q) return coworkers;
    return coworkers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
    );
  }, [coworkers, coworkerQuery]);

  const loadMessages = async (conversationId: string, quiet = false) => {
    if (!quiet) setLoadingMessages(true);
    setError(null);
    try {
      const res = await listStaffMessagesAction(conversationId);
      if (!res.success) {
        if (!quiet) {
          setError(res.error || 'Failed to load messages');
          setMessages([]);
        }
        return;
      }
      setMessages(res.messages);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  };

  const refreshConversations = async () => {
    const res = await listStaffConversationsAction();
    if (res.success) setConversations(res.conversations);
  };

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!activeId) return;

    const poll = setInterval(() => {
      void loadMessages(activeId, true);
      void refreshConversations();
    }, 4000);

    const supabase = createClient();
    const channel = supabase
      .channel(`staff-chat-${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'staff_messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          const row = payload.new as StaffMessageRow;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [activeId]);

  const startDm = (userId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await getOrCreateConversationAction(userId);
      if (!res.success || !res.conversationId) {
        setError(res.error || 'Failed to start chat');
        return;
      }
      await refreshConversations();
      setActiveId(res.conversationId);
      setShowNew(false);
      setCoworkerQuery('');
    });
  };

  const send = () => {
    if (!activeId || !draft.trim()) return;
    const body = draft.trim();
    setDraft('');
    setError(null);
    startTransition(async () => {
      const res = await sendStaffMessageAction({
        conversationId: activeId,
        body,
      });
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to send');
        setDraft(body);
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev;
        return [...prev, res.message!];
      });
      await refreshConversations();
    });
  };

  return (
    <div className="grid lg:grid-cols-12 gap-3 md:gap-4 h-[min(720px,calc(100dvh-11rem))] min-h-[540px]">
      <aside className="lg:col-span-4 dashboard-card overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-3.5 border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Inbox
            </p>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5 tabular-nums">
              {conversations.length} conversation
              {conversations.length === 1 ? '' : 's'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className={cn(
              btnSmClass,
              showNew ? btnPrimaryClass : chipClass,
              'inline-flex items-center gap-1 active:scale-[0.97]'
            )}
          >
            {showNew ? <X className="w-3.5 h-3.5" /> : <MessageSquarePlus className="w-3.5 h-3.5" />}
            {showNew ? 'Close' : 'New'}
          </button>
        </div>

        {showNew && (
          <div className="p-3 border-b border-outline-variant/30 bg-surface-container/20 shrink-0 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/60" />
              <input
                value={coworkerQuery}
                onChange={(e) => setCoworkerQuery(e.target.value)}
                placeholder="Search coworkers…"
                className={cn(inputClass, 'pl-9 py-2 rounded-xl text-xs')}
              />
            </div>
            <div className="max-h-44 overflow-y-auto space-y-0.5">
              {filteredCoworkers.length === 0 ? (
                <p className="text-xs text-on-surface-variant px-2 py-3 text-center">
                  No coworkers found.
                </p>
              ) : (
                filteredCoworkers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={pending}
                    onClick={() => startDm(c.id)}
                    className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-xl hover:bg-surface-container/60 transition-colors active:scale-[0.99]"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                      {initials(c.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-on-surface truncate">
                        {c.name}
                      </span>
                      <span className="block text-[10px] text-on-surface-variant capitalize truncate">
                        {formatRole(c.role)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <ul className="flex-1 overflow-y-auto min-h-0">
          {conversations.length === 0 ? (
            <li className="h-full min-h-[220px] flex flex-col items-center justify-center px-6 text-center gap-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                <MessageSquare className="w-5 h-5 text-primary/70" />
              </div>
              <p className="text-sm font-semibold text-on-surface">No conversations yet</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[14rem]">
                Start a private message with a coworker using New.
              </p>
            </li>
          ) : (
            conversations.map((c) => {
              const activeRow = activeId === c.id;
              return (
                <li key={c.id} className="border-b border-outline-variant/15 last:border-0">
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      'w-full text-left px-4 py-3.5 transition-colors active:scale-[0.995]',
                      activeRow
                        ? 'bg-primary/[0.08] border-l-2 border-l-primary'
                        : 'hover:bg-surface-container/45 border-l-2 border-l-transparent'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-9 h-9 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0',
                          activeRow
                            ? 'bg-primary/20 text-primary'
                            : 'bg-surface-container-high text-on-surface'
                        )}
                      >
                        {initials(c.other_user_name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {c.other_user_name}
                          </p>
                          <span className="text-[10px] text-on-surface-variant tabular-nums shrink-0">
                            {relativeTime(c.updated_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {c.last_message || 'No messages yet'}
                        </p>
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
        <header className="px-5 py-3.5 border-b border-outline-variant/30 shrink-0 flex items-center gap-3 min-h-[68px]">
          {active ? (
            <>
              <span className="w-10 h-10 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {initials(active.other_user_name)}
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-on-surface truncate">
                  {active.other_user_name}
                </h2>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Private · only the two of you can read this
                </p>
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-sm font-bold text-on-surface">Messages</h2>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                Select a conversation to begin
              </p>
            </div>
          )}
        </header>

        {error && (
          <div className="mx-5 mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive shrink-0">
            {error}
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-4">
          {!active ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-on-surface-variant/50" />
              </div>
              <p className="text-sm font-semibold text-on-surface">Your staff inbox</p>
              <p className="text-[11px] text-on-surface-variant max-w-xs leading-relaxed">
                Direct messages stay between you and one coworker. Platform admins cannot read
                message content.
              </p>
            </div>
          ) : loadingMessages && messages.length === 0 ? (
            <div className="h-full min-h-[240px] flex items-center justify-center text-on-surface-variant">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2 text-center px-6">
              <p className="text-sm font-semibold text-on-surface">Say hello</p>
              <p className="text-[11px] text-on-surface-variant">
                Send the first message to start this conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((m, idx) => {
                const mine = m.sender_id === currentUserId;
                const prev = messages[idx - 1];
                const showDay = !prev || !sameDay(prev.created_at, m.created_at);
                const stacked =
                  !!prev &&
                  prev.sender_id === m.sender_id &&
                  sameDay(prev.created_at, m.created_at) &&
                  new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() <
                    5 * 60 * 1000;

                return (
                  <div key={m.id}>
                    {showDay && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 bg-surface-container/80 px-2.5 py-1 rounded-full">
                          {dayLabel(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'flex',
                        mine ? 'justify-end' : 'justify-start',
                        stacked ? 'mt-0.5' : 'mt-2.5'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[78%] sm:max-w-[70%] px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed shadow-sm',
                          mine
                            ? 'bg-primary text-on-primary rounded-2xl rounded-br-md'
                            : 'bg-surface-container text-on-surface rounded-2xl rounded-bl-md border border-outline-variant/25'
                        )}
                      >
                        {m.body}
                        <p
                          className={cn(
                            'text-[9px] mt-1 tabular-nums text-right',
                            mine ? 'text-on-primary/65' : 'text-on-surface-variant/80'
                          )}
                        >
                          {messageTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {active && (
          <div className="p-4 border-t border-outline-variant/30 shrink-0 bg-surface-container/15">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${active.other_user_name.split(' ')[0]}…`}
                rows={1}
                className={cn(
                  inputClass,
                  'flex-1 py-2.5 rounded-xl resize-none min-h-[44px] max-h-28'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <button
                type="button"
                disabled={pending || !draft.trim()}
                onClick={send}
                className={cn(
                  btnPrimaryClass,
                  'h-11 w-11 shrink-0 !px-0 justify-center active:scale-[0.96]'
                )}
                aria-label="Send message"
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
        )}
      </section>
    </div>
  );
}
