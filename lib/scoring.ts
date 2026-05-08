// Per-character weighted loot score.
// For every award a character has, look up the item's weight for that character's
// spec (via the item's ItemWeight rows). Sum = weighted score.
// We also expose a helper that returns the breakdown for drilldown views.

export type ScoringAward = {
  id: number;
  awardedAt: Date | string;
  item: {
    id: number;
    name: string;
    wowheadId?: number | null;
    slot?: string | null;
    boss?: { name: string; raid?: { shortName: string; name: string } } | null;
    weights: Array<{ spec: string; weight: number }>;
  };
};

export function weightFor(award: ScoringAward, spec: string): number {
  return award.item.weights.find(w => w.spec === spec)?.weight ?? 0;
}

export function weightedScore(spec: string, awards: ScoringAward[]): number {
  let sum = 0;
  for (const a of awards) sum += weightFor(a, spec);
  return sum;
}

export function itemCount(awards: ScoringAward[]): number {
  return awards.length;
}

// For a Player who owns multiple Characters, compute the score by attributing
// each award to the spec it most rewards across all the player's characters.
// This avoids penalising "I gave my hunter cloak to my mage alt" — the award
// is scored against whichever spec values it most.
export function bestSpecScore(
  awards: ScoringAward[],
  awardCharIdMap: Map<number, number>, // award.id -> characterId
  charSpecs: Map<number, string>,       // characterId -> spec
): number {
  let sum = 0;
  for (const a of awards) {
    const charId = awardCharIdMap.get(a.id);
    if (charId == null) continue;
    // Score against the awarded character's actual spec (loot was given to them).
    const spec = charSpecs.get(charId);
    if (!spec) continue;
    sum += weightFor(a, spec);
  }
  return sum;
}
