export default function PlayerDetailLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-48 rounded bg-white/[0.04] animate-pulse" />
        <div className="mt-3 grid grid-cols-2 sm:flex gap-2 sm:gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="panel-elev px-3 py-2 min-w-[120px]">
              <div className="h-2 w-12 rounded bg-white/[0.04] animate-pulse mb-1.5" />
              <div className="h-6 w-16 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="panel p-4">
            <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse mb-3" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 w-full rounded-md bg-white/[0.04] animate-pulse mb-1.5" />
            ))}
          </div>
          <div className="panel p-4">
            <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-3" />
            <div className="h-3 w-full rounded bg-white/[0.04] animate-pulse mb-1.5" />
            <div className="h-3 w-2/3 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 panel">
          <div className="px-4 py-3 border-b border-white/5">
            <div className="h-3 w-32 rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="divide-y divide-white/5">
            {Array.from({ length: 4 }).map((_, g) => (
              <div key={g} className="px-4 py-3">
                <div className="h-4 w-44 rounded bg-white/[0.04] animate-pulse mb-3" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 w-full rounded bg-white/[0.04] animate-pulse mb-1.5" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
