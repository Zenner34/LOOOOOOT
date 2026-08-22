"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { PhaseMember } from "@/lib/raid-helper";
import { CLASS_COLOR, SPECS } from "@/lib/specs";
import { X } from "@/app/components/ui/Icon";

/**
 * Per-night spec editor. Raid-Helper's Composition Tool exports the
 * specs it last held, so a raider who plays different specs on
 * different nights would otherwise inherit the wrong one — this lets
 * an admin correct any raider's spec for THIS night only. Class is
 * fixed (people don't change class between nights); saving recomputes
 * every auto-assignment from the new specs.
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
  onSave: (changes: Record<number, string>) => void;
}) {
  const [changes, setChanges] = useState<Record<number, string>>({});
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

  const changedCount = Object.entries(changes)
    .filter(([id, spec]) => members.find(m => m.id === Number(id))?.spec !== spec)
    .length;

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`Edit ${dayLabel} specs`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in">
          <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">
                {dayLabel} roster
              </div>
              <div className="font-semibold">Edit specs for this night</div>
              <p className="mt-1 max-w-sm text-xs text-neutral-500">
                Applies to {dayLabel} only — the other raid nights keep their own specs.
                Saving recomputes tanks, buffs, and every boss assignment.
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
              return (
                <li key={m.id} className="flex items-center gap-3 py-1.5">
                  <span
                    className="w-32 shrink-0 truncate text-sm font-semibold"
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
                    onChange={e => setChanges(prev => ({ ...prev, [m.id]: e.target.value }))}
                    className={`input h-8 flex-1 text-xs ${dirty ? "border-amber-400/50" : ""}`}
                    aria-label={`${m.name} spec`}
                  >
                    {!options.includes(m.spec) && <option value={m.spec}>{m.spec}</option>}
                    {options.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button
              type="button"
              onClick={() => onSave(changes)}
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
