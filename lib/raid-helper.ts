// Raid-Helper (Discord bot) composition import + the standalone
// per-phase assignment sheet it feeds (Black Temple / Mount Hyjal).
//
// Unlike the SSC/TK-era AssignmentSheet, this sheet has NO link to the
// Player/Character tables — the roster is exactly what the admin pasted
// from Raid-Helper's export JSON. Members carry Discord display names
// ("rfx", "Kali/Kuleana/Fishynethers"), a canonical class/spec mapped
// from Raid-Helper's spec vocabulary, and the group/slot they were
// placed in on the Discord comp. Everything else (buffs, tank rows,
// boss sections) assigns those member ids, reusing the same
// AssignSection machinery as the old sheet.

import {
  defaultBuffs,
  defaultTankAssignments,
  matchesEligibility,
  mergeMissingBuffBlocks,
  newSectionId,
  suggestFillSections,
  suggestTankRoleSections,
  type AssignSection,
  type TankAssignment,
} from "./assignments";
import { SPEC_BY_KEY, type Role } from "./specs";

export const PHASE_SLUG = "bt-hyjal";

/* ────────────────────────────────────────────────────────────────────
   RAID DAYS — one independent sheet per raid night so admins can set
   the whole week's rosters without touching the other days. Each day
   persists under its own PhaseSheet slug ("bt-hyjal-tuesday", …); the
   pre-day single sheet ("bt-hyjal") is read as Tuesday's data until a
   Tuesday row exists.
   ──────────────────────────────────────────────────────────────────── */

export type PhaseDayKey = "tuesday" | "thursday" | "sunday";

export const PHASE_DAYS: Array<{ key: PhaseDayKey; label: string; short: string; dow: number }> = [
  { key: "tuesday",  label: "Tuesday",  short: "Tue", dow: 2 },
  { key: "thursday", label: "Thursday", short: "Thu", dow: 4 },
  { key: "sunday",   label: "Sunday",   short: "Sun", dow: 0 },
];

export function phaseDaySlug(day: PhaseDayKey): string {
  return `${PHASE_SLUG}-${day}`;
}

export function isPhaseDayKey(v: unknown): v is PhaseDayKey {
  return PHASE_DAYS.some(d => d.key === v);
}

/** Every slug the phase-sheet API may write. */
export function isPhaseSheetSlug(slug: string): boolean {
  return slug === PHASE_SLUG || PHASE_DAYS.some(d => phaseDaySlug(d.key) === slug);
}

/** The raid day a visitor most likely cares about right now — today's
 *  raid if today is one, otherwise the next upcoming raid day. */
export function nextPhaseDayKey(date: Date): PhaseDayKey {
  const dow = date.getDay();
  let best: PhaseDayKey = PHASE_DAYS[0].key;
  let bestDist = 8;
  for (const d of PHASE_DAYS) {
    const dist = (d.dow - dow + 7) % 7; // 0 = today
    if (dist < bestDist) { bestDist = dist; best = d.key; }
  }
  return best;
}

/* ────────────────────────────────────────────────────────────────────
   BOSSES — Black Temple + Mount Hyjal card shells. Accents mirror the
   guide pages so the two surfaces read as one system. Per-boss section
   templates (what auto-fills from the import) land here once the
   assignment spreadsheet content is supplied.
   ──────────────────────────────────────────────────────────────────── */

export type PhaseBossMeta = {
  readonly slug: string;
  readonly raidShort: "BT" | "MH";
  readonly name: string;
  readonly accent: string;
  /** Small square boss portrait shown top-left on the card. Hotlinked
   *  from the Warcraft Logs CDN (same host as the footer's WCL favicon)
   *  using WCL's stable encounter ids — BT 601-609, Hyjal 618-622. The
   *  card hides the img on load error, so a dead URL degrades cleanly. */
  readonly icon?: string;
  /** Strategy diagram for the card's left rail (SSC/TK-style layout).
   *  Unset renders a placeholder panel until the real images land in
   *  /public/strategies/. */
  readonly strategy?: string;
};

