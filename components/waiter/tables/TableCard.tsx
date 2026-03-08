import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import type { TableModel } from "@/types/dashboard";

type TableCardProps = {
  table: TableModel;
  summary: string;
  statusLabel: string;
  statusClass: string;
  actionLabel?: string;
};

export default function TableCard({ table, summary, statusLabel, statusClass, actionLabel = "Manage" }: TableCardProps) {
  return (
    <Link
      href={`/waiter/tables/${table.tableNumber}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-400"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-lg font-semibold text-slate-900">Table {table.tableNumber}</p>
          <p className="text-sm text-slate-500">Section: {table.section}</p>
        </div>
        <StatusBadge className={statusClass} label={statusLabel} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{summary}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Guests: {table.currentGuests || 0}/{table.capacity}
        </span>
        <span className="font-semibold text-slate-900">{actionLabel} →</span>
      </div>
    </Link>
  );
}
