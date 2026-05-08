import Link from "next/link";
import { prisma } from "@/lib/db";
import { CLASS_COLOR } from "@/lib/specs";
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

  const selectedPhaseId = Number(searchParams.phase ?? phases[0]?.id ?? 0);
  const selectedRaidId  = Number(searchParams.raid ?? 0);
  const selectedBossId  = Number(searchParams.boss ?? 0);

  let items: Awaited<ReturnType<typeof prisma.item.findMany>> = [];
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
    } as any);
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
      selectedPhaseId={selectedPhaseId}
      selectedRaidId={selectedRaidId}
      selectedBossId={selectedBossId}
      items={items.map((it: any) => ({
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
