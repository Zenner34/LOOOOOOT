export default function AttendanceLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-44 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="panel p-4">
        <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-9 w-full max-w-md rounded-lg bg-white/[0.04] animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="panel p-3 flex items-center gap-3">
            <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-3 w-32 rounded bg-white/[0.04] animate-pulse" />
            <div className="ml-auto h-3 w-16 rounded bg-white/[0.04] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
