import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { parsePhaseParam, phaseWhere } from "@/lib/phases";
import AssignClient from "./AssignClient";

export const dynamic = "force-dynamic";

export default async function AssignPage({
  searchParams,
}: {
  searchParams: { phase?: string };
}) {
  // Send non-admins to login rather than rendering an empty admin shell.
  if (!(await isAdmin())) {
    redirect("/login?next=/loot/assign");
  }
  const phaseFilter = parsePhaseParam(searchParams.phase);
  const [phases, allPhases, rosters, recent] = await Promise.all([
    prisma.phase.findMany({
      where: phaseWhere(phaseFilter),
      orderBy: { order: "asc" },
      include: {
        raids: {
          orderBy: { order: "asc" },
          include: {
            bosses: {
              orderBy: { order: "asc" },
              include: {
                items: {
                  orderBy: { name: "asc" },
                  include: { weights: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.phase.findMany({
      orderBy: { order: "asc" },
      select: { order: true, name: true },
    }),
    prisma.roster.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        members: { include: { character: true }, orderBy: { character: { name: "asc" } } },
        raidNights: { orderBy: { date: "desc" }, take: 25 },
      },
    }),
    prisma.lootAward.findMany({
      take: 20,
      orderBy: { awardedAt: "desc" },
      include: { item: true, character: true, roster: true },
    }),
  ]);
  return (
    <AssignClient
      phases={phases}
      rosters={rosters}
      recent={recent}
      admin={true}
      allPhases={allPhases}
      phaseFilterParam={searchParams.phase ?? null}
    />
  );
}
