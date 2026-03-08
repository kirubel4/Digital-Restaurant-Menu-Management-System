"use client";

import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useDashboardStore } from "@/lib/dashboard-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const chefSettings = useDashboardStore((state) => state.chefSettings);
  const isDarkMode = chefSettings.displayMode === "dark";

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } ${chefSettings.largeTextMode ? "text-lg" : ""}`}
    >
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
