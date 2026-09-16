/**
 * "Classic Forever" — the Warcraft Forever racial rework.
 *
 * Sourced from the guild's racial write-up, which was itself verified
 * against Icy Veins' BlizzCon 2026 reporting. Two rules for anything
 * added here:
 *
 *  1. Every claim traces to that write-up. Where it doesn't cover
 *     something (Hunter, Priest, Dwarf's actual kit) the page SAYS so
 *     rather than filling the gap with a plausible guess.
 *  2. No source bookkeeping. The write-up cites where each fact came
 *     from because it was a revision pass; a guide just states the fact
 *     and puts the attribution in the footer.
 *
 * Note strings support `**bold**` and `*italic*`, rendered by <RichText>.
 */

export type Faction = "Alliance" | "Horde" | "Both";
export type TierKey = "S" | "A" | "B" | "C";

export type Race = {
  name: string;
  faction: Faction;
  /** Wowhead icon slug (race achievement portraits). */
  icon: string;
  /** Shown when the CDN portrait doesn't load. */
  abbr: string;
};

export const RACES: Record<string, Race> = {
  orc:      { name: "Orc",       faction: "Horde",    icon: "achievement_character_orc_male",      abbr: "OR" },
  troll:    { name: "Troll",     faction: "Horde",    icon: "achievement_character_troll_male",    abbr: "TR" },
  undead:   { name: "Undead",    faction: "Horde",    icon: "achievement_character_undead_male",   abbr: "UD" },
  tauren:   { name: "Tauren",    faction: "Horde",    icon: "achievement_character_tauren_male",   abbr: "TA" },
  human:    { name: "Human",     faction: "Alliance", icon: "achievement_character_human_male",    abbr: "HU" },
  nightelf: { name: "Night Elf", faction: "Alliance", icon: "achievement_character_nightelf_male", abbr: "NE" },
  gnome:    { name: "Gnome",     faction: "Alliance", icon: "achievement_character_gnome_male",    abbr: "GN" },
  dwarf:    { name: "Dwarf",     faction: "Alliance", icon: "achievement_character_dwarf_male",    abbr: "DW" },
  skyborne: { name: "Skyborne",  faction: "Both",     icon: "ability_hunter_pet_owl",              abbr: "SK" },
};

export const FACTION_COLOR: Record<Faction, string> = {
  Alliance: "#5b8dd9",
  Horde: "#c8402e",
  Both: "#9aa4b2",
};

/** Tier plate colours — gold / emerald / sky / slate, top to bottom. */
export const TIER_META: Record<TierKey, { color: string; label: string }> = {
  S: { color: "#ffd700", label: "S-Tier" },
  A: { color: "#34d399", label: "A-Tier" },
  B: { color: "#38bdf8", label: "B-Tier" },
  C: { color: "#9aa4b2", label: "C-Tier" },
};

/* ── Pick by class ───────────────────────────────────────────────────
   The question people actually arrive with. Every pick below is one the
   write-up names outright; a class it never covers gets `uncovered`
   instead of an invented recommendation. */

export type ClassRec = { race: string; label: string; why: string };

export type ClassPick = {
  className: string;
  /** Roles/specs the recommendation is actually about. */
  scope?: string;
  recs: ClassRec[];
  /** Set when the source doesn't cover this class at all. */
  uncovered?: string;
};

