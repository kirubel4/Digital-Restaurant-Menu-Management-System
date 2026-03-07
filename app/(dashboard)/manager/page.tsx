"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { currency, useDashboardStore } from "@/lib/dashboard-store";

export default function ManagerAnalyticsPage() {
  const orders = useDashboardStore((state) => state.orders);
  const tables = useDashboardStore((state) => state.tables);
  const staff = useDashboardStore((state) => state.staff);

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.items.reduce((line, item) => line + item.quantity * item.unitPrice, 0), 0);

  const activeOrders = orders.filter((order) => ["pending", "in_progress", "ready"].includes(order.status)).length;
  const staffActive = staff.filter((member) => member.active).length;
  const tableOccupancy = Math.round((tables.filter((table) => table.status !== "available").length / tables.length) * 100);
  const avgTableTime = 48;

  const orderStatusData = [
    { name: "Pending", value: orders.filter((order) => order.status === "pending").length },
    { name: "In progress", value: orders.filter((order) => order.status === "in_progress").length },
    { name: "Ready", value: orders.filter((order) => order.status === "ready").length },
    { name: "Completed", value: orders.filter((order) => order.status === "completed").length },
    { name: "Rejected", value: orders.filter((order) => order.status === "rejected").length },
  ];

  const popularItems = Object.values(
    orders
      .flatMap((order) => order.items)
      .reduce<Record<string, { name: string; qty: number }>>((acc, item) => {
        if (!acc[item.menuItemId]) {
          acc[item.menuItemId] = { name: item.name, qty: 0 };
        }
        acc[item.menuItemId].qty += item.quantity;
        return acc;
      }, {}),
  )
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((item) => ({ item: item.name, orders: item.qty }));

  const kpis = [
    { label: "Total Revenue", value: currency(totalRevenue) },
    { label: "Active Orders", value: String(activeOrders) },
    { label: "Staff Active", value: String(staffActive) },
    { label: "Average Table Time", value: `${avgTableTime} min` },
    { label: "Table Occupancy", value: `${tableOccupancy}%` },
    { label: "Popular Menu Items", value: `${popularItems.length} tracked` },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Main dashboard with charts and statistics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={kpi.label}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="h-80 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={orderStatusData} dataKey="value" nameKey="name" outerRadius={95} fill="#334155" label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="h-80 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Popular Menu Items</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={popularItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="item" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#0f766e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}
