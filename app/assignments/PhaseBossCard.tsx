"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { newSectionId, type AssignSection } from "@/lib/assignments";
import {
  autoFillBossSheet,
  PHASE_BOSS_TEMPLATES,
  slotClass,
  slotEligibility,
  tplSectionId,
  type PhaseBossMeta,
  type PhaseBossSheet,
  type PhaseBossSlug,
  type PhaseSectionTpl,
  type PhaseSlotRule,
} from "@/lib/raid-helper";
import { CLASS_COLOR } from "@/lib/specs";
import { BookOpen, ExternalLink, Eye, Plus, Sparkles, X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";
import { BossGuideModal } from "./BossGuideModal";
import { ZoomImage } from "@/app/components/ui/ZoomImage";
import { EditOnly, useViewMode } from "./ViewModeContext";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";

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
  const [guideOpen, setGuideOpen] = useState(false);
  const sections = sheet.sections ?? [];
  const tpls = PHASE_BOSS_TEMPLATES[boss.slug as PhaseBossSlug] ?? [];
  const tplById = new Map<string, PhaseSectionTpl>(tpls.map(t => [tplSectionId(t.key), t]));
  const hasRuledSlots = tpls.some(t => t.slots?.some(s => s.nth));

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

  function autoFill() {
    const next = autoFillBossSheet(characters, tpls, sheet, { onlyEmpty: true });
    if (JSON.stringify(next) === JSON.stringify(sheet)) {
      toast.message("Nothing to fill — every templated slot is already assigned.");
      return;
    }
    onChange(next);
    toast.success(`${boss.name}: filled the empty slots from the roster.`);
  }

  return (
    <div
      id={`boss-${boss.slug}`}
      className="relative rounded-xl border border-[#2a3650]/80 overflow-visible scroll-mt-20 shadow-[0_14px_34px_-22px_rgba(0,0,0,0.9)]"
      style={{ background: "linear-gradient(180deg, #131b2c, #0e1525)" }}
    >
      {/* Subtle gold sheen at the top, matching the SSC/TK cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
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
          <div className="flex items-center gap-3 flex-shrink-0">
            {boss.guideId && (
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:brightness-125"
                style={{ borderColor: `${boss.accent}44`, background: `${boss.accent}14`, color: boss.accent }}
                title={`Read the ${boss.name} strategy guide`}
              >
                <BookOpen size={12} aria-hidden /> Guide
              </button>
            )}
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {boss.raidShort === "BT" ? "Black Temple" : "Mount Hyjal"}
            </span>
            <EditOnly>
              {hasRuledSlots && (
                <button
                  type="button"
                  onClick={autoFill}
                  disabled={characters.length === 0}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed transition whitespace-nowrap"
                  title="Fill this boss's empty templated slots from the imported roster"
                >
                  <Sparkles size={11} aria-hidden /> Auto-fill
                </button>
              )}
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
          <div className="col-span-12 md:col-span-5 lg:col-span-5">
            <StrategyPanel boss={boss} />
          </div>

          <div className="col-span-12 md:col-span-7 lg:col-span-7 min-w-0">
            {sections.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#2e3a55] px-3 py-6 text-center text-[12px] text-neutral-500 italic">
                {readOnly
                  ? "No assignments posted for this boss yet."
                  : "No assignments yet — add sections by hand, or wait for the boss-sheet templates."}
              </div>
            ) : (
              // Sections cluster under their template's fight phase (when
              // set — Illidan P1/P2/P3/P5); phaseless sections render in a
              // single unlabeled group.
              (() => {
                const clusters: Array<{ phase: string | null; secs: AssignSection[] }> = [];
                for (const s of sections) {
                  const phase = tplById.get(s.id)?.phase ?? null;
                  const last = clusters[clusters.length - 1];
                  if (last && last.phase === phase) last.secs.push(s);
                  else clusters.push({ phase, secs: [s] });
                }
                const renderSec = (s: AssignSection) => {
                  const tpl = tplById.get(s.id);
                  return tpl ? (
                    <TplSectionBox
                      key={s.id}
                      tpl={tpl}
                      section={s}
                      accent={boss.accent}
                      onPatch={patch => patchSection(s.id, patch)}
                      characters={characters}
                      charsById={charsById}
                    />
                  ) : (
                    <PhaseSectionBox
                      key={s.id}
                      section={s}
                      accent={boss.accent}
                      onPatch={patch => patchSection(s.id, patch)}
                      onDelete={() => deleteSection(s.id)}
                      characters={characters}
                      charsById={charsById}
                    />
                  );
                };
                return (
                  <div className="space-y-3">
                    {clusters.map((c, i) => (
                      <div key={i} className="space-y-2">
                        {c.phase && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span
                              className="text-[11px] font-bold uppercase tracking-[0.16em]"
                              style={{ color: boss.accent }}
                            >
                              {c.phase}
                            </span>
                            <span
                              aria-hidden
                              className="h-px flex-1"
                              style={{ background: `linear-gradient(90deg, ${boss.accent}44, transparent)` }}
                            />
                          </div>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {c.secs.map(renderSec)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}

            <BossNotes
              notes={sheet.notes ?? ""}
              onChange={notes => onChange({ ...sheet, notes: notes || undefined })}
            />
          </div>
        </div>
      </div>

      {guideOpen && <BossGuideModal boss={boss} onClose={() => setGuideOpen(false)} />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

/**
 * Left-rail strategy panel. Renders the boss's platform diagram(s) —
 * multi-phase fights (Illidan) stack labeled images; each opens the
 * full-size original in a new tab. Falls back to a quiet accent-tinted
 * placeholder if no image is configured or it fails to load.
 */
function StrategyPanel({ boss }: { boss: PhaseBossMeta }) {
  const [erroredSrcs, setErroredSrcs] = useState<ReadonlySet<string>>(new Set());
  const images: Array<{ label?: string; src: string }> =
    boss.strategies?.length
      ? [...boss.strategies]
      : boss.strategy
        ? [{ src: boss.strategy }]
        : [];
  const visible = images.filter(img => !erroredSrcs.has(img.src));

  if (visible.length > 0) {
    return (
      <div className="space-y-2">
        {visible.map(img => (
          <figure key={img.src}>
            {img.label && (
              <figcaption
                className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: boss.accent }}
              >
                {img.label}
              </figcaption>
            )}
            <ZoomImage
              src={img.src}
              alt={`${boss.name}${img.label ? ` ${img.label}` : ""} strategy diagram`}
              caption={`${boss.name}${img.label ? ` — ${img.label}` : ""}`}
              onError={() => setErroredSrcs(prev => new Set([...prev, img.src]))}
              imgClassName="w-full rounded-md border border-[#2e3a55] transition hover:border-amber-400/60 hover:shadow-[0_0_0_2px_rgba(212,175,55,0.15)]"
            />
          </figure>
        ))}
      </div>
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

/**
 * A templated assignment box transcribed from the guild's Google Sheet:
 * fixed labeled slots (empty slots show the class-tinted callsign —
 * "Feral 1", "Hunter 2" — exactly like the sheet), optional Misdirect
 * icons per row, read-only tip rows, and an external link bar. Title
 * and shape are template-owned, so there's no rename/delete here; the
 * picker scopes each slot to its rule's specs/class.
 */
function TplSectionBox({
  tpl,
  section,
  accent,
  onPatch,
  characters,
  charsById,
}: {
  tpl: PhaseSectionTpl;
  section: AssignSection;
  accent: string;
  onPatch: (patch: Partial<AssignSection>) => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  const { readOnly } = useViewMode();
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const slotRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const slots = tpl.slots ?? [];
  const ids = [...section.characterIds];
  while (ids.length < slots.length) ids.push(0);
  const assigned = new Set(ids.filter(id => id > 0));

  function setSlot(idx: number, id: number) {
    const next = [...ids];
    next[idx] = id;
    onPatch({ characterIds: next });
    setOpenSlot(null);
  }

  return (
    <div className="rounded-lg border border-white/[0.08] bg-black/25 overflow-visible">
      <div className="rounded-t-lg bg-white/[0.07] border-b border-white/[0.07] text-center text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-200 py-1 px-2 truncate">
        {tpl.title}
      </div>
      {tpl.subtitle && (
        <div
          className="border-b border-white/[0.07] text-center text-[10px] font-bold text-white py-0.5 px-2 truncate"
          style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
        >
          {tpl.subtitle}
        </div>
      )}
      <div className="flex flex-col gap-[3px] p-1">
        {slots.map((rule, i) => (
          <TplSlotRow
            key={i}
            rule={rule}
            char={ids[i] ? charsById.get(ids[i]) ?? null : null}
            readOnly={readOnly}
            open={openSlot === i}
            slotRef={el => { slotRefs.current[i] = el; }}
            onToggle={() => setOpenSlot(prev => (prev === i ? null : i))}
            onRemove={() => setSlot(i, 0)}
            picker={
              openSlot === i ? (
                <CharacterPicker
                  characters={characters}
                  excludeIds={new Set([...assigned].filter(id => id !== ids[i]))}
                  eligibility={slotEligibility(rule)}
                  onPick={c => setSlot(i, c.id)}
                  onClose={() => setOpenSlot(null)}
                  anchorRef={{ current: slotRefs.current[i] }}
                />
              ) : null
            }
          />
        ))}
        {tpl.staticItems?.map((item, i) => (
          <div
            key={`static-${i}`}
            className="rounded-[4px] bg-white/[0.05] px-2 py-1 text-center text-[11px] font-semibold italic text-neutral-300"
          >
            {item}
          </div>
        ))}
        {tpl.links?.map(l => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-[4px] bg-white/[0.04] px-2 py-1.5 text-center text-[11px] font-semibold text-sky-300 underline decoration-sky-300/40 underline-offset-2 transition hover:text-sky-200"
          >
            {l.label}
            <ExternalLink size={10} aria-hidden />
          </a>
        ))}
      </div>
      <span aria-hidden className="block h-0.5" style={{ background: `${accent}55` }} />
    </div>
  );
}

/** One labeled slot row: [MD icon?] then the chip, or the class-tinted
 *  callsign while unfilled. */
function TplSlotRow({
  rule,
  char,
  readOnly,
  open,
  slotRef,
  onToggle,
  onRemove,
  picker,
}: {
  rule: PhaseSlotRule;
  char: AssignableCharacter | null;
  readOnly: boolean;
  open: boolean;
  slotRef: (el: HTMLDivElement | null) => void;
  onToggle: () => void;
  onRemove: () => void;
  picker: React.ReactNode;
}) {
  const cls = slotClass(rule);
  const color = cls ? CLASS_COLOR[cls] ?? "#9aa4b2" : "#9aa4b2";
  const isOpenSlot = rule.label === "Open";

  return (
    <div ref={slotRef} className="relative flex items-stretch gap-px">
      {rule.pos && (
        <span
          className="flex w-7 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold"
          style={{ background: "#c9897a", color: "#1a1a1a" }}
        >
          {rule.pos}
        </span>
      )}
      {rule.icon && (
        <span className="flex w-6 shrink-0 items-center justify-center rounded-[4px] bg-black/40">
          <img
            src={`${ICON_BASE}${rule.icon}.jpg`}
            alt=""
            width={16}
            height={16}
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            className="h-4 w-4 rounded-[2px] ring-1 ring-black/60"
          />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {char ? (
          <CharacterChip
            character={char}
            size="sm"
            onRemove={onRemove}
            onClick={onToggle}
          />
        ) : (
          <button
            type="button"
            onClick={readOnly ? undefined : onToggle}
            disabled={readOnly}
            title={readOnly ? rule.label : `Assign ${rule.label}`}
            className={`flex w-full items-center justify-center rounded-[4px] border border-dashed px-2 py-1 text-center text-[12px] font-semibold italic leading-snug transition ${
              readOnly ? "cursor-default" : "hover:brightness-125"
            }`}
            style={
              isOpenSlot
                ? { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "#6b7280" }
                : { background: `${color}2b`, borderColor: `${color}66`, color }
            }
          >
            {rule.label}
          </button>
        )}
      </div>
      {picker}
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
    <div className="group/sec rounded-lg border border-white/[0.08] bg-black/25 overflow-visible">
      <div className="relative flex items-center rounded-t-lg bg-white/[0.07] border-b border-white/[0.07]">
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
      <div className="flex flex-col gap-[3px] p-1">
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
