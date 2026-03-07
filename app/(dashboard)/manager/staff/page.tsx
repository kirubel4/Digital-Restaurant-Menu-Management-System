"use client";

import { FormEvent, useState } from "react";
import { useDashboardStore } from "@/lib/dashboard-store";
import type { UserRole } from "@/types/dashboard";

export default function ManagerStaffPage() {
  const staff = useDashboardStore((state) => state.staff);
  const addStaff = useDashboardStore((state) => state.addStaff);
  const updateStaff = useDashboardStore((state) => state.updateStaff);
  const toggleStaffActive = useDashboardStore((state) => state.toggleStaffActive);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("waiter");

  const onAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addStaff({ name, email, role, active: true });
    setName("");
    setEmail("");
    setRole("waiter");
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Staff Management</h2>
      </div>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4" onSubmit={onAdd}>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setName(event.target.value)}
          placeholder="Staff name"
          required
          value={name}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
          type="email"
          value={email}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          onChange={(event) => setRole(event.target.value as UserRole)}
          value={role}
        >
          <option value="waiter">Waiter</option>
          <option value="chef">Chef</option>
          <option value="cashier">Cashier</option>
        </select>
        <button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white" type="submit">
          Add Staff
        </button>
      </form>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr className="border-t border-slate-100" key={member.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                <td className="px-4 py-3 text-slate-600">{member.email}</td>
                <td className="px-4 py-3 capitalize">{member.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {member.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <select
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onChange={(event) => updateStaff(member.id, { role: event.target.value as UserRole })}
                    value={member.role}
                  >
                    <option value="manager">Manager</option>
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                    <option value="cashier">Cashier</option>
                  </select>
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                    onClick={() => toggleStaffActive(member.id)}
                    type="button"
                  >
                    {member.active ? "Disable" : "Enable"}
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
