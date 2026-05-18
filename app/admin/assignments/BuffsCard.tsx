"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  defaultBuffs,
  newSectionId,
  suggestFillSections,
  type AssignSection,
  type AssignmentData,
} from "@/lib/assignments";
import { Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { CharacterChip, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large/";

/**
 * Buffs & Assignments card. Renders the buff/dispel sections (PI, Fort,
 * Blessings, Soulstones, etc.) as a grid of editable rows. Each row has
 * an icon, an inline-editable title, a horizontal chip strip, an Add
 * button (opens the team-scoped character picker), and a Delete button.
 *
 * Sections live in `data.buffs` as an array of {id, title, iconSlug,
 * characterIds}. New AssignmentSheets seed with the canonical 18-row
 * template (see lib/assignments.ts BUFF_TEMPLATE); admins can rename,
 * add, delete, or reset to defaults.
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
      { id: newSectionId(), title: "New buff", iconSlug: undefined, characterIds: [] },
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

  return (
    <div className="panel p-3">
      <div className="flex items-baseline justify-between mb-2 gap-3 flex-wrap">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">
          Buffs & Assignments
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-500 tabular-nums">{data.buffs.length} sections</span>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
        {data.buffs.map(section => (
          <BuffRow
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

      <button
        type="button"
        onClick={addSection}
        className="mt-3 inline-flex items-center gap-1 text-xs text-vermillion-300 hover:text-vermillion-200 transition"
      >
        <Plus size={12} aria-hidden /> Add section
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

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

  const excludeIds = new Set(section.characterIds);
  const iconSrc = section.iconSlug ? `${ICON_BASE}${section.iconSlug}.jpg` : null;

  return (
    <div className="group/row rounded-md border border-white/10 bg-black/20 p-2">
      <div className="flex items-center gap-2 mb-1.5">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            width={20}
            height={20}
            className="rounded-sm ring-1 ring-white/10 flex-shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
          />
        ) : (
          <span className="w-5 h-5 rounded-sm border border-dashed border-white/20 flex-shrink-0" aria-hidden />
        )}
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
            className="flex-1 text-left text-xs font-semibold text-neutral-100 hover:text-vermillion-200 transition truncate"
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
            title={teamRosterIds.length === 0 ? "Add a character to the team's groups first" : "Add character"}
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
