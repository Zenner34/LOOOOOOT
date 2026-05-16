import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { lootAwardPhaseWhere, parsePhaseParam } from "@/lib/phases";
import AdminLootClient from "./AdminLootClient";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 50;

function parseDate(s: string | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  return isNaN(d.getTime()) ? null : d;
}

export default async function AdminLootPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    from?: string;
    to?: string;
    roster?: string;
    phase?: string;
    sort?: "dateAsc" | "dateDesc";
    page?: string;
  };
}) {
  if (!(await isAdmin())) redirect("/login?next=/admin/loot");

  // ── filters ────────────────────────────────────────────────────────────
  const query = (searchParams.q ?? "").trim();
  const from = parseDate(searchParams.from);
  const to = parseDate(searchParams.to);
  const rosterId = searchParams.roster && searchParams.roster !== "all"
    ? Number(searchParams.roster)
    : null;
  const phaseFilter = parsePhaseParam(searchParams.phase);
  const sort: "dateAsc" | "dateDesc" =
    searchParams.sort === "dateAsc" ? "dateAsc" : "dateDesc";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * DEFAULT_PAGE_SIZE;

  // ── where clause ───────────────────────────────────────────────────────
  // Multi-word AND search across item.name / character.name /
  // character.player.displayName. Each token is an OR over the three
  // fields; tokens AND-together.
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  const tokenAnds = tokens.map(t => ({
    OR: [
      { item: { name: { contains: t, mode: "insensitive" as const } } },
      { character: { name: { contains: t, mode: "insensitive" as const } } },
      { character: { player: { displayName: { contains: t, mode: "insensitive" as const } } } },
    ],
  }));

  const where = {
    ...(tokens.length > 0 ? { AND: tokenAnds } : {}),
    ...(from || to ? {
      awardedAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1) } : {}),
      },
    } : {}),
    ...(rosterId ? { rosterId } : {}),
    ...lootAwardPhaseWhere(phaseFilter),
  };

  // ── fetch ──────────────────────────────────────────────────────────────
  const [awards, total, rosters, phases, charsForRoster] = await Promise.all([
    prisma.lootAward.findMany({
      where,
      orderBy: { awardedAt: sort === "dateAsc" ? "asc" : "desc" },
      take: DEFAULT_PAGE_SIZE,
      skip,
      include: {
        item: { include: { boss: { include: { raid: true } } } },
        character: { include: { player: true } },
        roster: true,
        raidNight: true,
      },
    }),
    prisma.lootAward.count({ where }),
    prisma.roster.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          include: { character: { include: { player: true } } },
          orderBy: { character: { name: "asc" } },
        },
        raidNights: { orderBy: { date: "desc" }, take: 60 },
      },
    }),
    prisma.phase.findMany({
      orderBy: { order: "asc" },
      select: { order: true, name: true },
    }),
    // (Reserved for future per-roster character lookups in the modal.)
    Promise.resolve([]),
  ]);

  return (
    <AdminLootClient
      awards={awards.map(a => ({
        id: a.id,
        awardedAt: a.awardedAt.toISOString(),
        notes: a.notes,
        item: {
          id: a.item.id,
          name: a.item.name,
          wowheadId: a.item.wowheadId,
          slot: a.item.slot,
          boss: { name: a.item.boss.name, raid: { shortName: a.item.boss.raid.shortName, name: a.item.boss.raid.name } },
        },
        character: {
          id: a.character.id,
          name: a.character.name,
          class: a.character.class,
          spec: a.character.spec,
          playerId: a.character.playerId,
          playerName: a.character.player?.displayName ?? null,
        },
        roster: { id: a.roster.id, name: a.roster.name },
        raidNight: a.raidNight
          ? { id: a.raidNight.id, date: a.raidNight.date.toISOString().slice(0, 10), notes: a.raidNight.notes }
          : null,
      }))}
      total={total}
      page={page}
      pageSize={DEFAULT_PAGE_SIZE}
      rosters={rosters.map(r => ({
        id: r.id,
        name: r.name,
        characters: r.members.map(m => ({
          id: m.character.id,
          name: m.character.name,
          class: m.character.class,
          spec: m.character.spec,
          isMain: m.character.isMain,
          playerId: m.character.playerId,
          playerName: m.character.player?.displayName ?? null,
        })),
        raidNights: r.raidNights.map(n => ({
          id: n.id,
          date: n.date.toISOString().slice(0, 10),
          notes: n.notes,
        })),
      }))}
      phases={phases}
      filters={{
        q: query,
        from: searchParams.from ?? null,
        to: searchParams.to ?? null,
        roster: searchParams.roster ?? null,
        phase: searchParams.phase ?? null,
        sort,
      }}
    />
  );
}
