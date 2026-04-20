import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rosterId = url.searchParams.get("rosterId");
  const where = rosterId ? { rosterId: Number(rosterId) } : {};
  const nights = await prisma.raidNight.findMany({
    where,
    orderBy: { date: "desc" },
    include: { roster: true, _count: { select: { attendance: true, awards: true } } },
  });
  return NextResponse.json(nights);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const rosterId = Number(body?.rosterId);
  const date = body?.date ? new Date(body.date) : new Date();
  const notes = body?.notes ? String(body.notes) : null;
  if (!rosterId || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "rosterId and valid date required" }, { status: 400 });
  }
  const night = await prisma.raidNight.create({ data: { rosterId, date, notes } });
  return NextResponse.json(night, { status: 201 });
}
