import { prisma } from "@/lib/db";
import { specializationForCraftedItem, CRAFTING_ELIGIBILITY_OVERRIDES } from "@/lib/loot";
import ProfessionsClient, {
  type ProfessionGroup,
  type Crafter,
  type CraftedCard,
} from "./ProfessionsClient";

export const dynamic = "force-dynamic";

// Which profession a crafted output / pattern belongs to is encoded in its
// `notes` field (e.g. "Tailoring 375 — crafts Belt of Blasting (BoE)." or
// "Crafted from Nether Vortex — Blacksmithing 375. BoE."). Parsing the
// notes is the only signal we have, so we look for the profession name
// anywhere in the string rather than insisting on a prefix.
const PROFESSIONS = [
  { key: "Tailoring",      label: "Tailoring",      blurb: "Cloth belts and boots — best in slot for casters." },
  { key: "Leatherworking", label: "Leatherworking", blurb: "Leather and mail patterns for rogues, druids, hunters, shaman." },
  { key: "Blacksmithing",  label: "Blacksmithing",  blurb: "Plate plans, BoE belts, and the Master-specialization weapons." },
] as const;
type ProfKey = (typeof PROFESSIONS)[number]["key"];

function professionOfNotes(notes: string | null): ProfKey | null {
  if (!notes) return null;
  for (const p of PROFESSIONS) if (notes.includes(p.key)) return p.key;
  return null;
}

/** "Pattern: Boots of Blasting" → "Boots of Blasting"; otherwise unchanged. */
function craftedItemName(patternName: string): string {
  return patternName.replace(/^(Pattern|Plans):\s*/i, "");
}

/** Look at a pattern or crafted-output's notes and return the binding of the
 *  *crafted* item (BoE vs BoP). Defaults to BoE when no marker matches. */
function craftedBinding(notes: string | null): "boe" | "bop" {
  if (!notes) return "boe";
  // For patterns the marker lives inside "crafts ... (BoE|BoP)".
  const craftsMatch = notes.match(/crafts[^.]*?\((BoE|BoP)\)/i);
  if (craftsMatch) return craftsMatch[1].toLowerCase() === "bop" ? "bop" : "boe";
  // For crafted-output items the binding is the last token in the notes
  // (e.g. "Crafted from Nether Vortex — Blacksmithing 375. BoP.").
  const tail = notes.match(/\b(BoE|BoP)\b\.?\s*$/);
  if (tail) return tail[1].toLowerCase() === "bop" ? "bop" : "boe";
  return "boe";
}

