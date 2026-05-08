import { Skeleton } from "@/app/components/Skeleton";

export default function PlayersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">Roster</div>
        <h1 className="text-2xl font-bold tracking-tight">Players</h1>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel p-4 space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
