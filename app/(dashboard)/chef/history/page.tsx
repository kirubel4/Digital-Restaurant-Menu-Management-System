"use client";

import { formatDateTime, useDashboardStore } from "@/lib/dashboard-store";

export default function ChefPreparationHistoryPage() {
  const completedOrders = useDashboardStore((state) =>
    state.orders
      .filter((order) => order.status === "completed")
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
  );

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Preparation History</h2>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Completion Time</th>
            </tr>
          </thead>
          <tbody>
            {completedOrders.map((order) => (
              <tr className="border-t border-slate-100" key={order.id}>
                <td className="px-4 py-3">{order.tableNumber}</td>
                <td className="px-4 py-3">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</td>
                <td className="px-4 py-3">{formatDateTime(order.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
