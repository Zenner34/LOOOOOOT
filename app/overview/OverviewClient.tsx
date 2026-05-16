"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CLASS_COLOR, CLASSES, BUCKETS, BUCKET_LABEL, bucketForSpec, type Bucket } from "@/lib/specs";
import { itemCount, type ScoringAward } from "@/lib/scoring";
import { WowheadLink } from "@/lib/wowhead";
import { parsePhaseParam, phaseFilterLabel, isDefaultPhaseFilter } from "@/lib/phases";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";
import { Select } from "@/app/components/Select";
import { PhaseFilter } from "@/app/components/PhaseFilter";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ArrowDown, ArrowUp, ChevronDown, Filter, Search, Users } from "@/app/components/ui/Icon";

type Character = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  playerId: number | null;
  isMain: boolean;
  active: boolean;
};
type Player = { id: number; displayName: string; active: boolean };

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
// Awards from the player's most recent raid night, in the same order as
// the input array (descending by awardedAt). Groups by the YYYY-MM-DD of
// awardedAt — every award on the same date counts as one "session". The
// import SQL stamps awards on a RaidNight with the RaidNight's date at
// 00:00 UTC, so all loot from one raid night collapses cleanly here.
function mostRecentSession<T extends { awardedAt: string | Date }>(awards: T[]): T[] {
  if (awards.length === 0) return [];
  const topDay = new Date(awards[0].awardedAt).toISOString().slice(0, 10);
  return awards.filter(a => new Date(a.awardedAt).toISOString().slice(0, 10) === topDay);
}

