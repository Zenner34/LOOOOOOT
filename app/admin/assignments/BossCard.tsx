"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  ASSIGNMENT_BOSSES,
  VASHJ_P2_TIMELINE,
  bossPlatformInfo,
  defaultBossAssignment,
  newSectionId,
  sectionTemplateForBoss,
  suggestFillSections,
  type AssignSection,
  type AssignmentData,
  type BossAssignment,
  type BossMeta,
  type BossSlug,
  type SectionAddOn,
} from "@/lib/assignments";
import { Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { EditOnly, useViewMode } from "./ViewModeContext";

const BOSS_INFO = Object.fromEntries(ASSIGNMENT_BOSSES.map(b => [b.slug, b])) as Record<BossSlug, BossMeta>;

/**
 * Portrait row above the platform-info panel. Renders one or two
 * boss portraits side-by-side. If `portraitAlt` is set but its file
 * is missing/404s, the grid collapses back to a single column so
 * there's no awkward empty cell.
 */
/**
 * Strategy diagram thumbnail with a click-to-zoom lightbox. The
 * thumbnail fits the left rail; clicking opens a centered overlay at
 * the image's natural size (capped to viewport). Closes via the close
 * button, the backdrop, or the Escape key.
 *
 * The overlay is rendered into a portal at document.body. The
 * AssignmentsClient root uses a CSS transform (`-translate-x-1/2`),
 * which scopes `position: fixed` to the parent rather than the
 * viewport — without the portal the centered image would land
 * somewhere down the long page, not in front of the user.
 */
function StrategyImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [errored, setErrored] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (errored) return null;

  const overlay = open && mounted ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <img
        src={src}
        alt={alt}
        className="relative max-w-full max-h-full rounded-md shadow-2xl border border-white/10 cursor-zoom-out"
        onClick={() => setOpen(false)}
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition"
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full group/strategy"
        aria-label={`${alt} (click to enlarge)`}
        title="Click to enlarge"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full rounded-md border border-[#2e3a55] transition group-hover/strategy:border-amber-400/60 group-hover/strategy:shadow-[0_0_0_2px_rgba(212,175,55,0.15)]"
        />
      </button>
      {overlay && createPortal(overlay, document.body)}
    </>
  );
}