const WCL_BOSS_ICON = (encounterId: number) =>
  `https://assets.rpglogs.com/img/warcraft/bosses/${encounterId}-icon.jpg`;

export const PHASE_BOSSES = [
  { slug: "najentus",   raidShort: "BT", name: "High Warlord Naj'entus", accent: "#5edfff", icon: WCL_BOSS_ICON(601) },
  { slug: "supremus",   raidShort: "BT", name: "Supremus",               accent: "#ff7a3c", icon: WCL_BOSS_ICON(602) },
  { slug: "shade",      raidShort: "BT", name: "Shade of Akama",         accent: "#8b9dff", icon: WCL_BOSS_ICON(603) },
  { slug: "teron",      raidShort: "BT", name: "Teron Gorefiend",        accent: "#a78bfa", icon: WCL_BOSS_ICON(604) },
  { slug: "gurtogg",    raidShort: "BT", name: "Gurtogg Bloodboil",      accent: "#ff5e6c", icon: WCL_BOSS_ICON(605) },
  { slug: "reliquary",  raidShort: "BT", name: "Reliquary of Souls",     accent: "#ff7ad4", icon: WCL_BOSS_ICON(606) },
  { slug: "shahraz",    raidShort: "BT", name: "Mother Shahraz",         accent: "#e08bff", icon: WCL_BOSS_ICON(607) },
  { slug: "council",    raidShort: "BT", name: "Illidari Council",       accent: "#c58bff", icon: WCL_BOSS_ICON(608) },
  { slug: "illidan",    raidShort: "BT", name: "Illidan Stormrage",      accent: "#a3ff5e", icon: WCL_BOSS_ICON(609) },
  { slug: "rage",       raidShort: "MH", name: "Rage Winterchill",       accent: "#7ec8ff", icon: WCL_BOSS_ICON(618) },
  { slug: "anetheron",  raidShort: "MH", name: "Anetheron",              accent: "#ff8a4c", icon: WCL_BOSS_ICON(619) },
  { slug: "kazrogal",   raidShort: "MH", name: "Kaz'rogal",              accent: "#b18bff", icon: WCL_BOSS_ICON(620) },
  { slug: "azgalor",    raidShort: "MH", name: "Az'galor",               accent: "#ff5e6c", icon: WCL_BOSS_ICON(621) },
  { slug: "archimonde", raidShort: "MH", name: "Archimonde",             accent: "#ffd24c", icon: WCL_BOSS_ICON(622) },
] as const satisfies readonly PhaseBossMeta[];

export type PhaseBossSlug = (typeof PHASE_BOSSES)[number]["slug"];

export const PHASE_RAIDS: Array<{ short: "BT" | "MH"; name: string }> = [
  { short: "BT", name: "Black Temple" },
  { short: "MH", name: "Mount Hyjal" },
];

/* ────────────────────────────────────────────────────────────────────
   SHEET SHAPE
   ──────────────────────────────────────────────────────────────────── */

/** One imported raider. `id` is a synthetic per-sheet integer (stable
 *  across re-imports for members whose name is unchanged, so their
 *  manual assignments survive a roster refresh). */
export type PhaseMember = {
  id: number;
  /** Display name exactly as it appears in Raid-Helper (may list alts —
   *  "Kali/Kuleana/Fishynethers"). */
  name: string;
  /** Canonical class ("Druid", "Warrior", …). */
  className: string;
  /** Canonical spec key from lib/specs.ts ("Feral Druid (DPS)"). */
  spec: string;
  role: Role;
  /** Discord comp group 1-5 (0 when the export put them outside G1-5). */
  group: number;
  /** Slot 1-5 within the group. */
  slot: number;
  confirmed: boolean;
  /** Raid-Helper's original spec name, kept for display/debugging
   *  ("Dreamstate", "Protection1"). */
  rhSpecName: string;
};

export type PhaseBossSheet = {
  sections: AssignSection[];
  notes?: string;
};

/**
 * The PhaseSheet.data blob. Deliberately a structural superset of the
 * old AssignmentData (groups/buffs/bosses/tankAssignments) so shared
 * cards (BuffsCard, TankHealersCard, GroupSetup) accept it unchanged —
 * `bosses` stays an empty vestige; the real per-boss sheets live in
 * `bossSheets` keyed by PhaseBossSlug.
 */
