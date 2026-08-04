"use client";

import { useState } from "react";
import BossGuide from "../BossGuide";
import { BT_BOSSES } from "./bosses";

export default function BlackTempleGuide() {
  const [bossId, setBossId] = useState(BT_BOSSES[0].id);
  const boss = BT_BOSSES.find(b => b.id === bossId) ?? BT_BOSSES[0];

  return (
    <div className="space-y-5">
      {/* Boss rail — the 9 Black Temple encounters in kill order */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {BT_BOSSES.map((b, i) => {
          const on = b.id === bossId;
          return (
            <button
              key={b.id}
              onClick={() => setBossId(b.id)}
              className={`group shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition ${
                on ? "shadow-card" : "border-white/[0.06] bg-[var(--surface)] hover:border-white/12 hover:bg-white/[0.02]"
              }`}
              style={on ? { borderColor: `${b.accent}55`, background: `${b.accent}12` } : undefined}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold transition"
                  style={{
                    background: on ? `${b.accent}22` : "rgba(255,255,255,0.04)",
                    color: on ? b.accent : "rgba(255,255,255,0.45)",
                    boxShadow: on ? `inset 0 0 0 1px ${b.accent}66` : "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className={`text-[10px] uppercase tracking-wider ${on ? "" : "text-neutral-500"}`} style={on ? { color: b.accent } : undefined}>
                    {b.role}
                  </div>
                  <div className={`text-sm font-semibold whitespace-nowrap ${on ? "text-neutral-50" : "text-neutral-300 group-hover:text-neutral-100"}`}>
                    {b.name}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BossGuide key={boss.id} boss={boss} />
    </div>
  );
}
