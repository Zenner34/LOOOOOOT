import { TableSkeleton } from "@/app/components/Skeleton";

// One-line helper for loading.tsx files. Picks the right shape from a
// small set of variants so each route's loading file is one expression.
export function PageSkeleton({ variant = "table" }: { variant?: "table" | "grid" | "detail" }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-48 rounded bg-white/[0.04] animate-pulse" />
      </div>
      {variant === "table" && (
        <div className="panel overflow-hidden">
          <TableSkeleton rows={8} cols={5} />
        </div>
      )}
      {variant === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-4 space-y-3">
              <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-48 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      )}
      {variant === "detail" && (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <div className="panel p-4 space-y-3">
            <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-full rounded-md bg-white/[0.04] animate-pulse" />
            ))}
          </div>
          <div className="panel p-4 space-y-3">
            <div className="h-5 w-44 rounded bg-white/[0.04] animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
