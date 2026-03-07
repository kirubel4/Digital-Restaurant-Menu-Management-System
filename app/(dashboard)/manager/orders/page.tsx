"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDateTime, orderStatusColorMap, readableStatus, useDashboardStore } from "@/lib/dashboard-store";
import type { OrderStatus } from "@/types/dashboard";
export default function ManagerOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          onChange={(event) => setFilter(event.target.value as OrderStatus | "all")}
          value={filter}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr className="border-t border-slate-100" key={order.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                <td className="px-4 py-3">#{order.tableNumber}</td>
                <td className="px-4 py-3">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</td>
                <td className="px-4 py-3">
                  <StatusBadge className={orderStatusColorMap[order.status]} label={readableStatus(order.status)} />
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDateTime(order.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
