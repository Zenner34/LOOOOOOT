// Canonical WoW TBC spec list. Role + damageType drive the Overview filter buckets.

export const ROLES = ["tank", "heal", "dps"] as const;
export type Role = (typeof ROLES)[number];

// Buckets surfaced as Overview tabs. Hunters bucket as 'melee' (mail-DPS pool
// shared with enhancement shaman) per design call — see plan §Phase 2.
export const BUCKETS = ["all", "tank", "heal", "melee", "caster"] as const;
export type Bucket = (typeof BUCKETS)[number];

export const BUCKET_LABEL: Record<Bucket, string> = {
  all:    "All",
  tank:   "Tanks",
  heal:   "Healers",
  melee:  "Melee",
  caster: "Casters",
};

export interface SpecDef {
  key: string;          // canonical key used for ItemWeight.spec and Character.spec
  class: string;
  role: Role;
  armor: "cloth" | "leather" | "mail" | "plate";
  damageType?: "melee" | "caster";  // only meaningful for DPS specs
}

export const SPECS: SpecDef[] = [
  // Warrior
  { key: "Arms Warrior",           class: "Warrior",  role: "dps",  armor: "plate",   damageType: "melee" },
  { key: "Fury Warrior",           class: "Warrior",  role: "dps",  armor: "plate",   damageType: "melee" },
  { key: "Protection Warrior",     class: "Warrior",  role: "tank", armor: "plate" },
  // Paladin
  { key: "Holy Paladin",           class: "Paladin",  role: "heal", armor: "plate" },
  { key: "Protection Paladin",     class: "Paladin",  role: "tank", armor: "plate" },
  { key: "Retribution Paladin",    class: "Paladin",  role: "dps",  armor: "plate",   damageType: "melee" },
  // Hunter (mail DPS, ranged-physical — bucketed with melee for loot purposes)
  { key: "Beast Mastery Hunter",   class: "Hunter",   role: "dps",  armor: "mail",    damageType: "melee" },
  { key: "Marksmanship Hunter",    class: "Hunter",   role: "dps",  armor: "mail",    damageType: "melee" },
  { key: "Survival Hunter",        class: "Hunter",   role: "dps",  armor: "mail",    damageType: "melee" },
  // Rogue
  { key: "Assassination Rogue",    class: "Rogue",    role: "dps",  armor: "leather", damageType: "melee" },
  { key: "Combat Rogue",           class: "Rogue",    role: "dps",  armor: "leather", damageType: "melee" },
  { key: "Subtlety Rogue",         class: "Rogue",    role: "dps",  armor: "leather", damageType: "melee" },
  // Priest
  { key: "Discipline Priest",      class: "Priest",   role: "heal", armor: "cloth" },
  { key: "Holy Priest",            class: "Priest",   role: "heal", armor: "cloth" },
  { key: "Shadow Priest",          class: "Priest",   role: "dps",  armor: "cloth",   damageType: "caster" },
  // Shaman
  { key: "Elemental Shaman",       class: "Shaman",   role: "dps",  armor: "mail",    damageType: "caster" },
  { key: "Enhancement Shaman",     class: "Shaman",   role: "dps",  armor: "mail",    damageType: "melee" },
  { key: "Restoration Shaman",     class: "Shaman",   role: "heal", armor: "mail" },
  // Mage
  { key: "Arcane Mage",            class: "Mage",     role: "dps",  armor: "cloth",   damageType: "caster" },
  { key: "Fire Mage",              class: "Mage",     role: "dps",  armor: "cloth",   damageType: "caster" },
  { key: "Frost Mage",             class: "Mage",     role: "dps",  armor: "cloth",   damageType: "caster" },
  // Warlock
  { key: "Affliction Warlock",     class: "Warlock",  role: "dps",  armor: "cloth",   damageType: "caster" },
  { key: "Demonology Warlock",     class: "Warlock",  role: "dps",  armor: "cloth",   damageType: "caster" },
  { key: "Destruction Warlock",    class: "Warlock",  role: "dps",  armor: "cloth",   damageType: "caster" },
  // Druid
  { key: "Balance Druid",          class: "Druid",    role: "dps",  armor: "leather", damageType: "caster" },
  { key: "Feral Druid (DPS)",      class: "Druid",    role: "dps",  armor: "leather", damageType: "melee" },
  { key: "Feral Druid (Tank)",     class: "Druid",    role: "tank", armor: "leather" },
  { key: "Restoration Druid",      class: "Druid",    role: "heal", armor: "leather" },
];