export const CLASS_PICKS: ClassPick[] = [
  {
    className: "Mage",
    recs: [
      {
        race: "orc",
        label: "PvE & PvP",
        why: "Blood Fury's spell-power half stacks straight onto the new Arcane Blast → Missile Barrage loop — the most explicit pairing named anywhere in the rework. Curse removal carries it into PvP as the answer to enemy Warlocks.",
      },
      {
        race: "gnome",
        label: "Alliance PvE",
        why: "Eureka!'s burst window timed with **Pyroblast** off the new Hot Streak talent.",
      },
    ],
  },
  {
    className: "Warlock",
    recs: [
      {
        race: "orc",
        label: "PvP",
        why: "Blood Fury's burst and Hardiness's stun reduction on top of the class's SL/SL identity (~38% damage reduction) — one of the strongest duelist packages in the game. Curse and bane removal answers enemy locks directly.",
      },
      {
        race: "undead",
        label: "PvP",
        why: "Will of the Forsaken clears fear, charm and sleep — the same counter from the opposite angle. Orc vs Undead is genuinely open here.",
      },
      {
        race: "troll",
        label: "PvE",
        why: "Berserking's damage, with SL/SL access making Troll Warlock a real Horde identity — though that half is survivability, not damage.",
      },
    ],
  },
  {
    className: "Druid",
    scope: "Feral / Balance",
    recs: [
      {
        race: "nightelf",
        label: "PvE & PvP",
        why: "Elune's Light runs 15 seconds and the new **Berserk** capstone runs 15 seconds. The windows line up exactly — that alignment is the entire case, and it matters more in a PvP kill window than over a long parse.",
      },
    ],
  },
  {
    className: "Rogue",
    recs: [
      {
        race: "nightelf",
        label: "PvE & PvP",
        why: "Elune's Light lines up with **Blade Flurry** and **Adrenaline Rush** the same way it does with Berserk.",
      },
    ],
  },
  {
    className: "Shaman",
    recs: [
      {
        race: "orc",
        label: "PvE & PvP",
        why: "Named the strongest overall pick for Shaman — Blood Fury splits into attack power and spell power, so it covers both halves of the class instead of half-wasting on a hybrid.",
      },
    ],
  },
  {
    className: "Warrior",
    scope: "Levelling & duelling — raid PvE isn't covered",
    recs: [
      {
        race: "undead",
        label: "Levelling",
        why: "The lifesteal racial is real sustain for **dual-wield levelling**.",
      },
      {
        race: "orc",
        label: "Duelling",
        why: "Orc and Human stay the picks for duelling.",
      },
    ],
  },
  {
    className: "Paladin",
    recs: [
      {
        race: "human",
        label: "PvP",
        why: "Stun removal answers **Hammer of Justice**, which is what wins the Human-vs-Undead Paladin mirror outright.",
      },
      {
        race: "undead",
        label: "Tanking",
        why: "Lifesteal self-sustain for **Protection** tanking.",
      },
    ],
  },
  {
    className: "Hunter",
    recs: [],
    uncovered: "No Hunter-specific racial synergy was surfaced. Fall back to the tier lists below.",
  },
  {
    className: "Priest",
    recs: [],
    uncovered: "No Priest-specific racial synergy was surfaced. Fall back to the tier lists below.",
  },
];

/* ── Racial ability reference ────────────────────────────────────────
   Only the abilities the write-up actually names, with only the detail
   it actually gives. `tag` marks anything it flagged as unconfirmed. */

export type Racial = { name: string; text: string; tag?: string };

