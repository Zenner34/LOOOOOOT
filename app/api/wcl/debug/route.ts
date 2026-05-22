import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { wclConfigured, wclDebug } from "@/lib/wcl";

export const dynamic = "force-dynamic";

// Admin diagnostic: GET /api/wcl/debug?name=Koco&realm=Nightslayer&region=US
// Returns the available zones, the resolved zone id, and the raw WCL
// character + zoneRankings response so we can see exactly what's happening.
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!wclConfigured()) return NextResponse.json({ error: "WCL not configured" }, { status: 503 });
  const url = new URL(req.url);
  const charId = Number(url.searchParams.get("id")) || 91183395; // Koco
  const zoneId = Number(url.searchParams.get("zone")) || 1010;   // SSC / TK
  try {
    return NextResponse.json(await wclDebug(charId, zoneId));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
