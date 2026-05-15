// Phase filter helpers — shared between server-side queries and the
// client <PhaseFilter> component.
//
// URL convention (`?phase=...`):
//   - omitted          → default: current phase only (CURRENT_PHASE_ORDER)
//   - "all"            → every phase
//   - "1"              → just phase 1
//   - "1,2"            → phases 1 and 2 (comma-separated, any order)
//
// We key off Phase.order (the stable 1..5 ordinal), not Phase.id, so the
// URL stays human-readable and survives reseeds.

import type { Prisma } from "@prisma/client";

/**
 * The phase the guild is currently raiding. Bumping this number changes the
 * default filter on every loot/award view site-wide. Phase 1 = Karazhan +
 * Gruul + Mag, Phase 2 = SSC + TK, Phase 3 = MH + BT, Phase 4 = ZA, Phase 5
 * = Sunwell.
 */
export const CURRENT_PHASE_ORDER = 2;

export type PhaseFilterValue = "all" | Set<number>;

/** Parse a `?phase=...` URL param into a set of phase orders, or "all". */
export function parsePhaseParam(raw: string | string[] | null | undefined): PhaseFilterValue {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "all") return "all";
  if (!value) return new Set([CURRENT_PHASE_ORDER]);
  const set = new Set<number>();
  for (const part of value.split(",")) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n > 0) set.add(n);
  }
  return set.size === 0 ? new Set([CURRENT_PHASE_ORDER]) : set;
}

/**
 * Encode a phase filter back into a URL param value, or `null` when the
 * filter equals the default (current phase only) — callers should omit the
 * param from the URL in that case to keep links clean.
 */
export function encodePhaseParam(filter: PhaseFilterValue): string | null {
  if (filter === "all") return "all";
  if (filter.size === 1 && filter.has(CURRENT_PHASE_ORDER)) return null;
  return Array.from(filter).sort((a, b) => a - b).join(",");
}

/**
 * Prisma `where` fragment for LootAward filtered by phase. Returns `{}` when
 * the filter is "all", so callers can spread it unconditionally.
 */
export function lootAwardPhaseWhere(filter: PhaseFilterValue): Prisma.LootAwardWhereInput {
  if (filter === "all") return {};
  return {
    item: { boss: { raid: { phase: { order: { in: Array.from(filter) } } } } },
  };
}

/**
 * Prisma `where` fragment for Phase filtered to the selection. Used on /loot
 * to narrow which phases render in the boss sidebar.
 */
export function phaseWhere(filter: PhaseFilterValue): Prisma.PhaseWhereInput {
  if (filter === "all") return {};
  return { order: { in: Array.from(filter) } };
}

/** Tiny predicate used client-side to filter an in-memory list of phases. */
export function phaseMatches(filter: PhaseFilterValue, order: number): boolean {
  return filter === "all" || filter.has(order);
}

/** Short label for the chip — "All phases", "Phase 2", "Phases 1, 2". */
export function phaseFilterLabel(filter: PhaseFilterValue): string {
  if (filter === "all") return "All phases";
  const ordered = Array.from(filter).sort((a, b) => a - b);
  if (ordered.length === 1) return `Phase ${ordered[0]}`;
  return `Phases ${ordered.join(", ")}`;
}

/** True when the filter exactly matches the default (current phase only). */
export function isDefaultPhaseFilter(filter: PhaseFilterValue): boolean {
  return filter !== "all" && filter.size === 1 && filter.has(CURRENT_PHASE_ORDER);
}
