import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns the small lookup payload that powers the cmd+K palette.
// Public read.
export async function GET() {
  const [players, characters, bosses] = await Promise.all([
    prisma.player.findMany({
      where: { active: true },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    }),
    prisma.character.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, class: true, spec: true, playerId: true },
    }),
    prisma.boss.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        raid: { select: { id: true, name: true, shortName: true, phaseId: true } },
      },
    }),
  ]);

  return NextResponse.json({ players, characters, bosses });
}
