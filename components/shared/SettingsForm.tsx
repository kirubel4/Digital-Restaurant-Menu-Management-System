"use client";

import { FormEvent, useState } from "react";

type SettingsFormProps = {
  roleLabel: string;
};

export default function SettingsForm({ roleLabel }: SettingsFormProps) {
  const [email, setEmail] = useState(`${roleLabel.toLowerCase()}@resto.com`);
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    setPassword("");
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Account Settings</h2>
      <p className="mb-4 text-sm text-slate-500">Update email and password for the {roleLabel} account.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-400 focus:ring-2"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-400 focus:ring-2"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter new password"
            required
            type="password"
            value={password}
          />
        </div>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">
          Save Settings
        </button>
      </form>
      {saved ? <p className="mt-3 text-sm text-emerald-600">Settings updated successfully.</p> : null}
    </section>
  );
}
