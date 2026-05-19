import Link from "next/link";
import { prisma } from "@/lib/db";
import { WowheadLink } from "@/lib/wowhead";
import { CLASS_COLOR } from "@/lib/specs";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Hammer } from "@/app/components/ui/Icon";

export const dynamic = "force-dynamic";

// Which profession a pattern belongs to is encoded in its `notes`
// field (e.g. "Tailoring 375 — crafts Belt of Blasting (BoE).").
// We parse that prefix to bucket the items.
const PROFESSIONS = [
  { key: "Tailoring",       label: "Tailoring",       blurb: "Cloth belts and boots — best in slot for casters." },
  { key: "Leatherworking",  label: "Leatherworking",  blurb: "Leather and mail patterns for rogues, druids, hunters, shaman." },
  { key: "Blacksmithing",   label: "Blacksmithing",   blurb: "Plate plans — tank and DPS belts and boots for warriors and paladins." },
] as const;

type ProfessionKey = (typeof PROFESSIONS)[number]["key"];

function professionOfNotes(notes: string | null): ProfessionKey | null {
  if (!notes) return null;
  for (const p of PROFESSIONS) if (notes.startsWith(p.key)) return p.key;
  return null;
}

/**
 * "Pattern: Boots of Blasting" → "Boots of Blasting".
 * "Plans: Red Belt of Battle" → "Red Belt of Battle".
 * Falls back to the full name when the prefix is unexpected.
 */
function craftedItemName(patternName: string): string {
  return patternName.replace(/^(Pattern|Plans):\s*/i, "");
}

export default async function ProfessionsPage() {
  // Pull every pattern / plan with its owners. LootAward join is left so
  // a recipe with zero owners still shows on the page with an empty
  // "Crafted by" state.
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

  // Bucket by profession. Dedupe owners by characterId because a player
  // might be awarded the same pattern twice (rare, but harmless to
  // collapse — once you know it, you know it).
  const byProfession = new Map<ProfessionKey, typeof patterns>();
  for (const p of PROFESSIONS) byProfession.set(p.key, []);
  for (const item of patterns) {
    const prof = professionOfNotes(item.notes);
    if (prof) byProfession.get(prof)!.push(item);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Crafters"
        title="Professions"
        subtitle="Who can craft each BoE belt / boots recipe drop from SSC and Tempest Keep. Patterns are bound — only the player who looted it can craft."
      />

      {PROFESSIONS.map(p => {
        const items = byProfession.get(p.key) ?? [];
        if (items.length === 0) return null;
        return (
          <section key={p.key} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{p.label}</h2>
              <p className="text-sm text-neutral-400 mt-0.5">{p.blurb}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => {
                // Dedupe crafters by characterId — a pattern is one-and-done.
                const owners = new Map<number, typeof item.awards[number]["character"]>();
                for (const a of item.awards) if (!owners.has(a.characterId)) owners.set(a.characterId, a.character);
                const crafters = [...owners.values()];

                return (
                  <article
                    key={item.id}
                    className="panel p-4 flex flex-col gap-3"
                  >
                    <header>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-0.5">
                        Crafts
                      </div>
                      <WowheadLink
                        name={craftedItemName(item.name)}
                        wowheadId={item.wowheadId}
                        iconSize={24}
                        className="text-base font-semibold"
                      />
                    </header>

                    <div className="flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1.5">
                        Crafted by · {crafters.length}
                      </div>
                      {crafters.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic">
                          No one has this pattern yet.
                        </p>
                      ) : (
                        <ul className="space-y-1">
                          {crafters.map(c => (
                            <li key={c.id}>
                              <Link
                                href={`/players/${c.playerId ?? ""}`}
                                className="inline-flex items-center gap-2 text-sm hover:underline"
                              >
                                <span
                                  className="font-semibold"
                                  style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}
                                >
                                  {c.name}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {c.player?.displayName && c.player.displayName !== c.name
                                    ? `${c.player.displayName} · ${c.spec}`
                                    : c.spec}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {patterns.length === 0 && (
        <EmptyState
          icon={Hammer}
          title="No patterns in the catalog yet"
          description="Patterns drop from SSC and TK trash. Run data/corrections-008.sql to seed the catalog, then award them via the loot page as they drop."
        />
      )}
    </div>
  );
}
