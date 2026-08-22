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
  /** Strategy diagram for the card's left rail (SSC/TK-style layout). */
  readonly strategy?: string;
  /** Multi-image rail for phase fights (Illidan P1/P2/P3) — takes
   *  precedence over `strategy` when set. */
  readonly strategies?: readonly { label: string; src: string }[];
  /** Matching boss id in the /guides data — powers the card's guide
   *  popup. */
  readonly guideId?: string;
};

const WCL_BOSS_ICON = (encounterId: number) =>
  `https://assets.rpglogs.com/img/warcraft/bosses/${encounterId}-icon.jpg`;

export const PHASE_BOSSES = [
  { slug: "najentus",   raidShort: "BT", name: "High Warlord Naj'entus", accent: "#5edfff", icon: WCL_BOSS_ICON(601), guideId: "najentus", strategy: "/strategies/najentus.png" },
  { slug: "supremus",   raidShort: "BT", name: "Supremus",               accent: "#ff7a3c", icon: WCL_BOSS_ICON(602), guideId: "supremus", strategy: "/strategies/supremus.png" },
  { slug: "shade",      raidShort: "BT", name: "Shade of Akama",         accent: "#8b9dff", icon: WCL_BOSS_ICON(603), guideId: "shade-of-akama", strategy: "/strategies/shade.png" },
  { slug: "teron",      raidShort: "BT", name: "Teron Gorefiend",        accent: "#a78bfa", icon: WCL_BOSS_ICON(604), guideId: "teron-gorefiend", strategy: "/strategies/teron.png" },
  { slug: "gurtogg",    raidShort: "BT", name: "Gurtogg Bloodboil",      accent: "#ff5e6c", icon: WCL_BOSS_ICON(605), guideId: "gurtogg-bloodboil", strategy: "/strategies/gurtogg.png" },
  { slug: "reliquary",  raidShort: "BT", name: "Reliquary of Souls",     accent: "#ff7ad4", icon: WCL_BOSS_ICON(606), guideId: "reliquary-of-souls", strategy: "/strategies/reliquary.png" },
  { slug: "shahraz",    raidShort: "BT", name: "Mother Shahraz",         accent: "#e08bff", icon: WCL_BOSS_ICON(607), guideId: "mother-shahraz", strategy: "/strategies/shahraz.png" },
  { slug: "council",    raidShort: "BT", name: "Illidari Council",       accent: "#c58bff", icon: WCL_BOSS_ICON(608), guideId: "illidari-council", strategy: "/strategies/council.png" },
  { slug: "illidan",    raidShort: "BT", name: "Illidan Stormrage",      accent: "#a3ff5e", icon: WCL_BOSS_ICON(609), guideId: "illidan", strategies: [{ label: "Phase 1", src: "/strategies/illidan-p1.png" }, { label: "Phase 2", src: "/strategies/illidan-p2.png" }, { label: "Phase 3", src: "/strategies/illidan-p3.png" }] },
  { slug: "rage",       raidShort: "MH", name: "Rage Winterchill",       accent: "#7ec8ff", icon: WCL_BOSS_ICON(618), guideId: "rage-winterchill", strategy: "/strategies/rage.png" },
  { slug: "anetheron",  raidShort: "MH", name: "Anetheron",              accent: "#ff8a4c", icon: WCL_BOSS_ICON(619), guideId: "anetheron", strategy: "/strategies/anetheron.png" },
  { slug: "kazrogal",   raidShort: "MH", name: "Kaz'rogal",              accent: "#b18bff", icon: WCL_BOSS_ICON(620), guideId: "kazrogal", strategy: "/strategies/kazrogal.png" },
  { slug: "azgalor",    raidShort: "MH", name: "Az'galor",               accent: "#ff5e6c", icon: WCL_BOSS_ICON(621), guideId: "azgalor", strategy: "/strategies/azgalor.png" },
  { slug: "archimonde", raidShort: "MH", name: "Archimonde",             accent: "#ffd24c", icon: WCL_BOSS_ICON(622), guideId: "archimonde", strategy: "/strategies/archimonde.png" },
] as const satisfies readonly PhaseBossMeta[];

