"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "@/components/shared/StatusBadge";
import { orderStatusColorMap, readableStatus, useDashboardStore } from "@/lib/dashboard-store";

export default function WaiterTableDetailPage() {
  const params = useParams<{ tableId: string }>();
  const tableId = Number(params.tableId);

  const orders = useDashboardStore((state) => state.orders);
  const menu = useDashboardStore((state) => state.menu);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const createOrder = useDashboardStore((state) => state.createOrder);
  const addItemsToOrder = useDashboardStore((state) => state.addItemsToOrder);

  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const tableOrders = useMemo(
    () => orders.filter((order) => order.tableNumber === tableId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders, tableId],
  );

  const activeOrder = tableOrders.find((order) => ["pending", "in_progress", "ready"].includes(order.status));

  const availableMenu = menu.filter((item) => item.active && item.availability === "available");

  const onAddItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const item = menu.find((menuItem) => menuItem.id === selectedMenuItem);
    if (!item) return;

    const payload = [{ menuItemId: item.id, name: item.name, quantity, unitPrice: item.price }];

    if (activeOrder) {
      addItemsToOrder(activeOrder.id, payload, note || activeOrder.waiterNote);
    } else {
      createOrder(tableId, currentUserId, payload, note);
    }

    setQuantity(1);
    setSelectedMenuItem("");
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Table {tableId}</h2>
        <p className="text-sm text-slate-500">Add new items and attach customer requests for the chef.</p>
      </div>

      {activeOrder ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active order {activeOrder.id}</h3>
            <StatusBadge className={orderStatusColorMap[activeOrder.status]} label={readableStatus(activeOrder.status)} />
          </div>
          <ul className="space-y-1 text-sm text-slate-700">
            {activeOrder.items.map((item, index) => (
              <li key={`${item.menuItemId}_${index}`}>{item.quantity}x {item.name}</li>
            ))}
          </ul>
          {activeOrder.waiterNote ? <p className="mt-2 text-sm text-slate-500">Chef note: {activeOrder.waiterNote}</p> : null}
          {activeOrder.rejectNote ? <p className="mt-2 text-sm text-rose-600">Rejected reason: {activeOrder.rejectNote}</p> : null}
        </article>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">No active order.</div>
      )}

      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={onAddItem}>
        <h3 className="font-semibold text-slate-900">Add Item</h3>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setSelectedMenuItem(event.target.value)}
          required
          value={selectedMenuItem}
        >
          <option value="">Select available item</option>
          {availableMenu.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (${item.price})
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          min={1}
          onChange={(event) => setQuantity(Number(event.target.value))}
          type="number"
          value={quantity}
        />
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note for chef (customer requests)"
          rows={3}
          value={note}
        />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
          {activeOrder ? "Add to Order" : "Create Order"}
        </button>
      </form>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-slate-900">Menu availability</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {menu.map((item) => (
            <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm" key={item.id}>
              <span>{item.name}</span>
              <span className={item.availability === "available" ? "text-emerald-600" : "text-rose-600"}>
                {item.availability === "available" ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
