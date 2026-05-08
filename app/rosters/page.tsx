import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import RostersClient from "./RostersClient";

export const dynamic = "force-dynamic";

export default async function RostersPage() {
  const rosters = await prisma.roster.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true, raidNights: true, awards: true } } },
  });

  // Single master-roster reality: if there is exactly one (the seeded
  // "Master Roster"), jump straight to its detail page. Multi-roster index
  // only renders when extras exist (legacy data from earlier sessions).
  if (rosters.length === 1) {
    redirect(`/rosters/${rosters[0].id}`);
  }

  return <RostersClient initial={rosters} admin={await isAdmin()} />;
}
