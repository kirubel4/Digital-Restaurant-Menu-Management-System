"use client";

import clsx from "clsx";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Gauge,
  History,
  ListChecks,
  Package,
  Settings,
  Table,
  Users,
  Wallet,
} from "lucide-react";
import {
  roleFromPath,
  roleTitle,
  useDashboardStore,
} from "@/lib/dashboard-store";
import type { UserRole } from "@/types/dashboard";

type LinkItem = { href: string; label: string; Icon: LucideIcon };

const roleLinks: Record<UserRole, LinkItem[]> = {
  manager: [
    { href: "/manager", label: "Dashboard", Icon: BarChart3 },
    { href: "/manager/staff", label: "Staff Management", Icon: Users },
    { href: "/manager/menu", label: "Menu Management", Icon: ListChecks },
    { href: "/manager/orders", label: "Orders & Transactions", Icon: Package },
    { href: "/manager/settings", label: "Settings", Icon: Settings },
  ],
  waiter: [
    { href: "/waiter", label: "Dashboard", Icon: Gauge },
    { href: "/waiter/tables", label: "Tables", Icon: Table },
    { href: "/waiter/orders", label: "Orders", Icon: ClipboardList },
    {
      href: "/waiter/payments",
      label: "Payment Transactions",
      Icon: CreditCard,
    },
    { href: "/waiter/settings", label: "Settings", Icon: Settings },
  ],
  chef: [
    { href: "/chef/liveKDS", label: "Live KDS", Icon: Activity },
    { href: "/chef/accepted", label: "Accepted Orders", Icon: ClipboardList },
    {
      href: "/chef/menu-availability",
      label: "Menu Availability",
      Icon: ListChecks,
    },
    { href: "/chef/history", label: "Preparation History", Icon: History },
    { href: "/chef/settings", label: "Settings", Icon: Settings },
  ],
  cashier: [
    { href: "/cashier", label: "Payments", Icon: Wallet },
    { href: "/cashier/finalized", label: "Finalized", Icon: CreditCard },
    { href: "/cashier/settings", label: "Settings", Icon: Settings },
  ],
};

const STORAGE_KEY = "dashboard-sidebar-collapsed";
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 250;

type SidebarProps = {
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const activeRole = roleFromPath(pathname);
  const setCurrentRole = useDashboardStore((state) => state.setCurrentRole);
  const displayMode = useDashboardStore(
    (state) => state.chefSettings.displayMode,
  );
  const isDarkMode = displayMode === "dark";
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const body = document.body;
    const originalOverflow = body.style.overflow;
    if (mobileOpen) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = originalOverflow;
    }
    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setCurrentRole(activeRole);
  }, [activeRole, setCurrentRole]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, isCollapsed ? "true" : "false");
  }, [isCollapsed]);

  const navLinks = useMemo(() => roleLinks[activeRole], [activeRole]);
  const bgClasses = isDarkMode
    ? "border-slate-800 bg-slate-900/80 text-slate-100"
    : "border-slate-200 bg-white/80 text-slate-900";
  const textColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const tooltipClasses = isDarkMode
    ? "border-slate-700 bg-slate-900 text-slate-100"
    : "border-slate-200 bg-white text-slate-900";
  const widthStyle = {
    width: `${isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`,
    minWidth: `${isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}px`,
  };
  const navLabel = `${roleTitle(activeRole)} navigation`;
  const mobileNavLabel = `${roleTitle(activeRole)} mobile navigation`;

  return (
    <>
      <aside
        className={clsx(
          "hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-56px)] border-r p-4 backdrop-blur transition-[width] duration-200 ease-in-out overflow-y-visible",
          bgClasses,
        )}
        style={{
          ...widthStyle,
          top: "56px",
          position: "sticky",
          maxHeight: "calc(100vh - 56px)",
        }}
      >
        <div
          className={clsx(
            "mb-6 flex items-center transition-opacity duration-200",
            isCollapsed ? "justify-center gap-0" : "justify-between",
          )}
        >
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${textColor}`}
                >
                  Role dashboard
                </p>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}
                >
                  {roleTitle(activeRole)}
                </h2>
              </div>
            )}
          </div>
          <button
            className="rounded-full border border-slate-200/80 p-1 text-slate-600 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            onClick={() => setIsCollapsed((prev) => !prev)}
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        <nav className="flex flex-col gap-2" aria-label={navLabel}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkColors = isActive
              ? "bg-slate-900 text-white"
              : isDarkMode
                ? "text-slate-200 hover:bg-slate-800"
                : "text-slate-700 hover:bg-slate-100";
            const tooltipId = `sidebar-tooltip-${link.href.replace(/[^a-zA-Z0-9]/g, "-")}`;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group relative flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
                  isCollapsed ? "justify-center gap-0" : "gap-3",
                  linkColors,
                )}
                aria-label={link.label}
                aria-current={isActive ? "page" : undefined}
                aria-describedby={isCollapsed ? tooltipId : undefined}
              >
                <link.Icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                {!isCollapsed && link.label}
                {isCollapsed && (
                  <span
                    id={tooltipId}
                    role="tooltip"
                    className={clsx(
                      "pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 rounded-md border px-2 py-1 text-xs font-semibold shadow-lg transition-opacity duration-150",
                      tooltipClasses,
                      "group-hover:block group-focus-visible:block",
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={`mt-6 border-t pt-4 text-xs ${textColor}`}></div>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div
            className={clsx(
              "relative flex h-full flex-col gap-4 border-r bg-white/90 p-4 shadow-lg backdrop-blur",
              bgClasses,
            )}
            style={{ width: "240px" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Menu
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                type="button"
                className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-2" aria-label={mobileNavLabel}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const linkColors = isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
                      linkColors,
                    )}
                    aria-label={link.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <link.Icon
                      className="h-5 w-5 flex-shrink-0 text-slate-600"
                      aria-hidden
                    />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
