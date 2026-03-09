"use client";

import { FormEvent, useMemo, useState } from "react";
import { currency, useDashboardStore } from "@/lib/dashboard-store";
import { useManagerMetrics } from "../lib/use-manager-metrics";
import type { StaffMember } from "@/types/dashboard";

export default function ManagerStaffPage() {
  const { staffRevenue } = useManagerMetrics();
  const addStaff = useDashboardStore((state) => state.addStaff);
  const updateStaff = useDashboardStore((state) => state.updateStaff);
  const toggleStaffActive = useDashboardStore((state) => state.toggleStaffActive);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffMember["role"]>("all");
  const [page, setPage] = useState(1);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffMember["role"]>("waiter");
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<StaffMember["role"]>("waiter");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return staffRevenue
      .filter((member) => {
        const matchesSearch = [member.name, member.email].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesRole = roleFilter === "all" ? true : member.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [staffRevenue, search, roleFilter]);

  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pagedStaff = filtered.slice((page - 1) * perPage, page * perPage);

  const handleAddStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addStaff({ name: newStaffName, email: newStaffEmail, role: newStaffRole, active: true });
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffRole("waiter");
  };

  const handleEditStaff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMember) return;
    updateStaff(editingMember.id, { name: editName, email: editEmail, role: editRole });
    setEditingMember(null);
  };

  const handleReset = (member: StaffMember) => {
    setResetMessage(`Credentials reset link sent to ${member.email}`);
    setTimeout(() => setResetMessage(null), 3000);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Staff</p>
        <h1 className="text-3xl font-bold text-slate-900">Staff management</h1>
        <p className="text-sm text-slate-500">Search, onboard, and monitor every employee.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
          placeholder="Search staff"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm"
          value={roleFilter}
          onChange={(event) => {
            setRoleFilter(event.target.value as typeof roleFilter);
            setPage(1);
          }}
        >
          <option value="all">All roles</option>
          <option value="manager">Manager</option>
          <option value="waiter">Waiter</option>
          <option value="chef">Chef</option>
          <option value="cashier">Cashier</option>
        </select>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
          Sorted by revenue contribution
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form className="rounded-2xl border border-slate-200 bg-white p-4" onSubmit={handleAddStaff}>
          <h3 className="text-base font-semibold text-slate-700">Add new staff</h3>
          <div className="mt-3 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Name"
              value={newStaffName}
              onChange={(event) => setNewStaffName(event.target.value)}
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              value={newStaffEmail}
              onChange={(event) => setNewStaffEmail(event.target.value)}
              required
              type="email"
            />
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={newStaffRole}
              onChange={(event) => setNewStaffRole(event.target.value as StaffMember["role"])}
            >
              <option value="waiter">Waiter</option>
              <option value="chef">Chef</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
            </select>
            <button className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white" type="submit">
              Invite staff
            </button>
          </div>
        </form>

        <form className="rounded-2xl border border-slate-200 bg-white p-4" onSubmit={handleEditStaff}>
          <h3 className="text-base font-semibold text-slate-700">Edit staff</h3>
          {editingMember ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Editing {editingMember.name}</p>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                required
                type="email"
              />
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={editRole}
                onChange={(event) => setEditRole(event.target.value as StaffMember["role"])}
              >
                <option value="waiter">Waiter</option>
                <option value="chef">Chef</option>
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
              </select>
              <button className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" type="submit">
                Save changes
              </button>
              <button
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                type="button"
                onClick={() => setEditingMember(null)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Select a staff row to edit details.</p>
          )}
        </form>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-semibold text-slate-700">Reset log</h3>
          <p className="mt-2 text-sm text-slate-500">Credential resets appear here.</p>
          {resetMessage ? (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{resetMessage}</p>
          ) : (
            <p className="mt-3 text-xs text-slate-400">No recent resets</p>
          )}
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.3em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {pagedStaff.map((member) => (
              <tr key={member.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-semibold text-slate-900">{member.name}</td>
                <td className="px-4 py-3 capitalize">{member.role}</td>
                <td className="px-4 py-3">{currency(member.revenue)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      member.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {member.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="flex flex-wrap gap-2 px-4 py-3">
                  <button
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                    onClick={() => {
                      setEditingMember(member);
                      setEditName(member.name);
                      setEditEmail(member.email);
                      setEditRole(member.role);
                    }}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                    onClick={() => toggleStaffActive(member.id)}
                    type="button"
                  >
                    {member.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                    onClick={() => handleReset(member)}
                    type="button"
                  >
                    Reset credentials
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Showing page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-slate-300 px-3 py-1 text-xs"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            type="button"
          >
            Previous
          </button>
          <button
            className="rounded-xl border border-slate-300 px-3 py-1 text-xs"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