// Collapse same-(item, character) awards into one row with a count so a
// player who picked up 5× Nether Vortex on one night renders as
// "Nether Vortex × 5" instead of five identical lines. Awards stay in
// the input order (descending by awardedAt) so the most recent unique
// item still anchors the first row.
function collapseSession<T extends { item: { id: number }; character: { id: number } }>(
  awards: T[],
): Array<{ award: T; count: number }> {
  const map = new Map<string, { award: T; count: number }>();
  for (const a of awards) {
    const key = `${a.item.id}:${a.character.id}`;
    const existing = map.get(key);
    if (existing) existing.count++;
    else map.set(key, { award: a, count: 1 });
  }
  return Array.from(map.values());
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
  phases,
  phaseFilterParam,
}: {
  rosters: Array<{ id: number; name: string }>;
  selectedRosterId: number | "all";
  characters: Character[];
  players: Player[];
  awards: Award[];
  phases: Array<{ order: number; name: string }>;
  phaseFilterParam: string | null;
}) {
  const phaseFilter = parsePhaseParam(phaseFilterParam);
  const phaseLabel = isDefaultPhaseFilter(phaseFilter) ? null : phaseFilterLabel(phaseFilter);
  const router = useRouter();
  const params = useSearchParams();

  const initialBucket = ((params.get("bucket") as Bucket) ?? "all");
  const [tab, setTab] = useState<Bucket>(BUCKETS.includes(initialBucket) ? initialBucket : "all");
  const [groupBy, setGroupBy] = useState<"player" | "character">("player");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<
    "lastLootDesc" | "lastLootAsc" | "countDesc" | "countAsc" | "nameAsc" | "nameDesc"
  >("lastLootDesc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [classFilter, setClassFilter] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  function toggleClass(cls: string) {
    setClassFilter(prev => {
      const next = new Set(prev);
      if (next.has(cls)) next.delete(cls);
      else next.add(cls);
      return next;
    });
  }

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

  // "/" focuses the search input — same affordance as GitHub/Linear.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const queryTokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );

  const rosterLabel = selectedRosterId === "all"
    ? "All rosters"
    : (rosters.find(r => r.id === selectedRosterId)?.name ?? "Roster");
  const groupLabel = groupBy === "player" ? "By player" : "By character";
  const sortLabel =
    sort === "lastLootDesc" ? "Recently looted" :
    sort === "lastLootAsc"  ? "Stalest first" :
    sort === "countDesc"    ? "Most items" :
    sort === "countAsc"     ? "Fewest items" :
    sort === "nameAsc"      ? "A → Z" : "Z → A";
  const classLabel = classFilter.size === 0
    ? null
    : classFilter.size === 1
      ? Array.from(classFilter)[0]
      : `${classFilter.size} classes`;
  const inactiveLabel = showInactive ? "Inactive shown" : null;
  const summaryParts = [rosterLabel, phaseLabel, groupLabel, sortLabel, classLabel, inactiveLabel].filter(Boolean);

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
      if (tab !== "all" && bucketForSpec(c.spec) !== tab) return false;
      if (classFilter.size > 0 && !classFilter.has(c.class)) return false;
      if (!showInactive && !c.active) return false;
      return true;
    });

    function matchesQuery(r: Row): boolean {
      if (queryTokens.length === 0) return true;
      const hay = [
        r.displayName,
        ...r.characters.flatMap(c => [c.name, c.class, c.spec]),
        ...r.awards.map(a => a.item.name),
      ].join(" ").toLowerCase();
      return queryTokens.every(t => hay.includes(t));
    }

    if (groupBy === "character") {
      const rows = filtered.map(c => {
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
      return rows.filter(matchesQuery);
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
      if (!showInactive && !p.active) continue;
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

    return [...playerRows, ...orphanRows].filter(matchesQuery);
  }, [characters, players, tab, groupBy, awardsByChar, classFilter, showInactive, queryTokens]);

  const sortedRows = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      if (sort === "countDesc") return b.count - a.count || a.displayName.localeCompare(b.displayName);
      if (sort === "countAsc")  return a.count - b.count || a.displayName.localeCompare(b.displayName);
      if (sort === "nameAsc")   return a.displayName.localeCompare(b.displayName);
      if (sort === "nameDesc")  return b.displayName.localeCompare(a.displayName);
      // lastLootAsc: stalest (oldest) first; never-looted rows still pinned to bottom.
      // lastLootDesc (default): most recently looted first; never-looted pinned to bottom.
      const at = a.lastAwardAt?.getTime() ?? null;
      const bt = b.lastAwardAt?.getTime() ?? null;
      if (at == null && bt == null) return a.displayName.localeCompare(b.displayName);
      if (at == null) return 1;
      if (bt == null) return -1;
      if (sort === "lastLootAsc") return at - bt || a.displayName.localeCompare(b.displayName);
      return bt - at || a.displayName.localeCompare(b.displayName);
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

      <div className="flex flex-wrap items-center gap-2">
        <div ref={filtersRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setFiltersOpen(o => !o)}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--surface)] pl-3 pr-2.5 py-1.5 text-sm text-neutral-200 hover:border-white/20 hover:bg-white/[0.03] transition"
        >
          <Filter size={14} className="text-neutral-400" />
          <span className="font-medium">Filters</span>
          {classFilter.size > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-vermillion-500/20 text-vermillion-200 text-[10px] font-semibold min-w-[16px] h-4 px-1.5">
              {classFilter.size}
            </span>
          )}
          <span className="hidden sm:inline text-neutral-600">·</span>
          <span className="hidden sm:inline text-xs text-neutral-400 truncate max-w-[280px]">
            {summaryParts.join(" · ")}
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
                  { value: "lastLootDesc", label: "Recently looted" },
                  { value: "lastLootAsc",  label: "Stalest first" },
                  { value: "countDesc",    label: "Most items" },
                  { value: "countAsc",     label: "Fewest items" },
                  { value: "nameAsc",      label: "Name A → Z" },
                  { value: "nameDesc",     label: "Name Z → A" },
                ]}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Classes</label>
                {classFilter.size > 0 && (
                  <button
                    type="button"
                    onClick={() => setClassFilter(new Set())}
                    className="text-[11px] text-vermillion-300 hover:text-vermillion-200 transition"
                  >Clear</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CLASSES.map(cls => {
                  const active = classFilter.has(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition border ${
                        active
                          ? "bg-vermillion-500/15 border-vermillion-500/45 text-vermillion-100"
                          : "bg-white/[0.03] border-white/10 text-neutral-300 hover:bg-white/[0.06] hover:border-white/15"
                      }`}
                    >
                      <ClassIcon cls={cls} size={12} />
                      <span style={{ color: active ? CLASS_COLOR[cls] : undefined }}>{cls}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <button
                type="button"
                role="switch"
                aria-checked={showInactive}
                onClick={() => setShowInactive(v => !v)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 px-3 py-2 transition"
              >
                <span className="text-left">
                  <span className="block text-sm text-neutral-200">Show inactive players</span>
                  <span className="block text-[11px] text-neutral-500">Include retired raiders and their loot</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border transition ${
                    showInactive
                      ? "bg-vermillion-500/40 border-vermillion-500/60"
                      : "bg-white/[0.04] border-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-all ${
                      showInactive ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
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
        <PhaseFilter phases={phases} selected={phaseFilter} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        <div className="sm:ml-auto pb-2 sm:pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search item, character, player…"
              aria-label="Search loot"
              className="w-full sm:w-72 rounded-full bg-[var(--surface)] border border-white/10 pl-9 pr-9 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-vermillion-500/40 focus:ring-2 focus:ring-vermillion-500/20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(""); searchRef.current?.focus(); }}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 transition w-5 h-5 inline-flex items-center justify-center rounded"
              >×</button>
            ) : (
              <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center min-w-[20px] h-5 px-1.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-neutral-500 pointer-events-none">/</kbd>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: card list. Below md, the desktop table is hidden. */}
      <div className="md:hidden space-y-2">
        {sortedRows.map(r => {
          const isOpen = expanded[r.key] ?? false;
          const session = mostRecentSession(r.awards);
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
              {session.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 text-[11px] text-neutral-400">
                  {collapseSession(session).map(({ award: a, count }) => (
                    <li key={`${a.item.id}:${a.character.id}`} className="truncate">
                      <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                      {count > 1 && <span className="text-vermillion-300 font-semibold"> × {count}</span>}
                      <span className="text-neutral-600"> · {a.item.boss.raid.shortName}</span>
                    </li>
                  ))}
                </ul>
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
          queryTokens.length > 0 ? (
            <EmptyState
              icon={Search}
              title={`No matches for "${query.trim()}"`}
              description="Try a different player, character, or item name."
              variant="compact"
            />
          ) : (
            <EmptyState
              icon={Users}
              title={`No ${EMPTY_LABEL[tab]} in this roster`}
              description="Once characters are added and loot is awarded, they'll appear here."
              variant="compact"
            />
          )
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
              <th className="text-right">
                <button
                  onClick={() => setSort(s => s === "countDesc" ? "countAsc" : "countDesc")}
                  className="hover:text-vermillion-200 transition inline-flex items-center gap-1"
                  title="Sort by item count"
                >
                  Items
                  {sort === "countDesc" && <ArrowDown size={12} aria-hidden />}
                  {sort === "countAsc"  && <ArrowUp   size={12} aria-hidden />}
                </button>
              </th>
              <th className="whitespace-nowrap min-w-[7rem]">
                <button
                  onClick={() => setSort(s => s === "lastLootDesc" ? "lastLootAsc" : "lastLootDesc")}
                  className="hover:text-vermillion-200 transition inline-flex items-center gap-1"
                  title="Sort by last loot"
                >
                  Last loot
                  {sort === "lastLootDesc" && <ArrowDown size={12} aria-hidden />}
                  {sort === "lastLootAsc"  && <ArrowUp   size={12} aria-hidden />}
                </button>
              </th>
              <th>Last item</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(r => {
              const isOpen = expanded[r.key] ?? false;
              const session = mostRecentSession(r.awards);
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
                      {session.length === 0 ? "—" : (
                        <ul className="space-y-0.5">
                          {collapseSession(session).map(({ award: a, count }) => (
                            <li key={`${a.item.id}:${a.character.id}`}>
                              <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                              {count > 1 && <span className="text-vermillion-300 font-semibold"> × {count}</span>}
                              <span className="text-neutral-600"> ({a.item.boss.raid.shortName})</span>
                            </li>
                          ))}
                        </ul>
                      )}
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
              <tr>
                <td colSpan={6} className="py-10 text-center text-neutral-500">
                  {queryTokens.length > 0
                    ? <>No matches for &ldquo;{query.trim()}&rdquo;.</>
                    : <>No {EMPTY_LABEL[tab]} in this roster yet.</>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
