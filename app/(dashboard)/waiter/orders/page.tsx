"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import { orderStatusColorMap, readableStatus, useDashboardStore } from "@/lib/dashboard-store";

export default function WaiterOrdersPage() {
  const orders = useDashboardStore((state) => state.orders);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const createOrder = useDashboardStore((state) => state.createOrder);

  const waiterOrders = useMemo(
    () => orders.filter((order) => order.waiterId === currentUserId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders, currentUserId],
  );

  const [tableNumber, setTableNumber] = useState(1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500">View orders created by you, or create a quick new order.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="w-24 rounded border border-slate-300 px-2 py-2"
            min={1}
            onChange={(event) => setTableNumber(Number(event.target.value))}
            type="number"
            value={tableNumber}
          />
          <button
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
            onClick={() => createOrder(tableNumber, currentUserId, [], "Quick order created from waiter orders")}
            type="button"
          >
            Create New Order
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {waiterOrders.map((order) => (
          <Link className="rounded-xl border border-slate-200 bg-white p-4" href={`/waiter/orders/${order.id}`} key={order.id}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">Order {order.id} - Table {order.tableNumber}</p>
              <StatusBadge className={orderStatusColorMap[order.status]} label={readableStatus(order.status)} />
            </div>
            <p className="mt-1 text-sm text-slate-600">{order.items.length} items | note: {order.waiterNote || "none"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