function PortraitRow({ meta }: { meta: BossMeta }) {
  const [altErrored, setAltErrored] = useState(false);
  const showAlt = !!meta.portraitAlt && !altErrored;
  // Crop focus: most boss screenshots are full-body shots framed with
  // a lot of empty space below the boss. Default `object-cover`
  // centers the crop and chops the face off. Pin to top so the
  // boss's face stays in frame. A few portraits read better
  // centered — Lurker and Al'ar are tight crops, Fathom-Lord's
  // composition puts the face in the middle.
  const cropCenter = ["lurker", "alar", "fathom"].includes(meta.slug);
  const cropClass = cropCenter ? "object-center" : "object-top";
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: showAlt ? "repeat(2, minmax(0, 1fr))" : "1fr" }}
    >
      <img
        src={meta.portrait}
        alt={`${meta.name} portrait`}
        loading="lazy"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        className={`aspect-[16/9] w-full rounded-md border border-[#2e3a55] object-cover ${cropClass} bg-[#0e1525]`}
      />
      {showAlt && (
        <img
          src={meta.portraitAlt}
          alt={`${meta.name} alternate portrait`}
          loading="lazy"
          onError={() => setAltErrored(true)}
          className={`aspect-[16/9] w-full rounded-md border border-[#2e3a55] object-cover ${cropClass} bg-[#0e1525]`}
        />
      )}
    </div>
  );
}

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
      id={`boss-${slug}`}
      className="relative rounded-lg border border-[#2a3650] overflow-visible scroll-mt-20"
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
            <EditOnly>
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
            </EditOnly>
          </div>
        </div>

        {/* Body. Strategy image lives in the left rail by default —
            small enough to glance at, big enough to read. Phases that
            ship multiple strategy images OR a kill-order grid (only
            Vashj P2 today) opt into a "bottom band" rendered inside
            the right column below the assignments — never full page
            width, since that made the maps overwhelming. */}
        {(() => {
          const useBottomBand = platform.strategyImages.length > 1 || platform.dpsPriorityImages.length > 0;
          // Per-boss layout: most bosses split the rail-top horizontally
          // (portrait | info). Hydross is the only stacked layout —
          // both frost + nature portraits need full-rail width to
          // render side-by-side at a usable size.
          const stackedPortraitInfo = slug === "hydross";
          const notesPanel = (
            <div
              className="rounded-md border border-[#2e3a55] p-3 text-[11px] leading-snug text-slate-300"
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
          );
          return (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-5 space-y-3">
            {stackedPortraitInfo ? (
              <>
                <PortraitRow meta={meta} />
                {notesPanel}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <PortraitRow meta={meta} />
                {notesPanel}
              </div>
            )}

            {/* Strategy image in the left rail for single-map phases.
                Multi-image phases (Vashj P2) defer to the bottom band
                inside the right column. */}
            {!useBottomBand && platform.strategyImages.length === 1 && (
              <StrategyImage
                src={platform.strategyImages[0]}
                alt={`${meta.name} placement diagram`}
              />
            )}
          </div>

          <div className="col-span-12 md:col-span-7 min-w-0">
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

            {/* Assignments grid — fills the right column now that the
                platform-art panel has moved to the left rail. */}
            {activeSections.length === 0 ? (
              <div className="text-[11px] text-neutral-500 italic">No sections in this phase.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {(() => {
                  // Walk activeSections and bucket consecutive ones
                  // sharing a `rowGroup` template hint into a single
                  // render unit. Solo sections render as today.
                  type Unit =
                    | { kind: "solo"; section: AssignSection }
                    | { kind: "group"; groupTitle: string; sections: AssignSection[] };
                  const units: Unit[] = [];
                  for (const section of activeSections) {
                    const tpl = sectionTemplateForBoss(slug, section.title);
                    const rowGroup = section.rowGroup ?? tpl?.rowGroup;
                    const last = units[units.length - 1];
                    if (rowGroup && last?.kind === "group" && last.groupTitle === rowGroup) {
                      last.sections.push(section);
                    } else if (rowGroup) {
                      units.push({ kind: "group", groupTitle: rowGroup, sections: [section] });
                    } else {
                      units.push({ kind: "solo", section });
                    }
                  }
                  return units.map((unit, unitIdx) => {
                    if (unit.kind === "group") {
                      const firstTpl = sectionTemplateForBoss(slug, unit.sections[0].title);
                      const breakBefore = !!firstTpl?.breakBefore || !!unit.sections[0].breakBefore;
                      return (
                        <div key={`grp-${unitIdx}`} className={breakBefore ? "lg:col-start-1" : undefined}>
                          <GroupedSectionBlock
                            groupTitle={unit.groupTitle}
                            sections={unit.sections}
                            slug={slug}
                            characters={characters}
                            teamRosterIds={teamRosterIds}
                            charsById={charsById}
                            patchSection={patchSection}
                          />
                        </div>
                      );
                    }
                    const tpl = sectionTemplateForBoss(slug, unit.section.title);
                    const breakBefore = unit.section.breakBefore || !!tpl?.breakBefore;
                    const addOnsOnly  = unit.section.addOnsOnly  || !!tpl?.addOnsOnly;
                    return (
                      <div key={unit.section.id} className={breakBefore ? "lg:col-start-1" : undefined}>
                        <AssignBox
                          section={unit.section}
                          addOnsOnly={addOnsOnly}
                          characters={characters}
                          teamRosterIds={teamRosterIds}
                          charsById={charsById}
                          onPatch={patch => patchSection(unit.section.id, patch)}
                          onDelete={() => deleteSection(unit.section.id)}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            )}
            <EditOnly>
              <button
                type="button"
                onClick={addSection}
                className="mt-2 inline-flex items-center gap-1 text-xs text-vermillion-300 hover:text-vermillion-200 transition"
              >
                <Plus size={12} aria-hidden /> Add section
              </button>
            </EditOnly>

            {/* Phase opts into the bottom band: multi-image strategy
                (Vashj P2 P2 + P2 Orbs) and the kill-order grid render
                here under the assignments — inside the right column so
                they take col-7 width, not full-page width. */}
            {useBottomBand && (
              <div className="mt-4 space-y-4">
                {platform.strategyImages.length > 0 && (
                  <div
                    className={
                      platform.strategyImages.length > 1
                        ? "grid grid-cols-1 sm:grid-cols-2 gap-2"
                        : ""
                    }
                  >
                    {platform.strategyImages.map((src, i) => (
                      <StrategyImage
                        key={`strat-${i}-${src}`}
                        src={src}
                        alt={`${meta.name} placement diagram ${platform.strategyImages.length > 1 ? i + 1 : ""}`.trim()}
                      />
                    ))}
                  </div>
                )}

                {platform.dpsPriorityImages.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1.5">
                      Kill order
                    </div>
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${platform.dpsPriorityImages.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {platform.dpsPriorityImages.map((item, i) => (
                        <div key={`dps-${i}-${item.src}`} className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[11px]">
                              {i + 1}
                            </span>
                            {item.label && (
                              <span className="text-[11px] text-slate-200 font-semibold truncate">
                                {item.label}
                              </span>
                            )}
                          </div>
                          <StrategyImage
                            src={item.src}
                            alt={item.label ?? `${meta.name} kill priority ${i + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
          );
        })()}
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
  addOnsOnly,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
  onDelete,
}: {
  section: AssignSection;
  /** Hide the trailing "+ add" empty slot — the section is meant to
   *  be just its addOn rows. Existing chips still render. */
  addOnsOnly?: boolean;
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
  const { readOnly } = useViewMode();

  return (
    <div className="group/box flex flex-col gap-px">
      {/* Header */}
      {editingTitle && !readOnly ? (
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
            onClick={() => { if (readOnly) return; setTitleDraft(section.title); setEditingTitle(true); }}
            className={`w-full text-[11px] font-bold uppercase tracking-wider text-white text-center bg-[#1e3a5f] border border-[#2c5494] px-2 py-1 truncate ${readOnly ? "cursor-default" : "hover:bg-[#234876] transition"}`}
            title={readOnly ? undefined : "Click to rename"}
            style={{ letterSpacing: "0.02em", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
          >
            {section.title}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={onDelete}
              className="absolute top-1/2 -translate-y-1/2 right-1 opacity-0 group-hover/box:opacity-100 transition text-white/70 hover:text-rose-300 p-0.5"
              aria-label={`Delete section ${section.title}`}
            >
              <X size={10} aria-hidden />
            </button>
          )}
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

      {!addOnsOnly && (
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
      )}

      {/* AddOn sub-rows. Single addOn renders full-width; multiple
          addOns (e.g. Morogrim Add Tank = Misdirect + Super Sapper)
          render side-by-side in equal columns. The hunter slots within
          a misdirect stay stacked vertically — only the *addOn blocks*
          go side-by-side. */}
      {section.addOns?.length ? (
        <div
          className="grid gap-px items-start"
          style={{ gridTemplateColumns: `repeat(${section.addOns.length}, minmax(0, 1fr))` }}
        >
          {section.addOns.map((addOn, addOnIdx) => (
            <AddOnRow
              key={addOn.id}
              addOn={addOn}
              characters={characters}
              teamRosterIds={teamRosterIds}
              charsById={charsById}
              onPatch={next => {
                const nextAddOns = (section.addOns ?? []).map((a, i) => (i === addOnIdx ? next : a));
                onPatch({ addOns: nextAddOns });
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Renders a collapsed-block view of multiple AssignSections sharing
 * the same `rowGroup` template hint. One navy header (the group's
 * title) sits above a stack of `[direction label | single chip]`
 * rows — used for Vashj P3 Healer Positioning so the five healer-
 * direction sections read as a single block instead of five
 * standalone cards.
 *
 * Each row supports the same picker / chip / remove × interactions as
 * a normal section, just at single-slot scale. Eligibility passes
 * through from each section.
 */
function GroupedSectionBlock({
  groupTitle,
  sections,
  slug,
  characters,
  teamRosterIds,
  charsById,
  patchSection,
}: {
  groupTitle: string;
  sections: AssignSection[];
  slug: BossSlug;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  patchSection: (id: string, patch: Partial<AssignSection>) => void;
}) {
  return (
    <div className="flex flex-col gap-px">
      <div
        className="text-[11px] font-bold uppercase tracking-wider text-white text-center bg-[#1e3a5f] border border-[#2c5494] px-2 py-1 truncate"
        style={{ letterSpacing: "0.02em", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
      >
        {groupTitle}
      </div>
      {sections.map(section => {
        const tpl = sectionTemplateForBoss(slug, section.title);
        const rowLabel = section.rowLabel ?? tpl?.rowLabel ?? section.title;
        return (
          <GroupedRow
            key={section.id}
            section={section}
            rowLabel={rowLabel}
            characters={characters}
            teamRosterIds={teamRosterIds}
            charsById={charsById}
            onPatch={patch => patchSection(section.id, patch)}
          />
        );
      })}
    </div>
  );
}

function GroupedRow({
  section,
  rowLabel,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  section: AssignSection;
  rowLabel: string;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<AssignSection>) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const filled = section.characterIds.filter(id => id > 0);
  const c = filled[0] ? charsById.get(filled[0]) ?? null : null;

  function pickChar(picked: AssignableCharacter) {
    onPatch({ characterIds: [picked.id] });
    setPickerOpen(false);
  }
  function removeChar() {
    onPatch({ characterIds: [] });
  }

  return (
    <div
      className="grid gap-px"
      style={{ gridTemplateColumns: "minmax(60px, max-content) minmax(0, 1fr)" }}
    >
      <div className="flex items-center justify-center bg-[#1e3a5f] border border-[#2c5494] text-white text-[10px] font-bold uppercase tracking-wider px-2 whitespace-nowrap">
        {rowLabel}
      </div>
      <div ref={anchorRef} className="relative">
        {c ? (
          <CharacterChip character={c} size="sm" onRemove={removeChar} onClick={() => setPickerOpen(o => !o)} />
        ) : (
          <EmptySlot size="sm" onClick={() => setPickerOpen(true)} />
        )}
        {pickerOpen && (
          <CharacterPicker
            characters={characters}
            scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
            eligibility={section.eligibility}
            onPick={pickChar}
            onClose={() => setPickerOpen(false)}
            anchorRef={anchorRef as React.RefObject<HTMLElement>}
          />
        )}
      </div>
    </div>
  );
}

const SPEC_ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";

/**
 * One add-on row block. Renders [icon-strip | chip] for each FILLED
 * slot, plus a single trailing "+ add" affordance (without icons)
 * when there's room for more. Empty icon rows would be visual noise —
 * the icons only earn their pixels once a character is in the slot.
 */
function AddOnRow({
  addOn,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  addOn: SectionAddOn;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (next: SectionAddOn) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Drop any sentinel 0s from older data; `filled` is now a clean
  // list of real character ids in display order.
  const filled = addOn.characterIds.filter(id => id > 0).slice(0, addOn.maxSlots);

  function addChar(c: AssignableCharacter) {
    const next = [...filled, c.id].slice(0, addOn.maxSlots);
    onPatch({ ...addOn, characterIds: next });
    setPickerOpen(false);
  }

  function removeChar(idx: number) {
    const next = filled.filter((_, i) => i !== idx);
    onPatch({ ...addOn, characterIds: next });
  }

  // Icon strip: primary slug + any extras. Same visual unit as before;
  // just only rendered when a character occupies the row.
  const icons = [addOn.iconSlug, ...(addOn.extraIcons ?? [])];
  const hasRoom = filled.length < addOn.maxSlots;
  const excludeIds = new Set(filled);

  return (
    <div className="flex flex-col gap-px">
      {filled.map((charId, idx) => {
        const c = charsById.get(charId);
        if (!c) return null;
        return (
          <div
            key={`${charId}:${idx}`}
            className="grid gap-px"
            style={{ gridTemplateColumns: `repeat(${icons.length}, 22px) minmax(0, 1fr)` }}
          >
            {icons.map((slug, iconIdx) => (
              <div
                key={iconIdx}
                className="flex items-center justify-center bg-[#1a1a1a] border border-black"
              >
                <img
                  src={`${SPEC_ICON_BASE}${slug}.jpg`}
                  alt=""
                  width={18}
                  height={18}
                  loading="lazy"
                  className="rounded-[2px]"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ))}
            <CharacterChip character={c} size="sm" onRemove={() => removeChar(idx)} />
          </div>
        );
      })}
      {hasRoom && (
        <div ref={anchorRef} className="relative">
          <EmptySlot size="sm" onClick={() => setPickerOpen(true)} />
          {pickerOpen && (
            <CharacterPicker
              characters={characters}
              scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
              excludeIds={excludeIds}
              eligibility={addOn.eligibility}
              onPick={addChar}
              onClose={() => setPickerOpen(false)}
              anchorRef={anchorRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>
      )}
    </div>
  );
}
