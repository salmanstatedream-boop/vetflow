'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createStaffGroupAction,
  deleteStaffMessageAction,
  editStaffMessageAction,
  getOrCreateConversationAction,
  hideStaffConversationAction,
  listStaffConversationsAction,
  listStaffMessagesAction,
  markStaffConversationReadAction,
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
  chipActiveClass,
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
  Users,
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

function ThreadSkeleton() {
  return (
    <div className="space-y-3 pt-4" aria-hidden>
      <div className="flex justify-start">
        <div className="h-10 w-[42%] rounded-2xl rounded-bl-md bg-surface-container/70 animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-[48%] rounded-2xl rounded-br-md bg-primary/15 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-9 w-[36%] rounded-2xl rounded-bl-md bg-surface-container/70 animate-pulse" />
      </div>
    </div>
  );
}

type Props = {
  initialConversations: StaffConversationRow[];
  coworkers: StaffChatCoworker[];
  currentUserId: string;
  canCreateGroup?: boolean;
  initialActiveId?: string;
};

export default function StaffChatClient({
  initialConversations,
  coworkers,
  currentUserId,
  canCreateGroup = false,
  initialActiveId,
}: Props) {
  const [conversations, setConversations] = useState(initialConversations);
  const conversationsRef = useRef(initialConversations);
  const [activeId, setActiveIdState] = useState<string | null>(
    initialActiveId ?? initialConversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<StaffMessageRow[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  /** Cold open with unknown content (has preview, no cache) */
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTab, setNewTab] = useState<'direct' | 'group'>('direct');
  const [coworkerQuery, setCoworkerQuery] = useState('');
  const [startingWith, setStartingWith] = useState<string | null>(null);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupMemberIds, setGroupMemberIds] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);
  const [voiceUploading, setVoiceUploading] = useState(false);
  const [voiceResetKey, setVoiceResetKey] = useState(0);
  const [sending, setSending] = useState(false);
  const [mutating, setMutating] = useState(false);

  const activeIdRef = useRef<string | null>(activeId);
  const messagesByConvoRef = useRef<Map<string, StaffMessageRow[]>>(new Map());
  const prefetchInFlightRef = useRef<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickBottomRef = useRef(true);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const writeCache = useCallback((conversationId: string, next: StaffMessageRow[]) => {
    messagesByConvoRef.current.set(conversationId, next);
  }, []);

  const patchActiveMessages = useCallback(
    (
      conversationId: string,
      updater: (prev: StaffMessageRow[]) => StaffMessageRow[]
    ) => {
      const prev = messagesByConvoRef.current.get(conversationId) || [];
      const next = updater(prev);
      writeCache(conversationId, next);
      if (activeIdRef.current === conversationId) {
        setMessages(next);
      }
    },
    [writeCache]
  );

  const refreshConversations = useCallback(async () => {
    const res = await listStaffConversationsAction();
    if (res.success) setConversations(res.conversations);
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string, opts?: { quiet?: boolean; forPrefetch?: boolean }) => {
      const quiet = opts?.quiet ?? true;
      const forPrefetch = opts?.forPrefetch ?? false;
      try {
        const res = await listStaffMessagesAction(conversationId);
        if (!res.success) {
          if (!quiet && activeIdRef.current === conversationId) {
            setError(res.error || 'Failed to load messages');
          }
          return;
        }
        writeCache(conversationId, res.messages);
        if (!forPrefetch && activeIdRef.current === conversationId) {
          setMessages(res.messages);
          setShowSkeleton(false);
        }
      } finally {
        if (!forPrefetch && activeIdRef.current === conversationId) {
          setShowSkeleton(false);
        }
        prefetchInFlightRef.current.delete(conversationId);
      }
    },
    [writeCache]
  );

  const selectConversation = useCallback(
    (id: string | null) => {
      activeIdRef.current = id;
      setActiveIdState(id);
      setDraft('');
      setError(null);
      setHeaderMenuOpen(false);
      setConfirmHide(false);
      shouldStickBottomRef.current = true;

      if (!id) {
        setMessages([]);
        setShowSkeleton(false);
        return;
      }

      void markStaffConversationReadAction(id);

      const cached = messagesByConvoRef.current.get(id);
      const row = conversationsRef.current.find((c) => c.id === id);
      const apparentlyEmpty = !row?.last_message;

      if (cached) {
        setMessages(cached);
        setShowSkeleton(false);
        void loadMessages(id, { quiet: true });
        return;
      }

      if (apparentlyEmpty) {
        setMessages([]);
        setShowSkeleton(false);
        void loadMessages(id, { quiet: true });
        return;
      }

      setMessages([]);
      setShowSkeleton(true);
      void loadMessages(id, { quiet: true });
    },
    [loadMessages]
  );

  const prefetchConversation = useCallback(
    (id: string) => {
      if (messagesByConvoRef.current.has(id)) return;
      if (prefetchInFlightRef.current.has(id)) return;
      prefetchInFlightRef.current.add(id);
      void loadMessages(id, { quiet: true, forPrefetch: true });
    },
    [loadMessages]
  );

  // Initial thread paint without blank spinner
  useEffect(() => {
    if (activeId) selectConversation(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

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
    const messagePoll = setInterval(() => {
      if (activeIdRef.current !== conversationId) return;
      void loadMessages(conversationId, { quiet: true });
    }, 5000);

    const inboxPoll = setInterval(() => {
      if (activeIdRef.current !== conversationId) return;
      void refreshConversations();
    }, 15000);

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
            patchActiveMessages(conversationId, (prev) => {
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
                  audio_url: null,
                },
              ]);
            });
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as StaffMessageRow;
            patchActiveMessages(conversationId, (prev) =>
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
      clearInterval(messagePoll);
      clearInterval(inboxPoll);
      void supabase.removeChannel(channel);
    };
  }, [activeId, loadMessages, patchActiveMessages, refreshConversations]);

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

  const filteredCoworkers = useMemo(() => {
    const q = coworkerQuery.trim().toLowerCase();
    if (!q) return coworkers;
    return coworkers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    );
  }, [coworkers, coworkerQuery]);

  const startDm = async (userId: string) => {
    setError(null);
    const existing = conversations.find(
      (c) => c.type !== 'group' && c.other_user_id === userId
    );
    if (existing) {
      selectConversation(existing.id);
      setShowNew(false);
      setCoworkerQuery('');
      requestAnimationFrame(() => composerRef.current?.focus());
      return;
    }

    setStartingWith(userId);
    try {
      const res = await getOrCreateConversationAction(userId);
      if (!res.success || !res.conversationId) {
        setError(res.error || 'Failed to start chat');
        return;
      }
      await refreshConversations();
      selectConversation(res.conversationId);
      setShowNew(false);
      setCoworkerQuery('');
      requestAnimationFrame(() => composerRef.current?.focus());
    } finally {
      setStartingWith(null);
    }
  };

  const toggleGroupMember = (userId: string) => {
    setGroupMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!canCreateGroup || creatingGroup) return;
    setError(null);
    setCreatingGroup(true);
    try {
      const res = await createStaffGroupAction({
        title: groupTitle,
        memberIds: groupMemberIds,
      });
      if (!res.success || !res.conversationId) {
        setError(res.error || 'Failed to create group');
        return;
      }
      await refreshConversations();
      selectConversation(res.conversationId);
      setShowNew(false);
      setNewTab('direct');
      setGroupTitle('');
      setGroupMemberIds([]);
      setCoworkerQuery('');
      requestAnimationFrame(() => composerRef.current?.focus());
    } finally {
      setCreatingGroup(false);
    }
  };

  const send = async () => {
    const conversationId = activeIdRef.current;
    if (!conversationId || !draft.trim() || sending) return;
    const body = draft.trim();
    setDraft('');
    setError(null);
    shouldStickBottomRef.current = true;
    setSending(true);

    try {
      const res = await sendStaffMessageAction({ conversationId, body });
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to send');
        if (activeIdRef.current === conversationId) setDraft(body);
        return;
      }
      patchActiveMessages(conversationId, (prev) => {
        if (prev.some((m) => m.id === res.message!.id)) return prev;
        return mergeMessages(prev, [res.message!]);
      });
      await refreshConversations();
    } finally {
      setSending(false);
    }
  };

  const sendVoice = async (blob: Blob, durationSec: number, mimeType: string) => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    setError(null);
    setVoiceUploading(true);
    shouldStickBottomRef.current = true;

    try {
      const fd = new FormData();
      fd.set('conversationId', conversationId);
      fd.set('durationSec', String(durationSec));
      fd.set('mimeType', mimeType);
      fd.set('audio', blob, 'voice.webm');

      const res = await sendStaffVoiceMessageAction(fd);
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to send voice note');
        return;
      }
      patchActiveMessages(conversationId, (prev) =>
        mergeMessages(prev, [res.message!])
      );
      setVoiceResetKey((k) => k + 1);
      await refreshConversations();
    } finally {
      setVoiceUploading(false);
    }
  };

  const handleEdit = async (messageId: string, body: string) => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    setMutating(true);
    try {
      const res = await editStaffMessageAction({ messageId, body });
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to edit');
        return;
      }
      patchActiveMessages(conversationId, (prev) =>
        prev.map((m) => (m.id === res.message!.id ? res.message! : m))
      );
      await refreshConversations();
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    setMutating(true);
    try {
      const res = await deleteStaffMessageAction(messageId);
      if (!res.success || !res.message) {
        setError(res.error || 'Failed to delete');
        return;
      }
      patchActiveMessages(conversationId, (prev) =>
        prev.map((m) => (m.id === res.message!.id ? res.message! : m))
      );
      await refreshConversations();
    } finally {
      setMutating(false);
    }
  };

  const handleHideConversation = async () => {
    const conversationId = activeIdRef.current;
    if (!conversationId) return;
    setMutating(true);
    try {
      const res = await hideStaffConversationAction(conversationId);
      if (!res.success) {
        setError(res.error || 'Failed to delete conversation');
        return;
      }
      setConfirmHide(false);
      setHeaderMenuOpen(false);
      messagesByConvoRef.current.delete(conversationId);
      const remaining = (await listStaffConversationsAction()).conversations;
      setConversations(remaining);
      selectConversation(remaining[0]?.id ?? null);
    } finally {
      setMutating(false);
    }
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
          <div className="p-3 border-b border-outline-variant/30 bg-surface-container/20 shrink-0 space-y-2.5 animate-in fade-in duration-150">
            {canCreateGroup && (
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface-container/60">
                <button
                  type="button"
                  onClick={() => setNewTab('direct')}
                  className={cn(
                    'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors',
                    newTab === 'direct'
                      ? chipActiveClass
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  Direct
                </button>
                <button
                  type="button"
                  onClick={() => setNewTab('group')}
                  className={cn(
                    'flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors',
                    newTab === 'group'
                      ? chipActiveClass
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  Group
                </button>
              </div>
            )}

            {newTab === 'group' && canCreateGroup ? (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Group name
                  </label>
                  <input
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="e.g. Front desk"
                    className={cn(inputClass, 'py-2 rounded-xl text-xs')}
                    autoFocus
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/60" />
                  <input
                    value={coworkerQuery}
                    onChange={(e) => setCoworkerQuery(e.target.value)}
                    placeholder="Find staff to add…"
                    className={cn(inputClass, 'pl-9 py-2 rounded-xl text-xs')}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {filteredCoworkers.length === 0 ? (
                    <p className="text-xs text-on-surface-variant px-2 py-3 text-center">
                      No coworkers found.
                    </p>
                  ) : (
                    filteredCoworkers.map((c) => {
                      const selected = groupMemberIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleGroupMember(c.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 text-left px-2.5 py-2 rounded-xl transition-colors active:scale-[0.99]',
                            selected
                              ? 'bg-primary/10'
                              : 'hover:bg-surface-container/60'
                          )}
                        >
                          <span
                            className={cn(
                              'w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[9px]',
                              selected
                                ? 'bg-primary border-primary text-on-primary'
                                : 'border-outline-variant/50'
                            )}
                          >
                            {selected ? '✓' : ''}
                          </span>
                          <span className="w-8 h-8 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                            {initials(c.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-on-surface truncate">
                              {c.name}
                            </span>
                            <span className="block text-[10px] text-on-surface-variant capitalize truncate">
                              {formatRole(c.role)}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
                <button
                  type="button"
                  disabled={
                    creatingGroup ||
                    !groupTitle.trim() ||
                    groupMemberIds.length < 1
                  }
                  onClick={() => void createGroup()}
                  className={cn(btnPrimaryClass, 'w-full justify-center')}
                >
                  {creatingGroup ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    `Create group${
                      groupMemberIds.length
                        ? ` (${groupMemberIds.length + 1})`
                        : ''
                    }`
                  )}
                </button>
              </>
            ) : (
              <>
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
                        (x) => x.type !== 'group' && x.other_user_id === c.id
                      );
                      const loading = startingWith === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={!!startingWith || loading}
                          onClick={() => void startDm(c.id)}
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
              </>
            )}
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
              const isGroup = c.type === 'group';
              return (
                <li
                  key={c.id}
                  className="border-b border-outline-variant/15 last:border-0"
                >
                  <button
                    type="button"
                    onClick={() => selectConversation(c.id)}
                    onMouseEnter={() => prefetchConversation(c.id)}
                    onFocus={() => prefetchConversation(c.id)}
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
                            : isGroup
                              ? 'bg-sky-500/15 text-sky-300'
                              : 'bg-surface-container-high text-on-surface'
                        )}
                      >
                        {isGroup ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          initials(c.other_user_name)
                        )}
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
                          {isGroup
                            ? `${c.member_count} members · ${c.last_message || 'No messages yet'}`
                            : c.last_message || 'No messages yet'}
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
              <span
                className={cn(
                  'w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center shrink-0',
                  active.type === 'group'
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-primary/15 text-primary'
                )}
              >
                {active.type === 'group' ? (
                  <Users className="w-4.5 h-4.5" />
                ) : (
                  initials(active.other_user_name)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-on-surface truncate">
                  {active.other_user_name}
                </h2>
                <p className="text-[10px] text-on-surface-variant mt-0.5">
                  {active.type === 'group'
                    ? `Group · ${active.member_count} member${active.member_count === 1 ? '' : 's'}`
                    : 'Private · only the two of you can read this'}
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
                          Hide this chat for you only.
                          {active.type === 'group'
                            ? ' Other members keep the group.'
                            : ` ${active.other_user_name} keeps their copy.`}
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
                            disabled={mutating}
                            className={cn(
                              btnPrimaryClass,
                              'flex-1 justify-center text-[10px] !bg-destructive'
                            )}
                            onClick={() => void handleHideConversation()}
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
                Direct messages and group chats stay within your clinic team.
              </p>
            </div>
          ) : showSkeleton && messages.length === 0 ? (
            <ThreadSkeleton />
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
                      onEdit={(id, body) => void handleEdit(id, body)}
                      onDelete={(id) => void handleDeleteMessage(id)}
                      pending={mutating}
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
                disabled={sending || voiceUploading}
                uploading={voiceUploading}
                resetKey={`${activeId}-${voiceResetKey}`}
                onSend={(blob, duration, mime) =>
                  void sendVoice(blob, duration, mime)
                }
              />
              <textarea
                ref={composerRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  active.type === 'group'
                    ? `Message ${active.other_user_name}…`
                    : `Message ${active.other_user_name.split(' ')[0]}…`
                }
                rows={1}
                className={cn(
                  inputClass,
                  'flex-1 py-2.5 rounded-xl resize-none min-h-[44px] max-h-28'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <button
                type="button"
                disabled={sending || voiceUploading || !draft.trim()}
                onClick={() => void send()}
                className={cn(
                  btnPrimaryClass,
                  'h-11 w-11 shrink-0 !px-0 justify-center active:scale-[0.96]'
                )}
                aria-label="Send message"
              >
                {sending ? (
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
