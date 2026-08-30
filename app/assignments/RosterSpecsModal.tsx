"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { PhaseMember } from "@/lib/raid-helper";
import { CLASS_COLOR, SPECS } from "@/lib/specs";
import { Plus, X } from "@/app/components/ui/Icon";

export type RosterEdits = {
  specChanges: Record<number, string>;
  additions: Array<{ name: string; spec: string }>;
  removals: number[];
};

/**
 * Per-night roster editor. Three jobs, all scoped to THIS night only:
 *  - correct a raider's spec (Raid-Helper exports whatever the Comp
 *    Tool last held);
 *  - hand-add a sub who wasn't in the comp (any name + spec);
 *  - remove a leaver so every slot and ordinal reflows without them.
 * Saving recomputes tanks, buffs, and every boss assignment.
 */
export function RosterSpecsModal({
  members,
  dayLabel,
  onClose,
  onSave,
}: {
  members: PhaseMember[];
  dayLabel: string;
  onClose: () => void;
  onSave: (edits: RosterEdits) => void;
}) {
  const [changes, setChanges] = useState<Record<number, string>>({});
  const [removals, setRemovals] = useState<Set<number>>(new Set());
  const [additions, setAdditions] = useState<Array<{ name: string; spec: string }>>([]);
  const [newName, setNewName] = useState("");
  const [newSpec, setNewSpec] = useState(SPECS[0].key);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  const specsByClass = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of SPECS) {
      m.set(s.class, [...(m.get(s.class) ?? []), s.key]);
    }
    return m;
  }, []);

  function toggleRemoval(id: number) {
    setRemovals(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addRaider() {
    const name = newName.trim();
    if (!name) return;
    setAdditions(prev => [...prev, { name, spec: newSpec }]);
    setNewName("");
  }

  const changedCount =
    Object.entries(changes).filter(
      ([id, spec]) => !removals.has(Number(id)) && members.find(m => m.id === Number(id))?.spec !== spec,
    ).length + additions.length + removals.size;

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`Edit ${dayLabel} roster`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">
                {dayLabel} roster
              </div>
              <div className="font-semibold">Edit this night&rsquo;s roster</div>
              <p className="mt-1 max-w-sm text-xs text-neutral-500">
                Fix specs, add a sub, or drop a leaver — {dayLabel} only, the other nights keep
                their own rosters. Saving recomputes tanks, buffs, and every boss assignment.
              </p>
            </div>
            <button type="button" onClick={onClose} className="-m-1 p-1 text-neutral-500 hover:text-neutral-200" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <ul className="flex-1 divide-y divide-white/[0.04] overflow-y-auto px-5 py-2">
            {members.map(m => {
              const options = specsByClass.get(m.className) ?? [];
              const value = changes[m.id] ?? m.spec;
              const dirty = value !== m.spec;
              const removing = removals.has(m.id);
              return (
                <li key={m.id} className={`flex items-center gap-3 py-1.5 ${removing ? "opacity-40" : ""}`}>
                  <span
                    className={`w-32 shrink-0 truncate text-sm font-semibold ${removing ? "line-through" : ""}`}
                    style={{ color: CLASS_COLOR[m.className] ?? "#e5e5e5" }}
                    title={`${m.name} — G${m.group || "?"} · signed as ${m.rhSpecName || m.spec}`}
                  >
                    {m.name}
                  </span>
                  <span className="w-7 shrink-0 text-[10px] tabular-nums text-neutral-600">
                    G{m.group || "–"}
                  </span>
                  <select
                    value={value}
                    disabled={removing}
                    onChange={e => setChanges(prev => ({ ...prev, [m.id]: e.target.value }))}
                    className={`input h-8 flex-1 text-xs disabled:opacity-50 ${dirty && !removing ? "border-amber-400/50" : ""}`}
                    aria-label={`${m.name} spec`}
                  >
                    {!options.includes(m.spec) && <option value={m.spec}>{m.spec}</option>}
                    {options.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleRemoval(m.id)}
                    className={`shrink-0 rounded p-1 transition ${
                      removing ? "text-rose-300 hover:text-neutral-300" : "text-neutral-600 hover:text-rose-300"
                    }`}
                    title={removing ? `Keep ${m.name}` : `Remove ${m.name} from ${dayLabel}`}
                    aria-label={removing ? `Keep ${m.name}` : `Remove ${m.name}`}
                  >
                    <X size={13} aria-hidden />
                  </button>
                </li>
              );
            })}

            {additions.map((a, i) => (
              <li key={`add-${i}`} className="flex items-center gap-3 py-1.5">
                <span
                  className="w-32 shrink-0 truncate text-sm font-semibold"
                  style={{ color: CLASS_COLOR[SPECS.find(s => s.key === a.spec)?.class ?? ""] ?? "#e5e5e5" }}
                >
                  {a.name}
                </span>
                <span className="w-7 shrink-0 text-[10px] text-emerald-400">new</span>
                <span className="flex-1 truncate text-xs text-neutral-300">{a.spec}</span>
                <button
                  type="button"
                  onClick={() => setAdditions(prev => prev.filter((_, j) => j !== i))}
                  className="shrink-0 rounded p-1 text-neutral-600 transition hover:text-rose-300"
                  aria-label={`Undo adding ${a.name}`}
                >
                  <X size={13} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          {/* Add a sub on the fly */}
          <div className="border-t border-white/[0.06] px-5 py-3">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Add a raider
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addRaider(); }}
                placeholder="Name"
                className="input h-8 w-32 text-xs"
                aria-label="New raider name"
              />
              <select
                value={newSpec}
                onChange={e => setNewSpec(e.target.value)}
                className="input h-8 flex-1 text-xs"
                aria-label="New raider spec"
              >
                {[...specsByClass.entries()].map(([cls, specs]) => (
                  <optgroup key={cls} label={cls}>
                    {specs.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="button"
                onClick={addRaider}
                disabled={!newName.trim()}
                className="btn-ghost btn-xs inline-flex shrink-0 items-center gap-1"
              >
                <Plus size={12} aria-hidden /> Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              type="button"
              onClick={() => onSave({ specChanges: changes, additions, removals: [...removals] })}
              disabled={changedCount === 0}
              className="btn"
            >
              {changedCount > 0
                ? `Save ${changedCount} change${changedCount === 1 ? "" : "s"} & recompute`
                : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