export type PhaseBossSlug = (typeof PHASE_BOSSES)[number]["slug"];

export const PHASE_RAIDS: Array<{ short: "BT" | "MH"; name: string }> = [
  { short: "BT", name: "Black Temple" },
  { short: "MH", name: "Mount Hyjal" },
];

/* ────────────────────────────────────────────────────────────────────
   BOSS ASSIGNMENT TEMPLATES — transcribed from the guild's Google
   Sheet. Each section is a box of ordered slots; a slot's label is an
   ordinal class/spec callsign ("Feral 1", "Hunter 2") that both hints
   the picker and drives deterministic auto-fill from the imported
   roster: the nth member matching the slot's spec pool, in roster
   (group) order. Slots without an `nth` are manual — the label still
   scopes the picker. Template info lives here in code; the saved blob
   stores only the picks (sections keyed by stable "tpl:<key>" ids).
   ──────────────────────────────────────────────────────────────────── */

export type PhaseSlotRule = {
  /** Callsign shown while the slot is empty ("Feral 1", "Open"). */
  label: string;
  /** Eligible canonical spec keys. Pool order = roster order, unless
   *  `tiered` — then specs[0] matches first (Feral: bears before cats). */
  specs?: string[];
  tiered?: boolean;
  /** 1-based slot into the group-derived tank hierarchy (MT = the
   *  Group 2 feral or the Prot Warrior when he's there; OT = same from
   *  Group 1; then the rest). Overrides `nth` when set. */
  tankSlot?: number;
  /** Fill from a specific Discord raid group — the nth member of that
   *  group in slot order (Gurtogg's Blood Boil soak groups = raid
   *  Groups 3 & 4). */
  fromGroup?: number;
  /** Class-level eligibility for manual slots ("Reck 1" → any Paladin). */
  classes?: string[];
  /** 1-based ordinal into the spec pool for auto-fill; omit = manual. */
  nth?: number;
  /** Wowhead icon slug rendered before the slot (Misdirection rows). */
  icon?: string;
  /** Position tag rendered as a small leading cell ("H1"…"H5" healer
   *  spots on the Hyjal platform maps). */
  pos?: string;
};

export type PhaseSectionTpl = {
  /** Stable key — the stored section id is `tpl:<key>`. */
  key: string;
  title: string;
  /** Fight-phase grouping — consecutive sections sharing a phase render
   *  under one phase divider on the card (Illidan P1/P2/P3/P5). */
  phase?: string;
  /** Secondary header row under the title ("If Not using NPC"). */
  subtitle?: string;
  slots?: PhaseSlotRule[];
  /** Read-only text rows (Fel Rage tips). */
  staticItems?: string[];
  /** External link bars (WeakAuras, the Teron mini-game). */
  links?: readonly { label: string; href: string }[];
};

const MD_ICON = "ability_hunter_misdirection";
const md = (r: PhaseSlotRule): PhaseSlotRule => ({ ...r, icon: MD_ICON });
const at = (pos: string, r: PhaseSlotRule): PhaseSlotRule => ({ ...r, pos });

