import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emptyAssignmentData, mondayOfWeek } from "@/lib/assignments";

export const dynamic = "force-dynamic";

export async function GET() {
  const teams = await prisma.raidTeam.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(teams);
}

// Create a new raid team. Optionally seeds an empty AssignmentSheet for
// the current week so the editor has something to open immediately.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const color = String(body?.color ?? "#1e3a5f");
  const notes = body?.notes ? String(body.notes) : null;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  try {
    const team = await prisma.raidTeam.create({
      data: { name, color, notes },
    });
    await prisma.assignmentSheet.create({
      data: {
        teamId: team.id,
        weekOf: mondayOfWeek(),
        data: emptyAssignmentData() as any,
      },
    });
    return NextResponse.json(team, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A team with that name already exists." }, { status: 409 });
    }
    throw e;
  }
}
