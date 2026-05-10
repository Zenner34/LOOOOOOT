export default function RostersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-40 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel p-4 space-y-3">
            <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-48 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
