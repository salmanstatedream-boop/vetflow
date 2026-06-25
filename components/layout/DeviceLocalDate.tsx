'use client';

import { useEffect, useState } from 'react';

export default function DeviceLocalDate({ className }: { className?: string }) {
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    setDisplayDate(
      new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {displayDate || '\u00a0'}
    </span>
  );
}
