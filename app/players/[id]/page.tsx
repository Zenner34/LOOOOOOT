import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import PlayerDetailClient from "./PlayerDetailClient";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return notFound();

  const [player, allChars, awards] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      include: {
        characters: { orderBy: [{ isMain: "desc" }, { name: "asc" }] },
      },
    }),
    prisma.character.findMany({
      where: { playerId: null },
      orderBy: { name: "asc" },
    }),
    prisma.lootAward.findMany({
      where: { character: { playerId: id } },
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
    }),
  ]);

  if (!player) return notFound();

  const admin = await isAdmin();

  return (
    <PlayerDetailClient
      player={{
        id: player.id,
        displayName: player.displayName,
        discordHandle: player.discordHandle,
        notes: player.notes,
        active: player.active,
        characters: player.characters.map(c => ({
          id: c.id,
          name: c.name,
          class: c.class,
          spec: c.spec,
          role: c.role,
          isMain: c.isMain,
        })),
      }}
      orphans={allChars.map(c => ({
        id: c.id,
        name: c.name,
        class: c.class,
        spec: c.spec,
        role: c.role,
        isMain: c.isMain,
      }))}
      awards={awards.map(a => ({
        id: a.id,
        awardedAt: a.awardedAt.toISOString(),
        character: { id: a.character.id, name: a.character.name, class: a.character.class, spec: a.character.spec },
        item: {
          id: a.item.id,
          name: a.item.name,
          wowheadId: a.item.wowheadId,
          slot: a.item.slot,
          itemLevel: a.item.itemLevel,
          weights: a.item.weights,
          boss: { name: a.item.boss.name, raid: { name: a.item.boss.raid.name, shortName: a.item.boss.raid.shortName } },
        },
        raidNight: a.raidNight ? { id: a.raidNight.id, date: a.raidNight.date.toISOString(), notes: a.raidNight.notes } : null,
        roster: { id: a.roster.id, name: a.roster.name },
      }))}
      admin={admin}
    />
  );
}
