"use client";

import { CLASS_COLOR } from "@/lib/specs";

export type AssignableCharacter = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  isMain: boolean;
  playerId: number | null;
  playerName: string | null;
};

/**
 * Class-coloured chip used as the universal "this character is assigned
 * here" pill. The spreadsheet aesthetic: italic name + dark text on a
 * saturated class background. Optional `onRemove` shows an × button.
 */
export function CharacterChip({
  character,
  onRemove,
  onClick,
  small,
  highlighted,
  dimmed,
}: {
  character: AssignableCharacter;
  onRemove?: () => void;
  onClick?: () => void;
  small?: boolean;
  highlighted?: boolean;
  dimmed?: boolean;
}) {
  const bg = CLASS_COLOR[character.class] ?? "#888";
  // White text only on Shaman and Warlock (the two dark backgrounds);
  // every other class uses near-black text per TBC sheet convention.
  const isDarkBg = character.class === "Shaman";
  const fg = isDarkBg ? "#fff" : "#1a1a1a";
  const padding = small ? "px-1.5 py-0.5" : "px-2 py-1";
  const text = small ? "text-[11px]" : "text-xs";
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${character.name} — ${character.spec} ${character.class}${character.playerName && character.playerName !== character.name ? ` · ${character.playerName}` : ""}${character.isMain ? " (main)" : " (alt)"}`}
      className={`group inline-flex items-center gap-1.5 italic font-semibold border border-black/40 rounded-[3px] ${padding} ${text} transition-all ${
        dimmed ? "grayscale opacity-50" : ""
      } ${
        highlighted ? "ring-2 ring-amber-300 ring-offset-1 ring-offset-[var(--bg)] shadow-[0_0_0_4px_rgba(212,175,55,0.18)]" : ""
      } hover:-translate-y-px hover:brightness-110 hover:shadow-[0_4px_10px_rgba(0,0,0,0.4)]`}
      style={{ background: bg, color: fg }}
    >
      <span className="truncate max-w-[120px]">{character.name}</span>
      {onRemove && (
        <span
          role="button"
          aria-label="Remove from slot"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="opacity-0 group-hover:opacity-90 transition text-[10px] leading-none -mr-0.5"
        >
          ×
        </span>
      )}
    </button>
  );
}

/** Empty slot placeholder — soft green like the spreadsheet's blank rows. */
export function EmptySlot({ onClick, label = "+ add", small }: { onClick: () => void; label?: string; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full italic text-neutral-700 hover:text-vermillion-700 hover:bg-emerald-100 transition border border-emerald-200/40 rounded-[3px] ${small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"}`}
      style={{ background: "#c4dd96" }}
    >
      {label}
    </button>
  );
}
