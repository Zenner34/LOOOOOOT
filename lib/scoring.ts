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
