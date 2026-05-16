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
  // Quantity for batch awards (e.g. distributing 5× Nether Vortex to the
  // same crafter on one raid night). Defaults to 1 — single-award flow
  // stays unchanged. Capped at 20 as a sanity guard.
  const rawQty = Number(body?.quantity ?? 1);
  const quantity = Number.isFinite(rawQty) ? Math.max(1, Math.min(20, Math.floor(rawQty))) : 1;
  if (!itemId || !characterId || !rosterId) {
    return NextResponse.json({ error: "itemId, characterId, rosterId required" }, { status: 400 });
  }
  // When the admin picks a past raid night, stamp the award with that
  // night's date instead of Prisma's @default(now()). Matches the
  // midnight-UTC convention used by the bulk SQL imports under /data.
  // The same `awardedAt` is reused for every row in the batch so all
  // copies stay on a single date (e.g. one raid night).
  let awardedAt: Date | undefined;
  if (raidNightId) {
    const rn = await prisma.raidNight.findUnique({
      where: { id: raidNightId },
      select: { date: true },
    });
    if (rn) awardedAt = rn.date;
  } else if (quantity > 1) {
    // No raid night selected — pin every batch row to the same NOW()
    // so they cluster together when sorted.
    awardedAt = new Date();
  }
  const awards = [];
  for (let i = 0; i < quantity; i++) {
    awards.push(
      await prisma.lootAward.create({
        data: {
          itemId,
          characterId,
          rosterId,
          raidNightId,
          notes,
          ...(awardedAt ? { awardedAt } : {}),
        },
        include: { item: true, character: true, roster: true, raidNight: true },
      }),
    );
  }
  // Preserve the single-award response shape for quantity=1 callers;
  // batched callers receive an array.
  if (quantity === 1) return NextResponse.json(awards[0], { status: 201 });
  return NextResponse.json({ awards, quantity }, { status: 201 });
}
