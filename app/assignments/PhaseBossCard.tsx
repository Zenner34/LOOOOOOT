"use client";

import { useRef, useState } from "react";
import { newSectionId, type AssignSection } from "@/lib/assignments";
import type { PhaseBossMeta, PhaseBossSheet } from "@/lib/raid-helper";
import { Plus, X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { EditOnly, useViewMode } from "./ViewModeContext";

/**
 * One boss's assignment card on the BT/Hyjal sheet. Starts as a shell —
 * a header plus freeform sections (title + character chips) and a notes
 * box the admin fills by hand. Per-boss templates that auto-fill from
 * the Raid-Helper import land here once the assignment spreadsheet
 * content is supplied.
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

  const hasContent = sections.length > 0 || !!sheet.notes;

  return (
    <div
      id={`boss-${boss.slug}`}
      className="rounded-lg border border-[#2a3650] p-3 scroll-mt-20"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
    >
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div
          className="text-xs font-bold uppercase tracking-wider text-white px-3 py-1 border rounded inline-flex items-center gap-2"
          style={{
            background: "linear-gradient(180deg, #234876, #1e3a5f)",
            borderColor: "#2c5494",
            textShadow: "0 1px 0 rgba(0,0,0,0.4)",
          }}
        >
          <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: boss.accent }} />
          {boss.name}
        </div>
        <EditOnly>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-vermillion-200 transition"
          >
            <Plus size={11} aria-hidden /> Add section
          </button>
        </EditOnly>
      </div>

      {!hasContent ? (
        <div className="text-[12px] text-neutral-500 italic px-1 py-2">
          {readOnly
            ? "No assignments posted for this boss yet."
            : "No assignments yet — add sections by hand, or wait for the boss-sheet import."}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
