'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAttendance } from '@/lib/context/AttendanceContext';

interface StaffAttendanceGateProps {
  locked: boolean;
  children: React.ReactNode;
}

/** Redirects staff to /dashboard when attendance check-in is required but missing. */
export default function StaffAttendanceGate({ locked, children }: StaffAttendanceGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const attendance = useAttendance();
  const isLocked = locked && !(attendance?.checkedIn ?? false);

  useEffect(() => {
    if (isLocked && pathname !== '/dashboard') {
      router.replace('/dashboard');
    }
  }, [isLocked, pathname, router]);

  if (isLocked && pathname !== '/dashboard') {
    return null;
  }

  return <>{children}</>;
}
