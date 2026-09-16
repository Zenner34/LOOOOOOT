import type { Metadata } from "next";
import ClassicForeverClient from "./ClassicForeverClient";

export const metadata: Metadata = {
  title: "Classic Forever — Racials for PvE & PvP",
  description:
    "The Warcraft Forever racial rework graded for raiding and PvP, with the class pairings worth rolling for. Pre-release; effects may change.",
};

export default function ClassicForeverPage() {
  return <ClassicForeverClient />;
}