/** Slot-rule shorthands matching the sheet's callsign vocabulary. */
const S = {
  // Tank callsigns resolve through the group hierarchy (MT = Group 2,
  // OT = Group 1, Prot Warrior takes the role when he is in that group).
  feral:  (n: number) => ({ label: `Feral ${n}`,  specs: ["Feral Druid (Tank)", "Feral Druid (DPS)", "Protection Warrior"], tankSlot: n }),
  surv:   (n: number) => ({ label: `Surv ${n}`,   specs: ["Survival Hunter"], nth: n }),
  hunter: (n: number) => ({ label: `Hunter ${n}`, specs: ["Beast Mastery Hunter", "Marksmanship Hunter"], tiered: true, nth: n }),
  hpal:   (n: number) => ({ label: `Hpal ${n}`,   specs: ["Holy Paladin"], nth: n }),
  ret:    (n: number) => ({ label: `Ret ${n}`,    specs: ["Retribution Paladin"], nth: n }),
  prot:   (n: number) => ({ label: `Prot ${n}`,   specs: ["Protection Paladin"], nth: n }),
  // Curse of Recklessness warlock — assigned per-fight like the buff
  // sheet's Curses row, so manual, picker scoped to warlocks.
  reck:   (n: number) => ({ label: `Reck ${n}`,   classes: ["Warlock"] }),
  affi:   (n: number) => ({ label: `Affi ${n}`,   specs: ["Affliction Warlock"], nth: n }),
  // "Warlock n" counts the non-Affliction locks so it never doubles up
  // with the dedicated "Affi n" slots in a parallel group.
  lock:   (n: number) => ({ label: `Warlock ${n}`, specs: ["Destruction Warlock", "Demonology Warlock"], nth: n }),
  ele:    (n: number) => ({ label: `Ele ${n}`,    specs: ["Elemental Shaman"], nth: n }),
  // Disc falls back to the Holy-signed priest — signups often carry the
  // wrong priest spec and the Disc slots were staying empty.
  disc:   (n: number) => ({ label: `Disc ${n}`,   specs: ["Discipline Priest", "Holy Priest"], tiered: true, nth: n }),
  mage:   (n: number) => ({ label: `Mage ${n}`,   specs: ["Arcane Mage", "Fire Mage", "Frost Mage"], nth: n }),
  boomie: (n: number) => ({ label: `Boomie ${n}`, specs: ["Balance Druid"], nth: n }),
  rdruid: (n: number) => ({ label: `Rdruid ${n}`, specs: ["Restoration Druid"], nth: n }),
  rsham:  (n: number) => ({ label: `Rsham ${n}`,  specs: ["Restoration Shaman"], nth: n }),
  spriest:(n: number) => ({ label: `Spriest ${n}`, specs: ["Shadow Priest"], nth: n }),
  /** The nth member of a Discord raid group, any class. */
  groupSlot: (g: number, n: number): PhaseSlotRule => ({ label: `G${g} \u00b7 ${n}`, fromGroup: g, nth: n }),
  openMd:  (): PhaseSlotRule => md({ label: "Open", classes: ["Hunter"] }),
  openPala:(): PhaseSlotRule => ({ label: "Open", classes: ["Paladin"] }),
  open:    (): PhaseSlotRule => ({ label: "Open" }),
};

