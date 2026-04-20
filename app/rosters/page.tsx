import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import RostersClient from "./RostersClient";

export const dynamic = "force-dynamic";

export default async function RostersPage() {
  const rosters = await prisma.roster.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true, raidNights: true, awards: true } } },
  });
  return <RostersClient initial={rosters} admin={await isAdmin()} />;
}
