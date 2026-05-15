"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CURRENT_PHASE_ORDER,
  encodePhaseParam,
  isDefaultPhaseFilter,
  phaseFilterLabel,
  type PhaseFilterValue,
} from "@/lib/phases";
import { Layers } from "@/app/components/ui/Icon";

type PhaseOption = { order: number; name: string };

/**
 * Multi-select Phase filter chip. Renders a pill with the current selection
 * and opens a dropdown of checkboxes when clicked. Writes its state to the
 * `?phase=...` URL param so it survives reloads and is shareable. When the
 * selection equals the default ("current phase only"), the param is omitted
 * from the URL to keep links clean.
 */
export function PhaseFilter({
  phases,
  selected,
  paramName = "phase",
  className,
}: {
  phases: PhaseOption[];
  selected: PhaseFilterValue;
  paramName?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function applyFilter(next: PhaseFilterValue) {
    const sp = new URLSearchParams(searchParams.toString());
    const encoded = encodePhaseParam(next);
    if (encoded == null) sp.delete(paramName);
    else sp.set(paramName, encoded);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function togglePhase(order: number) {
    const current: Set<number> =
      selected === "all" ? new Set(phases.map(p => p.order)) : new Set(selected);
    if (current.has(order)) current.delete(order);
    else current.add(order);
    if (current.size === phases.length) applyFilter("all");
    else if (current.size === 0) applyFilter(new Set([CURRENT_PHASE_ORDER]));
    else applyFilter(current);
  }

  const isAll = selected === "all";
  const isDefault = isDefaultPhaseFilter(selected);
  const label = phaseFilterLabel(selected);
  const showFilteredBadge = !isAll && !isDefault;

  return (
    <div ref={ref} className={`relative inline-block ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[var(--surface)] pl-3 pr-3 py-1.5 text-sm text-neutral-200 hover:border-white/20 hover:bg-white/[0.03] transition min-h-[34px]"
        title="Filter loot by raid phase"
      >
        <Layers size={14} className="text-neutral-400" />
        <span className="font-medium">{label}</span>
        {showFilteredBadge && (
          <span className="inline-flex items-center justify-center rounded-full bg-vermillion-500/20 text-vermillion-200 text-[9px] font-semibold px-1.5 leading-none py-0.5">
            filtered
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Phase filter"
          className="absolute z-30 mt-2 right-0 w-60 rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl p-1.5 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => { applyFilter("all"); setOpen(false); }}
            className={`w-full text-left rounded-md px-2.5 py-1.5 text-sm transition hover:bg-vermillion-500/12 hover:text-vermillion-200 ${
              isAll ? "text-vermillion-200" : "text-neutral-200"
            }`}
          >
            All phases
          </button>
          <button
            type="button"
            onClick={() => { applyFilter(new Set([CURRENT_PHASE_ORDER])); setOpen(false); }}
            className={`w-full text-left rounded-md px-2.5 py-1.5 text-sm transition hover:bg-vermillion-500/12 hover:text-vermillion-200 ${
              isDefault ? "text-vermillion-200" : "text-neutral-200"
            }`}
          >
            Current phase only
            <span className="ml-1 text-[11px] text-neutral-500">· Phase {CURRENT_PHASE_ORDER}</span>
          </button>
          <div className="my-1 h-px bg-white/5" />
          <div className="px-1 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            Pick phases
          </div>
          {phases.map(p => {
            const checked = isAll || (selected as Set<number>).has(p.order);
            return (
              <label
                key={p.order}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-neutral-200 hover:bg-vermillion-500/12 hover:text-vermillion-200 transition cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePhase(p.order)}
                  className="accent-vermillion-500 cursor-pointer"
                />
                <span className="flex-1">{p.name}</span>
                {p.order === CURRENT_PHASE_ORDER && (
                  <span className="text-[9px] uppercase tracking-wider text-vermillion-300/80">current</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
