"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WowheadItemCell } from "@/lib/wowhead";
import { iconFor } from "@/lib/wowhead-lookup";
import { ClassName } from "@/app/components/ClassIcon";

type Boss = { id: number; name: string };
type Raid = { id: number; name: string; shortName: string; bosses: Boss[] };
type Phase = { id: number; name: string; order: number; raids: Raid[] };

type Award = {
  id: number;
  awardedAt: string | Date;
  character: { name: string; class: string };
  roster: { name: string };
};
type Item = {
  id: number;
  name: string;
  slot: string | null;
  itemLevel: number | null;
  wowheadId: number | null;
  awards: Award[];
};

export default function LootBrowser({
  phases,
  selectedPhaseId,
  selectedRaidId,
  selectedBossId,
  items,
  classColor,
}: {
  phases: Phase[];
  selectedPhaseId: number;
  selectedRaidId: number;
  selectedBossId: number;
  items: Item[];
  classColor: Record<string, string>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const selectedPhase = phases.find(p => p.id === selectedPhaseId) ?? phases[0];
  const selectedRaid  = selectedPhase?.raids.find(r => r.id === selectedRaidId);
  const selectedBoss  = selectedRaid?.bosses.find(b => b.id === selectedBossId);

  function go(qs: { phase?: number; raid?: number; boss?: number }) {
    const sp = new URLSearchParams();
    if (qs.phase) sp.set("phase", String(qs.phase));
    if (qs.raid)  sp.set("raid",  String(qs.raid));
    if (qs.boss)  sp.set("boss",  String(qs.boss));
    router.push(`/loot?${sp.toString()}`);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(it =>
      it.name.toLowerCase().includes(q) ||
      (it.slot ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <span className="heading-eyebrow">Browse</span>
        <h1 className="text-2xl font-bold tracking-tight">Loot catalog</h1>
        <p className="text-sm text-neutral-400">Filter by phase, then drill into a raid → boss to see drops and award history.</p>
      </div>

      <div className="panel p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px]">
            <label className="label">Phase</label>
            <select
              className="input"
              value={selectedPhaseId}
              onChange={e => go({ phase: Number(e.target.value) })}
            >
              {phases.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label">Search items</label>
            <input
              className="input"
              placeholder="e.g. Despair, leggings, sword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {selectedPhase && (
          <div>
            <div className="label mb-2">Raid</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedPhase.raids.map(r => (
                <button
                  key={r.id}
                  onClick={() => go({ phase: selectedPhase.id, raid: r.id })}
                  className={r.id === selectedRaidId ? "chip-active" : "chip"}
                  title={r.name}
                >
                  <span className="font-bold tracking-wider opacity-90">{r.shortName}</span>
                  <span className="hidden sm:inline opacity-70">· {r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRaid && (
          <div>
            <div className="label mb-2">Boss</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedRaid.bosses.map(b => (
                <button
                  key={b.id}
                  onClick={() => go({ phase: selectedPhase!.id, raid: selectedRaid.id, boss: b.id })}
                  className={b.id === selectedBossId ? "chip-active" : "chip"}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
              {selectedBoss ? selectedBoss.name : "Drops"}
            </h2>
            {selectedBoss && filtered.length > 0 && (
              <span className="pill">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {selectedRaid && (
            <span className="text-xs text-neutral-500">{selectedRaid.name}</span>
          )}
        </div>

        {!selectedBoss ? (
          <div className="px-6 py-12 text-center text-neutral-400 text-sm">
            <div className="mb-2 text-2xl">⌖</div>
            Select a raid above and then a boss to see its drop table.
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-neutral-500 text-sm">
            {items.length === 0 ? "No items seeded for this boss yet." : "No items match your search."}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Slot</th>
                <th className="text-right">iLvl</th>
                <th>Awarded to</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(it => (
                <tr key={it.id}>
                  <td>
                    <WowheadItemCell
                      name={it.name}
                      wowheadId={it.wowheadId}
                      iconName={iconFor(it.name)}
                    />
                  </td>
                  <td className="text-neutral-400 text-xs">{it.slot ?? ""}</td>
                  <td className="text-right tabular-nums text-neutral-500 text-xs">{it.itemLevel ?? ""}</td>
                  <td className="text-xs">
                    {it.awards.length === 0 ? (
                      <span className="text-neutral-600">—</span>
                    ) : (
                      <ul className="space-y-0.5">
                        {it.awards.slice(0, 4).map(a => (
                          <li key={a.id}>
                            <span style={{ color: classColor[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                            <span className="text-neutral-500"> · {a.roster.name} · {new Date(a.awardedAt).toISOString().slice(0,10)}</span>
                          </li>
                        ))}
                        {it.awards.length > 4 && (
                          <li className="text-neutral-500">+{it.awards.length - 4} more</li>
                        )}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
