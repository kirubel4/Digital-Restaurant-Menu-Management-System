import { readableStatus } from "@/lib/dashboard-store";

type StatusBadgeProps = {
  label: string;
  className: string;
};

export default function StatusBadge({ label, className }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold capitalize ${className}`}>
      {readableStatus(label)}
    </span>
  );
}
