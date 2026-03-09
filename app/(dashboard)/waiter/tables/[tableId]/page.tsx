"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { MenuItem, OrderItem } from "@/types/dashboard";
import { currency, humanTime, orderStatusColorMap, useDashboardStore } from "@/lib/dashboard-store";

type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

const summarizeOrderItems = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

export default function WaiterTableDetailPage() {
  const params = useParams<{ tableId: string }>();
  const tableNumber = Number(params.tableId);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [paymentSelection, setPaymentSelection] = useState<Record<string, number>>({});
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const {
    currentUserId,
    createOrder,
    addItemsToOrder,
    requestPayment,
    tables,
    menu,
    orders,
    payments,
  } = useDashboardStore();

  const tableInfo = tables.find((table) => table.tableNumber === tableNumber);
  const activeOrder = orders.find(
    (order) =>
      order.tableNumber === tableNumber &&
      ["pending", "in_progress", "ready"].includes(order.status),
  );

  const paymentRecordsForOrder = useMemo(() => {
    if (!activeOrder) return [];
    return payments.filter((payment) => payment.orderId === activeOrder.id);
  }, [activeOrder, payments]);

  const latestPayment = useMemo(() => {
    if (paymentRecordsForOrder.length === 0) return null;
    return [...paymentRecordsForOrder].sort(
      (a, b) => new Date(b.requestedAt ?? 0).getTime() - new Date(a.requestedAt ?? 0).getTime(),
    )[0];
  }, [paymentRecordsForOrder]);

  const pendingPayment = latestPayment ? !latestPayment.finalized : false;
  const paymentStatusKey = latestPayment
    ? latestPayment.finalized
      ? "paid"
      : "pending"
    : "none";

  const paymentStatusLabel = paymentStatusKey === "none" ? "No request" : paymentStatusKey;

  const categories = useMemo(() => {
    const acc: Array<{ id: string; name: string }> = [];
    menu.forEach((item) => {
      const category = item.category || "Uncategorized";
      if (category && !acc.find((entry) => entry.id === category)) {
        acc.push({ id: category, name: category });
      }
    });
    return acc;
  }, [menu]);

  const availableMenu = menu.filter((item) => item.active && item.availability === "available");

  const filteredMenu = availableMenu.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() ?? "").includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const menuByCategory = categories
    .map((category) => ({
      ...category,
      items: filteredMenu.filter((item) => item.category === category.name),
    }))
    .filter((category) => category.items.length > 0);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.menuItemId === item.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 },
      ];
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const submitOrder = () => {
    if (cart.length === 0 || isSubmittingOrder) return;
    setIsSubmittingOrder(true);

    const orderItems = cart.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      name: item.name,
    }));

    if (activeOrder) {
      addItemsToOrder(activeOrder.id, orderItems, orderNote);
    } else {
      createOrder(tableNumber, currentUserId, orderItems, orderNote);
    }

    setCart([]);
    setOrderNote("");
    window.setTimeout(() => setIsSubmittingOrder(false), 350);
  };

  const orderItemsSummary = useMemo(() => (activeOrder ? activeOrder.items : []), [activeOrder]);
  const defaultSelection = useMemo(() => {
    return orderItemsSummary.reduce<Record<string, number>>((acc, item) => {
      acc[item.menuItemId] = item.quantity;
      return acc;
    }, {});
  }, [orderItemsSummary]);

  useEffect(() => {
    setPaymentSelection(defaultSelection);
  }, [defaultSelection]);

  const orderTotal = orderItemsSummary.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const selectedPaymentItems = useMemo(() => {
    if (orderItemsSummary.length === 0) return [];
    return orderItemsSummary
      .map((item) => {
        const quantity = Math.min(
          item.quantity,
          Math.max(0, paymentSelection[item.menuItemId] ?? 0),
        );
        return quantity > 0 ? { ...item, quantity } : null;
      })
      .filter((item): item is OrderItem => item !== null);
  }, [orderItemsSummary, paymentSelection]);
  const selectedPaymentTotal = selectedPaymentItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const isFullSelection =
    selectedPaymentItems.length === orderItemsSummary.length &&
    selectedPaymentItems.every((item) =>
      orderItemsSummary.some(
        (original) =>
          original.menuItemId === item.menuItemId && original.quantity === item.quantity,
      ),
    );
  const cartTotal = summarizeOrderItems(cart);
  const updatePaymentSelection = (menuItemId: string, delta: number) => {
    const limit = orderItemsSummary.find((item) => item.menuItemId === menuItemId)?.quantity ?? 0;
    setPaymentSelection((prev) => {
      const next = Math.min(limit, Math.max(0, (prev[menuItemId] ?? 0) + delta));
      return { ...prev, [menuItemId]: next };
    });
  };

  const handlePaymentInput = (menuItemId: string, value: number) => {
    const limit = orderItemsSummary.find((item) => item.menuItemId === menuItemId)?.quantity ?? 0;
    const next = Math.min(limit, Math.max(0, value));
    setPaymentSelection((prev) => ({ ...prev, [menuItemId]: next }));
  };

  const resetPaymentSelection = () => {
    setPaymentSelection(defaultSelection);
  };
  const handleRequestPayment = () => {
    if (!activeOrder || selectedPaymentItems.length === 0) return;
    requestPayment(activeOrder.id, {
      items: selectedPaymentItems,
      label: isFullSelection ? "Full table" : "Split request",
    });
  };
  const canRequestSplit = Boolean(activeOrder && selectedPaymentItems.length > 0 && !pendingPayment);

  if (!tableInfo) {
    return <p className="text-sm text-slate-500">Table not found.</p>;
  }

  const paymentStatusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    none: "bg-slate-100 text-slate-600",
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-0">
      <header className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Table overview</p>
            <h1 className="text-3xl font-bold text-slate-900">Table {tableNumber}</h1>
          </div>
          {activeOrder ? (
            <StatusBadge
              label={activeOrder.status}
              className={orderStatusColorMap[activeOrder.status]}
            />
          ) : (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ready to seat
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Section: {tableInfo.section}</span>
          <span>Capacity: {tableInfo.capacity}</span>
          <span>Guests: {tableInfo.currentGuests || 0}</span>
          {tableInfo.reserved && tableInfo.reservedFor ? (
            <span>Reserved for {tableInfo.reservedFor}</span>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
            className="rounded-full border border-slate-200 p-2 text-slate-500"
            type="button"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-lg font-semibold text-slate-900">{guestCount} guests</span>
          <button
            onClick={() => setGuestCount(guestCount + 1)}
            className="rounded-full border border-slate-200 p-2 text-slate-500"
            type="button"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current order</p>
                <h2 className="text-lg font-semibold text-slate-900">Live items</h2>
              </div>
              <div className="text-sm text-slate-500">
                Total {currency(orderTotal)}
              </div>
            </div>
            {orderItemsSummary.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <UtensilsCrossed className="h-4 w-4" /> No order yet. Start by adding items from the menu.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {orderItemsSummary.map((item) => (
                  <div key={`${item.menuItemId}-${item.quantity}-${item.unitPrice}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} × {currency(item.unitPrice)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{currency(item.quantity * item.unitPrice)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Kitchen menu</p>
                <h2 className="text-lg font-semibold text-slate-900">Add items</h2>
              </div>
              <span className="text-xs text-slate-500">{filteredMenu.length} items</span>
            </div>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search dishes or drinks"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    selectedCategory === "all" ? "border border-slate-900 bg-slate-900 text-white" : "border border-slate-200 text-slate-600"
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      selectedCategory === category.name
                        ? "border border-slate-900 bg-slate-900 text-white"
                        : "border border-slate-200 text-slate-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {menuByCategory.length === 0 && (
                <p className="text-sm text-slate-500">No matching menu items.</p>
              )}
              {menuByCategory.map((category) => (
                <div key={category.id} className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">{category.name}</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-sm font-semibold text-slate-900">{currency(item.price)}</p>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500">{item.description}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="rounded-full border border-slate-900 px-3 py-1 text-xs font-semibold text-slate-900"
                        >
                          Add to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order prep</p>
                <h3 className="text-lg font-semibold text-slate-900">New items</h3>
              </div>
              <p className="text-sm font-semibold text-slate-900">Subtotal {currency(cartTotal)}</p>
            </div>
            <div className="mt-3 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-500">Select items to add.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{currency(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="rounded border border-slate-200 px-2"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="rounded border border-slate-200 px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-xs text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <textarea
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
              placeholder="Add a note for the kitchen"
              className="mt-4 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
            />
            <div className="mt-4">
              <button
                type="button"
                onClick={submitOrder}
                disabled={cart.length === 0 || isSubmittingOrder}
                className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                {isSubmittingOrder
                  ? "Sending..."
                  : activeOrder
                    ? "Add to order"
                    : "Send new order"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Split payment</p>
                <h3 className="text-lg font-semibold text-slate-900">Choose items</h3>
              </div>
              <button
                type="button"
                onClick={resetPaymentSelection}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Select all
              </button>
            </div>
            <div className="space-y-3">
              {orderItemsSummary.length === 0 ? (
                <p className="text-sm text-slate-500">No order items yet.</p>
              ) : (
                orderItemsSummary.map((item) => (
                  <div
                    key={`${item.menuItemId}-split`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.quantity} served · {currency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updatePaymentSelection(item.menuItemId, -1)}
                        className="rounded border border-slate-200 px-2 text-xs text-slate-600"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={paymentSelection[item.menuItemId] ?? 0}
                        onChange={(event) =>
                          handlePaymentInput(item.menuItemId, Number(event.target.value))
                        }
                        className="w-10 rounded border border-slate-200 px-2 py-1 text-center text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => updatePaymentSelection(item.menuItemId, 1)}
                        className="rounded border border-slate-200 px-2 text-xs text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
              <span>Selected total</span>
              <span>{currency(selectedPaymentTotal)}</span>
            </div>
            <button
              type="button"
              onClick={handleRequestPayment}
              disabled={!canRequestSplit || selectedPaymentTotal === 0}
              className="w-full rounded-2xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {isFullSelection ? "Request full payment" : "Request selected items"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeOrder ? `Order ${activeOrder.id}` : "No order yet"}
                </h3>
              </div>
              <StatusBadge label={paymentStatusLabel} className={paymentStatusStyles[paymentStatusKey]} />
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                {latestPayment ? `Amount: ${currency(latestPayment.total)}` : "No payment has been requested yet."}
              </p>
              {latestPayment && (
                <p className="text-xs text-slate-500">
                  Requested {latestPayment.requestedAt ? humanTime(latestPayment.requestedAt) : "—"}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
