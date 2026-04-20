import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rosters = await prisma.roster.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true, raidNights: true, awards: true } } },
  });
  return NextResponse.json(rosters);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const description = body?.description ? String(body.description).trim() : null;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  try {
    const r = await prisma.roster.create({ data: { name, description } });
    return NextResponse.json(r, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "name taken" }, { status: 409 });
    throw e;
  }
}
