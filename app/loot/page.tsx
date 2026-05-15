import { prisma } from "@/lib/db";
import { CLASS_COLOR } from "@/lib/specs";
import { parsePhaseParam, phaseMatches } from "@/lib/phases";
import LootBrowser from "./LootBrowser";

export const dynamic = "force-dynamic";

export default async function LootPage({
  searchParams,
}: {
  searchParams: { phase?: string; raid?: string; boss?: string };
}) {
  const phases = await prisma.phase.findMany({
    orderBy: { order: "asc" },
    include: {
      raids: {
        orderBy: { order: "asc" },
        include: { bosses: { orderBy: { order: "asc" } } },
      },
    },
  });

  const phaseFilter = parsePhaseParam(searchParams.phase);
  const selectedRaidId = Number(searchParams.raid ?? 0);
  const selectedBossId = Number(searchParams.boss ?? 0);

  let items: any[] = [];
  if (selectedBossId) {
    items = await prisma.item.findMany({
      where: { bossId: selectedBossId },
      orderBy: { name: "asc" },
      include: {
        awards: {
          include: { character: true, roster: true },
          orderBy: { awardedAt: "desc" },
        },
      },
    });
  }

  return (
    <LootBrowser
      phases={phases.map(p => ({
        id: p.id,
        name: p.name,
        order: p.order,
        raids: p.raids.map(r => ({
          id: r.id,
          name: r.name,
          shortName: r.shortName,
          bosses: r.bosses.map(b => ({ id: b.id, name: b.name })),
        })),
      }))}
      phaseFilterParam={searchParams.phase ?? null}
      selectedRaidId={selectedRaidId}
      selectedBossId={selectedBossId}
      items={items.map(it => ({
        id: it.id,
        name: it.name,
        slot: it.slot,
        itemLevel: it.itemLevel,
        wowheadId: it.wowheadId,
        awards: it.awards.map((a: any) => ({
          id: a.id,
          awardedAt: a.awardedAt,
          character: { name: a.character.name, class: a.character.class },
          roster: { name: a.roster.name },
        })),
      }))}
      classColor={CLASS_COLOR}
    />
  );
}
