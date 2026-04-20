import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import NightClient from "./NightClient";

export const dynamic = "force-dynamic";

export default async function NightPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const night = await prisma.raidNight.findUnique({
    where: { id },
    include: {
      roster: {
        include: {
          members: { include: { character: true }, orderBy: [{ memberRole: "asc" }, { character: { name: "asc" } }] },
        },
      },
      attendance: true,
    },
  });
  if (!night) notFound();
  return <NightClient night={night} admin={await isAdmin()} />;
}
