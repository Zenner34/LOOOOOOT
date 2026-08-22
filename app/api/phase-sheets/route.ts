import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPhaseSheetSlug, PHASE_SLUG } from "@/lib/raid-helper";

export const dynamic = "force-dynamic";

// The per-phase (BT/Hyjal) assignment sheet. Same coarse-save contract
// as /api/assignment-sheets: the PUT body carries the full `data` JSON
// blob. Mutations are admin-gated by the middleware; GET is public
// (the page itself server-renders the sheet, this is a convenience).
//
// Body: { slug?, data }
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") || PHASE_SLUG;
  if (!isPhaseSheetSlug(slug)) {
    return NextResponse.json({ error: "unknown sheet" }, { status: 400 });
  }
  const sheet = await prisma.phaseSheet.findUnique({ where: { slug } });
  return NextResponse.json(sheet ?? { slug, data: null });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" && body.slug ? body.slug : PHASE_SLUG;
  if (!isPhaseSheetSlug(slug)) {
    return NextResponse.json({ error: "unknown sheet" }, { status: 400 });
  }
  const data = body?.data;
  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "data required" }, { status: 400 });
  }

  const sheet = await prisma.phaseSheet.upsert({
    where: { slug },
    update: { data },
    create: { slug, data },
  });
  return NextResponse.json({ slug: sheet.slug, updatedAt: sheet.updatedAt });
}
