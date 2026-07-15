import { cn } from "../lib/utils";

const statusStyles = {
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-slate-100 text-slate-700",
};

const StatusBadge = ({ status, className }) => {
  const style = statusStyles[status] || "bg-slate-100 text-slate-700";
  const label = status ? status.replace("_", " ") : "UNKNOWN";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        style,
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
