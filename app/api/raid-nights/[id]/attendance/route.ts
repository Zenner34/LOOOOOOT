import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 'no_show' = was on the roster, expected to attend, but didn't sign up
// or join — distinct from a heads-up absence so we can flag the pattern.
const VALID = ["present", "late", "absent", "no_show"];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const raidNightId = Number(params.id);
  const body = await req.json().catch(() => ({}));
  const records: Array<{ characterId: number; status: string }> = Array.isArray(body?.records) ? body.records : [];
  if (records.length === 0) {
    return NextResponse.json({ error: "records[] required" }, { status: 400 });
  }
  const results = [];
  for (const rec of records) {
    const characterId = Number(rec.characterId);
    const status = VALID.includes(rec.status) ? rec.status : "present";
    if (!characterId) continue;
    const saved = await prisma.attendance.upsert({
      where: { raidNightId_characterId: { raidNightId, characterId } },
      update: { status },
      create: { raidNightId, characterId, status },
    });
    results.push(saved);
  }
  return NextResponse.json({ ok: true, count: results.length });
}