export type PhaseAssignmentData = {
  groups: Record<"1" | "2" | "3" | "4" | "5", number[]>;
  buffs: AssignSection[];
  bosses: Record<string, never>;
  tankAssignments?: TankAssignment[];
  members: PhaseMember[];
  bossSheets: Partial<Record<PhaseBossSlug, PhaseBossSheet>>;
  /** ISO timestamp of the last Raid-Helper import. */
  importedAt?: string;
  /** The Raid-Helper event/comp title, if present in the export. */
  raidTitle?: string;
  /** Highest member id ever issued on this sheet. Monotonic across
   *  imports so a departed raider's id is never recycled onto a
   *  newcomer (stale highlight locks would light up the wrong chip). */
  memberIdSeq?: number;
};

export function emptyPhaseData(): PhaseAssignmentData {
  const bossSheets: Partial<Record<PhaseBossSlug, PhaseBossSheet>> = {};
  for (const b of PHASE_BOSSES) bossSheets[b.slug] = { sections: [] };
  return {
    groups: { "1": [], "2": [], "3": [], "4": [], "5": [] },
    buffs: defaultBuffs(),
    bosses: {},
    tankAssignments: defaultTankAssignments(),
    members: [],
    bossSheets,
  };
}

/* ── Defensive sanitizers ─────────────────────────────────────────────
   The blob is written by admin-gated coarse saves, but it renders on
   the PUBLIC page server-side — a malformed element (bad manual PUT,
   old shape, partial write) must degrade to defaults, never 500. */

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const numArr = (v: unknown): number[] => (Array.isArray(v) ? v.filter(isNum) : []);

function sanitizeSection(s: unknown): AssignSection | null {
  if (!s || typeof s !== "object") return null;
  const o = s as Record<string, unknown>;
  const addOns = Array.isArray(o.addOns)
    ? o.addOns
        .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
        .map(a => ({
          ...(a as object),
          id: typeof a.id === "string" ? a.id : newSectionId(),
          iconSlug: typeof a.iconSlug === "string" ? a.iconSlug : "",
          maxSlots: isNum(a.maxSlots) ? a.maxSlots : 1,
          characterIds: numArr(a.characterIds),
        }))
    : undefined;
  return {
    ...(o as object),
    id: typeof o.id === "string" ? o.id : newSectionId(),
    title: typeof o.title === "string" ? o.title : "Untitled",
    characterIds: numArr(o.characterIds),
    ...(addOns ? { addOns } : {}),
  } as AssignSection;
}

function sanitizeSections(v: unknown): AssignSection[] {
  return Array.isArray(v) ? v.map(sanitizeSection).filter((s): s is AssignSection => s !== null) : [];
}

function sanitizeMember(m: unknown): PhaseMember | null {
  if (!m || typeof m !== "object") return null;
  const o = m as Record<string, unknown>;
  if (!isNum(o.id) || o.id <= 0 || typeof o.name !== "string" || !o.name) return null;
  const role = o.role === "tank" || o.role === "heal" || o.role === "dps" ? o.role : "dps";
  return {
    id: o.id,
    name: o.name,
    className: typeof o.className === "string" ? o.className : "",
    spec: typeof o.spec === "string" ? o.spec : "",
    role,
    group: isNum(o.group) ? o.group : 0,
    slot: isNum(o.slot) ? o.slot : 0,
    confirmed: o.confirmed !== false,
    rhSpecName: typeof o.rhSpecName === "string" ? o.rhSpecName : "",
  };
}

/**
 * Normalize a saved blob against the current template: default any
 * missing/malformed field, append buff blocks added since last save,
 * and make sure every current boss has a well-formed sheet entry.
 * Admin-edited rows are never modified beyond shape repair.
 */
