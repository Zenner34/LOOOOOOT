"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLASS_COLOR } from "@/lib/specs";
import { ClassIcon } from "@/app/components/ClassIcon";
import { WowheadLink } from "@/lib/wowhead";

type Char = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  isMain: boolean;
};
type Player = {
  id: number;
  displayName: string;
  discordHandle: string | null;
  notes: string | null;
  active: boolean;
  characters: Char[];
};
type Award = {
  id: number;
  awardedAt: string;
  character: { id: number; name: string; class: string; spec: string };
  item: {
    id: number;
    name: string;
    wowheadId: number | null;
    slot: string | null;
    itemLevel: number | null;
    weights: Array<{ spec: string; weight: number }>;
    boss: { name: string; raid: { name: string; shortName: string } };
  };
  raidNight: { id: number; date: string; notes: string | null } | null;
  roster: { id: number; name: string };
};

const DAY_MS = 24 * 60 * 60 * 1000;
function daysSince(d: string | null | undefined): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / DAY_MS);
}

export default function PlayerDetailClient({
  player: initialPlayer,
  orphans: initialOrphans,
  awards,
  admin,
}: {
  player: Player;
  orphans: Char[];
  awards: Award[];
  admin: boolean;
}) {
  const router = useRouter();
  const [player, setPlayer] = useState(initialPlayer);
  const [orphans, setOrphans] = useState(initialOrphans);
  const [discord, setDiscord] = useState(initialPlayer.discordHandle ?? "");
  const [notes, setNotes] = useState(initialPlayer.notes ?? "");
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const lastAt = awards[0]?.awardedAt ?? null;
  const daysAgo = daysSince(lastAt);
  const mainChar = player.characters.find(c => c.isMain) ?? player.characters[0];

  // Group awards by raid night (or "Off-night" bucket if no raidNight).
  const grouped = useMemo(() => {
    const buckets = new Map<string, { label: string; date: string | null; awards: Award[] }>();
    for (const a of awards) {
      const key = a.raidNight ? String(a.raidNight.id) : `_off_${a.awardedAt.slice(0, 10)}`;
      const date = a.raidNight ? a.raidNight.date : a.awardedAt;
      const dateStr = date.slice(0, 10);
      const label = a.raidNight
        ? `${dateStr}${a.raidNight.notes ? ` · ${a.raidNight.notes}` : ""}`
        : `${dateStr} · off-night`;
      const existing = buckets.get(key);
      if (existing) {
        existing.awards.push(a);
      } else {
        buckets.set(key, { label, date, awards: [a] });
      }
    }
    return Array.from(buckets.values()).sort((a, b) =>
      (b.date ?? "").localeCompare(a.date ?? ""),
    );
  }, [awards]);

  const totalCount = awards.length;

  async function bind(characterId: number, isMain: boolean) {
    const r = await fetch(`/api/players/${player.id}/characters`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characterId, isMain }),
    });
    if (!r.ok) return;
    const ch = orphans.find(o => o.id === characterId);
    if (!ch) return;
    setOrphans(orphans.filter(o => o.id !== characterId));
    setPlayer({
      ...player,
      characters: [
        ...player.characters.map(c => isMain ? { ...c, isMain: false } : c),
        { ...ch, isMain },
      ],
    });
    router.refresh();
  }

  async function unbind(characterId: number) {
    const r = await fetch(`/api/players/${player.id}/characters?characterId=${characterId}`, {
      method: "DELETE",
    });
    if (!r.ok) return;
    const ch = player.characters.find(c => c.id === characterId);
    if (!ch) return;
    setOrphans([...orphans, { ...ch, isMain: false }].sort((a, b) => a.name.localeCompare(b.name)));
    setPlayer({ ...player, characters: player.characters.filter(c => c.id !== characterId) });
    router.refresh();
  }

  async function setMain(characterId: number) {
    const r = await fetch(`/api/characters/${characterId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isMain: true }),
    });
    if (!r.ok) return;
    setPlayer({
      ...player,
      characters: player.characters.map(c => ({ ...c, isMain: c.id === characterId })),
    });
  }

  async function saveProfile() {
    const r = await fetch(`/api/players/${player.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ discordHandle: discord || null, notes: notes || null }),
    });
    if (r.ok) {
      const updated = await r.json();
      setPlayer({ ...player, discordHandle: updated.discordHandle, notes: updated.notes });
      setEditing(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/players" className="text-xs text-neutral-500 hover:text-vermillion-200">← Players</Link>
        <div className="mt-2">
          <span className="heading-eyebrow">Player</span>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            {mainChar && <ClassIcon cls={mainChar.class} size={28} />}
            {player.displayName}
          </h1>
        </div>
        <div className="mt-3 grid grid-cols-2 sm:flex gap-2 sm:gap-3 text-sm">
          <Stat label="Items" value={String(totalCount)} />
          <Stat
            label="Last loot"
            value={daysAgo == null ? "—" : daysAgo === 0 ? "today" : `${daysAgo}d`}
            tone={
              daysAgo == null ? "muted" :
              daysAgo < 7  ? "fresh" :
              daysAgo < 14 ? "warm"  :
              daysAgo < 30 ? "cold"  : "icy"
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-3">
          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-vermillion-300/90">Characters</h2>
              {admin && orphans.length > 0 && !adding && (
                <button onClick={() => setAdding(true)} className="btn-ghost btn-xs text-vermillion-200">+ Bind</button>
              )}
            </div>
            <div className="space-y-1.5">
              {player.characters.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No characters bound.</p>
              ) : player.characters.map(c => (
                <div key={c.id} className={`flex items-center justify-between rounded-md px-2 py-1.5 ${c.isMain ? "bg-gold-400/10 ring-1 ring-gold-400/25" : "bg-white/[0.03]"}`}>
                  <div className="flex items-center gap-2">
                    {c.isMain && <span className="text-gold-300 text-xs leading-none" title="main">★</span>}
                    <ClassIcon cls={c.class} size={16} />
                    <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-neutral-500">{c.spec}</span>
                  </div>
                  {admin && (
                    <div className="flex items-center gap-1">
                      {!c.isMain && <button onClick={() => setMain(c.id)} className="text-neutral-500 hover:text-gold-300 text-sm" title="set as main">★</button>}
                      <button onClick={() => unbind(c.id)} className="text-neutral-500 hover:text-red-400 text-sm" title="unbind">×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {adding && (
              <div className="mt-3 p-3 rounded-md bg-white/[0.03] border border-white/5">
                <div className="text-xs text-neutral-400 mb-2">Bind a character to {player.displayName}:</div>
                <div className="flex flex-wrap gap-1.5">
                  {orphans.slice(0, 30).map(o => (
                    <button
                      key={o.id}
                      onClick={async () => { await bind(o.id, player.characters.length === 0); setAdding(false); }}
                      className="chip hover:bg-vermillion-500/10 hover:border-vermillion-500/40"
                    >
                      <ClassIcon cls={o.class} size={14} />
                      <span style={{ color: CLASS_COLOR[o.class] ?? "#fff" }}>{o.name}</span>
                      <span className="text-neutral-500">· {o.spec}</span>
                    </button>
                  ))}
                  {orphans.length === 0 && <span className="text-xs text-neutral-500 italic">No unbound characters.</span>}
                </div>
                <button onClick={() => setAdding(false)} className="btn-ghost btn-xs mt-2">Cancel</button>
              </div>
            )}
          </div>

          <div className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-vermillion-300/90">Profile</h2>
              {admin && !editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost btn-xs">Edit</button>
              )}
            </div>
            {editing ? (
              <div className="space-y-2">
                <div>
                  <label className="label">Discord</label>
                  <input className="input" value={discord} onChange={e => setDiscord(e.target.value)} placeholder="bob#1234" />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input min-h-[80px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="any context for the loot master" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="btn-primary btn-xs">Save</button>
                  <button onClick={() => { setEditing(false); setDiscord(player.discordHandle ?? ""); setNotes(player.notes ?? ""); }} className="btn-ghost btn-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <dl className="text-sm space-y-1.5">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Discord</dt>
                  <dd className="text-neutral-200">{player.discordHandle || <span className="text-neutral-600 italic">none</span>}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500 text-xs uppercase tracking-wider mb-0.5">Notes</dt>
                  <dd className="text-neutral-200 whitespace-pre-wrap">{player.notes || <span className="text-neutral-600 italic">none</span>}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 panel">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-vermillion-300/90">Loot timeline</h2>
            <span className="text-xs text-neutral-500">{totalCount} item{totalCount !== 1 ? "s" : ""} across {grouped.length} session{grouped.length !== 1 ? "s" : ""}</span>
          </div>

          {grouped.length === 0 ? (
            <div className="px-6 py-12 text-center text-neutral-500 text-sm">
              No loot awarded yet.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {grouped.map(g => (
                <div key={g.label} className="px-3 sm:px-4 py-3">
                  <div className="flex items-baseline justify-between mb-2 gap-2">
                    <h3 className="text-sm font-semibold text-neutral-200 truncate">{g.label}</h3>
                    <span className="text-xs text-neutral-500 flex-shrink-0">{g.awards.length} item{g.awards.length !== 1 ? "s" : ""}</span>
                  </div>
                  {/* Mobile: stacked rows */}
                  <ul className="md:hidden space-y-1.5">
                    {g.awards.map(a => (
                      <li key={a.id} className="text-xs">
                        <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                        <div className="text-[11px] text-neutral-500 truncate">
                          {a.item.boss.name} · <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Desktop: table */}
                  <table className="hidden md:table table">
                    <tbody>
                      {g.awards.map(a => (
                        <tr key={a.id}>
                          <td className="w-1/3"><WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} /></td>
                          <td className="text-xs text-neutral-400">{a.item.boss.name} <span className="text-neutral-600">· {a.item.boss.raid.shortName}</span></td>
                          <td className="text-xs">
                            <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }}>{a.character.name}</span>
                            <span className="text-neutral-500"> · {a.character.spec}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "gold" | "fresh" | "warm" | "cold" | "icy" | "muted";
}) {
  const TONE: Record<string, string> = {
    default: "text-neutral-200",
    gold:    "text-gold-200",
    fresh:   "text-emerald-300",
    warm:    "text-gold-200",
    cold:    "text-vermillion-200",
    icy:     "text-vermillion-300",
    muted:   "text-neutral-500",
  };
  return (
    <div className="panel-elev px-3 py-2 min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 truncate">{label}</div>
      <div className={`text-base font-bold tabular-nums truncate ${TONE[tone]}`}>{value}</div>
    </div>
  );
}
