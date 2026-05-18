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
export const ASSIGNMENT_BOSSES = [
  { slug: "hydross",    raidShort: "SSC", name: "Hydross the Unstable",         portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74886.jpg" },
  { slug: "lurker",     raidShort: "SSC", name: "The Lurker Below",             portrait: "https://wow.zamimg.com/uploads/screenshots/normal/68543.jpg" },
  { slug: "morogrim",   raidShort: "SSC", name: "Morogrim Tidewalker",          portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74894.jpg" },
  { slug: "fathom",     raidShort: "SSC", name: "Fathom-Lord Karathress",       portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74875.jpg" },
  { slug: "leotheras",  raidShort: "SSC", name: "Leotheras the Blind",          portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74891.jpg" },
  { slug: "vashj",      raidShort: "SSC", name: "Lady Vashj",                   portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74899.jpg" },
  { slug: "alar",       raidShort: "TK",  name: "Al'ar",                        portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74822.jpg" },
  { slug: "voidreaver", raidShort: "TK",  name: "Void Reaver",                  portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74900.jpg" },
  { slug: "solarian",   raidShort: "TK",  name: "High Astromancer Solarian",    portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74896.jpg" },
  { slug: "kael",       raidShort: "TK",  name: "Kael'thas Sunstrider",         portrait: "https://wow.zamimg.com/uploads/screenshots/normal/74888.jpg" },
] as const;

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
  /** Optional soft-constraint hint for who can fill this slot. */
  eligibility?: Eligibility;
  /** How many slots auto-fill should populate when the section is empty.
   *  Defaults to 1 (single caster/target). Set higher for sections that
   *  naturally hold many chars (PoF · G1-5 = 3 priests; Tranq = every
   *  druid; etc.). */
  targetSlots?: number;
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
  /** Wowhead icon slug for the marker. */
  iconSlug: string;
  /** Tank character id, or null when unfilled. */
  tankId: number | null;
  /** Healer character ids, in priority order. */
  healerIds: number[];
};

export type TankMarker = "skull" | "cross" | "square" | "moon" | "triangle" | "diamond";

const TANK_MARKERS: Array<{ marker: TankMarker; iconSlug: string; label: string }> = [
  { marker: "skull",    iconSlug: "inv_misc_head_skeleton_01",     label: "Skull" },
  { marker: "cross",    iconSlug: "spell_shadow_demonicfortitude", label: "Cross" },
  { marker: "square",   iconSlug: "inv_jewelcrafting_starofelune_01", label: "Square" },
  { marker: "moon",     iconSlug: "spell_arcane_starfire",         label: "Moon" },
  { marker: "triangle", iconSlug: "inv_misc_gem_emerald_02",       label: "Triangle" },
  { marker: "diamond",  iconSlug: "inv_misc_gem_amethyst_02",      label: "Diamond" },
];

export function defaultTankAssignments(): TankAssignment[] {
  return TANK_MARKERS.map(m => ({
    id: newSectionId(),
    marker: m.marker,
    iconSlug: m.iconSlug,
    tankId: null,
    healerIds: [],
  }));
}

export function tankMarkerLabel(m: TankMarker): string {
  return TANK_MARKERS.find(x => x.marker === m)?.label ?? m;
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
type BuffTpl = { title: string; iconSlug: string; eligibility?: Eligibility; targetSlots?: number };

const BUFF_TEMPLATE: BuffTpl[] = [
  // ── Raid-wide buffs (one caster per class group) ───────────────────────
  { title: "Prayer of Fortitude · G1-5",        iconSlug: "spell_holy_prayeroffortitude",          eligibility: { classes: ["Priest"] }, targetSlots: 3 },
  { title: "Gift of the Wild · G1-5",           iconSlug: "spell_nature_regeneration",             eligibility: { classes: ["Druid"] } },
  { title: "Arcane Brilliance · G1-5",          iconSlug: "spell_holy_arcaneintellect",            eligibility: { classes: ["Mage"] } },

  // ── Power Infusion (Priest, per-group split) ──────────────────────────
  { title: "Power Infusion · G1-3",             iconSlug: "spell_holy_powerinfusion",              eligibility: { classes: ["Priest"] } },
  { title: "Power Infusion · G4-5",             iconSlug: "spell_holy_powerinfusion",              eligibility: { classes: ["Priest"] } },

  // ── Greater Blessings (Paladin, one row per blessing type) ────────────
  // Eligibility intentionally omitted — admin lists the TARGETS, not the
  // paladin caster, and target eligibility varies by blessing.
  { title: "Greater Blessing of Kings",         iconSlug: "spell_magic_greaterblessingofkings" },
  { title: "Greater Blessing of Might",         iconSlug: "spell_holy_greaterblessingofkings" },
  { title: "Greater Blessing of Wisdom",        iconSlug: "spell_holy_greaterblessingofwisdom" },
  { title: "Greater Blessing of Salvation",     iconSlug: "spell_holy_greaterblessingofsalvation" },
  { title: "Greater Blessing of Sanctuary",     iconSlug: "spell_holy_greaterblessingofsanctuary" },

  // ── Druid utility ─────────────────────────────────────────────────────
  { title: "Innervate · Pair 1",                iconSlug: "spell_nature_lightning",                eligibility: { classes: ["Druid"] } },
  { title: "Innervate · Pair 2",                iconSlug: "spell_nature_lightning",                eligibility: { classes: ["Druid"] } },
  { title: "Tranquility",                       iconSlug: "spell_nature_tranquility",              eligibility: { classes: ["Druid"] }, targetSlots: 5 },

  // ── Warrior shout ─────────────────────────────────────────────────────
  { title: "Battle Shout · Melee",              iconSlug: "ability_warrior_battleshout",           eligibility: { classes: ["Warrior"] } },

  // ── Warlock utility ───────────────────────────────────────────────────
  { title: "Soulstone Caster",                  iconSlug: "spell_shadow_soulgem",                  eligibility: { classes: ["Warlock"] } },
  { title: "Soulstone Order · Targets",         iconSlug: "spell_shadow_soulgem" },
  { title: "Affliction Warlock (Debuffs)",      iconSlug: "spell_shadow_curseofachimonde",         eligibility: { classes: ["Warlock"] } },

  // ── Hunter pull utility ───────────────────────────────────────────────
  { title: "Misdirection · Pull",               iconSlug: "ability_hunter_misdirection",           eligibility: { classes: ["Hunter"] } },

  // ── Boss-side debuffs (Warlock) ───────────────────────────────────────
  { title: "Curse of Recklessness",             iconSlug: "spell_shadow_unholystrength",           eligibility: { classes: ["Warlock"] } },
  { title: "Curse of the Elements",             iconSlug: "spell_shadow_chilltouch",               eligibility: { classes: ["Warlock"] } },

  // ── Boss-side debuffs (Druid / Hunter) ────────────────────────────────
  { title: "Faerie Fire · #1",                  iconSlug: "spell_nature_faeriefire",               eligibility: { classes: ["Druid", "Hunter"] } },
  { title: "Faerie Fire · #2",                  iconSlug: "spell_nature_faeriefire",               eligibility: { classes: ["Druid", "Hunter"] } },

  // ── Boss-side debuffs (Warrior) ───────────────────────────────────────
  { title: "Sunder Armor · #1",                 iconSlug: "ability_warrior_sunder",                eligibility: { classes: ["Warrior"] } },
  { title: "Sunder Armor · #2",                 iconSlug: "ability_warrior_sunder",                eligibility: { classes: ["Warrior"] } },
  { title: "Sunder Armor · #3",                 iconSlug: "ability_warrior_sunder",                eligibility: { classes: ["Warrior"] } },
];

export function defaultBuffs(): AssignSection[] {
  return BUFF_TEMPLATE.map(b => ({
    id: newSectionId(),
    title: b.title,
    iconSlug: b.iconSlug,
    eligibility: b.eligibility,
    targetSlots: b.targetSlots,
    characterIds: [],
  }));
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

type SectionTemplate = { title: string; eligibility?: Eligibility };
type BossTemplate = {
  sections?: SectionTemplate[];
  phases?: Array<{ label: string; sections: SectionTemplate[] }>;
};

// Shortcuts to keep BOSS_TEMPLATES readable.
const t = (title: string, eligibility?: Eligibility): SectionTemplate => ({ title, eligibility });
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
};

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
      t("Frost MT", E.tank),
      t("Nature MT", E.tank),
      t("Add Tank", E.tank),
      t("Tank Healers", E.heal),
      t("Melee Group 1", E.melee),
      t("Melee Group 2", E.melee),
      t("Banish — Skull", E.warlock),
      t("Banish — Cross", E.warlock),
      t("Banish — Triangle", E.warlock),
      t("RDPS 1", E.ranged),
      t("RDPS 2", E.ranged),
      t("RDPS 3", E.ranged),
    ],
  },
  lurker: {
    sections: [
      t("Main Tank", E.tank),
      t("Ring Adds (Feral + ProtPal)", E.tank),
      t("Spout Team A"),
      t("Spout Team B"),
      t("Spout Team C"),
      t("Healer Stack 1", E.heal),
      t("Healer Stack 2", E.heal),
      t("Healer Stack 3", E.heal),
    ],
  },
  morogrim: {
    sections: [
      t("Main Tank", E.tank),
      t("Add Tank", E.tank),
      t("Grave Healer", E.heal),
      t("Hunter Slow Trap — N", E.hunter),
      t("Hunter Slow Trap — S", E.hunter),
      t("Hunter Slow Trap — C", E.hunter),
    ],
  },
  fathom: {
    sections: [
      t("FL Tank", E.tank),
      t("Tank Healer", E.heal),
      t("Tidal & Shark Tank", E.tank),
      t("LOS Tank", E.tank),
      t("LOS Healer", E.heal),
    ],
  },
  leotheras: {
    sections: [
      t("Main Tank", E.tank),
      t("Demon Tank", E.warlock),
      t("WW Threat Wipe"),
    ],
  },
  vashj: {
    phases: [
      {
        label: "Phase 1",
        sections: [t("Main Tank", E.tank), t("Strider Kiter", E.hunter), t("Elite Tanks", E.tank), t("Ball Dunker")],
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
  }));
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
  for (const s of sections) for (const id of s.characterIds) used.add(id);

  return sections.map(s => {
    if (s.characterIds.length > 0 || !s.eligibility) return s;
    const target = s.targetSlots ?? 1;
    const eligible = roster.filter(c => matchesEligibility(c, s.eligibility) && !used.has(c.id));
    if (eligible.length === 0) return s;
    const picks = eligible.slice(0, target).map(c => c.id);
    picks.forEach(id => used.add(id));
    return { ...s, characterIds: picks };
  });
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
  { t: "180s", label: "DANGER", danger: true },
  { t: "200s", label: "Tainted 4" },
  { t: "225s", label: "Elite", scary: true },
  { t: "240s", label: "Strider", scary: true },
];

/* ────────────────────────────────────────────────────────────────────
   PLATFORM-ART STRATEGY NOTES
   ──────────────────────────────────────────────────────────────────── */

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
  phaseNotes?: Record<string, { heading?: string; notes: string[] }>;
};

const PLATFORM_INFO: Record<BossSlug, PlatformInfo> = {
  hydross: {
    gradient: "linear-gradient(135deg, #0d3b3a, #15487a)",
    heading: "WATER PHASE → POISON PHASE",
    notes: [
      "Boss starts on south side.",
      "Stream-change line in the middle splits Frost ↔ Nature.",
    ],
  },
  lurker: {
    gradient: "linear-gradient(135deg, #2a1f3a, #5a2e2a)",
    notes: [
      "Inner ring vs. outer ring positioning.",
      "MT center on platform; A/B/C spout teams to corners.",
    ],
  },
  morogrim: {
    gradient: "linear-gradient(135deg, #15263d, #1d3e5e)",
    notes: [
      "Grave healer on NORTH; MT center.",
      "Murloc waves rotate north → south.",
    ],
  },
  fathom: {
    gradient: "linear-gradient(135deg, #25241a, #4a3e1a)",
    notes: [
      "Raid stacks center. LOS tank pulls Tidalvess behind pillar.",
      "Kill order: Caribdis → Sharkkis → Tidalvess → Fathom-Lord.",
    ],
  },
  leotheras: {
    gradient: "linear-gradient(135deg, #1a2e1f, #3c5a32)",
    notes: [
      "Warlock tanks demon on left wall. Hunter & raid spread.",
      "Whirlwind = drop threat at 5 stacks.",
    ],
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
      },
      "Phase 2": {
        heading: "P2 — Decurse / dispel zones",
        notes: [
          "Overlapping casts marked scary in the timeline above.",
          "Triple-overlap at 180s is the make-or-break window.",
        ],
      },
      "Phase 3": {
        heading: "Orb throw map",
        notes: [
          "Catchers on outer ring.",
          "Dunkers on inner ring at N/S/E/W generators.",
        ],
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

export function bossPlatformInfo(slug: BossSlug, phaseLabel?: string): { gradient: string; heading?: string; notes: string[] } {
  const info = PLATFORM_INFO[slug];
  if (phaseLabel && info.phaseNotes?.[phaseLabel]) {
    return { gradient: info.gradient, ...info.phaseNotes[phaseLabel] };
  }
  return { gradient: info.gradient, heading: info.heading, notes: info.notes };
}