export const PHASE_BOSS_TEMPLATES: Partial<Record<PhaseBossSlug, PhaseSectionTpl[]>> = {
  najentus: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
  ],
  supremus: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2))] },
    { key: "hateful", title: "Hateful Tank",
      slots: [S.feral(2), md(S.surv(1)), S.openMd()] },
  ],
  shade: [
    // Adds come down both sides — one tank each; the Surv's two MDs
    // mean he can cover a side while an Open row stays for the extra.
    { key: "lefttank", title: "Left Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.surv(1))] },
    { key: "righttank", title: "Right Tank",
      slots: [S.feral(2), md(S.hunter(2)), S.openMd()] },
  ],
  teron: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "minigame", title: "Construct Mini-Game",
      staticItems: ["Practice the construct kill before raid :)"],
      links: [{ label: "teron.faldorn.net/terongame", href: "https://teron.faldorn.net/terongame/" }] },
  ],
  gurtogg: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2))] },
    { key: "ot", title: "OT",
      slots: [S.feral(2), md(S.hunter(3)), md(S.surv(1)), S.openMd()] },
    // Two soak groups rotate — the raid's Groups 3 and 4, straight from
    // the Discord comp.
    { key: "bb1", title: "Blood Boil Group 1", subtitle: "Raid Group 3",
      slots: [S.groupSlot(3, 1), S.groupSlot(3, 2), S.groupSlot(3, 3), S.groupSlot(3, 4), S.groupSlot(3, 5)] },
    { key: "bb2", title: "Blood Boil Group 2", subtitle: "Raid Group 4",
      slots: [S.groupSlot(4, 1), S.groupSlot(4, 2), S.groupSlot(4, 3), S.groupSlot(4, 4), S.groupSlot(4, 5)] },
    { key: "felrage", title: "Fel Rage BoP",
      slots: [S.hpal(1), S.ret(1), S.prot(1), S.openPala(), S.openPala()] },
    { key: "tips", title: "Fel Rage Tips",
      staticItems: [
        "Rogues: Evasion",
        "Druids: Bear",
        "Mages: do NOT Block",
        "Hunters: do NOT Feign",
        "Spread from the Fel Rage target",
      ] },
  ],
  reliquary: [
    { key: "p1rot", title: "P1 Tank Rot",
      slots: [S.feral(1), S.feral(2), S.prot(1)] },
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "ot", title: "OT",
      slots: [S.feral(2)] },
    { key: "kicks", title: "Kick Rotation", subtitle: "P2 — Spirit Shock",
      staticItems: ["1. Group 1", "2. Group 2", "3. Groups 3 + 4 (combined)"] },
  ],
  shahraz: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "ot", title: "OT",
      slots: [S.feral(2), S.prot(1)] },
    { key: "was", title: "Helpful WAs",
      links: [
        { label: "Prismatic Shield Checker", href: "https://wago.io/2WMUU1Xr-" },
        { label: "Shadow Resistance Checker", href: "https://wago.io/xg11NQ_KE" },
      ] },
  ],
  council: [
    { key: "gathios", title: "Gathios Tank",
      slots: [S.feral(1), md(S.hunter(1))] },
    { key: "veras", title: "Veras Tank",
      slots: [S.feral(2), md(S.hunter(2))] },
    { key: "malande", title: "Malande Tank",
      slots: [S.prot(1), md(S.surv(1)), S.openMd()] },
    { key: "magetank", title: "Mage Tank",
      slots: [S.mage(1)] },
    { key: "bop", title: "BoP Mage on Pull",
      slots: [S.hpal(1)] },
    { key: "wa", title: "Helpful WA",
      links: [{ label: "Council Heal Kick", href: "https://wago.io/tdQDtUTrZ" }] },
  ],
  illidan: [
    // ── Phase 1 — shear tank on the boss. Prot Warrior when one is in
    // the comp, otherwise the Prot Paladin (tiered pool).
    { key: "mt", title: "Main Tank", phase: "Phase 1",
      slots: [
        { label: "Prot 1", specs: ["Protection Warrior", "Protection Paladin"], tiered: true, nth: 1 },
        md(S.hunter(1)),
        S.openMd(),
      ] },
    { key: "p1notes", title: "P1 Notes", phase: "Phase 1",
      staticItems: [
        "Pally/Warrior tank — shear cap 102.4%",
        "Move the boss after Flame Crash",
        "Parasites run to the marked spot — Hunter Trap / Earthbind Totem there",
      ] },
    // ── Phase 2 — Fire Res tanks each pick up a Flame of Azzinoth.
    { key: "lefttank", title: "Left Ele Tank", phase: "Phase 2",
      slots: [
        { label: "Feral 1", specs: ["Feral Druid (Tank)", "Feral Druid (DPS)"], tankSlot: 1 },
        md(S.hunter(2)),
      ] },
    { key: "righttank", title: "Right Ele Tank", phase: "Phase 2",
      slots: [
        { label: "Feral 2", specs: ["Feral Druid (Tank)", "Feral Druid (DPS)"], tankSlot: 2 },
        md(S.surv(1)),
        S.openMd(),
      ] },
    { key: "p2notes", title: "P2 Notes", phase: "Phase 2",
      staticItems: [
        "Fire Res tanks pick up the Flames — kite within 1-24 yds of its glaive or Enrage = wipe",
        "Tanks do NOT frontal the raid (cone + fire under your feet)",
        "Dodge Eye Blast — the blue fire line lasts 1 min, don't walk into it",
        "Raid splits into 3 groups — 2 ranged / 1 melee",
        "Focus ONE Elemental then switch",
      ] },
    // ── Phase 3 — P1 again with demons; lust here to skip P4 entirely.
    { key: "p3notes", title: "P3 Notes", phase: "Phase 3",
      staticItems: [
        "Repeat P1 with slight changes — raid spreads",
        "LUST P3 to skip P4",
        "Earthbind Totem / Frost Trap on the drops",
      ] },
    // ── Phase 5
    { key: "p5", title: "Phase 5", phase: "Phase 5",
      staticItems: [
        "Repeat of P3",
        "Illidan Enrages & needs to be kited over a trap to Soothe him",
        "Burn the boss",
      ] },
  ],
  rage: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "healerpos", title: "Healer Pos",
      slots: [
        at("H1", S.hpal(1)), at("H2", S.disc(1)), at("H3", S.rdruid(1)),
        at("H4", S.rsham(1)), at("H5", S.rsham(2)),
      ] },
  ],
  anetheron: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "healerpos", title: "Healer Pos",
      slots: [
        at("H1", S.hpal(1)), at("H2", S.disc(1)), at("H3", S.rdruid(1)),
        at("H4", S.rsham(1)), at("H5", S.rsham(2)),
      ] },
    { key: "infernal", title: "Infernal Tank",
      slots: [S.feral(2)] },
  ],
  kazrogal: [
    // The sheet's Low Mana Warning WeakAura link rides under the MT box.
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()],
      links: [{ label: "Kaz'rogal — Low Mana Warning WA", href: "https://wago.io/xOs30kx6E" }] },
    { key: "cleave", title: "Cleave Eaters", subtitle: "If Not using NPC",
      slots: [S.feral(1), S.feral(2), S.prot(1)] },
  ],
  azgalor: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "dg", title: "DG Tank",
      slots: [S.feral(2)] },
  ],
  archimonde: [
    { key: "mt", title: "Main Tank",
      slots: [S.feral(1), md(S.hunter(1)), md(S.hunter(2)), md(S.surv(1)), S.openMd()] },
    { key: "fearward", title: "Fear Ward",
      slots: [S.disc(1), S.spriest(1)] },
    { key: "reminders", title: "Reminders",
      staticItems: [
        "If you die you should be banned",
        "Boss has less HP than Gruul",
      ] },
  ],
};

