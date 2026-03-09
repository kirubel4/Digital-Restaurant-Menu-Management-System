"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Switch from "@/components/ui/switch";
import { useDashboardStore } from "@/lib/dashboard-store";

export default function ChefSettingsPage() {
  const chefSettings = useDashboardStore((state) => state.chefSettings);
  const updateChefSettings = useDashboardStore((state) => state.updateChefSettings);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const staff = useDashboardStore((state) => state.staff);
  const updateStaff = useDashboardStore((state) => state.updateStaff);
  const currentUser = useMemo(
    () => staff.find((member) => member.id === currentUserId),
    [currentUserId, staff],
  );
  const [email, setEmail] = useState(currentUser?.email ?? "chef@resto.com");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (currentUser) {
      updateStaff(currentUser.id, { email });
    }
    setPassword("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  useEffect(() => {
    setEmail(currentUser?.email ?? "chef@resto.com");
  }, [currentUser]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Kitchen Settings</h2>
        <p className="text-sm text-slate-500">Practical controls for KDS operations and display behavior.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">Chef Controls</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Order Sound Notification</span>
            <Switch
              checked={chefSettings.orderSoundEnabled}
              onToggle={() => updateChefSettings({ orderSoundEnabled: !chefSettings.orderSoundEnabled })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Show Elapsed Cooking Timer</span>
            <Switch
              checked={chefSettings.showElapsedTimer}
              onToggle={() => updateChefSettings({ showElapsedTimer: !chefSettings.showElapsedTimer })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cooking Warning Threshold (minutes)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
              min={1}
              onChange={(event) =>
                updateChefSettings({ cookingTimeWarningMins: Number(event.target.value) || 1 })
              }
              type="number"
              value={chefSettings.cookingTimeWarningMins}
            />
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">Display Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Dark Mode</span>
            <Switch
              checked={chefSettings.displayMode === "dark"}
              onToggle={() =>
                updateChefSettings({ displayMode: chefSettings.displayMode === "dark" ? "light" : "dark" })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Large Text Mode</span>
            <Switch
              checked={chefSettings.largeTextMode}
              onToggle={() => updateChefSettings({ largeTextMode: !chefSettings.largeTextMode })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Auto Refresh Interval (seconds)</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
              min={5}
              onChange={(event) =>
                updateChefSettings({ autoRefreshIntervalSec: Number(event.target.value) || 5 })
              }
              type="number"
              value={chefSettings.autoRefreshIntervalSec}
            />
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">Account Settings</h3>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                required
                type="password"
                value={password}
              />
            </div>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              Save Account
            </button>
          </form>
          {saved ? (
            <p className="text-sm font-semibold text-emerald-600">Account updated successfully.</p>
          ) : null}
        </article>

        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">Kitchen Layout</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Display Layout</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
              onChange={(event) =>
                updateChefSettings({
                  kitchenLayout: event.target.value as "grid" | "compact" | "kanban",
                })
              }
              value={chefSettings.kitchenLayout}
            >
              <option value="grid">Grid</option>
              <option value="compact">Compact</option>
              <option value="kanban">Kanban</option>
            </select>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Active staff: {staff.filter((member) => member.active).length}
          </div>
        </article>
      </div>
    </section>
  );
}
