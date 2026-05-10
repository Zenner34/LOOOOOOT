export default function LootAssignLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-48 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="panel p-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px]">
          <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-1.5" />
          <div className="h-9 w-full rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <div className="min-w-[180px]">
          <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-1.5" />
          <div className="h-9 w-full rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel p-3 space-y-3">
            <div className="h-4 w-44 rounded bg-white/[0.04] animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="h-8 flex-1 rounded-lg bg-white/[0.04] animate-pulse" />
              <div className="h-8 w-20 rounded-lg bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