export function tplSectionId(key: string): string {
  return `tpl:${key}`;
}

/**
 * Align a boss's stored sections with its current template: every
 * templated section exists (in template order, title refreshed),
 * orphaned "tpl:" sections from removed templates are dropped, and
 * admin-added custom sections trail behind.
 */
export function reconcileTplSections(tpls: PhaseSectionTpl[], stored: AssignSection[]): AssignSection[] {
  const out: AssignSection[] = [];
  for (const t of tpls) {
    const id = tplSectionId(t.key);
    const existing = stored.find(s => s.id === id);
    out.push(existing ? { ...existing, title: t.title } : { id, title: t.title, characterIds: [] });
  }
  out.push(...stored.filter(s => !s.id.startsWith("tpl:")));
  return out;
}

/** Minimal member view the slot auto-fill needs — PhaseMember and the
 *  client's AssignableCharacter (which carries `group` on the phase
 *  sheet) both satisfy it. */
export type SlotPickable = { id: number; spec: string; group?: number };

/**
 * Group-derived tank hierarchy over the feral / prot-warrior pool:
 *   1. MT  — from Group 2: the Prot Warrior if he's there, else the
 *            feral (bear before cat); falls back to any bear/cat/pwar.
 *   2. OT  — same rule from Group 1.
 *   3. The rest of the pool in roster order.
 * Prot Paladins are NOT in this hierarchy — the pally is always the
 * third tank via his own "Prot 1" callsign.
 */
export function tankHierarchy(members: SlotPickable[]): number[] {
  const isBear = (m: SlotPickable) => m.spec === "Feral Druid (Tank)";
  const isCat  = (m: SlotPickable) => m.spec === "Feral Druid (DPS)";
  const isPWar = (m: SlotPickable) => m.spec === "Protection Warrior";
  const pool = members.filter(m => isBear(m) || isCat(m) || isPWar(m));
  const used = new Set<number>();
  const pick = (pred: (m: SlotPickable) => boolean) => {
    const found = pool.find(m => !used.has(m.id) && pred(m));
    if (found) used.add(found.id);
    return found ?? null;
  };
  const fromGroup = (g: number) =>
    pick(m => m.group === g && isPWar(m)) ??
    pick(m => m.group === g && isBear(m)) ??
    pick(m => m.group === g && isCat(m)) ??
    pick(isBear) ?? pick(isCat) ?? pick(isPWar);

  const out: number[] = [];
  const mt = fromGroup(2);
  if (mt) out.push(mt.id);
  const ot = fromGroup(1);
  if (ot) out.push(ot.id);
  for (const m of pool) {
    if (!used.has(m.id)) { used.add(m.id); out.push(m.id); }
  }
  return out;
}

