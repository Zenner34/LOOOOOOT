import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const players = await prisma.player.findMany({
    orderBy: [{ active: "desc" }, { displayName: "asc" }],
    include: {
      characters: {
        orderBy: [{ isMain: "desc" }, { name: "asc" }],
      },
    },
  });
  return NextResponse.json(players);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const displayName = String(body?.displayName ?? "").trim();
  if (!displayName) {
    return NextResponse.json({ error: "displayName required" }, { status: 400 });
  }
  const discordHandle = body?.discordHandle ? String(body.discordHandle).trim() : null;
  const notes = body?.notes ? String(body.notes).trim() : null;
  try {
    const created = await prisma.player.create({
      data: { displayName, discordHandle, notes },
      include: { characters: true },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "displayName already exists" }, { status: 409 });
    }
    throw e;
  }
}
