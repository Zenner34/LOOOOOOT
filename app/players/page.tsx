import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import PlayersClient from "./PlayersClient";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const [players, orphans] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ active: "desc" }, { displayName: "asc" }],
      include: {
        characters: { orderBy: [{ isMain: "desc" }, { name: "asc" }] },
      },
    }),
    prisma.character.findMany({
      where: { playerId: null },
      orderBy: { name: "asc" },
    }),
  ]);

  const admin = await isAdmin();

  return (
    <PlayersClient
      initialPlayers={players.map(p => ({
        id: p.id,
        displayName: p.displayName,
        discordHandle: p.discordHandle,
        notes: p.notes,
        active: p.active,
        characters: p.characters.map(c => ({
          id: c.id,
          name: c.name,
          class: c.class,
          spec: c.spec,
          role: c.role,
          isMain: c.isMain,
        })),
      }))}
      initialOrphans={orphans.map(c => ({
        id: c.id,
        name: c.name,
        class: c.class,
        spec: c.spec,
        role: c.role,
        isMain: c.isMain,
      }))}
      admin={admin}
    />
  );
}