export const CLASSES = Array.from(new Set(SPECS.map(s => s.class))).sort();
export const SPEC_KEYS = SPECS.map(s => s.key);
export const SPEC_BY_KEY: Record<string, SpecDef> = Object.fromEntries(SPECS.map(s => [s.key, s]));

// Map a spec to a single overview filter bucket (all/tank/heal/melee/caster).
export function bucketForSpec(specKey: string): Exclude<Bucket, "all"> | null {
  const s = SPEC_BY_KEY[specKey];
  if (!s) return null;
  if (s.role === "tank") return "tank";
  if (s.role === "heal") return "heal";
  return s.damageType ?? "melee";
}

// Canonical talent-tree icons per spec (Wowhead/Blizzard icon names).
// Served from https://wow.zamimg.com/images/wow/icons/medium/<name>.jpg
export const SPEC_ICON: Record<string, string> = {
  // Warrior
  "Arms Warrior":           "ability_warrior_savageblow",
  "Fury Warrior":           "ability_warrior_innerrage",
  "Protection Warrior":     "ability_warrior_defensivestance",
  // Paladin
  "Holy Paladin":           "spell_holy_holybolt",
  "Protection Paladin":     "spell_holy_devotionaura",
  "Retribution Paladin":    "spell_holy_auraoflight",
  // Hunter
  "Beast Mastery Hunter":   "ability_hunter_beasttaming",
  "Marksmanship Hunter":    "ability_marksmanship",
  "Survival Hunter":        "ability_hunter_swiftstrike",
  // Rogue
  "Assassination Rogue":    "ability_rogue_eviscerate",
  "Combat Rogue":           "ability_backstab",
  "Subtlety Rogue":         "ability_stealth",
  // Priest
  "Discipline Priest":      "spell_holy_wordfortitude",
  "Holy Priest":            "spell_holy_guardianspirit",
  "Shadow Priest":          "spell_shadow_shadowwordpain",
  // Shaman
  "Elemental Shaman":       "spell_nature_lightning",
  "Enhancement Shaman":     "spell_nature_lightningshield",
  "Restoration Shaman":     "spell_nature_magicimmunity",
  // Mage
  "Arcane Mage":            "spell_holy_magicalsentry",
  "Fire Mage":              "spell_fire_firebolt02",
  "Frost Mage":             "spell_frost_frostbolt02",
  // Warlock
  "Affliction Warlock":     "spell_shadow_deathcoil",
  "Demonology Warlock":     "spell_shadow_metamorphosis",
  "Destruction Warlock":    "spell_shadow_rainoffire",
  // Druid
  "Balance Druid":          "spell_nature_starfall",
  "Feral Druid (DPS)":      "ability_racial_bearform",
  "Feral Druid (Tank)":     "ability_racial_bearform",
  "Restoration Druid":      "spell_nature_healingtouch",
};

// TBC class color palette (approximate WoW client colors).
export const CLASS_COLOR: Record<string, string> = {
  Warrior:  "#C79C6E",
  Paladin:  "#F58CBA",
  Hunter:   "#ABD473",
  Rogue:    "#FFF569",
  Priest:   "#FFFFFF",
  Shaman:   "#0070DE",
  Mage:     "#40C7EB",
  Warlock:  "#8787ED",
  Druid:    "#FF7D0A",
};
