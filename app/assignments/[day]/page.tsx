import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import {
  isPhaseDayKey,
  PHASE_DAYS,
  PHASE_SLUG,
  phaseDaySlug,
  type PhaseDayKey,
} from "@/lib/raid-helper";
import PhaseAssignmentsClient from "../PhaseAssignmentsClient";

export const dynamic = "force-dynamic";

// Each raid night owns its URL (/assignments/tuesday|thursday|sunday),
// so shared links preview and open the right night. Anything else in
// this segment is a pre-BT/Hyjal team-slug bookmark: admins go to the
// archived sheet, everyone else to the live one.
export function generateMetadata({ params }: { params: { day: string } }): Metadata {
  const seg = decodeURIComponent(params.day);
  if (!isPhaseDayKey(seg)) return {};
  const label = PHASE_DAYS.find(d => d.key === seg)!.label;
  const title = `${label} Assignments — BT/Hyjal`;
  const description = `Rising Sun raid assignments for ${label} — Black Temple & Mount Hyjal: groups, buffs, tanks, and every boss.`;
  return { title, description, openGraph: { title, description } };
}

export default async function DayAssignmentsPage({
  params,
}: {
  params: { day: string };
}) {
  const seg = decodeURIComponent(params.day);

  if (!isPhaseDayKey(seg)) {
    // Legacy /assignments/<team-slug> bookmark.
    if (await isAdmin()) redirect(`/admin/assignments/${encodeURIComponent(seg)}`);
    redirect("/assignments");
  }
  const day = seg as PhaseDayKey;

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

  return (
    <PhaseAssignmentsClient
      rawByDay={rawByDay}
      admin={admin}
      initialDay={day}
    />
  );
}