export const RACIALS: Array<{ race: string; abilities: Racial[]; gap?: string }> = [
  {
    race: "orc",
    abilities: [
      {
        name: "Blood Fury",
        text: "The cleanest burst cooldown in the game. Splits into an attack-power half and a spell-power half, so it's elite on melee, on casters, and on hybrids that would normally waste half of a racial.",
      },
      { name: "Hardiness", text: "Stun duration reduction." },
      { name: "Curse / bane removal", text: "Strips curses and banes — the direct answer to enemy Warlocks." },
    ],
  },
  {
    race: "troll",
    abilities: [
      { name: "Berserking", text: "A 12-second burst window that matches Blood Fury's damage ceiling." },
    ],
  },
  {
    race: "undead",
    abilities: [
      { name: "Will of the Forsaken", text: "Removes fear, charm and sleep." },
      {
        name: "Lifesteal racial",
        text: "Self-sustain. Carries Warrior dual-wield levelling and Protection Paladin tanking; close to dead weight on a Mage, who is usually either topped off or one-shot.",
      },
    ],
  },
  {
    race: "tauren",
    abilities: [
      { name: "War Stomp", text: "Stuns all nearby targets, with no target cap stated — a better teamfight and battleground tool than a capped version, and useful on raid adds." },
    ],
  },
  {
    race: "human",
    abilities: [
      {
        name: "Stun removal",
        text: "The defining Alliance PvP racial. Answers Hammer of Justice and general stun-lock counterplay, and shows up as a hard answer in nearly every matchup.",
      },
      { name: "Perception", text: "Anti-stealth." },
      { name: "Sword crit", text: "+2% crit with swords — modest, and gated behind the weapon type." },
    ],
  },
  {
    race: "nightelf",
    abilities: [
      {
        name: "Elune's Light",
        text: "A 15-second window. Lines up exactly with Druid's Berserk capstone (also 15s) and with Rogue's Blade Flurry and Adrenaline Rush.",
      },
      {
        name: "Quickness",
        text: "2% dodge / 2% speed. An earlier pass had it at 1% / 2%; either way it doesn't move the grade.",
        tag: "Unconfirmed",
      },
    ],
  },
  {
    race: "gnome",
    abilities: [
      { name: "Eureka!", text: "A burst window — pairs with Mage Pyroblast off the new Hot Streak talent." },
      {
        name: "Escape Artist",
        text: "Breaks roots and snares that are already on you, then gives a 5-second immunity window. A cleanse *and* an escape, not just a block on the next one.",
      },
      { name: "Engineering Specialization", text: "A flat +10 profession skill. Crafting utility only — zero damage relevance." },
    ],
  },
  {
    race: "dwarf",
    abilities: [],
    gap: "The write-up doesn't detail Dwarf's kit — only that it's weak outside beast-heavy content, and close to irrelevant in PvP outside a Druid beast-form niche.",
  },
  {
    race: "skyborne",
    abilities: [
      {
        name: "Read Ley Line / Skysight",
        text: "Alliance Skyborne get Read Ley Line. Horde's Skysight isn't broken out separately in the source table, which may just be simplification rather than the two being identical.",
        tag: "Unconfirmed",
      },
    ],
  },
];

/* ── Tier lists ──────────────────────────────────────────────────────── */

export type TierEntry = {
  race: keyof typeof RACES | string;
  /** Overrides the race name in the card header (both Skyborne kits). */
  displayName?: string;
  note: string;
};

export type TierBlock = { tier: TierKey; entries: TierEntry[] };

export const PVE_TIERS: TierBlock[] = [
  {
    tier: "S",
    entries: [
      {
        race: "orc",
        note: "Blood Fury is the cleanest burst cooldown in the game and the only racial that's elite on melee AP, caster SP and hybrid specs alike. Best pairing is **Orc Mage**, where the spell-power half stacks directly onto the new Arcane Blast → Missile Barrage loop; Orc is also the strongest overall pick for Shaman.",
      },
      {
        race: "troll",
        note: "Berserking's 12-second window matches Orc's damage ceiling. **Troll Warlock** is emerging as a real Horde identity thanks to SL/SL access — though that's a survivability story riding alongside Berserking's damage, not a replacement for it.",
      },
    ],
  },
  {
    tier: "A",
    entries: [
      {
        race: "nightelf",
        note: "Elune's Light's 15-second window lines up exactly with Druid's new Berserk capstone (also 15s) and with Rogue's Blade Flurry / Adrenaline Rush. **Night Elf Druid** and **Night Elf Rogue** are strong PvE picks specifically because of that alignment, not coincidence.",
      },
      {
        race: "gnome",
        note: "Eureka! has one concrete combo worth building around: **Mage Pyroblast** off the new Hot Streak talent, timed into Eureka!'s burst window.",
      },
    ],
  },
  {
    tier: "B",
    entries: [
      {
        race: "human",
        note: "2% sword crit is modest and gated behind the weapon type, with no class-specific PvE angle.",
      },
      {
        race: "tauren",
        note: "War Stomp's PvE case is trash and add control, helped slightly by the uncapped target count.",
      },
      {
        race: "skyborne",
        displayName: "Alliance / Horde Skyborne",
        note: "No class-specific PvE synergy for either version.",
      },
    ],
  },
  {
    tier: "C",
    entries: [
      { race: "dwarf", note: "Weak outside beast-heavy content." },
      {
        race: "undead",
        note: "Weak on pure damage — but not weak, full stop. The lifesteal racial is genuinely valuable for **Warrior dual-wield levelling** and **Protection Paladin tanking**. That's a survivability case, so the damage grade doesn't move; don't read C-tier as “don't roll it.”",
      },
    ],
  },
];

