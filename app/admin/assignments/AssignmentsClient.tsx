"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import {
  emptyAssignmentData,
  mondayOfWeek,
  weekOfLabel,
  rosterCharacterIds,
  type AssignmentData,
} from "@/lib/assignments";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ChevronDown, Inbox, Plus, X } from "@/app/components/ui/Icon";
import { ASSIGNMENT_BOSSES } from "@/lib/assignments";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { BuffsCard } from "./BuffsCard";
import { BossCard } from "./BossCard";
import { HighlightProvider, useHighlight } from "./HighlightContext";

type Team = {
  id: number;
  name: string;
  color: string;
  active: boolean;
  notes: string | null;
};

type Sheet = {
  teamId: number;
  weekOf: string;          // YYYY-MM-DD (Monday)
  data: AssignmentData;
};

const ROLES: Array<{ key: "Tank" | "Healer" | "Melee" | "Ranged"; label: string; predicate: (c: AssignableCharacter) => boolean }> = [
  { key: "Tank",   label: "Tanks",   predicate: c => c.role === "tank" },
  { key: "Melee",  label: "Melee",   predicate: c => c.role === "dps" && !isCasterSpec(c.spec) },
  { key: "Healer", label: "Healers", predicate: c => c.role === "heal" },
  { key: "Ranged", label: "Ranged",  predicate: c => c.role === "dps" && isCasterSpec(c.spec) },
];

function isCasterSpec(spec: string): boolean {
  return /Mage|Warlock|Priest|Hunter|Druid \(Balance\)|Balance Druid|Elemental Shaman/.test(spec);
}