/** The member filling a slot rule: tank-hierarchy slots resolve through
 *  the group-derived hierarchy; ordinal rules take the nth member of
 *  the spec pool in roster order (tiered rules walk specs[0] first).
 *  0 = no match / manual. */
export function pickForSlot(members: SlotPickable[], rule: PhaseSlotRule): number {
  if (rule.tankSlot) {
    let ids = tankHierarchy(members);
    if (rule.specs?.length) {
      const specById = new Map(members.map(m => [m.id, m.spec]));
      ids = ids.filter(id => rule.specs!.includes(specById.get(id) ?? ""));
    }
    return ids[rule.tankSlot - 1] ?? 0;
  }
  if (rule.fromGroup) {
    const pool = members.filter(m => m.group === rule.fromGroup);
    return pool[(rule.nth ?? 1) - 1]?.id ?? 0;
  }
  if (!rule.nth || !rule.specs?.length) return 0;
  const pool = rule.tiered
    ? rule.specs.flatMap(spec => members.filter(m => m.spec === spec))
    : members.filter(m => rule.specs!.includes(m.spec));
  return pool[rule.nth - 1]?.id ?? 0;
}

/**
 * Fill a boss sheet's templated slots from the roster. `onlyEmpty`
 * touches just unfilled slots (the per-card Auto-fill button); imports
 * recompute every ruled slot so the sheet always reflects the comp.
 * Manual slots (no `nth`) are never written by auto-fill.
 */
export function autoFillBossSheet(
  members: SlotPickable[],
  tpls: PhaseSectionTpl[],
  sheet: PhaseBossSheet,
  opts: { onlyEmpty: boolean },
): PhaseBossSheet {
  const sections = reconcileTplSections(tpls, sheet.sections ?? []).map(s => {
    const tpl = tpls.find(t => tplSectionId(t.key) === s.id);
    if (!tpl?.slots?.length) return s;
    const characterIds = [...s.characterIds];
    while (characterIds.length < tpl.slots.length) characterIds.push(0);
    tpl.slots.forEach((rule, i) => {
      if (!rule.nth && !rule.tankSlot && !rule.fromGroup) return;
      if (opts.onlyEmpty && characterIds[i]) return;
      characterIds[i] = pickForSlot(members, rule);
    });
    return { ...s, characterIds };
  });
  return { ...sheet, sections };
}

/**
 * Set the Tanks & Tank Healers rows from the roster: tanks take the
 * marker rows in sheet hierarchy order (bear ferals, then cat ferals
 * off-tanking, then the remaining tanks in roster order — mirroring
 * Feral 1 / Feral 2 / Prot), and healers are dealt round-robin so every
 * tank gets one healer before any tank gets a second.
 */
export function autoFillTankRows(data: PhaseAssignmentData): PhaseAssignmentData {
  // Skull = MT, Cross = OT (group hierarchy), Square = the pally
  // ("pally is 3rd"), then everyone else tank-flavored.
  const byId = new Map(data.members.map(m => [m.id, m]));
  const hier = tankHierarchy(data.members).map(id => byId.get(id)!);
  const seen = new Set(hier.map(m => m.id));
  const palas = data.members.filter(m => m.spec === "Protection Paladin" && !seen.has(m.id));
  const rest = data.members.filter(
    m => m.role === "tank" && !seen.has(m.id) && m.spec !== "Protection Paladin",
  );
  const tankPool = [...hier.slice(0, 2), ...palas, ...hier.slice(2), ...rest];
  const healers = data.members.filter(m => m.role === "heal");

  const rows = (data.tankAssignments ?? defaultTankAssignments()).map((row, i) => ({
    ...row,
    tankId: tankPool[i]?.id ?? null,
    healerIds: [] as number[],
  }));
  const occupied = rows.filter(r => r.tankId !== null);
  let h = 0;
  for (let round = 0; round < 2 && h < healers.length; round++) {
    for (const row of occupied) {
      if (h >= healers.length) break;
      row.healerIds.push(healers[h++].id);
    }
  }
  return { ...data, tankAssignments: rows };
}

