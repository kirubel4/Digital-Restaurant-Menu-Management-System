"use client";

import { FormEvent, useMemo, useState } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";

const notificationOptions = [
  { id: "chefAlerts", label: "Chef alerts" },
  { id: "paymentUpdates", label: "Payment updates" },
  { id: "shiftReminders", label: "Shift reminders" },
];

export default function WaiterSettingsPage() {
  const staff = useDashboardStore((state) => state.staff);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const currentUser = useMemo(() => staff.find((member) => member.id === currentUserId), [staff, currentUserId]);

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [password, setPassword] = useState("");
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    chefAlerts: true,
    paymentUpdates: true,
    shiftReminders: false,
  });
  const [sessionActive, setSessionActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("Profile updated successfully.");
    setTimeout(() => setStatusMessage(null), 1800);
  };

  const handlePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPassword("");
    setStatusMessage("Password updated securely.");
    setTimeout(() => setStatusMessage(null), 1800);
  };

  const toggleSession = () => {
    setSessionActive((prev) => !prev);
    setStatusMessage(sessionActive ? "Shift ended." : "Shift started.");
    setTimeout(() => setStatusMessage(null), 1800);
  };

  const handleLogout = () => {
    setSessionActive(false);
    setStatusMessage("You are logged out of the waiter panel.");
    setTimeout(() => setStatusMessage(null), 1800);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-3xl font-bold text-slate-900">Waiter settings</h1>
        <p className="text-sm text-slate-500">Keep your profile, notifications, and session controls tidy.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" onSubmit={handleProfile}>
          <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
              placeholder="Full name"
              required
              type="text"
            />
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
              placeholder="name@restaurant.com"
              required
              type="email"
            />
          </div>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Save profile
          </button>
        </form>

        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6" onSubmit={handlePassword}>
          <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">New password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
              minLength={6}
              placeholder="••••••••"
              required
              type="password"
            />
          </div>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Update password
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Notification preferences</h2>
          <p className="text-sm text-slate-500">Choose how you receive alerts during service.</p>
          <div className="mt-4 space-y-3">
            {notificationOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={notifications[option.id]}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Work session</h2>
            <p className="text-sm text-slate-500">Track your shift and log out when you finish service.</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={toggleSession}
                className="rounded-2xl border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                {sessionActive ? "End shift" : "Start shift"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600"
              >
                Logout
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Session status: <span className="font-semibold text-slate-900">{sessionActive ? "Active" : "Inactive"}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Quick tip: Keep notifications enabled for chef alerts when service gets busy.
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}
    </section>
  );
}
