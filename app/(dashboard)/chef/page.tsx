"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatDateTime, humanTime, useDashboardStore } from "@/lib/dashboard-store";

export default function ChefLiveOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const menu = useDashboardStore((state) => state.menu);
  const updateOrderStatus = useDashboardStore((state) => state.updateOrderStatus);
  const chefSettings = useDashboardStore((state) => state.chefSettings);

  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const menuImageById = useMemo(
    () =>
      menu.reduce<Record<string, string | undefined>>((acc, item) => {
        acc[item.id] = item.image;
        return acc;
      }, {}),
    [menu],
  );

  const liveOrders = useMemo(
    () =>
      orders
        .filter((order) => ["pending", "in_progress", "ready"].includes(order.status))
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [orders],
  );

  const waitingOrders = useMemo(
    () => liveOrders.filter((order) => order.status === "pending"),
    [liveOrders],
  );

  const cookingOrders = useMemo(
    () => liveOrders.filter((order) => ["in_progress", "ready"].includes(order.status)),
    [liveOrders],
  );

  return (
    <section className={`mx-auto w-full max-w-7xl space-y-8 ${chefSettings.largeTextMode ? "text-lg" : ""}`}>
      <header>
        <h2 className="text-4xl font-black tracking-tight text-slate-900">Kitchen Live Orders</h2>
        <p className="text-sm text-slate-500">FIFO order flow: oldest first, grouped by Waiting and Cooking.</p>
      </header>

      <section className="space-y-4">
        <header className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <h3 className="text-2xl font-bold text-amber-900">Waiting Orders</h3>
          <p className="text-sm text-amber-800">Not accepted yet</p>
        </header>

        <div className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence>
            {waitingOrders.map((order) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border border-amber-300 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-3xl font-black text-slate-900">Table {order.tableNumber}</h4>
                    <p className="text-sm text-slate-600">Received {humanTime(order.createdAt)}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <StatusBadge className="bg-amber-100 text-amber-800" label="Waiting" />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <ul className="space-y-2">
                    {order.items.map((item, index) => {
                      const image = menuImageById[item.menuItemId];
                      return (
                        <li
                          key={`${order.id}_${item.menuItemId}_${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-slate-200">
                              {image ? (
                                <Image alt={item.name} fill className="object-cover" src={image} />
                              ) : null}
                            </div>
                            <span className="text-base font-semibold text-slate-900">{item.name}</span>
                          </div>
                          <span className="rounded-md bg-slate-900 px-2 py-1 text-sm font-bold text-white">x{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {order.waiterNote ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <strong>Note:</strong> {order.waiterNote}
                  </p>
                ) : null}

                <button
                  className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-bold text-white transition hover:bg-amber-600"
                  onClick={() => updateOrderStatus(order.id, "in_progress")}
                  type="button"
                >
                  Accept
                </button>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {waitingOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
            No waiting orders.
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <header className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <h3 className="text-2xl font-bold text-emerald-900">Cooking Orders</h3>
          <p className="text-sm text-emerald-800">Accepted / In progress</p>
        </header>

        <div className="grid gap-4 xl:grid-cols-2">
          <AnimatePresence>
            {cookingOrders.map((order) => (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className={`rounded-2xl border p-5 shadow-sm ${
                  now - new Date(order.createdAt).getTime() >
                  chefSettings.cookingTimeWarningMins * 60 * 1000
                    ? "border-amber-400 bg-amber-50"
                    : "border-emerald-300 bg-white"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xl font-black text-slate-600">Table {order.tableNumber}</h4>
                    <p className="text-2xl text-slate-900 font-black">Received {humanTime(order.createdAt)}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <StatusBadge
                    className={order.status === "ready" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}
                    label={order.status === "ready" ? "Ready" : "Cooking"}
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <ul className="space-y-2">
                    {order.items.map((item, index) => {
                      const image = menuImageById[item.menuItemId];
                      return (
                        <li
                          key={`${order.id}_${item.menuItemId}_${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-slate-200">
                              {image ? (
                                <Image alt={item.name} fill className="object-cover" src={image} />
                              ) : null}
                            </div>
                            <span className="text-base font-semibold text-slate-900">{item.name}</span>
                          </div>
                          <span className="rounded-md bg-slate-900 px-2 py-1 text-sm font-bold text-white">x{item.quantity}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {order.waiterNote ? (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <strong>Note:</strong> {order.waiterNote}
                  </p>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                    type="button"
                  >
                    Mark Ready
                  </button>
                  <button
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    onClick={() => updateOrderStatus(order.id, "completed")}
                    type="button"
                  >
                    Complete
                  </button>
                </div>

                <div className="mt-3">
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
                    onChange={(event) =>
                      setRejectReason((state) => ({
                        ...state,
                        [order.id]: event.target.value,
                      }))
                    }
                    placeholder="Reject reason (required if rejecting)"
                    value={rejectReason[order.id] || ""}
                  />
                  <button
                    className="mt-2 w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                    disabled={!rejectReason[order.id]?.trim()}
                    onClick={() =>
                      updateOrderStatus(order.id, "rejected", rejectReason[order.id] || undefined)
                    }
                    type="button"
                  >
                    Reject Order
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {cookingOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
            No cooking orders.
          </div>
        ) : null}
      </section>

      {liveOrders.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-20 text-center text-slate-500">
          No active orders. Kitchen is clear.
        </div>
      ) : null}
    </section>
  );
}