/** Run auto-fill across every templated boss on the sheet. */
export function autoFillPhaseBossSheets(
  data: PhaseAssignmentData,
  opts: { onlyEmpty: boolean },
): PhaseAssignmentData {
  const bossSheets: PhaseAssignmentData["bossSheets"] = { ...data.bossSheets };
  for (const b of PHASE_BOSSES) {
    const tpls = PHASE_BOSS_TEMPLATES[b.slug];
    if (!tpls?.length) continue;
    bossSheets[b.slug] = autoFillBossSheet(data.members, tpls, bossSheets[b.slug] ?? { sections: [] }, opts);
  }
  return { ...data, bossSheets };
}

/** Picker eligibility for a templated slot. */
export function slotEligibility(rule: PhaseSlotRule): { specs?: string[]; classes?: string[] } | undefined {
  if (rule.specs?.length) return { specs: rule.specs };
  if (rule.classes?.length) return { classes: rule.classes };
  return undefined;
}

/** WoW class driving the empty-slot label tint. */
export function slotClass(rule: PhaseSlotRule): string | null {
  if (rule.specs?.length) return SPEC_BY_KEY[rule.specs[0]]?.class ?? null;
  if (rule.classes?.length) return rule.classes[0];
  return null;
}

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
    const tpls = PHASE_BOSS_TEMPLATES[b.slug] ?? [];
    if (entry && typeof entry === "object") {
      const e = entry as Record<string, unknown>;
      bossSheets[b.slug] = {
        sections: reconcileTplSections(tpls, sanitizeSections(e.sections)),
        ...(typeof e.notes === "string" && e.notes ? { notes: e.notes } : {}),
      };
    } else {
      bossSheets[b.slug] = { sections: reconcileTplSections(tpls, []) };
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
  // An import WIPES the night and rebuilds it from the paste alone —
  // no assignments, buff picks, or notes carry over. (Predictability
  // beats preservation: picks left over from the previous comp were
  // leaking into the new week.) Only memberIdSeq survives, keeping ids
  // monotonic so a departed raider's id is never recycled where a
  // viewer's highlight lock might still reference it.
  const base = Math.max(prev.memberIdSeq ?? 0, 0, ...prev.members.map(m => m.id));

  const idMap = new Map<number, number>(); // parsed id → final id
  const members: PhaseMember[] = parsed.members.map((m, i) => {
    const id = base + i + 1;
    idMap.set(m.id, id);
    return { ...m, id };
  });

  const remapGroup = (ids: number[]) => ids.map(id => idMap.get(id) ?? 0);
  const fresh = emptyPhaseData();

  // Fill every templated boss slot, the tank/healer rows, and the buff
  // blocks from the new comp — one paste sets the whole sheet.
  return recomputeAutoAssignments({
    ...fresh,
    members,
    groups: {
      "1": remapGroup(parsed.groups["1"]),
      "2": remapGroup(parsed.groups["2"]),
      "3": remapGroup(parsed.groups["3"]),
      "4": remapGroup(parsed.groups["4"]),
      "5": remapGroup(parsed.groups["5"]),
    },
    raidTitle: parsed.raidTitle,
    importedAt: new Date().toISOString(),
    memberIdSeq: base + members.length,
  });
}

/**
 * Re-derive everything auto-derivable from the current members: boss
 * template slots (overwrite), tank & healer rows (overwrite), and buff
 * blocks (fill empties / regenerate per-caster rows). Manual slots and
 * admin-set buff rows are untouched. Shared by imports and per-night
 * spec changes so assignments always follow the specs.
 */
export function recomputeAutoAssignments(data: PhaseAssignmentData): PhaseAssignmentData {
  const filled = autoFillTankRows(autoFillPhaseBossSheets(data, { onlyEmpty: false }));
  const eligibles = filled.members.map(memberToEligible);
  const buffs = fixSoulstoneTargets(
    fixGiftOfTheWild(
      fillTankBuffRows(suggestFillSections(filled.buffs, eligibles), filled.members),
      filled.members,
    ),
    filled.members,
  );
  return { ...filled, buffs };
}

