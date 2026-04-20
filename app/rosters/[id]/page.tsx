import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import RosterDetailClient from "./RosterDetailClient";

export const dynamic = "force-dynamic";

export default async function RosterDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();
  const [roster, members, allChars] = await Promise.all([
    prisma.roster.findUnique({ where: { id } }),
    prisma.rosterMember.findMany({
      where: { rosterId: id },
      include: { character: true },
      orderBy: [{ memberRole: "asc" }, { character: { name: "asc" } }],
    }),
    prisma.character.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!roster) notFound();
  return (
    <RosterDetailClient
      roster={roster}
      initialMembers={members}
      allCharacters={allChars}
      admin={await isAdmin()}
    />
  );
}
