// Shape of the `AssignmentSheet.data` JSON blob and helpers for working
// with it. Kept in lib/ (no React imports) so server and client can
// share the same types.
//
// The blob is intentionally flat-JSON rather than a relational schema —
// the editor surface is small and the structure will evolve faster than
// we'd want to migrate the DB.

/**
 * Bosses we render assignments for. Slugs are stable strings used as
 * keys in the `bosses` map; display names + which raid they belong to
 * are resolved from the Boss table at render time.
 */
export const ASSIGNMENT_BOSSES = [
  { slug: "hydross",   raidShort: "SSC", name: "Hydross the Unstable" },
  { slug: "lurker",    raidShort: "SSC", name: "The Lurker Below" },
  { slug: "morogrim",  raidShort: "SSC", name: "Morogrim Tidewalker" },
  { slug: "fathom",    raidShort: "SSC", name: "Fathom-Lord Karathress" },
  { slug: "leotheras", raidShort: "SSC", name: "Leotheras the Blind" },
  { slug: "vashj",     raidShort: "SSC", name: "Lady Vashj" },
  { slug: "alar",      raidShort: "TK",  name: "Al'ar" },
  { slug: "voidreaver",raidShort: "TK",  name: "Void Reaver" },
  { slug: "solarian",  raidShort: "TK",  name: "High Astromancer Solarian" },
  { slug: "kael",      raidShort: "TK",  name: "Kael'thas Sunstrider" },
] as const;

export type BossSlug = (typeof ASSIGNMENT_BOSSES)[number]["slug"];

export type AssignSection = {
  /** Stable id within the sheet so renames/deletes don't reshuffle assignments. */
  id: string;
  /** Display title. Admin-editable. */
  title: string;
  /** Optional Wowhead icon slug (e.g. "spell_holy_powerinfusion") for the chip icon. */
  iconSlug?: string;
  /** Character ids assigned to this section, in display order. */
  characterIds: number[];
};

export type BossAssignment = {
  /** For multi-phase fights (Kael, Vashj, Al'ar). Single-phase bosses use `sections`. */
  phases?: { id: string; label: string; sections: AssignSection[] }[];
  sections?: AssignSection[];
};

export type AssignmentData = {
  /** Groups 1-5 of the raid composition (max 5 characters each). */
  groups: Record<"1" | "2" | "3" | "4" | "5", number[]>;
  /** Buffs / dispels (Power Infusion, Fortitude, Blessings, etc.). */
  buffs: AssignSection[];
  /** Per-boss assignment sections, keyed by boss slug. */
  bosses: Partial<Record<BossSlug, BossAssignment>>;
};

export function emptyAssignmentData(): AssignmentData {
  return {
    groups: { "1": [], "2": [], "3": [], "4": [], "5": [] },
    buffs: defaultBuffs(),
    bosses: {},
  };
}

/**
 * Canonical buff / dispel sections, applied when a new AssignmentSheet
 * is seeded. Each section starts empty (no character ids) and the admin
 * fills it via the picker. Admin can rename, delete, add — these are
 * defaults, not constraints.
 *
 * The order roughly matches the source spreadsheet: raid-wide buffs
 * first, then druid utility, then warlock, then physical-DPS debuffs.
 */
const BUFF_TEMPLATE: Array<{ title: string; iconSlug: string }> = [
  { title: "Power Infusion · G1-3",         iconSlug: "spell_holy_powerinfusion" },
  { title: "Power Infusion · G4-5",         iconSlug: "spell_holy_powerinfusion" },
  { title: "Prayer of Fortitude · G1-5",    iconSlug: "spell_holy_prayeroffortitude" },
  { title: "Greater Blessing · Pair 1",     iconSlug: "spell_magic_greaterblessingofkings" },
  { title: "Greater Blessing · Pair 2",     iconSlug: "spell_magic_greaterblessingofkings" },
  { title: "Greater Blessing · Pair 3",     iconSlug: "spell_magic_greaterblessingofkings" },
  { title: "Innervate · Pair 1",            iconSlug: "spell_nature_lightning" },
  { title: "Innervate · Pair 2",            iconSlug: "spell_nature_lightning" },
  { title: "Tranquility",                   iconSlug: "spell_nature_tranquility" },
  { title: "Soulstone Order",               iconSlug: "spell_shadow_soulgem" },
  { title: "Affliction Warlock (Debuffs)",  iconSlug: "spell_shadow_curseofachimonde" },
  { title: "Curse of Recklessness",         iconSlug: "spell_shadow_unholystrength" },
  { title: "Curse of the Elements",         iconSlug: "spell_shadow_chilltouch" },
  { title: "Faerie Fire · #1",              iconSlug: "spell_nature_faeriefire" },
  { title: "Faerie Fire · #2",              iconSlug: "spell_nature_faeriefire" },
  { title: "Sunder Armor · #1",             iconSlug: "ability_warrior_sunder" },
  { title: "Sunder Armor · #2",             iconSlug: "ability_warrior_sunder" },
  { title: "Sunder Armor · #3",             iconSlug: "ability_warrior_sunder" },
];

export function defaultBuffs(): AssignSection[] {
  return BUFF_TEMPLATE.map(b => ({
    id: newSectionId(),
    title: b.title,
    iconSlug: b.iconSlug,
    characterIds: [],
  }));
}

/**
 * Monday-of-week (UTC) for an arbitrary date. We pin AssignmentSheet
 * rows to Mondays so re-creating "this week's sheet" is deterministic
 * regardless of which day the admin opens the page on.
 */
export function mondayOfWeek(d: Date = new Date()): Date {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = dt.getUTCDay(); // 0=Sun..6=Sat
  const diff = (dow + 6) % 7; // distance back to Monday
  dt.setUTCDate(dt.getUTCDate() - diff);
  return dt;
}

export function weekOfLabel(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

/** All character ids currently filling a slot in the team's groups. */
export function rosterCharacterIds(data: AssignmentData): number[] {
  return ([
    ...data.groups["1"], ...data.groups["2"], ...data.groups["3"],
    ...data.groups["4"], ...data.groups["5"],
  ]).filter(Boolean);
}

/** Random short id for new section rows. Stable across edits. */
export function newSectionId(): string {
  return Math.random().toString(36).slice(2, 9);
}
