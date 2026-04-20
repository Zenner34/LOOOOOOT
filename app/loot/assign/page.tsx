import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import AssignClient from "./AssignClient";

export const dynamic = "force-dynamic";

export default async function AssignPage() {
  const [phases, rosters, recent] = await Promise.all([
    prisma.phase.findMany({
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
  return <AssignClient phases={phases} rosters={rosters} recent={recent} admin={await isAdmin()} />;
}
