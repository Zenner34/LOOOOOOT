"use client";

import { useEffect, useRef, useState } from "react";
import {
  defaultTankAssignments,
  tankMarkerGlyph,
  tankMarkerLabel,
  type AssignmentData,
  type TankAssignment,
} from "@/lib/assignments";
import { X } from "@/app/components/ui/Icon";
import { CharacterChip, EmptySlot, type AssignableCharacter } from "./CharacterChip";
import { CharacterPicker } from "./CharacterPicker";

const TANK_ELIG = { roles: ["tank"] as const } as any;
const HEAL_ELIG = { roles: ["heal"] as const } as any;
const HEALER_SLOTS = 2;

/**
 * Tanks & Tank Healers (Based on Roster).
 *
 * Six fixed rows keyed to WoW raid markers — Skull, Cross, Square,
 * Moon, Triangle, Diamond. Each row is one tank + N healer slots
 * (2 by default). Tank picker scopes to team-roster tanks, healer
 * pickers scope to team-roster healers. Marker icon is rendered on
 * the left as a Wowhead icon, matching the source spreadsheet.
 *
 * Auto-fill: when the team's tanks change, the first N empty rows
 * pull in fresh tanks; admin edits are never overwritten because we
 * only touch slots that are currently null.
 */
export function TankHealersCard({
  data,
  setData,
  characters,
  teamRosterIds,
  teamRosterChars,
  charsById,
}: {
  data: AssignmentData;
  setData: (d: AssignmentData) => void;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  teamRosterChars: AssignableCharacter[];
  charsById: Map<number, AssignableCharacter>;
}) {
  const rows = data.tankAssignments ?? defaultTankAssignments();

  function update(next: TankAssignment[]) {
    setData({ ...data, tankAssignments: next });
  }

  function patchRow(id: string, patch: Partial<TankAssignment>) {
    update(rows.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }

  // Auto-fill empty tank slots from the team's tanks whenever the roster
  // changes. Doesn't touch slots admin has set manually, and won't
  // double-assign a tank across rows. Healer slots stay manual.
  const tankIdsKey = teamRosterChars.filter(c => c.role === "tank").map(c => c.id).join(",");
  useEffect(() => {
    const tanks = teamRosterChars.filter(c => c.role === "tank");
    if (tanks.length === 0) return;
    const assigned = new Set(rows.map(r => r.tankId).filter((x): x is number => x !== null));
    let changed = false;
    let queue = tanks.filter(t => !assigned.has(t.id));
    const next = rows.map(r => {
      if (r.tankId !== null) return r;
      const t = queue.shift();
      if (!t) return r;
      changed = true;
      return { ...r, tankId: t.id };
    });
    if (changed) update(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tankIdsKey]);

  return (
    <div
      id="tank-heal"
      className="rounded-lg border border-[#2a3650] p-3 scroll-mt-20"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
    >
      <div
        className="text-xs font-bold uppercase tracking-wider text-white text-center px-3 py-1 mb-2 border border-[#2c5494] rounded"
        style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
      >
        Tanks &amp; Tank Healers (Based on Roster)
      </div>

      <div className="flex flex-col gap-px">
        {rows.map(row => (
          <TankRow
            key={row.id}
            row={row}
            characters={characters}
            teamRosterIds={teamRosterIds}
            charsById={charsById}
            onPatch={patch => patchRow(row.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function TankRow({
  row,
  characters,
  teamRosterIds,
  charsById,
  onPatch,
}: {
  row: TankAssignment;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  charsById: Map<number, AssignableCharacter>;
  onPatch: (patch: Partial<TankAssignment>) => void;
}) {
  const tankChar = row.tankId ? charsById.get(row.tankId) ?? null : null;
  const healerChars = row.healerIds.map(id => charsById.get(id) ?? null);
  // Pad healer slots to HEALER_SLOTS so the row always renders N columns.
  while (healerChars.length < HEALER_SLOTS) healerChars.push(null);

  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-px items-stretch">
      {/* Marker icon — Unicode glyph in raid-marker colour */}
      {(() => {
        const { glyph, color } = tankMarkerGlyph(row.marker);
        return (
          <div
            className="flex items-center justify-center bg-[#1a1a1a] border border-black font-bold"
            title={tankMarkerLabel(row.marker)}
            style={{ color, fontSize: 16, lineHeight: 1 }}
          >
            {glyph}
          </div>
        );
      })()}

      {/* Tank slot */}
      <TankSlot
        char={tankChar}
        eligibility={TANK_ELIG}
        characters={characters}
        teamRosterIds={teamRosterIds}
        onPick={c => onPatch({ tankId: c.id })}
        onRemove={() => onPatch({ tankId: null })}
      />

      {/* Healer slots */}
      {healerChars.map((c, idx) => (
        <TankSlot
          key={idx}
          char={c}
          eligibility={HEAL_ELIG}
          characters={characters}
          teamRosterIds={teamRosterIds}
          onPick={picked => {
            const next = [...row.healerIds];
            while (next.length <= idx) next.push(0);
            next[idx] = picked.id;
            onPatch({ healerIds: next });
          }}
          onRemove={() => {
            const next = [...row.healerIds];
            next[idx] = 0;
            // Drop trailing zeros so the array stays compact.
            while (next.length > 0 && next[next.length - 1] === 0) next.pop();
            onPatch({ healerIds: next });
          }}
        />
      ))}
    </div>
  );
}

function TankSlot({
  char,
  eligibility,
  characters,
  teamRosterIds,
  onPick,
  onRemove,
}: {
  char: AssignableCharacter | null;
  eligibility: any;
  characters: AssignableCharacter[];
  teamRosterIds: number[];
  onPick: (c: AssignableCharacter) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="relative">
      {char ? (
        <CharacterChip character={char} size="sm" onRemove={onRemove} onClick={() => setOpen(o => !o)} />
      ) : (
        <EmptySlot size="sm" onClick={() => setOpen(o => !o)} />
      )}
      {open && (
        <CharacterPicker
          characters={characters}
          scopeIds={teamRosterIds.length > 0 ? teamRosterIds : null}
          eligibility={eligibility}
          onPick={c => { onPick(c); setOpen(false); }}
          onClose={() => setOpen(false)}
          anchorRef={ref as React.RefObject<HTMLElement>}
        />
      )}
    </div>
  );
}
