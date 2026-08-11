'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  QrCode,
  Loader2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import Modal from '@/components/ui/premium/Modal';
import {
  emailOwnerCredentialsAction,
  issueOwnerCredentialsAction,
} from '@/lib/services/owner-credentials-actions';
import { btnSmClass, inputClass } from '@/lib/ui/dashboard-classes';
import { cn } from '@/lib/utils';

function suggestOwnerPassword() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '').slice(0, 16);
}

type Creds = {
  email: string;
  password: string;
  deepLink: string;
  message: string;
  deliveryEmail: string | null;
};

export default function OwnerLoginQrButton({
  customerId,
  customerName,
  email,
}: {
  customerId: string;
  customerName: string;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState(email?.trim() || '');
  const [password, setPassword] = useState('');
  const [creds, setCreds] = useState<Creds | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const hasDeliveryEmail = Boolean(email?.trim() && email.includes('@'));

  const openModal = () => {
    setOpen(true);
    setCreds(null);
    setQrDataUrl(null);
    setError(null);
    setEmailMessage(null);
    setLoginEmail(email?.trim() || '');
    setPassword('');
  };

  const issue = () => {
    setError(null);
    setEmailMessage(null);
    startTransition(async () => {
      const res = await issueOwnerCredentialsAction({
        customerId,
        loginEmail,
        password,
      });
      if (!res.success) {
        setError(res.error || 'Failed to issue credentials');
        setCreds(null);
        setQrDataUrl(null);
        return;
      }
      setLoginEmail(res.email);
      setPassword(res.password);
      setCreds({
        email: res.email,
        password: res.password,
        deepLink: res.deepLink,
        message: res.message,
        deliveryEmail: res.deliveryEmail,
      });
    });
  };

  useEffect(() => {
    if (!creds?.deepLink) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(creds.deepLink, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [creds?.deepLink]);

  const copy = async (value: string, kind: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl || !creds) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `phoenix-care-login-${creds.email.replace(/[^a-z0-9@._-]/gi, '_')}.png`;
    a.click();
  };

  const sendEmail = () => {
    if (!creds) return;
    setError(null);
    setEmailMessage(null);
    startEmailTransition(async () => {
      const res = await emailOwnerCredentialsAction({
        customerId,
        loginEmail: creds.email,
        password: creds.password,
      });
      if (!res.success) {
        setError(res.error || 'Failed to email credentials');
        return;
      }
      setEmailMessage(res.message);
    });
  };

  return (
    <>
      <button
        type="button"
        title="Create Phoenix Care login QR"
        onClick={openModal}
        className={cn(
          btnSmClass,
          'inline-flex items-center gap-1 text-[10px] font-bold border border-primary/20 px-2 py-1 rounded-lg text-primary hover:underline'
        )}
      >
        <QrCode className="w-3 h-3" />
        QR Login
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Phoenix Care login QR"
        description={`Set a login ID and password for ${customerName}, then download or email the QR.`}
        size="md"
      >
        <div className="space-y-4">
          {!creds ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                  Login ID (email)
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="owner@email.com"
                  className={cn(inputClass, 'mt-1')}
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(suggestOwnerPassword())}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    Suggest
                  </button>
                </div>
                <input
                  type="text"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={cn(inputClass, 'mt-1 font-mono')}
                />
              </div>
              {!hasDeliveryEmail ? (
                <p className="text-[11px] text-amber-400">
                  Add a profile email on this customer to enable “Send email”. Download still works.
                </p>
              ) : null}
              <button
                type="button"
                onClick={issue}
                disabled={pending || !loginEmail.includes('@') || password.length < 8}
                className={cn(
                  btnSmClass,
                  'inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl disabled:opacity-50'
                )}
              >
                {pending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <QrCode className="w-3.5 h-3.5" />
                )}
                Create / update credentials
              </button>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-on-surface-variant">{creds.message}</p>

              <div className="flex justify-center">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Phoenix Care login QR code"
                    className="rounded-xl border border-outline-variant/40 bg-white p-2 w-[200px] h-[200px]"
                  />
                ) : (
                  <div className="w-[200px] h-[200px] rounded-xl bg-surface-container animate-pulse" />
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/40 bg-surface-container/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Login ID
                    </p>
                    <p className="font-mono text-on-surface truncate">{creds.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copy(creds.email, 'email')}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container"
                    aria-label="Copy email"
                  >
                    {copied === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-outline-variant/40 bg-surface-container/40 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
                      Password
                    </p>
                    <p className="font-mono text-on-surface truncate">{creds.password}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copy(creds.password, 'password')}
                    className="shrink-0 p-1.5 rounded-lg hover:bg-surface-container"
                    aria-label="Copy password"
                  >
                    {copied === 'password' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={downloadQr}
                  disabled={!qrDataUrl}
                  className={cn(
                    btnSmClass,
                    'inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-xl disabled:opacity-50'
                  )}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download QR
                </button>
                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={emailPending || !creds.deliveryEmail}
                  title={
                    creds.deliveryEmail
                      ? `Email to ${creds.deliveryEmail}`
                      : 'Customer needs a profile email'
                  }
                  className={cn(
                    btnSmClass,
                    'inline-flex items-center gap-1.5 border border-primary/30 text-primary px-3 py-2 rounded-xl disabled:opacity-50'
                  )}
                >
                  {emailPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                  Send email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreds(null);
                    setQrDataUrl(null);
                    setEmailMessage(null);
                    setError(null);
                  }}
                  disabled={pending}
                  className={cn(
                    btnSmClass,
                    'inline-flex items-center gap-1.5 border border-outline-variant px-3 py-2 rounded-xl'
                  )}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Edit again
                </button>
              </div>
              {emailMessage ? (
                <p className="text-[11px] text-emerald-400">{emailMessage}</p>
              ) : null}
            </>
          )}

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </Modal>
    </>
  );
}
