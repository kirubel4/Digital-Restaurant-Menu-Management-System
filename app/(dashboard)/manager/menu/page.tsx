"use client";

import { FormEvent, useState } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import type { MenuCategory } from "@/types/dashboard";

export default function ManagerMenuPage() {
  const menu = useDashboardStore((state) => state.menu);
  const addMenuItem = useDashboardStore((state) => state.addMenuItem);
  const updateMenuItem = useDashboardStore((state) => state.updateMenuItem);
  const toggleMenuItemActive = useDashboardStore((state) => state.toggleMenuItemActive);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<MenuCategory>("starter");
  const [price, setPrice] = useState(0);

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addMenuItem({ name, category, price, availability: "available", active: true });
    setName("");
    setCategory("starter");
    setPrice(0);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Menu Management</h2>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4" onSubmit={onAdd}>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setName(event.target.value)}
          placeholder="Menu item name"
          required
          value={name}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setCategory(event.target.value as MenuCategory)}
          value={category}
        >
          <option value="starter">Starter</option>
          <option value="main dish">Main Dish</option>
          <option value="dessert">Dessert</option>
          <option value="drink">Drink</option>
        </select>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          min={1}
          onChange={(event) => setPrice(Number(event.target.value))}
          required
          step="0.01"
          type="number"
          value={price || ""}
        />
        <button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" type="submit">
          Add Item
        </button>
      </form>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item) => (
              <tr className="border-t border-slate-100" key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 capitalize">{item.category}</td>
                <td className="px-4 py-3">
                  <input
                    className="w-24 rounded border border-slate-300 px-2 py-1"
                    min={1}
                    onChange={(event) => updateMenuItem(item.id, { price: Number(event.target.value) })}
                    step="0.01"
                    type="number"
                    value={item.price}
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.availability === "available" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.availability === "available" ? "Available" : "Out of stock"}
                  </span>
                </td>
                <td className="px-4 py-3">{item.active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => toggleMenuItemActive(item.id)}
                    type="button"
                  >
                    {item.active ? "Disable" : "Enable"}
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
