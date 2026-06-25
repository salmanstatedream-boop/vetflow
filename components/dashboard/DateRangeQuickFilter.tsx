'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  parseDateYmd,
  resolveDashboardFilterDate,
  resolveDateFromParam,
  formatDateYmd,
  startOfToday,
  addDaysToDate,
  type DateFilterPreset,
} from '@/lib/utils/date-filters';
import { addDaysToYmd, getTodayYmdInTimezone } from '@/lib/utils/timezones';

interface DateRangeQuickFilterProps {
  paramKey?: string;
  className?: string;
  showWeek?: boolean;
  clinicTimezone?: string;
}

export default function DateRangeQuickFilter({
  paramKey = 'date',
  className = '',
  showWeek = true,
  clinicTimezone,
}: DateRangeQuickFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get(paramKey);

  const clinicToday = useMemo(() => {
    if (clinicTimezone) return getTodayYmdInTimezone(clinicTimezone);
    return formatDateYmd(startOfToday());
  }, [clinicTimezone]);

  const selectedDate = useMemo(() => {
    if (clinicTimezone) return resolveDashboardFilterDate(paramValue, clinicTimezone);
    return resolveDateFromParam(paramValue);
  }, [paramValue, clinicTimezone]);

  const tomorrowDate = useMemo(() => {
    if (clinicTimezone) return addDaysToYmd(clinicToday, 1);
    return formatDateYmd(addDaysToDate(startOfToday(), 1));
  }, [clinicTimezone, clinicToday]);

  const [customDate, setCustomDate] = useState(selectedDate);

  useEffect(() => {
    setCustomDate(selectedDate);
  }, [selectedDate]);

  const activePreset = useMemo((): DateFilterPreset => {
    if (selectedDate === clinicToday) return 'today';
    if (selectedDate === tomorrowDate) return 'tomorrow';
    return 'custom';
  }, [selectedDate, clinicToday, tomorrowDate]);

  const pushDate = useCallback(
    (date: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramKey, date);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, paramKey]
  );

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
      active
        ? 'bg-primary text-white border-primary'
        : 'border-outline-variant/50 text-on-surface-variant hover:border-primary/40'
    }`;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => pushDate(clinicToday)}
        className={pillClass(activePreset === 'today')}
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => pushDate(tomorrowDate)}
        className={pillClass(activePreset === 'tomorrow')}
      >
        Tomorrow
      </button>
      {showWeek && (
        <button
          type="button"
          onClick={() => pushDate(clinicToday)}
          className={pillClass(false)}
          title="Shows today; use list filters for full week"
        >
          This week
        </button>
      )}
      <input
        type="date"
        value={customDate}
        onChange={(e) => {
          setCustomDate(e.target.value);
          if (parseDateYmd(e.target.value)) pushDate(e.target.value);
        }}
        className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-surface-container/30 border border-outline-variant/50 text-on-surface outline-none focus:border-primary"
      />
    </div>
  );
}
