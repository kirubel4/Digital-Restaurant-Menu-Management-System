import { ReactNode } from "react";

type TabsProps = {
  label: string;
  children: ReactNode;
};

export default function Tabs({ label, children }: TabsProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">{label}</h3>
      {children}
    </section>
  );
}
