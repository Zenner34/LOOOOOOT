// Maps item archetypes -> per-spec weights (0.0 - 1.0).
// 1.0 = BiS/near-BiS, 0.75 = strong, 0.5 = sidegrade, 0.25 = situational.
// Specs not listed for an archetype get 0 (not useful).
//
// This is intentionally pragmatic rather than parse-perfect. The goal is to
// give loot council a sensible "this drop benefits these specs" ranking so
// the Overview page's weighted score is meaningful out of the box.
// Weights can be edited per-item via the admin UI.

import type { SpecDef } from "./specs";
import { SPECS } from "./specs";

export type Archetype =
  // armor - tank
  | "tank-plate"
  | "tank-bear"
  // armor - melee dps
  | "melee-plate"
  | "melee-leather"
  | "melee-mail"
  // armor - physical ranged
  | "ranged-hunter"
  // armor - caster dps
  | "caster-cloth"
  | "caster-leather"
  | "caster-mail"
  // armor - healer
  | "heal-cloth"
  | "heal-leather"
  | "heal-mail"
  | "heal-plate"
  // hybrid / everyone plate
  | "plate-any"
  // weapons
  | "weapon-2h-melee"
  | "weapon-2h-str"
  | "weapon-2h-agi"
  | "weapon-1h-melee"
  | "weapon-1h-tank"
  | "weapon-dagger-dps"
  | "weapon-dagger-caster"
  | "weapon-bow"
  | "weapon-gun"
  | "weapon-crossbow"
  | "weapon-thrown"
  | "weapon-polearm"
  | "weapon-staff-caster"
  | "weapon-staff-heal"
  | "weapon-staff-feral"
  | "weapon-wand"
  | "weapon-shield-tank"
  | "weapon-shield-heal"
  | "weapon-offhand-caster"
  | "weapon-offhand-heal"
  | "weapon-mace-heal"
  | "weapon-1h-caster"
  | "weapon-fist-melee"
  | "weapon-glaive"
  // trinkets / rings / necks / cloaks
  | "trinket-tank"
  | "trinket-melee"
  | "trinket-caster"
  | "trinket-heal"
  | "trinket-hunter"
  | "jewel-tank"
  | "jewel-melee"
  | "jewel-caster"
  | "jewel-heal"
  | "jewel-hunter"
  | "cloak-melee"
  | "cloak-tank"
  | "cloak-caster"
  | "cloak-heal"
  | "cloak-hunter"
  // Tier tokens — 3 class groupings
  | "token-conqueror"  // Paladin, Priest, Warlock
  | "token-protector"  // Warrior, Hunter, Shaman
  | "token-vanquisher"; // Mage, Rogue, Druid

const TOKEN_CLASSES: Record<"conqueror" | "protector" | "vanquisher", string[]> = {
  conqueror:  ["Paladin", "Priest", "Warlock"],
  protector:  ["Warrior", "Hunter", "Shaman"],
  vanquisher: ["Mage", "Rogue", "Druid"],
};

const specsFor = (pred: (s: SpecDef) => boolean) => SPECS.filter(pred);

// Build a weight map helper
function wmap(entries: Array<[string | SpecDef, number]>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of entries) {
    const key = typeof k === "string" ? k : k.key;
    out[key] = Math.max(out[key] ?? 0, v);
  }
  return out;
}

