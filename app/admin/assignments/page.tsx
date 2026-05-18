import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  emptyAssignmentData,
  mondayOfWeek,
  weekOfLabel,
  type AssignmentData,
} from "@/lib/assignments";
import AssignmentsClient from "./AssignmentsClient";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: { team?: string; week?: string };
}) {
  // Page is viewable by anyone — admins get the editor, raiders are
  // forced into the read-only Raider view (no toggle, no edit
  // affordances). Mutations still go through admin-gated API routes,
  // so a raider hitting the page can't change anything even if they
  // tried via the network tab.
  const admin = await isAdmin();

  const weekOf = searchParams.week
    ? mondayOfWeek(new Date(searchParams.week))
    : mondayOfWeek(new Date());

  const [teams, characters, players] = await Promise.all([
    prisma.raidTeam.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }] }),
    prisma.character.findMany({
      where: { active: true },
      orderBy: [{ name: "asc" }],
      include: { player: true },
    }),
    prisma.player.findMany({ orderBy: { displayName: "asc" } }),
  ]);

  const selectedTeamId =
    Number(searchParams.team) ||
    teams.find(t => t.active)?.id ||
    teams[0]?.id ||
    null;

  let sheet: { teamId: number; weekOf: string; data: AssignmentData } | null = null;
  if (selectedTeamId) {
    const existing = await prisma.assignmentSheet.findUnique({
      where: { teamId_weekOf: { teamId: selectedTeamId, weekOf } },
    });
    sheet = {
      teamId: selectedTeamId,
      weekOf: weekOfLabel(weekOf),
      data: (existing?.data as unknown as AssignmentData) ?? emptyAssignmentData(),
    };
  }

  return (
    <AssignmentsClient
      teams={teams.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        active: t.active,
        notes: t.notes,
      }))}
      selectedTeamId={selectedTeamId}
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
      admin={admin}
    />
  );
}
