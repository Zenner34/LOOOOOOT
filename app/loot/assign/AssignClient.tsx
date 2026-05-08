"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { WowheadLink } from "@/lib/wowhead";
import { Select } from "@/app/components/Select";

type Weight = { spec: string; weight: number };
type Item = { id: number; name: string; slot: string | null; itemLevel: number | null; wowheadId: number | null; weights: Weight[] };
type Boss = { id: number; name: string; items: Item[] };
type Raid = { id: number; name: string; shortName: string; bosses: Boss[] };
type Phase = { id: number; name: string; raids: Raid[] };
type Character = { id: number; name: string; class: string; spec: string; role: string };
type Member = { characterId: number; memberRole: string; character: Character };
type RaidNight = { id: number; date: string | Date; rosterId: number };
type Roster = { id: number; name: string; members: Member[]; raidNights: RaidNight[] };
type Award = {
  id: number;
  item: { id: number; name: string; wowheadId: number | null };
  character: { id: number; name: string; class: string };
  roster: { id: number; name: string };
  awardedAt: string | Date;
};

export default function AssignClient({ phases, rosters, recent, admin }: {
  phases: Phase[]; rosters: Roster[]; recent: Award[]; admin: boolean;
}) {
  const [rosterId, setRosterId] = useState<number | "">(rosters[0]?.id ?? "");
  const activeRoster = rosters.find(r => r.id === rosterId);
  const [raidNightId, setRaidNightId] = useState<number | "">(
    activeRoster?.raidNights[0]?.id ?? "",
  );
  const [expandedRaids, setExpandedRaids] = useState<Record<number, boolean>>({});
  const [selectedBossId, setSelectedBossId] = useState<number | null>(null);
  const [awards, setAwards] = useState<Award[]>(recent);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);

  useEffect(() => {
    const r = rosters.find(x => x.id === rosterId);
    setRaidNightId(r?.raidNights[0]?.id ?? "");
  }, [rosterId, rosters]);

  const bossIndex = useMemo(() => {
    const map = new Map<number, { phase: Phase; raid: Raid; boss: Boss }>();
    for (const p of phases) for (const r of p.raids) for (const b of r.bosses) map.set(b.id, { phase: p, raid: r, boss: b });
    return map;
  }, [phases]);

  const selected = selectedBossId ? bossIndex.get(selectedBossId) : null;

  // Lock body scroll when picker is open + Escape closes.
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

  async function assign(itemId: number, characterId: number) {
    if (!rosterId || !characterId) return;
    const r = await fetch("/api/loot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, characterId, rosterId, raidNightId: raidNightId || null }),
    });
    if (!r.ok) {
      toast.error("Failed to assign.");
      return;
    }
    const created: Award = await r.json();
    setAwards([created, ...awards].slice(0, 20));
    toast.success(`Awarded ${created.item.name} → ${created.character.name}`);
  }

  async function undo(id: number) {
    const target = awards.find(a => a.id === id);
    const r = await fetch(`/api/loot/${id}`, { method: "DELETE" });
    if (r.ok) {
      setAwards(awards.filter(a => a.id !== id));
      toast.success(target ? `Undid ${target.item.name}.` : "Undid last award.");
    } else {
      toast.error("Undo failed.");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't fire 'u' when typing in an input/textarea
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "u" && awards.length && admin) {
        undo(awards[0].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [awards, admin]);

  if (!admin) {
    return (
      <div className="panel p-6 text-center">
        <p className="text-neutral-300">Only admins can assign loot.</p>
        <Link href="/login" className="btn mt-3 inline-block">Log in</Link>
      </div>
    );
  }

  function pickBoss(bossId: number) {
    setSelectedBossId(bossId);
    setPickerOpen(false);
  }

  const bossPicker = (
    <>
      <h2 className="text-sm uppercase text-neutral-400 mb-2">Pick a boss</h2>
      {phases.map(phase => (
        <div key={phase.id} className="mb-2">
          <div className="text-xs uppercase text-vermillion-300/90 font-semibold tracking-wider">{phase.name}</div>
          {phase.raids.map(raid => {
            const expanded = expandedRaids[raid.id] ?? false;
            return (
              <div key={raid.id} className="mt-1">
                <button
                  className="text-sm font-semibold text-neutral-200 hover:text-vermillion-200 active:text-vermillion-200 min-h-[36px] py-1 flex items-center gap-1"
                  onClick={() => setExpandedRaids(s => ({ ...s, [raid.id]: !expanded }))}
                >
                  <span className="text-xs text-neutral-500">{expanded ? "▾" : "▸"}</span>
                  {raid.name}
                </button>
                {expanded && (
                  <ul className="ml-4 text-sm">
                    {raid.bosses.map(b => (
                      <li key={b.id}>
                        <button
                          onClick={() => pickBoss(b.id)}
                          className={`block py-1.5 px-2 -ml-2 rounded hover:bg-white/5 active:bg-white/10 text-left w-full min-h-[36px] transition ${
                            b.id === selectedBossId ? "text-vermillion-200 font-semibold bg-vermillion-500/[0.05]" : "text-neutral-300"
                          }`}
                        >{b.name}</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <span className="heading-eyebrow">Admin</span>
        <h1 className="text-2xl font-bold tracking-tight">Assign loot</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3">
        {rosters.length > 1 && (
          <div className="min-w-[180px]">
            <label className="label">Roster</label>
            <Select
              value={String(rosterId)}
              onValueChange={v => setRosterId(Number(v) || "")}
              options={rosters.map(r => ({ value: String(r.id), label: r.name }))}
            />
          </div>
        )}
        <div className="min-w-[180px]">
          <label className="label">Raid night</label>
          <Select
            value={String(raidNightId || "")}
            onValueChange={v => setRaidNightId(Number(v) || "")}
            placeholder="— none —"
            options={[
              { value: "", label: "— none —" },
              ...(activeRoster?.raidNights ?? []).map(n => ({
                value: String(n.id),
                label: new Date(n.date).toISOString().slice(0, 10),
              })),
            ]}
          />
        </div>
        {!activeRoster?.raidNights.length && (
          <Link href="/attendance" className="btn-ghost btn-xs text-vermillion-300 self-center">+ Create a raid night</Link>
        )}
        <span className="hidden lg:inline ml-auto text-xs text-neutral-500">
          Hotkey: <kbd className="bg-white/10 border border-white/15 rounded px-1">u</kbd> to undo last award
        </span>
      </div>

      {/* Mobile: trigger button to open boss picker sheet */}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="lg:hidden w-full panel px-4 py-3 flex items-center justify-between text-left active:bg-white/[0.03] transition min-h-[52px]"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">Boss</div>
          {selected ? (
            <div className="mt-0.5 text-sm font-semibold text-neutral-100 truncate">
              {selected.raid.name} · {selected.boss.name}
            </div>
          ) : (
            <div className="mt-0.5 text-sm text-neutral-400">Tap to pick a boss</div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 ml-2 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Mobile picker sheet */}
      {pickerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setPickerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[85vw] max-w-sm bg-[var(--surface)] border-r border-white/10 shadow-2xl animate-fade-in flex flex-col">
            <div className="px-4 h-14 flex items-center justify-between border-b border-white/5 flex-shrink-0">
              <span className="font-bold text-vermillion-200">Pick a boss</span>
              <button onClick={() => setPickerOpen(false)} className="btn-ghost btn-xs" aria-label="Close picker">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {bossPicker}
            </div>
          </aside>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block col-span-4 panel p-3 max-h-[80vh] overflow-auto">
          {bossPicker}
        </aside>

        {/* Items + assign */}
        <section className="col-span-12 lg:col-span-5 panel p-3 lg:max-h-[80vh] overflow-auto">
          {selected ? (
            <>
              <div className="text-xs text-neutral-500">{selected.phase.name} · {selected.raid.name}</div>
              <h2 className="text-lg font-semibold mb-3">{selected.boss.name}</h2>
              {selected.boss.items.length === 0 ? (
                <div className="py-10 text-center text-neutral-500 text-sm">No items — add some in admin.</div>
              ) : (
                <ul className="space-y-2.5">
                  {selected.boss.items.map(it => (
                    <ItemCard
                      key={it.id}
                      item={it}
                      roster={activeRoster}
                      onAssign={cid => assign(it.id, cid)}
                    />
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-neutral-400 text-sm py-6 text-center">
              <span className="lg:hidden">Tap the picker above to choose a boss.</span>
              <span className="hidden lg:inline">Select a boss on the left to see its loot.</span>
            </p>
          )}
        </section>

        {/* Recent awards */}
        <section className="col-span-12 lg:col-span-3 panel">
          <button
            type="button"
            className="lg:hidden w-full px-4 py-3 flex items-center justify-between text-left active:bg-white/[0.03] transition min-h-[44px]"
            onClick={() => setRecentOpen(o => !o)}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Recent awards
              <span className="ml-2 pill">{awards.length}</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-neutral-400 transition ${recentOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className={`${recentOpen ? "block" : "hidden"} lg:block p-3 lg:max-h-[80vh] lg:overflow-auto`}>
            <h2 className="hidden lg:block text-sm uppercase text-neutral-400 mb-2">Recent awards</h2>
            <ul className="text-sm space-y-2">
              {awards.map(a => (
                <li key={a.id} className="flex items-start gap-2 panel-elev p-2">
                  <div className="flex-1 min-w-0">
                    <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                    <div className="text-xs mt-0.5 truncate">
                      <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                      <span className="text-neutral-500"> · {a.roster.name}</span>
                    </div>
                  </div>
                  <button
                    className="text-neutral-500 hover:text-red-400 active:text-red-300 min-h-[28px] min-w-[28px] flex items-center justify-center"
                    title="undo"
                    onClick={() => undo(a.id)}
                  >×</button>
                </li>
              ))}
              {awards.length === 0 && <li className="text-xs text-neutral-600 px-2">No awards yet.</li>}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function ItemCard({ item, roster, onAssign }: { item: Item; roster?: Roster; onAssign: (cid: number) => void }) {
  const [sel, setSel] = useState<number | "">("");
  const specWeight: Record<string, number> = Object.fromEntries(item.weights.map(w => [w.spec, w.weight]));

  const ranked = useMemo(() => {
    if (!roster) return [];
    return [...roster.members]
      .map(m => ({ m, w: specWeight[m.character.spec] ?? 0 }))
      .sort((a, b) => b.w - a.w || a.m.character.name.localeCompare(b.m.character.name));
  }, [roster, item]);

  return (
    <li className="rounded-lg bg-white/[0.02] ring-1 ring-white/5 p-3 hover:ring-white/10 transition">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="min-w-0">
          <WowheadLink name={item.name} wowheadId={item.wowheadId} />
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {item.slot ?? ""}{item.itemLevel != null ? ` · iLvl ${item.itemLevel}` : ""}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Select
          size="sm"
          value={String(sel || "")}
          onValueChange={v => setSel(Number(v) || "")}
          placeholder="Pick recipient…"
          triggerClassName="w-full sm:min-w-[260px] sm:flex-1"
          options={[
            { value: "", label: <span className="text-neutral-500">Pick recipient…</span> },
            ...ranked.map(({ m }) => ({
              value: String(m.characterId),
              label: (
                <span className="inline-flex items-center gap-2 w-full">
                  <span style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }} className="font-medium">
                    {m.character.name}
                  </span>
                  <span className="text-neutral-500 text-xs">{m.character.spec}</span>
                </span>
              ),
            })),
          ]}
        />
        <button
          className="btn-primary"
          disabled={!sel}
          onClick={() => { if (sel) { onAssign(Number(sel)); setSel(""); } }}
        >Assign</button>
      </div>
    </li>
  );
}
