import { TableSkeleton } from "@/app/components/Skeleton";

export default function OverviewLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">Roster</div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="h-10 w-48 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-10 w-56 rounded-lg bg-white/5 animate-pulse" />
        <div className="flex-1" />
        <div className="h-10 w-44 rounded-lg bg-white/5 animate-pulse" />
      </div>
      <div className="flex gap-1 border-b border-white/[0.06]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-t-md bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="panel overflow-hidden">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
