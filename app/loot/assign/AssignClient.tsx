"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { CLASS_COLOR } from "@/lib/specs";
import { WowheadLink } from "@/lib/wowhead";

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
  const [flash, setFlash] = useState<string | null>(null);

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

  async function assign(itemId: number, characterId: number) {
    if (!rosterId || !characterId) return;
    const r = await fetch("/api/loot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, characterId, rosterId, raidNightId: raidNightId || null }),
    });
    if (!r.ok) {
      setFlash("Failed to assign.");
      return;
    }
    const created: Award = await r.json();
    setAwards([created, ...awards].slice(0, 20));
    setFlash(`Assigned ${created.item.name} → ${created.character.name}.`);
  }

  async function undo(id: number) {
    const r = await fetch(`/api/loot/${id}`, { method: "DELETE" });
    if (r.ok) {
      setAwards(awards.filter(a => a.id !== id));
      setFlash("Undid last award.");
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <label className="label">Roster</label>
          <select className="input" value={rosterId} onChange={e => setRosterId(Number(e.target.value) || "")}>
            <option value="">Select…</option>
            {rosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="min-w-[200px]">
          <label className="label">Raid night (optional)</label>
          <select className="input" value={raidNightId} onChange={e => setRaidNightId(Number(e.target.value) || "")}>
            <option value="">— none —</option>
            {activeRoster?.raidNights.map(n => (
              <option key={n.id} value={n.id}>{new Date(n.date).toISOString().slice(0, 10)}</option>
            ))}
          </select>
        </div>
        {flash && <span className="text-sm text-emerald-400">{flash}</span>}
        <span className="ml-auto text-xs text-neutral-500">
          Hotkey: <kbd className="bg-neutral-800 border border-neutral-700 rounded px-1">u</kbd> to undo last award
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-4 panel p-3 max-h-[80vh] overflow-auto">
          <h2 className="text-sm uppercase text-neutral-400 mb-2">Pick a boss</h2>
          {phases.map(phase => (
            <div key={phase.id} className="mb-2">
              <div className="text-xs uppercase text-vermillion-300/90 font-semibold tracking-wider">{phase.name}</div>
              {phase.raids.map(raid => {
                const expanded = expandedRaids[raid.id] ?? false;
                return (
                  <div key={raid.id} className="mt-1">
                    <button
                      className="text-sm font-semibold text-neutral-200 hover:text-vermillion-200"
                      onClick={() => setExpandedRaids(s => ({ ...s, [raid.id]: !expanded }))}
                    >
                      {expanded ? "▾" : "▸"} {raid.name}
                    </button>
                    {expanded && (
                      <ul className="ml-4 text-sm">
                        {raid.bosses.map(b => (
                          <li key={b.id}>
                            <button
                              onClick={() => setSelectedBossId(b.id)}
                              className={`block py-0.5 hover:text-vermillion-200 text-left w-full ${
                                b.id === selectedBossId ? "text-vermillion-200 font-semibold" : "text-neutral-300"
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
        </aside>

        <section className="col-span-12 lg:col-span-5 panel p-3 max-h-[80vh] overflow-auto">
          {selected ? (
            <>
              <div className="text-xs text-neutral-500">{selected.phase.name} · {selected.raid.name}</div>
              <h2 className="text-lg font-semibold mb-2">{selected.boss.name}</h2>
              <table className="table">
                <thead>
                  <tr><th>Item</th><th>Slot</th><th>Award</th></tr>
                </thead>
                <tbody>
                  {selected.boss.items.map(it => (
                    <ItemRow key={it.id} item={it} roster={activeRoster} onAssign={cid => assign(it.id, cid)} />
                  ))}
                  {selected.boss.items.length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-neutral-500">No items — add some in admin.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-neutral-400 text-sm">Select a boss on the left to see its loot.</p>
          )}
        </section>

        <section className="col-span-12 lg:col-span-3 panel p-3 max-h-[80vh] overflow-auto">
          <h2 className="text-sm uppercase text-neutral-400 mb-2">Recent awards</h2>
          <ul className="text-sm space-y-1">
            {awards.map((a, idx) => (
              <li key={a.id} className="flex items-start gap-1">
                <div className="flex-1">
                  <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                  <div className="text-xs">
                    <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                    <span className="text-neutral-500"> · {a.roster.name}</span>
                  </div>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300" title="undo" onClick={() => undo(a.id)}>×</button>
              </li>
            ))}
            {awards.length === 0 && <li className="text-xs text-neutral-600">No awards yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function ItemRow({ item, roster, onAssign }: { item: Item; roster?: Roster; onAssign: (cid: number) => void }) {
  const [sel, setSel] = useState<number | "">("");
  const specWeight: Record<string, number> = Object.fromEntries(item.weights.map(w => [w.spec, w.weight]));

  const ranked = useMemo(() => {
    if (!roster) return [];
    return [...roster.members]
      .map(m => ({ m, w: specWeight[m.character.spec] ?? 0 }))
      .sort((a, b) => b.w - a.w || a.m.character.name.localeCompare(b.m.character.name));
  }, [roster, item]);

  return (
    <tr>
      <td><WowheadLink name={item.name} wowheadId={item.wowheadId} /></td>
      <td className="text-neutral-400 text-xs">{item.slot ?? ""}</td>
      <td>
        <div className="flex gap-1">
          <select className="input !py-0.5" value={sel} onChange={e => setSel(Number(e.target.value) || "")}>
            <option value="">Pick recipient…</option>
            {ranked.map(({ m, w }) => (
              <option key={m.characterId} value={m.characterId}>
                {m.character.name} ({m.character.spec}){w > 0 ? ` · ${w.toFixed(2)}` : ""}
              </option>
            ))}
          </select>
          <button
            className="btn-primary !py-0.5"
            disabled={!sel}
            onClick={() => { if (sel) { onAssign(Number(sel)); setSel(""); } }}
          >Assign</button>
        </div>
      </td>
    </tr>
  );
}
