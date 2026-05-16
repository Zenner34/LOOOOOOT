import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.lootAward.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}

// Partial update for a LootAward. The admin /admin/loot dashboard uses
// this to fix winner / raid night / notes after the fact. Item id is
// intentionally not editable here — for a wrong item, delete and
// re-record (the picker UX on /loot/assign is the right surface).
//
// Changing raidNightId also re-stamps `awardedAt` to that night's date
// (midnight UTC), matching the convention used by the bulk SQL imports
// under /data. Clearing raidNightId leaves `awardedAt` unchanged so the
// award stays on its original day.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (body.characterId !== undefined) data.characterId = Number(body.characterId);
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;
  if (body.raidNightId !== undefined) {
    if (body.raidNightId === null || body.raidNightId === "") {
      data.raidNightId = null;
    } else {
      const rnId = Number(body.raidNightId);
      data.raidNightId = rnId;
      const rn = await prisma.raidNight.findUnique({
        where: { id: rnId },
        select: { date: true },
      });
      if (rn) data.awardedAt = rn.date;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no editable fields provided" }, { status: 400 });
  }

  const updated = await prisma.lootAward.update({
    where: { id },
    data,
    include: { item: true, character: true, roster: true, raidNight: true },
  });
  return NextResponse.json(updated);
}
