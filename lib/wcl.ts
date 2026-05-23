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

// All our characters are on one Fresh server (Nightslayer = WCL server id
// 5213). Looking up by serverID pins the exact server/game-version, which
// serverSlug+serverRegion does not on the shared Fresh host.
const SERVER_ID = Number(process.env.WCL_SERVER_ID) || 5213;

let cachedToken: { value: string; expiresAt: number } | null = null;

export function wclConfigured(): boolean {
  return !!(process.env.WCL_CLIENT_ID && process.env.WCL_CLIENT_SECRET);
}

/* ── v1 REST API (used for Fresh/Classic parses; v2 rejects these zones) ── */
const V1_KEY = process.env.WCL_V1_KEY || "";
const V1_ZONE = Number(process.env.WCL_V1_ZONE_ID) || 1056; // SSC / TK (per-boss)
const V1_SERVER = process.env.WCL_SERVER_SLUG || "nightslayer";
const V1_REGION = process.env.WCL_REGION || "US";
export function v1Configured(): boolean {
  return !!V1_KEY;
}
async function v1Get(path: string, params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), api_key: V1_KEY }).toString();
  const res = await fetch(`${BASE}/v1${path}?${qs}`);
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = text.slice(0, 500); }
  return { status: res.status, json };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

type V1Parse = { encounterID: number; encounterName: string; percentile: number };

