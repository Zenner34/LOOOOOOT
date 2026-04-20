import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SPEC_BY_KEY, ROLES } from "@/lib/specs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.spec === "string") {
    const def = SPEC_BY_KEY[body.spec];
    if (!def) return NextResponse.json({ error: "invalid spec" }, { status: 400 });
    patch.spec = body.spec;
    patch.class = def.class;
    if (!body.role) patch.role = def.role;
  }
  if (typeof body.role === "string" && ROLES.includes(body.role)) patch.role = body.role;
  if (typeof body.active === "boolean") patch.active = body.active;
  const updated = await prisma.character.update({ where: { id }, data: patch });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.character.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
