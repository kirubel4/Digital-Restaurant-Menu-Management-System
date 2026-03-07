"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const roles = [
  { label: "Manager", href: "/manager" },
  { label: "Waiter", href: "/waiter" },
  { label: "Chef", href: "/chef" },
  { label: "Cashier", href: "/cashier" },
];

export default function RoleSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {roles.map((role) => {
        const active = pathname.startsWith(role.href);
        return (
          <Link
            className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
              active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
            href={role.href}
            key={role.href}
          >
            {role.label}
          </Link>
        );
      })}
    </div>
  );
}
