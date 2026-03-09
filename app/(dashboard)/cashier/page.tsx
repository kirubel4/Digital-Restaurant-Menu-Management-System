"use client";

import { useMemo } from "react";
import { currency, useDashboardStore } from "@/lib/dashboard-store";

export default function CashierPaymentsPage() {
  const orders = useDashboardStore((state) => state.orders);
  const payments = useDashboardStore((state) => state.payments);
  const finalizePayment = useDashboardStore((state) => state.finalizePayment);

  const pendingPayments = useMemo(
    () => payments.filter((payment) => !payment.finalized).map((payment) => ({ payment, order: orders.find((o) => o.id === payment.orderId) })),
    [payments, orders],
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Payments</h2>
        <p className="text-sm text-slate-500">Finalize transactions here. Tip is added only after finalization.</p>
      </div>

      <div className="grid gap-4">
        {pendingPayments.map(({ payment, order }) => {
          if (!order) return null;

          return (
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={payment.id}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Order {order.id} - Table {order.tableNumber}</h3>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">ready for payment</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Items: {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded border border-slate-200 p-2 text-sm">Subtotal: {currency(payment.subtotal)}</div>
                <div className="rounded border border-slate-200 p-2 text-sm font-semibold">Total: {currency(payment.total)}</div>
              </div>
              <button
                className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => finalizePayment(payment.orderId)}
                type="button"
              >
                Finalize Payment
              </button>
            </article>
          );
        })}

        {pendingPayments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No pending payments.</div>
        ) : null}
      </div>
    </section>
  );
}
