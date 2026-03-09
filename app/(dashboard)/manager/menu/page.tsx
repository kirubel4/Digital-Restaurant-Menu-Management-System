"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { currency, useDashboardStore } from "@/lib/dashboard-store";
import type { MenuAvailability } from "@/types/dashboard";
import { useManagerMetrics } from "../lib/use-manager-metrics";

const defaultMenuForm = {
  name: "",
  description: "",
  price: "",
  category: "starter",
  availability: "available" as MenuAvailability,
  image: "",
  special: false,
};

export default function ManagerMenuPage() {
  const { menu } = useManagerMetrics();
  const addMenuItem = useDashboardStore((state) => state.addMenuItem);
  const updateMenuItem = useDashboardStore((state) => state.updateMenuItem);
  const removeMenuItem = useDashboardStore((state) => state.removeMenuItem);
  const setMenuAvailability = useDashboardStore((state) => state.setMenuAvailability);

  const [menuCategory, setMenuCategory] = useState("all");
  const [menuForm, setMenuForm] = useState(defaultMenuForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const menuCategories = useMemo(() => Array.from(new Set(menu.map((item) => item.category))), [menu]);
  const filteredMenu = useMemo(
    () => menu.filter((item) => (menuCategory === "all" ? true : item.category === menuCategory)),
    [menu, menuCategory],
  );

  const resetForm = () => {
    setMenuForm(defaultMenuForm);
    setEditingId(null);
    setImagePreview("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: menuForm.name,
      description: menuForm.description,
      category: menuForm.category,
      price: Number(menuForm.price),
      availability: menuForm.availability,
      image: menuForm.image,
      active: true,
      special: menuForm.special,
    };
    if (editingId) {
      updateMenuItem(editingId, payload);
    } else {
      addMenuItem(payload);
    }
    resetForm();
    setModalOpen(false);
  };

  const startEdit = (id: string) => {
    const item = menu.find((entry) => entry.id === id);
    if (!item) return;
    setEditingId(id);
    setMenuForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
      category: item.category,
      availability: item.availability,
      image: item.image ?? "",
      special: !!item.special,
    });
    setImagePreview(item.image ?? "");
    setModalOpen(true);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(menuForm.image);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setMenuForm((prev) => ({ ...prev, image: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Menu</p>
        <h1 className="text-3xl font-bold text-slate-900">Menu management</h1>
        <p className="text-sm text-slate-500">Add, edit, or retire menu items with visual cards.</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="rounded-full border border-slate-300 bg-white px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400"
          >
            + Add menu item
          </button>
          <button
            type="button"
            onClick={() => setMenuCategory("all")}
            className={`rounded-full border px-3 py-1 text-xs ${menuCategory === "all" ? "border-slate-900 text-slate-900" : "border-slate-200 text-slate-500"}`}
          >
            All items
          </button>
          {menuCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setMenuCategory(category)}
              className={`rounded-full border px-3 py-1 text-xs ${menuCategory === category ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-500"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">Images supported via upload</span>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit menu item" : "Add menu item"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setModalOpen(false);
                }}
                className="text-slate-500 transition hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={menuForm.name}
                  onChange={(event) => setMenuForm({ ...menuForm, name: event.target.value })}
                  required
                />
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Category</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={menuForm.category}
                  onChange={(event) => setMenuForm({ ...menuForm, category: event.target.value })}
                >
                  <option value="starter">Starter</option>
                  <option value="main dish">Main dish</option>
                  <option value="dessert">Dessert</option>
                  <option value="drink">Drink</option>
                </select>
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Price (USD)</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={menuForm.price}
                  onChange={(event) => setMenuForm({ ...menuForm, price: event.target.value })}
                  required
                  type="number"
                  min="0"
                  step="0.5"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Description</label>
                <textarea
                  className="h-full w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={menuForm.description}
                  onChange={(event) => setMenuForm({ ...menuForm, description: event.target.value })}
                />
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-slate-500"
                  onChange={handleImageUpload}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-24 w-full rounded-2xl object-cover" />
                )}
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Availability</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={menuForm.availability}
                  onChange={(event) => setMenuForm({ ...menuForm, availability: event.target.value as MenuAvailability })}
                >
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="limited">Limited</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={menuForm.special}
                    onChange={(event) => setMenuForm({ ...menuForm, special: event.target.checked })}
                  />
                  Mark as special
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setModalOpen(false);
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white" type="submit">
                  {editingId ? "Update item" : "Add menu item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredMenu.map((item) => (
          <article key={item.id} className="flex rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100">
              {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="ml-4 flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                  {item.special && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Special</span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-900">{currency(item.price)}</span>
                <span className="capitalize text-slate-500">{item.availability.replace(/_/g, " ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  type="button"
                  onClick={() => setMenuAvailability(item.id, item.availability === "available" ? "out_of_stock" : "available")}
                >
                  Toggle availability
                </button>
                <button
                  className={`rounded-full border px-3 py-1 text-xs ${item.special ? "border-emerald-500 text-emerald-600" : "border-slate-200 text-slate-600"}`}
                  type="button"
                  onClick={() => updateMenuItem(item.id, { special: !item.special })}
                >
                  {item.special ? "Unmark special" : "Mark special"}
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-red-600"
                  type="button"
                  onClick={() => removeMenuItem(item.id)}
                >
                  Delete
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  type="button"
                  onClick={() => startEdit(item.id)}
                >
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
