// WoW TBC raid loot catalog.
// Hand-authored from canonical boss loot tables. wowheadId is included when
// confidently known; nulls can be filled in via the admin UI. Archetype tags
// expand into per-spec weights at seed time via lib/archetypes.ts.
//
// This is a curated catalog — headline loot per boss (tier tokens, weapons,
// trinkets, signature pieces) rather than every trash BoE. ~6-10 items per
// boss keeps the list useful for loot council without noise. Add to it
// freely; the seeder upserts by (raidShortName, bossName, item name).

import type { Archetype } from "./archetypes";

export interface ItemDef {
  name: string;
  wowheadId?: number | null;
  slot: string;
  itemLevel?: number;
  archetype?: Archetype;
  weights?: Record<string, number>; // per-spec overrides merged on top of archetype
  notes?: string;
}

export interface BossDef {
  name: string;
  items: ItemDef[];
}

export interface RaidDef {
  name: string;
  shortName: string;
  bosses: BossDef[];
}

export interface PhaseDef {
  name: string;
  raids: RaidDef[];
}

// Tier token shorthand helpers.
const t4Shoulder = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Shoulders)", itemLevel: 120, archetype: `token-${group}` as Archetype,
});
const t4Chest = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Chest)", itemLevel: 120, archetype: `token-${group}` as Archetype,
});
const t4Helm = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Head)", itemLevel: 120, archetype: `token-${group}` as Archetype,
});
const t4Gloves = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Hands)", itemLevel: 120, archetype: `token-${group}` as Archetype,
});
const t4Legs = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Legs)", itemLevel: 120, archetype: `token-${group}` as Archetype,
});
const t5Shoulder = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Shoulders)", itemLevel: 133, archetype: `token-${group}` as Archetype,
});
const t5Chest = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Chest)", itemLevel: 133, archetype: `token-${group}` as Archetype,
});
const t5Helm = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Head)", itemLevel: 133, archetype: `token-${group}` as Archetype,
});
const t5Gloves = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Hands)", itemLevel: 133, archetype: `token-${group}` as Archetype,
});
const t5Legs = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Legs)", itemLevel: 133, archetype: `token-${group}` as Archetype,
});
const t6Shoulder = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Shoulders)", itemLevel: 146, archetype: `token-${group}` as Archetype,
});
const t6Chest = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Chest)", itemLevel: 146, archetype: `token-${group}` as Archetype,
});
const t6Helm = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Head)", itemLevel: 146, archetype: `token-${group}` as Archetype,
});
const t6Gloves = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Hands)", itemLevel: 146, archetype: `token-${group}` as Archetype,
});
const t6Legs = (name: string, group: "conqueror" | "protector" | "vanquisher", wh?: number): ItemDef => ({
  name, wowheadId: wh ?? null, slot: "Token (Legs)", itemLevel: 146, archetype: `token-${group}` as Archetype,
});

// -------------------------------------------------------------------------
// PHASE 1
// -------------------------------------------------------------------------

const karazhan: RaidDef = {
  name: "Karazhan",
  shortName: "KARA",
  bosses: [
    { name: "Attumen the Huntsman", items: [
      { name: "Worgen Claw Necklace", wowheadId: 28509, slot: "Neck", itemLevel: 115, archetype: "jewel-melee" },
      { name: "Barbaric Legstraps", wowheadId: 28504, slot: "Legs", itemLevel: 115, archetype: "melee-leather" },
      { name: "Whirlwind Axe", wowheadId: 28438, slot: "Two-Hand Axe", itemLevel: 115, archetype: "weapon-2h-str" },
      { name: "Bladed Shoulderpads of the Merciless", wowheadId: 28506, slot: "Shoulders", itemLevel: 115, archetype: "melee-plate" },
      { name: "Gloves of Saintly Blessings", wowheadId: 28507, slot: "Hands", itemLevel: 115, archetype: "heal-cloth" },
    ]},
    { name: "Moroes", items: [
      { name: "Moroes' Lucky Pocket Watch", wowheadId: 28528, slot: "Trinket", itemLevel: 115, archetype: "trinket-melee" },
      { name: "Nathrezim Mindblade", wowheadId: 28518, slot: "Dagger", itemLevel: 115, archetype: "weapon-dagger-caster" },
      { name: "Shadow-Cloak of Dalaran", wowheadId: 28517, slot: "Back", itemLevel: 115, archetype: "cloak-caster" },
      { name: "Emerald Ripper", wowheadId: 28519, slot: "Dagger", itemLevel: 115, archetype: "weapon-dagger-dps" },
      { name: "Ironweave Cowl", wowheadId: 28520, slot: "Head", itemLevel: 115, archetype: "caster-cloth" },
      { name: "Ribbon of Sacrifice", wowheadId: 28529, slot: "Trinket", itemLevel: 115, archetype: "trinket-heal" },
      { name: "Shermanar Great-Ring", wowheadId: 28530, slot: "Finger", itemLevel: 115, archetype: "jewel-tank" },
    ]},
    { name: "Maiden of Virtue", items: [
      { name: "Bracers of Maliciousness", wowheadId: 28540, slot: "Wrist", itemLevel: 115, archetype: "melee-leather" },
      { name: "Mender's Heart-Ring", wowheadId: 28544, slot: "Finger", itemLevel: 115, archetype: "jewel-heal" },
      { name: "Gloves of the Virtuous", wowheadId: 28542, slot: "Hands", itemLevel: 115, archetype: "heal-cloth" },
      { name: "Boots of Pure Thought", wowheadId: 28558, slot: "Feet", itemLevel: 115, archetype: "heal-cloth" },
    ]},
    { name: "Opera Event", items: [
      { name: "Big Bad Wolf's Paw", wowheadId: 30448, slot: "Trinket", itemLevel: 115, archetype: "trinket-melee" },
      { name: "Big Bad Wolf's Head", wowheadId: 30446, slot: "Head", itemLevel: 115, archetype: "tank-plate" },
      { name: "Beastmaw Pauldrons", wowheadId: 30451, slot: "Shoulders", itemLevel: 115, archetype: "ranged-hunter" },
      { name: "Romulo's Poison Vial", wowheadId: 30446, slot: "Trinket", itemLevel: 115, archetype: "trinket-melee" },
      { name: "Ruby Drape of the Mysticant", wowheadId: 30725, slot: "Back", itemLevel: 115, archetype: "cloak-caster" },
      { name: "Wicked Witch's Hat", wowheadId: 30730, slot: "Head", itemLevel: 115, archetype: "caster-cloth" },
      { name: "Crimson Girdle of the Indomitable", wowheadId: 30714, slot: "Waist", itemLevel: 115, archetype: "tank-plate" },
    ]},
    { name: "The Curator", items: [
      { name: "Gloves of the Fallen Champion", wowheadId: 29757, slot: "Token (Hands)", itemLevel: 120, archetype: "token-conqueror" },
      { name: "Gloves of the Fallen Defender", wowheadId: 29758, slot: "Token (Hands)", itemLevel: 120, archetype: "token-protector" },
      { name: "Gloves of the Fallen Hero", wowheadId: 29756, slot: "Token (Hands)", itemLevel: 120, archetype: "token-vanquisher" },
      { name: "Gloves of Dexterous Manipulation", wowheadId: 28606, slot: "Hands", itemLevel: 115, archetype: "melee-leather" },
      { name: "Staff of Infinite Mysteries", wowheadId: 28612, slot: "Staff", itemLevel: 115, archetype: "weapon-staff-heal" },
      { name: "Girdle of Ruination", wowheadId: 28603, slot: "Waist", itemLevel: 115, archetype: "melee-plate" },
      { name: "Electro-Plated Palms", wowheadId: 28602, slot: "Hands", itemLevel: 115, archetype: "melee-mail" },
    ]},
    { name: "Terestian Illhoof", items: [
      { name: "Adornment of Stolen Souls", wowheadId: 28770, slot: "Trinket", itemLevel: 115, archetype: "trinket-caster" },
      { name: "Cord of Nature's Sustenance", wowheadId: 28777, slot: "Waist", itemLevel: 115, archetype: "heal-leather" },
      { name: "Mantle of Abrahmis", wowheadId: 28778, slot: "Shoulders", itemLevel: 115, archetype: "melee-plate" },
      { name: "Ring of Unrelenting Storms", wowheadId: 28793, slot: "Finger", itemLevel: 115, archetype: "jewel-caster" },
      { name: "Shadow-Walker's Cord", wowheadId: 28779, slot: "Waist", itemLevel: 115, archetype: "melee-leather" },
      { name: "Malefic Girdle", wowheadId: 28780, slot: "Waist", itemLevel: 115, archetype: "caster-cloth" },
    ]},
    { name: "Shade of Aran", items: [
      { name: "Mindstorm Wristbands", wowheadId: 28799, slot: "Wrist", itemLevel: 115, archetype: "caster-cloth" },
      { name: "Iceshear Mantle", wowheadId: 28795, slot: "Shoulders", itemLevel: 115, archetype: "melee-plate" },
      { name: "Royal Cloak of the Sunstriders", wowheadId: 28797, slot: "Back", itemLevel: 115, archetype: "cloak-heal" },
      { name: "Pendant of the Violet Eye", wowheadId: 28793, slot: "Neck", itemLevel: 115, archetype: "jewel-caster" },
    ]},
    { name: "Netherspite", items: [
      { name: "Boots of the Incorrupt", wowheadId: 28828, slot: "Feet", itemLevel: 115, archetype: "heal-plate" },
      { name: "Shermanar Great-Ring", wowheadId: 28834, slot: "Finger", itemLevel: 115, archetype: "jewel-tank" },
    ]},
    { name: "Chess Event", items: [
      { name: "Rhinestone Sunglasses", wowheadId: 32285, slot: "Head", itemLevel: 115, archetype: "caster-cloth", notes: "Joke head item" },
      { name: "Headdress of the First Shaman", wowheadId: 34331, slot: "Head", itemLevel: 115, archetype: "caster-mail" },
      { name: "Girdle of Treachery", wowheadId: 34332, slot: "Waist", itemLevel: 115, archetype: "melee-leather" },
      { name: "Gorehowl", wowheadId: 32336, slot: "Two-Hand Axe", itemLevel: 115, archetype: "weapon-2h-melee", notes: "Ex Prince drop — Chess has its own chest reward table" },
    ]},
    { name: "Prince Malchezaar", items: [
      { name: "Helm of the Fallen Champion", wowheadId: 29760, slot: "Token (Head)", itemLevel: 120, archetype: "token-conqueror" },
      { name: "Helm of the Fallen Defender", wowheadId: 29761, slot: "Token (Head)", itemLevel: 120, archetype: "token-protector" },
      { name: "Helm of the Fallen Hero", wowheadId: 29759, slot: "Token (Head)", itemLevel: 120, archetype: "token-vanquisher" },
      { name: "Gorehowl", wowheadId: 32336, slot: "Two-Hand Axe", itemLevel: 115, archetype: "weapon-2h-melee" },
      { name: "Jade Ring of the Everliving", wowheadId: 30022, slot: "Finger", itemLevel: 115, archetype: "jewel-heal" },
      { name: "Malchazeen", wowheadId: 30883, slot: "Dagger", itemLevel: 115, archetype: "weapon-dagger-dps" },
      { name: "Sunfury Bow of the Phoenix", wowheadId: 30906, slot: "Bow", itemLevel: 115, archetype: "weapon-bow" },
      { name: "Terestian's Stranglestaff", wowheadId: 30910, slot: "Staff", itemLevel: 115, archetype: "weapon-staff-caster" },
      { name: "The Decapitator", wowheadId: 30883, slot: "Thrown", itemLevel: 115, archetype: "weapon-thrown" },
    ]},
    { name: "Nightbane", items: [
      { name: "Red Belt of Battle", wowheadId: 30041, slot: "Waist", itemLevel: 115, archetype: "melee-plate" },
      { name: "Cincture of Will", wowheadId: 30042, slot: "Waist", itemLevel: 115, archetype: "heal-cloth" },
      { name: "Rip-Flayer Leggings", wowheadId: 30038, slot: "Legs", itemLevel: 115, archetype: "melee-mail" },
      { name: "Bracers of the White Stag", wowheadId: 30045, slot: "Wrist", itemLevel: 115, archetype: "ranged-hunter" },
      { name: "Shard of Contempt", wowheadId: 34472, slot: "Trinket", itemLevel: 141, archetype: "trinket-melee", notes: "ZA badge drop in reality — Kara BoE analog" },
      { name: "Cloak of the Gathering Storm", wowheadId: 30046, slot: "Back", itemLevel: 115, archetype: "cloak-caster" },
    ]},
  ],
};

