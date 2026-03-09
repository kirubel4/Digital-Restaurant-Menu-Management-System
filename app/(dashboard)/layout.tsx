"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useDashboardStore } from "@/lib/dashboard-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const chefSettings = useDashboardStore((state) => state.chefSettings);
  const isDarkMode = chefSettings.displayMode === "dark";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } ${chefSettings.largeTextMode ? "text-lg" : ""}`}
    >
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
      <div className="flex min-h-[calc(100vh-56px)]">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 max-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
