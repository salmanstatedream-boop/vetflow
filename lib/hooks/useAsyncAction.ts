'use client';

import { useCallback, useRef, useState } from 'react';

export function useAsyncAction<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const run = useCallback(
    async (...args: T): Promise<R | undefined> => {
      if (inFlight.current) return undefined;
      inFlight.current = true;
      setLoading(true);
      try {
        return await fn(...args);
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [fn]
  );

  return { loading, run };
}
