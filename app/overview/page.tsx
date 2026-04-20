import { prisma } from "@/lib/db";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { roster?: string; role?: string };
}) {
  const rosters = await prisma.roster.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      members: { include: { character: true } },
    },
  });
  const selectedRosterId =
    searchParams.roster === "all" ? "all" : Number(searchParams.roster) || rosters[0]?.id || 0;

  // If a specific roster is selected, gather that roster's members. For "all"
  // mode we use every character that has awards or is on any roster.
  const characterIds = (() => {
    if (selectedRosterId === "all") return null;
    const r = rosters.find(x => x.id === selectedRosterId);
    return r ? r.members.map(m => m.characterId) : [];
  })();

  const awards = await prisma.lootAward.findMany({
    where: {
      ...(selectedRosterId !== "all" ? { rosterId: selectedRosterId } : {}),
      ...(characterIds && characterIds.length ? { characterId: { in: characterIds } } : {}),
    },
    include: {
      item: {
        include: {
          weights: true,
          boss: { include: { raid: true } },
        },
      },
      character: true,
      roster: true,
      raidNight: true,
    },
    orderBy: { awardedAt: "desc" },
  });

  // Pull all characters (for the "all" view) or roster members.
  const characters = selectedRosterId === "all"
    ? await prisma.character.findMany({ orderBy: { name: "asc" } })
    : (rosters.find(r => r.id === selectedRosterId)?.members.map(m => m.character) ?? []);

  return (
    <OverviewClient
      rosters={rosters.map(r => ({ id: r.id, name: r.name }))}
      selectedRosterId={selectedRosterId}
      characters={characters}
      awards={awards as any}
    />
  );
}