/** Tanks · MT / OT / Adds buff rows from the group hierarchy: MT = the
 *  Group 2 tank, OT = Group 1, and the Adds/3rd tank is always the
 *  Prot Paladin (else whoever's next in the hierarchy). Only fills
 *  empty rows, like every buff suggestion. */
function fillTankBuffRows(buffs: AssignSection[], members: PhaseMember[]): AssignSection[] {
  const h = tankHierarchy(members);
  const pala = members.find(m => m.spec === "Protection Paladin")?.id ?? null;
  const pick: Record<string, number | null> = {
    MT: h[0] ?? null,
    OT: h[1] ?? null,
    Adds: pala ?? h[2] ?? null,
  };
  return buffs.map(s => {
    if (!s.title.startsWith("Tanks")) return s;
    if (s.characterIds.some(id => id > 0)) return s;
    const scope = s.title.split("\u00b7")[1]?.trim() ?? "";
    const id = pick[scope];
    return id != null ? { ...s, characterIds: [id] } : s;
  });
}

/** Gift of the Wild is a Boomie/Resto job — never ferals or tanks.
 *  One eligible druid covers both group rows; a boomie + resto pair
 *  splits them. */
function fixGiftOfTheWild(buffs: AssignSection[], members: PhaseMember[]): AssignSection[] {
  const druids = [
    ...members.filter(m => m.spec === "Balance Druid"),
    ...members.filter(m => m.spec === "Restoration Druid"),
  ];
  return buffs.map(s => {
    if (!s.title.startsWith("Gift of the Wild")) return s;
    const idx = s.title.includes("G4-5") ? 1 : 0;
    const chosen = druids[idx] ?? druids[0];
    return { ...s, characterIds: chosen ? [chosen.id] : [] };
  });
}

/** Soulstone rez-priority targets, in order across however many locks
 *  we have: the Disc priest first (Holy-signed priest counts), then
 *  the pally tank, then down the tank hierarchy (MT, OT, ...). */
function fixSoulstoneTargets(buffs: AssignSection[], members: PhaseMember[]): AssignSection[] {
  const priest = [
    ...members.filter(m => m.spec === "Discipline Priest"),
    ...members.filter(m => m.spec === "Holy Priest"),
  ][0]?.id ?? null;
  const pala = members.find(m => m.spec === "Protection Paladin")?.id ?? null;
  const targets = [priest, pala, ...tankHierarchy(members)]
    .filter((id, i, arr): id is number => id != null && arr.indexOf(id) === i);
  let t = 0;
  return buffs.map(s => {
    if (!s.title.startsWith("Soulstones")) return s;
    if (!s.characterIds[0]) return s; // no caster generated for this row
    const target = targets[t++] ?? 0;
    const characterIds = [...s.characterIds];
    characterIds[1] = characterIds[1] || target;
    return { ...s, characterIds };
  });
}

/**
 * Change members' specs for THIS night's sheet only (Raid-Helper's
 * Composition Tool exports whatever specs it last held, so a raider
 * who plays different specs on different nights needs a per-night
 * override). Class is fixed — only same-class specs apply — and every
 * auto-assignment recomputes from the new specs.
 */
export function applySpecChanges(
  data: PhaseAssignmentData,
  changes: Record<number, string>,
): PhaseAssignmentData {
  const members = data.members.map(m => {
    const spec = changes[m.id];
    if (!spec || spec === m.spec) return m;
    const def = SPEC_BY_KEY[spec];
    if (!def || def.class !== m.className) return m;
    return { ...m, spec, role: def.role };
  });
  return recomputeAutoAssignments({ ...data, members });
}

/** All member ids referenced anywhere on the sheet (for pickers that
 *  need "who's not yet in a group"-style exclusions). */
export function phaseRosterIds(data: PhaseAssignmentData): number[] {
  return data.members.map(m => m.id);
}

export { matchesEligibility };
