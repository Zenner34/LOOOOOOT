"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASS_COLOR } from "@/lib/specs";
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
  const [tab, setTab] = useState<"tank" | "heal" | "dps">((params.get("role") as any) ?? "tank");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<"score" | "count" | "name">("score");

  function setRoster(v: string) {
    const sp = new URLSearchParams(params);
    sp.set("roster", v);
    sp.set("role", tab);
    router.push(`/overview?${sp.toString()}`);
  }
  function setTabAndUrl(t: "tank" | "heal" | "dps") {
    setTab(t);
    const sp = new URLSearchParams(params);
    sp.set("role", t);
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

  const rows = useMemo(() => {
    return characters
      .filter(c => c.role === tab)
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
    <div className="space-y-4">
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

      <div className="flex gap-2 border-b border-neutral-800">
        {[
          { k: "tank", label: "Tanks" },
          { k: "heal", label: "Healers" },
          { k: "dps",  label: "DPS" },
        ].map(t => (
          <button
            key={t.k}
            onClick={() => setTabAndUrl(t.k as any)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${
              tab === t.k ? "border-amber-400 text-amber-300" : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >{t.label}</button>
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
                <>
                  <tr key={r.character.id}>
                    <td className="font-medium" style={{ color: CLASS_COLOR[r.character.class] ?? "#fff" }}>
                      {r.character.name}
                    </td>
                    <td className="text-neutral-300">{r.character.spec}</td>
                    <td className="text-right tabular-nums">{r.count}</td>
                    <td className="text-right tabular-nums text-amber-300">{r.score.toFixed(2)}</td>
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
                    <tr key={`${r.character.id}-x`}>
                      <td colSpan={6} className="bg-neutral-950">
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
                                <td className="text-right tabular-nums text-amber-300">{weightFor(a, r.character.spec).toFixed(2)}</td>
                                <td className="text-neutral-500 text-xs">{new Date(a.awardedAt).toISOString().slice(0, 10)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-neutral-500">No {tab === "heal" ? "healers" : tab === "tank" ? "tanks" : "dps"} in this roster yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
