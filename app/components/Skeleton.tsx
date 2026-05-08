// Tiny skeleton primitive. Compose with width/height utility classes.
// Examples:
//   <Skeleton className="h-4 w-32" />
//   <Skeleton className="h-8 w-full" rounded="lg" />

export function Skeleton({
  className = "",
  rounded = "md",
}: { className?: string; rounded?: "sm" | "md" | "lg" | "full" }) {
  const r = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];
  return (
    <span
      aria-hidden
      className={`inline-block animate-pulse bg-gradient-to-r from-white/[0.04] via-vermillion-500/10 to-white/[0.04] ${r} ${className}`}
    />
  );
}

// Pre-baked row skeleton for tables, since most loading states are tabular.
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><Skeleton className="h-3 w-20" /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}><Skeleton className={`h-4 ${c === 0 ? "w-32" : "w-16"}`} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
