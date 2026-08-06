'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import {
  deleteStaffMessageAction,
  editStaffMessageAction,
  getOrCreateConversationAction,
  hideStaffConversationAction,
  listStaffConversationsAction,
  listStaffMessagesAction,
  sendStaffMessageAction,
  sendStaffVoiceMessageAction,
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
import MessageBubble from '@/components/chat/MessageBubble';
import VoiceRecorderButton from '@/components/chat/VoiceRecorderButton';
import {
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  Search,
  Send,
  Trash2,
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

function mergeMessages(
  prev: StaffMessageRow[],
  next: StaffMessageRow[]
): StaffMessageRow[] {
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of next) map.set(m.id, m);
  return [...map.values()].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
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
  const [activeId, setActiveIdState] = useState<string | null>(
    initialConversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<StaffMessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [coworkerQuery, setCoworkerQuery] = useState('');
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [voiceResetKey, setVoiceResetKey] = useState(0);
  const [pending, startTransition] = useTransition();

  const activeIdRef = useRef<string | null>(activeId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickBottomRef = useRef(true);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    setActiveIdState(id);
    setMessages([]);
    setDraft('');
    setError(null);
    setHeaderMenuOpen(false);
    setConfirmHide(false);
    shouldStickBottomRef.current = true;
  }, []);

  const filteredCoworkers = useMemo(() => {
    const q = coworkerQuery.trim().toLowerCase();
    if (!q) return coworkers;
    return coworkers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    );
  }, [coworkers, coworkerQuery]);

  const refreshConversations = useCallback(async () => {
    const res = await listStaffConversationsAction();
    if (res.success) setConversations(res.conversations);
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string, quiet = false) => {
      if (!quiet) setLoadingMessages(true);
      try {
        const res = await listStaffMessagesAction(conversationId);
        if (activeIdRef.current !== conversationId) return;
        if (!res.success) {
          if (!quiet) {
            setError(res.error || 'Failed to load messages');
            setMessages([]);
          }
          return;
        }
        if (quiet) {
          setMessages((prev) => mergeMessages(prev, res.messages));
        } else {
          setMessages(res.messages);
        }
      } finally {
        if (!quiet && activeIdRef.current === conversationId) {
          setLoadingMessages(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (activeId) void loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    if (!shouldStickBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      shouldStickBottomRef.current = dist < 80;
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;

    const conversationId = activeId;
    const poll = setInterval(() => {
      if (activeIdRef.current !== conversationId) return;
      void loadMessages(conversationId, true);
      void refreshConversations();
    }, 4000);

    const supabase = createClient();
    const channel = supabase
      .channel(`staff-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (activeIdRef.current !== conversationId) return;
          if (payload.eventType === 'INSERT') {
            const row = payload.new as StaffMessageRow;
            if (row.conversation_id !== conversationId) return;
            setMessages((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return mergeMessages(prev, [
                {
                  ...row,
                  body: row.body || '',
                  message_type: row.message_type || 'text',
                  edited_at: row.edited_at ?? null,
                  deleted_at: row.deleted_at ?? null,
                  audio_path: row.audio_path ?? null,
                  audio_duration_sec: row.audio_duration_sec ?? null,
                },
              ]);
            });
            void loadMessages(conversationId, true);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as StaffMessageRow;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === row.id
                  ? {
                      ...m,
                      ...row,
                      body: row.body || '',
                      edited_at: row.edited_at ?? null,
                      deleted_at: row.deleted_at ?? null,
                      audio_path: row.audio_path ?? null,
                      audio_duration_sec: row.audio_duration_sec ?? null,
                    }
                  : m
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [activeId, loadMessages, refreshConversations]);

  useEffect(() => {
    if (!headerMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!headerMenuRef.current?.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [headerMenuOpen]);

  const startDm = (userId: string) => {
    setError(null);
    const existing = conversations.find((c) => c.other_user_id === userId);
    if (existing) {
      setActiveId(existing.id);
      setShowNew(false);
      setCoworkerQuery('');
      requestAnimationFrame(() => composerRef.current?.focus());
      return;
    }

    setStartingWith(userId);
    startTransition(async () => {
      const res = await getOrCreateConversationAction(userId);
      setStartingWith(null);
      if (!res.success || !res.conversationId) {
        setError(res.error || 'Failed to start chat');
        return;
      }
      await refreshConversations();
      setActiveId(res.conversationId);
      setShowNew(false);
      setCoworkerQuery('');
      requestAnimationFrame(() => composerRef.current?.focus());
    });
  };

  const send = () => {
    const conversationId = activeIdRef.current;
    if (!conversationId || !draft.trim()) return;
    const body = draft.trim();
    setDraft('');
    setError(null);
    shouldStickBottomRef.current = true;

    startTransition(async () => {
      const res = await sendStaffMessageAction({ conversationId, body });
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to send');
        if (activeIdRef.current === conversationId) setDraft(body);
        return;
      }
      if (activeIdRef.current === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message!.id)) return prev;
          return mergeMessages(prev, [res.message!]);
        });
      }
      await refreshConversations();
    });
  };

  const sendVoice = (blob: Blob, durationSec: number, mimeType: string) => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    setError(null);
    setVoiceUploading(true);
    shouldStickBottomRef.current = true;

    startTransition(async () => {
      const fd = new FormData();
      fd.set('conversationId', conversationId);
      fd.set('durationSec', String(durationSec));
      fd.set('mimeType', mimeType);
      fd.set('audio', blob, 'voice.webm');

      const res = await sendStaffVoiceMessageAction(fd);
      setVoiceUploading(false);
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to send voice note');
        return;
      }
      if (activeIdRef.current === conversationId) {
        setMessages((prev) => mergeMessages(prev, [res.message!]));
        setVoiceResetKey((k) => k + 1);
      }
      await refreshConversations();
    });
  };

  const handleEdit = (messageId: string, body: string) => {
    const conversationId = activeIdRef.current;
    startTransition(async () => {
      const res = await editStaffMessageAction({ messageId, body });
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to edit');
        return;
      }
      if (activeIdRef.current === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === res.message!.id ? res.message! : m))
        );
      }
      await refreshConversations();
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    const conversationId = activeIdRef.current;
    startTransition(async () => {
      const res = await deleteStaffMessageAction(messageId);
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to delete');
        return;
      }
      if (activeIdRef.current === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === res.message!.id ? res.message! : m))
        );
      }
      await refreshConversations();
    });
  };

  const handleHideConversation = () => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    startTransition(async () => {
      const res = await hideStaffConversationAction(conversationId);
      if (!res.success) {
        setError(res.error || 'Failed to delete conversation');
        return;
      }
      setConfirmHide(false);
      setHeaderMenuOpen(false);
      await refreshConversations();
      const remaining = (await listStaffConversationsAction()).conversations;
      setConversations(remaining);
      setActiveId(remaining[0]?.id ?? null);
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
            {showNew ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <MessageSquarePlus className="w-3.5 h-3.5" />
            )}
            {showNew ? 'Close' : 'New'}
          </button>
        </div>

        {showNew && (
          <div className="p-3 border-b border-outline-variant/30 bg-surface-container/20 shrink-0 space-y-2 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/60" />
              <input
                value={coworkerQuery}
                onChange={(e) => setCoworkerQuery(e.target.value)}
                placeholder="Search coworkers…"
                className={cn(inputClass, 'pl-9 py-2 rounded-xl text-xs')}
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filteredCoworkers.length === 0 ? (
                <p className="text-xs text-on-surface-variant px-2 py-3 text-center">
                  No coworkers found.
                </p>
              ) : (
                filteredCoworkers.map((c) => {
                  const existing = conversations.find(
                    (x) => x.other_user_id === c.id
                  );
                  const loading = startingWith === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={pending || loading}
                      onClick={() => startDm(c.id)}
                      className="w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-xl hover:bg-surface-container/60 transition-colors active:scale-[0.99]"
                    >
                      <span className="w-8 h-8 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {initials(c.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-on-surface truncate">
                          {c.name}
                        </span>
                        <span className="block text-[10px] text-on-surface-variant capitalize truncate">
                          {existing
                            ? 'Open conversation'
                            : formatRole(c.role)}
                        </span>
                      </span>
                      {loading && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
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
              <p className="text-sm font-semibold text-on-surface">
                No conversations yet
              </p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed max-w-[14rem]">
                Start a private message with a coworker using New.
              </p>
            </li>
          ) : (
            conversations.map((c) => {
              const activeRow = activeId === c.id;
              return (
                <li
                  key={c.id}
                  className="border-b border-outline-variant/15 last:border-0"
                >
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
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-on-surface truncate">
                  {active.other_user_name}
                </h2>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  Private · only the two of you can read this
                </p>
              </div>
              <div ref={headerMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setHeaderMenuOpen((v) => !v)}
                  className={cn(chipClass, 'h-9 w-9 !px-0 justify-center')}
                  aria-label="Conversation options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {headerMenuOpen && (
                  <div className="absolute right-0 top-10 w-52 rounded-xl border border-outline-variant/40 bg-surface-container-high shadow-lg py-1 z-20">
                    {!confirmHide ? (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setConfirmHide(true)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete conversation
                      </button>
                    ) : (
                      <div className="px-3 py-2.5 space-y-2">
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          Hide this chat for you only. {active.other_user_name}{' '}
                          keeps their copy.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className={cn(chipClass, 'flex-1 justify-center text-[10px]')}
                            onClick={() => setConfirmHide(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            className={cn(
                              btnPrimaryClass,
                              'flex-1 justify-center text-[10px] !bg-destructive'
                            )}
                            onClick={handleHideConversation}
                          >
                            Hide
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-4"
        >
          {!active ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center gap-2 text-center px-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-on-surface-variant/50" />
              </div>
              <p className="text-sm font-semibold text-on-surface">
                Your staff inbox
              </p>
              <p className="text-[11px] text-on-surface-variant max-w-xs leading-relaxed">
                Direct messages stay between you and one coworker. Platform
                admins cannot read message content.
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
                Send a text or voice note to start this conversation.
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
                  new Date(m.created_at).getTime() -
                    new Date(prev.created_at).getTime() <
                    5 * 60 * 1000 &&
                  !m.deleted_at &&
                  !prev.deleted_at;

                return (
                  <div key={m.id}>
                    {showDay && (
                      <div className="flex items-center justify-center my-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70 bg-surface-container/80 px-2.5 py-1 rounded-full">
                          {dayLabel(m.created_at)}
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={m}
                      mine={mine}
                      stacked={stacked}
                      currentUserId={currentUserId}
                      onEdit={handleEdit}
                      onDelete={handleDeleteMessage}
                      pending={pending}
                    />
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
              <VoiceRecorderButton
                disabled={pending}
                uploading={voiceUploading}
                resetKey={`${activeId}-${voiceResetKey}`}
                onSend={sendVoice}
              />
              <textarea
                ref={composerRef}
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
                disabled={pending || voiceUploading || !draft.trim()}
                onClick={send}
                className={cn(
                  btnPrimaryClass,
                  'h-11 w-11 shrink-0 !px-0 justify-center active:scale-[0.96]'
                )}
                aria-label="Send message"
              >
                {pending && !voiceUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-on-surface-variant/60 pl-1">
              Enter to send · Shift+Enter for a new line · Mic for voice notes
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
