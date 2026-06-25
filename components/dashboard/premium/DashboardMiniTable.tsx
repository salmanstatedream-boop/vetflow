import DashboardBadge from './DashboardBadge';
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
}

export default function DashboardMiniTable<T>({
  columns,
  rows,
  emptyMessage = 'No items',
  getRowKey,
}: DashboardMiniTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-on-surface-variant italic text-center py-6">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-left text-xs min-w-[280px]">
        <thead>
          <tr className="text-[9px] uppercase font-bold text-on-surface-variant border-b border-outline-variant/30">
            {columns.map((col) => (
              <th key={col.key} className={cn('py-2 px-2 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/20">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-surface-container/20">
              {columns.map((col) => (
                <td key={col.key} className={cn('py-2.5 px-2', col.className)}>
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
