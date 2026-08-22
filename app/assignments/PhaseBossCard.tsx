"use client";

import { useRef, useState } from "react";
import { newSectionId, type AssignSection } from "@/lib/assignments";
import type { PhaseBossMeta, PhaseBossSheet } from "@/lib/raid-helper";
import { Eye, Plus, X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { EditOnly, useViewMode } from "./ViewModeContext";

/**
 * One boss's assignment card on the BT/Hyjal sheet, laid out like the
 * SSC/TK cards:
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ [icon] Boss Name (Cinzel, amber)        BLACK TEMPLE  + add  │
 *   ├────────────────┬─────────────────────────────────────────────┤
 *   │  strategy img  │  ┌─ section ─┐ ┌─ section ─┐ ┌─ section ─┐  │
 *   │  (placeholder  │  │ navy hdr  │ │ navy hdr  │ │ navy hdr  │  │
 *   │   until real   │  │ • chips   │ │ • chips   │ │ • chips   │  │
 *   │   art lands)   │  └───────────┘ └───────────┘ └───────────┘  │
 *   │                │  notes                                      │
 *   └────────────────┴─────────────────────────────────────────────┘
 *
 * Sections are freeform (title + chips) until the per-boss templates
 * from the assignment spreadsheet land.
 */
export function PhaseBossCard({
  boss,
  sheet,
  onChange,
  characters,
  charsById,
}: {
  boss: PhaseBossMeta;
  sheet: PhaseBossSheet;
  onChange: (next: PhaseBossSheet) => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  const { readOnly } = useViewMode();
  const sections = sheet.sections ?? [];

  function patchSection(id: string, patch: Partial<AssignSection>) {
    onChange({ ...sheet, sections: sections.map(s => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function deleteSection(id: string) {
    onChange({ ...sheet, sections: sections.filter(s => s.id !== id) });
  }

  function addSection() {
    onChange({
      ...sheet,
      sections: [...sections, { id: newSectionId(), title: "New assignment", characterIds: [] }],
    });
  }

  return (
    <div
      id={`boss-${boss.slug}`}
      className="relative rounded-lg border border-[#2a3650] overflow-visible scroll-mt-20"
      style={{ background: "linear-gradient(180deg, #131b2c, #0e1525)" }}
    >
      {/* Subtle gold sheen at the top, matching the SSC/TK cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{ background: "linear-gradient(180deg, rgba(255,215,128,0.06), transparent 30%)" }}
      />

      <div className="relative p-4">
        {/* Header: icon + name, instance label + actions right */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {boss.icon && (
              <img
                src={boss.icon}
                alt=""
                width={36}
                height={36}
                loading="lazy"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                className="w-9 h-9 shrink-0 rounded-md border border-black/60 object-cover"
                style={{ boxShadow: `0 0 0 1px ${boss.accent}55, 0 2px 8px rgba(0,0,0,0.45)` }}
              />
            )}
            <h3 className="font-display text-2xl text-amber-200 truncate leading-none">
              {boss.name}
            </h3>
          </div>
          <div className="flex items-baseline gap-3 flex-shrink-0">
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {boss.raidShort === "BT" ? "Black Temple" : "Mount Hyjal"}
            </span>
            <EditOnly>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-vermillion-200 transition whitespace-nowrap"
              >
                <Plus size={11} aria-hidden /> Add section
              </button>
            </EditOnly>
          </div>
        </div>

        {/* Body: strategy rail | assignment sections */}
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <StrategyPanel boss={boss} />
          </div>

          <div className="col-span-12 md:col-span-8 lg:col-span-9 min-w-0">
            {sections.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#2e3a55] px-3 py-6 text-center text-[12px] text-neutral-500 italic">
                {readOnly
                  ? "No assignments posted for this boss yet."
                  : "No assignments yet — add sections by hand, or wait for the boss-sheet templates."}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {sections.map(s => (
                  <PhaseSectionBox
                    key={s.id}
                    section={s}
                    accent={boss.accent}
                    onPatch={patch => patchSection(s.id, patch)}
                    onDelete={() => deleteSection(s.id)}
                    characters={characters}
                    charsById={charsById}
                  />
                ))}
              </div>
            )}

            <BossNotes
              notes={sheet.notes ?? ""}
              onChange={notes => onChange({ ...sheet, notes: notes || undefined })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Left-rail strategy panel. Renders the boss's strategy diagram when
 * one is configured; until the real images land it's a quiet accent-
 * tinted placeholder that keeps the SSC/TK card geometry.
 */
function StrategyPanel({ boss }: { boss: PhaseBossMeta }) {
  const [errored, setErrored] = useState(false);
  if (boss.strategy && !errored) {
    return (
      <a
        href={boss.strategy}
        target="_blank"
        rel="noopener noreferrer"
        className="block group/strategy"
        title="Open full size"
      >
        <img
          src={boss.strategy}
          alt={`${boss.name} strategy diagram`}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full rounded-md border border-[#2e3a55] transition group-hover/strategy:border-amber-400/60 group-hover/strategy:shadow-[0_0_0_2px_rgba(212,175,55,0.15)]"
        />
      </a>
    );
  }
  return (
    <div
      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#2e3a55] px-3 text-center"
      style={{ background: `linear-gradient(160deg, ${boss.accent}0c, transparent 70%)` }}
    >
      <Eye size={18} aria-hidden style={{ color: `${boss.accent}88` }} />
      <span className="text-[11px] leading-snug text-slate-500">
        Strategy image
        <br />
        coming soon
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function PhaseSectionBox({
  section,
  accent,
  onPatch,
  onDelete,
  characters,
  charsById,
}: {
  section: AssignSection;
  accent: string;
  onPatch: (patch: Partial<AssignSection>) => void;
  onDelete: () => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  const { readOnly } = useViewMode();
  const [editingTitle, setEditingTitle] = useState(false);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const slotRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const chips = section.characterIds.filter(id => id > 0);

  function addChar(c: AssignableCharacter) {
    onPatch({ characterIds: [...chips, c.id] });
    setOpenSlot(null);
  }

  function removeChar(id: number) {
    onPatch({ characterIds: chips.filter(x => x !== id) });
  }

  return (
    <div className="group/sec rounded border border-black/50 bg-black/20 overflow-visible">
      <div className="relative flex items-center bg-[#1a1a1a] border-b border-black">
        {editingTitle && !readOnly ? (
          <input
            autoFocus
            defaultValue={section.title}
            onBlur={e => { onPatch({ title: e.target.value.trim() || section.title }); setEditingTitle(false); }}
            onKeyDown={e => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="w-full bg-transparent text-center text-[10px] font-bold uppercase tracking-wider text-white py-1 px-2 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => !readOnly && setEditingTitle(true)}
            className={`w-full text-center text-[10px] font-bold uppercase tracking-wider text-white py-1 px-2 truncate ${readOnly ? "cursor-default" : "cursor-text"}`}
            title={readOnly ? section.title : `${section.title} — click to rename`}
          >
            {section.title}
          </button>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${section.title}`}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-neutral-600 opacity-0 group-hover/sec:opacity-100 hover:text-rose-300 transition"
          >
            <X size={11} aria-hidden />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-px p-px">
        {chips.map(id => {
          const c = charsById.get(id);
          if (!c) return null;
          return <CharacterChip key={id} character={c} size="sm" onRemove={() => removeChar(id)} />;
        })}
        <div className="relative" ref={el => { slotRefs.current[0] = el; }}>
          <EmptySlot size="sm" onClick={() => setOpenSlot(prev => (prev === 0 ? null : 0))} />
          {openSlot === 0 && (
            <CharacterPicker
              characters={characters}
              excludeIds={new Set(chips)}
              onPick={addChar}
              onClose={() => setOpenSlot(null)}
              anchorRef={{ current: slotRefs.current[0] }}
            />
          )}
        </div>
        {chips.length === 0 && readOnly && (
          <div className="px-2 py-1 text-[10px] text-neutral-600 italic text-center">unassigned</div>
        )}
      </div>
      <span aria-hidden className="block h-0.5" style={{ background: `${accent}55` }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function BossNotes({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  const { readOnly } = useViewMode();
  if (readOnly) {
    if (!notes) return null;
    return (
      <p className="mt-2 whitespace-pre-wrap text-[12px] leading-relaxed text-neutral-300 border-t border-white/[0.06] pt-2">
        {notes}
      </p>
    );
  }
  return (
    <textarea
      defaultValue={notes}
      onBlur={e => { if (e.target.value !== notes) onChange(e.target.value); }}
      placeholder="Notes for this boss (visible to raiders)…"
      rows={notes ? Math.min(6, notes.split("\n").length + 1) : 1}
      className="mt-2 w-full resize-y rounded border border-white/10 bg-black/25 px-2 py-1.5 text-[12px] leading-relaxed text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-white/25"
    />
  );
}
