// WarcraftLogs (Fresh) API v2 client — OAuth client-credentials + GraphQL.
//
// Fresh logs live on their own WCL host (separate DB from retail/classic),
// so create the API client on fresh.warcraftlogs.com and point WCL_BASE_URL
// at it. Env:
//   WCL_CLIENT_ID, WCL_CLIENT_SECRET   — from WCL → Settings → API Clients
//   WCL_BASE_URL   (optional)          — default https://fresh.warcraftlogs.com
//   WCL_ZONE_ID    (optional)          — SSC/TK zone id; auto-resolved if unset
//
// All calls are server-side only.

const BASE = process.env.WCL_BASE_URL?.replace(/\/$/, "") || "https://fresh.warcraftlogs.com";

let cachedToken: { value: string; expiresAt: number } | null = null;

export function wclConfigured(): boolean {
  return !!(process.env.WCL_CLIENT_ID && process.env.WCL_CLIENT_SECRET);
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const id = process.env.WCL_CLIENT_ID;
  const secret = process.env.WCL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("WCL_CLIENT_ID / WCL_CLIENT_SECRET not set");

  const res = await fetch(`${BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: "Basic " + Buffer.from(`${id}:${secret}`).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`WCL token failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}/api/v2/client`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`WCL query failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(`WCL GraphQL error: ${json.errors.map(e => e.message).join("; ")}`);
  if (!json.data) throw new Error("WCL: empty response");
  return json.data;
}

/** WCL server slug: lowercase, spaces/apostrophes → hyphens. */
export function serverSlug(realm: string): string {
  return realm.trim().toLowerCase().replace(/['\s]+/g, "-");
}

let cachedZoneId: number | null = null;

/**
 * Resolve the SSC/TK zone id. Uses WCL_ZONE_ID when set; otherwise queries
 * worldData.zones and picks the TBC zone whose name mentions Serpentshrine
 * / SSC / Tempest / TK (Fresh labels it "SSC / TK"). Cached for the process.
 */
export async function resolveZoneId(): Promise<number> {
  if (cachedZoneId) return cachedZoneId;
  const envId = process.env.WCL_ZONE_ID ? Number(process.env.WCL_ZONE_ID) : NaN;
  if (Number.isFinite(envId)) { cachedZoneId = envId; return cachedZoneId; }

  const data = await gql<{ worldData: { zones: Array<{ id: number; name: string }> } }>(
    `query { worldData { zones { id name } } }`, {},
  );
  const zones = data.worldData?.zones ?? [];
  const rx = /(ssc|serpentshrine|tempest|tk\b|the eye)/i;
  const hit = zones.find(z => rx.test(z.name));
  if (!hit) throw new Error(`Could not resolve SSC/TK zone id; set WCL_ZONE_ID. Zones: ${zones.map(z => `${z.id}:${z.name}`).join(", ")}`);
  cachedZoneId = hit.id;
  return cachedZoneId;
}

/** Diagnostic dump: zone 1010's structure + try zoneRankings per difficulty,
 *  plus one encounterRankings probe, to find what the API accepts. */
export async function wclDebug(name: string, realm: string, region: string) {
  const server = serverSlug(realm);
  const zoneId = await resolveZoneId();

  const meta = await gql<{
    worldData: {
      zone: {
        id: number; name: string; frozen?: boolean;
        expansion?: { id: number; name: string };
        difficulties?: Array<{ id: number; name: string }>;
        partitions?: Array<{ id: number; name: string; default?: boolean }>;
        encounters?: Array<{ id: number; name: string }>;
      } | null;
    };
  }>(
    `query($z:Int!){ worldData{ zone(id:$z){
       id name frozen expansion{id name}
       difficulties{id name} partitions{id name default} encounters{id name}
     } } }`,
    { z: zoneId },
  );
  const zone = meta.worldData?.zone ?? null;

  async function tryArgs(label: string, field: string, args: string) {
    try {
      const data = await gql<{ characterData: { character: Record<string, unknown> | null } | null }>(
        `query($name:String!,$server:String!,$region:String!){
           characterData{ character(name:$name, serverSlug:$server, serverRegion:$region){ ${field}(${args}) } }
         }`,
        { name, server, region },
      );
      return { label, args, result: data.characterData?.character?.[field] ?? null };
    } catch (e) {
      return { label, args, error: (e as Error).message };
    }
  }

  const attempts: unknown[] = [];
  const diffs = zone?.difficulties ?? [];
  if (diffs.length === 0) {
    attempts.push(await tryArgs("zone+dps (no diff)", "zoneRankings", `zoneID: ${zoneId}, metric: dps`));
  }
  for (const d of diffs) {
    attempts.push(await tryArgs(`zone+diff ${d.name}(${d.id})`, "zoneRankings", `zoneID: ${zoneId}, difficulty: ${d.id}, metric: dps`));
  }
  const firstBoss = zone?.encounters?.[0];
  if (firstBoss) {
    attempts.push(await tryArgs(`encounter ${firstBoss.name}`, "encounterRankings", `encounterID: ${firstBoss.id}, metric: dps`));
  }

  return { base: BASE, queried: { name, server, region, zoneId }, zone, attempts };
}

export type CharacterParse = {
  bestPerfAvg: number | null;
  medianPerfAvg: number | null;
  killsLogged: number | null;
  byBoss: Array<{ boss: string; best: number | null; kills: number | null }>;
  raw: unknown;
};

/**
 * Fetch a character's SSC/TK zoneRankings ("Best Perf. Avg" etc.). Returns
 * null when the character isn't found or has no logged kills.
 */
/** WCL ranking metric for a roster role. Healers rank by HPS, everyone
 *  else (dps + tanks) by DPS — matching the default WCL character page. */
export function metricForRole(role: string): "dps" | "hps" {
  return role === "heal" ? "hps" : "dps";
}

export async function fetchCharacterParse(
  name: string,
  realm: string,
  region: string,
  zoneId: number,
  metric: "dps" | "hps" = "dps",
): Promise<CharacterParse | null> {
  const data = await gql<{
    characterData: { character: { zoneRankings: unknown } | null } | null;
  }>(
    `query($name:String!,$server:String!,$region:String!,$zone:Int!,$metric:CharacterPageRankingMetricType!){
       characterData{ character(name:$name, serverSlug:$server, serverRegion:$region){
         zoneRankings(zoneID:$zone, metric: $metric)
       } }
     }`,
    { name, server: serverSlug(realm), region, zone: zoneId, metric },
  );

  const zr = data.characterData?.character?.zoneRankings as
    | {
        bestPerformanceAverage?: number | null;
        medianPerformanceAverage?: number | null;
        rankings?: Array<{ encounter?: { name?: string }; rankPercent?: number | null; totalKills?: number | null }>;
      }
    | null
    | undefined;

  if (!zr) return null;
  const rankings = zr.rankings ?? [];
  const kills = rankings.reduce((sum, r) => sum + (r.totalKills ?? 0), 0);
  if ((zr.bestPerformanceAverage == null) && kills === 0) return null;

  return {
    bestPerfAvg: zr.bestPerformanceAverage ?? null,
    medianPerfAvg: zr.medianPerformanceAverage ?? null,
    killsLogged: kills || null,
    byBoss: rankings.map(r => ({
      boss: r.encounter?.name ?? "?",
      best: r.rankPercent ?? null,
      kills: r.totalKills ?? null,
    })),
    raw: zr,
  };
}