export function hydratePhaseData(raw: unknown): PhaseAssignmentData {
  const base = emptyPhaseData();
  if (!raw || typeof raw !== "object") return base;
  const d = raw as Record<string, unknown>;

  const g = (d.groups && typeof d.groups === "object" ? d.groups : {}) as Record<string, unknown>;
  const groups: PhaseAssignmentData["groups"] = {
    "1": numArr(g["1"]), "2": numArr(g["2"]), "3": numArr(g["3"]),
    "4": numArr(g["4"]), "5": numArr(g["5"]),
  };

  const buffs = sanitizeSections(d.buffs);

  const tankAssignments = Array.isArray(d.tankAssignments) && d.tankAssignments.length
    ? d.tankAssignments
        .filter((t): t is Record<string, unknown> => !!t && typeof t === "object")
        .map(t => ({
          id: typeof t.id === "string" ? t.id : newSectionId(),
          marker: (["skull", "cross", "square", "moon", "triangle", "diamond"] as const)
            .find(m => m === t.marker) ?? "skull",
          tankId: isNum(t.tankId) ? t.tankId : null,
          healerIds: numArr(t.healerIds),
        }))
    : base.tankAssignments;

  // Per-boss entries: keep only known slugs, and only well-formed
  // entries — a malformed one falls back to the empty default instead
  // of clobbering it.
  const rawSheets = (d.bossSheets && typeof d.bossSheets === "object" ? d.bossSheets : {}) as Record<string, unknown>;
  const bossSheets: PhaseAssignmentData["bossSheets"] = {};
  for (const b of PHASE_BOSSES) {
    const entry = rawSheets[b.slug];
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      bossSheets[b.slug] = {
        sections: sanitizeSections(e.sections),
        ...(typeof e.notes === "string" && e.notes ? { notes: e.notes } : {}),
      };
    } else {
      bossSheets[b.slug] = { sections: [] };
    }
  }

  return {
    groups,
    buffs: mergeMissingBuffBlocks(buffs.length ? buffs : base.buffs),
    bosses: {},
    tankAssignments,
    members: Array.isArray(d.members)
      ? d.members.map(sanitizeMember).filter((m): m is PhaseMember => m !== null)
      : [],
    bossSheets,
    importedAt: typeof d.importedAt === "string" ? d.importedAt : undefined,
    raidTitle: typeof d.raidTitle === "string" ? d.raidTitle : undefined,
    memberIdSeq: isNum(d.memberIdSeq) ? d.memberIdSeq : undefined,
  };
}

/* ────────────────────────────────────────────────────────────────────
   RAID-HELPER SPEC VOCABULARY → canonical spec keys
   ──────────────────────────────────────────────────────────────────── */

/**
 * Raid-Helper's TBC spec names, mapped to our canonical spec keys.
 * Quirks handled:
 *   - Duplicate spec names across classes get a "1" suffix on the later
 *     class (Protection1/Holy1 = Paladin, Restoration1 = Shaman).
 *   - "Beastmastery" is one word; our key is "Beast Mastery Hunter".
 *   - "Dreamstate" (resto-hybrid druid) counts as a Restoration Druid.
 *   - "Smite" priests map to Holy Priest but count as DPS, not healers.
 *   - Meta-classes ("Tank"/"Healer"/"DPS" instead of a real className)
 *     are resolved through this table too — the spec name alone
 *     identifies the class ("Protection1" → Paladin).
 */
