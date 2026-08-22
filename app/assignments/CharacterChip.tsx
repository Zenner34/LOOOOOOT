"use client";

import { CLASS_COLOR, SPEC_ICON } from "@/lib/specs";
import { useHighlight } from "./HighlightContext";
import { useViewMode } from "./ViewModeContext";

const SPEC_ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";

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
 * Class-coloured chip — the universal "this character is assigned here"
 * pill matching the source spreadsheet aesthetic. Italic centered name,
 * dark text on saturated class background (white on Shaman/Warlock),
 * 1px black border, hover-lift + brighten.
 *
 * Fills the parent slot's width by default (the way the mockup uses
 * them — one chip per row, stacked vertically inside an AssignBox).
 * Pass `inline` for compact pill behaviour where multiple chips share
 * one row (currently unused but kept for future flexibility).
 *
 * Reads HighlightContext: hovering sets the hover focus; matching chips
 * ring amber and non-matching desaturate.
 */
export function CharacterChip({
  character,
  onRemove,
  onClick,
  size = "md",
  inline,
}: {
  character: AssignableCharacter;
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "md";
  inline?: boolean;
}) {
  const { isHighlighted, anyHighlight, setHover } = useHighlight();
  const { readOnly } = useViewMode();
  const highlighted = isHighlighted(character.id);
  const dimmed = anyHighlight && !highlighted;
  // Suppress the remove × in read-only / raider view.
  const showRemove = !!onRemove && !readOnly;
  // Raider view: hover/highlight still works, but the chip is no longer a
  // picker trigger — clicking shouldn't open the swap popover.
  const handleClick = readOnly ? undefined : onClick;

  const bg = CLASS_COLOR[character.class] ?? "#888";
  // All chips use near-black text for consistency, regardless of class.
  const fg = "#1a1a1a";

  const layoutCls = inline ? "inline-flex" : "flex w-full";
  const pad = size === "sm" ? "pl-1.5 pr-2 py-1" : "pl-2 pr-2.5 py-[5px]";
  const txt = size === "sm" ? "text-[12px]" : "text-[13px]";
  const iconSize = size === "sm" ? 14 : 18;
  const iconKey = SPEC_ICON[character.spec];
  const iconSrc = iconKey ? `${SPEC_ICON_BASE}${iconKey}.jpg` : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(character.id)}
      onMouseLeave={() => setHover(null)}
      onFocus={() => setHover(character.id)}
      onBlur={() => setHover(null)}
      title={`${character.name} — ${character.spec} ${character.class}${character.playerName && character.playerName !== character.name ? ` · ${character.playerName}` : ""}${character.isMain ? " (main)" : " (alt)"}`}
      className={`group items-center justify-start gap-1.5 italic font-semibold rounded-[4px] border border-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.35)] ${pad} ${txt} ${layoutCls} transition-all leading-snug select-none ${
        readOnly ? "cursor-default" : "cursor-pointer"
      } ${
        dimmed ? "grayscale opacity-55 brightness-75" : ""
      } ${
        highlighted ? "ring-2 ring-[#d4af37] ring-offset-1 ring-offset-[var(--bg)] shadow-[0_0_0_4px_rgba(212,175,55,0.22)]" : ""
      } hover:-translate-y-px hover:brightness-110 hover:shadow-[0_4px_10px_rgba(0,0,0,0.45)]`}
      style={{ background: bg, color: fg }}
    >
      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          width={iconSize}
          height={iconSize}
          loading="lazy"
          className="rounded-[2px] ring-1 ring-black/40 flex-shrink-0"
          style={{ width: iconSize, height: iconSize }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <span className="truncate flex-1 text-left">{character.name}</span>
      {showRemove && (
        <span
          role="button"
          aria-label="Remove from slot"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="opacity-0 group-hover:opacity-90 transition text-[10px] leading-none -mr-0.5 flex-shrink-0"
        >
          ×
        </span>
      )}
    </button>
  );
}

/**
 * Empty slot placeholder — soft green like the spreadsheet's blank rows.
 * Fills the slot width so it stacks consistently with CharacterChip.
 * Hidden entirely when the page is in raider (read-only) view.
 */
export function EmptySlot({
  onClick,
  label = "+ add",
  size = "md",
}: {
  onClick: () => void;
  label?: string;
  size?: "sm" | "md";
}) {
  const { readOnly } = useViewMode();
  if (readOnly) return null;
  const pad = size === "sm" ? "px-2 py-1" : "px-2.5 py-[5px]";
  const txt = size === "sm" ? "text-[12px]" : "text-[13px]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center italic text-neutral-700 hover:text-vermillion-700 hover:brightness-110 transition rounded-[4px] border border-dashed border-emerald-900/50 leading-snug ${pad} ${txt}`}
      style={{ background: "#c4dd96" }}
    >
      {label}
    </button>
  );
}