const gruulsLair: RaidDef = {
  name: "Gruul's Lair",
  shortName: "GL",
  bosses: [
    { name: "High King Maulgar", items: [
      t4Shoulder("Pauldrons of the Fallen Champion", "conqueror", 29762),
      t4Shoulder("Pauldrons of the Fallen Defender", "protector", 29763),
      t4Shoulder("Pauldrons of the Fallen Hero", "vanquisher", 29764),
      { name: "Earthwarden", wowheadId: 28658, slot: "Two-Hand Mace", itemLevel: 128, archetype: "weapon-staff-feral", notes: "Bear weapon" },
      { name: "Malefic Mask of the Shadows", wowheadId: 28656, slot: "Head", itemLevel: 128, archetype: "caster-cloth" },
      { name: "Belt of Divine Guidance", wowheadId: 28660, slot: "Waist", itemLevel: 128, archetype: "heal-plate" },
      { name: "Brute Cloak of the Ogre-Magi", wowheadId: 28661, slot: "Back", itemLevel: 128, archetype: "cloak-caster" },
      { name: "Aldori Legacy Defender", wowheadId: 28658, slot: "Shield", itemLevel: 128, archetype: "weapon-shield-tank" },
      { name: "Maulgar's Warhelm", wowheadId: 28801, slot: "Head", itemLevel: 128, archetype: "melee-mail" },
      { name: "Hammer of the Naaru", wowheadId: 28800, slot: "Two-Hand Mace", itemLevel: 128, archetype: "weapon-2h-str" },
      { name: "Belt of Divine Inspiration", wowheadId: 28799, slot: "Waist", itemLevel: 128, archetype: "caster-cloth" },
      { name: "Bladespire Warbands", wowheadId: 28795, slot: "Wrist", itemLevel: 128, archetype: "melee-plate" },
    ]},
    { name: "Gruul the Dragonkiller", items: [
      t4Legs("Leggings of the Fallen Champion", "conqueror", 29762),
      t4Legs("Leggings of the Fallen Defender", "protector", 29763),
      t4Legs("Leggings of the Fallen Hero", "vanquisher", 29764),
      { name: "Teeth of Gruul", wowheadId: 28745, slot: "Trinket", itemLevel: 128, archetype: "trinket-melee" },
      { name: "Gauntlets of Martial Perfection", wowheadId: 28749, slot: "Hands", itemLevel: 128, archetype: "melee-plate" },
      { name: "Dragonspine Trophy", wowheadId: 28830, slot: "Trinket", itemLevel: 128, archetype: "trinket-melee" },
      { name: "Cowl of Nature's Breath", wowheadId: 28740, slot: "Head", itemLevel: 128, archetype: "heal-leather" },
      { name: "Maladath, Runed Blade of the Black Flight", wowheadId: 28749, slot: "One-Hand Sword", itemLevel: 128, archetype: "weapon-1h-melee" },
      { name: "Bloodmaw Magus-Blade", wowheadId: 28731, slot: "One-Hand Sword", itemLevel: 128, archetype: "weapon-1h-caster" },
      { name: "Gronn-Stitched Girdle", wowheadId: 28741, slot: "Waist", itemLevel: 128, archetype: "melee-leather" },
      { name: "Eye of Gruul", wowheadId: 28823, slot: "Trinket", itemLevel: 128, archetype: "trinket-heal" },
      { name: "Windshear Boots", wowheadId: 28810, slot: "Feet", itemLevel: 128, archetype: "melee-mail" },
      { name: "Gauntlets of the Dragonslayer", wowheadId: 28827, slot: "Hands", itemLevel: 128, archetype: "melee-mail" },
      { name: "Collar of Cho'gall", wowheadId: 28804, slot: "Head", itemLevel: 128, archetype: "caster-cloth" },
    ]},
  ],
};

const magtheridonsLair: RaidDef = {
  name: "Magtheridon's Lair",
  shortName: "MAG",
  bosses: [
    { name: "Magtheridon", items: [
      t4Chest("Chestguard of the Fallen Champion", "conqueror", 29753),
      t4Chest("Chestguard of the Fallen Defender", "protector", 29754),
      t4Chest("Chestguard of the Fallen Hero", "vanquisher", 29755),
      { name: "Eye of Magtheridon", wowheadId: 32660, slot: "Trinket", itemLevel: 128, archetype: "trinket-caster" },
      { name: "Soul-Eater's Handwraps", wowheadId: 28797, slot: "Hands", itemLevel: 128, archetype: "caster-cloth" },
      { name: "Aran's Soothing Sapphire", wowheadId: 28798, slot: "Neck", itemLevel: 128, archetype: "jewel-caster" },
      { name: "Glaive of the Pit", wowheadId: 28774, slot: "Polearm", itemLevel: 128, archetype: "weapon-polearm" },
      { name: "Crystalheart Pulse-Staff", wowheadId: 28770, slot: "Staff", itemLevel: 128, archetype: "weapon-staff-heal" },
      { name: "Helm of the Forgotten Conqueror", wowheadId: 28770, slot: "Token (Head)", itemLevel: 128, archetype: "token-conqueror", notes: "T4 alt token — listed separately on some sources" },
      { name: "Cowl of Beastly Rage", wowheadId: 28771, slot: "Head", itemLevel: 128, archetype: "ranged-hunter" },
      { name: "Magtheridon's Head", wowheadId: 32385, slot: "Quest", itemLevel: 128, notes: "Quest token from The Fall of Magtheridon — not equippable" },
      { name: "Eredar Wand of Obliteration", wowheadId: 28783, slot: "Wand", itemLevel: 128, archetype: "weapon-wand" },
      { name: "Karaborian Talisman", wowheadId: 28781, slot: "Held In Off-hand", itemLevel: 128, archetype: "weapon-offhand-caster" },
      { name: "Terror Pit Girdle", wowheadId: 28778, slot: "Waist", itemLevel: 128, archetype: "caster-mail" },
      { name: "Girdle of the Endless Pit", wowheadId: 28779, slot: "Waist", itemLevel: 128, archetype: "melee-plate" },
      { name: "Aegis of the Vindicator", wowheadId: 29458, slot: "Shield", itemLevel: 128, archetype: "weapon-shield-tank" },
      { name: "Liar's Tongue Gloves", wowheadId: 28776, slot: "Hands", itemLevel: 128, archetype: "melee-leather" },
      { name: "Cloak of the Pit Stalker", wowheadId: 28777, slot: "Back", itemLevel: 128, archetype: "cloak-melee" },
    ]},
  ],
};

