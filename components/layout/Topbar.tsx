"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import RoleSwitcher from "@/components/layout/RoleSwitcher";
import { roleFromPath, roleTitle, useDashboardStore } from "@/lib/dashboard-store";

type TopbarProps = {
  onOpenMobileMenu: () => void;
};

export default function Topbar({ onOpenMobileMenu }: TopbarProps) {
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
      <div className="flex items-center gap-3">
        <button
          className="md:hidden rounded-md border border-slate-200/80 p-2 text-slate-600 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
          aria-label="Open navigation menu"
          onClick={onOpenMobileMenu}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className={`text-lg font-bold ${isDarkMode ? "text-slate-50" : "text-slate-900"}`}>
            {roleTitle(role)}
          </h1>
          
        </div>
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
