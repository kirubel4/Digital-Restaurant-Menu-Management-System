"use client";

import TableCard from "@/components/waiter/tables/TableCard";
import { humanTime, useDashboardStore } from "@/lib/dashboard-store";

type WaiterTableState = "available" | "active" | "waiting" | "completed";

const tableStateMeta: Record<WaiterTableState, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-emerald-100 text-emerald-700" },
  active: { label: "Has active order", className: "bg-blue-100 text-blue-700" },
  waiting: { label: "Waiting for payment", className: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", className: "bg-slate-100 text-slate-700" },
};

const deriveTableState = ({
  latestOrder,
  tableStatus,
  hasPendingPayment,
}: {
  latestOrder?: { status: string; updatedAt: string };
  tableStatus: string;
  hasPendingPayment: boolean;
}): WaiterTableState => {
  if (!latestOrder) {
    return "available";
  }

  if (hasPendingPayment) {
    return "waiting";
  }

  if (["completed"].includes(latestOrder.status) || tableStatus === "finished") {
    return "completed";
  }

  return "active";
};

export default function WaiterTablesPage() {
  const tables = useDashboardStore((state) => state.tables);
  const orders = useDashboardStore((state) => state.orders);
  const payments = useDashboardStore((state) => state.payments);

  const tableSummaries = tables.map((table) => {
    const tableOrders = orders
      .filter((order) => order.tableNumber === table.tableNumber)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    const latestOrder = tableOrders[0];
    const hasPendingPayment = latestOrder
      ? payments.some((payment) => payment.orderId === latestOrder.id && !payment.finalized)
      : false;

    const state = deriveTableState({
      latestOrder,
      tableStatus: table.status,
      hasPendingPayment,
    });

    const reservedText = table.reservedFor ? `Reserved for ${table.reservedFor}` : "Reserved";
    const baseSummary = latestOrder
      ? `${latestOrder.items.length} items · ${latestOrder.status.replace(/_/g, " ")}`
      : table.reserved
      ? reservedText
      : "Ready to seat";
    const extraSummary =
      hasPendingPayment && latestOrder ? `Payment requested · ${humanTime(latestOrder.updatedAt)}` : "";

    return {
      table,
      summary: extraSummary ? `${baseSummary} · ${extraSummary}` : baseSummary,
      ...tableStateMeta[state],
    };
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waiter</p>
            <h1 className="text-3xl font-bold text-slate-900">Table management</h1>
            <p className="text-sm text-slate-500">Clear status overview so you can jump into service.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tableSummaries.map(({ table, summary, label, className }) => (
          <TableCard
            key={table.id}
            table={table}
            summary={summary}
            statusLabel={label}
            statusClass={className}
          />
        ))}
      </div>
    </section>
  );
}
