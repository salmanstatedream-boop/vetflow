'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MyAttendance } from '@/components/dashboard/AttendanceWidgetClient';

type AttendanceContextValue = {
  attendance: MyAttendance;
  setAttendance: (next: MyAttendance) => void;
  checkedIn: boolean;
};

const AttendanceContext = createContext<AttendanceContextValue | null>(null);

export function AttendanceProvider({
  initial,
  children,
}: {
  initial: MyAttendance;
  children: ReactNode;
}) {
  const [attendance, setAttendanceState] = useState<MyAttendance>(initial);

  useEffect(() => {
    setAttendanceState(initial);
  }, [
    initial.checkedIn,
    initial.checkedOut,
    initial.status,
    initial.checkInAt,
    initial.checkOutAt,
  ]);

  const setAttendance = useCallback((next: MyAttendance) => {
    setAttendanceState(next);
  }, []);

  const value = useMemo(
    () => ({
      attendance,
      setAttendance,
      checkedIn: attendance.checkedIn,
    }),
    [attendance, setAttendance]
  );

  return (
    <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
  );
}

export function useAttendance() {
  return useContext(AttendanceContext);
}
