"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import {
  emptyAssignmentData,
  mergeMissingBossAddOns,
  mergeMissingBuffBlocks,
  mondayOfWeek,
  weekOfLabel,
  rosterCharacterIds,
  type AssignmentData,
} from "@/lib/assignments";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { ChevronDown, Inbox, Pencil, Plus, X } from "@/app/components/ui/Icon";
import { ASSIGNMENT_BOSSES, suggestFillSections, defaultTankAssignments } from "@/lib/assignments";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { BuffsCard } from "./BuffsCard";
import { BossCard } from "./BossCard";
import { RosterSidebar } from "./RosterSidebar";
import { TankHealersCard } from "./TankHealersCard";
import { SectionNav } from "./SectionNav";
import { HighlightProvider, useHighlight } from "./HighlightContext";
import { ViewModeProvider, useViewMode, EditOnly } from "./ViewModeContext";

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

/**
 * Normalize a saved sheet against the current template — appends new
 * buff blocks added since the sheet was last saved, and reorders blocks
 * to match the current template arrangement. Admin-edited rows are
 * never modified. Returns a fresh empty-data when `data` is null.
 */
function hydrateSheetData(data: AssignmentData | null | undefined): AssignmentData {
  const base = data ?? emptyAssignmentData();
  return {
    ...base,
    buffs: mergeMissingBuffBlocks(base.buffs),
    bosses: mergeMissingBossAddOns(base.bosses),
  };
}

