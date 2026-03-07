"use client";

import { useDashboardStore } from "@/lib/dashboard-store";

export default function ChefMenuAvailabilityPage() {
  const menu = useDashboardStore((state) => state.menu);
  const setMenuAvailability = useDashboardStore((state) => state.setMenuAvailability);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Menu Availability</h2>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr className="border-t border-slate-100" key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 capitalize">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={item.availability === "available" ? "text-emerald-600" : "text-rose-600"}>
                    {item.availability === "available" ? "Available" : "Out of stock"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() =>
                      setMenuAvailability(item.id, item.availability === "available" ? "out_of_stock" : "available")
                    }
                    type="button"
                  >
                    Mark {item.availability === "available" ? "Out of Stock" : "Available"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
