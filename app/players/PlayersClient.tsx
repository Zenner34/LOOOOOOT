"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Users } from "@/app/components/ui/Icon";

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

export default function PlayersClient({
  initialPlayers,
  initialOrphans,
  admin,
}: {
  initialPlayers: Player[];
  initialOrphans: Char[];
  admin: boolean;
}) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [orphans, setOrphans] = useState(initialOrphans);
  const [name, setName] = useState("");
  const [discord, setDiscord] = useState("");
  const [busy, setBusy] = useState(false);

  const filteredOrphans = useMemo(() => orphans, [orphans]);

  async function addPlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/players", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, discordHandle: discord || null }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const created: Player = await r.json();
      setPlayers([...players, { ...created, characters: created.characters ?? [] }]);
      setName("");
      setDiscord("");
      toast.success(`Added ${created.displayName}.`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function bind(playerId: number, characterId: number, isMain = false) {
    const r = await fetch(`/api/players/${playerId}/characters`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characterId, isMain }),
    });
    if (!r.ok) return;
    // refresh both lists
    const orphan = orphans.find(o => o.id === characterId);
    if (!orphan) return;
    setOrphans(orphans.filter(o => o.id !== characterId));
    setPlayers(players.map(p => p.id === playerId
      ? { ...p, characters: [...p.characters.map(c => isMain ? { ...c, isMain: false } : c), { ...orphan, isMain }] }
      : p));
  }

  async function unbind(playerId: number, characterId: number) {
    const r = await fetch(`/api/players/${playerId}/characters?characterId=${characterId}`, {
      method: "DELETE",
    });
    if (!r.ok) return;
    const player = players.find(p => p.id === playerId);
    const ch = player?.characters.find(c => c.id === characterId);
    if (!ch) return;
    setPlayers(players.map(p => p.id === playerId
      ? { ...p, characters: p.characters.filter(c => c.id !== characterId) }
      : p));
    setOrphans([...orphans, { ...ch, isMain: false }].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function setMain(playerId: number, characterId: number) {
    const r = await fetch(`/api/characters/${characterId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isMain: true }),
    });
    if (!r.ok) return;
    setPlayers(players.map(p => p.id !== playerId ? p : ({
      ...p,
      characters: p.characters.map(c => ({ ...c, isMain: c.id === characterId })),
    })));
  }

  async function removePlayer(id: number) {
    if (!confirm("Remove this player? Their characters become unbound (loot history preserved).")) return;
    const r = await fetch(`/api/players/${id}`, { method: "DELETE" });
    if (!r.ok) {
      toast.error("Delete failed.");
      return;
    }
    const removed = players.find(p => p.id === id);
    setPlayers(players.filter(p => p.id !== id));
    if (removed) {
      setOrphans([...orphans, ...removed.characters.map(c => ({ ...c, isMain: false }))]
        .sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Removed ${removed.displayName}.`);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Roster"
        title="Players"
        subtitle="Group a person's main + alts so loot rolls up across all their characters."
        actions={
          <span className="text-sm text-neutral-400">
            {players.length} player{players.length !== 1 ? "s" : ""}
            {orphans.length > 0 && <span className="ml-3 text-gold-300">· {orphans.length} unbound character{orphans.length !== 1 ? "s" : ""}</span>}
          </span>
        }
      />

      {admin && (
        <form onSubmit={addPlayer} className="panel p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Display name</label>
            <input
              className="input"
              placeholder="e.g. Bob"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="min-w-[200px]">
            <label className="label">Discord (optional)</label>
            <input
              className="input"
              placeholder="bob#1234"
              value={discord}
              onChange={e => setDiscord(e.target.value)}
            />
          </div>
          <button className="btn-primary" disabled={busy || !name.trim()}>Add player</button>
        </form>
      )}

      <div className="space-y-3">
        {players.map(p => (
          <PlayerCard
            key={p.id}
            player={p}
            orphans={filteredOrphans}
            admin={admin}
            onBind={bind}
            onUnbind={unbind}
            onSetMain={setMain}
            onRemove={removePlayer}
          />
        ))}

        {players.length === 0 && (
          <EmptyState
            icon={Users}
            title="No players yet"
            description={admin ? "Add one above to start." : "An admin needs to add the first player."}
          />
        )}

        {orphans.length > 0 && (
          <div className="panel-elev p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-300">Unbound characters</h2>
              <span className="text-xs text-neutral-500">{orphans.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {orphans.map(c => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs"
                >
                  <SpecIcon spec={c.spec} size={14} />
                  <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                  <span className="text-neutral-500">· {c.spec}</span>
                </span>
              ))}
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              Characters not bound to any player. Use the "Add character" button on each player above to claim them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({
  player, orphans, admin, onBind, onUnbind, onSetMain, onRemove,
}: {
  player: Player;
  orphans: Char[];
  admin: boolean;
  onBind: (playerId: number, characterId: number, isMain?: boolean) => Promise<void>;
  onUnbind: (playerId: number, characterId: number) => Promise<void>;
  onSetMain: (playerId: number, characterId: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const mainChar = player.characters.find(c => c.isMain) ?? player.characters[0];

  return (
    <div className="panel p-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {mainChar && <ClassIcon cls={mainChar.class} size={20} />}
          <Link href={`/players/${player.id}`} className="text-lg font-semibold text-vermillion-200 hover:text-vermillion-100 transition">
            {player.displayName}
          </Link>
          {player.discordHandle && <span className="text-xs text-neutral-500">{player.discordHandle}</span>}
        </div>
        {admin && (
          <button
            onClick={() => onRemove(player.id)}
            className="btn-ghost btn-xs text-neutral-500 hover:text-red-400"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {player.characters.length === 0 ? (
          <span className="text-xs text-neutral-500 italic">no characters bound</span>
        ) : (
          player.characters.map(c => (
            <CharacterChip
              key={c.id}
              c={c}
              admin={admin}
              onUnbind={() => onUnbind(player.id, c.id)}
              onSetMain={() => onSetMain(player.id, c.id)}
            />
          ))
        )}
        {admin && orphans.length > 0 && !adding && (
          <button onClick={() => setAdding(true)} className="chip text-vermillion-200 hover:bg-vermillion-500/10">
            + Bind character
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-3 panel-elev p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400">Bind:</span>
          {orphans.slice(0, 30).map(o => (
            <button
              key={o.id}
              onClick={async () => { await onBind(player.id, o.id, player.characters.length === 0); setAdding(false); }}
              className="chip hover:bg-vermillion-500/10 hover:border-vermillion-500/40"
            >
              <SpecIcon spec={o.spec} size={14} />
              <span style={{ color: CLASS_COLOR[o.class] ?? "#fff" }}>{o.name}</span>
              <span className="text-neutral-500">· {o.spec}</span>
            </button>
          ))}
          <button onClick={() => setAdding(false)} className="btn-ghost btn-xs">Cancel</button>
        </div>
      )}
    </div>
  );
}

function CharacterChip({
  c, admin, onUnbind, onSetMain,
}: {
  c: Char;
  admin: boolean;
  onUnbind: () => Promise<void>;
  onSetMain: () => Promise<void>;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
        c.isMain ? "bg-gold-400/10 ring-1 ring-gold-400/30" : "bg-white/5"
      }`}
    >
      {c.isMain && <span title="main" className="text-gold-300 text-[10px] leading-none">★</span>}
      <SpecIcon spec={c.spec} size={14} />
      <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium">{c.name}</span>
      <span className="text-neutral-500">· {c.spec}</span>
      {admin && (
        <span className="ml-1 inline-flex gap-1 text-neutral-500">
          {!c.isMain && (
            <button onClick={onSetMain} title="set as main" className="hover:text-gold-300">★</button>
          )}
          <button onClick={onUnbind} title="unbind" className="hover:text-red-400">×</button>
        </span>
      )}
    </span>
  );
}
