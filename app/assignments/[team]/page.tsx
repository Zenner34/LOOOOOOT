import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Graceful landing for pre-BT/Hyjal bookmarks (/assignments/<team-slug>).
// The team sheets moved to /admin/assignments — send admins there with
// the slug intact; everyone else gets the live phase sheet.
export default async function LegacyTeamRedirect({
  params,
}: {
  params: { team: string };
}) {
  if (await isAdmin()) {
    redirect(`/admin/assignments/${encodeURIComponent(decodeURIComponent(params.team))}`);
  }
  redirect("/assignments");
}
