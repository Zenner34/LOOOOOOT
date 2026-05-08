"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASS_COLOR, BUCKETS, BUCKET_LABEL, bucketForSpec, type Bucket } from "@/lib/specs";
import { weightedScore, itemCount, weightFor, type ScoringAward } from "@/lib/scoring";
import { WowheadLink } from "@/lib/wowhead";

type Character = { id: number; name: string; class: string; spec: string; role: string };
type Award = ScoringAward & {
  id: number;
  awardedAt: string | Date;
  characterId: number;
  character: Character;
  roster: { id: number; name: string };
  item: ScoringAward["item"] & { boss: { name: string; raid: { shortName: string; name: string } } };
};

const EMPTY_LABEL: Record<Bucket, string> = {
  all:    "characters",
  tank:   "tanks",
  heal:   "healers",
  melee:  "melee dps",
  caster: "caster dps",
};

export default function OverviewClient({
  rosters,
  selectedRosterId,
  characters,
  awards,
}: {
  rosters: Array<{ id: number; name: string }>;
  selectedRosterId: number | "all";
  characters: Character[];
  awards: Award[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const initialBucket = ((params.get("bucket") as Bucket) ?? "all");
  const [tab, setTab] = useState<Bucket>(BUCKETS.includes(initialBucket) ? initialBucket : "all");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<"score" | "count" | "name">("score");

  function setRoster(v: string) {
    const sp = new URLSearchParams(params);
    sp.set("roster", v);
    sp.set("bucket", tab);
    router.push(`/overview?${sp.toString()}`);
  }
  function setTabAndUrl(t: Bucket) {
    setTab(t);
    const sp = new URLSearchParams(params);
    sp.set("bucket", t);
    router.replace(`/overview?${sp.toString()}`);
  }

  const awardsByChar = useMemo(() => {
    const m = new Map<number, Award[]>();
    for (const a of awards) {
      const arr = m.get(a.characterId) ?? [];
      arr.push(a);
      m.set(a.characterId, arr);
    }
    return m;
  }, [awards]);

  // Per-bucket counts shown next to each tab.
  const bucketCounts = useMemo(() => {
    const counts: Record<Bucket, number> = { all: characters.length, tank: 0, heal: 0, melee: 0, caster: 0 };
    for (const c of characters) {
      const b = bucketForSpec(c.spec);
      if (b) counts[b]++;
    }
    return counts;
  }, [characters]);

  const rows = useMemo(() => {
    return characters
      .filter(c => {
        if (tab === "all") return true;
        return bucketForSpec(c.spec) === tab;
      })
      .map(c => {
        const mine = awardsByChar.get(c.id) ?? [];
        return {
          character: c,
          count: itemCount(mine),
          score: weightedScore(c.spec, mine),
          last: mine[0],
          awards: mine,
        };
      })
      .sort((a, b) => {
        if (sort === "count") return b.count - a.count || a.character.name.localeCompare(b.character.name);
        if (sort === "name")  return a.character.name.localeCompare(b.character.name);
        return b.score - a.score || b.count - a.count || a.character.name.localeCompare(b.character.name);
      });
  }, [characters, tab, awardsByChar, sort]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <span className="heading-eyebrow">Roster</span>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Roster</label>
          <select
            className="input"
            value={String(selectedRosterId)}
            onChange={e => setRoster(e.target.value)}
          >
            {rosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            <option value="all">All rosters (merged)</option>
          </select>
        </div>
        <div className="flex-1" />
        <div>
          <label className="label">Sort</label>
          <select className="input" value={sort} onChange={e => setSort(e.target.value as any)}>
            <option value="score">Weighted score</option>
            <option value="count">Items received</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] overflow-x-auto">
        {BUCKETS.map(b => (
          <button
            key={b}
            onClick={() => setTabAndUrl(b)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition flex items-center gap-2 ${
              tab === b ? "border-vermillion-500 text-vermillion-200" : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            {BUCKET_LABEL[b]}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tab === b ? "bg-vermillion-500/15 text-vermillion-200" : "bg-white/5 text-neutral-400"}`}>
              {bucketCounts[b]}
            </span>
          </button>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Character</th>
              <th>Spec</th>
              <th className="text-right">Items</th>
              <th className="text-right">Weighted score</th>
              <th>Last item</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const isOpen = expanded[r.character.id] ?? false;
              return (
                <Fragment key={r.character.id}>
                  <tr>
                    <td className="font-medium" style={{ color: CLASS_COLOR[r.character.class] ?? "#fff" }}>
                      {r.character.name}
                    </td>
                    <td className="text-neutral-300">{r.character.spec}</td>
                    <td className="text-right tabular-nums">{r.count}</td>
                    <td className="text-right tabular-nums text-gold-200 font-semibold">{r.score.toFixed(2)}</td>
                    <td className="text-neutral-400 text-xs">
                      {r.last ? (
                        <>
                          <WowheadLink name={r.last.item.name} wowheadId={r.last.item.wowheadId} />
                          <span className="text-neutral-600"> ({r.last.item.boss.raid.shortName})</span>
                        </>
                      ) : "—"}
                    </td>
                    <td className="text-right">
                      {r.awards.length > 0 && (
                        <button
                          className="text-xs text-neutral-400 hover:text-white"
                          onClick={() => setExpanded(s => ({ ...s, [r.character.id]: !isOpen }))}
                        >{isOpen ? "hide" : "show"} items</button>
                      )}
                    </td>
                  </tr>
                  {isOpen && r.awards.length > 0 && (
                    <tr>
                      <td colSpan={6} className="bg-black/30">
                        <table className="table">
                          <thead>
                            <tr><th>Item</th><th>Boss</th><th>Raid</th><th className="text-right">Weight (for spec)</th><th>Date</th></tr>
                          </thead>
                          <tbody>
                            {r.awards.map(a => (
                              <tr key={a.id}>
                                <td><WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} /></td>
                                <td className="text-neutral-400">{a.item.boss.name}</td>
                                <td className="text-neutral-500">{a.item.boss.raid.shortName}</td>
                                <td className="text-right tabular-nums text-gold-200">{weightFor(a, r.character.spec).toFixed(2)}</td>
                                <td className="text-neutral-500 text-xs">{new Date(a.awardedAt).toISOString().slice(0, 10)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-neutral-500">No {EMPTY_LABEL[tab]} in this roster yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