const RH_SPECS: Record<string, { spec: string; role?: Role }> = {
  // Warrior
  Arms:          { spec: "Arms Warrior" },
  Fury:          { spec: "Fury Warrior" },
  Protection:    { spec: "Protection Warrior" },
  // Paladin ("1"-suffixed duplicates)
  Holy1:         { spec: "Holy Paladin" },
  Protection1:   { spec: "Protection Paladin" },
  Retribution:   { spec: "Retribution Paladin" },
  // Hunter
  Beastmastery:  { spec: "Beast Mastery Hunter" },
  Marksmanship:  { spec: "Marksmanship Hunter" },
  Survival:      { spec: "Survival Hunter" },
  // Rogue
  Assassination: { spec: "Assassination Rogue" },
  Combat:        { spec: "Combat Rogue" },
  Subtlety:      { spec: "Subtlety Rogue" },
  // Priest
  Discipline:    { spec: "Discipline Priest" },
  Holy:          { spec: "Holy Priest" },
  Shadow:        { spec: "Shadow Priest" },
  Smite:         { spec: "Holy Priest", role: "dps" },
  // Shaman
  Elemental:     { spec: "Elemental Shaman" },
  Enhancement:   { spec: "Enhancement Shaman" },
  Restoration1:  { spec: "Restoration Shaman" },
  // Mage
  Arcane:        { spec: "Arcane Mage" },
  Fire:          { spec: "Fire Mage" },
  Frost:         { spec: "Frost Mage" },
  // Warlock
  Affliction:    { spec: "Affliction Warlock" },
  Demonology:    { spec: "Demonology Warlock" },
  Destruction:   { spec: "Destruction Warlock" },
  // Druid
  Balance:       { spec: "Balance Druid" },
  Dreamstate:    { spec: "Restoration Druid" },
  Feral:         { spec: "Feral Druid (DPS)" },
  Guardian:      { spec: "Feral Druid (Tank)" },
  Restoration:   { spec: "Restoration Druid" },
};

/** Raid-Helper statuses that are sign-up states, not raiders in the
 *  comp. Slots with these classNames are skipped on import. */
const RH_NON_PLAYER_CLASSES = new Set([
  "Bench", "Late", "Tentative", "Absence", "Absent", "Declined",
]);

/* ────────────────────────────────────────────────────────────────────
   PARSER
   ──────────────────────────────────────────────────────────────────── */

type RhSlot = {
  name?: unknown;
  specName?: unknown;
  className?: unknown;
  groupNumber?: unknown;
  slotNumber?: unknown;
  isConfirmed?: unknown;
};

export type ParsedImport = {
  members: PhaseMember[];
  groups: PhaseAssignmentData["groups"];
  raidTitle?: string;
  warnings: string[];
};

/**
 * Parse a pasted Raid-Helper composition export. Never throws on bad
 * member rows — problems land in `warnings` so the admin can eyeball
 * them in the preview before confirming. Throws only when the paste
 * isn't JSON or has no usable `slots` array.
 */
