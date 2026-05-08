import { TableSkeleton, Skeleton } from "@/app/components/Skeleton";

export default function LootLoading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">Browse</div>
        <h1 className="text-2xl font-bold tracking-tight">Loot catalog</h1>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-4 panel p-3 space-y-2">
          <Skeleton className="h-10 w-full" rounded="lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32 ml-3" />
            </div>
          ))}
        </aside>
        <section className="col-span-12 lg:col-span-8 panel">
          <div className="px-4 py-3 border-b border-white/5"><Skeleton className="h-9 w-full" /></div>
          <TableSkeleton rows={8} cols={4} />
        </section>
      </div>
    </div>
  );
}