/** Average of each boss's best percentile, from a v1 parses array. */
function bestPerfFromParses(json: unknown): { bestPerfAvg: number; medianPerfAvg: number; killsLogged: number; byBoss: Array<{ boss: string; best: number; kills: number }> } | null {
  if (!Array.isArray(json)) return null;
  const parses = (json as V1Parse[]).filter(p => typeof p?.percentile === "number");
  if (parses.length === 0) return null;
  const byBoss = new Map<number, { boss: string; pcts: number[] }>();
  for (const p of parses) {
    const e = byBoss.get(p.encounterID) ?? { boss: p.encounterName, pcts: [] };
    e.pcts.push(p.percentile);
    byBoss.set(p.encounterID, e);
  }
  const median = (a: number[]) => {
    const s = [...a].sort((x, y) => x - y);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const bests = [...byBoss.values()].map(e => Math.max(...e.pcts));
  const meds = [...byBoss.values()].map(e => median(e.pcts));
  return {
    bestPerfAvg: round1(bests.reduce((s, n) => s + n, 0) / bests.length),
    medianPerfAvg: round1(meds.reduce((s, n) => s + n, 0) / meds.length),
    killsLogged: parses.length,
    byBoss: [...byBoss.values()].map(e => ({ boss: e.boss, best: round1(Math.max(...e.pcts)), kills: e.pcts.length })),
  };
}

/**
 * Fetch a character's SSC/TK Best Perf. Avg from the v1 API.
 * `timeframe: historical` matches the WCL character page (percentiles locked
 * at kill time) rather than the lower live "today" percentiles.
 */
export async function fetchCharacterParseV1(
  name: string,
  metric: "dps" | "hps" = "dps",
): Promise<CharacterParse | null> {
  const { status, json } = await v1Get(`/parses/character/${encodeURIComponent(name)}/${V1_SERVER}/${V1_REGION}`,
    { metric, zone: V1_ZONE, timeframe: "historical" });
  if (status !== 200) return null;
  const computed = bestPerfFromParses(json);
  if (!computed) return null;
  return { ...computed, raw: null };
}

/** Diagnostic: try several v1 /parses param combos (all SSC/TK, zone 1056)
 *  and report the computed Best Perf. Avg for each, so we can match the
 *  number shown on the WCL character page. */
export async function wclDebugV1(name: string) {
  if (!v1Configured()) return { error: "WCL_V1_KEY not set" };
  const enc = encodeURIComponent(name);
  async function combo(label: string, params: Record<string, string | number>) {
    const { status, json } = await v1Get(`/parses/character/${enc}/${V1_SERVER}/${V1_REGION}`, { metric: "dps", zone: V1_ZONE, ...params });
    const c = bestPerfFromParses(json);
    return { label, params, status, count: Array.isArray(json) ? json.length : null, bestPerfAvg: c?.bestPerfAvg ?? null, byBoss: c?.byBoss ?? null };
  }
  return {
    base: BASE, v1Zone: V1_ZONE, server: `${V1_SERVER}/${V1_REGION}`,
    combos: [
      await combo("default", {}),
      await combo("bracket=1", { bracket: 1 }),
      await combo("bracket=2", { bracket: 2 }),
      await combo("timeframe=historical", { timeframe: "historical" }),
      await combo("bracket=1,timeframe=historical", { bracket: 1, timeframe: "historical" }),
      await combo("compare=rankings,bracket=1", { compare: "rankings", bracket: 1 }),
    ],
  };
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

/** Methodical diagnostic: query the character BY ID (no lookup variance),
 *  vary one argument at a time (no difficulty — TBC has none), and dump the
 *  full raw result for each. charId/zoneId overridable via the route. */
export async function wclDebug(charId: number, zoneId: number) {
  async function probe(label: string, field: "zoneRankings" | "encounterRankings", args: string) {
    try {
      const r = await gql<{ characterData: { character: Record<string, unknown> | null } | null }>(
        `query{ characterData{ character(id: ${charId}){ id name ${field}(${args}) } } }`, {},
      );
      const char = r.characterData?.character ?? null;
      return { label, field, args, character: char ? { id: char.id, name: char.name } : null, result: char?.[field] ?? null };
    } catch (e) {
      return { label, field, args, error: (e as Error).message };
    }
  }

  const tests = [
    await probe("A zone min",        "zoneRankings",      `zoneID: ${zoneId}`),
    await probe("B zone+dps",        "zoneRankings",      `zoneID: ${zoneId}, metric: dps`),
    await probe("C zone+P2",         "zoneRankings",      `zoneID: ${zoneId}, partition: 2`),
    await probe("D zone+P2+dps",     "zoneRankings",      `zoneID: ${zoneId}, partition: 2, metric: dps`),
    await probe("E encounter min",   "encounterRankings", `encounterID: 623`),
    await probe("F encounter+dps",   "encounterRankings", `encounterID: 623, metric: dps`),
  ];
  return { base: BASE, charId, zoneId, tests };
}

let cachedServer: { slug: string; region: string } | null = null;

/** Resolve WCL server id (5213) → its canonical { slug, region } for the
 *  character lookup. Cached for the process. */
export async function resolveServer(): Promise<{ slug: string; region: string }> {
  if (cachedServer) return cachedServer;
  const d = await gql<{ worldData: { server: { slug: string; name: string; region: { slug: string; compactName?: string } } | null } }>(
    `query($id:Int!){ worldData{ server(id:$id){ id name slug region{ slug compactName } } } }`,
    { id: SERVER_ID },
  );
  const s = d.worldData?.server;
  if (!s) throw new Error(`No WCL server with id ${SERVER_ID}`);
  cachedServer = { slug: s.slug, region: s.region.compactName || s.region.slug };
  return cachedServer;
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
  zoneId: number,
  metric: "dps" | "hps" = "dps",
): Promise<CharacterParse | null> {
  const { slug, region } = await resolveServer();
  const data = await gql<{
    characterData: { character: { zoneRankings: unknown } | null } | null;
  }>(
    `query($name:String!,$server:String!,$region:String!,$zone:Int!,$metric:CharacterPageRankingMetricType!){
       characterData{ character(name:$name, serverSlug:$server, serverRegion:$region){
         zoneRankings(zoneID:$zone, metric: $metric)
       } }
     }`,
    { name, server: slug, region, zone: zoneId, metric },
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
