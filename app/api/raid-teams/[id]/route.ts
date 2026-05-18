import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.color === "string") data.color = body.color;
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes) : null;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no editable fields" }, { status: 400 });
  }
  try {
    const team = await prisma.raidTeam.update({ where: { id }, data });
    return NextResponse.json(team);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "A team with that name already exists." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.raidTeam.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