export default async function ProfessionsPage() {
  // Load patterns (recipe drops) and crafted-output items in parallel.
  // The crafted-output side is matched by name = craftedItemName(pattern.name)
  // OR by appearing under the "Crafted (Nether Vortex)" boss section (for
  // weapons that have no dropped pattern).
  const [patterns, craftedFromVortex, charsWithSpecs, charsWithLoot] = await Promise.all([
    prisma.item.findMany({
      where: { slot: { in: ["Pattern", "Plans"] } },
      orderBy: { name: "asc" },
      include: {
        awards: {
          orderBy: { awardedAt: "asc" },
          include: { character: { include: { player: true } } },
        },
      },
    }),
    prisma.item.findMany({
      where: { boss: { name: "Crafted (Nether Vortex)" } },
      orderBy: { name: "asc" },
      include: {
        weights: true,
        awards: {
          orderBy: { awardedAt: "asc" },
          include: { character: { include: { player: true } } },
        },
      },
    }),
    prisma.character.findMany({
      where: { craftedSpecializations: { isEmpty: false } },
      include: { player: true },
    }),
    // Active characters who've been awarded at least one gear item (anything
    // that isn't a Pattern/Plans recipe). These are the candidates for the
    // "Needs crafting" list on each item card.
    prisma.character.findMany({
      where: {
        active: true,
        awards: { some: { item: { slot: { notIn: ["Pattern", "Plans"] } } } },
      },
      include: { player: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Index crafted outputs by name for cheap "what's the output of this pattern" lookups.
  const outputByName = new Map(craftedFromVortex.map(o => [o.name, o]));

  // Build one card per *crafted item*. Start from patterns (so belts/boots
  // both get a card even if no one has been awarded the output yet), then
  // add the vortex weapons that have no corresponding pattern.
  const cards: CraftedCard[] = [];
  const seenCraftedNames = new Set<string>();

  // Helper: derive the "Needs crafting" list for an item. Default eligibility
  // is the item's ItemWeight rows (seeded from the archetype). Named overrides
  // in CRAFTING_ELIGIBILITY_OVERRIDES take precedence — see lib/loot.ts.
  // Excluded: characters who've already been awarded the crafted item.
  function buildNeedsCrafting(
    itemName: string,
    weights: Array<{ spec: string; weight: number }>,
    craftedIds: Set<number>,
  ): Crafter[] {
    const override = CRAFTING_ELIGIBILITY_OVERRIDES[itemName];
    const eligible = override
      ? new Set(override)
      : new Set(weights.filter(w => w.weight > 0).map(w => w.spec));
    if (eligible.size === 0) return [];
    return dedupeCharacters(
      charsWithLoot.filter(c => eligible.has(c.spec) && !craftedIds.has(c.id)),
    );
  }

  for (const p of patterns) {
    const profession = professionOfNotes(p.notes);
    if (!profession) continue; // ignore patterns that don't tag a profession
    const craftName = craftedItemName(p.name);
    const output = outputByName.get(craftName);
    seenCraftedNames.add(craftName);

    const canCraft = dedupeCharacters(p.awards.map(a => a.character));
    const crafted = output ? dedupeCharacters(output.awards.map(a => a.character)) : [];
    const craftedIds = new Set(crafted.map(c => c.id));
    const needsCrafting = output ? buildNeedsCrafting(craftName, output.weights, craftedIds) : [];

    cards.push({
      key: `pattern-${p.id}`,
      profession,
      itemName: craftName,
      wowheadId: output?.wowheadId ?? p.wowheadId, // prefer the crafted-item wowhead
      binding: craftedBinding(p.notes),
      canCraftLabel: null, // pattern-gated
      canCraft,
      crafted,
      needsCrafting,
    });
  }

  // Weapons: items in the Crafted (Nether Vortex) section whose name has no
  // matching pattern (Stormherald, Lionheart Executioner, etc.). "Can craft"
  // comes from Character.craftedSpecializations.
  for (const o of craftedFromVortex) {
    if (seenCraftedNames.has(o.name)) continue;
    const profession = professionOfNotes(o.notes);
    if (!profession) continue;
    const spec = specializationForCraftedItem(o.name);
    const canCraft: Crafter[] = spec
      ? dedupeCharacters(charsWithSpecs.filter(c => c.craftedSpecializations.includes(spec)))
      : [];
    const crafted = dedupeCharacters(o.awards.map(a => a.character));
    const craftedIds = new Set(crafted.map(c => c.id));
    const needsCrafting = buildNeedsCrafting(o.name, o.weights, craftedIds);
    cards.push({
      key: `crafted-${o.id}`,
      profession,
      itemName: o.name,
      wowheadId: o.wowheadId,
      binding: craftedBinding(o.notes),
      canCraftLabel: spec ?? null,
      canCraft,
      crafted,
      needsCrafting,
    });
  }

  // Group by profession; preserve PROFESSIONS order and alphabetical items.
  const groups: ProfessionGroup[] = PROFESSIONS.map(p => ({
    key: p.key,
    label: p.label,
    blurb: p.blurb,
    items: cards
      .filter(c => c.profession === p.key)
      .sort((a, b) => a.itemName.localeCompare(b.itemName)),
  }));

  const totalItems = cards.length;
  return <ProfessionsClient groups={groups} totalItems={totalItems} />;
}

// Deduplicate by character id and shape to Crafter for the client. Handles
// inputs whose awards landed multiple times to the same character (rare for
// patterns, more common if a crafted item is re-awarded by mistake).
function dedupeCharacters(input: Array<{ id: number; name: string; class: string; spec: string; playerId: number | null; player?: { displayName: string } | null }>): Crafter[] {
  const seen = new Map<number, Crafter>();
  for (const c of input) {
    if (seen.has(c.id)) continue;
    seen.set(c.id, {
      id: c.id,
      name: c.name,
      class: c.class,
      spec: c.spec,
      playerId: c.playerId,
      playerName: c.player?.displayName ?? null,
    });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
