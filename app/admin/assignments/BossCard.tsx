"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ASSIGNMENT_BOSSES,
  VASHJ_P2_TIMELINE,
  defaultBossAssignment,
  newSectionId,
  suggestFillSections,
  type AssignSection,
  type AssignmentData,
  type BossAssignment,
  type BossSlug,
} from "@/lib/assignments";
import { Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { CharacterChip, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";

const BOSS_INFO = Object.fromEntries(ASSIGNMENT_BOSSES.map(b => [b.slug, b])) as Record<BossSlug, (typeof ASSIGNMENT_BOSSES)[number]>;

/**
 * One BossCard renders all assignment sections for a single boss. Single-
 * phase bosses (Hydross, Lurker, Morogrim, Fathom, Leotheras, Void Reaver,
 * Solarian) get a flat sections grid. Multi-phase bosses (Vashj, Al'ar,
 * Kael'thas) get a phase-tab strip and render only the active phase's
 * sections. Vashj's Phase 2 also renders a read-only cast timeline.
 *
 * Sections are inline-editable: click the title to rename, click "add"
 * to open the team-scoped picker, "×" on a chip to remove. "Reset" at
 * the card header restores the canonical sections from the template.
 */
export function BossCard({
  slug,
  data,
  setData,
  characters,
  teamRosterIds,
  teamRosterChars,
  charsById,
}: {
  slug: BossSlug;
  data: AssignmentData;
  setData: (d: AssignmentData) => void;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  teamRosterChars: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  const meta = BOSS_INFO[slug];
  // Fall back to the canonical template if this sheet predates the
  // boss-templates rollout and has no entry yet for this boss.
  const bossData: BossAssignment = data.bosses[slug] ?? defaultBossAssignment(slug);
  const isMultiPhase = !!bossData.phases?.length;
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const activePhase = isMultiPhase ? bossData.phases![activePhaseIdx] : null;
  const activeSections = (activePhase?.sections ?? bossData.sections ?? []) as AssignSection[];

  function writeBoss(next: BossAssignment) {
    setData({ ...data, bosses: { ...data.bosses, [slug]: next } });
  }

  function updateActiveSections(next: AssignSection[]) {
    if (isMultiPhase) {
      const phases = bossData.phases!.map((p, i) =>
        i === activePhaseIdx ? { ...p, sections: next } : p,
      );
      writeBoss({ phases });
    } else {
      writeBoss({ sections: next });
    }
  }

  function patchSection(id: string, patch: Partial<AssignSection>) {
    updateActiveSections(activeSections.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }

  function deleteSection(id: string) {
    updateActiveSections(activeSections.filter(s => s.id !== id));
  }

  function addSection() {
    updateActiveSections([
      ...activeSections,
      { id: newSectionId(), title: "New section", characterIds: [] },
    ]);
  }

  function resetBoss() {
    if (!confirm(`Reset ${meta.name} to the default assignment template? Any custom edits for this boss will be lost.`)) return;
    writeBoss(defaultBossAssignment(slug));
    setActivePhaseIdx(0);
    toast.success(`${meta.name} reset to defaults.`);
  }

  function suggestFills() {
    const next = suggestFillSections(activeSections, teamRosterChars);
    const filled = next.filter((s, i) => s.characterIds.length !== activeSections[i].characterIds.length).length;
    if (filled === 0) {
      toast.message("Nothing to suggest — every eligible section is already filled.");
      return;
    }
    updateActiveSections(next);
    toast.success(`Filled ${filled} section${filled === 1 ? "" : "s"} for ${meta.name}.`);
  }

  return (
    <div className="rounded-lg border border-[#2e3a55] bg-gradient-to-b from-[#1a2236] to-[#111827] overflow-visible">
      {/* Header — Cinzel boss name, navy-gradient label bar */}
      <div className="flex items-baseline justify-between gap-2 px-4 py-3 border-b border-[#2e3a55]/70">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {meta.raidShort === "SSC" ? "Serpentshrine Cavern" : "Tempest Keep — The Eye"}
          </div>
          <h3 className="font-display text-2xl text-amber-200 truncate" style={{ letterSpacing: "0.03em" }}>
            {meta.name}
          </h3>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={suggestFills}
            disabled={teamRosterIds.length === 0}
            className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Auto-fill empty sections from team roster roles"
          >
            <Sparkles size={11} aria-hidden /> Suggest
          </button>
          <button
            type="button"
            onClick={resetBoss}
            className="text-[11px] text-neutral-500 hover:text-vermillion-200 transition whitespace-nowrap"
            title="Restore canonical sections for this boss"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Body: portrait + content side-by-side */}
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 md:col-span-3">
          <div
            className="aspect-[4/3] rounded-md border border-[#2e3a55] bg-[#0e1525] bg-cover bg-center"
            style={meta.portrait ? { backgroundImage: `url(${meta.portrait})` } : undefined}
            role="img"
            aria-label={`${meta.name} portrait`}
          />
        </div>
        <div className="col-span-12 md:col-span-9 min-w-0">
          {/* Phase tabs (multi-phase only) */}
          {isMultiPhase && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bossData.phases!.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhaseIdx(i)}
                  className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded transition ${
                    i === activePhaseIdx
                      ? "bg-amber-500 text-black"
                      : "bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Vashj Phase 2 timeline */}
          {slug === "vashj" && activePhase?.label === "Phase 2" && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1.5">
                Phase 2 timeline
              </div>
              <div
                className="grid gap-px text-center"
                style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
              >
                {VASHJ_P2_TIMELINE.map((c, i) => (
                  <div
                    key={i}
                    className={`px-1.5 py-1.5 border rounded text-[10px] ${
                      c.danger
                        ? "bg-[#7a1f2c] border-[#c1394d] text-[#ffd6d6] font-bold"
                        : c.scary
                        ? "bg-[#4b2a44] border-[#7a3760] text-neutral-200"
                        : "bg-[#1a2236] border-[#2e3a55] text-neutral-300"
                    }`}
                  >
                    <div className="font-bold text-[10px] tabular-nums">{c.t}</div>
                    <div className="text-[9px] opacity-90">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections grid */}
          {activeSections.length === 0 ? (
            <div className="text-[11px] text-neutral-500 italic">No sections in this phase.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {activeSections.map(section => (
                <SectionRow
                  key={section.id}
                  section={section}
                  characters={characters}
                  teamRosterIds={teamRosterIds}
                  charsById={charsById}
                  onPatch={patch => patchSection(section.id, patch)}
                  onDelete={() => deleteSection(section.id)}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addSection}
            className="mt-3 inline-flex items-center gap-1 text-xs text-vermillion-300 hover:text-vermillion-200 transition"
          >
            <Plus size={12} aria-hidden /> Add section
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function SectionRow({
  section,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
  onDelete,
}: {
  section: AssignSection;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<AssignSection>) => void;
  onDelete: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(section.title);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  function commitTitle() {
    const next = titleDraft.trim();
    setEditingTitle(false);
    if (next && next !== section.title) onPatch({ title: next });
    else setTitleDraft(section.title);
  }

  function addChar(c: AssignableCharacter) {
    onPatch({ characterIds: [...section.characterIds, c.id] });
    setPickerOpen(false);
  }

  function removeChar(idx: number) {
    const next = [...section.characterIds];
    next.splice(idx, 1);
    onPatch({ characterIds: next });
  }

  const excludeIds = useMemo(() => new Set(section.characterIds), [section.characterIds]);

  return (
    <div className="group/row rounded-md border border-white/10 bg-black/20 p-2">
      <div className="flex items-center gap-2 mb-1.5">
        {/* Section title bar — navy header to match the sheet */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={e => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(section.title); }
            }}
            className="input text-xs h-6 flex-1 px-1.5 py-0"
            aria-label="Section title"
          />
        ) : (
          <button
            type="button"
            onClick={() => { setTitleDraft(section.title); setEditingTitle(true); }}
            className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wider text-white bg-[#1e3a5f] hover:bg-[#234876] transition border border-[#2c5494] rounded px-2 py-1 truncate"
            title="Click to rename"
          >
            {section.title}
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover/row:opacity-100 transition text-neutral-500 hover:text-rose-300 p-0.5 -m-0.5"
          aria-label={`Delete section ${section.title}`}
        >
          <X size={12} aria-hidden />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {section.characterIds.map((id, idx) => {
          const c = charsById.get(id);
          if (!c) return null;
          return (
            <CharacterChip
              key={`${id}:${idx}`}
              character={c}
              small
              onRemove={() => removeChar(idx)}
            />
          );
        })}
        <span className="relative">
          <button
            ref={addBtnRef}
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1 italic text-[11px] text-neutral-700 hover:text-vermillion-700 hover:bg-emerald-100 transition border border-emerald-200/40 rounded-[3px] px-1.5 py-0.5"
            style={{ background: "#c4dd96" }}
            title={teamRosterIds.length === 0 ? "Fill the team's groups first" : "Add character"}
          >
            <Plus size={10} aria-hidden /> add
          </button>
          {pickerOpen && (
            <CharacterPicker
              characters={characters}
              scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
              excludeIds={excludeIds}
              eligibility={section.eligibility}
              onPick={addChar}
              onClose={() => setPickerOpen(false)}
              anchorRef={addBtnRef}
            />
          )}
        </span>
      </div>
    </div>
  );
}
