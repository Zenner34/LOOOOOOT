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
  const name = url.searchParams.get("name") || "Koco";
  const realm = url.searchParams.get("realm") || "Nightslayer";
  const region = url.searchParams.get("region") || "US";
  try {
    return NextResponse.json(await wclDebug(name, realm, region));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
