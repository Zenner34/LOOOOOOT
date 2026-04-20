import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SPEC_BY_KEY, ROLES } from "@/lib/specs";

export async function GET() {
  const chars = await prisma.character.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return NextResponse.json(chars);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  const spec = String(body?.spec ?? "").trim();
  const def = SPEC_BY_KEY[spec];
  if (!name || !def) {
    return NextResponse.json({ error: "name and valid spec required" }, { status: 400 });
  }
  const role = (body?.role && ROLES.includes(body.role)) ? body.role : def.role;
  const active = body?.active !== false;
  try {
    const created = await prisma.character.create({
      data: { name, class: def.class, spec, role, active },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "name already exists" }, { status: 409 });
    }
    throw e;
  }
}
