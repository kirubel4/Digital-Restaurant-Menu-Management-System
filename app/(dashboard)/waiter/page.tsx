"use client";

import { useMemo } from "react";
import { CheckCircle, Clock, CreditCard, Table } from "lucide-react";
import StatCard from "@/components/waiter/dashboard/StatCard";
import { currency, humanTime, useDashboardStore } from "@/lib/dashboard-store";

export default function WaiterDashboardPage() {
  const orders = useDashboardStore((state) => state.orders);
  const payments = useDashboardStore((state) => state.payments);
  const notifications = useDashboardStore((state) => state.notifications);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const markRead = useDashboardStore((state) => state.markNotificationsRead);

  const todayString = useMemo(() => new Date().toDateString(), []);

  const waiterOrders = useMemo(
    () => orders.filter((order) => order.waiterId === currentUserId),
    [orders, currentUserId],
  );

  const activeTables = useMemo(() => {
    const active = waiterOrders.filter((order) => !["completed", "rejected"].includes(order.status));
    return new Set(active.map((order) => order.tableNumber)).size;
  }, [waiterOrders]);

  const pendingOrders = waiterOrders.filter((order) => order.status === "pending").length;
  const completedToday = waiterOrders.filter(
    (order) =>
      order.status === "completed" && new Date(order.updatedAt).toDateString() === todayString,
  ).length;

  const paymentRequests = payments.filter((payment) => {
    if (payment.finalized) return false;
    return waiterOrders.some((order) => order.id === payment.orderId);
  });

  const chefAlerts = notifications
    .filter((item) => item.targetRole === "waiter")
    .slice(0, 3);

  const requestSummaries = paymentRequests.map((payment) => {
    const order = orders.find((item) => item.id === payment.orderId);
    return {
      id: payment.id,
      table: order?.tableNumber ?? "—",
      amount: currency(payment.total),
      time: payment.requestedAt ? humanTime(payment.requestedAt) : "—",
    };
  });

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Waiter dashboard</h1>
        <p className="text-sm text-slate-500">Quick insights so you can move fast during service.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active tables"
          value={activeTables}
          helper="Orders in progress"
          icon={<Table className="h-5 w-5" />}
        />
        <StatCard
          label="Pending orders"
          value={pendingOrders}
          helper="Awaiting chef confirmation"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Payment requests"
          value={paymentRequests.length}
          helper="Waiting for cashier"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          label="Completed today"
          value={completedToday}
          helper="Orders settled"
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chef alerts</p>
              <h2 className="text-xl font-semibold text-slate-900">Food ready to serve</h2>
            </div>
            <button
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              onClick={() => markRead("waiter")}
              type="button"
            >
              Mark read
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {chefAlerts.length === 0 ? (
              <p>No new alerts.</p>
            ) : (
              chefAlerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-slate-800">{alert.message}</p>
                  <p className="text-xs text-slate-500">{humanTime(alert.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Payment tracker</p>
              <h2 className="text-xl font-semibold text-slate-900">Requests in flight</h2>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {requestSummaries.length} active
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {requestSummaries.length === 0 ? (
              <p>No payment requests.</p>
            ) : (
              requestSummaries.map((summary) => (
                <div key={summary.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                  <div>
                    <p className="text-slate-800">Table {summary.table}</p>
                    <p className="text-xs text-slate-500">{summary.time}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{summary.amount}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
