import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const rosterId = Number(params.id);
  const members = await prisma.rosterMember.findMany({
    where: { rosterId },
    include: { character: true },
    orderBy: [{ memberRole: "asc" }, { character: { name: "asc" } }],
  });
  return NextResponse.json(members);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const rosterId = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const characterId = Number(body?.characterId);
  const memberRole = ["main", "bench", "trial"].includes(body?.memberRole) ? body.memberRole : "main";
  if (!characterId) return NextResponse.json({ error: "characterId required" }, { status: 400 });
  try {
    const m = await prisma.rosterMember.create({
      data: { rosterId, characterId, memberRole },
      include: { character: true },
    });
    return NextResponse.json(m, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "already in roster" }, { status: 409 });
    throw e;
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const rosterId = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const characterId = Number(body?.characterId);
  const memberRole = String(body?.memberRole);
  if (!characterId || !["main", "bench", "trial"].includes(memberRole)) {
    return NextResponse.json({ error: "characterId + valid memberRole required" }, { status: 400 });
  }
  const m = await prisma.rosterMember.update({
    where: { rosterId_characterId: { rosterId, characterId } },
    data: { memberRole },
    include: { character: true },
  });
  return NextResponse.json(m);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const rosterId = Number(params.id);
  const url = new URL(req.url);
  const characterId = Number(url.searchParams.get("characterId"));
  if (!characterId) return NextResponse.json({ error: "characterId required" }, { status: 400 });
  await prisma.rosterMember.delete({
    where: { rosterId_characterId: { rosterId, characterId } },
  });
  return NextResponse.json({ ok: true });
}
