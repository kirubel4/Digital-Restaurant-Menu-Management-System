"use client";

import { useMemo } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import type { Order, StaffMember } from "@/types/dashboard";

const DAY_MILLIS = 24 * 60 * 60 * 1000;

const orderRevenue = (order: Order) =>
  order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export function useManagerMetrics() {
  const orders = useDashboardStore((state) => state.orders);
  const staff = useDashboardStore((state) => state.staff);
  const menu = useDashboardStore((state) => state.menu);
  const notifications = useDashboardStore((state) => state.notifications);
  const payments = useDashboardStore((state) => state.payments);
  const chefSettings = useDashboardStore((state) => state.chefSettings);
  const now = useMemo(() => new Date(), []);

  const revenueForWindow = (days: number) =>
    orders
      .filter((order) => now.getTime() - new Date(order.createdAt).getTime() <= days * DAY_MILLIS)
      .reduce((sum, order) => sum + orderRevenue(order), 0);

  const dailyRevenue = revenueForWindow(1);
  const weeklyRevenue = revenueForWindow(7);
  const monthlyRevenue = revenueForWindow(30);

  const revenueTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now.getTime() - (6 - index) * DAY_MILLIS);
      const key = day.toISOString().split("T")[0];
      const revenue = orders
        .filter((order) => order.createdAt.startsWith(key))
        .reduce((sum, order) => sum + orderRevenue(order), 0);
      return { label: day.toLocaleDateString("en-US", { weekday: "short" }), revenue };
    });
  }, [now, orders]);

  const orderDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const popularItems = useMemo(() => {
    const tally: Record<string, { name: string; qty: number }> = {};
    orders.flatMap((order) => order.items).forEach((item) => {
      tally[item.menuItemId] = tally[item.menuItemId] || { name: item.name, qty: 0 };
      tally[item.menuItemId].qty += item.quantity;
    });
    return Object.values(tally).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  const busiestHours = useMemo(() => {
    const buckets: Record<string, number> = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const segment = Math.floor(hour / 4);
      const bucket = ["Midnight", "Morning", "Afternoon", "Evening"][segment] ?? "Late";
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });
    return Object.entries(buckets)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [orders]);

  const alerts = useMemo(() => {
    const chefAlerts = orders
      .filter((order) => order.status === "ready")
      .map((order) => ({
        id: `chef-${order.id}`,
        source: "Chef",
        message: `Order ${order.ticketNumber} ready for Table ${order.tableNumber}`,
        time: new Date(order.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }));

    const waiterAlerts = orders
      .filter((order) => order.status === "pending")
      .map((order) => ({
        id: `waiter-${order.id}`,
        source: "Waiter",
        message: `Table ${order.tableNumber} requested ${order.items.length} items`,
        time: new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      }));

    const paymentAlerts = payments.map((payment) => ({
      id: payment.id,
      source: "Cashier",
      message: `Payment received for Order ${payment.orderId} (${payment.total})`,
      time: payment.paidAt
        ? new Date(payment.paidAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "Pending",
    }));

    return [...notifications, ...chefAlerts, ...waiterAlerts, ...paymentAlerts].slice(0, 5);
  }, [notifications, orders, payments]);

  const staffRevenue = useMemo(() => {
    return staff.map((member) => {
      const revenue = orders
        .filter((order) => order.waiterId === member.id)
        .reduce((sum, order) => sum + orderRevenue(order), 0);
      return { ...member, revenue };
    });
  }, [orders, staff]);

  return {
    orders,
    staff,
    menu,
    notifications,
    payments,
    chefSettings,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    totalTransactions: orders.length,
    revenueTrend,
    orderDistribution,
    popularItems,
    busiestHours,
    alerts,
    staffRevenue,
  };
}
