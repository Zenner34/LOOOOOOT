import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rosterId = url.searchParams.get("rosterId");
  const characterId = url.searchParams.get("characterId");
  const where: Record<string, unknown> = {};
  if (rosterId) where.rosterId = Number(rosterId);
  if (characterId) where.characterId = Number(characterId);
  const awards = await prisma.lootAward.findMany({
    where,
    orderBy: { awardedAt: "desc" },
    include: {
      item: { include: { boss: { include: { raid: { include: { phase: true } } } }, weights: true } },
      character: true,
      roster: true,
      raidNight: true,
    },
  });
  return NextResponse.json(awards);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const itemId = Number(body?.itemId);
  const characterId = Number(body?.characterId);
  const rosterId = Number(body?.rosterId);
  const raidNightId = body?.raidNightId ? Number(body.raidNightId) : null;
  const notes = body?.notes ? String(body.notes) : null;
  if (!itemId || !characterId || !rosterId) {
    return NextResponse.json({ error: "itemId, characterId, rosterId required" }, { status: 400 });
  }
  const award = await prisma.lootAward.create({
    data: { itemId, characterId, rosterId, raidNightId, notes },
    include: { item: true, character: true, roster: true, raidNight: true },
  });
  return NextResponse.json(award, { status: 201 });
}
