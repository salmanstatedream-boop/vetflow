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
  deviceTimezone?: string;
}

export default function DateRangeQuickFilter({
  paramKey = 'date',
  className = '',
  showWeek = true,
  deviceTimezone,
}: DateRangeQuickFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramValue = searchParams.get(paramKey);

  const deviceToday = useMemo(() => {
    if (deviceTimezone) return getTodayYmdInTimezone(deviceTimezone);
    return formatDateYmd(startOfToday());
  }, [deviceTimezone]);

  const selectedDate = useMemo(() => {
    if (deviceTimezone) return resolveDashboardFilterDate(paramValue, deviceTimezone);
    return resolveDateFromParam(paramValue);
  }, [paramValue, deviceTimezone]);

  const tomorrowDate = useMemo(() => {
    if (deviceTimezone) return addDaysToYmd(deviceToday, 1);
    return formatDateYmd(addDaysToDate(startOfToday(), 1));
  }, [deviceTimezone, deviceToday]);

  const [customDate, setCustomDate] = useState(selectedDate);

  useEffect(() => {
    setCustomDate(selectedDate);
  }, [selectedDate]);

  const activePreset = useMemo((): DateFilterPreset => {
    if (selectedDate === deviceToday) return 'today';
    if (selectedDate === tomorrowDate) return 'tomorrow';
    return 'custom';
  }, [selectedDate, deviceToday, tomorrowDate]);

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
        onClick={() => pushDate(deviceToday)}
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
          onClick={() => pushDate(deviceToday)}
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
