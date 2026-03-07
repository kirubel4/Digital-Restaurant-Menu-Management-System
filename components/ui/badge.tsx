import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className = "" }: BadgeProps) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}
