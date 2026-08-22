"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { isMeleeSpec } from "@/lib/assignments";
import {
  applyImport,
  emptyPhaseData,
  hydratePhaseData,
  parseRaidHelperExport,
  PHASE_BOSSES,
  PHASE_DAYS,
  PHASE_RAIDS,
  phaseDaySlug,
  type ParsedImport,
  type PhaseAssignmentData,
  type PhaseBossSheet,
  type PhaseBossSlug,
  type PhaseDayKey,
} from "@/lib/raid-helper";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Calendar, Inbox, Plus, Search, X } from "@/app/components/ui/Icon";
import { type AssignableCharacter } from "./CharacterChip";
import { GroupSetup } from "./GroupSetup";
import { BuffsCard } from "./BuffsCard";
import { TankHealersCard } from "./TankHealersCard";
import { RosterSidebar } from "./RosterSidebar";
import { SectionNav, type SectionNavGroup } from "./SectionNav";
import { PhaseBossCard } from "./PhaseBossCard";
import { SaveIndicator, ViewModeToggle, type SavingState } from "./SheetChrome";
import { HighlightProvider, useHighlight } from "./HighlightContext";
import { ViewModeProvider, EditOnly } from "./ViewModeContext";
import { CLASS_COLOR } from "@/lib/specs";

/**
 * The live BT/Hyjal assignment sheets — one independent sheet per raid
 * night (Tue / Thu / Sun). Standalone: each day's roster comes from a
 * pasted Raid-Helper composition export, not the Character table.
 * Importing or resetting one day never touches the others; each day
 * saves to its own PhaseSheet row.
 */
