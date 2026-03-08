"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleFromPath, roleTitle, useDashboardStore } from "@/lib/dashboard-store";
import type { UserRole } from "@/types/dashboard";

const roleLinks: Record<UserRole, { href: string; label: string }[]> = {
  manager: [
    { href: "/manager", label: "Analytics" },
    { href: "/manager/staff", label: "Staff Management" },
    { href: "/manager/menu", label: "Menu Management" },
    { href: "/manager/orders", label: "Orders" },
    { href: "/manager/settings", label: "Settings" },
  ],
  waiter: [
    { href: "/waiter", label: "Dashboard" },
    { href: "/waiter/tables", label: "Tables" },
    { href: "/waiter/orders", label: "Orders" },
    { href: "/waiter/payments", label: "Payment Transactions" },
    { href: "/waiter/settings", label: "Settings" },
  ],
  chef: [
    { href: "/chef", label: "Live Orders" },
    { href: "/chef/menu-availability", label: "Menu Availability" },
    { href: "/chef/history", label: "Preparation History" },
    { href: "/chef/settings", label: "Settings" },
  ],
  cashier: [
    { href: "/cashier", label: "Payments" },
    { href: "/cashier/settings", label: "Settings" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const activeRole = roleFromPath(pathname);
  const setCurrentRole = useDashboardStore((state) => state.setCurrentRole);
  const displayMode = useDashboardStore((state) => state.chefSettings.displayMode);
  const isDarkMode = displayMode === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCurrentRole(activeRole);
  }, [activeRole, setCurrentRole]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const bgClasses = isDarkMode ? "border-slate-800 bg-slate-900/80 text-slate-100" : "border-slate-200 bg-white/80 text-slate-900";
  const textColor = isDarkMode ? "text-slate-400" : "text-slate-500";

  return (
    <>
      <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Navigation</p>
          <button
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
            onClick={() => setMobileOpen(true)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 max-w-xs border-r p-4 backdrop-blur transition-transform duration-200 md:static md:block md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${bgClasses}`}
      >
        <div className="mb-4 flex items-center justify-between md:justify-start">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${textColor}`}>Role dashboard</p>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>
              {roleTitle(activeRole)}
            </h2>
          </div>
          <button
            className="md:hidden rounded-full border border-slate-200 px-2 py-1 text-xs"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            Close
          </button>
        </div>
        <nav className="space-y-2">
          {roleLinks[activeRole].map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : isDarkMode
                      ? "text-slate-200 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className={`mt-8 border-t pt-4 text-xs ${textColor}`}>
          Switch role from top bar.
        </div>
      </aside>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
        />
      )}
    </>
  );
}
