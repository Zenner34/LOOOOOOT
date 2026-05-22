import { prisma } from "@/lib/db";
import { lootAwardPhaseWhere, parsePhaseParam } from "@/lib/phases";
import { isAdmin } from "@/lib/auth";
import OverviewClient from "./OverviewClient";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { roster?: string; bucket?: string; phase?: string };
}) {
  const phaseFilter = parsePhaseParam(searchParams.phase);
  const rosters = await prisma.roster.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      members: { include: { character: true } },
    },
  });
  const selectedRosterId =
    searchParams.roster === "all" ? "all" : Number(searchParams.roster) || rosters[0]?.id || 0;

  const characterIds = (() => {
    if (selectedRosterId === "all") return null;
    const r = rosters.find(x => x.id === selectedRosterId);
    return r ? r.members.map(m => m.characterId) : [];
  })();

  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    select: { order: true, name: true },
  });

  const awards = await prisma.lootAward.findMany({
    where: {
      ...(selectedRosterId !== "all" ? { rosterId: selectedRosterId } : {}),
      ...(characterIds && characterIds.length ? { characterId: { in: characterIds } } : {}),
      ...lootAwardPhaseWhere(phaseFilter),
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

  // Pull all players (including inactive). The client-side filter controls
  // whether inactive rows are shown — defaults to active-only.
  const players = await prisma.player.findMany({
    orderBy: { displayName: "asc" },
  });

  const admin = await isAdmin();

  return (
    <OverviewClient
      admin={admin}
      rosters={rosters.map(r => ({ id: r.id, name: r.name }))}
      selectedRosterId={selectedRosterId}
      characters={characters.map(c => ({
        id: c.id,
        name: c.name,
        class: c.class,
        spec: c.spec,
        role: c.role,
        playerId: c.playerId,
        isMain: c.isMain,
        active: c.active,
        wclBestPerfAvg: c.wclBestPerfAvg,
        wclMedianPerfAvg: c.wclMedianPerfAvg,
        wclKillsLogged: c.wclKillsLogged,
        wclUpdatedAt: c.wclUpdatedAt,
      }))}
      players={players.map(p => ({
        id: p.id,
        displayName: p.displayName,
        active: p.active,
      }))}
      awards={awards as any}
      phases={phases}
      phaseFilterParam={searchParams.phase ?? null}
    />
  );
}
