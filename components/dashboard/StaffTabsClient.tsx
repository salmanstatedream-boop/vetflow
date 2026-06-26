'use client';

import { useState } from 'react';
import { Users, CalendarClock } from 'lucide-react';

export default function StaffTabsClient({
  team,
  schedule,
}: {
  team: React.ReactNode;
  schedule: React.ReactNode;
}) {
  const [tab, setTab] = useState<'team' | 'schedule'>('team');

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
      active
        ? 'bg-primary/15 text-primary shadow-sm'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'
    }`;

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-1 inline-flex gap-1">
        <button type="button" className={tabClass(tab === 'team')} onClick={() => setTab('team')}>
          <Users className="w-4 h-4" />
          Team
        </button>
        <button
          type="button"
          className={tabClass(tab === 'schedule')}
          onClick={() => setTab('schedule')}
        >
          <CalendarClock className="w-4 h-4" />
          Schedule & attendance
        </button>
      </div>
      <div className={tab === 'team' ? 'block' : 'hidden'}>{team}</div>
      <div className={tab === 'schedule' ? 'block' : 'hidden'}>{schedule}</div>
    </div>
  );
}