export function parseRaidHelperExport(text: string): ParsedImport {
  // Tolerate a paste wrapped in a Markdown code fence.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  let root: unknown;
  try {
    root = JSON.parse(cleaned);
  } catch {
    throw new Error("That doesn't parse as JSON — paste the raw Raid-Helper export.");
  }
  const slots = (root as { slots?: unknown })?.slots;
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("No \"slots\" array found — is this the Raid-Helper composition export?");
  }

  const warnings: string[] = [];
  const members: PhaseMember[] = [];
  let skippedNonPlayers = 0;

  for (const rawSlot of slots as RhSlot[]) {
    const name = typeof rawSlot?.name === "string" ? rawSlot.name.trim() : "";
    const specName = typeof rawSlot?.specName === "string" ? rawSlot.specName.trim() : "";
    const className = typeof rawSlot?.className === "string" ? rawSlot.className.trim() : "";
    if (!name) continue;
    if (RH_NON_PLAYER_CLASSES.has(className)) { skippedNonPlayers++; continue; }

    const mapped = RH_SPECS[specName];
    let spec: string;
    let role: Role;
    if (mapped) {
      spec = mapped.spec;
      role = mapped.role ?? SPEC_BY_KEY[mapped.spec].role;
    } else {
      // Unknown spec name — fall back to the first canonical spec of the
      // slot's class so the member still imports (with a warning).
      const classFallback = Object.values(RH_SPECS).find(v => SPEC_BY_KEY[v.spec].class === className);
      if (!classFallback) {
        warnings.push(`Skipped "${name}" — unrecognized spec "${specName}" / class "${className}".`);
        continue;
      }
      spec = classFallback.spec;
      role = SPEC_BY_KEY[spec].role;
      warnings.push(`"${name}": unknown spec "${specName}" — imported as ${spec}.`);
    }

    const group = Number(rawSlot?.groupNumber) || 0;
    const slot = Number(rawSlot?.slotNumber) || 0;
    if (group < 1 || group > 5) {
      warnings.push(`"${name}" is in group ${group || "?"} — outside Groups 1-5, kept on the roster but left out of the group grid.`);
    }

    members.push({
      id: 0, // assigned below / by applyImport
      name,
      className: SPEC_BY_KEY[spec].class,
      spec,
      role,
      group: group >= 1 && group <= 5 ? group : 0,
      slot,
      confirmed: rawSlot?.isConfirmed !== "unconfirmed",
      rhSpecName: specName,
    });
  }

  if (members.length === 0) {
    throw new Error("No importable raiders found in the export.");
  }
  if (skippedNonPlayers > 0) {
    warnings.push(`Skipped ${skippedNonPlayers} bench/late/tentative/absence entr${skippedNonPlayers === 1 ? "y" : "ies"}.`);
  }
  if (members.length > 25) {
    warnings.push(`${members.length} raiders imported — more than a 25-man comp.`);
  }
  const unconfirmed = members.filter(m => !m.confirmed).length;
  if (unconfirmed > 0) {
    warnings.push(`${unconfirmed} raider${unconfirmed === 1 ? " is" : "s are"} still unconfirmed in Raid-Helper.`);
  }

  // Stable ordering: by group then slot, stragglers (group 0) last.
  members.sort((a, b) => (a.group || 9) - (b.group || 9) || a.slot - b.slot || a.name.localeCompare(b.name));
  members.forEach((m, i) => { m.id = i + 1; });

  const groups: PhaseAssignmentData["groups"] = { "1": [], "2": [], "3": [], "4": [], "5": [] };
  for (const g of ["1", "2", "3", "4", "5"] as const) {
    // Declared slots first, slot-less stragglers last — so a missing
    // slotNumber never displaces someone from their Discord position.
    const inGroup = members
      .filter(m => m.group === Number(g))
      .sort((a, b) => (a.slot || 9) - (b.slot || 9));
    const slots: number[] = [];
    for (const m of inGroup) {
      const idx = Math.max(0, Math.min(4, (m.slot || slots.length + 1) - 1));
      while (slots.length <= idx) slots.push(0);
      if (slots[idx] === 0) slots[idx] = m.id;
      else slots.push(m.id); // duplicate slot number — append rather than clobber
    }
    while (slots.length && slots[slots.length - 1] === 0) slots.pop();
    groups[g] = slots;
  }

  const raidTitle = typeof (root as { title?: unknown })?.title === "string"
    ? ((root as { title: string }).title || undefined)
    : undefined;

  return { members, groups, raidTitle, warnings };
}

/* ────────────────────────────────────────────────────────────────────
   APPLYING AN IMPORT
   ──────────────────────────────────────────────────────────────────── */

/** matchesEligibility-compatible view of a member. */
export function memberToEligible(m: PhaseMember): { id: number; class: string; role: string; spec: string } {
  return { id: m.id, class: m.className, role: m.role, spec: m.spec };
}

/**
 * Strip member ids that no longer exist from every assignment area.
 * Fixed-slot rows keep their positions (removed id → empty slot);
 * growable lists just drop the id. Same contract as the old sheet's
 * pruneAssignmentsToRoster, minus the groups-derived roster.
 */
