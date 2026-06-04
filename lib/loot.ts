// Shared loot taxonomy used across the app.
//
// `Pattern` and `Plans` items are *recipe drops* — they unlock the ability
// to craft a piece of gear, but they aren't gear themselves. They get
// excluded from totals on the Overview tab and surface separately on the
// Professions tab (and below the items divider in each loot drilldown).
// Everything else — including the crafted output items from those recipes
// (belts, boots, weapons) — still counts as real loot.

const NON_GEAR_SLOTS: ReadonlySet<string> = new Set(["Pattern", "Plans"]);

/** True when the award should count toward a player's loot total. */
export function isCountableLoot(item: { slot?: string | null }): boolean {
  if (!item.slot) return true;
  return !NON_GEAR_SLOTS.has(item.slot);
}

/** True when the award is a recipe (Pattern / Plans). */
export function isPatternItem(item: { slot?: string | null }): boolean {
  return !!item.slot && NON_GEAR_SLOTS.has(item.slot);
}

// ────────────────────────────────────────────────────────────────────────
// Blacksmithing weapon specializations.
//
// In-game these are mutually exclusive choices that gate which BS weapons
// a smith can craft. We store them on Character.craftedSpecializations as
// a string[]; admins toggle them from the Characters tab. The mapping
// below drives the "Can craft (N)" list on the Professions tab for items
// that don't have a dropped pattern (only specialization gates them).

export type Specialization =
  | "Master Hammersmith"
  | "Master Swordsmith"
  | "Master Axesmith";

export const SPECIALIZATIONS: readonly Specialization[] = [
  "Master Hammersmith",
  "Master Swordsmith",
  "Master Axesmith",
] as const;

/** Maps a crafted item name to the specialization that gates crafting it.
 *  Returns null for items whose "Can craft" list is sourced from patterns
 *  instead (belts/boots). */
export function specializationForCraftedItem(itemName: string): Specialization | null {
  switch (itemName) {
    case "Stormherald":               return "Master Hammersmith";
    case "Lionheart Executioner":
    case "Blazefury":
    case "Bloodmoon":                 return "Master Swordsmith";
    case "Wicked Edge of the Planes":
    case "Dragonstrike":              return "Master Axesmith";
    default:                          return null;
  }
}

// ────────────────────────────────────────────────────────────────────────
// "Needs crafting" eligibility — per-item overrides.
//
// The Professions tab's "Needs crafting" column defaults to each item's
// ItemWeight rows (seeded from the archetype). Guild policy sometimes
// broadens that — Belt of Blasting is a cloth +hit belt that mages /
// warlocks / shadow priests roll on by default, but Elemental Shamans and
// Balance Druids also chase it as an off-piece for hit-rating. Add named
// overrides here when the strict archetype list undercounts who should be
// on a card's "Needs crafting" list. Items without an entry fall back to
// archetype eligibility.

export const CRAFTING_ELIGIBILITY_OVERRIDES: Record<string, readonly string[]> = {
  "Belt of Blasting": [
    "Arcane Mage", "Fire Mage", "Frost Mage",
    "Affliction Warlock", "Demonology Warlock", "Destruction Warlock",
    "Shadow Priest",
    "Elemental Shaman",
    "Balance Druid",
  ],
};
