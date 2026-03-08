"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDateTime, currency, useDashboardStore } from "@/lib/dashboard-store";

type FilterOption = "all" | "pending" | "paid";

const paymentStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  none: "bg-slate-100 text-slate-600",
};

const filterLabels: Record<FilterOption, string> = {
  all: "All",
  pending: "Pending",
  paid: "Paid",
};

export default function WaiterPaymentsPage() {
  const payments = useDashboardStore((state) => state.payments);
  const orders = useDashboardStore((state) => state.orders);
  const [filter, setFilter] = useState<FilterOption>("all");

  const data = useMemo(
    () =>
      payments.map((payment) => {
        const order = orders.find((item) => item.id === payment.orderId);
        const statusKey = payment.finalized ? "paid" : "pending";

        return {
          ...payment,
          tableNumber: order?.tableNumber ?? "—",
          requestedAt: payment.requestedAt ?? order?.createdAt,
          statusKey,
        };
      }),
    [orders, payments],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((entry) => entry.statusKey === filter);
  }, [data, filter]);

  const summary = useMemo(
    () => ({
      pending: data.filter((entry) => entry.statusKey === "pending").length,
      paid: data.filter((entry) => entry.statusKey === "paid").length,
      total: filtered.reduce((sum, entry) => sum + entry.total, 0),
    }),
    [data, filtered],
  );

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</p>
        <h1 className="text-3xl font-bold text-slate-900">Payment transactions</h1>
        <p className="text-sm text-slate-500">Everything you’ve requested today, all in one place.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-slate-900">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid</p>
          <p className="text-2xl font-bold text-slate-900">{summary.paid}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visible total</p>
          <p className="text-2xl font-bold text-slate-900">{currency(summary.total)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span>Filter</span>
          {(["all", "pending", "paid"] as FilterOption[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                filter === option
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {filterLabels[option]}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {data.length} requests
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Requested at</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{entry.tableNumber}</td>
                <td className="px-4 py-3 text-slate-600">{currency(entry.subtotal)}</td>
                <td className="px-4 py-3 text-slate-600">{currency(entry.tip)}</td>
                <td className="px-4 py-3 text-slate-600">{currency(entry.total)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {entry.requestedAt ? formatDateTime(entry.requestedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={entry.statusKey}
                    className={paymentStatusStyles[entry.statusKey]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                  No payment requests match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
