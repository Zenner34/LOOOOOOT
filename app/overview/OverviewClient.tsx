"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASS_COLOR, BUCKETS, BUCKET_LABEL, bucketForSpec, type Bucket } from "@/lib/specs";
import { itemCount, type ScoringAward } from "@/lib/scoring";
import { WowheadLink } from "@/lib/wowhead";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";
import { Select } from "@/app/components/Select";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ChevronDown, Filter, Users } from "@/app/components/ui/Icon";

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
  id: number; // player.id, or character.id for orphans
  displayName: string;
  characters: Character[];
  count: number;
  awards: Award[];
  lastAwardAt: Date | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;
function daysAgo(d: Date | string | null | undefined): number | null {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / DAY_MS);
}
function lastLootBadge(days: number | null): { text: string; tone: "fresh" | "warm" | "cold" | "icy" | "none" } {
  if (days == null) return { text: "no loot yet", tone: "none" };
  if (days === 0) return { text: "today", tone: "fresh" };
  if (days === 1) return { text: "1 day", tone: "fresh" };
  if (days < 7) return { text: `${days} days`, tone: "fresh" };
  if (days < 14) return { text: `${days} days`, tone: "warm" };
  if (days < 30) return { text: `${days} days`, tone: "cold" };
  return { text: `${days} days`, tone: "icy" };
}
const TONE_CLASS: Record<"fresh" | "warm" | "cold" | "icy" | "none", string> = {
  fresh: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25",
  warm:  "bg-gold-400/10 text-gold-200 ring-1 ring-gold-400/25",
  cold:  "bg-vermillion-500/10 text-vermillion-200 ring-1 ring-vermillion-500/30",
  icy:   "bg-vermillion-700/15 text-vermillion-300 ring-1 ring-vermillion-700/40",
  none:  "bg-white/5 text-neutral-500",
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
  const [sort, setSort] = useState<"lastLoot" | "count" | "nameAsc" | "nameDesc">("lastLoot");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    function onDoc(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) setFiltersOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setFiltersOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const rosterLabel = selectedRosterId === "all"
    ? "All rosters"
    : (rosters.find(r => r.id === selectedRosterId)?.name ?? "Roster");
  const groupLabel = groupBy === "player" ? "By player" : "By character";
  const sortLabel =
    sort === "lastLoot" ? "Recently looted" :
    sort === "count"    ? "Most items" :
    sort === "nameAsc"  ? "A → Z" : "Z → A";

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
          id: c.id,
          displayName: c.name,
          characters: [c],
          count: itemCount(mine),
          awards: mine,
          lastAwardAt: mine[0] ? new Date(mine[0].awardedAt) : null,
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
      const allAwards: Award[] = [];
      for (const c of chars) {
        const mine = awardsByChar.get(c.id) ?? [];
        count += itemCount(mine);
        for (const a of mine) allAwards.push(a);
      }
      // sort each player's awards descending by date so [0] is most recent
      allAwards.sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime());
      playerRows.push({
        key: `p${p.id}`,
        kind: "player",
        id: p.id,
        displayName: p.displayName,
        characters: chars.sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.name.localeCompare(b.name)),
        count,
        awards: allAwards,
        lastAwardAt: allAwards[0] ? new Date(allAwards[0].awardedAt) : null,
      });
    }

    const orphanRows: Row[] = orphans.map(c => {
      const mine = awardsByChar.get(c.id) ?? [];
      return {
        key: `o${c.id}`,
        kind: "orphan",
        id: c.id,
        displayName: c.name,
        characters: [c],
        count: itemCount(mine),
        awards: mine,
        lastAwardAt: mine[0] ? new Date(mine[0].awardedAt) : null,
      };
    });

    return [...playerRows, ...orphanRows];
  }, [characters, players, tab, groupBy, awardsByChar]);

  const sortedRows = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      if (sort === "count")    return b.count - a.count || a.displayName.localeCompare(b.displayName);
      if (sort === "nameAsc")  return a.displayName.localeCompare(b.displayName);
      if (sort === "nameDesc") return b.displayName.localeCompare(a.displayName);
      // lastLoot: most recently looted first; players with no loot pinned to bottom.
      const at = a.lastAwardAt?.getTime() ?? -Infinity;
      const bt = b.lastAwardAt?.getTime() ?? -Infinity;
      if (at !== bt) return bt - at;
      return a.displayName.localeCompare(b.displayName);
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
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Roster"
        title="Overview"
        subtitle="Who's looted what across every raid we've run, sorted to surface the next-up players first."
      />

      <div ref={filtersRef} className="relative">
        <button
          type="button"
          onClick={() => setFiltersOpen(o => !o)}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--surface)] pl-3 pr-2.5 py-1.5 text-sm text-neutral-200 hover:border-white/20 hover:bg-white/[0.03] transition"
        >
          <Filter size={14} className="text-neutral-400" />
          <span className="font-medium">Filters</span>
          <span className="hidden sm:inline text-neutral-600">·</span>
          <span className="hidden sm:inline text-xs text-neutral-400 truncate max-w-[260px]">
            {rosterLabel} · {groupLabel} · {sortLabel}
          </span>
          <ChevronDown size={14} className={`text-neutral-500 transition ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        {filtersOpen && (
          <div
            role="dialog"
            aria-label="Filters"
            className="absolute z-30 mt-2 left-0 w-[calc(100vw-2rem)] sm:w-[360px] rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl p-4 space-y-3 animate-fade-in"
          >
            <div>
              <label className="label">Roster</label>
              <Select
                value={String(selectedRosterId)}
                onValueChange={v => { setRoster(v); }}
                options={[
                  ...rosters.map(r => ({ value: String(r.id), label: r.name })),
                  { value: "all", label: "All rosters" },
                ]}
              />
            </div>
            <div>
              <label className="label">Group by</label>
              <Select
                value={groupBy}
                onValueChange={v => setGroupBy(v as any)}
                options={[
                  { value: "player",    label: "By player" },
                  { value: "character", label: "By character" },
                ]}
              />
            </div>
            <div>
              <label className="label">Sort</label>
              <Select
                value={sort}
                onValueChange={v => setSort(v as any)}
                options={[
                  { value: "lastLoot", label: "Recently looted" },
                  { value: "count",    label: "Most items" },
                  { value: "nameAsc",  label: "Name A → Z" },
                  { value: "nameDesc", label: "Name Z → A" },
                ]}
              />
            </div>
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="btn-ghost btn-xs"
              >Done</button>
            </div>
          </div>
        )}
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

      {/* Mobile: card list. Below md, the desktop table is hidden. */}
      <div className="md:hidden space-y-2">
        {sortedRows.map(r => {
          const isOpen = expanded[r.key] ?? false;
          const last = r.awards[0];
          const days = daysAgo(r.lastAwardAt);
          const badge = lastLootBadge(days);
          return (
            <div key={r.key} className="panel p-3 active:bg-white/[0.03] transition">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">
                    {r.kind === "orphan" ? (
                      <span style={{ color: CLASS_COLOR[r.characters[0].class] ?? "#fff" }}>
                        {r.displayName}
                      </span>
                    ) : (
                      <Link href={`/players/${r.id}`} className="text-white">{r.displayName}</Link>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                    {r.characters.map(c => (
                      <span
                        key={c.id}
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${c.isMain ? "bg-gold-400/10 ring-1 ring-gold-400/25" : "bg-white/5"}`}
                      >
                        {c.isMain && <span className="text-gold-300 text-[9px]">★</span>}
                        <SpecIcon spec={c.spec} size={12} />
                        <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium tabular-nums whitespace-nowrap flex-shrink-0 ${TONE_CLASS[badge.tone]}`}>
                  {badge.text}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <span className="text-neutral-500">items</span>
                  <span className="tabular-nums text-neutral-200 font-semibold">{r.count}</span>
                </span>
                {r.awards.length > 0 && (
                  <button
                    className="ml-auto text-xs text-vermillion-300 active:text-vermillion-200 min-h-[32px] px-2 -mr-2"
                    onClick={() => setExpanded(s => ({ ...s, [r.key]: !isOpen }))}
                  >
                    {isOpen ? "hide" : "view"} loot
                  </button>
                )}
              </div>
              {last && (
                <div className="mt-1.5 text-[11px] text-neutral-400 truncate">
                  last: <WowheadLink name={last.item.name} wowheadId={last.item.wowheadId} />
                  <span className="text-neutral-600"> · {last.item.boss.raid.shortName}</span>
                </div>
              )}
              {isOpen && r.awards.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                  {r.awards.map(a => (
                    <li key={a.id} className="text-xs flex items-baseline justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                        <div className="text-[10px] text-neutral-500 truncate">
                          {a.item.boss.name} · <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] text-neutral-600 tabular-nums">{new Date(a.awardedAt).toISOString().slice(0,10)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {sortedRows.length === 0 && (
          <EmptyState
            icon={Users}
            title={`No ${EMPTY_LABEL[tab]} in this roster`}
            description="Once characters are added and loot is awarded, they'll appear here."
            variant="compact"
          />
        )}
      </div>

      {/* Desktop: full table */}
      <div className="hidden md:block panel overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>
                <button
                  onClick={() => setSort(s => s === "nameAsc" ? "nameDesc" : "nameAsc")}
                  className="hover:text-vermillion-200 transition inline-flex items-center gap-1"
                  title="Sort by name"
                >
                  {groupBy === "player" ? "Player" : "Character"}
                  {sort === "nameAsc" && <span aria-hidden="true">↑</span>}
                  {sort === "nameDesc" && <span aria-hidden="true">↓</span>}
                </button>
              </th>
              <th>{groupBy === "player" ? "Characters" : "Spec"}</th>
              <th className="text-right">Items</th>
              <th>Last loot</th>
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
                        <Link
                          href={`/players/${r.id}`}
                          className="text-white hover:text-vermillion-200 transition"
                        >
                          {r.displayName}
                        </Link>
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {r.characters.map(c => (
                          <span
                            key={c.id}
                            className={`inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 ${c.isMain ? "bg-gold-400/10 ring-1 ring-gold-400/25" : "bg-white/5"}`}
                            title={`${c.spec} · ${c.role}`}
                          >
                            {c.isMain && <span className="text-gold-300 text-[9px] leading-none">★</span>}
                            <SpecIcon spec={c.spec} size={14} />
                            <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                            <span className="text-neutral-500">· {c.spec}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{r.count}</td>
                    <td>
                      {(() => {
                        const days = daysAgo(r.lastAwardAt);
                        const b = lastLootBadge(days);
                        return (
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums ${TONE_CLASS[b.tone]}`}>
                            {b.text}
                          </span>
                        );
                      })()}
                    </td>
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