export function archetypeWeights(arch: Archetype): Record<string, number> {
  switch (arch) {
    // ---------------- armor: tanks ----------------
    case "tank-plate":
      return wmap([
        ["Protection Warrior", 1.0],
        ["Protection Paladin", 0.9],
        ["Feral Druid (Tank)", 0.3],
      ]);
    case "tank-bear":
      return wmap([["Feral Druid (Tank)", 1.0]]);

    // ---------------- armor: melee dps ----------------
    case "melee-plate":
      return wmap([
        ["Arms Warrior", 1.0],
        ["Fury Warrior", 1.0],
        ["Retribution Paladin", 0.9],
      ]);
    case "melee-leather":
      return wmap([
        ["Assassination Rogue", 1.0],
        ["Combat Rogue", 1.0],
        ["Subtlety Rogue", 1.0],
        ["Feral Druid (DPS)", 1.0],
        ["Enhancement Shaman", 0.25], // can roll for leather off-pieces rarely
      ]);
    case "melee-mail":
      return wmap([
        ["Enhancement Shaman", 1.0],
        ["Beast Mastery Hunter", 0.5],
        ["Marksmanship Hunter", 0.5],
        ["Survival Hunter", 0.5],
      ]);

    // ---------------- physical ranged (hunter) ----------------
    case "ranged-hunter":
      return wmap([
        ["Beast Mastery Hunter", 1.0],
        ["Marksmanship Hunter", 1.0],
        ["Survival Hunter", 1.0],
      ]);

    // ---------------- caster dps ----------------
    case "caster-cloth":
      return wmap([
        ["Arcane Mage", 1.0],
        ["Fire Mage", 1.0],
        ["Frost Mage", 1.0],
        ["Affliction Warlock", 1.0],
        ["Demonology Warlock", 1.0],
        ["Destruction Warlock", 1.0],
        ["Shadow Priest", 1.0],
      ]);
    case "caster-leather":
      return wmap([["Balance Druid", 1.0]]);
    case "caster-mail":
      return wmap([["Elemental Shaman", 1.0]]);

    // ---------------- healers ----------------
    case "heal-cloth":
      return wmap([
        ["Holy Priest", 1.0],
        ["Discipline Priest", 1.0],
        ["Holy Paladin", 0.6],
        ["Restoration Shaman", 0.6],
        ["Restoration Druid", 0.6],
      ]);
    case "heal-leather":
      return wmap([["Restoration Druid", 1.0]]);
    case "heal-mail":
      return wmap([["Restoration Shaman", 1.0]]);
    case "heal-plate":
      return wmap([["Holy Paladin", 1.0]]);

    case "plate-any":
      return wmap(specsFor(s => s.armor === "plate").map(s => [s, 0.5]));

    // ---------------- weapons ----------------
    case "weapon-2h-melee":
      return wmap([
        ["Arms Warrior", 1.0],
        ["Fury Warrior", 0.8],
        ["Retribution Paladin", 0.9],
      ]);
    case "weapon-2h-str":
      return wmap([
        ["Arms Warrior", 1.0],
        ["Retribution Paladin", 1.0],
        ["Fury Warrior", 0.5],
      ]);
    case "weapon-2h-agi":
      return wmap([
        ["Feral Druid (DPS)", 1.0],
        ["Feral Druid (Tank)", 0.75],
      ]);
    case "weapon-1h-melee":
      return wmap([
        ["Fury Warrior", 1.0],
        ["Combat Rogue", 0.75],
        ["Enhancement Shaman", 0.75],
      ]);
    case "weapon-1h-tank":
      return wmap([
        ["Protection Warrior", 1.0],
        ["Protection Paladin", 0.9],
      ]);
    case "weapon-dagger-dps":
      return wmap([
        ["Assassination Rogue", 1.0],
        ["Combat Rogue", 0.75],
        ["Subtlety Rogue", 1.0],
      ]);
    case "weapon-dagger-caster":
      return wmap([
        ["Arcane Mage", 0.75],
        ["Fire Mage", 0.75],
        ["Frost Mage", 0.75],
        ["Affliction Warlock", 0.75],
        ["Demonology Warlock", 0.75],
        ["Destruction Warlock", 0.75],
        ["Shadow Priest", 0.75],
        ["Holy Priest", 0.75],
        ["Discipline Priest", 0.75],
      ]);
    case "weapon-bow":
    case "weapon-gun":
    case "weapon-crossbow":
      return wmap([
        ["Beast Mastery Hunter", 1.0],
        ["Marksmanship Hunter", 1.0],
        ["Survival Hunter", 1.0],
      ]);
    case "weapon-thrown":
      return wmap([
        ["Assassination Rogue", 0.5],
        ["Combat Rogue", 0.5],
        ["Subtlety Rogue", 0.5],
        ["Fury Warrior", 0.3],
      ]);
    case "weapon-polearm":
      return wmap([
        ["Feral Druid (DPS)", 1.0],
        ["Feral Druid (Tank)", 0.75],
        ["Beast Mastery Hunter", 0.5],
        ["Marksmanship Hunter", 0.5],
        ["Survival Hunter", 0.5],
        ["Arms Warrior", 0.6],
      ]);
    case "weapon-staff-caster":
      return wmap([
        ["Arcane Mage", 1.0],
        ["Fire Mage", 1.0],
        ["Frost Mage", 1.0],
        ["Affliction Warlock", 1.0],
        ["Demonology Warlock", 1.0],
        ["Destruction Warlock", 1.0],
        ["Shadow Priest", 1.0],
        ["Balance Druid", 1.0],
        ["Elemental Shaman", 1.0],
      ]);
    case "weapon-staff-heal":
      return wmap([
        ["Holy Priest", 1.0],
        ["Discipline Priest", 1.0],
        ["Restoration Shaman", 1.0],
        ["Restoration Druid", 1.0],
      ]);
    case "weapon-staff-feral":
      return wmap([
        ["Feral Druid (DPS)", 1.0],
        ["Feral Druid (Tank)", 1.0],
      ]);
    case "weapon-wand":
      return wmap([
        ["Arcane Mage", 0.5],
        ["Fire Mage", 0.5],
        ["Frost Mage", 0.5],
        ["Affliction Warlock", 0.5],
        ["Demonology Warlock", 0.5],
        ["Destruction Warlock", 0.5],
        ["Shadow Priest", 0.5],
        ["Holy Priest", 0.5],
        ["Discipline Priest", 0.5],
      ]);
    case "weapon-shield-tank":
      return wmap([
        ["Protection Warrior", 1.0],
        ["Protection Paladin", 1.0],
      ]);
    case "weapon-shield-heal":
      return wmap([
        ["Holy Paladin", 1.0],
        ["Restoration Shaman", 1.0],
        ["Holy Priest", 0.75],
        ["Discipline Priest", 0.75],
      ]);
    case "weapon-offhand-caster":
      return wmap([
        ["Arcane Mage", 1.0],
        ["Fire Mage", 1.0],
        ["Frost Mage", 1.0],
        ["Affliction Warlock", 1.0],
        ["Demonology Warlock", 1.0],
        ["Destruction Warlock", 1.0],
        ["Shadow Priest", 1.0],
        ["Balance Druid", 1.0],
        ["Elemental Shaman", 1.0],
      ]);
    case "weapon-offhand-heal":
      return wmap([
        ["Holy Priest", 1.0],
        ["Discipline Priest", 1.0],
        ["Holy Paladin", 1.0],
        ["Restoration Shaman", 1.0],
        ["Restoration Druid", 1.0],
      ]);
    case "weapon-mace-heal":
      return wmap([
        ["Holy Priest", 1.0],
        ["Discipline Priest", 1.0],
        ["Holy Paladin", 1.0],
        ["Restoration Shaman", 1.0],
        ["Restoration Druid", 0.5],
      ]);
    case "weapon-1h-caster":
      return wmap([
        ["Arcane Mage", 1.0],
        ["Fire Mage", 1.0],
        ["Frost Mage", 1.0],
        ["Affliction Warlock", 1.0],
        ["Demonology Warlock", 1.0],
        ["Destruction Warlock", 1.0],
        ["Shadow Priest", 1.0],
        ["Elemental Shaman", 1.0],
      ]);
    case "weapon-fist-melee":
      return wmap([
        ["Fury Warrior", 1.0],
        ["Combat Rogue", 1.0],
        ["Enhancement Shaman", 1.0],
      ]);
    case "weapon-glaive":
      return wmap([
        ["Fury Warrior", 1.0],
        ["Combat Rogue", 1.0],
        ["Assassination Rogue", 1.0],
        ["Subtlety Rogue", 1.0],
        ["Enhancement Shaman", 1.0],
      ]);

    // ---------------- trinkets / jewelry / cloaks ----------------
    case "trinket-tank":
      return wmap([
        ["Protection Warrior", 1.0],
        ["Protection Paladin", 1.0],
        ["Feral Druid (Tank)", 0.9],
      ]);
    case "trinket-melee":
      return wmap([
        ["Arms Warrior", 1.0],
        ["Fury Warrior", 1.0],
        ["Retribution Paladin", 1.0],
        ["Assassination Rogue", 1.0],
        ["Combat Rogue", 1.0],
        ["Subtlety Rogue", 1.0],
        ["Enhancement Shaman", 1.0],
        ["Feral Druid (DPS)", 1.0],
      ]);
    case "trinket-caster":
      return wmap([
        ["Arcane Mage", 1.0],
        ["Fire Mage", 1.0],
        ["Frost Mage", 1.0],
        ["Affliction Warlock", 1.0],
        ["Demonology Warlock", 1.0],
        ["Destruction Warlock", 1.0],
        ["Shadow Priest", 1.0],
        ["Balance Druid", 1.0],
        ["Elemental Shaman", 1.0],
      ]);
    case "trinket-heal":
      return wmap([
        ["Holy Priest", 1.0],
        ["Discipline Priest", 1.0],
        ["Holy Paladin", 1.0],
        ["Restoration Shaman", 1.0],
        ["Restoration Druid", 1.0],
      ]);
    case "trinket-hunter":
      return wmap([
        ["Beast Mastery Hunter", 1.0],
        ["Marksmanship Hunter", 1.0],
        ["Survival Hunter", 1.0],
      ]);
    case "jewel-tank":
      return archetypeWeights("trinket-tank");
    case "jewel-melee":
      return archetypeWeights("trinket-melee");
    case "jewel-caster":
      return archetypeWeights("trinket-caster");
    case "jewel-heal":
      return archetypeWeights("trinket-heal");
    case "jewel-hunter":
      return archetypeWeights("trinket-hunter");
    case "cloak-melee":
      return archetypeWeights("trinket-melee");
    case "cloak-tank":
      return archetypeWeights("trinket-tank");
    case "cloak-caster":
      return archetypeWeights("trinket-caster");
    case "cloak-heal":
      return archetypeWeights("trinket-heal");
    case "cloak-hunter":
      return archetypeWeights("trinket-hunter");

    // ---------------- tier tokens ----------------
    case "token-conqueror":
      return wmap(specsFor(s => TOKEN_CLASSES.conqueror.includes(s.class)).map(s => [s, 1.0]));
    case "token-protector":
      return wmap(specsFor(s => TOKEN_CLASSES.protector.includes(s.class)).map(s => [s, 1.0]));
    case "token-vanquisher":
      return wmap(specsFor(s => TOKEN_CLASSES.vanquisher.includes(s.class)).map(s => [s, 1.0]));
  }
}

// Merge archetype weights with explicit per-spec overrides.
export function mergeWeights(
  arch: Archetype | undefined,
  overrides?: Record<string, number>,
): Record<string, number> {
  const base = arch ? archetypeWeights(arch) : {};
  if (!overrides) return base;
  return { ...base, ...overrides };
}
