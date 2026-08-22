import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { emptyAssignmentData, type AssignmentData } from "@/lib/assignments";
import AssignmentsClient from "@/app/assignments/AssignmentsClient";

export const dynamic = "force-dynamic";

// One archived SSC/TK team sheet. Admin-only — raiders use the public
// BT/Hyjal sheet at /assignments; mutations here still go through the
// admin-gated API routes.
export default async function LegacyTeamAssignmentsPage({
  params,
}: {
  params: { team: string };
}) {
  if (!(await isAdmin())) redirect("/assignments");

  const [teams, characters, players] = await Promise.all([
    prisma.raidTeam.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }] }),
    prisma.character.findMany({
      where: { active: true },
      orderBy: [{ name: "asc" }],
      include: { player: true },
    }),
    prisma.player.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  const slug = decodeURIComponent(params.team);
  // Resolve by slug; fall back to numeric id so old id-based links and
  // bookmarks keep working.
  const team =
    teams.find(t => t.slug === slug) ??
    (/^\d+$/.test(slug) ? teams.find(t => t.id === Number(slug)) : undefined);

  if (!team) {
    const def = teams.find(t => t.active) ?? teams[0];
    if (def) redirect(`/admin/assignments/${def.slug}`);
    // No teams exist yet — render the empty editor shell so an admin can create one.
  } else if (slug !== team.slug) {
    // Canonicalise id-based or stale URLs to the team's slug.
    redirect(`/admin/assignments/${team.slug}`);
  }

  let sheet: { teamId: number; data: AssignmentData } | null = null;
  if (team) {
    const existing = await prisma.assignmentSheet.findUnique({ where: { teamId: team.id } });
    sheet = {
      teamId: team.id,
      data: (existing?.data as unknown as AssignmentData) ?? emptyAssignmentData(),
    };
  }

  return (
    <AssignmentsClient
      teams={teams.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color,
        active: t.active,
        notes: t.notes,
      }))}
      selectedTeamId={team?.id ?? null}
      sheet={sheet}
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
