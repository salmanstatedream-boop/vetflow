'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { aiAssistantChatAction } from '@/lib/services/ai-assistant-actions';
import Button from '@/components/ui/premium/Button';
import { Bot, Send, Sparkles } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'How do I check in a walk-in patient?',
  'Draft a post-visit care note for ear infection treatment.',
  'What should reception do when a patient is ready for checkout?',
  'Summarize today\'s front-desk priorities.',
];

const WIDGET_TEXTAREA_MAX_HEIGHT = 120;

interface AiAssistantClientProps {
  variant?: 'page' | 'widget';
}

export default function AiAssistantClient({ variant = 'page' }: AiAssistantClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, WIDGET_TEXTAREA_MAX_HEIGHT);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > WIDGET_TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (variant === 'widget') resizeTextarea();
  }, [input, variant, resizeTextarea]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: Message = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    const res = await aiAssistantChatAction({ messages: next });
    setLoading(false);

    if (res.success && res.reply) {
      setMessages([...next, { role: 'assistant', content: res.reply }]);
    } else {
      setError(res.error || 'Something went wrong.');
    }
  };

  const isWidget = variant === 'widget';

  return (
    <div
      className={
        isWidget
          ? 'flex flex-col h-full min-h-[320px] rounded-xl border border-outline-variant/30 overflow-hidden bg-surface-container/50'
          : 'glass-panel rounded-2xl border border-outline-variant/40 overflow-hidden flex flex-col min-h-[520px]'
      }
    >
      <div
        className={
          isWidget
            ? 'flex-1 min-h-0 overflow-y-auto p-3 space-y-3'
            : 'flex-1 overflow-y-auto p-5 md:p-6 space-y-4 max-h-[60vh]'
        }
      >
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-bold text-on-surface">ClinixDev AI Assistant</p>
            <p className="text-xs text-on-surface-variant mt-2 max-w-sm mx-auto">
              Ask about workflows, draft owner communications, or get help navigating clinic operations.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-[10px] font-semibold px-3 py-2 rounded-full border border-outline-variant/60 hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high border border-outline-variant/40 text-on-surface'
              }`}
            >
              {m.role === 'assistant' && (
                <Sparkles className="w-3.5 h-3.5 text-primary mb-1.5" />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl px-4 py-3 text-xs text-on-surface-variant animate-pulse">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-5 mb-2 p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-xl">
          {error}
        </div>
      )}

      <form
        className={
          isWidget
            ? 'p-2 border-t border-outline-variant/40 flex gap-2 items-end'
            : 'p-4 border-t border-outline-variant/40 flex gap-2'
        }
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        {isWidget ? (
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={resizeTextarea}
            placeholder="Ask ClinixDev AI…"
            className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface resize-none min-h-[44px]"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
        ) : (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask ClinixDev AI…"
            className="flex-1 px-4 py-3 bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl outline-none text-sm text-on-surface"
            disabled={loading}
          />
        )}
        <Button type="submit" loading={loading} icon={<Send className="w-4 h-4" />} disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
