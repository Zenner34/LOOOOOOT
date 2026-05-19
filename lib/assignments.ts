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
 * are resolved from the Boss table at render time. Portrait URLs are
 * zamimg screenshots — same ones used in the mockup.
 */
export type BossMeta = {
  readonly slug: string;
  readonly raidShort: "SSC" | "TK";
  readonly name: string;
  readonly portrait: string;
  /** Optional second portrait rendered side-by-side with `portrait` in
   *  the left column. Used for bosses with multiple forms (Hydross
   *  Frost ↔ Nature). When omitted, only `portrait` renders. */
  readonly portraitAlt?: string;
};

// Local boss imagery lives under /public/bosses/. Spaces and apostrophes
// in filenames get URL-encoded so the paths are valid for <img src>.
// TK boss portraits/strategy images fall back to the prior zamimg URLs
// until those files are uploaded — onError-hide handles missing files.
export const ASSIGNMENT_BOSSES = [
  { slug: "hydross",    raidShort: "SSC", name: "Hydross the Unstable",         portrait: "/bosses/Hydross%20Frost.jpg",   portraitAlt: "/bosses/Hydross%20Nature.jpg" },
  { slug: "lurker",     raidShort: "SSC", name: "The Lurker Below",             portrait: "/bosses/Lurker%20Below.jpg" },
  { slug: "morogrim",   raidShort: "SSC", name: "Morogrim Tidewalker",          portrait: "/bosses/Morogrim.png" },
  { slug: "fathom",     raidShort: "SSC", name: "Fathom-Lord Karathress",       portrait: "/bosses/Fathom%20Lord.png" },
  { slug: "leotheras",  raidShort: "SSC", name: "Leotheras the Blind",          portrait: "/bosses/Leo.png" },
  { slug: "vashj",      raidShort: "SSC", name: "Lady Vashj",                   portrait: "/bosses/Lady%20Vashj.png" },
  { slug: "alar",       raidShort: "TK",  name: "Al'ar",                        portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74822.jpg" },
  { slug: "voidreaver", raidShort: "TK",  name: "Void Reaver",                  portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74900.jpg" },
  { slug: "solarian",   raidShort: "TK",  name: "High Astromancer Solarian",    portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74896.jpg" },
  { slug: "kael",       raidShort: "TK",  name: "Kael'thas Sunstrider",         portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74888.jpg" },
] as const satisfies readonly BossMeta[];

export type BossSlug = (typeof ASSIGNMENT_BOSSES)[number]["slug"];

/**
 * Soft-constraint hint for an AssignSection: which characters can
 * "naturally" deliver this assignment? The picker uses this to show
 * eligible characters first (under an "Eligible" header); non-eligible
 * characters still appear below so admins can override. Auto-fill
 * fills empty sections with the matching roster members.
 */
export type Eligibility = {
  /** Class names — "Priest", "Warlock", etc. Matches any-spec of those classes. */
  classes?: string[];
  /** Role buckets. "tank" / "heal" match Character.role; "melee" / "ranged"
   *  split the dps role by spec via specBucket(). */
  roles?: Array<"tank" | "heal" | "melee" | "ranged">;
};

export type AssignSection = {
  /** Stable id within the sheet so renames/deletes don't reshuffle assignments. */
  id: string;
  /** Display title. Admin-editable. */
  title: string;
  /** Optional Wowhead icon slug (e.g. "spell_holy_powerinfusion") for the chip icon. */
  iconSlug?: string;
  /** When set, the row label is rendered as this Wowhead icon instead
   *  of the navy scope-text bar. Used for Curses where each row IS the
   *  curse type (the icon names the curse, e.g. CoR / CoE / CoS / CoT). */
  rowIconSlug?: string;
  /** Optional soft-constraint hint for who can fill this slot. */
  eligibility?: Eligibility;
  /** Per-slot eligibility override. Used for paired sections like
   *  Innervate (Druid + Mage) and Blessing of Protection (Paladin +
   *  Warlock). When set, slot N uses slotEligibility[N] in the picker
   *  instead of the section-level `eligibility`. */
  slotEligibility?: (Eligibility | undefined)[];
  /** Fixed slot count — when set, the row renders exactly N slots
   *  (chip or "add" per slot) regardless of how many characters are
   *  currently assigned. Used for paired and ordered-list sections.
   *  When undefined the row renders as growable: existing chips + 1
   *  "add" affordance. */
  fixedSlots?: number;
  /** How many slots auto-fill should populate when the section is empty.
   *  Defaults to 1 (single caster/target). Set higher for sections that
   *  naturally hold many chars (PoF · G1-5 = 3 priests; Tranq = every
   *  druid; etc.). */
  targetSlots?: number;
  /** Character ids assigned to this section, in display order. */
  characterIds: number[];
  /** Optional icon-labelled sub-rows that render *inside* this section
   *  below the main chip list. Each addOn is one horizontal row:
   *  [iconSlug cell | maxSlots chip/empty cells]. Used for Hydross
   *  Misdirects (Hunter sub-rows under each MT). */
  addOns?: SectionAddOn[];
  /** Layout hint: when true, this section forces a new row in the
   *  boss-card assignments grid (`lg:col-start-1`). Used to keep
   *  groups of related sections together (e.g. all spout teams on one
   *  row, all healer stacks on the next). Stored on the template, not
   *  the data — looked up by section title at render time. */
  breakBefore?: boolean;
  /** When true, suppress the section's main "+ add" slot — the section
   *  is meant to be just its addOn rows (e.g. Leotheras WW Threat Wipe
   *  is conceptually just a misdirect hunter, no parent chip). Any
   *  existing chips in `characterIds` still render so admin data isn't
   *  hidden; only the trailing empty add slot disappears. */
  addOnsOnly?: boolean;
};

/**
 * One addOn row attached under a parent AssignSection. Renders an
 * icon-on-left + N chip slots. Auto-fill respects `preferSpecs[i]`
 * when populating slot `i` (case-insensitive substring match against
 * Character.spec, e.g. "Beast Mastery" → "Beast Mastery Hunter").
 */
export type SectionAddOn = {
  id: string;
  iconSlug: string;
  /** Additional icons rendered to the right of `iconSlug` in front of
   *  each slot. Used when a single character handles multiple duties
   *  (e.g. Morogrim Add Tank hunters take Misdirect AND pop a Super
   *  Sapper Charge — one row per hunter, two icons each). */
  extraIcons?: string[];
  eligibility?: Eligibility;
  maxSlots: number;
  preferSpecs?: string[];
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
  /** Tanks → tank-healers mapping, marker-keyed. Optional for backwards
   *  compatibility with sheets created before this feature. */
  tankAssignments?: TankAssignment[];
};

/**
 * One row in the Tanks & Tank Healers panel. Each row is keyed to a
 * WoW raid marker (skull, cross, square, moon, triangle, diamond) and
 * holds one tank id + up to N healer ids. Pickers are scoped by role
 * — the tank slot only shows tanks, healer slots only show healers.
 */
export type TankAssignment = {
  id: string;
  marker: TankMarker;
  /** Wowhead icon slug — kept for backwards compat with sheets created
   *  before the wikia raid-marker icons landed. The TankHealersCard now
   *  renders the wikia URL from TANK_MARKERS, ignoring this field. */
  iconSlug?: string;
  /** Tank character id, or null when unfilled. */
  tankId: number | null;
  /** Healer character ids, in priority order. */
  healerIds: number[];
};

export type TankMarker = "skull" | "cross" | "square" | "moon" | "triangle" | "diamond";

/**
 * The six raid markers we render in the Tanks & Tank Healers panel,
 * in conventional kill-priority order. Rendered as Unicode glyphs in
 * the official WoW raid-marker colours — no external CDN dependency,
 * scales cleanly at any size.
 */
const TANK_MARKERS: Array<{ marker: TankMarker; glyph: string; color: string; label: string }> = [
  { marker: "skull",    glyph: "☠", color: "#f0f0f0", label: "Skull" },
  { marker: "cross",    glyph: "✚", color: "#ef4444", label: "Cross" },
  { marker: "square",   glyph: "■", color: "#3b82f6", label: "Square" },
  { marker: "moon",     glyph: "☾", color: "#e5e7eb", label: "Moon" },
  { marker: "triangle", glyph: "▲", color: "#22c55e", label: "Triangle" },
  { marker: "diamond",  glyph: "◆", color: "#a78bfa", label: "Diamond" },
];

export function defaultTankAssignments(): TankAssignment[] {
  return TANK_MARKERS.map(m => ({
    id: newSectionId(),
    marker: m.marker,
    tankId: null,
    healerIds: [],
  }));
}

export function tankMarkerLabel(m: TankMarker): string {
  return TANK_MARKERS.find(x => x.marker === m)?.label ?? m;
}

export function tankMarkerGlyph(m: TankMarker): { glyph: string; color: string } {
  const found = TANK_MARKERS.find(x => x.marker === m);
  return { glyph: found?.glyph ?? "•", color: found?.color ?? "#888" };
}

export function emptyAssignmentData(): AssignmentData {
  return {
    groups: { "1": [], "2": [], "3": [], "4": [], "5": [] },
    buffs: defaultBuffs(),
    bosses: defaultBosses(),
    tankAssignments: defaultTankAssignments(),
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
type BuffTpl = {
  title: string;
  iconSlug: string;
  rowIconSlug?: string;
  eligibility?: Eligibility;
  slotEligibility?: (Eligibility | undefined)[];
  fixedSlots?: number;
  targetSlots?: number;
};

const BUFF_TEMPLATE: BuffTpl[] = [
  // ═══ LEFT COLUMN — raid-wide buffs + tank/mana support ════════════════
  { title: "Prayer of Fortitude · G1-5",        iconSlug: "spell_holy_prayeroffortitude",          eligibility: { classes: ["Priest"] }, targetSlots: 3, fixedSlots: 3 },
  { title: "Gift of the Wild · G1-5",           iconSlug: "spell_nature_regeneration",             eligibility: { classes: ["Druid"] }, fixedSlots: 1 },
  { title: "Arcane Brilliance · G1-5",          iconSlug: "spell_holy_arcaneintellect",            eligibility: { classes: ["Mage"] }, fixedSlots: 1 },
  // Earth Shield — resto shaman on tank. Each row paired Shaman + Tank.
  { title: "Earth Shield · MT",                 iconSlug: "spell_nature_skinofearth",              rowIconSlug: "spell_nature_skinofearth",
    fixedSlots: 2, slotEligibility: [{ classes: ["Shaman"] }, { roles: ["tank"] }] },
  { title: "Earth Shield · OT",                 iconSlug: "spell_nature_skinofearth",              rowIconSlug: "spell_nature_skinofearth",
    fixedSlots: 2, slotEligibility: [{ classes: ["Shaman"] }, { roles: ["tank"] }] },
  // Innervate — resto druid → mage. Each row paired Druid + Mage.
  { title: "Innervate · Pair 1",                iconSlug: "spell_nature_lightning",                rowIconSlug: "spell_nature_lightning",
    fixedSlots: 2, slotEligibility: [{ classes: ["Druid"] }, { classes: ["Mage"] }] },
  { title: "Innervate · Pair 2",                iconSlug: "spell_nature_lightning",                rowIconSlug: "spell_nature_lightning",
    fixedSlots: 2, slotEligibility: [{ classes: ["Druid"] }, { classes: ["Mage"] }] },

  // ═══ MIDDLE COLUMN — all Paladin assignments ═════════════════════════
  // Each row uses rowIconSlug so the row label is the spell icon
  // itself instead of a text scope. One paladin slot per row.
  // Seals on the boss.
  { title: "Paladin Seals · Crusader",          iconSlug: "spell_holy_holysmite",                  rowIconSlug: "spell_holy_holysmite",               eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  { title: "Paladin Seals · Wisdom",            iconSlug: "spell_holy_holysmite",                  rowIconSlug: "spell_holy_righteousnessaura",       eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  { title: "Paladin Seals · Light",             iconSlug: "spell_holy_holysmite",                  rowIconSlug: "spell_holy_healingaura",             eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  // Save / protection pairs (Paladin + Warlock).
  { title: "Blessing of Protection · Pair 1",   iconSlug: "spell_holy_sealofprotection",           rowIconSlug: "spell_holy_sealofprotection",
    fixedSlots: 2, slotEligibility: [{ classes: ["Paladin"] }, { classes: ["Warlock"] }] },
  { title: "Blessing of Protection · Pair 2",   iconSlug: "spell_holy_sealofprotection",           rowIconSlug: "spell_holy_sealofprotection",
    fixedSlots: 2, slotEligibility: [{ classes: ["Paladin"] }, { classes: ["Warlock"] }] },
  // Greater Blessings — each row is the Paladin who casts that blessing.
  { title: "Greater Blessings · Kings",         iconSlug: "spell_magic_greaterblessingofkings",    rowIconSlug: "spell_magic_greaterblessingofkings",    eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  { title: "Greater Blessings · Might",         iconSlug: "spell_magic_greaterblessingofkings",    rowIconSlug: "spell_holy_greaterblessingofkings",     eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  { title: "Greater Blessings · Wisdom",        iconSlug: "spell_magic_greaterblessingofkings",    rowIconSlug: "spell_holy_greaterblessingofwisdom",    eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },
  { title: "Greater Blessings · Salvation",     iconSlug: "spell_magic_greaterblessingofkings",    rowIconSlug: "spell_holy_greaterblessingofsalvation", eligibility: { classes: ["Paladin"] }, fixedSlots: 1 },

  // ═══ RIGHT COLUMN — warlock utility + raid debuffs ════════════════════
  // Soulstones — each row pairs a Warlock caster with their target
  // (any character; typically a healer in rezz-priority order). Five
  // default rows mirror the source spreadsheet's priority list; admin
  // can add more via the per-block + or delete unused ones.
  { title: "Soulstones · #1",                   iconSlug: "spell_shadow_soulgem",                  rowIconSlug: "spell_shadow_soulgem",
    fixedSlots: 2, slotEligibility: [{ classes: ["Warlock"] }, undefined] },
  { title: "Soulstones · #2",                   iconSlug: "spell_shadow_soulgem",                  rowIconSlug: "spell_shadow_soulgem",
    fixedSlots: 2, slotEligibility: [{ classes: ["Warlock"] }, undefined] },
  { title: "Soulstones · #3",                   iconSlug: "spell_shadow_soulgem",                  rowIconSlug: "spell_shadow_soulgem",
    fixedSlots: 2, slotEligibility: [{ classes: ["Warlock"] }, undefined] },
  { title: "Soulstones · #4",                   iconSlug: "spell_shadow_soulgem",                  rowIconSlug: "spell_shadow_soulgem",
    fixedSlots: 2, slotEligibility: [{ classes: ["Warlock"] }, undefined] },
  { title: "Soulstones · #5",                   iconSlug: "spell_shadow_soulgem",                  rowIconSlug: "spell_shadow_soulgem",
    fixedSlots: 2, slotEligibility: [{ classes: ["Warlock"] }, undefined] },

  // ── Warlock curses — single block, icon-as-row-label, 1 warlock per ──
  // Recklessness for physical raids, Elements for caster raids,
  // Malediction (CoE + Shadow vulnerability via the talent) for
  // mixed-damage fights. Picker filters to Warlocks; cross-section
  // dedup spreads multiple warlocks across the three curses.
  { title: "Curses · Recklessness",             iconSlug: "spell_shadow_curseofachimonde",         rowIconSlug: "spell_shadow_unholystrength",   eligibility: { classes: ["Warlock"] }, fixedSlots: 1 },
  { title: "Curses · Elements",                 iconSlug: "spell_shadow_curseofachimonde",         rowIconSlug: "spell_shadow_chilltouch",        eligibility: { classes: ["Warlock"] }, fixedSlots: 1 },
  { title: "Curses · Malediction",              iconSlug: "spell_shadow_curseofachimonde",         rowIconSlug: "spell_shadow_curseofachimonde",  eligibility: { classes: ["Warlock"] }, fixedSlots: 1 },

  // ── Physical raid debuffs — one row per boss-side debuff, one eligible
  // class per row (Druid FF, Rogue iEA, Warrior Demo/BF/TC). Same layout
  // as Curses: row icon on the left, one slot on the right.
  { title: "Debuffs · Faerie Fire",             iconSlug: "ability_warrior_warcry",                rowIconSlug: "spell_nature_faeriefire",        eligibility: { classes: ["Druid"] },   fixedSlots: 1 },
  { title: "Debuffs · Improved Expose Armor",   iconSlug: "ability_warrior_warcry",                rowIconSlug: "ability_warrior_riposte",        eligibility: { classes: ["Rogue"] },   fixedSlots: 1 },
  { title: "Debuffs · Demoralizing Shout",      iconSlug: "ability_warrior_warcry",                rowIconSlug: "ability_warrior_warcry",         eligibility: { classes: ["Warrior"] }, fixedSlots: 1 },
  { title: "Debuffs · Blood Frenzy",            iconSlug: "ability_warrior_warcry",                rowIconSlug: "ability_warrior_bloodfrenzy",    eligibility: { classes: ["Warrior"] }, fixedSlots: 1 },
  { title: "Debuffs · Thunderclap",             iconSlug: "ability_warrior_warcry",                rowIconSlug: "ability_thunderclap",            eligibility: { classes: ["Warrior"] }, fixedSlots: 1 },
];

/**
 * Which column each buff category lives in on the BuffsCard. Categories
 * are matched on the title prefix-before-"·". Unknown categories fall
 * into the right column.
 *
 * Aliases (the lines marked "legacy") keep sheets created before the
 * title-format refactor (e.g. "Greater Blessing of Kings" instead of
 * "Greater Blessings · Kings") in the right column too — so an admin
 * doesn't have to click "Reset to defaults" just to get blessings
 * sorted into the middle column.
 */
export const BUFF_COLUMNS: Record<string, "left" | "middle" | "right"> = {
  // LEFT — raid-wide buffs + tank/mana support
  "Prayer of Fortitude":           "left",
  "Gift of the Wild":              "left",
  "Arcane Brilliance":             "left",
  "Earth Shield":                  "left",
  "Innervate":                     "left",
  "Power Infusion":                "left",      // legacy
  "Mark of the Wild":              "left",      // legacy

  // MIDDLE — every Paladin assignment
  "Paladin Seals":                 "middle",
  "Blessing of Protection":        "middle",
  "Greater Blessings":             "middle",
  "Greater Blessing of Kings":     "middle",    // legacy
  "Greater Blessing of Might":     "middle",    // legacy
  "Greater Blessing of Wisdom":    "middle",    // legacy
  "Greater Blessing of Salvation": "middle",    // legacy
  "Greater Blessing of Sanctuary": "middle",    // legacy
  "Greater Blessing of Light":     "middle",    // legacy

  // RIGHT — warlock utility + raid debuffs
  "Soulstones":                    "right",
  "Soulstone Caster":              "right",     // legacy
  "Soulstone Order":               "right",     // legacy
  "Tranquility":                   "right",     // legacy
  "Curses":                        "right",
  "Debuffs":                       "right",
  "Affliction Warlock (Debuffs)":  "right",     // legacy
  "Misdirection":                  "right",     // legacy
  "Faerie Fire":                   "right",     // legacy
  "Sunder Armor":                  "right",     // legacy
  "Battle Shout":                  "right",     // legacy
};

/**
 * Per-category tooltip descriptions. Surface as a hover-tooltip on the
 * block header. Categories are matched on the prefix-before-"·" (or the
 * whole title if there's no separator); admin-renamed categories just
 * lose the tooltip.
 */
export const BUFF_TOOLTIPS: Record<string, string> = {
  "Prayer of Fortitude":   "Priest raid buff — stamina to a class group.",
  "Arcane Brilliance":     "Mage raid buff — intellect to a class group.",
  "Gift of the Wild":      "Druid raid buff — all stats to a class group.",
  "Soulstones":            "Warlock pre-cast on a healer for emergency rez. List the caster + the rez priority order.",
  "Innervate":             "Resto druid restores mana on a target — typically a mage. Slot 1 is the druid, slot 2 is the mage.",
  "Earth Shield":          "Resto shaman buff on the main tank. Heals when struck.",
  "Blessing of Protection": "Paladin bubbles a warlock about to soulfire / soak a Wretched Doom. Slot 1 paladin, slot 2 warlock.",
  "Greater Blessings":     "Paladin raid buffs by spec. Kings for tanks, Might for melee, Wisdom for casters/healers, Salvation for DPS.",
  "Paladin Seals":         "On-boss seals from paladins. Crusader for melee haste, Wisdom for mana return on hits, Light for incidental healing.",
  "Curses":                "Warlock debuffs on the boss. Recklessness for physical raids, Elements for caster raids, Shadow / Tongues situational.",
  "Debuffs":               "Physical-damage raid debuffs maintained on the boss. Faerie Fire (Druid), Improved Expose Armor (Rogue), Demoralizing Shout / Blood Frenzy / Thunderclap (Warrior).",
};

export function defaultBuffs(): AssignSection[] {
  return BUFF_TEMPLATE.map(b => ({
    id: newSectionId(),
    title: b.title,
    iconSlug: b.iconSlug,
    rowIconSlug: b.rowIconSlug,
    eligibility: b.eligibility,
    slotEligibility: b.slotEligibility,
    fixedSlots: b.fixedSlots,
    targetSlots: b.targetSlots,
    characterIds: [],
  }));
}

/**
 * Migration applied on sheet hydration:
 *   1. Append any BUFF_TEMPLATE section whose category (prefix before
 *      "·") is entirely absent from the saved sheet. New blocks like
 *      Debuffs land in every existing team's sheet on next load without
 *      requiring "Reset to defaults" — admin-edited rows are never
 *      touched.
 *   2. Reorder blocks to match the current template order, so when the
 *      template moves (e.g. Earth Shield from right→left column), every
 *      existing sheet picks up the new arrangement on next load.
 *
 * Sections whose category isn't in the template (admin-renamed
 * categories) sort to the end, preserving their original relative order.
 * The only side effect of "category entirely deleted" is the empty rows
 * coming back — rare and re-deletable.
 */
export function mergeMissingBuffBlocks(buffs: AssignSection[]): AssignSection[] {
  const category = (title: string) => title.split("·")[0].trim();
  const tplCategoryRank = new Map<string, number>();
  BUFF_TEMPLATE.forEach((tpl, i) => {
    const cat = category(tpl.title);
    if (!tplCategoryRank.has(cat)) tplCategoryRank.set(cat, i);
  });

  const existing = new Set(buffs.map(b => category(b.title)));
  const additions: AssignSection[] = [];
  for (const tpl of BUFF_TEMPLATE) {
    if (existing.has(category(tpl.title))) continue;
    additions.push({
      id: newSectionId(),
      title: tpl.title,
      iconSlug: tpl.iconSlug,
      rowIconSlug: tpl.rowIconSlug,
      eligibility: tpl.eligibility,
      slotEligibility: tpl.slotEligibility,
      fixedSlots: tpl.fixedSlots,
      targetSlots: tpl.targetSlots,
      characterIds: [],
    });
  }

  const all = [...buffs, ...additions];
  // Stable sort by (template category rank, original index). Admin-added
  // categories not in the template get rank +Infinity → sort to the end.
  const indexed = all.map((s, i) => ({ s, i, rank: tplCategoryRank.get(category(s.title)) ?? Number.POSITIVE_INFINITY }));
  indexed.sort((a, b) => (a.rank - b.rank) || (a.i - b.i));
  return indexed.map(x => x.s);
}

/* ────────────────────────────────────────────────────────────────────
   ELIGIBILITY HELPERS
   ──────────────────────────────────────────────────────────────────── */

/** Lightweight character shape used by eligibility checks. */
export type EligibleChar = { id: number; class: string; role: string; spec: string };

const CASTER_SPEC_RX = /\b(Mage|Warlock|Priest|Hunter|Balance Druid|Elemental Shaman|Shadow Priest)\b/;

export function isMeleeSpec(spec: string): boolean {
  return !CASTER_SPEC_RX.test(spec);
}

export function matchesEligibility(c: EligibleChar, eligibility?: Eligibility): boolean {
  if (!eligibility) return true;
  const classOK = !eligibility.classes || eligibility.classes.includes(c.class);
  const roleOK = !eligibility.roles || eligibility.roles.some(r => {
    if (r === "tank") return c.role === "tank";
    if (r === "heal") return c.role === "heal";
    if (r === "melee") return c.role === "dps" && isMeleeSpec(c.spec);
    if (r === "ranged") return c.role === "dps" && !isMeleeSpec(c.spec);
    return false;
  });
  return classOK && roleOK;
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

/* ────────────────────────────────────────────────────────────────────
   BOSS TEMPLATES
   ──────────────────────────────────────────────────────────────────── */

type SectionAddOnTemplate = {
  iconSlug: string;
  extraIcons?: string[];
  eligibility?: Eligibility;
  maxSlots: number;
  preferSpecs?: string[];
};
type SectionTemplate = {
  title: string;
  eligibility?: Eligibility;
  addOns?: SectionAddOnTemplate[];
  /** When true, forces a new row in the boss-card grid at render
   *  time. Looked up by section title — admin renames lose the hint. */
  breakBefore?: boolean;
  /** How many slots auto-fill should populate (defaults to 1). */
  targetSlots?: number;
  /** When true, hide the section's main "+ add" affordance — the
   *  section is just its addOns. Looked up by title at render time. */
  addOnsOnly?: boolean;
};
type BossTemplate = {
  sections?: SectionTemplate[];
  phases?: Array<{ label: string; sections: SectionTemplate[] }>;
};

// Shortcuts to keep BOSS_TEMPLATES readable.
const t = (
  title: string,
  eligibility?: Eligibility,
  extra?: { addOns?: SectionAddOnTemplate[]; breakBefore?: boolean; targetSlots?: number; addOnsOnly?: boolean },
): SectionTemplate =>
  ({ title, eligibility, ...extra });
const E: Record<string, Eligibility> = {
  tank:    { roles: ["tank"] },
  heal:    { roles: ["heal"] },
  melee:   { roles: ["melee"] },
  ranged:  { roles: ["ranged"] },
  warlock: { classes: ["Warlock"] },
  hunter:  { classes: ["Hunter"] },
  druid:   { classes: ["Druid"] },
  priest:  { classes: ["Priest"] },
  paladin: { classes: ["Paladin"] },
  // Ranged-DPS pool for spout teams / staggered ranged groups —
  // hunters plus caster classes. Picks up healer-spec priests/druids
  // too; admin re-arranges when auto-fill grabs the wrong character.
  rangedDps: { classes: ["Hunter", "Mage", "Warlock", "Priest", "Druid", "Shaman"] },
};

// Raw addOn templates — composed into section addOns arrays at use
// site so a section can carry more than one sub-row (e.g. Morogrim
// Add Tank gets a Misdirect addOn AND a Super Sapper Charge addOn).
const ADDON_MD_BM_AND_SUR: SectionAddOnTemplate = {
  iconSlug: "ability_hunter_misdirection",
  eligibility: { classes: ["Hunter"] },
  maxSlots: 2,
  preferSpecs: ["Beast Mastery", "Survival"],
};
const ADDON_MD_BM_ONLY: SectionAddOnTemplate = {
  iconSlug: "ability_hunter_misdirection",
  eligibility: { classes: ["Hunter"] },
  maxSlots: 2,
  preferSpecs: ["Beast Mastery"],
};
// Morogrim Add Tank: hunters do MD AND pop a Super Sapper Charge on
// the add — same character, both duties. Modelled as one addOn with a
// Sapper extraIcon so each slot row reads [MD][Sapper][Hunter].
const ADDON_MD_BM_WITH_SAPPER: SectionAddOnTemplate = {
  iconSlug: "ability_hunter_misdirection",
  extraIcons: ["inv_gizmo_supersappercharge"],
  eligibility: { classes: ["Hunter"] },
  maxSlots: 2,
  preferSpecs: ["Beast Mastery"],
};
// Single-slot misdirect for sections that take only one hunter (e.g.
// Leotheras WW Threat Wipe — one hunter MDs to bleed off post-WW
// threat onto the tank).
const ADDON_MD_BM_ONE: SectionAddOnTemplate = {
  iconSlug: "ability_hunter_misdirection",
  eligibility: { classes: ["Hunter"] },
  maxSlots: 1,
  preferSpecs: ["Beast Mastery"],
};

// Pre-composed { addOns: [...] } extras so the BOSS_TEMPLATES entries
// stay readable.
const MISDIRECT_TWO = { addOns: [ADDON_MD_BM_AND_SUR] };
const MISDIRECT_TWO_BM_ONLY = { addOns: [ADDON_MD_BM_ONLY] };
const MISDIRECT_ONE = { addOns: [ADDON_MD_BM_ONE] };
const MISDIRECT_AND_SAPPER = { addOns: [ADDON_MD_BM_WITH_SAPPER] };

/**
 * Canonical assignment sections per boss, distilled from the source
 * spreadsheet's SSC/TK tab. New AssignmentSheets seed with these so the
 * admin opens the editor and sees the right shape immediately. Every
 * section starts with empty characterIds; admin renames / adds / deletes
 * as strats evolve.
 */
const BOSS_TEMPLATES: Record<BossSlug, BossTemplate> = {
  hydross: {
    sections: [
      // Tanks. Frost MT and Nature MT each get up to 2 Hunter misdirect
      // sub-rows. Add Tank gets no misdirect (movement / add control).
      t("Frost MT",  E.tank, MISDIRECT_TWO),
      t("Nature MT", E.tank, MISDIRECT_TWO_BM_ONLY),
      t("Add Tank",  E.tank),
      t("Tank Healers", E.heal),
      t("Melee Group 1", E.melee),
      t("Melee Group 2", E.melee),
      t("RDPS 1", E.ranged),
      t("RDPS 2", E.ranged),
      t("RDPS 3", E.ranged),
    ],
  },
  lurker: {
    sections: [
      // Tanks share row 1. Misdirects funnel threat onto each tank.
      t("Main Tank",                     E.tank, MISDIRECT_TWO),
      t("Ring Adds (Feral + ProtPal)",   E.tank, MISDIRECT_TWO_BM_ONLY),
      // Spout teams share their own row. Eligible pool is ranged DPS
      // (casters + hunters); each team auto-fills 3 with cross-section
      // dedup so the teams come out as a natural mix.
      t("Spout Team A", E.rangedDps, { breakBefore: true, targetSlots: 3 }),
      t("Spout Team B", E.rangedDps, { targetSlots: 3 }),
      t("Spout Team C", E.rangedDps, { targetSlots: 3 }),
      // Healer stacks share the bottom row.
      t("Healer Stack 1", E.heal, { breakBefore: true }),
      t("Healer Stack 2", E.heal),
      t("Healer Stack 3", E.heal),
    ],
  },
  morogrim: {
    sections: [
      t("Main Tank", E.tank, MISDIRECT_TWO),
      // Add Tank hunters do MD AND pop Super Sapper Charge — one
      // character per slot, both duties. Rendered as [MD][Sapper][name].
      t("Add Tank",  E.tank, MISDIRECT_AND_SAPPER),
      t("Grave Healer", E.heal),
      // Slow-trap rotation lands on its own row below the tank row.
      t("Hunter Slow Trap — N", E.hunter, { breakBefore: true }),
      t("Hunter Slow Trap — S", E.hunter),
      t("Hunter Slow Trap — C", E.hunter),
    ],
  },
  fathom: {
    sections: [
      // Three tanks rotate; each takes its own MD hunter pair. FL is
      // the primary MT so it gets BM+Survival preference; the side
      // tanks just want a BM pet for the threat dump.
      t("FL Tank",             E.tank, MISDIRECT_TWO),
      t("Tank Healer",         E.heal),
      t("Tidal & Shark Tank",  E.tank, MISDIRECT_TWO_BM_ONLY),
      t("LOS Tank",            E.tank, MISDIRECT_TWO_BM_ONLY),
      t("LOS Healer",          E.heal),
    ],
  },
  leotheras: {
    sections: [
      // Main Tank holds Leo; MD hunter pair funnels threat onto the
      // tank pre- and post-Inner Demon.
      t("Main Tank",  E.tank,    MISDIRECT_TWO),
      // Demon Tank takes Leo's inner demon — single MD hunter feeds
      // threat onto the warlock tanking it.
      t("Demon Tank", E.warlock, MISDIRECT_ONE),
      // WW Threat Wipe is just the post-Whirlwind MD hunter — no
      // parent chip. addOnsOnly suppresses the empty main slot so
      // the section reads as a clean [MD][Hunter] row.
      t("WW Threat Wipe", undefined, { ...MISDIRECT_ONE, addOnsOnly: true }),
    ],
  },
  vashj: {
    phases: [
      {
        label: "Phase 1",
        sections: [
          // MT holds Vashj; standard MD pair (BM + Survival) funnels
          // threat through Cleanse / Shock dispel windows.
          t("Main Tank",    E.tank,   MISDIRECT_TWO),
          t("Strider Kiter", E.hunter),
          t("Elite Tanks",  E.tank),
          t("Ball Dunker"),
        ],
      },
      {
        label: "Phase 2",
        sections: [
          t("West Zone (Decurse / Dispel)"),
          t("North Zone (Decurse / Dispel)"),
          t("East Zone (Decurse / Dispel)"),
          t("South Zone (Decurse / Dispel)"),
        ],
      },
      {
        label: "Phase 3",
        sections: [
          t("Main Tank", E.tank),
          t("Tank Healers", E.heal),
          t("Healer — North", E.heal),
          t("Healer — South", E.heal),
          t("Healer — East", E.heal),
          t("Healer — West", E.heal),
          t("Healer — Flex", E.heal),
          t("Zone 1"),
          t("Zone 2"),
          t("Zone 3"),
        ],
      },
    ],
  },
  alar: {
    phases: [
      {
        label: "Phase 1",
        sections: [t("Main Tank", E.tank), t("OT (might be afk)", E.tank), t("Add Tank", E.tank)],
      },
      {
        label: "Phase 2",
        sections: [t("Main Tank", E.tank), t("OT (taunt Melt Armor)", E.tank), t("Add Tank", E.tank)],
      },
    ],
  },
  voidreaver: {
    sections: [t("Main Tank", E.tank), t("Orb Eaters")],
  },
  solarian: {
    sections: [t("Main Tank", E.tank)],
  },
  kael: {
    phases: [
      {
        label: "Phase 1",
        sections: [t("Sanguinar Tank", E.tank), t("Telonicus Tank", E.tank), t("Capernian Tank", E.tank), t("Conflag Soaker")],
      },
      {
        label: "Phase 2",
        sections: [t("2H Axe Tank", E.tank), t("Longbow Tank", E.tank), t("Remaining Tanks (cluster)", E.tank)],
      },
      {
        label: "Phase 3",
        sections: [t("Sanguinar Tank", E.tank), t("Telonicus Tank", E.tank), t("Capernian Tank", E.tank), t("Conflag Soaker")],
      },
      {
        label: "Phase 4",
        sections: [
          t("Main Tank", E.tank),
          t("Fireball Kick Order", E.melee),
          t("Pyroblast Kicks", E.melee),
          t("Phoenix Kiter #1", E.tank),
          t("Phoenix Kiter #2", E.tank),
        ],
      },
      {
        label: "Phase 5",
        sections: [],
      },
    ],
  },
};

function makeSections(tpls: SectionTemplate[]): AssignSection[] {
  return tpls.map(s => ({
    id: newSectionId(),
    title: s.title,
    eligibility: s.eligibility,
    characterIds: [],
    ...(s.targetSlots !== undefined ? { targetSlots: s.targetSlots } : {}),
    ...(s.breakBefore ? { breakBefore: true } : {}),
    ...(s.addOnsOnly ? { addOnsOnly: true } : {}),
    ...(s.addOns?.length
      ? {
          addOns: s.addOns.map(a => ({
            id: newSectionId(),
            iconSlug: a.iconSlug,
            ...(a.extraIcons?.length ? { extraIcons: [...a.extraIcons] } : {}),
            eligibility: a.eligibility,
            maxSlots: a.maxSlots,
            preferSpecs: a.preferSpecs,
            characterIds: [],
          })),
        }
      : {}),
  }));
}

/**
 * Look up a boss-template section by title. Used at render time for
 * layout hints (e.g. breakBefore) that aren't worth syncing into the
 * saved sheet data. Returns undefined when the section was renamed
 * away from the template.
 */
export function sectionTemplateForBoss(slug: BossSlug, title: string): SectionTemplate | undefined {
  const tpl = BOSS_TEMPLATES[slug];
  if (tpl.sections) return tpl.sections.find(s => s.title === title);
  if (tpl.phases) {
    for (const phase of tpl.phases) {
      const hit = phase.sections.find(s => s.title === title);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function defaultBosses(): Partial<Record<BossSlug, BossAssignment>> {
  const out: Partial<Record<BossSlug, BossAssignment>> = {};
  for (const [slug, tpl] of Object.entries(BOSS_TEMPLATES) as [BossSlug, BossTemplate][]) {
    if (tpl.sections) {
      out[slug] = { sections: makeSections(tpl.sections) };
    } else if (tpl.phases) {
      out[slug] = {
        phases: tpl.phases.map(p => ({
          id: newSectionId(),
          label: p.label,
          sections: makeSections(p.sections),
        })),
      };
    }
  }
  return out;
}

/**
 * Pre-baked default content for one boss — used by the "Reset to
 * defaults" button on each BossCard, and as the fallback shape when an
 * old AssignmentSheet doesn't yet have an entry for the boss.
 */
export function defaultBossAssignment(slug: BossSlug): BossAssignment {
  const tpl = BOSS_TEMPLATES[slug];
  if (tpl.phases) {
    return {
      phases: tpl.phases.map(p => ({
        id: newSectionId(),
        label: p.label,
        sections: makeSections(p.sections),
      })),
    };
  }
  return { sections: makeSections(tpl.sections ?? []) };
}

/**
 * Sections we've dropped from a boss template. On hydration we remove
 * matching sections from existing sheets so admins don't have to "Reset
 * to defaults" just to shed retired rows. Match is by exact title; if
 * an admin renamed a section, it stays.
 *
 * Hydross banishes were removed when the strat stopped using banish
 * crowd control — the elementals get tanked + nuked instead.
 */
const DEPRECATED_BOSS_SECTIONS: Partial<Record<BossSlug, string[]>> = {
  hydross: ["Banish — Skull", "Banish — Cross", "Banish — Triangle"],
};

export function removeDeprecatedBossSections(
  bosses: Partial<Record<BossSlug, BossAssignment>>,
): Partial<Record<BossSlug, BossAssignment>> {
  const out: Partial<Record<BossSlug, BossAssignment>> = { ...bosses };
  for (const [slug, titles] of Object.entries(DEPRECATED_BOSS_SECTIONS) as [BossSlug, string[]][]) {
    const current = out[slug];
    if (!current) continue;
    const drop = new Set(titles);
    if (current.sections) {
      out[slug] = { ...current, sections: current.sections.filter(s => !drop.has(s.title)) };
    } else if (current.phases) {
      out[slug] = {
        ...current,
        phases: current.phases.map(p => ({ ...p, sections: p.sections.filter(s => !drop.has(s.title)) })),
      };
    }
  }
  return out;
}

/**
 * Migrates boss section addOns toward the current template.
 *   1. Appends any addOn whose iconSlug doesn't yet exist on the section
 *      (so Hydross MTs picked up Misdirect rows automatically when we
 *      introduced them).
 *   2. Backfills missing `extraIcons` on an existing addOn — used when
 *      we promote a sibling addOn's icon into the primary addOn's
 *      icon strip (e.g. folding the standalone Sapper addOn into the
 *      MD addOn's extraIcons).
 *   3. Drops orphan addOns whose iconSlug is now an extraIcon of some
 *      other addOn on the same section. Otherwise the page would carry
 *      a now-redundant standalone row.
 *
 * Match is by section title; renamed sections quietly skip.
 */
export function mergeMissingBossAddOns(
  bosses: Partial<Record<BossSlug, BossAssignment>>,
): Partial<Record<BossSlug, BossAssignment>> {
  function attach(section: AssignSection, tpl: SectionTemplate | undefined): AssignSection {
    if (!tpl?.addOns?.length) return section;
    const existingIcons = new Set((section.addOns ?? []).map(a => a.iconSlug));

    // 1. Add missing addOns from the template.
    const missing = tpl.addOns.filter(a => !existingIcons.has(a.iconSlug));
    let nextAddOns: SectionAddOn[] = [
      ...(section.addOns ?? []),
      ...missing.map(a => ({
        id: newSectionId(),
        iconSlug: a.iconSlug,
        ...(a.extraIcons?.length ? { extraIcons: [...a.extraIcons] } : {}),
        eligibility: a.eligibility,
        maxSlots: a.maxSlots,
        preferSpecs: a.preferSpecs,
        characterIds: [],
      })),
    ];

    // 2. Backfill missing extraIcons on existing addOns.
    const tplByIcon = new Map(tpl.addOns.map(a => [a.iconSlug, a] as const));
    nextAddOns = nextAddOns.map(a => {
      const t = tplByIcon.get(a.iconSlug);
      if (!t?.extraIcons?.length) return a;
      const have = new Set(a.extraIcons ?? []);
      const add = t.extraIcons.filter(e => !have.has(e));
      if (add.length === 0) return a;
      return { ...a, extraIcons: [...(a.extraIcons ?? []), ...add] };
    });

    // 3. Drop standalone addOns whose iconSlug is now an extraIcon of a
    //    sibling. Preserves character data if the orphan had any
    //    assignments — but it's just discarded; the new addOn's slots
    //    use the same hunter pool so the admin re-assigns once.
    const allExtras = new Set(nextAddOns.flatMap(a => a.extraIcons ?? []));
    nextAddOns = nextAddOns.filter(a => !allExtras.has(a.iconSlug));

    return { ...section, addOns: nextAddOns };
  }

  const out: Partial<Record<BossSlug, BossAssignment>> = { ...bosses };
  for (const [slug, tpl] of Object.entries(BOSS_TEMPLATES) as [BossSlug, BossTemplate][]) {
    const current = out[slug];
    if (!current) continue;
    if (tpl.sections && current.sections) {
      const tplByTitle = new Map(tpl.sections.map(s => [s.title, s] as const));
      out[slug] = {
        ...current,
        sections: current.sections.map(s => attach(s, tplByTitle.get(s.title))),
      };
    } else if (tpl.phases && current.phases) {
      out[slug] = {
        ...current,
        phases: current.phases.map(phase => {
          const tplPhase = tpl.phases!.find(p => p.label === phase.label);
          if (!tplPhase) return phase;
          const tplByTitle = new Map(tplPhase.sections.map(s => [s.title, s] as const));
          return {
            ...phase,
            sections: phase.sections.map(s => attach(s, tplByTitle.get(s.title))),
          };
        }),
      };
    }
  }
  return out;
}

/**
 * Auto-fill empty sections with eligible roster members. Used by the
 * per-card "Suggest" button AND by the on-roster-change effect.
 *
 * Behaviour:
 * - Sections that already have ANY characters are left untouched
 *   (admin edits never get overwritten).
 * - Sections without an eligibility hint stay empty (no signal to
 *   choose from; admin fills GBs / soulstone targets manually).
 * - `targetSlots` caps how many eligible chars get added per section
 *   (defaults to 1). PoF · G1-5 uses 3, Tranq uses 5.
 * - Characters already placed in OTHER sections of the same array are
 *   skipped so multiple single-slot buffs split across raiders
 *   (PI G1-3 grabs Priest A, PI G4-5 grabs Priest B). Roster order is
 *   stable across renders so the suggestion stays deterministic.
 */
export function suggestFillSections(sections: AssignSection[], roster: EligibleChar[]): AssignSection[] {
  const used = new Set<number>();
  for (const s of sections) {
    for (const id of s.characterIds) used.add(id);
    for (const a of s.addOns ?? []) for (const id of a.characterIds) used.add(id);
  }

  function fillMain(s: AssignSection): AssignSection {
    if (s.characterIds.length > 0) return s;
    if (s.slotEligibility?.length) {
      const picks: number[] = [];
      for (const elig of s.slotEligibility) {
        if (!elig) { picks.push(0); continue; }
        const pick = roster.find(c => matchesEligibility(c, elig) && !used.has(c.id));
        if (pick) {
          picks.push(pick.id);
          used.add(pick.id);
        } else {
          picks.push(0);
        }
      }
      while (picks.length > 0 && picks[picks.length - 1] === 0) picks.pop();
      if (picks.length === 0) return s;
      return { ...s, characterIds: picks };
    }
    if (!s.eligibility) return s;
    const target = s.targetSlots ?? 1;
    const eligible = roster.filter(c => matchesEligibility(c, s.eligibility!) && !used.has(c.id));
    if (eligible.length === 0) return s;
    const picks = eligible.slice(0, target).map(c => c.id);
    picks.forEach(id => used.add(id));
    return { ...s, characterIds: picks };
  }

  function fillAddOns(s: AssignSection): AssignSection {
    if (!s.addOns?.length) return s;
    let changed = false;
    const next = s.addOns.map(a => {
      if (a.characterIds.length > 0) return a;
      const picks: number[] = [];
      for (let i = 0; i < a.maxSlots; i++) {
        const pool = roster.filter(c =>
          !used.has(c.id) && (!a.eligibility || matchesEligibility(c, a.eligibility)),
        );
        if (pool.length === 0) break;
        const preferred = a.preferSpecs?.[i];
        const pick = preferred
          ? (pool.find(c => c.spec.toLowerCase().includes(preferred.toLowerCase())) ?? pool[0])
          : pool[0];
        picks.push(pick.id);
        used.add(pick.id);
      }
      if (picks.length === 0) return a;
      changed = true;
      return { ...a, characterIds: picks };
    });
    return changed ? { ...s, addOns: next } : s;
  }

  return sections.map(s => fillAddOns(fillMain(s)));
}

/**
 * Lady Vashj's Phase 2 cast timeline — 13 cells, 0s to 240s. Cells
 * marked "scary" highlight purple (two-cast overlaps); the 180s cell
 * is "danger" (triple-overlap) and renders red. Pure display widget,
 * not editable.
 */
export const VASHJ_P2_TIMELINE: Array<{ t: string; label: string; scary?: boolean; danger?: boolean }> = [
  { t: "0s",   label: "Start" },
  { t: "45s",  label: "Elite" },
  { t: "50s",  label: "Tainted 1" },
  { t: "60s",  label: "Strider" },
  { t: "90s",  label: "Elite" },
  { t: "100s", label: "Tainted 2", scary: true },
  { t: "120s", label: "Strider" },
  { t: "135s", label: "Elite" },
  { t: "150s", label: "Tainted 3" },
  { t: "180s", label: "Elites + Strider", danger: true },
  { t: "200s", label: "Tainted 4" },
  { t: "225s", label: "Elite", scary: true },
  { t: "240s", label: "Strider", scary: true },
];

/* ────────────────────────────────────────────────────────────────────
   PLATFORM-ART STRATEGY NOTES
   ──────────────────────────────────────────────────────────────────── */

type DpsPriorityItem = { src: string; label?: string };

type PhaseInfo = {
  heading?: string;
  notes: string[];
  /** Single primary diagram for this phase. Kept for back-compat with
   *  single-image phases (P1, P3). Use `strategyImages` instead when
   *  a phase wants multiple full-width diagrams stacked. */
  strategyImage?: string;
  /** Multiple primary diagrams stacked at full rail width. When set,
   *  takes precedence over `strategyImage`. */
  strategyImages?: string[];
  /** Kill-order cheatsheet rendered as a 2-col grid above the
   *  strategy images. Each entry is `string` (just the path) or
   *  `{ src, label }` — the label renders below the thumbnail with a
   *  `#N` prefix matching its array position. */
  dpsPriorityImages?: Array<string | DpsPriorityItem>;
};

type PlatformInfo = {
  /** CSS gradient string used as the platform-art panel background. */
  gradient: string;
  /** Strategy notes for single-phase bosses, or fallback if phaseNotes
   *  is missing for the active phase. */
  notes: string[];
  /** Heading rendered above `notes`, optional. */
  heading?: string;
  /** Per-phase override for multi-phase bosses. Keyed by phase label
   *  (matches BOSS_TEMPLATES). */
  phaseNotes?: Record<string, PhaseInfo>;
  /** Top-level single strategy image (single-phase bosses, or fallback
   *  when a phase doesn't supply one). */
  strategyImage?: string;
  /** Top-level array of primary strategy images. */
  strategyImages?: string[];
  /** Top-level kill-order grid. */
  dpsPriorityImages?: Array<string | DpsPriorityItem>;
};

const PLATFORM_INFO: Record<BossSlug, PlatformInfo> = {
  hydross: {
    gradient: "linear-gradient(135deg, #0d3b3a, #15487a)",
    heading: "WATER PHASE → POISON PHASE",
    notes: [
      "Boss starts on south side.",
      "Stream-change line in the middle splits Frost ↔ Nature.",
    ],
    strategyImage: "/bosses/Hydross%20Boss%20Fight.png",
  },
  lurker: {
    gradient: "linear-gradient(135deg, #2a1f3a, #5a2e2a)",
    notes: [
      "Inner ring vs. outer ring positioning.",
      "MT center on platform; A/B/C spout teams to corners.",
    ],
    strategyImage: "/bosses/Lurker%20Below%20Boss%20Fight.png",
  },
  morogrim: {
    gradient: "linear-gradient(135deg, #15263d, #1d3e5e)",
    notes: [
      "Grave healer on NORTH; MT center.",
      "Murloc waves rotate north → south.",
    ],
    strategyImage: "/bosses/Morogrim%20Boss%20Fight.png",
  },
  fathom: {
    gradient: "linear-gradient(135deg, #25241a, #4a3e1a)",
    notes: [
      "Raid stacks center. LOS tank pulls Tidalvess behind pillar.",
      "Kill order: Caribdis → Sharkkis → Tidalvess → Fathom-Lord.",
    ],
    strategyImage: "/bosses/Fathom%20Lord%20Boss%20Fight.png",
  },
  leotheras: {
    gradient: "linear-gradient(135deg, #1a2e1f, #3c5a32)",
    notes: [
      "Warlock tanks demon on left wall. Hunter & raid spread.",
      "Whirlwind = drop threat at 5 stacks.",
    ],
    strategyImage: "/bosses/Leo%20Boss%20Fight.png",
  },
  vashj: {
    gradient: "linear-gradient(135deg, #112a16, #1e4731)",
    notes: ["See phase tabs above for per-phase notes."],
    phaseNotes: {
      "Phase 1": {
        heading: "P1 — Run out ASAP with Static Charge",
        notes: [
          "Rogues cloak it.",
          "Move boss to edge at 74% or on pull.",
        ],
        strategyImage: "/bosses/Lady%20Vashj%20Boss%20Fight%20P1.png",
      },
      "Phase 2": {
        heading: "P2 — Decurse / dispel zones",
        notes: [
          "Overlapping casts marked scary in the timeline above.",
          "Triple-overlap at 180s is the make-or-break window.",
        ],
        // Two primary diagrams stacked at full rail width — the main
        // platform map and the orb hand-off lanes.
        strategyImages: [
          "/bosses/Lady%20Vashj%20Boss%20Fight%20P2.png",
          "/bosses/Lady%20Vashj%20Boss%20Fight%20P2%20Orbs.png",
        ],
        // Kill order — Tainted is highest priority (Static Charge),
        // Enchanted next, then the physical adds (Elite / Strider).
        dpsPriorityImages: [
          { src: "/bosses/Lady%20Vashj%20DPS%20Prio%201%20-%20Tainted%20Elemental.jpg",  label: "Tainted Elemental" },
          { src: "/bosses/Lady%20Vashj%20DPS%20Prio%202%20-%20Enchanted%20Elemental.jpg", label: "Enchanted Elemental" },
          { src: "/bosses/Lady%20Vashj%20DPS%20Prio%201%20-%20Coilfang%20Elite.png",     label: "Coilfang Elite" },
          { src: "/bosses/Lady%20Vashj%20DPS%20Prio%201%20-%20Coilfang%20Strider.png",   label: "Coilfang Strider" },
        ],
      },
      "Phase 3": {
        heading: "Orb throw map",
        notes: [
          "Catchers on outer ring.",
          "Dunkers on inner ring at N/S/E/W generators.",
        ],
        strategyImage: "/bosses/Lady%20Vashj%20Boss%20Fight%20P3.png",
      },
    },
  },
  alar: {
    gradient: "linear-gradient(135deg, #3a1f1a, #6a2a1f)",
    heading: "4 platforms",
    notes: [
      "Tank 2 stands 1 platform away.",
      "Tank 3 stands across the room.",
      "Melee jump down on flight.",
      "Tank 1 & 2 swap on Melt Armor.",
    ],
  },
  voidreaver: {
    gradient: "linear-gradient(135deg, #2a1a3a, #4a2a6a)",
    notes: [
      "Spread 15y.",
      "Orbs target random raid members — eat the orb if it lands.",
    ],
  },
  solarian: {
    gradient: "linear-gradient(135deg, #1a1a3a, #3a1a5a)",
    notes: [
      "Post-nerf Wrath = living bomb.",
      "Get out and blow up at marked corners.",
    ],
  },
  kael: {
    gradient: "linear-gradient(135deg, #3a1a3a, #6a1a4a)",
    notes: ["See phase tabs above for per-phase notes."],
    phaseNotes: {
      "Phase 1": {
        heading: "Advisors",
        notes: [
          "Tank Sanguinar near pillar.",
          "Soaker stands on Conflagration mark.",
        ],
      },
      "Phase 2": {
        heading: "Weapons",
        notes: [
          "Tank everything in cluster — except 2H Axe & Bow.",
          "Kill order: Mace → Staff → Warp Slicer → Daggers → Shield → Bow → Axe.",
        ],
      },
      "Phase 3": {
        heading: "Advisors return",
        notes: ["All 4 advisors return at once.", "Melee → Sanguinar then Telonicus; Ranged → Thaladred then Capernian."],
      },
      "Phase 4": {
        heading: "Kael, but he flies",
        notes: [
          "Arcane Disruption every 20s — staff prevents.",
          "MC dispelled by daggers; hunters wing-clip.",
          "Shock Barrier: 80k shield, 10s.",
        ],
      },
      "Phase 5": {
        heading: "50% HP — full kit",
        notes: [
          "Gravity Lapse teleports + air.",
          "Nether Beam — chain beam, spread out.",
          "Nether Vapor: black clouds, -10% max HP per tick, move ASAP.",
        ],
      },
    },
  },
};

export function bossPlatformInfo(
  slug: BossSlug,
  phaseLabel?: string,
): {
  gradient: string;
  heading?: string;
  notes: string[];
  /** Resolved primary strategy images — phase override wins, then
   *  phase.strategyImage (single → singleton array), then top-level
   *  strategyImages / strategyImage. Empty array when nothing. */
  strategyImages: string[];
  /** Resolved kill-order entries, normalised to objects so the
   *  renderer doesn't have to type-narrow. */
  dpsPriorityImages: DpsPriorityItem[];
} {
  const info = PLATFORM_INFO[slug];
  const phase = phaseLabel ? info.phaseNotes?.[phaseLabel] : undefined;
  const pickStrategy = (p?: PhaseInfo): string[] => {
    if (p?.strategyImages?.length) return p.strategyImages;
    if (p?.strategyImage) return [p.strategyImage];
    if (info.strategyImages?.length) return info.strategyImages;
    if (info.strategyImage) return [info.strategyImage];
    return [];
  };
  const normaliseDps = (xs: Array<string | DpsPriorityItem> | undefined): DpsPriorityItem[] =>
    (xs ?? []).map(x => (typeof x === "string" ? { src: x } : x));
  const pickDpsPrio = (p?: PhaseInfo): DpsPriorityItem[] =>
    normaliseDps(p?.dpsPriorityImages ?? info.dpsPriorityImages);
  if (phase) {
    return {
      gradient: info.gradient,
      heading: phase.heading,
      notes: phase.notes,
      strategyImages: pickStrategy(phase),
      dpsPriorityImages: pickDpsPrio(phase),
    };
  }
  return {
    gradient: info.gradient,
    heading: info.heading,
    notes: info.notes,
    strategyImages: pickStrategy(),
    dpsPriorityImages: pickDpsPrio(),
  };
}
