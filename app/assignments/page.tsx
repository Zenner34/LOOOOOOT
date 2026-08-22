import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { PHASE_SLUG } from "@/lib/raid-helper";
import PhaseAssignmentsClient from "./PhaseAssignmentsClient";

export const dynamic = "force-dynamic";

// The live Black Temple / Mount Hyjal assignment sheet. Standalone from
// the Player/Character tables — the roster is imported from Raid-Helper's
// composition export by an admin; raiders get the read-only view. The
// previous SSC/TK team sheets live on at /admin/assignments.
export default async function AssignmentsPage() {
  const [admin, sheet] = await Promise.all([
    isAdmin(),
    prisma.phaseSheet.findUnique({ where: { slug: PHASE_SLUG } }),
  ]);

  return (
    <PhaseAssignmentsClient
      raw={(sheet?.data as unknown) ?? null}
      admin={admin}
    />
  );
}
