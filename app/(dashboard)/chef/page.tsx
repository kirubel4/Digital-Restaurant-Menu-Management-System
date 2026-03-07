"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDateTime, orderStatusColorMap, readableStatus, useDashboardStore } from "@/lib/dashboard-store";

export default function ChefLiveOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const liveOrders = useMemo(
    () =>
      orders
        .filter((order) => ["pending", "in_progress", "ready"].includes(order.status))
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [orders],
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Live Orders (FIFO)</h2>
        <p className="text-sm text-slate-500">Accept, process, and release dishes to service.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {liveOrders.map((order) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={order.id}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Table {order.tableNumber}</h3>
              <StatusBadge className={orderStatusColorMap[order.status]} label={readableStatus(order.status)} />
            </div>
            <p className="text-xs text-slate-500">Received: {formatDateTime(order.createdAt)}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {order.items.map((item, index) => (
                <li key={`${item.menuItemId}_${index}`}>{item.quantity}x {item.name}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-slate-600">Waiter note: {order.waiterNote || "none"}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded border border-slate-300 px-2 py-1 text-xs"
                onClick={() => updateOrderStatus(order.id, "pending")}
                type="button"
              >
                Accept
              </button>
              <button
                className="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700"
                onClick={() => updateOrderStatus(order.id, "in_progress")}
                type="button"
              >
                Mark In Progress
              </button>
              <button
                className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700"
                onClick={() => updateOrderStatus(order.id, "ready")}
                type="button"
              >
                Mark Ready
              </button>
              <button
                className="rounded border border-slate-400 px-2 py-1 text-xs"
                onClick={() => updateOrderStatus(order.id, "completed")}
                type="button"
              >
                Completed
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <textarea
                className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                onChange={(event) => setRejectReason((state) => ({ ...state, [order.id]: event.target.value }))}
                placeholder="Reject reason required"
                rows={2}
                value={rejectReason[order.id] || ""}
              />
              <button
                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700"
                disabled={!rejectReason[order.id]}
                onClick={() => updateOrderStatus(order.id, "rejected", rejectReason[order.id])}
                type="button"
              >
                Reject with note
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
