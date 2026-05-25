"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Command } from "cmdk";
import { CLASS_COLOR } from "@/lib/specs";
import { matchesEligibility, type Eligibility } from "@/lib/assignments";
import { ClassIcon } from "@/app/components/ClassIcon";
import { Search } from "@/app/components/ui/Icon";
import type { AssignableCharacter } from "./CharacterChip";

/**
 * cmdk-style popover that opens anchored to a slot/chip and lets the
 * admin pick a character. Searchable by player name, character name,
 * class, and spec. Mains float to the top of their player group.
 *
 * `scopeIds` optionally restricts the picker to a subset of character
 * ids — used by the boss-assignment editor in Phase 3 to filter to
 * "characters on this team's roster". Pass null/undefined for no scope.
 *
 * `excludeIds` hides characters that are already filling another slot
 * in the same group (so you can't put Bake in Group 1 slot 3 AND
 * slot 5 at the same time).
 */
export function CharacterPicker({
  characters,
  scopeIds,
  excludeIds,
  eligibility,
  onPick,
  onClose,
  anchorRef,
}: {
  characters: AssignableCharacter[];
  scopeIds?: number[] | null;
  excludeIds?: Set<number>;
  /** When set, eligible characters render under an "Eligible" header at
   *  the top and non-eligible chars fall to an "Other" section below. */
  eligibility?: Eligibility;
  onPick: (c: AssignableCharacter) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  // cmdk keeps the list's scroll position between filters, so after typing the
  // top matches can sit above the fold. Snap back to the top on every query.
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query]);

  // Manually focus the input *without* the browser's default scroll-into-view
  // behaviour. autoFocus on the Command.Input would otherwise yank the page
  // up/down to centre the input, which feels like the whole sheet jumps when
  // an admin clicks an empty slot.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return;
      if (anchorRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, anchorRef]);

  const { eligible, other } = useMemo(() => {
    let list = characters;
    if (scopeIds && scopeIds.length > 0) {
      const scope = new Set(scopeIds);
      list = list.filter(c => scope.has(c.id));
    }
    if (excludeIds && excludeIds.size > 0) {
      list = list.filter(c => !excludeIds.has(c.id));
    }
    // Sort: mains first (within their player group), then by name.
    const sorted = [...list].sort((a, b) => {
      const ap = a.playerName ?? a.name;
      const bp = b.playerName ?? b.name;
      const playerCmp = ap.localeCompare(bp);
      if (playerCmp !== 0) return playerCmp;
      if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    if (!eligibility) return { eligible: sorted, other: [] as AssignableCharacter[] };
    const elig: AssignableCharacter[] = [];
    const oth: AssignableCharacter[] = [];
    for (const c of sorted) {
      if (matchesEligibility(c, eligibility)) elig.push(c);
      else oth.push(c);
    }
    return { eligible: elig, other: oth };
  }, [characters, scopeIds, excludeIds, eligibility]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Pick a character"
      className="absolute z-40 mt-1 w-80 rounded-xl border border-white/10 bg-[var(--surface-2)] shadow-2xl animate-fade-in overflow-hidden"
    >
      <Command className="flex flex-col max-h-[320px]">
        <div className="relative p-2 border-b border-white/5">
          <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search character, player, class…"
            className="input pl-7 text-xs h-8 w-full"
          />
        </div>
        <Command.List ref={listRef} className="flex-1 overflow-y-auto p-1">
          {eligible.length === 0 && other.length === 0 && (
            <Command.Empty className="px-2 py-3 text-center text-xs text-neutral-500">
              No matches
            </Command.Empty>
          )}
          {eligible.length > 0 && (
            <Command.Group heading={eligibility ? "Eligible" : undefined} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-vermillion-300/90">
              {eligible.map(c => (
                <PickerItem key={c.id} character={c} onPick={onPick} />
              ))}
            </Command.Group>
          )}
          {other.length > 0 && (
            <Command.Group heading="Other characters" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:mt-1 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-neutral-500">
              {other.map(c => (
                <PickerItem key={c.id} character={c} onPick={onPick} dim />
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}

function PickerItem({
  character: c,
  onPick,
  dim,
}: {
  character: AssignableCharacter;
  onPick: (c: AssignableCharacter) => void;
  dim?: boolean;
}) {
  return (
    <Command.Item
      value={`${c.name} ${c.class} ${c.spec} ${c.playerName ?? ""}`}
      onSelect={() => onPick(c)}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-pointer data-[selected=true]:bg-vermillion-500/12 data-[selected=true]:text-vermillion-200 ${
        dim ? "opacity-60 hover:opacity-100" : ""
      }`}
    >
      {c.isMain && <span className="text-gold-300 text-[9px]" aria-hidden>★</span>}
      <ClassIcon cls={c.class} size={12} />
      <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium">
        {c.name}
      </span>
      <span className="text-neutral-500 text-[11px] flex-1 text-left truncate">
        · {c.spec}
        {c.playerName && c.playerName !== c.name ? ` · ${c.playerName}` : ""}
      </span>
    </Command.Item>
  );
}
