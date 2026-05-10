import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

// Standard empty-state slot for "no data" moments. Every plain-text
// "No X yet" string in the app should be replaced with one of these.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "compact";
}) {
  const padding = variant === "compact" ? "px-4 py-8" : "px-6 py-14";
  const iconSize = variant === "compact" ? 20 : 28;
  return (
    <div className={`panel ${padding} flex flex-col items-center text-center gap-3 animate-fade-in`}>
      {Icon && (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-vermillion-500/10 ring-1 ring-vermillion-500/20 text-vermillion-300">
          <Icon size={iconSize} />
        </span>
      )}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-neutral-100">{title}</div>
        {description && <div className="text-xs text-neutral-500 max-w-sm leading-relaxed">{description}</div>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
