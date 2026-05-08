import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Bind a character to this player. Body: { characterId, isMain? }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const playerId = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const characterId = Number(body?.characterId);
  if (!characterId) {
    return NextResponse.json({ error: "characterId required" }, { status: 400 });
  }
  const isMain = body?.isMain === true;

  // If the new char is being marked main, demote any other main of this player.
  if (isMain) {
    await prisma.character.updateMany({
      where: { playerId, isMain: true },
      data: { isMain: false },
    });
  }
  const updated = await prisma.character.update({
    where: { id: characterId },
    data: { playerId, isMain },
  });
  return NextResponse.json(updated);
}

// Unbind a character. Query: ?characterId=N
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const playerId = Number(params.id);
  const url = new URL(req.url);
  const characterId = Number(url.searchParams.get("characterId"));
  if (!characterId) {
    return NextResponse.json({ error: "characterId required" }, { status: 400 });
  }
  // Only unbind if the character is actually bound to this player.
  const updated = await prisma.character.updateMany({
    where: { id: characterId, playerId },
    data: { playerId: null, isMain: false },
  });
  return NextResponse.json({ updated: updated.count });
}
