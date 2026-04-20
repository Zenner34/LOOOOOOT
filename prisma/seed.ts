import { PrismaClient } from "@prisma/client";
import { TBC_DATA } from "../lib/tbc-data";
import { mergeWeights } from "../lib/archetypes";

const prisma = new PrismaClient();

async function main() {
  for (const [phaseIdx, phase] of TBC_DATA.entries()) {
    const dbPhase = await prisma.phase.upsert({
      where: { order: phaseIdx + 1 },
      update: { name: phase.name },
      create: { name: phase.name, order: phaseIdx + 1 },
    });

    for (const [raidIdx, raid] of phase.raids.entries()) {
      const dbRaid = await prisma.raid.upsert({
        where: { shortName: raid.shortName },
        update: { name: raid.name, order: raidIdx + 1, phaseId: dbPhase.id },
        create: {
          name: raid.name,
          shortName: raid.shortName,
          order: raidIdx + 1,
          phaseId: dbPhase.id,
        },
      });

      for (const [bossIdx, boss] of raid.bosses.entries()) {
        const dbBoss = await prisma.boss.upsert({
          where: { raidId_name: { raidId: dbRaid.id, name: boss.name } },
          update: { order: bossIdx + 1 },
          create: { name: boss.name, order: bossIdx + 1, raidId: dbRaid.id },
        });

        for (const item of boss.items) {
          // Dedupe by (boss + name) since wowheadId is not always known/unique in our seed.
          const existing = await prisma.item.findFirst({
            where: { bossId: dbBoss.id, name: item.name },
          });
          // wowheadId has a UNIQUE constraint. If the same id is already claimed
          // by a different item (our seed reuses some placeholder ids on tokens),
          // drop it to null rather than failing the seed.
          let wowheadId: number | null = item.wowheadId ?? null;
          if (wowheadId != null) {
            const claimed = await prisma.item.findUnique({ where: { wowheadId } });
            if (claimed && claimed.id !== existing?.id) wowheadId = null;
          }
          const data = {
            name: item.name,
            slot: item.slot ?? null,
            itemLevel: item.itemLevel ?? null,
            wowheadId,
            notes: item.notes ?? null,
            bossId: dbBoss.id,
          };
          const dbItem = existing
            ? await prisma.item.update({ where: { id: existing.id }, data })
            : await prisma.item.create({ data });

          const weights = mergeWeights(item.archetype, item.weights);
          // wipe + rewrite weights so edits in tbc-data.ts propagate on reseed
          await prisma.itemWeight.deleteMany({ where: { itemId: dbItem.id } });
          const entries = Object.entries(weights).filter(([, w]) => w > 0);
          if (entries.length) {
            await prisma.itemWeight.createMany({
              data: entries.map(([spec, weight]) => ({
                itemId: dbItem.id,
                spec,
                weight,
              })),
            });
          }
        }
      }
    }
  }

  const counts = await Promise.all([
    prisma.phase.count(),
    prisma.raid.count(),
    prisma.boss.count(),
    prisma.item.count(),
    prisma.itemWeight.count(),
  ]);
  console.log(
    `Seed complete — phases=${counts[0]} raids=${counts[1]} bosses=${counts[2]} items=${counts[3]} weights=${counts[4]}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
