import { ReactNode } from "react";

type DialogProps = {
  title: string;
  children: ReactNode;
};

export default function Dialog({ title, children }: DialogProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2 font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
