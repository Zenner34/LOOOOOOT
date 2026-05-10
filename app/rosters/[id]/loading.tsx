export default function RosterDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-56 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-72 rounded bg-white/[0.04] animate-pulse mt-2" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {(["Tanks", "Healers", "DPS"] as const).map(label => (
          <div key={label} className="panel p-3 space-y-2">
            <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <div className="h-4 w-4 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-4 flex-1 rounded bg-white/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
