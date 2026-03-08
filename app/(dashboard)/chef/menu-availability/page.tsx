"use client";

import { useMemo, useState } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import Switch from "@/components/ui/switch";

export default function ChefMenuAvailabilityPage() {
  const menu = useDashboardStore((state) => state.menu);
  const setMenuAvailability = useDashboardStore((state) => state.setMenuAvailability);
  const bulkSetMenuAvailability = useDashboardStore((state) => state.bulkSetMenuAvailability);
  const setMenuLowStock = useDashboardStore((state) => state.setMenuLowStock);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(menu.map((item) => item.category)))],
    [menu],
  );

  const filteredMenu = useMemo(
    () =>
      menu.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "all" || item.category === category;
        return matchesSearch && matchesCategory;
      }),
    [category, menu, search],
  );

  const visibleIds = filteredMenu.map((item) => item.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Menu Availability</h2>
          <p className="text-sm text-slate-500">Enable, disable, and track low stock items quickly.</p>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
            onClick={() => bulkSetMenuAvailability(visibleIds, "available")}
            type="button"
          >
            Bulk Enable
          </button>
          <button
            className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
            onClick={() => bulkSetMenuAvailability(visibleIds, "out_of_stock")}
            type="button"
          >
            Bulk Disable
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search menu item..."
          value={search}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          {categories.map((value) => (
            <option className="capitalize" key={value} value={value}>
              {value === "all" ? "All Categories" : value}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredMenu.map((item) => (
          <article
            className={`rounded-xl border bg-white p-4 shadow-sm transition ${
              item.availability === "out_of_stock" ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
            }`}
            key={item.id}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-900 text-xl font-black text-white">
                {item.image || item.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs capitalize text-slate-500">{item.category}</p>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  item.availability === "available"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {item.availability === "available" ? "Available" : "Unavailable"}
              </span>
              <Switch
                checked={item.availability === "available"}
                onToggle={() =>
                  setMenuAvailability(item.id, item.availability === "available" ? "out_of_stock" : "available")
                }
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMenuAvailability(item.id, "available")}
                type="button"
              >
                Quick Enable
              </button>
              <button
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setMenuAvailability(item.id, "out_of_stock")}
                type="button"
              >
                Quick Disable
              </button>
            </div>

            <label className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Low stock warning
              <input
                checked={Boolean(item.lowStock)}
                onChange={(event) => setMenuLowStock(item.id, event.target.checked)}
                type="checkbox"
              />
            </label>
          </article>
        ))}
      </div>

      {filteredMenu.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          No menu items match your filters.
        </div>
      ) : null}
      <div className="text-sm text-slate-500">
        Showing {filteredMenu.length} item(s) of {menu.length}.
      </div>
    </section>
  );
}
