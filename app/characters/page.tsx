import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import CharactersClient from "./CharactersClient";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const chars = await prisma.character.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return <CharactersClient initial={chars} admin={await isAdmin()} />;
}
