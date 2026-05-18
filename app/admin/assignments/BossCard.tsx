"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ASSIGNMENT_BOSSES,
  VASHJ_P2_TIMELINE,
  bossPlatformInfo,
  defaultBossAssignment,
  newSectionId,
  suggestFillSections,
  type AssignSection,
  type AssignmentData,
  type BossAssignment,
  type BossSlug,
} from "@/lib/assignments";
import { Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";

const BOSS_INFO = Object.fromEntries(ASSIGNMENT_BOSSES.map(b => [b.slug, b])) as Record<BossSlug, (typeof ASSIGNMENT_BOSSES)[number]>;

/**
 * BossCard layout follows the mockup:
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  Boss Name (Cinzel, amber)         SERPENTSHRINE CAVERN     │  header bar
 *   ├──────────────┬──────────────────────────────────────────────┤
 *   │              │  [phase tabs]                                │
 *   │              │  ┌─ assignments ──────┐  ┌─ platform art ─┐  │
 *   │  portrait    │  │  navy header       │  │ gradient panel │  │
 *   │  (4:3)       │  │  Frost MT          │  │ strategy notes │  │
 *   │              │  │  • Bake            │  │                │  │
 *   │              │  │  • Cash            │  │                │  │
 *   │              │  └────────────────────┘  └────────────────┘  │
 *   └──────────────┴──────────────────────────────────────────────┘
 *
 * Portrait is 4:3 (col 3 / 12). Content area is 9 / 12, split into a
 * 7-col assignment grid + a 5-col platform-art panel. Phase tabs sit
 * above both. Vashj P2 also gets the 13-cell timeline above sections.
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
  const bossData: BossAssignment = data.bosses[slug] ?? defaultBossAssignment(slug);
  const isMultiPhase = !!bossData.phases?.length;
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const activePhase = isMultiPhase ? bossData.phases![activePhaseIdx] : null;
  const activeSections = (activePhase?.sections ?? bossData.sections ?? []) as AssignSection[];
  const platform = bossPlatformInfo(slug, activePhase?.label);

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
    <div
      className="relative rounded-lg border border-[#2a3650] overflow-visible"
      style={{ background: "linear-gradient(180deg, #131b2c, #0e1525)" }}
    >
      {/* Subtle gold sheen at the top, like the mockup .magic-frame::before */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{ background: "linear-gradient(180deg, rgba(255,215,128,0.06), transparent 30%)" }}
      />

      <div className="relative p-4">
        {/* Header: name + instance side-by-side */}
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h3 className="font-display text-2xl text-amber-200 truncate leading-none">
            {meta.name}
          </h3>
          <div className="flex items-baseline gap-3 flex-shrink-0">
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {meta.raidShort === "SSC" ? "Serpentshrine Cavern" : "Tempest Keep — The Eye"}
            </span>
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

        {/* Body: portrait (3) + content (9) */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-3">
            <div
              className="aspect-[4/3] rounded-md border border-[#2e3a55] bg-[#0e1525] bg-cover bg-center"
              style={meta.portrait ? { backgroundImage: `url(${meta.portrait})` } : undefined}
              role="img"
              aria-label={`${meta.name} portrait`}
            />
          </div>

          <div className="col-span-12 md:col-span-9 min-w-0">
            {/* Phase tabs */}
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
                      className={`px-1.5 py-1.5 border rounded ${
                        c.danger
                          ? "bg-[#7a1f2c] border-[#c1394d] text-[#ffd6d6] font-bold"
                          : c.scary
                          ? "bg-[#4b2a44] border-[#7a3760] text-neutral-200"
                          : "bg-[#1a2236] border-[#2e3a55] text-neutral-300"
                      }`}
                    >
                      <div className="font-bold text-[10px] tabular-nums leading-none mb-0.5">{c.t}</div>
                      <div className="text-[9px] opacity-90 leading-tight">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inner split: assignments (7) + platform art (5) */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 lg:col-span-7">
                {activeSections.length === 0 ? (
                  <div className="text-[11px] text-neutral-500 italic">No sections in this phase.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {activeSections.map(section => (
                      <AssignBox
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
                  className="mt-2 inline-flex items-center gap-1 text-xs text-vermillion-300 hover:text-vermillion-200 transition"
                >
                  <Plus size={12} aria-hidden /> Add section
                </button>
              </div>

              {/* Platform art panel */}
              <div className="col-span-12 lg:col-span-5">
                <div
                  className="aspect-[16/9] rounded-md border border-[#2e3a55] p-3 text-[11px] leading-snug text-slate-300"
                  style={{ background: platform.gradient }}
                >
                  {platform.heading && (
                    <div className="font-bold text-amber-100 mb-1.5">{platform.heading}</div>
                  )}
                  <ul className="space-y-1">
                    {platform.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * AssignBox — one section's chip stack inside a boss card. Navy header
 * bar with the section title (click to rename), then a vertical stack
 * of full-width character chips, then an "add" affordance.
 *
 * Matches the source spreadsheet's column-of-rows aesthetic: each chip
 * is one row, centered italic name, class colour. Hovering the box
 * reveals the delete × on the header.
 */
function AssignBox({
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
    <div className="group/box flex flex-col gap-px">
      {/* Header */}
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
          className="text-[11px] font-bold text-white text-center bg-[#1e3a5f] border border-[#2c5494] px-2 py-1 outline-none w-full"
          aria-label="Section title"
          style={{ letterSpacing: "0.02em" }}
        />
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => { setTitleDraft(section.title); setEditingTitle(true); }}
            className="w-full text-[11px] font-bold uppercase tracking-wider text-white text-center bg-[#1e3a5f] hover:bg-[#234876] transition border border-[#2c5494] px-2 py-1 truncate"
            title="Click to rename"
            style={{ letterSpacing: "0.02em", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
          >
            {section.title}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover/box:opacity-100 transition text-white/70 hover:text-rose-300 p-0.5"
            aria-label={`Delete section ${section.title}`}
          >
            <X size={10} aria-hidden />
          </button>
        </div>
      )}

      {/* Chip stack */}
      {section.characterIds.map((id, idx) => {
        const c = charsById.get(id);
        if (!c) return null;
        return (
          <CharacterChip
            key={`${id}:${idx}`}
            character={c}
            size="sm"
            onRemove={() => removeChar(idx)}
          />
        );
      })}

      <span className="relative">
        <EmptySlot onClick={() => setPickerOpen(true)} size="sm" />
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
  );
}
