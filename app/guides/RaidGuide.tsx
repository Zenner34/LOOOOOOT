"use client";

import { useState } from "react";
import BossGuide from "./BossGuide";
import { Select } from "@/app/components/Select";
import type { Boss } from "./types";

/* One raid's guide: a boss dropdown that swaps the rendered BossGuide.
   Shared by every raid — pass its boss list + an aria label. */
export default function RaidGuide({ bosses, ariaLabel }: { bosses: Boss[]; ariaLabel: string }) {
  const [bossId, setBossId] = useState(bosses[0]?.id ?? "");
  const boss = bosses.find(b => b.id === bossId) ?? bosses[0];
  if (!boss) return null;

  const options = bosses.map((b, i) => ({
    value: b.id,
    label: (
      <span className="inline-flex items-center gap-2.5">
        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-bold"
          style={{ background: `${b.accent}22`, color: b.accent, boxShadow: `inset 0 0 0 1px ${b.accent}55` }}
        >
          {i + 1}
        </span>
        <span className="font-semibold">{b.name}</span>
        <span className="text-[11px] text-neutral-500 hidden sm:inline">· {b.role}</span>
      </span>
    ),
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Boss</span>
        <Select
          value={bossId}
          onValueChange={setBossId}
          options={options}
          ariaLabel={ariaLabel}
          triggerClassName="w-full sm:w-80"
        />
      </div>

      <BossGuide key={boss.id} boss={boss} />
    </div>
  );
}
