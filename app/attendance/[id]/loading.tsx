export default function AttendanceNightLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-64 rounded bg-white/[0.04] animate-pulse" />
        <div className="h-3 w-44 rounded bg-white/[0.04] animate-pulse mt-2" />
      </div>
      <div className="md:hidden space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="panel p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
              <div className="ml-auto h-4 w-16 rounded bg-white/[0.04] animate-pulse" />
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex-1 h-9 rounded-md bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block panel overflow-hidden">
        <div className="grid grid-cols-4 px-3 py-2 border-b border-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, r) => (
          <div key={r} className="grid grid-cols-4 px-3 py-2.5 border-b border-white/[0.04]">
            {Array.from({ length: 4 }).map((_, c) => (
              <div key={c} className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
