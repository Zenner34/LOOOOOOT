import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Read-only inventory of every AssignmentSheet, grouped by team, so we can
// see which week holds each team's real assignments before collapsing to
// one sheet per team. Temporary helper — safe to delete after migration.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "admin only" }, { status: 403 });
  }

  const teams = await prisma.raidTeam.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
    select: { id: true, name: true, active: true },
  });

  const sheets = await prisma.assignmentSheet.findMany({
    orderBy: [{ teamId: "asc" }, { updatedAt: "desc" }],
  });

  function summarize(data: any) {
    const groups = data?.groups ?? {};
    const groupMembers = Object.values(groups)
      .reduce((n: number, arr: any) => n + (Array.isArray(arr) ? arr.length : 0), 0);

    const sectionFill = (s: any) => (Array.isArray(s?.characterIds) ? s.characterIds.length : 0);

    const buffs = Array.isArray(data?.buffs) ? data.buffs : [];
    const buffAssignments = buffs.reduce((n: number, s: any) => n + sectionFill(s), 0);

    const bosses = data?.bosses ?? {};
    let bossAssignments = 0;
    let bossesWithAssignments = 0;
    for (const b of Object.values(bosses) as any[]) {
      const sections = [
        ...(Array.isArray(b?.sections) ? b.sections : []),
        ...((Array.isArray(b?.phases) ? b.phases : []).flatMap((p: any) => (Array.isArray(p?.sections) ? p.sections : []))),
      ];
      const filled = sections.reduce((n: number, s: any) => n + sectionFill(s), 0);
      bossAssignments += filled;
      if (filled > 0) bossesWithAssignments += 1;
    }

    return { groupMembers, buffAssignments, bossesWithAssignments, bossAssignments };
  }

  const byTeam = teams.map(t => {
    const teamSheets = sheets.filter(s => s.teamId === t.id);
    return {
      teamId: t.id,
      team: t.name,
      active: t.active,
      sheetCount: teamSheets.length,
      sheets: teamSheets.map(s => ({
        sheetId: s.id,
        weekOf: s.weekOf.toISOString().slice(0, 10),
        updatedAt: s.updatedAt.toISOString().slice(0, 16).replace("T", " "),
        ...summarize(s.data),
      })),
    };
  });

  return NextResponse.json({ teams: byTeam }, { headers: { "cache-control": "no-store" } });
}
