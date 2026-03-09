"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currency } from "@/lib/dashboard-store";
import { useManagerMetrics } from "./lib/use-manager-metrics";

export default function ManagerDashboardPage() {
  const {
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    totalTransactions,
    revenueTrend,
    orderDistribution,
    popularItems,
    busiestHours,
    alerts,
    staffRevenue,
  } = useManagerMetrics();

  return (
    <div className="space-y-8 p-4 md:p-6">
      <header className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Manager dashboard</p>
          <h1 className="text-3xl font-bold text-slate-900">Restaurant intelligence center</h1>
        </div>
      </header>

      <section className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Daily revenue</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(dailyRevenue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Weekly revenue</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(weeklyRevenue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Monthly revenue</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(monthlyRevenue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total transactions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{totalTransactions}</p>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Revenue trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(value: number) => currency(value)} />
                <Bar dataKey="revenue" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Order distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderDistribution} dataKey="value" nameKey="name" outerRadius={90} fill="#0f766e" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </article>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Alerts & notifications</p>
            <div className="mt-3 space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{alert.source}</div>
                  <div className="text-slate-900">{alert.message}</div>
                  <div className="text-xs text-slate-400">{alert.time}</div>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Top selling foods</p>
            <ul className="mt-3 space-y-2 text-sm">
              {popularItems.map((item) => (
                <li key={item.name} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-xs text-slate-500">{item.qty} orders</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Busiest hours</p>
            <ul className="mt-3 space-y-2 text-sm">
              {busiestHours.map((hour) => (
                <li key={hour.label} className="flex items-center justify-between">
                  <span>{hour.label}</span>
                  <span className="text-xs text-slate-500">{hour.count} orders</span>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Staff activity overview</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-dashed border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active staff</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{staffRevenue.filter((member) => member.active).length}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inactive staff</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{staffRevenue.filter((member) => !member.active).length}</p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
