import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: ReactNode;
};

export default function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
      </div>
      <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">{icon}</div>
    </div>
  );
}
