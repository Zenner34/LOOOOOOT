"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WowheadItemCell } from "@/lib/wowhead";
import { iconFor } from "@/lib/wowhead-lookup";
import { Select } from "@/app/components/Select";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Package } from "@/app/components/ui/Icon";

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
  const [pickerOpen, setPickerOpen] = useState(false);

  function go(qs: { phaseFilter?: number | "all"; raid?: number; boss?: number }) {
    const sp = new URLSearchParams();
    const pf = qs.phaseFilter ?? selectedPhaseFilter;
    if (pf !== "all") sp.set("phaseFilter", String(pf));
    if (qs.raid)  sp.set("raid",  String(qs.raid));
    if (qs.boss)  sp.set("boss",  String(qs.boss));
    router.push(`/loot?${sp.toString()}`);
    setPickerOpen(false);
  }

  // Lock body scroll when mobile picker is open + close on Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPickerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

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

  const sidebarTree = (
    <>
      <div>
        <label className="label">Phase filter</label>
        <Select
          value={String(selectedPhaseFilter)}
          onValueChange={v => go({ phaseFilter: v === "all" ? "all" : Number(v) })}
          options={[
            { value: "all", label: "All Phases" },
            ...phases.map(p => ({ value: String(p.id), label: p.name })),
          ]}
        />
      </div>

      <div className="-mx-1 pt-1">
        {visiblePhases.map(phase => (
          <div key={phase.id} className="mb-3 px-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1">
              {phase.name}
            </div>
            {phase.raids.map(raid => {
              const isRaidActive = raid.id === selectedRaidId;
              return (
                <div key={raid.id} className="mb-2">
                  <div className={`text-sm font-semibold ${isRaidActive ? "text-vermillion-200" : "text-neutral-200"}`}>
                    {raid.name}
                  </div>
                  <ul className="ml-2 mt-0.5 border-l border-white/5">
                    {raid.bosses.map(b => {
                      const isActive = b.id === selectedBossId;
                      return (
                        <li key={b.id}>
                          <button
                            onClick={() => go({ phaseFilter: selectedPhaseFilter, raid: raid.id, boss: b.id })}
                            className={`block w-full text-left pl-3 pr-2 py-2 -ml-px border-l-2 text-sm transition min-h-[36px] ${
                              isActive
                                ? "border-vermillion-500 text-vermillion-200 font-semibold bg-vermillion-500/[0.06]"
                                : "border-transparent text-neutral-300 hover:text-vermillion-200 active:text-vermillion-200 hover:bg-white/[0.02]"
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
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Browse"
        title="Loot catalog"
        subtitle="Every drop in the seed catalog, organised by phase, raid, and boss."
      />

      {/* Mobile: trigger button to open picker sheet */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="lg:hidden w-full panel px-4 py-3 flex items-center justify-between text-left active:bg-white/[0.03] transition min-h-[52px]"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">Pick a boss</div>
          {selectedBoss ? (
            <div className="mt-0.5 text-sm font-semibold text-neutral-100 truncate">
              {selectedRaid?.name} · {selectedBoss.name}
            </div>
          ) : (
            <div className="mt-0.5 text-sm text-neutral-400">Tap to choose a phase, raid, and boss</div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 ml-2 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Mobile slide-in sheet */}
      {pickerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setPickerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-[var(--surface)] border-r border-white/10 shadow-2xl animate-fade-in flex flex-col">
            <div className="px-4 h-14 flex items-center justify-between border-b border-white/5 flex-shrink-0">
              <span className="font-bold text-vermillion-200">Phase · Raid · Boss</span>
              <button
                onClick={() => setPickerOpen(false)}
                className="btn-ghost btn-xs"
                aria-label="Close picker"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {sidebarTree}
            </div>
          </aside>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block col-span-4 panel p-3 max-h-[80vh] overflow-auto space-y-3">
          {sidebarTree}
        </aside>

        <section className="col-span-12 lg:col-span-8 panel lg:max-h-[80vh] overflow-auto">
          <div className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur-sm border-b border-white/5 px-3 sm:px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                className="input"
                placeholder="Search items… (name or slot)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {selectedBoss && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-neutral-500 hidden sm:inline truncate">{selectedRaid?.name}</span>
                <span className="text-xs text-neutral-700 hidden sm:inline">·</span>
                <span className="text-sm font-semibold text-neutral-200 truncate">{selectedBoss.name}</span>
                <span className="pill ml-1 flex-shrink-0">{filteredItems.length}</span>
              </div>
            )}
          </div>

          {!selectedBoss ? (
            <div className="px-6 py-16 text-center text-neutral-400 text-sm">
              <div className="mb-3 text-3xl opacity-50">⌖</div>
              <span className="lg:hidden">Tap the picker above to choose a boss.</span>
              <span className="hidden lg:inline">Pick a boss from the sidebar to see its drops and award history.</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-3">
              <EmptyState
                icon={Package}
                title={items.length === 0 ? "No items seeded for this boss yet" : "No items match your search"}
                description={items.length === 0 ? "Items appear here once the seed catalog is updated." : "Try a broader query or clear the filter."}
                variant="compact"
              />
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <ul className="md:hidden divide-y divide-white/[0.04]">
                {filteredItems.map(it => (
                  <li key={it.id} className="px-3 py-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <WowheadItemCell
                          name={it.name}
                          wowheadId={it.wowheadId}
                          iconName={iconFor(it.name)}
                          size={28}
                        />
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                          {it.slot && <span>{it.slot}</span>}
                          {it.itemLevel != null && <span className="tabular-nums">iLvl {it.itemLevel}</span>}
                        </div>
                      </div>
                    </div>
                    {it.awards.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-[11px]">
                        {it.awards.slice(0, 4).map(a => (
                          <li key={a.id}>
                            <span style={{ color: classColor[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                            <span className="text-neutral-500"> · {new Date(a.awardedAt).toISOString().slice(0,10)}</span>
                          </li>
                        ))}
                        {it.awards.length > 4 && <li className="text-neutral-500">+{it.awards.length - 4} more</li>}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              {/* Desktop: table */}
              <table className="hidden md:table table">
                <thead className="sticky top-0 z-10 bg-[var(--surface)]/95 backdrop-blur-sm">
                  <tr>
                    <th>Item</th>
                    <th>Slot</th>
                    <th className="text-right">iLvl</th>
                    <th>Awarded to</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(it => (
                    <tr
                      key={it.id}
                      className="group odd:bg-white/[0.012] hover:bg-vermillion-500/[0.04] transition-colors relative"
                    >
                      <td className="relative">
                        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-vermillion-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            </>
          )}
        </section>
      </div>
    </div>
  );
}
