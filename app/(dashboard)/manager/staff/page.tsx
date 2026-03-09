"use client";

import clsx from "clsx";
import { FormEvent, useMemo, useState } from "react";
import {
  currency,
  tableStatusColorMap,
  useDashboardStore,
} from "@/lib/dashboard-store";
import { useManagerMetrics } from "../lib/use-manager-metrics";
import type { StaffMember, TableModel, TableStatus } from "@/types/dashboard";

const tableStatusLabels: Record<TableStatus, string> = {
  available: "Available",
  ordering: "Seating",
  in_progress: "In progress",
  ready_to_serve: "Ready to serve",
  finished: "Cleared",
  occupied: "Occupied",
  cleaning: "Cleaning",
};

const sectionOptions: TableModel["section"][] = [
  "main",
  "window",
  "patio",
  "vip",
  "bar",
];

type TableSelectionGridProps = {
  tables: TableModel[];
  selectedIds: string[];
  onToggle: (tableId: string) => void;
};

function TableSelectionGrid({
  tables,
  selectedIds,
  onToggle,
}: TableSelectionGridProps) {
  if (!tables.length) {
    return (
      <p className="px-2 text-sm text-slate-500">
        No tables currently match this filter.
      </p>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
      {tables.map((table) => {
        const isSelected = selectedIds.includes(table.id);
        const statusClasses =
          tableStatusColorMap[table.status] ?? "text-slate-500";

        return (
          <button
            key={table.id}
            type="button"
            onClick={() => onToggle(table.id)}
            aria-pressed={isSelected}
            className={clsx(
              "flex flex-col gap-2 rounded-2xl border-2 border-transparent px-4 py-3 text-left transition",
              isSelected
                ? "border-emerald-300 bg-emerald-50 shadow-inner"
                : "border-slate-200 bg-white hover:border-slate-900",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">
                Table {table.tableNumber}
              </span>
              <span
                className={`text-[11px] uppercase tracking-[0.3em] ${statusClasses}`}
              >
                {tableStatusLabels[table.status] ?? table.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {table.section} • {table.capacity} seats
            </p>
            {table.reserved && table.reservedFor ? (
              <p className="text-xs font-semibold text-amber-600">
                Reserved for {table.reservedFor}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type ViewMode = "staff" | "tables";

const defaultTableForm = {
  section: "main" as TableModel["section"],
  capacity: 4,
  reserved: false,
  reservedFor: "",
  reservationTime: "",
};

export default function ManagerStaffPage() {
  const { staffRevenue } = useManagerMetrics();
  const tables = useDashboardStore((state) => state.tables);
  const addStaff = useDashboardStore((state) => state.addStaff);
  const updateStaff = useDashboardStore((state) => state.updateStaff);
  const toggleStaffActive = useDashboardStore(
    (state) => state.toggleStaffActive,
  );
  const assignTablesToWaiter = useDashboardStore(
    (state) => state.assignTablesToWaiter,
  );
  const assignSingleTable = useDashboardStore(
    (state) => state.assignSingleTable,
  );
  const addTable = useDashboardStore((state) => state.addTable);

  const [view, setView] = useState<ViewMode>("staff");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | StaffMember["role"]>(
    "all",
  );
  const [page, setPage] = useState(1);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeStaff, setActiveStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    role: "waiter" as StaffMember["role"],
    selectedTables: [] as string[],
  });
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<StaffMember | null>(null);
  const [assignSelection, setAssignSelection] = useState<string[]>([]);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableForm, setTableForm] = useState(() => ({ ...defaultTableForm }));
  const [tableMessage, setTableMessage] = useState<string | null>(null);
  const showTableMessage = (value: string) => {
    setTableMessage(value);
    setTimeout(() => setTableMessage(null), 4000);
  };

  const waiterOptions = useMemo(
    () => staffRevenue.filter((member) => member.role === "waiter"),
    [staffRevenue],
  );

  const unassignedTables = tables.filter((table) => !table.waiterId);
  const assignedTables = tables.filter((table) => Boolean(table.waiterId));
  const reservedTables = tables.filter((table) => table.reserved);

  const filteredStaff = useMemo(() => {
    return staffRevenue
      .filter((member) => {
        const matchesSearch = [member.name, member.email].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesRole =
          roleFilter === "all" ? true : member.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [staffRevenue, search, roleFilter]);

  const perPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / perPage));
  const pagedStaff = filteredStaff.slice((page - 1) * perPage, page * perPage);

  const viewTabs: { id: ViewMode; label: string; helper: string }[] = [
    {
      id: "staff",
      label: "Staff roster",
      helper: "Search, edit, and invite teammates.",
    },
    {
      id: "tables",
      label: "Tables & floor",
      helper: "Manage seating, add new tables, and assign waiters.",
    },
  ];

  const toggleTableSelection = (tableId: string) => {
    setStaffForm((prev) => ({
      ...prev,
      selectedTables: prev.selectedTables.includes(tableId)
        ? prev.selectedTables.filter((id) => id !== tableId)
        : [...prev.selectedTables, tableId],
    }));
  };

  const toggleAssignSelection = (tableId: string) => {
    setAssignSelection((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId],
    );
  };

  const openStaffModal = (mode: "add" | "edit", member?: StaffMember) => {
    setModalMode(mode);
    setActiveStaff(member ?? null);
    setStaffForm({
      name: member?.name ?? "",
      email: member?.email ?? "",
      role: member?.role ?? "waiter",
      selectedTables: member
        ? tables
            .filter((table) => table.waiterId === member.id)
            .map((table) => table.id)
        : [],
    });
    setStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setStaffModalOpen(false);
    setActiveStaff(null);
  };

  const openAssignModal = (member: StaffMember) => {
    setAssignTarget(member);
    setAssignSelection(
      tables
        .filter((table) => table.waiterId === member.id)
        .map((table) => table.id),
    );
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setAssignTarget(null);
    setAssignSelection([]);
  };

  const handleStaffSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (modalMode === "add") {
      const newStaffId = addStaff({
        name: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
        active: true,
      });
      assignTablesToWaiter(newStaffId, staffForm.selectedTables);
    } else if (activeStaff) {
      updateStaff(activeStaff.id, {
        name: staffForm.name,
        email: staffForm.email,
        role: staffForm.role,
      });
      assignTablesToWaiter(activeStaff.id, staffForm.selectedTables);
    }
    closeStaffModal();
  };

  const handleAssignSubmit = () => {
    if (assignTarget) {
      assignTablesToWaiter(assignTarget.id, assignSelection);
    }
    closeAssignModal();
  };

  const handleReset = (member: StaffMember) => {
    setResetMessage(`Credentials reset link sent to ${member.email}`);
    setTimeout(() => setResetMessage(null), 3000);
  };

  const handleTableSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const table = addTable({
      section: tableForm.section,
      capacity: tableForm.capacity,
      reserved: tableForm.reserved,
      reservedFor: tableForm.reserved ? tableForm.reservedFor : undefined,
      reservationTime:
        tableForm.reserved && tableForm.reservationTime
          ? tableForm.reservationTime
          : undefined,
    });
    showTableMessage(`Table ${table.tableNumber} added to the floor.`);
    setTableForm({ ...defaultTableForm });
    setTableModalOpen(false);
  };

  const handleWaiterAssignment = (
    table: TableModel,
    waiterId: string | null,
  ) => {
    assignSingleTable(table.id, waiterId);
    const waiterName = waiterOptions.find(
      (member) => member.id === waiterId,
    )?.name;
    showTableMessage(
      waiterId
        ? `Table ${table.tableNumber} assigned to ${waiterName ?? "a waiter"}.`
        : `Table ${table.tableNumber} is no longer assigned.`,
    );
  };

  const assignableTablesForForm = useMemo(() => {
    const targetId = activeStaff?.id;
    return tables.filter(
      (table) => !table.waiterId || table.waiterId === targetId,
    );
  }, [tables, activeStaff]);

  const assignableTablesForAssignModal = useMemo(() => {
    const targetId = assignTarget?.id;
    return tables.filter(
      (table) => !table.waiterId || table.waiterId === targetId,
    );
  }, [tables, assignTarget]);

  const sortedTables = useMemo(
    () => [...tables].sort((a, b) => a.tableNumber - b.tableNumber),
    [tables],
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Staff
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Staff management</h1>
        <p className="text-sm text-slate-500">
          Search, onboard, and monitor every teammate.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
        {viewTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              view === tab.id
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-900",
            )}
          >
            {tab.label}
          </button>
        ))}
        <p className="text-xs text-slate-500">
          {viewTabs.find((tab) => tab.id === view)?.helper}
        </p>
      </div>

      {view === "staff" && (
        <section className="space-y-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
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
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                <span>Sorted by revenue</span>
                <span className="font-semibold text-slate-900">
                  {filteredStaff.length}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => openStaffModal("add")}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-200 transition hover:bg-slate-800"
              >
                + Add staff
              </button>
            </div>
          </div>

          {resetMessage && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resetMessage}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.3em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3">Assigned tables</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {pagedStaff.map((member) => {
                  const tablesForMember = tables.filter(
                    (table) => table.waiterId === member.id,
                  );
                  return (
                    <tr key={member.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {member.name}
                      </td>
                      <td className="px-4 py-3 capitalize">{member.role}</td>
                      <td className="px-4 py-3">{currency(member.revenue)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {tablesForMember.length ? (
                            tablesForMember.map((table) => (
                              <span
                                key={table.id}
                                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600"
                              >
                                Table {table.tableNumber}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                              none
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "rounded-full px-2 py-1 text-[11px] font-semibold",
                            member.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {member.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="flex flex-wrap gap-2 px-4 py-3">
                        <button
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                          onClick={() => openStaffModal("edit", member)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                          onClick={() => openAssignModal(member)}
                          type="button"
                        >
                          Assign tables
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing page {page} of {totalPages}
            </p>
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
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {view === "tables" && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTableModalOpen(true)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-200 transition hover:bg-slate-800"
              >
                + Add table
              </button>
              <button
                type="button"
                onClick={() => showTableMessage("Floor refreshed")}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Refresh
              </button>
            </div>
          </div>

          {tableMessage && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {tableMessage}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedTables.map((table) => {
              const assignedWaiter = waiterOptions.find(
                (member) => member.id === table.waiterId,
              );
              const statusClass =
                tableStatusColorMap[table.status] ?? "text-slate-500";

              return (
                <article
                  key={table.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Table {table.tableNumber}
                      </p>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {table.section}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${statusClass}`}
                    >
                      {tableStatusLabels[table.status] ?? table.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {table.capacity} seats •{" "}
                    {table.reserved ? "Reserved" : "Open"}
                  </p>
                  {assignedWaiter ? (
                    <p className="mt-3 text-sm text-slate-700">
                      Assigned to {assignedWaiter.name}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No waiter assigned
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2 text-xs">
                    <label className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-500">
                        Waiting staff
                      </span>
                      <select
                        className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                        value={table.waiterId ?? ""}
                        onChange={(event) =>
                          handleWaiterAssignment(
                            table,
                            event.target.value || null,
                          )
                        }
                      >
                        <option value="">Unassigned</option>
                        {waiterOptions.map((waiter) => (
                          <option key={waiter.id} value={waiter.id}>
                            {waiter.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {assignedWaiter && (
                      <button
                        type="button"
                        className="rounded-2xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                        onClick={() => handleWaiterAssignment(table, null)}
                      >
                        Remove assignment
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {staffModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {modalMode === "add" ? "Add staff" : "Edit staff"}
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {modalMode === "add"
                    ? "Invite a teammate"
                    : `Edit ${activeStaff?.name}`}
                </h2>
              </div>
              <button
                onClick={closeStaffModal}
                type="button"
                className="text-slate-500 transition hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <form
              className="grid gap-4 lg:grid-cols-2"
              onSubmit={handleStaffSubmit}
            >
              <label className="space-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Name
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={staffForm.name}
                  onChange={(event) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Email
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  type="email"
                  value={staffForm.email}
                  onChange={(event) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Role
                </span>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={staffForm.role}
                  onChange={(event) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      role: event.target.value as StaffMember["role"],
                    }))
                  }
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
              </label>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    Assign tables
                  </p>
                  <p className="text-xs text-slate-400">
                    {staffForm.selectedTables.length} selected
                  </p>
                </div>
                <TableSelectionGrid
                  tables={assignableTablesForForm}
                  selectedIds={staffForm.selectedTables}
                  onToggle={toggleTableSelection}
                />
              </div>
              <div className="flex justify-end gap-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={closeStaffModal}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  {modalMode === "add" ? "Invite staff" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignModalOpen && assignTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Assign tables
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {assignTarget.name}
                </h2>
              </div>
              <button
                onClick={closeAssignModal}
                type="button"
                className="text-slate-500 transition hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Tables assigned
                </p>
                <p className="text-xs text-slate-400">
                  {assignSelection.length} connected
                </p>
              </div>
              <TableSelectionGrid
                tables={assignableTablesForAssignModal}
                selectedIds={assignSelection}
                onToggle={toggleAssignSelection}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAssignModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Save tables
              </button>
            </div>
          </div>
        </div>
      )}

      {tableModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Add table
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  New seating
                </h2>
              </div>
              <button
                onClick={() => {
                  setTableModalOpen(false);
                  setTableForm({ ...defaultTableForm });
                }}
                type="button"
                className="text-slate-500 transition hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleTableSubmit}>
              <label className="space-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Section
                </span>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={tableForm.section}
                  onChange={(event) =>
                    setTableForm((prev) => ({
                      ...prev,
                      section: event.target.value as TableModel["section"],
                    }))
                  }
                >
                  {sectionOptions.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs">
                <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Capacity
                </span>
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={tableForm.capacity}
                  onChange={(event) =>
                    setTableForm((prev) => ({
                      ...prev,
                      capacity: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={tableForm.reserved}
                  onChange={(event) =>
                    setTableForm((prev) => ({
                      ...prev,
                      reserved: event.target.checked,
                    }))
                  }
                />
                Reserved table
              </label>
              {tableForm.reserved && (
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Reserved for
                    </span>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={tableForm.reservedFor}
                      onChange={(event) =>
                        setTableForm((prev) => ({
                          ...prev,
                          reservedFor: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="font-semibold uppercase tracking-[0.3em] text-slate-500">
                      Reservation time
                    </span>
                    <input
                      type="time"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={tableForm.reservationTime}
                      onChange={(event) =>
                        setTableForm((prev) => ({
                          ...prev,
                          reservationTime: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTableModalOpen(false);
                    setTableForm({ ...defaultTableForm });
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Create table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
