import { redirect } from "next/navigation";

// Guides landing → default to the first raid.
export default function GuidesIndex() {
  redirect("/guides/black-temple");
}
