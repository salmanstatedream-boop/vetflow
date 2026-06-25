import DashboardBadge from './DashboardBadge';
import { DASHBOARD_DENSITY } from '@/lib/ui/dashboard-tokens';
import { cn } from '@/lib/utils';

export type MiniTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

interface DashboardMiniTableProps<T> {
  columns: MiniTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  getRowKey: (row: T) => string;
  density?: 'default' | 'compact';
  maxRows?: number;
}

export default function DashboardMiniTable<T>({
  columns,
  rows,
  emptyMessage = 'No items',
  getRowKey,
  density = 'default',
  maxRows = 5,
}: DashboardMiniTableProps<T>) {
  const compact = density === 'compact';
  const visibleRows = rows.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <p className={cn('text-on-surface-variant italic text-center', compact ? 'text-[10px] py-4' : 'text-xs py-6')}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn('overflow-x-auto overflow-y-auto -mx-1', compact && DASHBOARD_DENSITY.listMaxH)}>
      <table className={cn('w-full text-left min-w-[200px]', compact ? 'text-[10px]' : 'text-xs')}>
        <thead>
          <tr className="text-[9px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/30">
            {columns.map((col) => (
              <th key={col.key} className={cn(compact ? 'py-1.5 px-1.5' : 'py-2 px-2', 'font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {visibleRows.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-surface-container/20">
              {columns.map((col) => (
                <td key={col.key} className={cn(compact ? 'py-1.5 px-1.5' : 'py-2.5 px-2', col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function stockStatusBadge(stock: number, reorder: number) {
  if (stock <= 0) return <DashboardBadge variant="danger">Critical</DashboardBadge>;
  if (stock <= reorder) return <DashboardBadge variant="warning">Low</DashboardBadge>;
  return <DashboardBadge variant="success">OK</DashboardBadge>;
}
