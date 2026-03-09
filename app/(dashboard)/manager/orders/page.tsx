"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currency } from "@/lib/dashboard-store";
import { useManagerMetrics } from "../lib/use-manager-metrics";

const timeframeOptions = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

const DAY_MILLIS = 24 * 60 * 60 * 1000;

export default function ManagerOrdersPage() {
  const { orders, staff } = useManagerMetrics();
  const [timeframe, setTimeframe] = useState(7);
  const [insight, setInsight] = useState<string | null>(null);

  const orderTotal = useCallback(
    (order: (typeof orders)[number]) =>
      order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [],
  );

  const timeframeOrders = useMemo(
    () =>
      orders.filter(
        (order) => new Date().getTime() - new Date(order.createdAt).getTime() <= timeframe * DAY_MILLIS,
      ),
    [orders, timeframe],
  );

  const shiftRevenue = useMemo(() => {
    const buckets: Record<string, number> = {};
    timeframeOrders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const bucket =
        hour < 11 ? "Breakfast" : hour < 16 ? "Lunch" : hour < 22 ? "Dinner" : "Late";
      buckets[bucket] = (buckets[bucket] || 0) + orderTotal(order);
    });
    return Object.entries(buckets).map(([label, revenue]) => ({ label, revenue }));
  }, [timeframeOrders, orderTotal]);

  const waiterRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    timeframeOrders.forEach((order) => {
      const waiter = staff.find((member) => member.id === order.waiterId)?.name ?? "Unknown";
      map[waiter] = (map[waiter] || 0) + orderTotal(order);
    });
    return Object.entries(map)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [timeframeOrders, staff, orderTotal]);

  const totalRevenue = timeframeOrders.reduce((sum, order) => sum + orderTotal(order), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Orders & transactions</p>
        <h1 className="text-3xl font-bold text-slate-900">Financial tracking</h1>
        <p className="text-sm text-slate-500">Scan transactions and drill into waiter impact.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeframe(option.value)}
              className={`rounded-full border px-4 py-1 text-xs font-semibold ${
                timeframe === option.value ? "border-slate-900 text-slate-900" : "border-slate-200 text-slate-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500">Timeframe filters the entire section.</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Period revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(totalRevenue)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{timeframeOrders.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top waiter</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {waiterRevenue[0]?.name ?? "N/A"}
          </p>
          <p className="text-xs text-slate-500">{currency(waiterRevenue[0]?.revenue ?? 0)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shifts tracked</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{shiftRevenue.length}</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Shift revenue</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={shiftRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => currency(value)} />
              <Bar dataKey="revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Waiter revenue ranking</p>
          <div className="mt-4 space-y-2 text-sm">
            {waiterRevenue.slice(0, 5).map((member) => (
              <div key={member.name} className="flex items-center justify-between">
                <span>{member.name}</span>
                <span className="font-semibold text-slate-900">{currency(member.revenue)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Transactions</p>
        <div className="mt-4 space-y-3">
          {timeframeOrders.map((order) => {
            const waiter = staff.find((member) => member.id === order.waiterId)?.name ?? "Unknown";
            return (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm">
                <div>
                  <p className="text-slate-900">Order #{order.ticketNumber}</p>
                  <p className="text-xs text-slate-500">{waiter}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{currency(orderTotal(order))}</span>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                    onClick={() =>
                      setInsight(`${waiter || "Unknown"} brought in ${currency(orderTotal(order))} on this ticket`)
                    }
                  >
                    Calculate waiter revenue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {insight && <p className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{insight}</p>}
      </article>
    </div>
  );
}
