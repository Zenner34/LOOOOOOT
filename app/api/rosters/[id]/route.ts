import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof body.name === "string") patch.name = body.name.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  const r = await prisma.roster.update({ where: { id }, data: patch });
  return NextResponse.json(r);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.roster.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
