"use client";

import { usePathname } from "next/navigation";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { roleFromPath, roleTitle, useDashboardStore } from "@/lib/dashboard-store";

export default function Topbar() {
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  const displayMode = useDashboardStore((state) => state.chefSettings.displayMode);
  const unread = useDashboardStore(
    (state) => state.notifications.filter((item) => item.targetRole === role && !item.read).length,
  );
  const isDarkMode = displayMode === "dark";

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between border-b px-6 py-3 backdrop-blur ${
        isDarkMode ? "border-slate-800 bg-slate-900/90" : "border-slate-200 bg-white/90"
      }`}
    >
      <div>
        <h1 className={`text-lg font-bold ${isDarkMode ? "text-slate-50" : "text-slate-900"}`}>
          {roleTitle(role)} Dashboard
        </h1>
        <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          Digital Restaurant Menu & Management System
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            isDarkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
          }`}
        >
          {unread} alerts
        </span>
        <RoleSwitcher />
      </div>
    </header>
  );
}
