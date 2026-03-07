"use client";

import { usePathname } from "next/navigation";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { roleFromPath, roleTitle, useDashboardStore } from "@/lib/dashboard-store";

export default function Topbar() {
  const pathname = usePathname();
  const role = roleFromPath(pathname);
  const unread = useDashboardStore(
    (state) => state.notifications.filter((item) => item.targetRole === role && !item.read).length,
  );

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{roleTitle(role)} Dashboard</h1>
        <p className="text-xs text-slate-500">Digital Restaurant Menu & Management System</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{unread} alerts</span>
        <RoleSwitcher />
      </div>
    </header>
  );
}
