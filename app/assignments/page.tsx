import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  isPhaseDayKey,
  nextPhaseDayKey,
  PHASE_DAYS,
  PHASE_SLUG,
  phaseDaySlug,
  type PhaseDayKey,
} from "@/lib/raid-helper";
import PhaseAssignmentsClient from "./PhaseAssignmentsClient";

export const dynamic = "force-dynamic";

// The live Black Temple / Mount Hyjal assignment sheets — one per raid
// night (Tuesday / Thursday / Sunday), each imported independently from
// Raid-Helper so setting one day never touches the others. Standalone
// from the Player/Character tables; raiders get the read-only view. The
// previous SSC/TK team sheets live on at /admin/assignments.
export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const slugs = [PHASE_SLUG, ...PHASE_DAYS.map(d => phaseDaySlug(d.key))];
  const [admin, sheets] = await Promise.all([
    isAdmin(),
    prisma.phaseSheet.findMany({ where: { slug: { in: slugs } } }),
  ]);

  const bySlug = new Map(sheets.map(s => [s.slug, s.data as unknown]));
  // The pre-day single sheet reads as Tuesday until a Tuesday row exists.
  const legacy = bySlug.get(PHASE_SLUG) ?? null;
  const rawByDay = {} as Record<PhaseDayKey, unknown>;
  for (const d of PHASE_DAYS) {
    rawByDay[d.key] =
      bySlug.get(phaseDaySlug(d.key)) ?? (d.key === "tuesday" ? legacy : null);
  }

  // ?day= deep link wins; otherwise open on the next upcoming raid day.
  const initialDay = isPhaseDayKey(searchParams.day)
    ? searchParams.day
    : nextPhaseDayKey(new Date());

  return (
    <PhaseAssignmentsClient
      rawByDay={rawByDay}
      admin={admin}
      initialDay={initialDay}
    />
  );
}
