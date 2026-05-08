"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASS_COLOR, BUCKETS, BUCKET_LABEL, bucketForSpec, type Bucket } from "@/lib/specs";
import { weightedScore, itemCount, weightFor, type ScoringAward } from "@/lib/scoring";
import { WowheadLink } from "@/lib/wowhead";

type Character = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  playerId: number | null;
  isMain: boolean;
};
type Player = { id: number; displayName: string };

type Award = ScoringAward & {
  id: number;
  awardedAt: string | Date;
  characterId: number;
  character: { id: number; name: string; class: string; spec: string; role: string };
  roster: { id: number; name: string };
  item: ScoringAward["item"] & { boss: { name: string; raid: { shortName: string; name: string } } };
};

const EMPTY_LABEL: Record<Bucket, string> = {
  all:    "raiders",
  tank:   "tanks",
  heal:   "healers",
  melee:  "melee dps",
  caster: "caster dps",
};

// Synthetic player entry for orphan characters (not bound to a Player row).
type Row = {
  key: string;
  kind: "player" | "orphan";
  displayName: string;
  characters: Character[];
  count: number;
  score: number;
  awards: Award[];
};

export default function OverviewClient({
  rosters,
  selectedRosterId,
  characters,
  players,
  awards,
}: {
  rosters: Array<{ id: number; name: string }>;
  selectedRosterId: number | "all";
  characters: Character[];
  players: Player[];
  awards: Award[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const initialBucket = ((params.get("bucket") as Bucket) ?? "all");
  const [tab, setTab] = useState<Bucket>(BUCKETS.includes(initialBucket) ? initialBucket : "all");
  const [groupBy, setGroupBy] = useState<"player" | "character">("player");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

  // Build rows. In Player mode, group characters by playerId. Orphans become
  // their own one-character "rows" (rendered with the character name as the
  // row label so it still feels seamless).
  const rows: Row[] = useMemo(() => {
    const filtered = characters.filter(c => {
      if (tab === "all") return true;
      return bucketForSpec(c.spec) === tab;
    });

    if (groupBy === "character") {
      return filtered.map(c => {
        const mine = awardsByChar.get(c.id) ?? [];
        return {
          key: `c${c.id}`,
          kind: "orphan" as const,
          displayName: c.name,
          characters: [c],
          count: itemCount(mine),
          score: weightedScore(c.spec, mine),
          awards: mine,
        };
      });
    }

    // Player mode
    const byPlayer = new Map<number, Character[]>();
    const orphans: Character[] = [];
    for (const c of filtered) {
      if (c.playerId == null) orphans.push(c);
      else {
        const arr = byPlayer.get(c.playerId) ?? [];
        arr.push(c);
        byPlayer.set(c.playerId, arr);
      }
    }

    const playerRows: Row[] = [];
    for (const p of players) {
      const chars = byPlayer.get(p.id);
      if (!chars || chars.length === 0) continue;
      let count = 0;
      let score = 0;
      const allAwards: Award[] = [];
      for (const c of chars) {
        const mine = awardsByChar.get(c.id) ?? [];
        count += itemCount(mine);
        score += weightedScore(c.spec, mine);
        for (const a of mine) allAwards.push(a);
      }
      playerRows.push({
        key: `p${p.id}`,
        kind: "player",
        displayName: p.displayName,
        characters: chars.sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.name.localeCompare(b.name)),
        count,
        score,
        awards: allAwards,
      });
    }

    const orphanRows: Row[] = orphans.map(c => {
      const mine = awardsByChar.get(c.id) ?? [];
      return {
        key: `o${c.id}`,
        kind: "orphan",
        displayName: c.name,
        characters: [c],
        count: itemCount(mine),
        score: weightedScore(c.spec, mine),
        awards: mine,
      };
    });

    return [...playerRows, ...orphanRows];
  }, [characters, players, tab, groupBy, awardsByChar]);

  const sortedRows = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      if (sort === "count") return b.count - a.count || a.displayName.localeCompare(b.displayName);
      if (sort === "name")  return a.displayName.localeCompare(b.displayName);
      return b.score - a.score || b.count - a.count || a.displayName.localeCompare(b.displayName);
    });
    return r;
  }, [rows, sort]);

  const bucketCounts = useMemo(() => {
    const counts: Record<Bucket, number> = { all: characters.length, tank: 0, heal: 0, melee: 0, caster: 0 };
    for (const c of characters) {
      const b = bucketForSpec(c.spec);
      if (b) counts[b]++;
    }
    return counts;
  }, [characters]);

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
        <div>
          <label className="label">Group by</label>
          <select
            className="input"
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as any)}
          >
            <option value="player">Player (mains + alts)</option>
            <option value="character">Character (one row each)</option>
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
              <th>{groupBy === "player" ? "Player" : "Character"}</th>
              <th>{groupBy === "player" ? "Characters" : "Spec"}</th>
              <th className="text-right">Items</th>
              <th className="text-right">Weighted score</th>
              <th>Last item</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(r => {
              const isOpen = expanded[r.key] ?? false;
              const last = r.awards[0];
              return (
                <Fragment key={r.key}>
                  <tr>
                    <td className="font-semibold">
                      {r.kind === "orphan" ? (
                        <span style={{ color: CLASS_COLOR[r.characters[0].class] ?? "#fff" }}>
                          {r.displayName}
                        </span>
                      ) : (
                        <span className="text-white">{r.displayName}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {r.characters.map(c => (
                          <span
                            key={c.id}
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${c.isMain ? "bg-gold-400/10 ring-1 ring-gold-400/25" : "bg-white/5"}`}
                            title={`${c.spec} · ${c.role}`}
                          >
                            {c.isMain && <span className="text-gold-300 text-[9px] leading-none">★</span>}
                            <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                            <span className="text-neutral-500">· {c.spec}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{r.count}</td>
                    <td className="text-right tabular-nums text-gold-200 font-semibold">{r.score.toFixed(2)}</td>
                    <td className="text-neutral-400 text-xs">
                      {last ? (
                        <>
                          <WowheadLink name={last.item.name} wowheadId={last.item.wowheadId} />
                          <span className="text-neutral-600"> ({last.item.boss.raid.shortName})</span>
                        </>
                      ) : "—"}
                    </td>
                    <td className="text-right">
                      {r.awards.length > 0 && (
                        <button
                          className="text-xs text-neutral-400 hover:text-white"
                          onClick={() => setExpanded(s => ({ ...s, [r.key]: !isOpen }))}
                        >{isOpen ? "hide" : "show"}</button>
                      )}
                    </td>
                  </tr>
                  {isOpen && r.awards.length > 0 && (
                    <tr>
                      <td colSpan={6} className="bg-black/30">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Awarded to</th>
                              <th>Boss</th>
                              <th>Raid</th>
                              <th className="text-right">Weight</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.awards.map(a => (
                              <tr key={a.id}>
                                <td><WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} /></td>
                                <td>
                                  <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                                </td>
                                <td className="text-neutral-400">{a.item.boss.name}</td>
                                <td className="text-neutral-500">{a.item.boss.raid.shortName}</td>
                                <td className="text-right tabular-nums text-gold-200">{weightFor(a, a.character.spec).toFixed(2)}</td>
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
            {sortedRows.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-neutral-500">No {EMPTY_LABEL[tab]} in this roster yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
