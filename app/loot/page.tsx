import Link from "next/link";
import { prisma } from "@/lib/db";
import { WowheadLink } from "@/lib/wowhead";
import { CLASS_COLOR } from "@/lib/specs";

export const dynamic = "force-dynamic";

export default async function LootPage({
  searchParams,
}: {
  searchParams: { raid?: string; boss?: string };
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

  const selectedRaidId = Number(searchParams.raid ?? 0);
  const selectedBossId = Number(searchParams.boss ?? 0);

  let items: any[] = [];
  let awardsByItem: Record<number, any[]> = {};
  if (selectedBossId) {
    items = await prisma.item.findMany({
      where: { bossId: selectedBossId },
      orderBy: { name: "asc" },
      include: {
        awards: { include: { character: true, roster: true }, orderBy: { awardedAt: "desc" } },
      },
    });
    for (const item of items) awardsByItem[item.id] = item.awards;
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <aside className="col-span-12 lg:col-span-4 panel p-3 max-h-[80vh] overflow-auto">
        <h2 className="text-sm uppercase text-neutral-400 mb-2">Phases · Raids · Bosses</h2>
        {phases.map(phase => (
          <div key={phase.id} className="mb-3">
            <div className="text-xs uppercase text-amber-400 tracking-wide">{phase.name}</div>
            {phase.raids.map(raid => (
              <div key={raid.id} className="mt-1">
                <div className={`text-sm font-semibold ${raid.id === selectedRaidId ? "text-amber-300" : "text-neutral-200"}`}>
                  {raid.name}
                </div>
                <ul className="ml-3 text-sm">
                  {raid.bosses.map(b => (
                    <li key={b.id}>
                      <Link
                        href={`/loot?raid=${raid.id}&boss=${b.id}`}
                        className={`block py-0.5 hover:text-amber-300 ${b.id === selectedBossId ? "text-amber-400 font-semibold" : "text-neutral-300"}`}
                      >{b.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </aside>

      <section className="col-span-12 lg:col-span-8 panel p-3 max-h-[80vh] overflow-auto">
        {selectedBossId ? (
          <>
            <h2 className="text-sm uppercase text-neutral-400 mb-3">Drops</h2>
            <table className="table">
              <thead>
                <tr><th>Item</th><th>Slot</th><th>iLvl</th><th>Awarded to</th></tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td><WowheadLink name={it.name} wowheadId={it.wowheadId} /></td>
                    <td className="text-neutral-400">{it.slot ?? ""}</td>
                    <td className="text-neutral-500">{it.itemLevel ?? ""}</td>
                    <td className="text-neutral-300 text-xs">
                      {(awardsByItem[it.id] ?? []).length === 0 ? "—" : (
                        <ul>
                          {awardsByItem[it.id].map(a => (
                            <li key={a.id}>
                              <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                              <span className="text-neutral-500"> · {a.roster.name} · {new Date(a.awardedAt).toISOString().slice(0,10)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-neutral-500">No items seeded for this boss yet.</td></tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <div className="text-neutral-400 text-sm">Select a boss to see its drops and award history.</div>
        )}
      </section>
    </div>
  );
}
