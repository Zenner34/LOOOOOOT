import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const p = await prisma.player.findUnique({
    where: { id },
    include: {
      characters: { orderBy: [{ isMain: "desc" }, { name: "asc" }] },
    },
  });
  if (!p) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.displayName === "string") patch.displayName = body.displayName.trim();
  if ("discordHandle" in body) patch.discordHandle = body.discordHandle ? String(body.discordHandle).trim() : null;
  if ("notes" in body) patch.notes = body.notes ? String(body.notes).trim() : null;
  if (typeof body.active === "boolean") patch.active = body.active;
  try {
    const updated = await prisma.player.update({ where: { id }, data: patch });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "displayName already exists" }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  // FK is onDelete: SetNull — characters survive but become orphan.
  await prisma.player.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
