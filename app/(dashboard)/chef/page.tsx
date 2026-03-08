"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  formatDateTime,
  humanTime,
  orderStatusColorMap,
  readableStatus,
  useDashboardStore,
} from "@/lib/dashboard-store";

export default function ChefLiveOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);
  const resetTicketCounter = useDashboardStore((state) => state.resetTicketCounter);
  const chefSettings = useDashboardStore((state) => state.chefSettings);

  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const liveOrders = useMemo(() => {
    return orders
      .filter((order) =>
        ["pending", "in_progress", "ready"].includes(order.status)
      )
      .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  }, [orders]);

  const handleResetTickets = () => {
    const confirmReset = confirm(
      "Reset ticket numbering? New orders will start from #1."
    );

    if (confirmReset) {
      resetTicketCounter();
    }
  };

  return (
    <section className={`space-y-6 ${chefSettings.largeTextMode ? "text-lg" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wide text-slate-900">Kitchen Display</h2>
          <p className="text-sm text-slate-500">
            Ticket numbers remain fixed for each order. New tickets continue sequentially.
          </p>
        </div>

        <button
          onClick={handleResetTickets}
          className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          Reset Ticket Counter
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnimatePresence>
          {liveOrders.map((order) => (
            <motion.section
              key={order.id}
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-lg ${
                now - new Date(order.createdAt).getTime() > chefSettings.cookingTimeWarningMins * 60 * 1000
                  ? "border-amber-500 ring-4 ring-amber-100"
                  : "border-slate-200"
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 230, damping: 15 }}
                className="absolute -left-1 -top-1 flex h-16 w-16 items-center justify-center rounded-br-2xl rounded-tl-2xl bg-slate-900 text-xl font-black text-white"
              >
                #{order.ticketNumber}
              </motion.div>

              <div className="mb-4 ml-16 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-black text-slate-900">Table {order.tableNumber}</h3>
                  <p className="text-sm text-slate-500">Received {humanTime(order.createdAt)}</p>
                </div>

                <StatusBadge
                  className={orderStatusColorMap[order.status]}
                  label={readableStatus(order.status)}
                />
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  Placed: {formatDateTime(order.createdAt)}
                </span>
                {chefSettings.showElapsedTimer ? (
                  <span
                    className={`rounded-full px-3 py-1 ${
                      now - new Date(order.createdAt).getTime() >
                      chefSettings.cookingTimeWarningMins * 60 * 1000
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Elapsed: {Math.floor((now - new Date(order.createdAt).getTime()) / 60000)}m
                  </span>
                ) : null}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-600">Order Items</p>
                <ul className="space-y-2 text-base text-slate-800">
                  {order.items.map((item, i) => (
                    <li
                      key={`${item.menuItemId}_${i}`}
                      className="flex items-center justify-between"
                    >
                      <span className="font-semibold">{item.name}</span>
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-sm font-bold text-white">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.waiterNote && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <strong>Note:</strong> {order.waiterNote}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-5">
                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-100"
                  onClick={() => updateOrderStatus(order.id, "in_progress")}
                >
                  Accept
                </button>

                <button
                  className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  onClick={() => updateOrderStatus(order.id, "in_progress")}
                >
                  In Progress
                </button>

                <button
                  className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  onClick={() => updateOrderStatus(order.id, "ready")}
                >
                  Ready
                </button>

                <button
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  onClick={() => updateOrderStatus(order.id, "completed")}
                >
                  Complete
                </button>

                <button
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                  disabled={!rejectReason[order.id]?.trim()}
                  onClick={() =>
                    updateOrderStatus(order.id, "rejected", rejectReason[order.id] || undefined)
                  }
                >
                  Reject
                </button>
              </div>

              <div className="mt-3">
                <input
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
                  placeholder="Optional reject reason..."
                  value={rejectReason[order.id] || ""}
                  onChange={(e) =>
                    setRejectReason((s) => ({
                      ...s,
                      [order.id]: e.target.value,
                    }))
                  }
                />
                {!rejectReason[order.id]?.trim() ? (
                  <p className="mt-1 text-xs font-semibold text-rose-600">
                    Reject reason is required before rejecting this order.
                  </p>
                ) : null}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {liveOrders.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center text-slate-500">
          No active orders. Kitchen is clear.
        </div>
      )}
    </section>
  );
}
