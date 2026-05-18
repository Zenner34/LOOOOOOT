import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emptyAssignmentData, mondayOfWeek } from "@/lib/assignments";

export const dynamic = "force-dynamic";

// Upsert the AssignmentSheet for a given (team, weekOf). The PUT body
// carries the full `data` JSON blob — saves are coarse so the editor
// doesn't need to translate every tiny edit into a granular API call.
//
// Body: { teamId, weekOf (YYYY-MM-DD), data, notes? }
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const teamId = Number(body?.teamId);
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  // Normalise weekOf to the Monday of whichever date was supplied.
  const requested = body?.weekOf ? new Date(String(body.weekOf)) : new Date();
  if (isNaN(requested.getTime())) {
    return NextResponse.json({ error: "weekOf must be a valid date" }, { status: 400 });
  }
  const weekOf = mondayOfWeek(requested);

  const data = body?.data ?? emptyAssignmentData();
  const notes = body?.notes ? String(body.notes) : null;

  const sheet = await prisma.assignmentSheet.upsert({
    where: { teamId_weekOf: { teamId, weekOf } },
    update: { data, notes },
    create: { teamId, weekOf, data, notes },
  });
  return NextResponse.json(sheet);
}
