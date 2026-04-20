// Canonical WoW TBC spec list. Role tags used for the Overview page tabs.

export const ROLES = ["tank", "heal", "dps"] as const;
export type Role = (typeof ROLES)[number];

export interface SpecDef {
  key: string;          // canonical key used for ItemWeight.spec and Character.spec
  class: string;
  role: Role;
  armor: "cloth" | "leather" | "mail" | "plate";
}

export const SPECS: SpecDef[] = [
  // Warrior
  { key: "Arms Warrior",           class: "Warrior",  role: "dps",  armor: "plate" },
  { key: "Fury Warrior",           class: "Warrior",  role: "dps",  armor: "plate" },
  { key: "Protection Warrior",     class: "Warrior",  role: "tank", armor: "plate" },
  // Paladin
  { key: "Holy Paladin",           class: "Paladin",  role: "heal", armor: "plate" },
  { key: "Protection Paladin",     class: "Paladin",  role: "tank", armor: "plate" },
  { key: "Retribution Paladin",    class: "Paladin",  role: "dps",  armor: "plate" },
  // Hunter
  { key: "Beast Mastery Hunter",   class: "Hunter",   role: "dps",  armor: "mail" },
  { key: "Marksmanship Hunter",    class: "Hunter",   role: "dps",  armor: "mail" },
  { key: "Survival Hunter",        class: "Hunter",   role: "dps",  armor: "mail" },
  // Rogue
  { key: "Assassination Rogue",    class: "Rogue",    role: "dps",  armor: "leather" },
  { key: "Combat Rogue",           class: "Rogue",    role: "dps",  armor: "leather" },
  { key: "Subtlety Rogue",         class: "Rogue",    role: "dps",  armor: "leather" },
  // Priest
  { key: "Discipline Priest",      class: "Priest",   role: "heal", armor: "cloth" },
  { key: "Holy Priest",            class: "Priest",   role: "heal", armor: "cloth" },
  { key: "Shadow Priest",          class: "Priest",   role: "dps",  armor: "cloth" },
  // Shaman
  { key: "Elemental Shaman",       class: "Shaman",   role: "dps",  armor: "mail" },
  { key: "Enhancement Shaman",     class: "Shaman",   role: "dps",  armor: "mail" },
  { key: "Restoration Shaman",     class: "Shaman",   role: "heal", armor: "mail" },
  // Mage
  { key: "Arcane Mage",            class: "Mage",     role: "dps",  armor: "cloth" },
  { key: "Fire Mage",              class: "Mage",     role: "dps",  armor: "cloth" },
  { key: "Frost Mage",             class: "Mage",     role: "dps",  armor: "cloth" },
  // Warlock
  { key: "Affliction Warlock",     class: "Warlock",  role: "dps",  armor: "cloth" },
  { key: "Demonology Warlock",     class: "Warlock",  role: "dps",  armor: "cloth" },
  { key: "Destruction Warlock",    class: "Warlock",  role: "dps",  armor: "cloth" },
  // Druid
  { key: "Balance Druid",          class: "Druid",    role: "dps",  armor: "leather" },
  { key: "Feral Druid (DPS)",      class: "Druid",    role: "dps",  armor: "leather" },
  { key: "Feral Druid (Tank)",     class: "Druid",    role: "tank", armor: "leather" },
  { key: "Restoration Druid",      class: "Druid",    role: "heal", armor: "leather" },
];

export const CLASSES = Array.from(new Set(SPECS.map(s => s.class))).sort();
export const SPEC_KEYS = SPECS.map(s => s.key);
export const SPEC_BY_KEY: Record<string, SpecDef> = Object.fromEntries(SPECS.map(s => [s.key, s]));

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
