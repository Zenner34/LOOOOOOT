import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { Trend } from "./Trend";

// Standardized stat tile. Replaces the inline stat tiles on / and /overview.
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: ReactNode;
  value: ReactNode;
  delta?: number;
  hint?: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "gold" | "vermillion";
}) {
  const valueClass =
    tone === "gold" ? "text-gold-200" :
    tone === "vermillion" ? "text-vermillion-200" :
    "text-neutral-100";
  return (
    <div className="panel-elev px-4 py-3.5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="eyebrow truncate">{label}</div>
        {Icon && <Icon size={14} className="text-neutral-500 flex-shrink-0" />}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums truncate ${valueClass}`}>{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 min-h-[16px]">
        {typeof delta === "number" && <Trend delta={delta} />}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  );
}
