"use client";

import { useMemo, useState } from "react";
import { currency, humanTime, useDashboardStore } from "@/lib/dashboard-store";

export default function CashierFinalizedTransactionsPage() {
  const orders = useDashboardStore((state) => state.orders);
  const payments = useDashboardStore((state) => state.payments);
  const addTipToFinalizedPayment = useDashboardStore((state) => state.addTipToFinalizedPayment);

  const finalizedPayments = useMemo(
    () =>
      payments
        .filter((payment) => payment.finalized)
        .map((payment) => ({ payment, order: orders.find((order) => order.id === payment.orderId) }))
        .sort(
          (a, b) =>
            new Date(b.payment.paidAt ?? 0).getTime() -
            new Date(a.payment.paidAt ?? 0).getTime(),
        ),
    [orders, payments],
  );

  const [tipInputs, setTipInputs] = useState<Record<string, number>>({});

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Finalized Transactions</h2>
        <p className="text-sm text-slate-500">Add or update tip only after a transaction is finalized.</p>
      </div>

      <div className="grid gap-4">
        {finalizedPayments.map(({ payment, order }) => {
          if (!order) return null;

          const tipValue = tipInputs[payment.orderId] ?? payment.tip;
          const previewTotal = payment.subtotal + Math.max(0, Number(tipValue) || 0);

          return (
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={payment.id}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">Order {order.id} - Table {order.tableNumber}</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  finalized
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Paid: {payment.paidAt ? humanTime(payment.paidAt) : "-"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Items: {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded border border-slate-200 p-2 text-sm">Subtotal: {currency(payment.subtotal)}</div>
                <div className="rounded border border-slate-200 p-2 text-sm">Current Tip: {currency(payment.tip)}</div>
                <div className="rounded border border-slate-200 p-2 text-sm font-semibold">Total: {currency(payment.total)}</div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-sm">
                  Tip
                  <input
                    className="w-24 rounded border border-slate-300 px-2 py-1"
                    min={0}
                    onChange={(event) =>
                      setTipInputs((state) => ({
                        ...state,
                        [payment.orderId]: Number(event.target.value),
                      }))
                    }
                    step="0.01"
                    type="number"
                    value={tipValue}
                  />
                </label>
                <button
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => addTipToFinalizedPayment(payment.orderId, tipValue)}
                  type="button"
                >
                  Save Tip
                </button>
                <span className="text-sm text-slate-500">New total: {currency(previewTotal)}</span>
              </div>
            </article>
          );
        })}

        {finalizedPayments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No finalized transactions yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
