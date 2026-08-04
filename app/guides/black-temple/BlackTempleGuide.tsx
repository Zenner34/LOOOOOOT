"use client";

import { useState } from "react";
import BossGuide from "../BossGuide";
import { BT_BOSSES } from "./bosses";
import { Select } from "@/app/components/Select";

export default function BlackTempleGuide() {
  const [bossId, setBossId] = useState(BT_BOSSES[0].id);
  const boss = BT_BOSSES.find(b => b.id === bossId) ?? BT_BOSSES[0];

  const options = BT_BOSSES.map((b, i) => ({
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
      {/* Boss selector */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Boss</span>
        <Select
          value={bossId}
          onValueChange={setBossId}
          options={options}
          ariaLabel="Select a Black Temple boss"
          triggerClassName="w-full sm:w-80"
        />
      </div>

      <BossGuide key={boss.id} boss={boss} />
    </div>
  );
}