export default function PhaseAssignmentsClient({
  rawByDay,
  admin,
  initialDay,
}: {
  rawByDay: Record<PhaseDayKey, unknown>;
  admin: boolean;
  initialDay: PhaseDayKey;
}) {
  const [day, setDay] = useState<PhaseDayKey>(initialDay);
  const [dataByDay, setDataByDay] = useState<Record<PhaseDayKey, PhaseAssignmentData>>(() => {
    const out = {} as Record<PhaseDayKey, PhaseAssignmentData>;
    for (const d of PHASE_DAYS) out[d.key] = hydratePhaseData(rawByDay[d.key]);
    return out;
  });
  const [savingState, setSavingState] = useState<SavingState>("idle");
  const [importOpen, setImportOpen] = useState(false);

  // Per-day snapshots of the last persisted state — seeded from the
  // hydrated initial states (NOT fresh hydrate calls, which would mint
  // different section ids), so hydration diffs don't save until the
  // admin actually edits something.
  const lastSavedRef = useRef<Record<PhaseDayKey, string> | null>(null);
  if (lastSavedRef.current === null) {
    const snap = {} as Record<PhaseDayKey, string>;
    for (const d of PHASE_DAYS) snap[d.key] = JSON.stringify(dataByDay[d.key]);
    lastSavedRef.current = snap;
  }

  // Debounced coarse save, one PUT per dirty day. Edits normally touch
  // only the active day, but diffing every day means a pending save
  // never gets dropped by switching tabs mid-debounce.
  useEffect(() => {
    if (!admin) return;
    const snaps = lastSavedRef.current!;
    const dirty = PHASE_DAYS.map(d => d.key)
      .filter(k => JSON.stringify(dataByDay[k]) !== snaps[k]);
    if (dirty.length === 0) { setSavingState("idle"); return; }
    setSavingState("saving");
    const t = setTimeout(async () => {
      try {
        for (const k of dirty) {
          const json = JSON.stringify(dataByDay[k]);
          const r = await fetch("/api/phase-sheets", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ slug: phaseDaySlug(k), data: dataByDay[k] }),
          });
          if (!r.ok) throw new Error("save failed");
          snaps[k] = json;
        }
        setSavingState("saved");
        setTimeout(() => setSavingState(curr => (curr === "saved" ? "idle" : curr)), 1200);
      } catch {
        setSavingState("error");
        toast.error("Failed to save assignments.");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [dataByDay, admin]);

  const data = dataByDay[day];
  function setData(next: PhaseAssignmentData) {
    setDataByDay(prev => ({ ...prev, [day]: next }));
  }

  function switchDay(k: PhaseDayKey) {
    setDay(k);
    // Deep-linkable without a server round-trip.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("day", k);
      window.history.replaceState(null, "", url);
    } catch {}
  }

  // The imported roster viewed through the same lens as the old sheet's
  // characters — every shared card (chips, pickers, buffs, tanks) works
  // on this shape unchanged.
  const characters = useMemo<AssignableCharacter[]>(
    () => data.members.map(m => ({
      id: m.id,
      name: m.name,
      class: m.className,
      spec: m.spec,
      role: m.role,
      isMain: true,
      playerId: null,
      playerName: null,
    })),
    [data.members],
  );
  const charsById = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
  const rosterIds = useMemo(() => characters.map(c => c.id), [characters]);

  const navGroups: SectionNavGroup[] = useMemo(() => [
    {
      items: [
        { id: "buffs", label: "Buffs" },
        { id: "tank-heal", label: "Tank / Heal" },
      ],
    },
    ...PHASE_RAIDS.map(r => ({
      heading: r.name,
      items: PHASE_BOSSES.filter(b => b.raidShort === r.short).map(b => ({
        id: `boss-${b.slug}`,
        label: b.name,
      })),
    })),
  ], []);

  const dayMeta = PHASE_DAYS.find(d => d.key === day)!;

  function handleImport(targetDay: PhaseDayKey, parsed: ParsedImport) {
    setDataByDay(prev => ({ ...prev, [targetDay]: applyImport(prev[targetDay], parsed) }));
    setImportOpen(false);
    if (targetDay !== day) switchDay(targetDay);
    const label = PHASE_DAYS.find(d => d.key === targetDay)!.label;
    toast.success(`${label}: imported ${parsed.members.length} raiders from Raid-Helper.`);
  }

  function resetDay() {
    const count = data.members.length;
    if (!confirm(
      `Reset ${dayMeta.label}? This clears its roster${count ? ` (${count} raiders)` : ""}, buffs, and every boss assignment for that day. The other days are untouched. This can't be undone.`,
    )) return;
    setData(emptyPhaseData());
    toast.success(`${dayMeta.label} reset.`);
  }

  function setBossSheet(slug: PhaseBossSlug, sheet: PhaseBossSheet) {
    setData({ ...data, bossSheets: { ...data.bossSheets, [slug]: sheet } });
  }

  const importedStamp = data.importedAt
    ? new Date(data.importedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <ViewModeProvider forceReadOnly={!admin}>
      <div
        className="relative left-1/2 -translate-x-1/2 w-screen px-4 sm:px-6 -my-6 md:-my-8 py-6 md:py-8 min-h-screen"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(80, 60, 160, .08), transparent 60%), " +
            "radial-gradient(ellipse 70% 50% at 100% 30%, rgba(20, 130, 200, .07), transparent 60%), " +
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(212, 175, 55, .04), transparent 60%)",
        }}
      >
        <div className="mx-auto max-w-[1800px]">
          <div className="space-y-5 animate-fade-in">
            <PageHeader
              eyebrow="Raid"
              title="Assignments"
              subtitle="Black Temple & Mount Hyjal — one roster per raid night, imported straight from the Raid-Helper comp. Find your night, your group, and your jobs."
            />

            {/* Day switcher + view controls */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <DayTabs
                day={day}
                dataByDay={dataByDay}
                onSwitch={switchDay}
              />
              <div className="inline-flex items-center gap-2 text-xs flex-wrap justify-end">
                <ViewModeToggle />
                {admin && <SaveIndicator state={savingState} />}
              </div>
            </div>

            {/* Per-day action row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs -mt-1">
              <EditOnly>
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="btn btn-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={12} aria-hidden />
                  Import Raid-Helper comp
                </button>
              </EditOnly>
              {importedStamp && (
                <span className="inline-flex items-center gap-1.5 text-neutral-500">
                  <Calendar size={11} aria-hidden />
                  {dayMeta.label} roster imported {importedStamp}
                  {data.raidTitle ? ` · ${data.raidTitle}` : ""}
                </span>
              )}
              <EditOnly>
                {data.members.length > 0 && (
                  <button
                    type="button"
                    onClick={resetDay}
                    className="ml-auto inline-flex items-center gap-1 text-rose-300/80 hover:text-rose-200 transition"
                    title={`Clear ${dayMeta.label}'s roster and assignments`}
                  >
                    <X size={11} aria-hidden /> Reset {dayMeta.label}
                  </button>
                )}
              </EditOnly>
            </div>

            {/* Keyed by day: highlight locks, open pickers, and scroll-nav
                state all reset cleanly when switching nights. */}
            <HighlightProvider key={day} storageKey={`assignments.phase.${day}.lockedHighlight`}>
              {data.members.length === 0 ? (
                <EmptyRoster admin={admin} dayLabel={dayMeta.label} onImport={() => setImportOpen(true)} />
              ) : (
                <div className="grid grid-cols-12 gap-3">
                  {/* LEFT rail — group setup (from the Discord comp) + role tallies */}
                  <aside className="col-span-12 lg:col-span-2 space-y-3">
                    <div className="flex justify-end lg:justify-start">
                      <MemberSpotlightPicker characters={characters} />
                    </div>
                    <GroupSetup
                      data={data}
                      setData={setData}
                      characters={characters}
                      charsById={charsById}
                      title={`${dayMeta.label} Groups`}
                    />
                    <RosterSidebar teamRosterChars={characters} />
                  </aside>

                  {/* CENTER — buffs + tank/heal + boss cards */}
                  <section className="col-span-12 lg:col-span-8 space-y-4 min-w-0">
                    <BuffsCard
                      data={data}
                      setData={d => setData(d as PhaseAssignmentData)}
                      characters={characters}
                      teamRosterIds={rosterIds}
                      teamRosterChars={characters}
                      charsById={charsById}
                    />

                    <TankHealersCard
                      data={data}
                      setData={d => setData(d as PhaseAssignmentData)}
                      characters={characters}
                      teamRosterIds={rosterIds}
                      teamRosterChars={characters}
                      charsById={charsById}
                    />

                    {PHASE_RAIDS.map(raid => (
                      <div key={raid.short} className="space-y-3">
                        <div
                          className="font-display text-3xl text-amber-200 border-b border-slate-700 pb-2 mt-2"
                          style={{ letterSpacing: "0.03em" }}
                        >
                          {raid.name}
                        </div>
                        {PHASE_BOSSES.filter(b => b.raidShort === raid.short).map(b => (
                          <PhaseBossCard
                            key={b.slug}
                            boss={b}
                            sheet={data.bossSheets[b.slug] ?? { sections: [] }}
                            onChange={sheet => setBossSheet(b.slug, sheet)}
                            characters={characters}
                            charsById={charsById}
                          />
                        ))}
                      </div>
                    ))}
                  </section>

                  {/* RIGHT rail — jump nav */}
                  <aside className="col-span-12 lg:col-span-2">
                    <SectionNav groups={navGroups} />
                  </aside>
                </div>
              )}
            </HighlightProvider>
          </div>
        </div>
      </div>

      {importOpen && (
        <ImportModal
          defaultDay={day}
          dataByDay={dataByDay}
          onClose={() => setImportOpen(false)}
          onApply={handleImport}
        />
      )}
    </ViewModeProvider>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Segmented raid-night switcher. Each tab shows the night plus a live
 * status badge — raider count once a comp is imported, "empty" until
 * then — so admins can see the whole week's state at a glance.
 */
function DayTabs({
  day,
  dataByDay,
  onSwitch,
}: {
  day: PhaseDayKey;
  dataByDay: Record<PhaseDayKey, PhaseAssignmentData>;
  onSwitch: (k: PhaseDayKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Raid night"
      className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1 gap-1"
    >
      {PHASE_DAYS.map(d => {
        const active = d.key === day;
        const count = dataByDay[d.key].members.length;
        return (
          <button
            key={d.key}
            role="tab"
            aria-selected={active}
            onClick={() => onSwitch(d.key)}
            className={`group flex flex-col items-center gap-0.5 rounded-lg px-4 sm:px-5 py-1.5 transition min-w-[4.5rem] ${
              active
                ? "text-white shadow-inner border border-[#2c5494]"
                : "text-neutral-400 hover:text-neutral-100 hover:bg-white/[0.04] border border-transparent"
            }`}
            style={active ? { background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" } : undefined}
          >
            <span className="text-[13px] font-semibold leading-none">
              <span className="sm:hidden">{d.short}</span>
              <span className="hidden sm:inline">{d.label}</span>
            </span>
            <span
              className={`text-[10px] leading-none tabular-nums ${
                active ? "text-amber-200/90" : count > 0 ? "text-neutral-500 group-hover:text-neutral-400" : "text-neutral-600 italic"
              }`}
            >
              {count > 0 ? `${count} raiders` : "empty"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function EmptyRoster({
  admin,
  dayLabel,
  onImport,
}: {
  admin: boolean;
  dayLabel: string;
  onImport: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[var(--surface)] px-6 py-14 text-center">
      <Inbox size={28} className="mx-auto mb-3 text-neutral-600" aria-hidden />
      <h2 className="text-lg font-semibold text-neutral-100">
        {admin ? `Import ${dayLabel}'s raid comp to get started` : `${dayLabel}'s roster isn't posted yet`}
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-neutral-400">
        {admin
          ? "Paste the Raid-Helper composition export and the groups, roster, and buff assignments fill themselves in. The other raid nights stay exactly as they are."
          : "The comp for this night hasn't been imported yet — check back once the roster is posted, or peek at another night above."}
      </p>
      {admin && (
        <button type="button" onClick={onImport} className="btn mt-5 inline-flex items-center gap-1.5">
          <Plus size={14} aria-hidden /> Import Raid-Helper comp
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Paste-and-preview modal for the Raid-Helper composition export.
 * Parses live as the admin pastes, previews groups/roles/warnings, and
 * lets them pick which raid night the comp lands on before anything is
 * committed.
 */
function ImportModal({
  defaultDay,
  dataByDay,
  onClose,
  onApply,
}: {
  defaultDay: PhaseDayKey;
  dataByDay: Record<PhaseDayKey, PhaseAssignmentData>;
  onClose: () => void;
  onApply: (day: PhaseDayKey, parsed: ParsedImport) => void;
}) {
  const [text, setText] = useState("");
  const [targetDay, setTargetDay] = useState<PhaseDayKey>(defaultDay);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const parsed = useMemo<{ ok: ParsedImport | null; error: string | null }>(() => {
    if (!text.trim()) return { ok: null, error: null };
    try {
      return { ok: parseRaidHelperExport(text), error: null };
    } catch (e) {
      return { ok: null, error: e instanceof Error ? e.message : "Couldn't parse that." };
    }
  }, [text]);

  const targetMeta = PHASE_DAYS.find(d => d.key === targetDay)!;
  const existingCount = dataByDay[targetDay].members.length;

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Import Raid-Helper comp">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1">
                Raid-Helper import
              </div>
              <div className="font-semibold">Paste the composition export</div>
              <p className="mt-1 text-xs text-neutral-500 max-w-md">
                Raid-Helper → your comp → Export → JSON. Groups, names, classes, and specs
                come across exactly as set in Discord; buffs auto-fill from the roster.
              </p>
            </div>
            <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-200 p-1 -m-1" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            {/* Which night gets this comp */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                Import into
              </span>
              <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-0.5 gap-0.5">
                {PHASE_DAYS.map(d => {
                  const active = d.key === targetDay;
                  const count = dataByDay[d.key].members.length;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setTargetDay(d.key)}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                        active ? "text-white border border-[#2c5494]" : "text-neutral-400 hover:text-neutral-100 border border-transparent"
                      }`}
                      style={active ? { background: "linear-gradient(180deg, #234876, #1e3a5f)" } : undefined}
                      title={count > 0 ? `${d.label} — ${count} raiders currently` : `${d.label} — empty`}
                    >
                      {d.label}
                      <span className={`ml-1.5 text-[10px] tabular-nums ${active ? "text-amber-200/90" : "text-neutral-600"}`}>
                        {count > 0 ? count : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='{"slots":[{"specName":"Feral","name":"creek",…'
              rows={6}
              spellCheck={false}
              className="w-full resize-y rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[11px] leading-relaxed text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-white/25"
            />

            {parsed.error && (
              <p className="text-sm text-rose-300">{parsed.error}</p>
            )}

            {parsed.ok && <ImportPreview parsed={parsed.ok} />}

            {existingCount > 0 && parsed.ok && (
              <p className="text-[11px] text-amber-300/90">
                {targetMeta.label} already has {existingCount} raiders — importing replaces its group
                grid. Raiders keeping the same name keep their assignments; anyone no longer in the
                comp is cleared from every slot. Other nights are untouched.
              </p>
            )}
          </div>

          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              type="button"
              onClick={() => parsed.ok && onApply(targetDay, parsed.ok)}
              disabled={!parsed.ok}
              className="btn"
            >
              {parsed.ok ? `Import ${parsed.ok.members.length} raiders → ${targetMeta.label}` : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImportPreview({ parsed }: { parsed: ParsedImport }) {
  const tanks = parsed.members.filter(m => m.role === "tank");
  const heals = parsed.members.filter(m => m.role === "heal");
  const melee = parsed.members.filter(m => m.role === "dps" && isMeleeSpec(m.spec));
  const ranged = parsed.members.filter(m => m.role === "dps" && !isMeleeSpec(m.spec));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-white/5 px-2 py-1 font-semibold text-neutral-200 tabular-nums">
          {parsed.members.length} raiders
        </span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-neutral-400 tabular-nums">{tanks.length} tanks</span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-neutral-400 tabular-nums">{heals.length} healers</span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-neutral-400 tabular-nums">{melee.length} melee</span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-neutral-400 tabular-nums">{ranged.length} ranged</span>
        {parsed.raidTitle && <span className="text-neutral-500">· {parsed.raidTitle}</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(["1", "2", "3", "4", "5"] as const).map(g => {
          const ids = parsed.groups[g];
          const byId = new Map(parsed.members.map(m => [m.id, m]));
          return (
            <div key={g} className="rounded-md border border-white/[0.07] bg-black/20 overflow-hidden">
              <div className="bg-[#1a1a1a] text-center text-[9px] font-bold uppercase tracking-wider text-neutral-300 py-0.5">
                Group {g}
              </div>
              <ul className="p-1 space-y-0.5">
                {ids.filter(id => id > 0).map(id => {
                  const m = byId.get(id)!;
                  return (
                    <li
                      key={id}
                      className="truncate rounded-sm px-1 py-0.5 text-[10px] font-semibold italic"
                      style={{ background: CLASS_COLOR[m.className] ?? "#888", color: "#1a1a1a" }}
                      title={`${m.name} — ${m.spec}${m.confirmed ? "" : " (unconfirmed)"}`}
                    >
                      {m.name}
                    </li>
                  );
                })}
                {ids.filter(id => id > 0).length === 0 && (
                  <li className="px-1 py-0.5 text-[10px] text-neutral-600 italic text-center">empty</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {parsed.warnings.length > 0 && (
        <ul className="space-y-1">
          {parsed.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-amber-300/90">
              <span aria-hidden className="mt-px">⚠</span> {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * "Highlight me" picker over the active night's imported members. Locks
 * the gold highlight on one raider — every chip of theirs lights up
 * across the sheet, everyone else dims. Persists per-browser, per-night.
 */
function MemberSpotlightPicker({ characters }: { characters: AssignableCharacter[] }) {
  const { lockedIds, setLocked } = useHighlight();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locked = useMemo(
    () => characters.find(c => lockedIds.has(c.id)) ?? null,
    [characters, lockedIds],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return characters
      .filter(c => q === "" || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [characters, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    function onDoc(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (characters.length === 0) return null;

  return (
    <span className="relative inline-flex items-center gap-1">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--surface)] px-3 py-1 text-xs text-neutral-200 hover:border-white/20 hover:bg-white/[0.03] transition min-h-[28px]"
        title="Lock the highlight on a raider — every chip of theirs across the sheet lights up. Persists in this browser."
      >
        <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: locked ? "#d4af37" : "#444" }} />
        <span className="font-medium">
          {locked ? `Highlighting: ${locked.name}` : "Highlight me"}
        </span>
      </button>
      {locked && (
        <button
          type="button"
          onClick={() => setLocked(null)}
          className="text-neutral-500 hover:text-vermillion-200 transition text-xs"
          title="Clear highlight"
        >
          <X size={12} aria-hidden />
        </button>
      )}
      {open && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Pick a raider to highlight"
          className="absolute z-40 mt-1 top-full left-0 lg:left-auto lg:right-0 w-64 rounded-xl border border-white/10 bg-[var(--surface-2)] shadow-2xl animate-fade-in overflow-hidden"
        >
          <div className="relative p-2 border-b border-white/5">
            <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search raiders…"
              className="input pl-7 text-xs h-8 w-full"
              aria-label="Search raiders"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1">
            {visible.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-neutral-500">No raiders</li>
            ) : visible.map(c => {
              const isLocked = locked?.id === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { setLocked([c.id]); setOpen(false); setQuery(""); }}
                    className={`flex items-center justify-between w-full text-left px-2.5 py-1.5 rounded-md text-sm transition ${
                      isLocked
                        ? "bg-[#d4af37]/15 text-[#d4af37]"
                        : "text-neutral-200 hover:bg-vermillion-500/12 hover:text-vermillion-100"
                    }`}
                  >
                    <span className="font-medium truncate" style={isLocked ? undefined : { color: CLASS_COLOR[c.class] ?? undefined }}>
                      {c.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 ml-2 flex-shrink-0 truncate max-w-[8rem]">
                      {c.spec}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </span>
  );
}
