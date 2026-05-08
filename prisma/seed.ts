import { PrismaClient } from "@prisma/client";
import { TBC_DATA } from "../lib/tbc-data";
import { mergeWeights } from "../lib/archetypes";
import VERIFIED_IDS from "../lib/wowhead-ids.json";

const prisma = new PrismaClient();

// Override hand-authored IDs with verified ones from the canonical TBC item DB.
// The hand-authored list had ~66% wrong IDs (Vanilla items with same name, etc).
// lib/wowhead-ids.json is generated from `wow-classic-items` package data.
const VERIFIED: Record<string, { id: number; icon?: string }> = VERIFIED_IDS as any;

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
          // Prefer the verified ID from lib/wowhead-ids.json over the hand-authored
          // one. If neither is available the item ships without a tooltip rather
          // than linking to the wrong item.
          let wowheadId: number | null = VERIFIED[item.name]?.id ?? item.wowheadId ?? null;
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