export default function AssignmentsClient({
  teams,
  selectedTeamId,
  sheet,
  characters,
  players,
  admin,
}: {
  teams: Team[];
  selectedTeamId: number | null;
  sheet: Sheet | null;
  characters: AssignableCharacter[];
  players: Array<{ id: number; displayName: string }>;
  admin: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // null = closed; "create" = new-team modal; { team } = editing that team
  const [teamModal, setTeamModal] = useState<null | "create" | { team: Team }>(null);
  const [data, setData] = useState<AssignmentData>(hydrateSheetData(sheet?.data));
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const charsById = useMemo(() => new Map(characters.map(c => [c.id, c])), [characters]);
  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null;

  // Reset local state when the server hands us a different sheet
  // (team or week change).
  useEffect(() => {
    setData(hydrateSheetData(sheet?.data));
    setSavingState("idle");
  }, [sheet?.teamId, sheet?.weekOf]);

  // Debounced save when `data` changes. ~600ms after the last keystroke /
  // pick / remove, we PUT the whole blob. The UI surfaces a small
  // "Saving… / Saved" indicator.
  useEffect(() => {
    if (!sheet || !admin) return;
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

  // Auto-fill empty buff sections whenever the team roster changes.
  // suggestFillSections only touches empty + eligible sections, so admin
  // edits are never overwritten — moving a Priest into Group 3 just
  // pops them into PoF G1-5 / PI G4-5 if those rows are still blank.
  const rosterKey = teamRosterIds.join(",");
  useEffect(() => {
    if (!sheet || !admin || teamRosterChars.length === 0) return;
    const nextBuffs = suggestFillSections(data.buffs, teamRosterChars);
    const changed = nextBuffs.some((s, i) => s.characterIds.length !== data.buffs[i].characterIds.length);
    if (changed) setData({ ...data, buffs: nextBuffs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rosterKey, admin]);

  const roleCounts = ROLES.map(r => ({
    ...r,
    chars: teamRosterChars.filter(r.predicate),
  }));

  return (
    <ViewModeProvider forceReadOnly={!admin}>
    <HighlightProvider>
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
            teamModal={teamModal}
            setTeamModal={setTeamModal}
            characters={characters}
            charsById={charsById}
            teamRosterIds={teamRosterIds}
            teamRosterChars={teamRosterChars}
            roleCounts={roleCounts}
            router={router}
          />
        </div>
      </div>
    </HighlightProvider>
    </ViewModeProvider>
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
  teamModal,
  setTeamModal,
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
  teamModal: null | "create" | { team: Team };
  setTeamModal: (m: null | "create" | { team: Team }) => void;
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
                <div key={t.id} className="group/tab relative inline-flex items-center">
                  <button
                    onClick={() => setTeam(t.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full transition flex items-center gap-1.5 ${
                      active
                        ? "bg-white/10 text-white shadow-inner pr-7"
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
                  {active && (
                    <EditOnly>
                      <button
                        type="button"
                        onClick={() => setTeamModal({ team: t })}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-vermillion-200 transition"
                        aria-label={`Edit ${t.name}`}
                        title={`Edit ${t.name}`}
                      >
                        <Pencil size={11} aria-hidden />
                      </button>
                    </EditOnly>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <EditOnly>
          <button
            type="button"
            onClick={() => setTeamModal("create")}
            className="btn-ghost btn-xs inline-flex items-center gap-1"
          >
            <Plus size={12} aria-hidden /> New team
          </button>
        </EditOnly>

        <div className="ml-auto inline-flex items-center gap-2 text-xs flex-wrap justify-end">
          <ViewModeToggle />
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

      {/* Body — three-column grid matching the source mockup */}
      {!selectedTeam || !sheet ? (
        <EmptyState
          icon={Inbox}
          title="Create a raid team to get started"
          description="Each team is one weekly raid roster. Up to three per week — Sunday Main, Wednesday Alts, Saturday Pug, whatever you run."
          variant="compact"
        />
      ) : (
        <div className="grid grid-cols-12 gap-3">
          {/* LEFT rail — group setup + role tallies (col-2 on desktop) */}
          <aside className="col-span-12 lg:col-span-2 space-y-3">
            <GroupSetup
              data={data}
              setData={setData}
              characters={characters}
              charsById={charsById}
            />
            <RosterSidebar teamRosterChars={teamRosterChars} />
          </aside>

          {/* CENTER — buffs + boss cards (col-8 on desktop) */}
          <section className="col-span-12 lg:col-span-8 space-y-4 min-w-0">
            <BuffsCard
              data={data}
              setData={setData}
              characters={characters}
              teamRosterIds={teamRosterIds}
              teamRosterChars={teamRosterChars}
              charsById={charsById}
            />

            <TankHealersCard
              data={data}
              setData={setData}
              characters={characters}
              teamRosterIds={teamRosterIds}
              teamRosterChars={teamRosterChars}
              charsById={charsById}
            />

            {(["SSC", "TK"] as const).map(raidShort => (
              <div key={raidShort} className="space-y-3">
                <div
                  className="font-display text-3xl text-amber-200 border-b border-slate-700 pb-2 mt-2"
                  style={{ letterSpacing: "0.03em" }}
                >
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
          </section>

          {/* RIGHT rail — full team roster sliced four ways (col-2) */}
          <aside className="col-span-12 lg:col-span-2">
            <SectionNav />
          </aside>
        </div>
      )}

      {teamModal && (
        <TeamModal
          existing={teamModal === "create" ? null : teamModal.team}
          onClose={() => setTeamModal(null)}
          onSaved={(team) => {
            setTeamModal(null);
            setTeam(team.id);
            router.refresh();
          }}
          onDeleted={(deletedId) => {
            setTeamModal(null);
            // After delete, route to the next active team if any.
            const fallback = teams.find(t => t.id !== deletedId && t.active) ?? teams.find(t => t.id !== deletedId);
            if (fallback) setTeam(fallback.id);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  // Always render a fixed-width span so appearing / disappearing the
  // text never shifts the rest of the top bar (and by extension the
  // boss cards below). Idle just leaves the slot blank.
  const cls = state === "saving" ? "text-neutral-500"
            : state === "saved"  ? "text-emerald-300"
            : state === "error"  ? "text-rose-300"
            : "text-transparent";
  const text = state === "saving" ? "Saving…"
             : state === "saved"  ? "Saved"
             : state === "error"  ? "Save failed"
             : "";
  return (
    <span
      aria-live="polite"
      className={`tabular-nums text-[11px] inline-block text-right ${cls}`}
      style={{ minWidth: 72 }}
    >
      {text || " "}
    </span>
  );
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
    <div
      className="rounded-lg border border-[#2a3650] p-3"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
    >
      <div
        className="text-xs font-bold uppercase tracking-wider text-white text-center px-3 py-1 mb-2 border border-[#2c5494] rounded"
        style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
      >
        Group Setup
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["1", "2", "3", "4", "5"] as const).map(g => {
          const filled = data.groups[g] ?? [];
          const slots: Array<number | null> = [...filled];
          while (slots.length < 5) slots.push(null);
          return (
            <div key={g} className="flex flex-col gap-px">
              <div className="bg-[#1a1a1a] text-center text-[10px] font-bold uppercase tracking-wider text-white py-1 border border-black">
                Group {g}
              </div>
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
                      <CharacterChip
                        character={char}
                        size="sm"
                        onRemove={() => removeFromSlot(g, idx)}
                        onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)}
                      />
                    ) : (
                      <EmptySlot
                        size="sm"
                        onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)}
                      />
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
    <div
      className="rounded-lg border border-[#2a3650] p-3"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
    >
      <div
        className="text-xs font-bold uppercase tracking-wider text-white text-center px-3 py-1 mb-1 border border-[#2c5494] rounded"
        style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
      >
        Gruul / Mag Roster
      </div>
      <div className="text-center text-[10px] text-slate-400 mb-2 tabular-nums">{total} / 25</div>
      <div className="grid grid-cols-2 gap-2">
        {roleCounts.map(r => (
          <div key={r.key} className="flex flex-col gap-px">
            <div className="bg-[#1a1a1a] text-center text-[10px] font-bold uppercase tracking-wider text-white py-1 border border-black">
              {r.label} · {r.chars.length}
            </div>
            {r.chars.length === 0 ? (
              <div className="px-1 py-1 text-[10px] text-neutral-600 italic text-center">none</div>
            ) : r.chars.map(c => (
              <CharacterChip key={c.id} character={c} size="sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Single modal that handles both creating a raid team and editing an
 * existing one. Pass `existing` to open in edit mode — the modal
 * pre-fills name/color, swaps the title bar, and surfaces a Delete
 * button alongside Save.
 */
function TeamModal({
  existing,
  onClose,
  onSaved,
  onDeleted,
}: {
  existing?: Team | null;
  onClose: () => void;
  onSaved: (team: { id: number; name: string; color: string }) => void;
  onDeleted?: (teamId: number) => void;
}) {
  const isEdit = !!existing;
  const [name, setName] = useState(existing?.name ?? "");
  const [color, setColor] = useState(existing?.color ?? "#1e3a5f");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const url = isEdit ? `/api/raid-teams/${existing!.id}` : "/api/raid-teams";
      const method = isEdit ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        toast.error(j.error || (isEdit ? "Couldn't save team." : "Couldn't create team."));
        return;
      }
      const team = await r.json();
      toast.success(isEdit ? `Saved ${team.name}.` : `Created ${team.name}.`);
      onSaved(team);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeam() {
    if (!isEdit || deleting) return;
    if (!confirm(`Delete "${existing!.name}" and every weekly assignment sheet attached to it? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/raid-teams/${existing!.id}`, { method: "DELETE" });
      if (!r.ok) {
        toast.error("Couldn't delete team.");
        return;
      }
      toast.success(`Deleted ${existing!.name}.`);
      onDeleted?.(existing!.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={isEdit ? "Edit raid team" : "Create raid team"}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1">
                {isEdit ? "Edit team" : "New team"}
              </div>
              <div className="font-semibold">{isEdit ? existing!.name : "Create a raid team"}</div>
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
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
            {isEdit ? (
              <button
                type="button"
                onClick={deleteTeam}
                disabled={deleting}
                className="text-sm text-rose-300 hover:text-rose-200 disabled:opacity-30 transition"
              >
                {deleting ? "Deleting…" : "Delete team"}
              </button>
            ) : <span />}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="button" onClick={submit} disabled={!name.trim() || saving} className="btn">
                {saving ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save" : "Create team")}
              </button>
            </div>
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

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Edit / Raider view toggle pill. When flipped to Raider view, every
 * editing affordance on the page hides (Add buttons, Suggest, Reset,
 * row delete, title rename, +team, team pencil). The toggle itself
 * persists to localStorage via the ViewModeContext.
 *
 * Visible only to admins (the whole route is admin-gated) — when an
 * admin clicks this they're previewing what a non-admin would see if
 * the page were ever exposed read-only.
 */
function ViewModeToggle() {
  const { readOnly, setReadOnly, forced } = useViewMode();
  // Non-admins are pinned to raider view — no toggle, no preview.
  if (forced) return null;
  return (
    <button
      type="button"
      onClick={() => setReadOnly(!readOnly)}
      title={readOnly ? "Switch to Edit mode" : "Preview what a raider would see"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition min-h-[28px] ${
        readOnly
          ? "border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
          : "border-white/10 bg-[var(--surface)] text-neutral-200 hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: readOnly ? "#d4af37" : "#4ade80" }} />
      {readOnly ? "Raider view" : "Edit mode"}
    </button>
  );
}
