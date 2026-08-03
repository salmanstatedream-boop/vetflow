'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import RequestAccessModal from '@/components/request-access/RequestAccessModal';

type RequestAccessContextValue = {
  open: () => void;
  close: () => void;
};

const RequestAccessContext = createContext<RequestAccessContextValue | null>(null);

export function useRequestAccess(): RequestAccessContextValue {
  const ctx = useContext(RequestAccessContext);
  if (!ctx) {
    throw new Error('useRequestAccess must be used within a RequestAccessProvider');
  }
  return ctx;
}

export default function RequestAccessProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const syncUrlParam = useCallback((present: boolean) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (present) {
      url.searchParams.set('request-access', '1');
    } else {
      url.searchParams.delete('request-access');
    }
    window.history.replaceState(window.history.state, '', url.toString());
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    syncUrlParam(true);
  }, [syncUrlParam]);

  const close = useCallback(() => {
    setIsOpen(false);
    syncUrlParam(false);
  }, [syncUrlParam]);

  // Auto-open when landing with ?request-access=1 (deep links / bookmarks).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('request-access') === '1') {
      setIsOpen(true);
    }
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <RequestAccessContext.Provider value={value}>
      {children}
      <RequestAccessModal open={isOpen} onClose={close} />
    </RequestAccessContext.Provider>
  );
}
