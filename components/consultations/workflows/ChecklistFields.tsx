'use client';

import { fieldClass, labelClass } from '@/components/consultations/workflows/WorkflowSectionCard';

type ChecklistItem = {
  key: string;
  label: string;
  type?: 'boolean' | 'text' | 'textarea' | 'number';
};

type ChecklistFieldsProps = {
  items: ChecklistItem[];
  values: Record<string, boolean | string | number | string[] | null | undefined>;
  onChange: (key: string, value: boolean | string | number | string[] | null) => void;
};

export default function ChecklistFields({ items, values, onChange }: ChecklistFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => {
        const val = values[item.key];
        if (item.type === 'boolean' || item.type === undefined) {
          return (
            <label
              key={item.key}
              className="flex items-center gap-2 text-xs text-on-surface cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Boolean(val)}
                onChange={(e) => onChange(item.key, e.target.checked)}
                className="rounded border-outline-variant"
              />
              {item.label}
            </label>
          );
        }
        if (item.type === 'textarea') {
          return (
            <div key={item.key} className="sm:col-span-2">
              <label className={labelClass}>{item.label}</label>
              <textarea
                value={String(val ?? '')}
                onChange={(e) => onChange(item.key, e.target.value)}
                className="w-full min-h-[4rem] px-2.5 py-2 bg-surface-container/40 border border-outline-variant/60 rounded-lg text-xs text-on-surface outline-none focus:border-primary/50 resize-y"
              />
            </div>
          );
        }
        return (
          <div key={item.key}>
            <label className={labelClass}>{item.label}</label>
            <input
              type={item.type === 'number' ? 'number' : 'text'}
              value={val == null ? '' : String(val)}
              onChange={(e) =>
                onChange(
                  item.key,
                  item.type === 'number'
                    ? e.target.value === ''
                      ? null
                      : Number(e.target.value)
                    : e.target.value
                )
              }
              className={fieldClass}
            />
          </div>
        );
      })}
    </div>
  );
}
