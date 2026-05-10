import { TableSkeleton } from "@/app/components/Skeleton";

export default function CharactersLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-2" />
        <div className="h-8 w-40 rounded bg-white/[0.04] animate-pulse" />
      </div>
      <div className="panel p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-1.5" />
          <div className="h-9 w-full rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <div className="min-w-[260px]">
          <div className="h-3 w-12 rounded bg-white/[0.04] animate-pulse mb-1.5" />
          <div className="h-9 w-full rounded-lg bg-white/[0.04] animate-pulse" />
        </div>
        <div className="h-9 w-16 rounded-lg bg-white/[0.04] animate-pulse" />
      </div>
      <div className="h-9 w-72 rounded-lg bg-white/[0.04] animate-pulse" />
      <div className="hidden md:block panel overflow-hidden">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
