"use client";

import { useEffect } from "react";
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
    { href: "/waiter", label: "Tables" },
    { href: "/waiter/orders", label: "Orders" },
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

  useEffect(() => {
    setCurrentRole(activeRole);
  }, [activeRole, setCurrentRole]);

  return (
    <aside className="w-72 border-r border-slate-200 bg-white/80 p-4 backdrop-blur">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Role dashboard</p>
      <h2 className="mb-5 text-xl font-bold text-slate-900">{roleTitle(activeRole)}</h2>
      <nav className="space-y-2">
        {roleLinks[activeRole].map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              href={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">Switch role from top bar.</div>
    </aside>
  );
}
