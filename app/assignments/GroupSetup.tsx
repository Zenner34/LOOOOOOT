"use client";

import { useMemo, useRef, useState } from "react";
import type { AssignmentData } from "@/lib/assignments";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";

/**
 * The Group Setup panel — Groups 1-5 × 5 slots, spreadsheet style.
 * Shared by the archived SSC/TK sheet and the BT/Hyjal phase sheet;
 * both store groups as Record<"1".."5", number[]> so only the `data`
 * blob's other fields differ. Pass `title` to relabel the header.
 */
export function GroupSetup<T extends Pick<AssignmentData, "groups">>({
  data,
  setData,
  characters,
  charsById,
  title = "Group Setup",
}: {
  data: T;
  setData: (d: T) => void;
  characters: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
  title?: string;
}) {
  // Track which slot is currently showing the picker (keyed by
  // "group:slotIndex"; null when none).
  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Everyone already sitting in a group — excluded from the picker so a
  // character can't occupy two slots at once.
  const allRosterIds = useMemo(
    () => new Set(
      (["1", "2", "3", "4", "5"] as const)
        .flatMap(g => data.groups[g] ?? [])
        .filter(id => id > 0),
    ),
    [data],
  );

  function addToSlot(group: "1" | "2" | "3" | "4" | "5", slotIdx: number, c: AssignableCharacter) {
    const current = [...data.groups[group]];
    while (current.length <= slotIdx) current.push(0);
    current[slotIdx] = c.id;
    setData({ ...data, groups: { ...data.groups, [group]: current } });
    setOpenSlot(null);
  }

  function removeFromSlot(group: "1" | "2" | "3" | "4" | "5", slotIdx: number) {
    // Blank the slot in place (0 = empty) rather than splicing it out, so
    // the remaining members keep their positions instead of shifting up.
    const current = [...data.groups[group]];
    current[slotIdx] = 0;
    while (current.length > 0 && current[current.length - 1] === 0) current.pop();
    setData({ ...data, groups: { ...data.groups, [group]: current } });
  }

  return (
    <div
      className="sheet-panel"
    >
      <div
        className="navy-head mb-2"
      >
        {title}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["1", "2", "3", "4", "5"] as const).map(g => {
          const filled = data.groups[g] ?? [];
          const slots: Array<number | null> = [...filled];
          while (slots.length < 5) slots.push(null);
          return (
            <div key={g} className="flex flex-col gap-[3px]">
              <div className="cell-head">
                Group {g}
              </div>
              {slots.map((charId, idx) => {
                const slotKey = `${g}:${idx}`;
                const char = charId ? charsById.get(charId) : null;
                return (
                  <div
                    key={slotKey}
                    ref={el => { slotRefs.current[slotKey] = el; }}
                    className="relative"
                  >
                    {char ? (
                      <CharacterChip
                        character={char}
                        size="sm"
                        onRemove={() => removeFromSlot(g, idx)}
                        onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)}
                      />
                    ) : (
                      <EmptySlot
                        size="sm"
                        onClick={() => setOpenSlot(prev => prev === slotKey ? null : slotKey)}
                      />
                    )}
                    {openSlot === slotKey && (
                      <CharacterPicker
                        characters={characters}
                        excludeIds={allRosterIds}
                        onPick={c => addToSlot(g, idx, c)}
                        onClose={() => setOpenSlot(null)}
                        anchorRef={{ current: slotRefs.current[slotKey] }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