export default function AssignmentsClient({
  teams,
  selectedTeamId,
  sheet,
  characters,
  players,
}: {
  teams: Team[];
  selectedTeamId: number | null;
  sheet: Sheet | null;
  characters: AssignableCharacter[];
  players: Array<{ id: number; displayName: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const [data, setData] = useState<AssignmentData>(sheet?.data ?? emptyAssignmentData());
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const charsById = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null;

  // Reset local state when the server hands us a different sheet
  // (team or week change).
  useEffect(() => {
    setData(sheet?.data ?? emptyAssignmentData());
    setSavingState("idle");
  }, [sheet?.teamId, sheet?.weekOf]);

  // Debounced save when `data` changes. ~600ms after the last keystroke /
  // pick / remove, we PUT the whole blob. The UI surfaces a small
  // "Saving… / Saved" indicator.
  useEffect(() => {
    if (!sheet) return;
    if (JSON.stringify(data) === JSON.stringify(sheet.data)) {
      setSavingState("idle");
      return;
    }
    setSavingState("saving");
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/assignment-sheets", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ teamId: sheet.teamId, weekOf: sheet.weekOf, data }),
        });
        if (!r.ok) throw new Error("save failed");
        setSavingState("saved");
        // Fade the "Saved" badge back to idle after a beat.
        setTimeout(() => setSavingState(curr => curr === "saved" ? "idle" : curr), 1200);
      } catch {
        setSavingState("error");
        toast.error("Failed to save assignments.");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [data, sheet]);

  function setTeam(id: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("team", String(id));
    router.push(`/admin/assignments?${sp.toString()}`);
  }

  function setWeek(weekIso: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("week", weekIso);
    router.push(`/admin/assignments?${sp.toString()}`);
  }

  // Roster character ids drawn from the team's group setup. Picker
  // scopes for buffs/boss assignments are filtered to this set in
  // Phase 2/3; for the group setup itself the picker uses the full
  // active-character list.
  const teamRosterIds = rosterCharacterIds(data);
  const teamRosterChars = teamRosterIds
    .map(id => charsById.get(id))
    .filter((c): c is AssignableCharacter => Boolean(c));

  const roleCounts = ROLES.map(r => ({
    ...r,
    chars: teamRosterChars.filter(r.predicate),
  }));

  return (
    <HighlightProvider>
      <AssignmentsBody
        teams={teams}
        selectedTeam={selectedTeam}
        selectedTeamId={selectedTeamId}
        sheet={sheet}
        data={data}
        setData={setData}
        savingState={savingState}
        setTeam={setTeam}
        setWeek={setWeek}
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        characters={characters}
        charsById={charsById}
        teamRosterIds={teamRosterIds}
        teamRosterChars={teamRosterChars}
        roleCounts={roleCounts}
        router={router}
      />
    </HighlightProvider>
  );
}

function AssignmentsBody({
  teams,
  selectedTeam,
  selectedTeamId,
  sheet,
  data,
  setData,
  savingState,
  setTeam,
  setWeek,
  createOpen,
  setCreateOpen,
  characters,
  charsById,
  teamRosterIds,
  teamRosterChars,
  roleCounts,
  router,
}: {
  teams: Team[];
  selectedTeam: Team | null;
  selectedTeamId: number | null;
  sheet: Sheet | null;
  data: AssignmentData;
  setData: (d: AssignmentData) => void;
  savingState: "idle" | "saving" | "saved" | "error";
  setTeam: (id: number) => void;
  setWeek: (iso: string) => void;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
  teamRosterIds: number[];
  teamRosterChars: AssignableCharacter[];
  roleCounts: Array<{ key: string; label: string; chars: AssignableCharacter[] }>;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        eyebrow="Admin"
        title="Assignments"
        subtitle="Set up to three raid teams a week. Pick characters into groups; role tallies, buff-eligibility, and boss-assignment pickers all derive from the team's roster."
      />

      {/* Top bar: team tabs + week picker + create button */}
      <div className="flex flex-wrap items-center gap-2">
        {teams.length === 0 ? (
          <span className="text-sm text-neutral-500">No teams yet.</span>
        ) : (
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-black/30 p-1">
            {teams.map(t => {
              const active = t.id === selectedTeamId;
              return (
                <button
                  key={t.id}
                  onClick={() => setTeam(t.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
                    active
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                  } ${!t.active ? "opacity-50" : ""}`}
                  title={t.active ? t.name : `${t.name} (inactive)`}
                >
                  <span
                    aria-hidden
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: t.color }}
                  />
                  {t.name}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn-ghost btn-xs inline-flex items-center gap-1"
        >
          <Plus size={12} aria-hidden /> New team
        </button>

        <div className="ml-auto inline-flex items-center gap-2 text-xs flex-wrap justify-end">
          <SpotlightPicker
            characters={characters}
            teamRosterIds={teamRosterIds}
          />
          <label className="text-neutral-500">Week of</label>
          <input
            type="date"
            value={sheet?.weekOf ?? weekOfLabel(mondayOfWeek())}
            onChange={e => setWeek(e.target.value)}
            className="input text-xs min-w-[140px] [color-scheme:dark]"
            aria-label="Week of"
          />
          <SaveIndicator state={savingState} />
        </div>
      </div>

      {/* Body */}
      {!selectedTeam || !sheet ? (
        <EmptyState
          icon={Inbox}
          title="Create a raid team to get started"
          description="Each team is one weekly raid roster. Up to three per week — Sunday Main, Wednesday Alts, Saturday Pug, whatever you run."
          variant="compact"
        />
      ) : (
        <>
          <GroupSetup
            data={data}
            setData={setData}
            characters={characters}
            charsById={charsById}
          />
          <RoleTallies roleCounts={roleCounts} />
          <BuffsCard
            data={data}
            setData={setData}
            characters={characters}
            teamRosterIds={teamRosterIds}
            teamRosterChars={teamRosterChars}
            charsById={charsById}
          />

          {/* Per-boss assignments, grouped by raid. */}
          {(["SSC", "TK"] as const).map(raidShort => (
            <div key={raidShort} className="space-y-3">
              <div className="font-display text-3xl text-amber-200 border-b border-amber-200/15 pb-2 mt-2" style={{ letterSpacing: "0.03em" }}>
                {raidShort === "SSC" ? "Serpentshrine Cavern" : "Tempest Keep — The Eye"}
              </div>
              {ASSIGNMENT_BOSSES.filter(b => b.raidShort === raidShort).map(b => (
                <BossCard
                  key={b.slug}
                  slug={b.slug}
                  data={data}
                  setData={setData}
                  characters={characters}
                  teamRosterIds={teamRosterIds}
                  teamRosterChars={teamRosterChars}
                  charsById={charsById}
                />
              ))}
            </div>
          ))}
        </>
      )}

      {createOpen && (
        <CreateTeamModal
          onClose={() => setCreateOpen(false)}
          onCreated={(team) => {
            setCreateOpen(false);
            setTeam(team.id);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const cls = state === "saving" ? "text-neutral-500"
            : state === "saved"  ? "text-emerald-300"
            : "text-rose-300";
  const text = state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Save failed";
  return <span className={`tabular-nums text-[11px] ${cls}`}>{text}</span>;
}

/* ──────────────────────────────────────────────────────────────────── */

function GroupSetup({
  data,
  setData,
  characters,
  charsById,
}: {
  data: AssignmentData;
  setData: (d: AssignmentData) => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  // Track which slot is currently showing the picker (keyed by
  // "group:slotIndex"; null when none).
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allRosterIds = useMemo(() => new Set(rosterCharacterIds(data)), [data]);

  function addToSlot(group: "1" | "2" | "3" | "4" | "5", slotIdx: number, c: AssignableCharacter) {
    const current = [...data.groups[group]];
    while (current.length <= slotIdx) current.push(0);
    current[slotIdx] = c.id;
    setData({ ...data, groups: { ...data.groups, [group]: current } });
    setOpenSlot(null);
  }

  function removeFromSlot(group: "1" | "2" | "3" | "4" | "5", slotIdx: number) {
    const current = [...data.groups[group]];
    current.splice(slotIdx, 1);
    setData({ ...data, groups: { ...data.groups, [group]: current } });
  }

  return (
    <div className="panel p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-2">
        Group Setup
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {(["1", "2", "3", "4", "5"] as const).map(g => {
          const filled = data.groups[g] ?? [];
          // Render exactly 5 slots, padding with empties.
          const slots: Array<number | null> = [...filled];
          while (slots.length < 5) slots.push(null);
          return (
            <div key={g} className="rounded-md border border-white/10 bg-black/20">
              <div className="bg-[#1a1a1a] text-center text-xs font-semibold text-white py-1 border-b border-black rounded-t-md">
                Group {g}
              </div>
              <div className="p-1 flex flex-col gap-px">
                {slots.map((charId, idx) => {
                  const slotKey = `${g}:${idx}`;
                  const char = charId ? charsById.get(charId) : null;
                  return (
                    <div
                      key={slotKey}
                      ref={el => { slotRefs.current[slotKey] = el; }}
                      className="relative"
                    >
                      {char ? (
                        <div className="w-full">
                          <CharacterChip
                            character={char}
                            onRemove={() => removeFromSlot(g, idx)}
                            onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)}
                          />
                        </div>
                      ) : (
                        <EmptySlot onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)} />
                      )}
                      {openSlot === slotKey && (
                        <CharacterPicker
                          characters={characters}
                          excludeIds={allRosterIds}
                          onPick={c => addToSlot(g, idx, c)}
                          onClose={() => setOpenSlot(null)}
                          anchorRef={{ current: slotRefs.current[slotKey] }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function RoleTallies({ roleCounts }: { roleCounts: Array<{ key: string; label: string; chars: AssignableCharacter[] }> }) {
  const total = roleCounts.reduce((sum, r) => sum + r.chars.length, 0);
  return (
    <div className="panel p-3">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">
          Role roster
        </div>
        <div className="text-[11px] text-neutral-500 tabular-nums">{total} / 25</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {roleCounts.map(r => (
          <div key={r.key} className="rounded-md border border-white/10 bg-black/20 overflow-hidden">
            <div className="bg-[#1a1a1a] text-center text-xs font-semibold text-white py-1 border-b border-black">
              {r.label} · {r.chars.length}
            </div>
            <div className="p-1 flex flex-col gap-px">
              {r.chars.length === 0 ? (
                <div className="px-2 py-2 text-[11px] text-neutral-600 italic text-center">none</div>
              ) : r.chars.map(c => (
                <CharacterChip key={c.id} character={c} small />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function CreateTeamModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (team: { id: number; name: string; color: string }) => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#1e3a5f");
  const [saving, setSaving] = useState(false);

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

  async function submit() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const r = await fetch("/api/raid-teams", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        toast.error(j.error || "Couldn't create team.");
        return;
      }
      const team = await r.json();
      toast.success(`Created ${team.name}.`);
      onCreated(team);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Create raid team">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1">New team</div>
              <div className="font-semibold">Create a raid team</div>
            </div>
            <button type="button" onClick={onClose} className="text-neutral-500 hover:text-neutral-200 p-1 -m-1" aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <label className="label">Name</label>
              <input
                autoFocus
                className="input"
                placeholder="Sunday Main"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") submit(); }}
              />
              <p className="mt-1 text-[11px] text-neutral-500">e.g. "Sunday Main", "Wednesday Alts", "Saturday Pug"</p>
            </div>
            <div>
              <label className="label">Accent colour</label>
              <div className="flex flex-wrap gap-1.5">
                {["#1e3a5f", "#7a1f2c", "#235a3c", "#5a3a7a", "#7a5a1f", "#1f5a7a"].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${color === c ? "border-white scale-110" : "border-white/10 hover:border-white/30"}`}
                    style={{ background: c }}
                    aria-label={`Pick colour ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="button" onClick={submit} disabled={!name.trim() || saving} className="btn">
              {saving ? "Creating…" : "Create team"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Top-bar "Spotlight" selector. Picks a character to lock the
 * highlight on — locked id persists across reloads via localStorage
 * inside the HighlightProvider. Once locked, every chip elsewhere on
 * the page lights up amber for that character and dims for the rest,
 * giving raiders the "show me everywhere I'm assigned" view.
 *
 * Scoped to the team's roster so the dropdown stays manageable; the
 * search input lets you filter further.
 */
function SpotlightPicker({
  characters,
  teamRosterIds,
}: {
  characters: AssignableCharacter[];
  teamRosterIds: number[];
}) {
  const { lockedId, setLocked } = useHighlight();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const charsById = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
  const locked = lockedId != null ? charsById.get(lockedId) ?? null : null;

  return (
    <span className="relative inline-flex items-center gap-1">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[var(--surface)] px-3 py-1 text-xs text-neutral-200 hover:border-white/20 hover:bg-white/[0.03] transition min-h-[28px]"
        title="Lock a character to spotlight every assignment they appear in"
      >
        <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: locked ? CLASS_COLOR[locked.class] ?? "#888" : "#444" }} />
        <span className="font-medium">
          {locked ? `Spotlight: ${locked.name}` : "Spotlight someone"}
        </span>
      </button>
      {locked && (
        <button
          type="button"
          onClick={() => setLocked(null)}
          className="text-neutral-500 hover:text-vermillion-200 transition text-xs"
          title="Clear spotlight"
        >
          <X size={12} aria-hidden />
        </button>
      )}
      {open && (
        <CharacterPicker
          characters={characters}
          scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
          onPick={c => { setLocked(c.id); setOpen(false); }}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
        />
      )}
    </span>
  );
}
