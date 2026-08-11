'use client';

import { useState, useTransition } from 'react';
import { Smartphone, Loader2, Check } from 'lucide-react';
import { inviteOwnerToPhoenixCareAction } from '@/lib/services/owner-invite-actions';
import { btnSmClass, chipClass } from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';

export default function InviteOwnerButton({
  customerId,
  disabled,
}: {
  customerId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onInvite = () => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await inviteOwnerToPhoenixCareAction({ customerId });
      if (!res.success) {
        setError(res.error || 'Failed to invite');
        return;
      }
      setMessage(res.message || 'Invite created');
      if (res.token) setToken(res.token);
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={onInvite}
        className={cn(btnSmClass, chipClass, 'inline-flex items-center gap-1.5')}
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : message ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Smartphone className="w-3.5 h-3.5" />
        )}
        Invite to Phoenix Care
      </button>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {message && (
        <p className="text-[11px] text-on-surface-variant">
          {message}
          {token ? (
            <>
              {' '}
              · code <span className="font-mono text-on-surface">{token.slice(0, 12)}…</span>
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