export const PVP_TIERS: TierBlock[] = [
  {
    tier: "S",
    entries: [
      {
        race: "orc",
        note: "**Orc Warlock** stacks Blood Fury's burst and Hardiness's stun reduction on top of SL/SL's ~38% damage reduction — one of the strongest duelist packages in the game. Curse and bane removal is also the direct answer to enemy Warlocks.",
      },
      {
        race: "troll",
        note: "Berserking's burst value holds, with no PvP-specific wrinkle beyond the raw damage.",
      },
    ],
  },
  {
    tier: "A",
    entries: [
      {
        race: "human",
        note: "The strongest case of any Alliance race. Stun removal is *the* defining Alliance PvP racial — it wins the **Human-vs-Undead Paladin mirror** outright by answering Hammer of Justice — with Perception covering anti-stealth on top.",
      },
      {
        race: "undead",
        note: "Will of the Forsaken is one of the two things (with Orc's curse removal) that make **Horde Warlock** so strong in PvP. Whether Undead or Orc wins a straight Warlock mirror is genuinely open.",
      },
      {
        race: "nightelf",
        note: "Elune's Light lining up with Berserk, or with Blade Flurry / Adrenaline Rush, matters even more inside a kill window than it does over a long PvE parse.",
      },
      {
        race: "gnome",
        note: "Escape Artist breaks roots that are already on you, not just the next one, and adds a 5-second immunity window — a far better kiting counter than a plain immunity blip.",
      },
      {
        race: "tauren",
        note: "War Stomp's uncapped target count makes it a better teamfight and battleground tool.",
      },
    ],
  },
  {
    tier: "B",
    entries: [
      {
        race: "skyborne",
        displayName: "Alliance / Horde Skyborne",
        note: "No PvP-specific synergy for either version.",
      },
    ],
  },
  {
    tier: "C",
    entries: [
      { race: "dwarf", note: "Close to irrelevant outside the Druid beast-form niche." },
    ],
  },
];

/* ── Orc vs Undead ───────────────────────────────────────────────────── */

export const RIVALRY: Array<{ label: string; text: string }> = [
  {
    label: "Warlock",
    text: "Orc's curse and bane removal counters enemy locks directly; Undead's fear, charm and sleep removal does the same job from the opposite angle. This mirror is genuinely open — there's no clear winner.",
  },
  {
    label: "Mage",
    text: "Orc pulls ahead — curse removal plus Blood Fury's spell power. Undead's lifesteal matters far less on a class that's usually either topped off or one-shot.",
  },
  {
    label: "Warrior / Paladin",
    text: "Undead pulls ahead for tanking specifically, via lifesteal self-sustain. Orc and Human stay the picks for duelling.",
  },
];

/* ── The one-line answers ────────────────────────────────────────────── */

export const VERDICTS: Array<{ label: string; race: string; text: string }> = [
  {
    label: "Best pure PvE damage",
    race: "orc",
    text: "Orc, specifically **Orc Mage** — Blood Fury's spell power stacks directly onto Arcane's new burst loop.",
  },
  {
    label: "Best PvP",
    race: "orc",
    text: "Also Orc, but the class matters more here — **Orc Warlock** for sustained duelling via SL/SL, or Orc Mage / Shaman if you want Blood Fury's burst without giving up the curse-removal answer to enemy locks.",
  },
  {
    label: "Best on Alliance",
    race: "human",
    text: "**Human** is the matchup-proof PvP choice across nearly every class. **Night Elf** is the higher-ceiling PvE and burst-trade pick, especially on Druid or Rogue.",
  },
];
