"use client";

import { useMemo } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { readableStatus, tableStatusColorMap, useDashboardStore } from "@/lib/dashboard-store";

export default function WaiterTablesPage() {
  const tables = useDashboardStore((state) => state.tables);
  const orders = useDashboardStore((state) => state.orders);
  const allNotifications = useDashboardStore((state) => state.notifications);
  const markRead = useDashboardStore((state) => state.markNotificationsRead);
  const notifications = useMemo(
    () => allNotifications.filter((item) => item.targetRole === "waiter"),
    [allNotifications],
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tables</h2>
          <p className="text-sm text-slate-500">Select a table to manage orders and chef notes.</p>
        </div>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs" onClick={() => markRead("waiter")} type="button">
          Mark alerts read
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {notifications.slice(0, 3).map((item) => (
            <p key={item.id}>- {item.message}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tables.map((table) => {
          const latestOrder = orders
            .filter((order) => order.tableNumber === table.tableNumber)
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

          return (
            <Link
              className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-400"
              href={`/waiter/table/${table.tableNumber}`}
              key={table.id}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-lg font-bold text-slate-900">Table {table.tableNumber}</p>
                <StatusBadge className={tableStatusColorMap[table.status]} label={readableStatus(table.status)} />
              </div>
              <p className="text-sm text-slate-600">
                {latestOrder
                  ? `${latestOrder.items.length} items | ${readableStatus(latestOrder.status)}`
                  : "No active order"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