export function prunePhaseData(data: PhaseAssignmentData): PhaseAssignmentData {
  const roster = new Set(data.members.map(m => m.id));
  const ok = (id: number) => roster.has(id);

  const pruneSection = (s: AssignSection): AssignSection => {
    let characterIds: number[];
    if ((s.fixedSlots ?? 0) > 0 || (s.slotEligibility?.length ?? 0) > 0) {
      characterIds = s.characterIds.map(id => (ok(id) ? id : 0));
      while (characterIds.length && characterIds[characterIds.length - 1] === 0) characterIds.pop();
    } else {
      characterIds = s.characterIds.filter(ok);
    }
    const addOns = s.addOns?.map(a => ({ ...a, characterIds: a.characterIds.filter(ok) }));
    return { ...s, characterIds, ...(addOns ? { addOns } : {}) };
  };

  const bossSheets: PhaseAssignmentData["bossSheets"] = {};
  for (const [slug, sheet] of Object.entries(data.bossSheets) as [PhaseBossSlug, PhaseBossSheet | undefined][]) {
    bossSheets[slug] = sheet ? { ...sheet, sections: sheet.sections.map(pruneSection) } : sheet;
  }

  return {
    ...data,
    groups: {
      "1": data.groups["1"].map(id => (ok(id) ? id : 0)),
      "2": data.groups["2"].map(id => (ok(id) ? id : 0)),
      "3": data.groups["3"].map(id => (ok(id) ? id : 0)),
      "4": data.groups["4"].map(id => (ok(id) ? id : 0)),
      "5": data.groups["5"].map(id => (ok(id) ? id : 0)),
    },
    buffs: data.buffs.map(pruneSection),
    tankAssignments: data.tankAssignments?.map(t => {
      // Healer slots are positional (0 = deliberately empty column), so
      // blank stale ids in place rather than filtering — otherwise a
      // healer parked in priority slot 2 shifts into slot 1 on re-import.
      const healerIds = t.healerIds.map(id => (ok(id) ? id : 0));
      while (healerIds.length && healerIds[healerIds.length - 1] === 0) healerIds.pop();
      return {
        ...t,
        tankId: t.tankId && ok(t.tankId) ? t.tankId : null,
        healerIds,
      };
    }),
    bossSheets,
  };
}

/**
 * Apply a parsed import onto the existing sheet:
 *   1. Members matching a previous member by name (case-insensitive)
 *      keep their old id — their manual buff/boss assignments survive.
 *      New names get fresh ids.
 *   2. Groups come from the import verbatim.
 *   3. Everything referencing a departed member is pruned.
 *   4. Buff auto-fill runs over the new roster (only empty rows are
 *      touched; per-caster blocks regenerate as they always have).
 */
export function applyImport(prev: PhaseAssignmentData, parsed: ParsedImport): PhaseAssignmentData {
  const prevByName = new Map(prev.members.map(m => [m.name.toLowerCase(), m.id]));
  // Start above every id this sheet has EVER issued (memberIdSeq), not
  // just the current members' max — ids must never be recycled.
  let nextId = Math.max(prev.memberIdSeq ?? 0, 0, ...prev.members.map(m => m.id)) + 1;

  const idMap = new Map<number, number>(); // parsed id → final id
  const usedFinal = new Set<number>();
  const members: PhaseMember[] = parsed.members.map(m => {
    const kept = prevByName.get(m.name.toLowerCase());
    // Reuse the previous id when the name matches and no other imported
    // member has already claimed it (duplicate names in one export).
    const id = kept !== undefined && !usedFinal.has(kept) ? kept : nextId++;
    usedFinal.add(id);
    idMap.set(m.id, id);
    return { ...m, id };
  });

  const remapGroup = (ids: number[]) => ids.map(id => idMap.get(id) ?? 0);
  const groups: PhaseAssignmentData["groups"] = {
    "1": remapGroup(parsed.groups["1"]),
    "2": remapGroup(parsed.groups["2"]),
    "3": remapGroup(parsed.groups["3"]),
    "4": remapGroup(parsed.groups["4"]),
    "5": remapGroup(parsed.groups["5"]),
  };

  const pruned = prunePhaseData({
    ...prev,
    members,
    groups,
    raidTitle: parsed.raidTitle ?? prev.raidTitle,
    importedAt: new Date().toISOString(),
    memberIdSeq: nextId - 1,
  });

  const eligibles = members.map(memberToEligible);
  const byId = new Map(eligibles.map(e => [e.id, e]));
  return {
    ...pruned,
    buffs: suggestTankRoleSections(
      suggestFillSections(pruned.buffs, eligibles),
      pruned.groups,
      id => byId.get(id),
    ),
  };
}

/** All member ids referenced anywhere on the sheet (for pickers that
 *  need "who's not yet in a group"-style exclusions). */
export function phaseRosterIds(data: PhaseAssignmentData): number[] {
  return data.members.map(m => m.id);
}

export { matchesEligibility };
