"use client";

import { useMemo, useState } from "react";
import { isMeleeSpec } from "@/lib/assignments";
import { ChevronDown } from "@/app/components/ui/Icon";
import { CharacterChip, type AssignableCharacter } from "./CharacterChip";

/**
 * Collapsible roster panel: four mini-columns (All / Melee / Heals /
 * Ranged) showing the roster from different angles, so a raider can
 * scan and find their own chip + hover-highlight everywhere it appears
 * on the sheet. Starts closed — the header (with the live count) is
 * the toggle — so the sticky left rail stays compact.
 *
 * Tank role doesn't get its own column (they live under Melee per the
 * source spreadsheet's grouping). Empty roster shows a placeholder.
 */
export function RosterSidebar({
  teamRosterChars,
  defaultOpen = false,
}: {
  teamRosterChars: AssignableCharacter[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { all, melee, heals, ranged } = useMemo(() => {
    const all = [...teamRosterChars].sort((a, b) => a.name.localeCompare(b.name));
    const melee  = all.filter(c => c.role === "tank" || (c.role === "dps" && isMeleeSpec(c.spec)));
    const heals  = all.filter(c => c.role === "heal");
    const ranged = all.filter(c => c.role === "dps" && !isMeleeSpec(c.spec));
    return { all, melee, heals, ranged };
  }, [teamRosterChars]);

  return (
    <div className="sheet-panel">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`navy-head flex w-full items-center justify-center gap-1.5 transition hover:brightness-110 ${open ? "mb-2" : ""}`}
      >
        Roster · {all.length}/25
        <ChevronDown
          size={12}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        all.length === 0 ? (
          <div className="text-[11px] text-neutral-500 italic text-center py-2">
            Fill the team groups to populate.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <RosterColumn title="All"    list={all} />
            <RosterColumn title="Melee"  list={melee} />
            <RosterColumn title="Heals"  list={heals} />
            <RosterColumn title="Ranged" list={ranged} />
          </div>
        )
      )}
    </div>
  );
}

function RosterColumn({ title, list }: { title: string; list: AssignableCharacter[] }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="cell-head">
        {title} · {list.length}
      </div>
      {list.map(c => (
        <CharacterChip key={c.id} character={c} size="sm" />
      ))}
    </div>
  );
}
