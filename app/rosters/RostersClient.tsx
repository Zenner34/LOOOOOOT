"use client";

import Link from "next/link";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { List } from "@/app/components/ui/Icon";

type RosterRow = {
  id: number;
  name: string;
  description: string | null;
  _count: { members: number; raidNights: number; awards: number };
};

export default function RostersClient({ initial, admin: _admin }: { initial: RosterRow[]; admin: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <span className="heading-eyebrow">Roster</span>
        <h1 className="text-2xl font-bold tracking-tight">Rosters</h1>
        <p className="text-sm text-neutral-400 mt-1">
          You have multiple rosters from earlier setups. The Master Roster is the canonical one going forward.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {initial.map(r => (
          <Link key={r.id} href={`/rosters/${r.id}`} className="panel p-4 hover:border-vermillion-500/60 transition-colors">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-vermillion-200">{r.name}</h2>
              <span className="text-xs text-neutral-500">#{r.id}</span>
            </div>
            {r.description && <p className="text-sm text-neutral-400 mt-1">{r.description}</p>}
            <div className="mt-3 flex gap-3 text-xs text-neutral-400">
              <span>{r._count.members} members</span>
              <span>{r._count.raidNights} nights</span>
              <span>{r._count.awards} awards</span>
            </div>
          </Link>
        ))}
        {initial.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon={List}
              title="No rosters yet"
              description="Create one to start tracking attendance and loot per raid team."
            />
          </div>
        )}
      </div>
    </div>
  );
}
