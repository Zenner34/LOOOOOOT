"use client";

import { useViewMode } from "./ViewModeContext";

/**
 * Small top-bar widgets shared by the archived SSC/TK sheet and the
 * BT/Hyjal phase sheet.
 */

export type SavingState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SavingState }) {
  // Always render a fixed-width span so appearing / disappearing the
  // text never shifts the rest of the top bar (and by extension the
  // boss cards below). Idle just leaves the slot blank.
  const cls = state === "saving" ? "text-neutral-500"
            : state === "saved"  ? "text-emerald-300"
            : state === "error"  ? "text-rose-300"
            : "text-transparent";
  const text = state === "saving" ? "Saving…"
             : state === "saved"  ? "Saved"
             : state === "error"  ? "Save failed"
             : "";
  return (
    <span
      aria-live="polite"
      className={`tabular-nums text-[11px] inline-block text-right ${cls}`}
      style={{ minWidth: 72 }}
    >
      {text || " "}
    </span>
  );
}

/**
 * Edit / Raider view toggle pill. When flipped to Raider view, every
 * editing affordance on the page hides (Add buttons, Suggest, Reset,
 * row delete, title rename, +team, team pencil). The toggle itself
 * persists to localStorage via the ViewModeContext.
 *
 * Visible only to admins — when an admin clicks this they're
 * previewing exactly what a raider sees.
 */
export function ViewModeToggle() {
  const { readOnly, setReadOnly, forced } = useViewMode();
  // Non-admins are pinned to raider view — no toggle, no preview.
  if (forced) return null;
  return (
    <button
      type="button"
      onClick={() => setReadOnly(!readOnly)}
      title={readOnly ? "Switch to Edit mode" : "Preview what a raider would see"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition min-h-[28px] ${
        readOnly
          ? "border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
          : "border-white/10 bg-[var(--surface)] text-neutral-200 hover:border-white/20 hover:bg-white/[0.03]"
      }`}
    >
      <span aria-hidden className="inline-block w-2 h-2 rounded-full" style={{ background: readOnly ? "#d4af37" : "#4ade80" }} />
      {readOnly ? "Raider view" : "Edit mode"}
    </button>
  );
}
