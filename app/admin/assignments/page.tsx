import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import AssignmentsClient from "@/app/assignments/AssignmentsClient";

export const dynamic = "force-dynamic";

// The archived SSC/TK assignment sheets (the pre-BT/Hyjal era system,
// built on raid teams + the Character table). Admin-only now — the
// public /assignments page is the Raid-Helper-driven BT/Hyjal sheet.
// Old /admin/assignments?team=<id> bookmarks land here too.
export default async function LegacyAssignmentsIndex({
  searchParams,
}: {
  searchParams: { team?: string };
}) {
  if (!(await isAdmin())) redirect("/assignments");

  const teams = await prisma.raidTeam.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    select: { id: true, slug: true, active: true },
  });

  const id = Number(searchParams.team);
  const byId = id ? teams.find(t => t.id === id) : undefined;
  const def = byId ?? teams.find(t => t.active) ?? teams[0];
  if (def) redirect(`/admin/assignments/${def.slug}`);

  // No teams yet — render the editor shell so an admin can create the first one.
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
      admin={true}
    />
  );
}
