import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emptyAssignmentData } from "@/lib/assignments";

export const dynamic = "force-dynamic";

// Upsert the single AssignmentSheet for a team. The PUT body carries the
// full `data` JSON blob — saves are coarse so the editor doesn't need to
// translate every tiny edit into a granular API call.
//
// Body: { teamId, data, notes? }
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const teamId = Number(body?.teamId);
  if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });

  const data = body?.data ?? emptyAssignmentData();
  const notes = body?.notes ? String(body.notes) : null;

  const sheet = await prisma.assignmentSheet.upsert({
    where: { teamId },
    update: { data, notes },
    create: { teamId, data, notes },
  });
  return NextResponse.json(sheet);
}
