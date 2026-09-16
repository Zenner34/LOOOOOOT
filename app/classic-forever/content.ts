/**
 * "Classic Forever" — the Warcraft Forever racial rework, graded for PvE
 * and PvP. Content is a straight transcription of the guild's racial
 * write-up (verified against Icy Veins' BlizzCon 2026 reporting), kept
 * here as data so the page stays layout-only.
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

export type TierEntry = {
  /** Key into RACES. */
  race: keyof typeof RACES | string;
  /** Overrides the race name in the card header (both Skyborne kits). */
  displayName?: string;
  note: string;
};

export type TierBlock = { tier: TierKey; entries: TierEntry[] };

/* ── What changed on re-check ───────────────────────────────────────── */

export type ChangeNote = { race: string; text: string; tag?: string };

export const CHANGE_NOTES: ChangeNote[] = [
  {
    race: "gnome",
    text: "**Gnome's Engineering Specialization is a flat +10 profession skill**, not gadget reliability. Pure crafting utility — it has zero damage relevance, correcting an aside from the original pass.",
  },
  {
    race: "gnome",
    text: "**Gnome's Escape Artist also breaks existing Roots/Snares**, not just future ones — it's an active cleanse *and* a 5-second immunity window, which is a better PvP escape tool than “brief immunity” alone suggested.",
  },
  {
    race: "nightelf",
    text: "**Night Elf's Quickness may be 2% dodge / 2% speed** per Icy Veins, versus the 1%/2% split in the original figures — worth treating as unconfirmed either way since it doesn't move the damage grade.",
    tag: "Unconfirmed",
  },
  {
    race: "tauren",
    text: "**Tauren's War Stomp stuns “all nearby targets”** with no stated cap in this source — a stronger group/PvP tool than a capped-target version would be.",
  },
  {
    race: "troll",
    text: "**Troll's Berserking runs 12 seconds** per Icy Veins, not 10 — still top-tier either way.",
  },
  {
    race: "skyborne",
    text: "Icy Veins' table only shows one Skyborne kit (Alliance's Read Ley Line version) — it doesn't list Horde Skyborne's Skysight separately, which may just be simplification on their end rather than a real discrepancy.",
    tag: "Unconfirmed",
  },
];

/* ── PvE ─────────────────────────────────────────────────────────────── */

export const PVE_TIERS: TierBlock[] = [
  {
    tier: "S",
    entries: [
      {
        race: "orc",
        note: "Blood Fury remains the cleanest burst cooldown in the game, and it's now got a named best pairing: **Orc Mage**, where Blood Fury's spell-power half stacks directly onto the new Arcane Blast → Missile Barrage burst loop. The Reddit breakdown separately calls Orc “strongest overall” for Shaman too — this is the one racial that's elite on melee AP, caster SP, and hybrid specs alike.",
      },
      {
        race: "troll",
        note: "Berserking still matches Orc's damage ceiling. New context: Troll Warlock is emerging as a real Horde identity thanks to SL/SL access, though that's a survivability story riding alongside Berserking's damage, not a replacement for it.",
      },
    ],
  },
  {
    tier: "A",
    entries: [
      {
        race: "nightelf",
        note: "Elune's Light's case got stronger, not just confirmed: its 15-second window lines up exactly with Druid's new Berserk capstone (also 15s) and with Rogue's Blade Flurry/Adrenaline Rush burst windows per the Reddit analysis. Night Elf Druid and Night Elf Rogue both read as genuinely strong PvE picks specifically because of that alignment, not coincidence.",
      },
      {
        race: "gnome",
        note: "Eureka! now has a concrete combo: Mage Pyroblast (via the new Hot Streak talent) timed with Eureka!'s burst window, called out directly in the Reddit breakdown.",
      },
    ],
  },
  {
    tier: "B",
    entries: [
      {
        race: "human",
        note: "Unchanged — 2% sword crit is still a modest, weapon-gated bonus with no new class-specific PvE angle surfaced.",
      },
      {
        race: "tauren",
        note: "War Stomp's PvE case (trash/add control) gets marginally stronger with the uncapped-target confirmation.",
      },
      {
        race: "skyborne",
        displayName: "Alliance / Horde Skyborne",
        note: "Unchanged — no class-specific PvE synergy surfaced for either version.",
      },
    ],
  },
  {
    tier: "C",
    entries: [
      {
        race: "dwarf",
        note: "Unchanged — still weak outside beast-heavy content, nothing new surfaced.",
      },
      {
        race: "undead",
        note: "Still weak on pure damage, but worth a real caveat: the Reddit breakdown specifically flags Undead's lifesteal racial as valuable for **Warrior dual-wield leveling sustain** and (via the trailer discussion) **Undead Protection Paladin tanking**. That's a survivability case, not a damage case, so the tier doesn't move — but “weak for damage” isn't the same as “weak, full stop” for this race.",
      },
    ],
  },
];

