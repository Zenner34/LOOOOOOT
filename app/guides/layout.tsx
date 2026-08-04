import { type ReactNode } from "react";
import { PageHeader } from "@/app/components/ui/PageHeader";
import GuidesNav from "./GuidesNav";

export const metadata = { title: "Raid Guides · Rising Sun" };

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Strategy"
        title="Raid Guides"
        subtitle="Boss-by-boss strategy handbooks for the next phase of Burning Crusade Classic. Read it before pull, reference it between attempts."
      />
      <GuidesNav />
      {children}
    </div>
  );
}
