"use client";

import { useParams } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge";
import { orderStatusColorMap, readableStatus, useDashboardStore } from "@/lib/dashboard-store";

export default function WaiterOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const order = useDashboardStore((state) => state.orders.find((item) => item.id === params.orderId));

  if (!order) {
    return <p className="text-sm text-slate-500">Order not found.</p>;
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Order {order.id}</h2>
        <StatusBadge className={orderStatusColorMap[order.status]} label={readableStatus(order.status)} />
      </div>
      <p className="text-sm text-slate-500">Table {order.tableNumber}</p>
      <ul className="space-y-1 text-sm text-slate-700">
        {order.items.map((item, index) => (
          <li key={`${item.menuItemId}_${index}`}>{item.quantity}x {item.name}</li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">Chef note: {order.waiterNote || "none"}</p>
    </section>
  );
}
