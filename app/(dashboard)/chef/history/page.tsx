"use client";

import { useMemo, useState } from "react";
import { formatDateTime, useDashboardStore } from "@/lib/dashboard-store";

export default function ChefPreparationHistoryPage() {
  const orders = useDashboardStore((state) => state.orders);
  const [tableFilter, setTableFilter] = useState("all");

  const completedToday = useMemo(() => {
    const today = new Date();
    return orders
      .filter((order) => {
        if (order.status !== "completed") return false;
        const completedAt = new Date(order.updatedAt);
        return (
          completedAt.getFullYear() === today.getFullYear() &&
          completedAt.getMonth() === today.getMonth() &&
          completedAt.getDate() === today.getDate()
        );
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [orders]);

  const tableOptions = useMemo(
    () => ["all", ...Array.from(new Set(completedToday.map((order) => String(order.tableNumber))))],
    [completedToday],
  );

  const visibleOrders = useMemo(
    () =>
      completedToday.filter(
        (order) => tableFilter === "all" || String(order.tableNumber) === tableFilter,
      ),
    [completedToday, tableFilter],
  );

  const totalItems = visibleOrders.reduce(
    (sum, order) => sum + order.items.reduce((orderSum, item) => orderSum + item.quantity, 0),
    0,
  );

  const handleExport = () => {
    const rows = [
      ["Ticket", "Table", "Items", "Completion Time", "Total Items"],
      ...visibleOrders.map((order) => [
        `#${order.ticketNumber}`,
        `Table ${order.tableNumber}`,
        order.items.map((item) => `${item.quantity}x ${item.name}`).join(" | "),
        formatDateTime(order.updatedAt),
        String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
      ]),
    ];

    const csv = rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "completed-orders-today.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Today&apos;s Completed Orders</h2>
          <p className="text-sm text-slate-500">Only orders completed today are shown.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => window.print()}
            type="button"
          >
            Print Report
          </button>
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={handleExport}
            type="button"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Completed</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{visibleOrders.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Items</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{totalItems}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Table Filter</p>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
            onChange={(event) => setTableFilter(event.target.value)}
            value={tableFilter}
          >
            {tableOptions.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All tables" : `Table ${value}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Completion Time</th>
              <th className="px-4 py-3">Total Items</th>
            </tr>
          </thead>
          <tbody>
            {visibleOrders.map((order) => (
              <tr className="border-t border-slate-100" key={order.id}>
                <td className="px-4 py-3 font-bold text-slate-900">#{order.ticketNumber}</td>
                <td className="px-4 py-3">{order.tableNumber}</td>
                <td className="px-4 py-3">{order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</td>
                <td className="px-4 py-3">{formatDateTime(order.updatedAt)}</td>
                <td className="px-4 py-3 font-semibold">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          No completed orders found for today.
        </div>
      ) : null}
    </section>
  );
}
