import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { v1Configured, fetchCharacterParseV1, metricForRole } from "@/lib/wcl";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // long-running batch refresh

async function refresh() {
  if (!v1Configured()) {
    return NextResponse.json({ error: "WCL_V1_KEY not set" }, { status: 503 });
  }
  const characters = await prisma.character.findMany({
    where: { active: true },
    select: { id: true, name: true, role: true },
  });

  let updated = 0, noParses = 0, failed = 0;
  const errors: string[] = [];
  for (const c of characters) {
    try {
      const parse = await fetchCharacterParseV1(c.name, metricForRole(c.role));
      await prisma.character.update({
        where: { id: c.id },
        data: {
          wclBestPerfAvg: parse?.bestPerfAvg ?? null,
          wclMedianPerfAvg: parse?.medianPerfAvg ?? null,
          wclKillsLogged: parse?.killsLogged ?? null,
          wclData: parse ? (parse.byBoss as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          wclUpdatedAt: new Date(),
        },
      });
      if (parse?.bestPerfAvg != null) updated++; else noParses++;
    } catch (e) {
      failed++;
      errors.push(`${c.name}: ${(e as Error).message}`);
    }
    await new Promise(r => setTimeout(r, 120));
  }
  return NextResponse.json({ total: characters.length, updated, noParses, failed, errors: errors.slice(0, 20) });
}

// Admin button.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return refresh();
}

// Vercel cron (set CRON_SECRET; Vercel sends it as a Bearer token).
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return refresh();
}
