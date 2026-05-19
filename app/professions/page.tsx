import { prisma } from "@/lib/db";
import ProfessionsClient, { type ProfessionGroup, type Crafter } from "./ProfessionsClient";

export const dynamic = "force-dynamic";

// Which profession a pattern belongs to is encoded in its `notes`
// field (e.g. "Tailoring 375 — crafts Belt of Blasting (BoE).").
// We parse that prefix to bucket the items.
const PROFESSIONS = [
  { key: "Tailoring",       label: "Tailoring",       blurb: "Cloth belts and boots — best in slot for casters." },
  { key: "Leatherworking",  label: "Leatherworking",  blurb: "Leather and mail patterns for rogues, druids, hunters, shaman." },
  { key: "Blacksmithing",   label: "Blacksmithing",   blurb: "Plate plans — tank and DPS belts and boots for warriors and paladins." },
] as const;

function professionOfNotes(notes: string | null): string | null {
  if (!notes) return null;
  for (const p of PROFESSIONS) if (notes.startsWith(p.key)) return p.key;
  return null;
}

// "Pattern: Boots of Blasting" → "Boots of Blasting".
// "Plans: Red Belt of Battle" → "Red Belt of Battle".
function craftedItemName(patternName: string): string {
  return patternName.replace(/^(Pattern|Plans):\s*/i, "");
}

/**
 * Reads the binding of the *crafted* item out of the pattern's notes
 * (e.g. "Tailoring 375 — crafts Belt of Blasting (BoE). World drop,
 * BoP." → "boe"). Defaults to "boe" when no marker is found, since the
 * vast majority of profession patterns produce BoE gear.
 */
function craftedBinding(notes: string | null): "boe" | "bop" {
  if (!notes) return "boe";
  // Match the first "(BoE)" or "(BoP)" inside the "crafts …" portion —
  // ignore the trailing "BoP" that just notes the pattern's own bind.
  const m = notes.match(/crafts[^.]*?\((BoE|BoP)\)/i);
  if (!m) return "boe";
  return m[1].toLowerCase() === "bop" ? "bop" : "boe";
}

export default async function ProfessionsPage() {
  const patterns = await prisma.item.findMany({
    where: { slot: { in: ["Pattern", "Plans"] } },
    orderBy: { name: "asc" },
    include: {
      awards: {
        orderBy: { awardedAt: "asc" },
        include: {
          character: { include: { player: true } },
        },
      },
    },
  });

  // Bucket patterns into the three professions. Items whose notes
  // don't start with a known profession name (or have no notes at
  // all) are silently dropped — they shouldn't exist post
  // corrections-008.sql.
  const bucket: Record<string, typeof patterns> = {
    Tailoring: [],
    Leatherworking: [],
    Blacksmithing: [],
  };
  for (const item of patterns) {
    const prof = professionOfNotes(item.notes);
    if (prof) bucket[prof].push(item);
  }

  const groups: ProfessionGroup[] = PROFESSIONS.map(p => ({
    key: p.key,
    label: p.label,
    blurb: p.blurb,
    items: (bucket[p.key] ?? []).map(item => {
      // Dedupe crafters by characterId so re-awards (rare) don't
      // double-count.
      const owners = new Map<number, Crafter>();
      for (const a of item.awards) {
        if (owners.has(a.characterId)) continue;
        owners.set(a.characterId, {
          id: a.character.id,
          name: a.character.name,
          class: a.character.class,
          spec: a.character.spec,
          playerId: a.character.playerId,
          playerName: a.character.player?.displayName ?? null,
        });
      }
      return {
        id: item.id,
        name: item.name,
        craftedItemName: craftedItemName(item.name),
        wowheadId: item.wowheadId,
        crafters: [...owners.values()],
        binding: craftedBinding(item.notes),
      };
    }),
  }));

  return <ProfessionsClient groups={groups} totalItems={patterns.length} />;
}
