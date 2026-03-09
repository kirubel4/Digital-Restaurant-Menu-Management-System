"use client";

import { FormEvent, useState } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import { useManagerMetrics } from "../lib/use-manager-metrics";

export default function ManagerSettingsPage() {
  const { chefSettings } = useManagerMetrics();
  const updateChefSettings = useDashboardStore((state) => state.updateChefSettings);

  const [form, setForm] = useState({
    restaurantName: chefSettings.restaurantName,
    tableCount: chefSettings.tableCount,
    displayMode: chefSettings.displayMode,
    kitchenLayout: chefSettings.kitchenLayout,
    orderSoundEnabled: chefSettings.orderSoundEnabled,
    cookingTimeWarningMins: chefSettings.cookingTimeWarningMins,
    autoRefreshIntervalSec: chefSettings.autoRefreshIntervalSec,
    notificationsEnabled: chefSettings.notificationsEnabled,
  });

  const [securityOptIn, setSecurityOptIn] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateChefSettings({
      restaurantName: form.restaurantName,
      tableCount: form.tableCount,
      displayMode: form.displayMode,
      kitchenLayout: form.kitchenLayout,
      orderSoundEnabled: form.orderSoundEnabled,
      cookingTimeWarningMins: form.cookingTimeWarningMins,
      autoRefreshIntervalSec: form.autoRefreshIntervalSec,
      notificationsEnabled: form.notificationsEnabled,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Settings</p>
        <h1 className="text-3xl font-bold text-slate-900">System & security</h1>
        <p className="text-sm text-slate-500">Configure notifications, layouts, permissions, and policies.</p>
      </header>

      <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Restaurant info</h3>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.restaurantName}
              onChange={(event) => setForm({ ...form, restaurantName: event.target.value })}
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              type="number"
              value={form.tableCount}
              onChange={(event) => setForm({ ...form, tableCount: Number(event.target.value) })}
            />
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Display mode</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.displayMode}
              onChange={(event) => setForm({ ...form, displayMode: event.target.value as typeof form.displayMode })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Notifications</h3>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>Order sound</span>
              <input
                type="checkbox"
                checked={form.orderSoundEnabled}
                onChange={(event) => setForm({ ...form, orderSoundEnabled: event.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>Push alerts</span>
              <input
                type="checkbox"
                checked={form.notificationsEnabled}
                onChange={(event) => setForm({ ...form, notificationsEnabled: event.target.checked })}
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700">
              <span>Security review</span>
              <input type="checkbox" checked={securityOptIn} onChange={(event) => setSecurityOptIn(event.target.checked)} />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">System config</h3>
          <div className="mt-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Kitchen layout</label>
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.kitchenLayout}
              onChange={(event) => setForm({ ...form, kitchenLayout: event.target.value as typeof form.kitchenLayout })}
            >
              <option value="grid">Grid</option>
              <option value="compact">Compact</option>
              <option value="kanban">Kanban</option>
            </select>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              type="number"
              value={form.autoRefreshIntervalSec}
              onChange={(event) => setForm({ ...form, autoRefreshIntervalSec: Number(event.target.value) })}
              placeholder="Auto refresh (sec)"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Security depth</h3>
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              type="number"
              value={form.cookingTimeWarningMins}
              onChange={(event) => setForm({ ...form, cookingTimeWarningMins: Number(event.target.value) })}
              placeholder="Cooking warning (mins)"
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              type="number"
              value={form.tableCount}
              onChange={(event) => setForm({ ...form, tableCount: Number(event.target.value) })}
              placeholder="Table count"
            />
          </div>
        </article>

        <div className="flex items-end justify-end lg:col-span-2">
          <button className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white" type="submit">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
