"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Select } from "@/app/components/Select";
import { ArrowUpRight, List } from "@/app/components/ui/Icon";

type Sort = "nameAsc" | "nameDesc" | "membersDesc" | "nightsDesc" | "awardsDesc";

type RosterRow = {
  id: number;
  name: string;
  description: string | null;
  _count: { members: number; raidNights: number; awards: number };
};

export default function RostersClient({ initial, admin: _admin }: { initial: RosterRow[]; admin: boolean }) {
  const [sort, setSort] = useState<Sort>("nameAsc");
  const rosters = useMemo(() => {
    const out = [...initial];
    out.sort((a, b) => {
      if (sort === "nameAsc")     return a.name.localeCompare(b.name);
      if (sort === "nameDesc")    return b.name.localeCompare(a.name);
      if (sort === "membersDesc") return (b._count.members - a._count.members) || a.name.localeCompare(b.name);
      if (sort === "nightsDesc")  return (b._count.raidNights - a._count.raidNights) || a.name.localeCompare(b.name);
      return (b._count.awards - a._count.awards) || a.name.localeCompare(b.name);
    });
    return out;
  }, [initial, sort]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Roster"
        title="Rosters"
        subtitle="The Master Roster is the canonical raid team — older rosters are kept for historical loot context."
      />

      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-neutral-500">Sort</label>
        <div className="w-56">
          <Select
            value={sort}
            onValueChange={v => setSort(v as Sort)}
            options={[
              { value: "nameAsc",     label: "Name A → Z" },
              { value: "nameDesc",    label: "Name Z → A" },
              { value: "membersDesc", label: "Most members" },
              { value: "nightsDesc",  label: "Most raid nights" },
              { value: "awardsDesc",  label: "Most awards" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rosters.map((r, i) => (
          <Link
            key={r.id}
            href={`/rosters/${r.id}`}
            style={{ animationDelay: `${Math.min(i, 11) * 40}ms` }}
            className="panel p-5 group hoverable animate-fade-in-up hover:border-vermillion-500/40 hover:shadow-[0_8px_24px_-12px_rgba(200,16,46,0.35)] transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-vermillion-200 truncate">{r.name}</h2>
              <ArrowUpRight size={16} className="text-neutral-600 group-hover:text-neutral-200 transition flex-shrink-0" />
            </div>
            {r.description && <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">{r.description}</p>}
            <div className="mt-4 flex gap-4 text-xs text-neutral-400">
              <span><span className="tabular-nums text-neutral-200 font-semibold">{r._count.members}</span> members</span>
              <span><span className="tabular-nums text-neutral-200 font-semibold">{r._count.raidNights}</span> nights</span>
              <span><span className="tabular-nums text-neutral-200 font-semibold">{r._count.awards}</span> awards</span>
            </div>
          </Link>
        ))}
        {rosters.length === 0 && (
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
