import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.raidNight.delete({ where: { id: Number(params.id) } });
  return NextResponse.json({ ok: true });
}
