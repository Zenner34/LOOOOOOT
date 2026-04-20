import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import AttendanceIndexClient from "./AttendanceIndexClient";

export const dynamic = "force-dynamic";

export default async function AttendanceIndex() {
  const [rosters, nights] = await Promise.all([
    prisma.roster.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.raidNight.findMany({
      orderBy: { date: "desc" },
      include: { roster: true, _count: { select: { attendance: true, awards: true } } },
    }),
  ]);
  return <AttendanceIndexClient rosters={rosters} nights={nights} admin={await isAdmin()} />;
}