/* ── PvP ─────────────────────────────────────────────────────────────── */

export const PVP_TIERS: TierBlock[] = [
  {
    tier: "S",
    entries: [
      {
        race: "orc",
        note: "Still the top PvP pick, now for a sharper reason: **Orc Warlock** stacks Blood Fury's burst and Hardiness's stun reduction on top of the class's new SL/SL identity (~38% damage reduction), reading as one of the strongest duelist packages in the game per the Reddit breakdown. Orc's curse/bane removal is also called out as a direct answer to enemy Warlocks specifically.",
      },
      {
        race: "troll",
        note: "Berserking's burst value holds; no major new PvP-specific wrinkle beyond what was already covered.",
      },
    ],
  },
  {
    tier: "A",
    entries: [
      {
        race: "nightelf",
        note: "Same alignment logic as PvE, but for burst trades: Elune's Light lining up with Berserk or Blade Flurry/Adrenaline Rush matters even more in a PvP kill window than over a long PvE parse.",
      },
      {
        race: "gnome",
        note: "Reinforced: Escape Artist now confirmed to break existing roots too, not just block new ones — a meaningfully better kiting-counter than assumed.",
      },
      {
        race: "human",
        note: "Gets the strongest reinforcement of any race here. Both class breakdowns keep landing on Human's stun removal as *the* defining Alliance PvP racial — it's named directly as giving Human Paladins the edge over Undead Paladins in a mirror matchup (it answers Hammer of Justice), on top of Perception's existing anti-stealth value.",
      },
      {
        race: "undead",
        note: "Same story from the other side: Will of the Forsaken is named as one of the two things (alongside Orc's curse removal) that make Horde Warlock such a strong PvP class, and the poster explicitly isn't sure whether Undead or Orc wins a straight Warlock mirror.",
      },
      {
        race: "tauren",
        note: "War Stomp's uncapped target count makes it a slightly better teamfight/battleground tool than a capped version would be.",
      },
    ],
  },
  {
    tier: "B",
    entries: [
      {
        race: "skyborne",
        displayName: "Alliance / Horde Skyborne",
        note: "Unchanged — no PvP-specific synergy surfaced in either class source.",
      },
    ],
  },
  {
    tier: "C",
    entries: [
      {
        race: "dwarf",
        note: "Unchanged — still close to irrelevant in PvP outside the Druid-beast-form niche.",
      },
    ],
  },
];

/* ── Orc vs Undead ───────────────────────────────────────────────────── */

export const RIVALRY: Array<{ label: string; text: string }> = [
  {
    label: "Warlock",
    text: "Orc's curse/bane removal counters enemy locks directly; Undead's fear/charm/sleep removal does the same from the opposite angle. The source material itself isn't sure which wins a straight Orc-vs-Undead Warlock mirror.",
  },
  {
    label: "Mage",
    text: "Orc pulls ahead here — curse removal plus Blood Fury's spell power. Undead reads as comparatively weaker since the lifesteal racial matters less on a class that's often already topped off or one-shot.",
  },
  {
    label: "Warrior / Paladin",
    text: "Undead pulls ahead for tanking specifically, via self-sustain from the lifesteal racial, while Orc and Human stay the picks for dueling.",
  },
];

/* ── The one-line answers ────────────────────────────────────────────── */

export const VERDICTS: Array<{ label: string; race: string; text: string }> = [
  {
    label: "Best pure PvE damage",
    race: "orc",
    text: "Orc, specifically **Orc Mage** — Blood Fury's spell power stacks directly onto Arcane's new burst loop, the most explicit single pairing named in either source.",
  },
  {
    label: "Best PvP",
    race: "orc",
    text: "Also Orc, but the class matters more here — **Orc Warlock** for sustained dueling via SL/SL, or Orc Mage/Shaman if you want Blood Fury's burst without giving up the curse-removal answer to enemy locks.",
  },
  {
    label: "Best pick on Alliance",
    race: "human",
    text: "Human is the safe, matchup-proof PvP choice across nearly every class; Night Elf is the higher-ceiling PvE/burst-trade pick, especially on Druid or Rogue specifically.",
  },
];
