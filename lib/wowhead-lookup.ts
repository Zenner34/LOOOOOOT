// Verified TBC item lookup. Reads lib/wowhead-ids.json which is generated
// from the canonical wow-classic-items database. See prisma/seed.ts for
// how it's used to override hand-authored IDs at seed time.

import VERIFIED from "./wowhead-ids.json";

type Entry = { id: number; icon?: string };
const MAP = VERIFIED as Record<string, Entry>;

export function iconFor(name: string): string | null {
  return MAP[name]?.icon ?? null;
}

export function idFor(name: string): number | null {
  return MAP[name]?.id ?? null;
}

export function lookup(name: string): Entry | null {
  return MAP[name] ?? null;
}
