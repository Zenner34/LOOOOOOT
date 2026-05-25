import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import AssignmentsClient from "./AssignmentsClient";

export const dynamic = "force-dynamic";

export default async function AssignmentsIndex() {
  const teams = await prisma.raidTeam.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    select: { slug: true, active: true },
  });
  const def = teams.find(t => t.active) ?? teams[0];
  if (def) redirect(`/assignments/${def.slug}`);

  // No teams yet — render the editor shell so an admin can create the first one.
  const admin = await isAdmin();
  const [characters, players] = await Promise.all([
    prisma.character.findMany({
      where: { active: true },
      orderBy: [{ name: "asc" }],
      include: { player: true },
    }),
    prisma.player.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  return (
    <AssignmentsClient
      teams={[]}
      selectedTeamId={null}
      sheet={null}
      characters={characters.map(c => ({
        id: c.id,
        name: c.name,
        class: c.class,
        spec: c.spec,
        role: c.role,
        isMain: c.isMain,
        playerId: c.playerId,
        playerName: c.player?.displayName ?? null,
      }))}
      players={players.map(p => ({ id: p.id, displayName: p.displayName }))}
      admin={admin}
    />
  );
}
