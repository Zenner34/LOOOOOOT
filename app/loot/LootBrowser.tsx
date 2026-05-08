"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WowheadItemCell } from "@/lib/wowhead";
import { iconFor } from "@/lib/wowhead-lookup";

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
  selectedPhaseFilter,
  selectedRaidId,
  selectedBossId,
  items,
  classColor,
}: {
  phases: Phase[];
  selectedPhaseFilter: number | "all";
  selectedRaidId: number;
  selectedBossId: number;
  items: Item[];
  classColor: Record<string, string>;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function go(qs: { phaseFilter?: number | "all"; raid?: number; boss?: number }) {
    const sp = new URLSearchParams();
    const pf = qs.phaseFilter ?? selectedPhaseFilter;
    if (pf !== "all") sp.set("phaseFilter", String(pf));
    if (qs.raid)  sp.set("raid",  String(qs.raid));
    if (qs.boss)  sp.set("boss",  String(qs.boss));
    router.push(`/loot?${sp.toString()}`);
  }

  const visiblePhases = useMemo(() => {
    if (selectedPhaseFilter === "all") return phases;
    return phases.filter(p => p.id === selectedPhaseFilter);
  }, [phases, selectedPhaseFilter]);

  const selectedRaid = phases
    .flatMap(p => p.raids)
    .find(r => r.id === selectedRaidId);
  const selectedBoss = selectedRaid?.bosses.find(b => b.id === selectedBossId);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(it =>
      it.name.toLowerCase().includes(q) ||
      (it.slot ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="heading-eyebrow">Browse</span>
          <h1 className="text-2xl font-bold tracking-tight">Loot catalog</h1>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-4 panel p-3 max-h-[80vh] overflow-auto space-y-3">
          <div>
            <label className="label">Phase filter</label>
            <select
              className="input"
              value={String(selectedPhaseFilter)}
              onChange={e => {
                const v = e.target.value;
                go({ phaseFilter: v === "all" ? "all" : Number(v) });
              }}
            >
              <option value="all">All Phases</option>
              {phases.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="-mx-1 pt-1">
            {visiblePhases.map(phase => (
              <div key={phase.id} className="mb-3 px-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-400/80 mb-1">
                  {phase.name}
                </div>
                {phase.raids.map(raid => {
                  const isRaidActive = raid.id === selectedRaidId;
                  return (
                    <div key={raid.id} className="mb-2">
                      <div className={`text-sm font-semibold ${isRaidActive ? "text-amber-300" : "text-neutral-200"}`}>
                        {raid.name}
                      </div>
                      <ul className="ml-2 mt-0.5 border-l border-white/5">
                        {raid.bosses.map(b => {
                          const isActive = b.id === selectedBossId;
                          return (
                            <li key={b.id}>
                              <button
                                onClick={() => go({ phaseFilter: selectedPhaseFilter, raid: raid.id, boss: b.id })}
                                className={`block w-full text-left pl-3 pr-2 py-1 -ml-px border-l-2 text-sm transition ${
                                  isActive
                                    ? "border-amber-400 text-amber-300 font-semibold bg-amber-400/[0.04]"
                                    : "border-transparent text-neutral-300 hover:text-amber-200 hover:bg-white/[0.02]"
                                }`}
                              >
                                {b.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-8 panel max-h-[80vh] overflow-auto">
          <div className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                className="input"
                placeholder="Search items… (name or slot)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {selectedBoss && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">{selectedRaid?.name}</span>
                <span className="text-xs text-neutral-700">·</span>
                <span className="text-sm font-semibold text-neutral-200">{selectedBoss.name}</span>
                <span className="pill ml-2">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          {!selectedBoss ? (
            <div className="px-6 py-16 text-center text-neutral-400 text-sm">
              <div className="mb-3 text-3xl opacity-50">⌖</div>
              Pick a boss from the sidebar to see its drops and award history.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-16 text-center text-neutral-500 text-sm">
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
                {filteredItems.map(it => (
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
        </section>
      </div>
    </div>
  );
}
