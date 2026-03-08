"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  formatDateTime,
  orderStatusColorMap,
  useDashboardStore,
} from "@/lib/dashboard-store";

type StatusFilter = "all" | "ongoing" | "completed";

const durationOptions = [
  { label: "Last 2 hours", value: 2 },
  { label: "Last 4 hours", value: 4 },
  { label: "Last 8 hours", value: 8 },
  { label: "All day", value: 0 },
];

const paymentStatusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  none: "bg-slate-100 text-slate-600",
};

export default function WaiterOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const payments = useDashboardStore((state) => state.payments);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const requestPayment = useDashboardStore((state) => state.requestPayment);

  const [durationFilter, setDurationFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const waiterOrders = useMemo(
    () => orders.filter((order) => order.waiterId === currentUserId),
    [orders, currentUserId],
  );

  const paymentsByOrder = useMemo(() => {
    return payments.reduce<Map<string, typeof payments[number][]>>((acc, payment) => {
      const entries = acc.get(payment.orderId) ?? [];
      return acc.set(payment.orderId, [...entries, payment]);
    }, new Map());
  }, [payments]);

  const toTimestamp = (value?: string) => (value ? new Date(value).getTime() : 0);

  const orderPaymentInfo = (orderId: string) => {
    const entries = paymentsByOrder.get(orderId) ?? [];
    if (entries.length === 0) return { label: "No request", key: "none" };
    const latest = entries.sort((a, b) => toTimestamp(b.requestedAt) - toTimestamp(a.requestedAt))[0];
    return latest.finalized
      ? { label: "Paid", key: "paid" }
      : { label: "Pending", key: "pending" };
  };

  const filteredOrders = useMemo(() => {
    const now = Date.now();
    return waiterOrders.filter((order) => {
      if (durationFilter > 0) {
        const cutoff = now - durationFilter * 60 * 60 * 1000;
        if (new Date(order.createdAt).getTime() < cutoff) {
          return false;
        }
      }

      if (statusFilter === "ongoing" && order.status === "completed") {
        return false;
      }

      if (statusFilter === "completed" && order.status !== "completed") {
        return false;
      }

      return true;
    });
  }, [durationFilter, statusFilter, waiterOrders]);

  const sortedOrders = useMemo(
    () =>
      [...filteredOrders].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [filteredOrders],
  );

  const summarizeItems = (orderItems: typeof orders[number]["items"]) => {
    const previews = orderItems.slice(0, 3).map((item) => `${item.quantity}× ${item.name}`);
    const extra = orderItems.length > 3 ? ` +${orderItems.length - 3} more` : "";
    return `${previews.join(", ")}${extra}`;
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Waiter</p>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="text-sm text-slate-500">Track every table order and keep payment flow smooth.</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Filtered orders: {sortedOrders.length}</p>
            <p>
              Active payment requests:{" "}
              {payments.filter((payment) => !payment.finalized && sortedOrders.some((order) => order.id === payment.orderId))
                .length}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {durationOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setDurationFilter(option.value)}
              className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                durationFilter === option.value
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>Status</span>
            {(["all", "ongoing", "completed"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Order items</th>
              <th className="px-4 py-3">Order time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedOrders.map((order) => {
              const paymentInfo = orderPaymentInfo(order.id);
              const orderTotal = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
              return (
                <tr key={order.id} className="even:bg-slate-50/40">
                  <td className="px-4 py-3 font-semibold text-slate-900">{order.tableNumber}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.items.length === 0 ? "No items" : summarizeItems(order.items)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(order.createdAt)}
                    <div className="text-xs text-slate-400">Est. total {`$${orderTotal.toFixed(2)}`}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={order.status}
                      className={orderStatusColorMap[order.status]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={paymentInfo.label}
                      className={paymentStatusClass[paymentInfo.key]}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/waiter/orders/${order.id}`}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        View order
                      </Link>
                      <Link
                        href={`/waiter/tables/${order.tableNumber}`}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        Add items
                      </Link>
                      <button
                        type="button"
                        onClick={() => requestPayment(order.id)}
                        disabled={paymentInfo.key === "pending" || order.status === "pending"}
                        className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {paymentInfo.key === "pending" ? "Payment requested" : "Request payment"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                  No orders match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