// -------------------------------------------------------------------------
// PHASE 2: Serpentshrine Cavern + Tempest Keep
// -------------------------------------------------------------------------

const ssc: RaidDef = {
  name: "Serpentshrine Cavern",
  shortName: "SSC",
  bosses: [
    { name: "Hydross the Unstable", items: [
      { name: "Fathomstone", wowheadId: 30049, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "Wraps of Purification", wowheadId: 32516, slot: "Wrist", itemLevel: 133, archetype: "heal-cloth" },
      { name: "Living Root of the Wildheart", wowheadId: 30664, slot: "Trinket", itemLevel: 133, archetype: "trinket-melee" },
      { name: "Scarab of Displacement", wowheadId: 30629, slot: "Trinket", itemLevel: 133, archetype: "trinket-tank" },
      { name: "Band of Vile Aggression", wowheadId: 33055, slot: "Finger", itemLevel: 133, archetype: "jewel-melee" },
      { name: "Blackfathom Warbands", wowheadId: 30047, slot: "Wrist", itemLevel: 133, archetype: "ranged-hunter" },
      { name: "Boots of the Shifting Nightmare", wowheadId: 30050, slot: "Feet", itemLevel: 133, archetype: "heal-leather" },
      { name: "Brighthelm of Justice", wowheadId: 30048, slot: "Head", itemLevel: 133, archetype: "tank-plate" },
      { name: "Pauldrons of the Wardancer", wowheadId: 30053, slot: "Shoulders", itemLevel: 133, archetype: "melee-leather" },
      { name: "Ranger-General's Chestguard", wowheadId: 30054, slot: "Chest", itemLevel: 133, archetype: "ranged-hunter" },
      { name: "Ring of Lethality", wowheadId: 30052, slot: "Finger", itemLevel: 133, archetype: "jewel-melee" },
      { name: "Robe of Hateful Echoes", wowheadId: 30056, slot: "Chest", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Shoulderpads of the Stranger", wowheadId: 30055, slot: "Shoulders", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Idol of the Crescent Goddess", wowheadId: 30051, slot: "Relic", itemLevel: 133, archetype: "weapon-offhand-heal" },
    ]},
    { name: "The Lurker Below", items: [
      { name: "Mallet of the Tides", wowheadId: 30058, slot: "One-Hand Mace", itemLevel: 133, archetype: "weapon-mace-heal" },
      { name: "Boots of Effortless Striking", wowheadId: 30060, slot: "Feet", itemLevel: 133, archetype: "melee-leather" },
      { name: "Grove-Bands of Remulos", wowheadId: 30062, slot: "Wrist", itemLevel: 133, archetype: "heal-leather" },
      { name: "Ancestral Ring of Conquest", wowheadId: 30061, slot: "Finger", itemLevel: 133, archetype: "jewel-melee" },
      { name: "The Seal of Danzalar", wowheadId: 33054, slot: "Finger", itemLevel: 133, archetype: "jewel-tank" },
      { name: "Cord of Screaming Terrors", wowheadId: 30064, slot: "Waist", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Glowing Breastplate of Truth", wowheadId: 30065, slot: "Chest", itemLevel: 133, archetype: "heal-plate" },
      { name: "Choker of Animalistic Fury", wowheadId: 30059, slot: "Neck", itemLevel: 133, archetype: "jewel-melee" },
      { name: "Bracers of Eradication", wowheadId: 30057, slot: "Wrist", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Velvet Boots of the Guardian", wowheadId: 30067, slot: "Feet", itemLevel: 133, archetype: "heal-cloth" },
      { name: "Earring of Soulful Meditation", wowheadId: 30665, slot: "Neck", itemLevel: 133, archetype: "jewel-heal" },
      { name: "Tempest-Strider Boots", wowheadId: 30066, slot: "Feet", itemLevel: 133, archetype: "caster-mail" },
      { name: "Libram of Absolute Truth", wowheadId: 30063, slot: "Relic", itemLevel: 133, archetype: "weapon-offhand-heal" },
    ]},
    { name: "Leotheras the Blind", items: [
      t5Gloves("Gloves of the Vanquished Champion", "conqueror", 30239),
      t5Gloves("Gloves of the Vanquished Defender", "protector", 30240),
      t5Gloves("Gloves of the Vanquished Hero", "vanquisher", 30241),
      { name: "Girdle of the Invulnerable", wowheadId: 30096, slot: "Waist", itemLevel: 133, archetype: "tank-plate" },
      { name: "Coral-Barbed Shoulderpads", wowheadId: 30097, slot: "Shoulders", itemLevel: 133, archetype: "melee-leather" },
      { name: "Fang of the Leviathan", wowheadId: 30095, slot: "One-Hand Sword", itemLevel: 133, archetype: "weapon-1h-melee" },
      { name: "Orca-Hide Boots", wowheadId: 30092, slot: "Feet", itemLevel: 133, archetype: "caster-leather" },
      { name: "True-Aim Stalker Bands", wowheadId: 30091, slot: "Wrist", itemLevel: 133, archetype: "ranged-hunter" },
      { name: "Tsunami Talisman", wowheadId: 30627, slot: "Trinket", itemLevel: 133, archetype: "trinket-melee" },
    ]},
    { name: "Fathom-Lord Karathress", items: [
      t5Legs("Leggings of the Vanquished Champion", "conqueror", 30245),
      t5Legs("Leggings of the Vanquished Defender", "protector", 30246),
      t5Legs("Leggings of the Vanquished Hero", "vanquisher", 30247),
      { name: "Bloodsea Brigand's Vest", wowheadId: 30101, slot: "Chest", itemLevel: 133, archetype: "melee-leather" },
      { name: "Fathom-Brooch of the Tidewalker", wowheadId: 30663, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "Frayed Tether of the Drowned", wowheadId: 30099, slot: "Wrist", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Sextant of Unstable Currents", wowheadId: 30626, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "World Breaker", wowheadId: 30090, slot: "Two-Hand Sword", itemLevel: 133, archetype: "weapon-2h-melee" },
      { name: "Soul-Strider Boots", wowheadId: 30100, slot: "Feet", itemLevel: 133, archetype: "caster-cloth" },
    ]},
    { name: "Morogrim Tidewalker", items: [
      { name: "Mantle of the Tireless Tracker", wowheadId: 30085, slot: "Shoulders", itemLevel: 133, archetype: "ranged-hunter" },
      { name: "Pauldrons of the Argent Sentinel", wowheadId: 30084, slot: "Shoulders", itemLevel: 133, archetype: "tank-plate" },
      { name: "Razor-Scale Battlecloak", wowheadId: 30098, slot: "Back", itemLevel: 133, archetype: "cloak-hunter" },
      { name: "Warboots of Obliteration", wowheadId: 30081, slot: "Feet", itemLevel: 133, archetype: "melee-plate" },
      { name: "Ring of Sundered Souls", wowheadId: 30083, slot: "Finger", itemLevel: 133, archetype: "jewel-tank" },
      { name: "Band of the Vigilant", wowheadId: 33058, slot: "Finger", itemLevel: 133, archetype: "jewel-heal" },
      { name: "Illidari Shoulderpads", wowheadId: 30079, slot: "Shoulders", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Talon of Azshara", wowheadId: 30082, slot: "Dagger", itemLevel: 133, archetype: "weapon-dagger-caster" },
      { name: "Pendant of the Lost Ages", wowheadId: 30008, slot: "Neck", itemLevel: 133, archetype: "jewel-caster" },
      { name: "Serpent-Coil Braid", wowheadId: 30720, slot: "Trinket", itemLevel: 133, archetype: "trinket-heal" },
      { name: "Girdle of the Tidal Call", wowheadId: 30068, slot: "Waist", itemLevel: 133, archetype: "caster-mail" },
      { name: "Gnarled Chestpiece of the Ancients", wowheadId: 30075, slot: "Chest", itemLevel: 133, archetype: "heal-leather" },
      { name: "Luminescent Rod of the Naaru", wowheadId: 30080, slot: "Wand", itemLevel: 133, archetype: "weapon-wand" },
    ]},
    { name: "Lady Vashj", items: [
      t5Helm("Helm of the Vanquished Champion", "conqueror", 30242),
      t5Helm("Helm of the Vanquished Defender", "protector", 30243),
      t5Helm("Helm of the Vanquished Hero", "vanquisher", 30244),
      { name: "Belt of One-Hundred Deaths", wowheadId: 30106, slot: "Waist", itemLevel: 141, archetype: "melee-leather" },
      { name: "Coral Band of the Revived", wowheadId: 30110, slot: "Finger", itemLevel: 141, archetype: "jewel-heal" },
      { name: "Fang of Vashj", wowheadId: 30103, slot: "Dagger", itemLevel: 141, archetype: "weapon-dagger-dps" },
      { name: "Glorious Gauntlets of Crestfall", wowheadId: 30112, slot: "Hands", itemLevel: 141, archetype: "tank-plate" },
      { name: "Krakken-Heart Breastplate", wowheadId: 30102, slot: "Chest", itemLevel: 141, archetype: "melee-plate" },
      { name: "Lightfathom Scepter", wowheadId: 30108, slot: "One-Hand Mace", itemLevel: 141, archetype: "weapon-1h-caster" },
      { name: "Prism of Inner Calm", wowheadId: 30621, slot: "Trinket", itemLevel: 141, archetype: "trinket-heal" },
      { name: "Ring of Endless Coils", wowheadId: 30109, slot: "Finger", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Cobra-Lash Boots", wowheadId: 30104, slot: "Feet", itemLevel: 141, archetype: "melee-mail" },
      { name: "Runetotem's Mantle", wowheadId: 30111, slot: "Shoulders", itemLevel: 141, archetype: "heal-leather" },
      { name: "Serpent Spine Longbow", wowheadId: 30105, slot: "Bow", itemLevel: 141, archetype: "weapon-bow" },
      { name: "Vestments of the Sea-Witch", wowheadId: 30107, slot: "Chest", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Vashj's Vial Remnant", wowheadId: 29906, slot: "Quest", itemLevel: 141, notes: "Quest turn-in — Vials of the Sunwell", weights: {} },
      { name: "Scroll of the Maelstrom", wowheadId: 32895, slot: "Other", itemLevel: 141, notes: "Crafted-recipe scroll", weights: {} },
    ]},
    { name: "Trash Loot", items: [
      { name: "Wildfury Greatstaff", wowheadId: 30021, slot: "Staff", itemLevel: 128, archetype: "weapon-staff-feral" },
      { name: "Pendant of the Perilous", wowheadId: 30022, slot: "Neck", itemLevel: 128, archetype: "jewel-tank" },
      { name: "Totem of the Maelstrom", wowheadId: 30023, slot: "Relic", itemLevel: 128 },
      { name: "Serpentshrine Shuriken", wowheadId: 30025, slot: "Thrown", itemLevel: 128, archetype: "weapon-thrown" },
      { name: "Boots of Courage Unending", wowheadId: 30027, slot: "Feet", itemLevel: 128, archetype: "tank-plate" },
      { name: "Spyglass of the Hidden Fleet", wowheadId: 30620, slot: "Trinket", itemLevel: 128, archetype: "trinket-hunter" },
    ]},
  ],
};

const tempestKeep: RaidDef = {
  name: "Tempest Keep: The Eye",
  shortName: "TK",
  bosses: [
    { name: "Al'ar", items: [
      { name: "Talon of Al'ar", wowheadId: 30448, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "Fire Crest Breastplate", wowheadId: 29921, slot: "Chest", itemLevel: 133, archetype: "ranged-hunter" },
      { name: "Gloves of the Searing Grip", wowheadId: 29947, slot: "Hands", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Mindstorm Wristbands", wowheadId: 29918, slot: "Wrist", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Phoenix-Ring of Rebirth", wowheadId: 29920, slot: "Finger", itemLevel: 133, archetype: "jewel-heal" },
      { name: "Talisman of the Sun King", wowheadId: 29923, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "Tome of Fiery Redemption", wowheadId: 30447, slot: "Off Hand", itemLevel: 133, archetype: "weapon-offhand-caster" },
      { name: "Arcanite Steam-Pistol", wowheadId: 29949, slot: "Gun", itemLevel: 133, archetype: "weapon-gun" },
      { name: "Band of Al'ar", wowheadId: 29922, slot: "Finger", itemLevel: 133, archetype: "jewel-caster" },
      { name: "Phoenix-Wing Cloak", wowheadId: 29925, slot: "Back", itemLevel: 133, archetype: "cloak-caster" },
      { name: "Netherbane", wowheadId: 29924, slot: "Two-Hand Sword", itemLevel: 133, archetype: "weapon-2h-melee" },
      { name: "Claw of the Phoenix", wowheadId: 29948, slot: "Fist Weapon", itemLevel: 133, archetype: "weapon-fist-melee" },
      { name: "Talon of the Phoenix", wowheadId: 32944, slot: "Dagger", itemLevel: 133, archetype: "weapon-dagger-dps" },
    ]},
    { name: "Void Reaver", items: [
      t5Shoulder("Pauldrons of the Vanquished Champion", "conqueror", 30248),
      t5Shoulder("Pauldrons of the Vanquished Defender", "protector", 30249),
      t5Shoulder("Pauldrons of the Vanquished Hero", "vanquisher", 30250),
      { name: "Wristguards of Determination", wowheadId: 32515, slot: "Wrist", itemLevel: 133, archetype: "tank-plate" },
      { name: "Fel-Steel Warhelm", wowheadId: 29983, slot: "Head", itemLevel: 133, archetype: "melee-plate" },
      { name: "Void Reaver Greaves", wowheadId: 29985, slot: "Legs", itemLevel: 133, archetype: "tank-plate" },
      { name: "Warp-Spring Coil", wowheadId: 30450, slot: "Trinket", itemLevel: 133, archetype: "trinket-melee" },
      { name: "Cowl of the Grand Engineer", wowheadId: 29986, slot: "Head", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Fel Reaver's Piston", wowheadId: 30619, slot: "Trinket", itemLevel: 133, archetype: "trinket-melee" },
      { name: "Girdle of Zaetar", wowheadId: 29984, slot: "Waist", itemLevel: 133, archetype: "caster-leather" },
    ]},
    { name: "High Astromancer Solarian", items: [
      { name: "Girdle of the Righteous Path", wowheadId: 29965, slot: "Waist", itemLevel: 133, archetype: "heal-plate" },
      { name: "Greaves of the Bloodwarder", wowheadId: 29950, slot: "Legs", itemLevel: 133, archetype: "melee-plate" },
      { name: "Heartrazor", wowheadId: 29962, slot: "One-Hand Sword", itemLevel: 133, archetype: "weapon-1h-melee" },
      { name: "Star-Strider Boots", wowheadId: 29951, slot: "Feet", itemLevel: 133, archetype: "caster-mail" },
      { name: "Vambraces of Ending", wowheadId: 29966, slot: "Wrist", itemLevel: 133, archetype: "melee-plate" },
      { name: "Ethereum Life-Staff", wowheadId: 29981, slot: "Staff", itemLevel: 133, archetype: "weapon-staff-heal" },
      { name: "Solarian's Sapphire", wowheadId: 30446, slot: "Trinket", itemLevel: 133, archetype: "trinket-caster" },
      { name: "Void Star Talisman", wowheadId: 30449, slot: "Trinket", itemLevel: 133, archetype: "trinket-heal" },
      { name: "Worldstorm Gauntlets", wowheadId: 29976, slot: "Hands", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Star-Soul Breeches", wowheadId: 29977, slot: "Legs", itemLevel: 133, archetype: "heal-mail" },
      { name: "Trousers of the Astromancer", wowheadId: 29972, slot: "Legs", itemLevel: 133, archetype: "caster-cloth" },
      { name: "Wand of the Forgotten Star", wowheadId: 29982, slot: "Wand", itemLevel: 133, archetype: "weapon-wand" },
      { name: "Boots of the Resilient", wowheadId: 32267, slot: "Feet", itemLevel: 133, archetype: "heal-mail" },
    ]},
    { name: "Kael'thas Sunstrider", items: [
      t5Chest("Chestguard of the Vanquished Champion", "conqueror", 30236),
      t5Chest("Chestguard of the Vanquished Defender", "protector", 30237),
      t5Chest("Chestguard of the Vanquished Hero", "vanquisher", 30238),
      { name: "Verdant Sphere", wowheadId: 32405, slot: "Trinket", itemLevel: 141, archetype: "trinket-caster" },
      { name: "Crown of the Sun", wowheadId: 29990, slot: "Head", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Gauntlets of the Sun King", wowheadId: 29987, slot: "Hands", itemLevel: 141, archetype: "tank-plate" },
      { name: "Band of the Ranger-General", wowheadId: 29997, slot: "Finger", itemLevel: 141, archetype: "jewel-melee" },
      { name: "Leggings of Murderous Intent", wowheadId: 29995, slot: "Legs", itemLevel: 141, archetype: "melee-leather" },
      { name: "Rod of the Sun King", wowheadId: 29996, slot: "Two-Hand Mace", itemLevel: 141, archetype: "weapon-2h-str" },
      { name: "Royal Cloak of the Sunstriders", wowheadId: 29992, slot: "Back", itemLevel: 141, archetype: "cloak-caster" },
      { name: "Royal Gauntlets of Silvermoon", wowheadId: 29998, slot: "Hands", itemLevel: 141, archetype: "heal-plate" },
      { name: "Sunshower Light Cloak", wowheadId: 29989, slot: "Back", itemLevel: 141, archetype: "cloak-hunter" },
      { name: "Thalassian Wildercloak", wowheadId: 29994, slot: "Back", itemLevel: 141, archetype: "cloak-heal" },
      { name: "The Nexus Key", wowheadId: 29988, slot: "Staff", itemLevel: 141, archetype: "weapon-staff-caster" },
      { name: "Twinblade of the Phoenix", wowheadId: 29993, slot: "Two-Hand Sword", itemLevel: 141, archetype: "weapon-2h-melee" },
      { name: "Sunhawk Leggings", wowheadId: 29991, slot: "Legs", itemLevel: 141, archetype: "melee-mail" },
      { name: "Kael's Vial Remnant", wowheadId: 29905, slot: "Quest", itemLevel: 141, notes: "Quest turn-in — Vials of the Sunwell", weights: {} },
      { name: "Ashes of Al'ar", wowheadId: 32458, slot: "Mount", itemLevel: 1, notes: "Flying mount — extremely rare", weights: {} },
      { name: "Scroll of the Sun", wowheadId: 32896, slot: "Other", itemLevel: 141, notes: "Crafted-recipe scroll", weights: {} },
      { name: "Nether Vortex", wowheadId: 30183, slot: "Reagent", itemLevel: 0, notes: "BoP crafting reagent", weights: {} },
      { name: "Warp Slicer", wowheadId: 30311, slot: "One-Hand Sword", itemLevel: 141, archetype: "weapon-1h-melee" },
      { name: "Infinity Blade", wowheadId: 30312, slot: "One-Hand Sword", itemLevel: 141, archetype: "weapon-1h-melee" },
      { name: "Staff of Disintegration", wowheadId: 30313, slot: "Staff", itemLevel: 141, archetype: "weapon-staff-caster" },
      { name: "Phaseshift Bulwark", wowheadId: 30314, slot: "Shield", itemLevel: 141, archetype: "weapon-shield-tank" },
      { name: "Devastation", wowheadId: 30316, slot: "Two-Hand Axe", itemLevel: 141, archetype: "weapon-2h-melee" },
      { name: "Cosmic Infuser", wowheadId: 30317, slot: "One-Hand Mace", itemLevel: 141, archetype: "weapon-mace-heal" },
      { name: "Netherstrand Longbow", wowheadId: 30318, slot: "Bow", itemLevel: 141, archetype: "weapon-bow" },
    ]},
    { name: "Trash Loot", items: [
      { name: "Fire-Cord of the Magus", wowheadId: 30020, slot: "Waist", itemLevel: 128, archetype: "caster-cloth" },
      { name: "Mantle of the Elven Kings", wowheadId: 30024, slot: "Shoulders", itemLevel: 128, archetype: "caster-cloth" },
      { name: "Bands of the Celestial Archer", wowheadId: 30026, slot: "Wrist", itemLevel: 128, archetype: "ranged-hunter" },
      { name: "Seventh Ring of the Tirisfalen", wowheadId: 30028, slot: "Finger", itemLevel: 128, archetype: "jewel-caster" },
      { name: "Bark-Gloves of Ancient Wisdom", wowheadId: 30029, slot: "Hands", itemLevel: 128, archetype: "heal-leather" },
      { name: "Girdle of Fallen Stars", wowheadId: 30030, slot: "Waist", itemLevel: 128, archetype: "melee-leather" },
      { name: "Pattern: Boots of Blasting",          wowheadId: 30282, slot: "Pattern",  itemLevel: 128, notes: "Tailoring 375 — crafts Boots of Blasting (BoP). World drop, BoP.",         weights: {} },
      { name: "Pattern: Boots of Natural Grace",     wowheadId: 30305, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Boots of Natural Grace (BoP). World drop, BoP.", weights: {} },
      // Remaining BoP profession patterns / plans that drop from any SSC
      // or TK boss. Parked under TK Trash Loot for consistency with the
      // two patterns above; the planned professions tab queries by
      // item name + slot, not by boss.
      { name: "Pattern: Belt of Blasting",            wowheadId: 30280, slot: "Pattern",  itemLevel: 128, notes: "Tailoring 375 — crafts Belt of Blasting (BoE). World drop, BoP.",            weights: {} },
      { name: "Pattern: Belt of the Long Road",       wowheadId: 30281, slot: "Pattern",  itemLevel: 128, notes: "Tailoring 375 — crafts Belt of the Long Road (BoE). World drop, BoP.",       weights: {} },
      { name: "Pattern: Boots of the Long Road",      wowheadId: 30283, slot: "Pattern",  itemLevel: 128, notes: "Tailoring 375 — crafts Boots of the Long Road (BoP). World drop, BoP.",      weights: {} },
      { name: "Pattern: Belt of Natural Power",       wowheadId: 30301, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Belt of Natural Power (BoE). World drop, BoP.",  weights: {} },
      { name: "Pattern: Belt of Deep Shadow",         wowheadId: 30302, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Belt of Deep Shadow (BoE). World drop, BoP.",    weights: {} },
      { name: "Pattern: Belt of the Black Eagle",     wowheadId: 30303, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Belt of the Black Eagle (BoE). World drop, BoP.",weights: {} },
      { name: "Pattern: Monsoon Belt",                wowheadId: 30304, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Monsoon Belt (BoE). World drop, BoP.",            weights: {} },
      { name: "Pattern: Boots of Utter Darkness",     wowheadId: 30306, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Boots of Utter Darkness (BoP). World drop, BoP.", weights: {} },
      { name: "Pattern: Boots of the Crimson Hawk",   wowheadId: 30307, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Boots of the Crimson Hawk (BoP). World drop, BoP.",weights: {} },
      { name: "Pattern: Hurricane Boots",             wowheadId: 30308, slot: "Pattern",  itemLevel: 128, notes: "Leatherworking 375 — crafts Hurricane Boots (BoP). World drop, BoP.",         weights: {} },
      { name: "Plans: Belt of the Guardian",          wowheadId: 30321, slot: "Plans",    itemLevel: 128, notes: "Blacksmithing 375 — crafts Belt of the Guardian (BoE). World drop, BoP.",     weights: {} },
      { name: "Plans: Red Belt of Battle",            wowheadId: 30322, slot: "Plans",    itemLevel: 128, notes: "Blacksmithing 375 — crafts Red Belt of Battle (BoE). World drop, BoP.",       weights: {} },
      { name: "Plans: Boots of the Protector",        wowheadId: 30323, slot: "Plans",    itemLevel: 128, notes: "Blacksmithing 375 — crafts Boots of the Protector (BoP). World drop, BoP.",   weights: {} },
      { name: "Plans: Red Havoc Boots",               wowheadId: 30324, slot: "Plans",    itemLevel: 128, notes: "Blacksmithing 375 — crafts Red Havoc Boots (BoP). World drop, BoP.",          weights: {} },
      { name: "Badge of Justice",                     wowheadId: 29434, slot: "Currency", itemLevel: 0,   notes: "Heroic / raid badge currency. Drops from every boss in SSC and Tempest Keep.", weights: {} },
    ]},
  ],
};

// -------------------------------------------------------------------------
// PHASE 3: Battle for Mount Hyjal + Black Temple
// -------------------------------------------------------------------------

const hyjal: RaidDef = {
  name: "Battle for Mount Hyjal",
  shortName: "MH",
  bosses: [
    { name: "Rage Winterchill", items: [
      t6Gloves("Gloves of the Forgotten Conqueror", "conqueror"),
      t6Gloves("Gloves of the Forgotten Protector", "protector"),
      t6Gloves("Gloves of the Forgotten Vanquisher", "vanquisher"),
      { name: "Boots of the Divine Light", wowheadId: 32338, slot: "Feet", itemLevel: 141, archetype: "heal-plate" },
      { name: "Brighthelm of Justice", wowheadId: 32342, slot: "Head", itemLevel: 141, archetype: "tank-plate" },
      { name: "Cataclysm Harness", wowheadId: 32344, slot: "Chest", itemLevel: 141, archetype: "caster-mail" },
      { name: "Leggings of the Pursuit", wowheadId: 32347, slot: "Legs", itemLevel: 141, archetype: "melee-leather" },
      { name: "Scaled Legs of the Wild", wowheadId: 32349, slot: "Legs", itemLevel: 141, archetype: "ranged-hunter" },
      { name: "Wand of the Demonsworn", wowheadId: 32354, slot: "Wand", itemLevel: 141, archetype: "weapon-wand" },
    ]},
    { name: "Anetheron", items: [
      t6Helm("Helm of the Forgotten Conqueror", "conqueror"),
      t6Helm("Helm of the Forgotten Protector", "protector"),
      t6Helm("Helm of the Forgotten Vanquisher", "vanquisher"),
      { name: "Boots of the Divine Light", wowheadId: 32338, slot: "Feet", itemLevel: 141, archetype: "heal-plate" },
      { name: "Gavel of Unearthed Secrets", wowheadId: 32356, slot: "One-Hand Mace", itemLevel: 141, archetype: "weapon-mace-heal" },
      { name: "Boneweave Girdle", wowheadId: 32345, slot: "Waist", itemLevel: 141, archetype: "ranged-hunter" },
      { name: "Fel Reaver's Piston", wowheadId: 32505, slot: "Trinket", itemLevel: 141, archetype: "trinket-melee" },
      { name: "Girdle of the Lightbearer", wowheadId: 32346, slot: "Waist", itemLevel: 141, archetype: "heal-plate" },
      { name: "Choker of Serrated Blades", wowheadId: 32358, slot: "Neck", itemLevel: 141, archetype: "jewel-melee" },
    ]},
    { name: "Kaz'rogal", items: [
      t6Shoulder("Pauldrons of the Forgotten Conqueror", "conqueror"),
      t6Shoulder("Pauldrons of the Forgotten Protector", "protector"),
      t6Shoulder("Pauldrons of the Forgotten Vanquisher", "vanquisher"),
      { name: "Belt of the Silent Path", wowheadId: 32336, slot: "Waist", itemLevel: 141, archetype: "melee-leather" },
      { name: "Robe of Hateful Echoes", wowheadId: 32592, slot: "Chest", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Kaz'rogal's Hardened Heart", wowheadId: 32760, slot: "Neck", itemLevel: 141, archetype: "jewel-tank" },
      { name: "Commendation of Kael'thas", wowheadId: 32362, slot: "Trinket", itemLevel: 141, archetype: "trinket-tank" },
      { name: "Belt of Seething Fury", wowheadId: 32515, slot: "Waist", itemLevel: 141, archetype: "melee-plate" },
      { name: "Leggings of Channeled Elements", wowheadId: 32586, slot: "Legs", itemLevel: 141, archetype: "caster-mail" },
    ]},
    { name: "Azgalor", items: [
      t6Legs("Leggings of the Forgotten Conqueror", "conqueror"),
      t6Legs("Leggings of the Forgotten Protector", "protector"),
      t6Legs("Leggings of the Forgotten Vanquisher", "vanquisher"),
      { name: "Apolyon, the Soul-Render", wowheadId: 32338, slot: "Two-Hand Axe", itemLevel: 141, archetype: "weapon-2h-melee" },
      { name: "Claw of Molten Fury", wowheadId: 32366, slot: "Dagger", itemLevel: 141, archetype: "weapon-dagger-dps" },
      { name: "Boots of the Endless Moor", wowheadId: 32344, slot: "Feet", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Talisman of Vehement Resolve", wowheadId: 32505, slot: "Neck", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Pauldrons of Stone Resolve", wowheadId: 32569, slot: "Shoulders", itemLevel: 141, archetype: "tank-plate" },
      { name: "Girdle of Stability", wowheadId: 32570, slot: "Waist", itemLevel: 141, archetype: "tank-plate" },
    ]},
    { name: "Archimonde", items: [
      t6Chest("Chestguard of the Forgotten Conqueror", "conqueror"),
      t6Chest("Chestguard of the Forgotten Protector", "protector"),
      t6Chest("Chestguard of the Forgotten Vanquisher", "vanquisher"),
      { name: "Crystal Spire of Karabor", wowheadId: 32374, slot: "One-Hand Mace", itemLevel: 146, archetype: "weapon-mace-heal" },
      { name: "Bundle of Bloodthistle", wowheadId: 32505, slot: "Trinket", itemLevel: 146, archetype: "trinket-caster" },
      { name: "Bow of the Forest King", wowheadId: 32375, slot: "Bow", itemLevel: 146, archetype: "weapon-bow" },
      { name: "Apostle of Argus", wowheadId: 32376, slot: "Held In Off-hand", itemLevel: 146, archetype: "weapon-offhand-caster" },
      { name: "Aran's Soothing Sapphire", wowheadId: 32377, slot: "Neck", itemLevel: 146, archetype: "jewel-caster" },
      { name: "Blood-Cursed Shroud", wowheadId: 32584, slot: "Back", itemLevel: 146, archetype: "cloak-caster" },
      { name: "Leggings of the Immortal Night", wowheadId: 32585, slot: "Legs", itemLevel: 146, archetype: "melee-leather" },
    ]},
  ],
};

const blackTemple: RaidDef = {
  name: "Black Temple",
  shortName: "BT",
  bosses: [
    { name: "High Warlord Naj'entus", items: [
      t6Gloves("Gloves of the Forgotten Conqueror", "conqueror"),
      t6Gloves("Gloves of the Forgotten Protector", "protector"),
      t6Gloves("Gloves of the Forgotten Vanquisher", "vanquisher"),
      { name: "Naj'entus Spine", wowheadId: 32408, slot: "Trinket", itemLevel: 141, archetype: "trinket-caster" },
      { name: "Amice of Brilliant Light", wowheadId: 32267, slot: "Shoulders", itemLevel: 141, archetype: "heal-cloth" },
      { name: "Nether Shadow Tunic", wowheadId: 32268, slot: "Chest", itemLevel: 141, archetype: "melee-leather" },
      { name: "Warboots of Obliteration", wowheadId: 32269, slot: "Feet", itemLevel: 141, archetype: "tank-plate" },
      { name: "Ring of Captured Storms", wowheadId: 32270, slot: "Finger", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Pillar of Ferocity", wowheadId: 32271, slot: "Polearm", itemLevel: 141, archetype: "weapon-polearm" },
    ]},
    { name: "Supremus", items: [
      t6Shoulder("Pauldrons of the Forgotten Conqueror", "conqueror"),
      t6Shoulder("Pauldrons of the Forgotten Protector", "protector"),
      t6Shoulder("Pauldrons of the Forgotten Vanquisher", "vanquisher"),
      { name: "Choker of Endless Nightmares", wowheadId: 32272, slot: "Neck", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Gnarled Chestpiece of the Ancients", wowheadId: 32273, slot: "Chest", itemLevel: 141, archetype: "heal-leather" },
      { name: "Pauldrons of Abandoned Faith", wowheadId: 32274, slot: "Shoulders", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Axe of Frozen Death", wowheadId: 32385, slot: "One-Hand Axe", itemLevel: 141, archetype: "weapon-1h-melee" },
      { name: "Crystalforge Belt", wowheadId: 32275, slot: "Waist", itemLevel: 141, archetype: "heal-plate" },
      { name: "Fists of Mukoa", wowheadId: 32386, slot: "Fist Weapon", itemLevel: 141, archetype: "weapon-fist-melee" },
    ]},
    { name: "Shade of Akama", items: [
      t6Gloves("Gloves of the Forgotten Conqueror", "conqueror"),
      t6Gloves("Gloves of the Forgotten Protector", "protector"),
      t6Gloves("Gloves of the Forgotten Vanquisher", "vanquisher"),
      { name: "Myrmidon's Treads", wowheadId: 32276, slot: "Feet", itemLevel: 141, archetype: "melee-mail" },
      { name: "Stanchion of Primal Instinct", wowheadId: 32387, slot: "Polearm", itemLevel: 141, archetype: "weapon-polearm" },
      { name: "Akama's Sash", wowheadId: 32277, slot: "Waist", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Shadow-Walker's Cord", wowheadId: 32278, slot: "Waist", itemLevel: 141, archetype: "melee-leather" },
      { name: "Shoulderpads of the Stranger", wowheadId: 32279, slot: "Shoulders", itemLevel: 141, archetype: "tank-plate" },
    ]},
    { name: "Teron Gorefiend", items: [
      t6Helm("Helm of the Forgotten Conqueror", "conqueror"),
      t6Helm("Helm of the Forgotten Protector", "protector"),
      t6Helm("Helm of the Forgotten Vanquisher", "vanquisher"),
      { name: "Rifle of the Stoic Guardian", wowheadId: 32392, slot: "Gun", itemLevel: 141, archetype: "weapon-gun" },
      { name: "Softstep Boots of Tracking", wowheadId: 32280, slot: "Feet", itemLevel: 141, archetype: "ranged-hunter" },
      { name: "Ring of Calming Waves", wowheadId: 32281, slot: "Finger", itemLevel: 141, archetype: "jewel-heal" },
      { name: "Shroud of Forgiveness", wowheadId: 32282, slot: "Back", itemLevel: 141, archetype: "cloak-heal" },
      { name: "Wraps of Precise Flight", wowheadId: 32283, slot: "Wrist", itemLevel: 141, archetype: "ranged-hunter" },
    ]},
    { name: "Gurtogg Bloodboil", items: [
      t6Legs("Leggings of the Forgotten Conqueror", "conqueror"),
      t6Legs("Leggings of the Forgotten Protector", "protector"),
      t6Legs("Leggings of the Forgotten Vanquisher", "vanquisher"),
      { name: "Choker of Endless Nightmares", wowheadId: 32284, slot: "Neck", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Bloodlust Brooch", wowheadId: 32505, slot: "Trinket", itemLevel: 141, archetype: "trinket-melee" },
      { name: "Botanist's Gloves of Growth", wowheadId: 32285, slot: "Hands", itemLevel: 141, archetype: "heal-leather" },
      { name: "Bloodboil Gauntlets", wowheadId: 32286, slot: "Hands", itemLevel: 141, archetype: "tank-plate" },
      { name: "Syphon of the Nathrezim", wowheadId: 32378, slot: "Held In Off-hand", itemLevel: 141, archetype: "weapon-offhand-caster" },
      { name: "Robes of Rampant Growth", wowheadId: 32288, slot: "Chest", itemLevel: 141, archetype: "heal-cloth" },
    ]},
    { name: "Reliquary of Souls", items: [
      t6Chest("Chestguard of the Forgotten Conqueror", "conqueror"),
      t6Chest("Chestguard of the Forgotten Protector", "protector"),
      t6Chest("Chestguard of the Forgotten Vanquisher", "vanquisher"),
      { name: "Faceguard of the Endless Watch", wowheadId: 32289, slot: "Head", itemLevel: 141, archetype: "heal-mail" },
      { name: "Boots of Oceanic Fury", wowheadId: 32291, slot: "Feet", itemLevel: 141, archetype: "caster-mail" },
      { name: "Cord of Reconstruction", wowheadId: 32292, slot: "Waist", itemLevel: 141, archetype: "heal-cloth" },
      { name: "Switch of Chaotic Riftings", wowheadId: 32395, slot: "Wand", itemLevel: 141, archetype: "weapon-wand" },
      { name: "Dreamer's Dragonstaff", wowheadId: 32379, slot: "Staff", itemLevel: 141, archetype: "weapon-staff-heal" },
    ]},
    { name: "Mother Shahraz", items: [
      t6Shoulder("Pauldrons of the Forgotten Conqueror", "conqueror"),
      t6Shoulder("Pauldrons of the Forgotten Protector", "protector"),
      t6Shoulder("Pauldrons of the Forgotten Vanquisher", "vanquisher"),
      { name: "Star-Strider Boots", wowheadId: 32293, slot: "Feet", itemLevel: 141, archetype: "heal-leather" },
      { name: "Wand of Prismatic Focus", wowheadId: 32297, slot: "Wand", itemLevel: 141, archetype: "weapon-wand" },
      { name: "Shadowmoon Destroyer's Drape", wowheadId: 32294, slot: "Back", itemLevel: 141, archetype: "cloak-melee" },
      { name: "Boots of the Pious", wowheadId: 32295, slot: "Feet", itemLevel: 141, archetype: "heal-cloth" },
      { name: "Mithril Band of the Unscarred", wowheadId: 32296, slot: "Finger", itemLevel: 141, archetype: "jewel-tank" },
      { name: "Stormrage Signet Ring", wowheadId: 32298, slot: "Finger", itemLevel: 141, archetype: "jewel-melee" },
    ]},
    { name: "The Illidari Council", items: [
      t6Legs("Leggings of the Forgotten Conqueror", "conqueror"),
      t6Legs("Leggings of the Forgotten Protector", "protector"),
      t6Legs("Leggings of the Forgotten Vanquisher", "vanquisher"),
      { name: "The Maelstrom's Fury", wowheadId: 32374, slot: "One-Hand Axe", itemLevel: 146, archetype: "weapon-1h-melee" },
      { name: "Hope Ender", wowheadId: 32338, slot: "One-Hand Sword", itemLevel: 146, archetype: "weapon-1h-melee" },
      { name: "Dagger of Bad Mojo", wowheadId: 32299, slot: "Dagger", itemLevel: 146, archetype: "weapon-dagger-dps" },
      { name: "Robes of the Shattered Abyss", wowheadId: 32300, slot: "Chest", itemLevel: 146, archetype: "caster-cloth" },
      { name: "Crystalforge War-Helm", wowheadId: 32301, slot: "Head", itemLevel: 146, archetype: "tank-plate" },
      { name: "Shroud of the Highborne", wowheadId: 32302, slot: "Back", itemLevel: 146, archetype: "cloak-caster" },
      { name: "Girdle of the Invulnerable", wowheadId: 32303, slot: "Waist", itemLevel: 146, archetype: "tank-plate" },
    ]},
    { name: "Illidan Stormrage", items: [
      t6Helm("Helm of the Forgotten Conqueror", "conqueror"),
      t6Helm("Helm of the Forgotten Protector", "protector"),
      t6Helm("Helm of the Forgotten Vanquisher", "vanquisher"),
      { name: "Warglaive of Azzinoth (Main Hand)", wowheadId: 32837, slot: "One-Hand Sword", itemLevel: 156, archetype: "weapon-glaive" },
      { name: "Warglaive of Azzinoth (Off Hand)", wowheadId: 32838, slot: "One-Hand Sword", itemLevel: 156, archetype: "weapon-glaive" },
      { name: "Shroud of the Highborne", wowheadId: 32319, slot: "Back", itemLevel: 151, archetype: "cloak-caster" },
      { name: "Cowl of Benethek", wowheadId: 32313, slot: "Head", itemLevel: 151, archetype: "caster-leather" },
      { name: "Black Bow of the Betrayer", wowheadId: 32336, slot: "Bow", itemLevel: 151, archetype: "weapon-bow" },
      { name: "Boots of the Rejuvenating Flame", wowheadId: 32314, slot: "Feet", itemLevel: 151, archetype: "heal-mail" },
      { name: "Blind-Seers Icon", wowheadId: 32505, slot: "Trinket", itemLevel: 151, archetype: "trinket-caster" },
      { name: "Memento of Tyrande", wowheadId: 32501, slot: "Trinket", itemLevel: 151, archetype: "trinket-heal" },
      { name: "Crown of Empowered Fate", wowheadId: 32323, slot: "Head", itemLevel: 151, archetype: "heal-cloth" },
      { name: "The Skull of Gul'dan", wowheadId: 32483, slot: "Trinket", itemLevel: 151, archetype: "trinket-caster" },
    ]},
  ],
};

// -------------------------------------------------------------------------
// PHASE 4: Zul'Aman
// -------------------------------------------------------------------------

const zulAman: RaidDef = {
  name: "Zul'Aman",
  shortName: "ZA",
  bosses: [
    { name: "Nalorakk", items: [
      { name: "Bracers of the Forest Stalker", wowheadId: 33447, slot: "Wrist", itemLevel: 141, archetype: "ranged-hunter" },
      { name: "Wub's Cursed Hexblade", wowheadId: 33469, slot: "One-Hand Sword", itemLevel: 141, archetype: "weapon-1h-caster" },
      { name: "Amani Punisher", wowheadId: 33491, slot: "Two-Hand Mace", itemLevel: 141, archetype: "weapon-2h-str" },
      { name: "Shoulderpads of the Stranger", wowheadId: 33442, slot: "Shoulders", itemLevel: 141, archetype: "tank-plate" },
      { name: "Bracers of Righteous Fury", wowheadId: 33445, slot: "Wrist", itemLevel: 141, archetype: "melee-plate" },
      { name: "Shoulderpads of Vehemence", wowheadId: 33446, slot: "Shoulders", itemLevel: 141, archetype: "heal-cloth" },
    ]},
    { name: "Akil'zon", items: [
      { name: "Tuskbreaker", wowheadId: 33476, slot: "One-Hand Axe", itemLevel: 141, archetype: "weapon-1h-melee" },
      { name: "Belt of Natural Power", wowheadId: 33454, slot: "Waist", itemLevel: 141, archetype: "heal-leather" },
      { name: "Pendant of Paraxis", wowheadId: 33457, slot: "Neck", itemLevel: 141, archetype: "jewel-tank" },
      { name: "Bloodskin Destroyer", wowheadId: 33459, slot: "Two-Hand Axe", itemLevel: 141, archetype: "weapon-2h-agi" },
      { name: "Eagle-Lord Leggings", wowheadId: 33461, slot: "Legs", itemLevel: 141, archetype: "ranged-hunter" },
      { name: "Bloodstained Elven Chestpiece", wowheadId: 33463, slot: "Chest", itemLevel: 141, archetype: "melee-leather" },
    ]},
    { name: "Jan'alai", items: [
      { name: "Band of Devastation", wowheadId: 33466, slot: "Finger", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Amani'shi Protector's Mask", wowheadId: 33468, slot: "Head", itemLevel: 141, archetype: "tank-plate" },
      { name: "Dragonhawk Belt of Ferocity", wowheadId: 33472, slot: "Waist", itemLevel: 141, archetype: "melee-mail" },
      { name: "Hex Shrunken Head", wowheadId: 33829, slot: "Trinket", itemLevel: 141, archetype: "trinket-caster" },
      { name: "Gauntlets of Enforcement", wowheadId: 33474, slot: "Hands", itemLevel: 141, archetype: "melee-plate" },
      { name: "Leggings of the Immortal Beast", wowheadId: 33476, slot: "Legs", itemLevel: 141, archetype: "heal-leather" },
    ]},
    { name: "Halazzi", items: [
      { name: "Jin'rokh, the Breaker", wowheadId: 33491, slot: "Two-Hand Mace", itemLevel: 141, archetype: "weapon-2h-str" },
      { name: "Totem of the Maelstrom", wowheadId: 33506, slot: "Totem", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Amani Mask of Death", wowheadId: 33479, slot: "Head", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Belt of Natural Power", wowheadId: 33482, slot: "Waist", itemLevel: 141, archetype: "heal-leather" },
      { name: "Scepter of Unholy Vigor", wowheadId: 33485, slot: "One-Hand Mace", itemLevel: 141, archetype: "weapon-mace-heal" },
      { name: "Thunderstorm Amulet", wowheadId: 33496, slot: "Neck", itemLevel: 141, archetype: "jewel-caster" },
    ]},
    { name: "Hex Lord Malacrass", items: [
      { name: "Vest of Mounting Assault", wowheadId: 33507, slot: "Chest", itemLevel: 141, archetype: "melee-leather" },
      { name: "Belt of Depravity", wowheadId: 33502, slot: "Waist", itemLevel: 141, archetype: "caster-cloth" },
      { name: "Berserker's Call", wowheadId: 33832, slot: "Trinket", itemLevel: 141, archetype: "trinket-melee" },
      { name: "Hex Lord's Malachite Ring", wowheadId: 33503, slot: "Finger", itemLevel: 141, archetype: "jewel-melee" },
      { name: "Shadowfury Signet", wowheadId: 33504, slot: "Finger", itemLevel: 141, archetype: "jewel-caster" },
      { name: "Amani Divining Staff", wowheadId: 33508, slot: "Staff", itemLevel: 141, archetype: "weapon-staff-heal" },
    ]},
    { name: "Zul'jin", items: [
      { name: "Amani Punisher", wowheadId: 33511, slot: "Two-Hand Mace", itemLevel: 146, archetype: "weapon-2h-str" },
      { name: "Dagger of Bad Mojo", wowheadId: 33512, slot: "Dagger", itemLevel: 146, archetype: "weapon-dagger-dps" },
      { name: "Golden Staff of the Sin'dorei", wowheadId: 33513, slot: "Staff", itemLevel: 146, archetype: "weapon-staff-caster" },
      { name: "Band of the Swift Paw", wowheadId: 33515, slot: "Finger", itemLevel: 146, archetype: "jewel-melee" },
      { name: "Cloak of the Betrayed", wowheadId: 33517, slot: "Back", itemLevel: 146, archetype: "cloak-heal" },
      { name: "Zul'jin's Gauntlets of Triumph", wowheadId: 33518, slot: "Hands", itemLevel: 146, archetype: "melee-plate" },
      { name: "Talonstrike", wowheadId: 33519, slot: "Bow", itemLevel: 146, archetype: "weapon-bow" },
      { name: "Boneweave Girdle", wowheadId: 33520, slot: "Waist", itemLevel: 146, archetype: "ranged-hunter" },
    ]},
  ],
};

// -------------------------------------------------------------------------
// PHASE 5: Sunwell Plateau
// -------------------------------------------------------------------------

const sunwell: RaidDef = {
  name: "Sunwell Plateau",
  shortName: "SWP",
  bosses: [
    { name: "Kalecgos", items: [
      { name: "Sunfire Handwraps", wowheadId: 34193, slot: "Hands", itemLevel: 154, archetype: "caster-cloth" },
      { name: "Luminescent Rod of the Naaru", wowheadId: 34179, slot: "Staff", itemLevel: 154, archetype: "weapon-staff-heal" },
      { name: "Shadow-Armor Legguards", wowheadId: 34170, slot: "Legs", itemLevel: 154, archetype: "caster-cloth" },
      { name: "Sun-Forged Cleaver", wowheadId: 34199, slot: "One-Hand Axe", itemLevel: 154, archetype: "weapon-1h-melee" },
      { name: "Spectral Kris", wowheadId: 34201, slot: "Dagger", itemLevel: 154, archetype: "weapon-dagger-dps" },
      { name: "Bladed Chaos Tunic", wowheadId: 34177, slot: "Chest", itemLevel: 154, archetype: "melee-leather" },
      { name: "Crystalforge Gauntlets", wowheadId: 34182, slot: "Hands", itemLevel: 154, archetype: "heal-plate" },
    ]},
    { name: "Brutallus", items: [
      { name: "Angelista's Sash", wowheadId: 34241, slot: "Waist", itemLevel: 154, archetype: "caster-cloth" },
      { name: "Archaic Charm of Presence", wowheadId: 34229, slot: "Neck", itemLevel: 154, archetype: "jewel-melee" },
      { name: "Bracers of the Forest Stalker", wowheadId: 34235, slot: "Wrist", itemLevel: 154, archetype: "ranged-hunter" },
      { name: "Brutal Gauntlets of Ruin", wowheadId: 34239, slot: "Hands", itemLevel: 154, archetype: "tank-plate" },
      { name: "Cover of Ursoc the Mighty", wowheadId: 34242, slot: "Chest", itemLevel: 154, archetype: "tank-bear" },
      { name: "Crystal Spire of Karabor", wowheadId: 34347, slot: "One-Hand Mace", itemLevel: 154, archetype: "weapon-mace-heal" },
      { name: "Hand of the Deceiver", wowheadId: 34211, slot: "Two-Hand Sword", itemLevel: 154, archetype: "weapon-2h-melee" },
    ]},
    { name: "Felmyst", items: [
      { name: "Golden Limb Bands", wowheadId: 34354, slot: "Wrist", itemLevel: 154, archetype: "heal-cloth" },
      { name: "Grand Magister's Staff of Torrents", wowheadId: 34336, slot: "Staff", itemLevel: 154, archetype: "weapon-staff-caster" },
      { name: "Handguards of Defiled Worlds", wowheadId: 34244, slot: "Hands", itemLevel: 154, archetype: "melee-leather" },
      { name: "Shivering Felspine", wowheadId: 34347, slot: "Staff", itemLevel: 154, archetype: "weapon-staff-feral" },
      { name: "Shell of Shifting Planes", wowheadId: 34359, slot: "Trinket", itemLevel: 154, archetype: "trinket-tank" },
      { name: "Shoulderpads of Vehemence", wowheadId: 34350, slot: "Shoulders", itemLevel: 154, archetype: "heal-cloth" },
      { name: "Amice of Brilliant Light", wowheadId: 34353, slot: "Shoulders", itemLevel: 154, archetype: "heal-cloth" },
    ]},
    { name: "The Eredar Twins", items: [
      { name: "Apolyon, the Soul-Render", wowheadId: 34247, slot: "Two-Hand Axe", itemLevel: 154, archetype: "weapon-2h-melee" },
      { name: "Bracers of the Forgotten Conqueror", wowheadId: 34429, slot: "Wrist (Token)", itemLevel: 154, archetype: "token-conqueror" },
      { name: "Bracers of the Forgotten Protector", wowheadId: 34430, slot: "Wrist (Token)", itemLevel: 154, archetype: "token-protector" },
      { name: "Bracers of the Forgotten Vanquisher", wowheadId: 34431, slot: "Wrist (Token)", itemLevel: 154, archetype: "token-vanquisher" },
      { name: "Hanzo Sword", wowheadId: 34247, slot: "One-Hand Sword", itemLevel: 154, archetype: "weapon-1h-melee" },
      { name: "Leggings of the Pursuit", wowheadId: 34248, slot: "Legs", itemLevel: 154, archetype: "melee-leather" },
      { name: "Robes of Faltered Light", wowheadId: 34249, slot: "Chest", itemLevel: 154, archetype: "heal-cloth" },
      { name: "Sin'dorei Band of Salvation", wowheadId: 34250, slot: "Finger", itemLevel: 154, archetype: "jewel-heal" },
    ]},
    { name: "M'uru", items: [
      { name: "Belt of the Forgotten Conqueror", wowheadId: 34429, slot: "Waist (Token)", itemLevel: 159, archetype: "token-conqueror" },
      { name: "Belt of the Forgotten Protector", wowheadId: 34430, slot: "Waist (Token)", itemLevel: 159, archetype: "token-protector" },
      { name: "Belt of the Forgotten Vanquisher", wowheadId: 34431, slot: "Waist (Token)", itemLevel: 159, archetype: "token-vanquisher" },
      { name: "Boots of the Forgotten Conqueror", wowheadId: 34432, slot: "Feet (Token)", itemLevel: 159, archetype: "token-conqueror" },
      { name: "Boots of the Forgotten Protector", wowheadId: 34433, slot: "Feet (Token)", itemLevel: 159, archetype: "token-protector" },
      { name: "Boots of the Forgotten Vanquisher", wowheadId: 34434, slot: "Feet (Token)", itemLevel: 159, archetype: "token-vanquisher" },
      { name: "Muramasa", wowheadId: 34247, slot: "One-Hand Sword", itemLevel: 159, archetype: "weapon-1h-melee" },
      { name: "Crux of the Apocalypse", wowheadId: 34347, slot: "Held In Off-hand", itemLevel: 159, archetype: "weapon-offhand-caster" },
      { name: "Fang of Kalecgos", wowheadId: 34347, slot: "Dagger", itemLevel: 159, archetype: "weapon-dagger-caster" },
      { name: "Slayer's Crest", wowheadId: 34347, slot: "Trinket", itemLevel: 159, archetype: "trinket-melee" },
    ]},
    { name: "Kil'jaeden", items: [
      { name: "Thori'dal, the Stars' Fury", wowheadId: 34334, slot: "Bow", itemLevel: 164, archetype: "weapon-bow" },
      { name: "Apolyon, the Soul-Render", wowheadId: 34335, slot: "Two-Hand Axe", itemLevel: 164, archetype: "weapon-2h-melee" },
      { name: "Golden Staff of the Sin'dorei", wowheadId: 34336, slot: "Staff", itemLevel: 164, archetype: "weapon-staff-caster" },
      { name: "Hammer of Sanctification", wowheadId: 34847, slot: "One-Hand Mace", itemLevel: 164, archetype: "weapon-mace-heal" },
      { name: "Scythe of the Unmaker", wowheadId: 34342, slot: "Polearm", itemLevel: 164, archetype: "weapon-polearm" },
      { name: "Shroud of Redeemed Souls", wowheadId: 34351, slot: "Back", itemLevel: 164, archetype: "cloak-caster" },
      { name: "Kil'jaeden's Cunning", wowheadId: 34355, slot: "Trinket", itemLevel: 164, archetype: "trinket-caster" },
      { name: "Apostle of Argus", wowheadId: 34198, slot: "Held In Off-hand", itemLevel: 164, archetype: "weapon-offhand-caster" },
      { name: "Cover of Ursoc the Mighty", wowheadId: 34242, slot: "Chest", itemLevel: 164, archetype: "tank-bear" },
      { name: "Crystal-Infused Tunic", wowheadId: 34161, slot: "Chest", itemLevel: 164, archetype: "melee-leather" },
      { name: "Sin'dorei Pendant of Triumph", wowheadId: 34359, slot: "Neck", itemLevel: 164, archetype: "jewel-melee" },
    ]},
  ],
};

export const TBC_DATA: PhaseDef[] = [
  { name: "Phase 1", raids: [karazhan, gruulsLair, magtheridonsLair] },
  { name: "Phase 2", raids: [ssc, tempestKeep] },
  { name: "Phase 3", raids: [hyjal, blackTemple] },
  { name: "Phase 4", raids: [zulAman] },
  { name: "Phase 5", raids: [sunwell] },
];
