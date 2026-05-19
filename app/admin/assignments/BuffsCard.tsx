"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BUFF_COLUMNS,
  BUFF_TOOLTIPS,
  defaultBuffs,
  newSectionId,
  suggestFillSections,
  type AssignSection,
  type AssignmentData,
} from "@/lib/assignments";
import { Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { Tooltip } from "@/app/components/ui/Tooltip";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { EditOnly, useViewMode } from "./ViewModeContext";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large/";

/**
 * Buffs & Assignments card — matches the mockup's 4-column grouped
 * layout. Sections with a common title prefix collapse into one block
 * with the icon + category at the top and `[scope]  [chip-or-add]`
 * rows beneath. Title format: "Category · Scope" (e.g., "Power
 * Infusion · G1-3"). Sections without a "·" render in a one-off block.
 *
 * Inline title edit, click-to-rename, hover-reveal delete; the cmdk
 * picker filters by eligibility and is scoped to the team roster.
 */
export function BuffsCard({
  data,
  setData,
  characters,
  teamRosterIds,
  teamRosterChars,
  charsById,
}: {
  data: AssignmentData;
  setData: (d: AssignmentData) => void;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  teamRosterChars: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  function updateSections(next: AssignSection[]) {
    setData({ ...data, buffs: next });
  }

  function patchSection(id: string, patch: Partial<AssignSection>) {
    updateSections(data.buffs.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }

  function deleteSection(id: string) {
    updateSections(data.buffs.filter(s => s.id !== id));
  }

  function addSection() {
    updateSections([
      ...data.buffs,
      { id: newSectionId(), title: "New buff · slot", iconSlug: undefined, characterIds: [] },
    ]);
  }

  function resetToDefaults() {
    if (!confirm("Replace the current buffs panel with the 18 default sections? Any custom edits will be lost.")) return;
    updateSections(defaultBuffs());
    toast.success("Buffs reset to defaults.");
  }

  function suggestFills() {
    const next = suggestFillSections(data.buffs, teamRosterChars);
    const filled = next.filter((s, i) => s.characterIds.length !== data.buffs[i].characterIds.length).length;
    if (filled === 0) {
      toast.message("Nothing to suggest — every eligible buff section is already filled.");
      return;
    }
    updateSections(next);
    toast.success(`Filled ${filled} buff section${filled === 1 ? "" : "s"} from team roster.`);
  }

  // Group consecutive sections by category (title before " · "). Falls
  // back to the full title when there's no separator. Groups preserve
  // input order so admin edits don't reshuffle anything.
  const grouped = useMemo(() => groupByCategory(data.buffs), [data.buffs]);

  return (
    <div
      id="buffs"
      className="rounded-lg border border-[#2a3650] p-3 scroll-mt-20"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
    >
      <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
        <div
          className="text-xs font-bold uppercase tracking-wider text-white text-center px-3 py-1 border border-[#2c5494] rounded"
          style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
        >
          Buffs &amp; Assignments
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-500 tabular-nums">{data.buffs.length} sections</span>
          <EditOnly>
            <button
              type="button"
              onClick={suggestFills}
              disabled={teamRosterIds.length === 0}
              className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Auto-fill empty buff sections using the team's roster classes"
            >
              <Sparkles size={11} aria-hidden /> Suggest
            </button>
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-[11px] text-neutral-400 hover:text-vermillion-200 transition"
            >
              Reset to defaults
            </button>
          </EditOnly>
        </div>
      </div>

      {(() => {
        // Split the category-grouped blocks into the three explicit
        // columns defined by BUFF_COLUMNS. Categories without a
        // column mapping fall into "right" as a sensible default.
        const cols = { left: [] as typeof grouped, middle: [] as typeof grouped, right: [] as typeof grouped };
        for (const g of grouped) {
          const col = BUFF_COLUMNS[g.category] ?? "right";
          cols[col].push(g);
        }
        function renderBlocks(list: typeof grouped) {
          return list.map(g => (
            <BuffGroup
              key={g.key}
              heading={g.category}
              iconSlug={g.iconSlug}
              sections={g.sections}
              characters={characters}
              teamRosterIds={teamRosterIds}
              charsById={charsById}
              onPatch={patchSection}
              onDelete={deleteSection}
              onAddSibling={() => {
                const last = g.sections[g.sections.length - 1];
                const insertAfter = data.buffs.findIndex(s => s.id === last.id);
                // New siblings always default to a single slot — matches
                // "everywhere else" behaviour. The block's multi-slot
                // row (e.g. PoF · G1-5 with 3 priests) stays the way it
                // was; a new sibling under it is just one slot.
                const sibling: AssignSection = {
                  id: newSectionId(),
                  title: `${g.category} · `,
                  iconSlug: last.iconSlug,
                  rowIconSlug: last.rowIconSlug,
                  eligibility: last.eligibility,
                  slotEligibility: undefined,
                  fixedSlots: 1,
                  targetSlots: undefined,
                  characterIds: [],
                };
                const next = [...data.buffs];
                next.splice(insertAfter + 1, 0, sibling);
                updateSections(next);
              }}
            />
          ));
        }
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-start">
            <div className="flex flex-col gap-3">{renderBlocks(cols.left)}</div>
            <div className="flex flex-col gap-3">{renderBlocks(cols.middle)}</div>
            <div className="flex flex-col gap-3">{renderBlocks(cols.right)}</div>
          </div>
        );
      })()}

      <EditOnly>
        <button
          type="button"
          onClick={addSection}
          className="mt-3 inline-flex items-center gap-1 text-xs text-vermillion-300 hover:text-vermillion-200 transition"
        >
          <Plus size={12} aria-hidden /> New buff category
        </button>
      </EditOnly>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function BuffGroup({
  heading,
  iconSlug,
  sections,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
  onDelete,
  onAddSibling,
}: {
  heading: string;
  iconSlug?: string;
  sections: AssignSection[];
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (id: string, patch: Partial<AssignSection>) => void;
  onDelete: (id: string) => void;
  onAddSibling: () => void;
}) {
  const iconSrc = iconSlug ? `${ICON_BASE}${iconSlug}.jpg` : null;
  const tooltipText = BUFF_TOOLTIPS[heading];
  // Hide the block header icon when every row inside already carries
  // its own rowIconSlug (Paladin Seals, BoP, Greater Blessings, Earth
  // Shield, Innervate, Soulstones, Curses, Debuffs). Keeps the header
  // icon for PoF / GotW / Arcane Brilliance, where rows aren't
  // icon-labelled.
  const allRowsHaveIcons = sections.length > 0 && sections.every(s => !!s.rowIconSlug);
  const showHeaderIcon = !allRowsHaveIcons;
  const headerRow = (
    <div className="flex items-center gap-2 cursor-help">
      {showHeaderIcon && (
        iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            width={22}
            height={22}
            className="border border-[#2e3a55] rounded-sm flex-shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
          />
        ) : (
          <span className="w-[22px] h-[22px] border border-dashed border-white/15 rounded-sm flex-shrink-0" aria-hidden />
        )
      )}
      <span className="text-[11px] uppercase tracking-wider text-slate-300 truncate flex-1">{heading}</span>
    </div>
  );
  return (
    <div className="group/block flex flex-col gap-1 rounded-md border border-white/10 bg-black/15 p-2">
      <div className="flex items-center gap-1">
        <div className="flex-1 min-w-0">
          {tooltipText ? (
            <Tooltip content={tooltipText} side="top">
              {headerRow}
            </Tooltip>
          ) : headerRow}
        </div>
        <EditOnly>
          <button
            type="button"
            onClick={onAddSibling}
            className="opacity-0 group-hover/block:opacity-100 transition text-neutral-500 hover:text-vermillion-200 px-1 -mr-1 flex-shrink-0"
            aria-label={`Add row to ${heading}`}
            title={`Add another row to ${heading} (e.g. split G1-3 / G4-5)`}
          >
            <Plus size={12} aria-hidden />
          </button>
        </EditOnly>
      </div>
      <div className="flex flex-col gap-px">
        {sections.map(s => (
          <BuffRow
            key={s.id}
            section={s}
            characters={characters}
            teamRosterIds={teamRosterIds}
            charsById={charsById}
            onPatch={patch => onPatch(s.id, patch)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function BuffRow({
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
  const [editingScope, setEditingScope] = useState(false);
  const [scopeDraft, setScopeDraft] = useState(scopeOf(section.title));
  const { readOnly } = useViewMode();

  function commitScope() {
    setEditingScope(false);
    const next = scopeDraft.trim();
    const category = categoryOf(section.title);
    const newTitle = next ? `${category} · ${next}` : category;
    if (newTitle !== section.title) onPatch({ title: newTitle });
  }

  const scope = scopeOf(section.title);
  const isFixed = (section.fixedSlots ?? 0) > 0;
  const rowIconSrc = section.rowIconSlug ? `${ICON_BASE}${section.rowIconSlug}.jpg` : null;

  return (
    <div className="group/row grid grid-cols-[56px_1fr_auto] gap-px items-stretch">
      {/* Row label (left) — spell icon if rowIconSlug is set, else
          navy scope-text bar (editable). */}
      {rowIconSrc ? (
        <div
          className="flex items-center justify-center bg-[#1a2236] border border-[#2c5494]"
          title={scope || section.title}
        >
          <img
            src={rowIconSrc}
            alt={scope || section.title}
            width={22}
            height={22}
            className="rounded-sm"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
          />
        </div>
      ) : editingScope && !readOnly ? (
        <input
          autoFocus
          value={scopeDraft}
          onChange={e => setScopeDraft(e.target.value)}
          onBlur={commitScope}
          onKeyDown={e => {
            if (e.key === "Enter") commitScope();
            if (e.key === "Escape") { setEditingScope(false); setScopeDraft(scope); }
          }}
          className="text-[10px] font-bold text-white text-center bg-[#1e3a5f] border border-[#2c5494] px-1 py-1 outline-none"
          aria-label="Scope label"
        />
      ) : (
        <button
          type="button"
          onClick={() => { if (readOnly) return; setScopeDraft(scope); setEditingScope(true); }}
          className={`text-[10px] font-bold uppercase tracking-wider text-white text-center bg-[#1e3a5f] border border-[#2c5494] px-1 py-1 truncate leading-tight ${readOnly ? "cursor-default" : "hover:bg-[#234876] transition"}`}
          title={readOnly ? undefined : "Click to rename"}
          style={{ textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
        >
          {scope || "—"}
        </button>
      )}

      {/* Chip stack (middle) */}
      <div className="relative flex flex-col gap-px min-w-0">
        {isFixed
          ? <FixedSlotStack
              section={section}
              characters={characters}
              teamRosterIds={teamRosterIds}
              charsById={charsById}
              onPatch={onPatch}
            />
          : <GrowableSlotStack
              section={section}
              characters={characters}
              teamRosterIds={teamRosterIds}
              charsById={charsById}
              onPatch={onPatch}
            />}
      </div>

      {/* Row delete (right, hover-revealed; hidden in raider view) */}
      {!readOnly && (
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover/row:opacity-100 transition text-neutral-500 hover:text-rose-300 px-1 self-center"
          aria-label={`Delete ${section.title}`}
        >
          <X size={10} aria-hidden />
        </button>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Renders exactly `section.fixedSlots` rows. Paired sections (Innervate
 * Druid + Mage, BoP Paladin + Warlock) detect via slotEligibility
 * matching slot count and render the slots SIDE-BY-SIDE in a grid so
 * the pair reads as one row. Other fixed sections (PoF 3 priests,
 * Soulstone Targets 5 rezz order, single-paladin blessings) stack
 * vertically.
 */
function FixedSlotStack({
  section,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  section: AssignSection;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<AssignSection>) => void;
}) {
  const slotCount = section.fixedSlots ?? 0;
  // Pair layout: explicit per-slot eligibility with matching length.
  const horizontal =
    slotCount > 1 &&
    (section.slotEligibility?.length ?? 0) === slotCount;

  const slots = Array.from({ length: slotCount }, (_, idx) => (
    <FixedSlot
      key={idx}
      idx={idx}
      section={section}
      characters={characters}
      teamRosterIds={teamRosterIds}
      charsById={charsById}
      onPatch={onPatch}
    />
  ));

  if (horizontal) {
    return (
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${slotCount}, minmax(0, 1fr))` }}
      >
        {slots}
      </div>
    );
  }
  return <div className="flex flex-col gap-px">{slots}</div>;
}

function FixedSlot({
  idx,
  section,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  idx: number;
  section: AssignSection;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<AssignSection>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = section.characterIds[idx];
  const c = id ? charsById.get(id) : null;
  const elig = section.slotEligibility?.[idx] ?? section.eligibility;
  const excludeIds = new Set(section.characterIds.filter((v, i) => i !== idx));

  function setSlot(charId: number | null) {
    const next = [...section.characterIds];
    while (next.length <= idx) next.push(0);
    next[idx] = charId ?? 0;
    // Trim trailing zeros so the array stays compact (but preserve
    // earlier zeros for sparse pairs like [0, 12]).
    while (next.length > 0 && next[next.length - 1] === 0) next.pop();
    onPatch({ characterIds: next });
  }

  return (
    <div ref={ref} className="relative">
      {c ? (
        <CharacterChip
          character={c}
          size="sm"
          onRemove={() => setSlot(null)}
          onClick={() => setOpen(o => !o)}
        />
      ) : (
        <EmptySlot onClick={() => setOpen(o => !o)} size="sm" />
      )}
      {open && (
        <CharacterPicker
          characters={characters}
          scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
          excludeIds={excludeIds}
          eligibility={elig}
          onPick={picked => { setSlot(picked.id); setOpen(false); }}
          onClose={() => setOpen(false)}
          anchorRef={ref as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  );
}

/**
 * Growable list: render existing chips + 1 "add" affordance at the
 * bottom. Used for sections without fixedSlots (e.g., Greater Blessings
 * targets, Arcane Brilliance, etc.).
 */
function GrowableSlotStack({
  section,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  section: AssignSection;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<AssignSection>) => void;
}) {
  const [open, setOpen] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const excludeIds = new Set(section.characterIds);

  function addChar(c: AssignableCharacter) {
    onPatch({ characterIds: [...section.characterIds, c.id] });
    setOpen(false);
  }

  function removeChar(idx: number) {
    const next = [...section.characterIds];
    next.splice(idx, 1);
    onPatch({ characterIds: next });
  }

  return (
    <div ref={slotRef} className="relative flex flex-col gap-px">
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
      <EmptySlot onClick={() => setOpen(true)} size="sm" />
      {open && (
        <CharacterPicker
          characters={characters}
          scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
          excludeIds={excludeIds}
          eligibility={section.eligibility}
          onPick={addChar}
          onClose={() => setOpen(false)}
          anchorRef={slotRef as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function categoryOf(title: string): string {
  const i = title.indexOf("·");
  return i === -1 ? title : title.slice(0, i).trim();
}

function scopeOf(title: string): string {
  const i = title.indexOf("·");
  return i === -1 ? "" : title.slice(i + 1).trim();
}

function groupByCategory(sections: AssignSection[]): Array<{ key: string; category: string; iconSlug?: string; sections: AssignSection[] }> {
  const groups: Array<{ key: string; category: string; iconSlug?: string; sections: AssignSection[] }> = [];
  for (const s of sections) {
    const cat = categoryOf(s.title);
    const last = groups[groups.length - 1];
    if (last && last.category === cat) {
      last.sections.push(s);
    } else {
      groups.push({ key: `${cat}-${groups.length}`, category: cat, iconSlug: s.iconSlug, sections: [s] });
    }
  }
  return groups;
}
