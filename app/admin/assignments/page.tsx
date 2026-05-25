import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Legacy route. Assignments now live at /assignments/<team-slug>. Redirect
// old bookmarks (/admin/assignments?team=<id>) to the slug URL.
export default async function LegacyAssignmentsRedirect({
  searchParams,
}: {
  searchParams: { team?: string };
}) {
  const id = Number(searchParams.team);
  if (id) {
    const team = await prisma.raidTeam.findUnique({ where: { id }, select: { slug: true } });
    if (team) redirect(`/assignments/${team.slug}`);
  }
  redirect("/assignments");
}
