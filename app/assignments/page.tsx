import { redirect } from "next/navigation";
import { isPhaseDayKey, nextPhaseDayKey } from "@/lib/raid-helper";

export const dynamic = "force-dynamic";

// Each raid night lives at its own URL — the bare /assignments (and the
// old ?day= links) forward to the next upcoming raid night, today
// included.
export default function AssignmentsIndex({
  searchParams,
}: {
  searchParams: { day?: string };
}) {
  const day = isPhaseDayKey(searchParams.day)
    ? searchParams.day
    : nextPhaseDayKey(new Date());
  redirect(`/assignments/${day}`);
}
