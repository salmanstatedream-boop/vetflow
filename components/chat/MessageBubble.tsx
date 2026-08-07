'use client';

import { useEffect, useRef, useState } from 'react';
import type { StaffMessageRow } from '@/lib/services/staff-chat-actions';
import { getStaffVoiceSignedUrlAction } from '@/lib/services/staff-chat-actions';
import { cn } from '@/lib/utils';
import {
  Check,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
  X,
} from 'lucide-react';

function messageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(sec: number | null) {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

type Props = {
  message: StaffMessageRow;
  mine: boolean;
  stacked: boolean;
  currentUserId: string;
  onEdit: (messageId: string, body: string) => void;
  onDelete: (messageId: string) => void;
  pending?: boolean;
  showSenderName?: boolean;
};

export default function MessageBubble({
  message,
  mine,
  stacked,
  onEdit,
  onDelete,
  pending,
  showSenderName = false,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(message.audio_url || null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(message.body);
    setAudioUrl(message.audio_url || null);
    setEditing(false);
  }, [message.id, message.body, message.audio_url, message.edited_at, message.deleted_at]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const ensureAudioUrl = async () => {
    if (audioUrl) return audioUrl;
    const res = await getStaffVoiceSignedUrlAction(message.id);
    if (res.success && res.url) {
      setAudioUrl(res.url);
      return res.url;
    }
    return null;
  };

  const togglePlay = async () => {
    const url = await ensureAudioUrl();
    if (!url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
    } else if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [message.id]);

  if (message.deleted_at) {
    return (
      <div className={cn('flex', mine ? 'justify-end' : 'justify-start', stacked ? 'mt-0.5' : 'mt-2.5')}>
        <div className="max-w-[78%] sm:max-w-[70%]">
          {showSenderName && message.sender_name ? (
            <p className="text-[11px] font-semibold text-primary mb-1 px-1">
              {message.sender_name}
            </p>
          ) : null}
          <div
            className={cn(
              'px-3.5 py-2 text-sm italic rounded-2xl border border-dashed',
              mine
                ? 'border-primary/25 text-on-primary/70 bg-primary/40 rounded-br-md'
                : 'border-outline-variant/40 text-on-surface-variant bg-surface-container/40 rounded-bl-md'
            )}
          >
            This message was deleted
            <p className={cn('text-[9px] mt-1 tabular-nums not-italic text-right', mine ? 'text-on-primary/55' : 'text-on-surface-variant/70')}>
              {messageTime(message.created_at)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex',
        mine ? 'justify-end' : 'justify-start',
        stacked ? 'mt-0.5' : 'mt-2.5'
      )}
    >
      <div className={cn('relative max-w-[78%] sm:max-w-[70%]', mine && 'flex flex-col items-end')}>
        {showSenderName && message.sender_name ? (
          <p className="text-[11px] font-semibold text-primary mb-1 px-1 self-start">
            {message.sender_name}
          </p>
        ) : null}
        {mine && !editing && (
          <div ref={menuRef} className="absolute -top-2 right-0 z-10">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                'h-7 w-7 rounded-full bg-surface-container border border-outline-variant/40 flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
                menuOpen && 'opacity-100'
              )}
              aria-label="Message actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-36 rounded-xl border border-outline-variant/40 bg-surface-container-high shadow-lg py-1 overflow-hidden">
                {message.message_type === 'text' && (
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-on-surface hover:bg-surface-container"
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(message.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'px-3.5 py-2 text-sm whitespace-pre-wrap leading-relaxed shadow-sm',
            mine
              ? 'bg-primary text-on-primary rounded-2xl rounded-br-md'
              : 'bg-surface-container text-on-surface rounded-2xl rounded-bl-md border border-outline-variant/25'
          )}
        >
          {editing ? (
            <div className="space-y-2 min-w-[180px]">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-black/15 border border-white/20 px-2 py-1.5 text-sm text-on-primary outline-none resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  className="h-7 w-7 rounded-lg bg-black/20 flex items-center justify-center"
                  onClick={() => {
                    setDraft(message.body);
                    setEditing(false);
                  }}
                  aria-label="Cancel edit"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={pending || !draft.trim() || draft.trim() === message.body}
                  className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center disabled:opacity-40"
                  onClick={() => {
                    onEdit(message.id, draft.trim());
                    setEditing(false);
                  }}
                  aria-label="Save edit"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : message.message_type === 'voice' ? (
            <div className="flex items-center gap-2.5 min-w-[160px]">
              <button
                type="button"
                onClick={() => void togglePlay()}
                className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                  mine ? 'bg-black/20' : 'bg-primary/15 text-primary'
                )}
                aria-label={playing ? 'Pause voice note' : 'Play voice note'}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    'h-1.5 rounded-full overflow-hidden',
                    mine ? 'bg-black/25' : 'bg-outline-variant/40'
                  )}
                >
                  <div
                    className={cn(
                      'h-full w-2/3 rounded-full',
                      mine ? 'bg-white/70' : 'bg-primary/70'
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-[10px] mt-1 tabular-nums',
                    mine ? 'text-on-primary/70' : 'text-on-surface-variant'
                  )}
                >
                  {formatDuration(message.audio_duration_sec)}
                </p>
              </div>
            </div>
          ) : (
            message.body
          )}

          {!editing && (
            <p
              className={cn(
                'text-[9px] mt-1 tabular-nums text-right',
                mine ? 'text-on-primary/65' : 'text-on-surface-variant/80'
              )}
            >
              {messageTime(message.created_at)}
              {message.edited_at ? ' · edited' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
