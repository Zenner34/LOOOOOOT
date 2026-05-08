"use client";

import Link from "next/link";
import { useState } from "react";

type RosterRow = {
  id: number;
  name: string;
  description: string | null;
  _count: { members: number; raidNights: number; awards: number };
};

export default function RostersClient({ initial, admin }: { initial: RosterRow[]; admin: boolean }) {
  const [rosters, setRosters] = useState(initial);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const r = await fetch("/api/rosters", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description: desc }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "failed");
      }
      const created = await r.json();
      setRosters([...rosters, { ...created, _count: { members: 0, raidNights: 0, awards: 0 } }]);
      setName("");
      setDesc("");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rosters</h1>
        <p className="text-sm text-neutral-400">Create separate rosters per split (e.g. Split A / Split B).</p>
      </div>

      {admin && (
        <form onSubmit={create} className="panel p-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px]">
            <label className="label">Roster name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="label">Description</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="optional" />
          </div>
          <button className="btn-primary" disabled={busy || !name}>Create roster</button>
          {err && <p className="text-sm text-red-400">{err}</p>}
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rosters.map(r => (
          <Link key={r.id} href={`/rosters/${r.id}`} className="panel p-4 hover:border-vermillion-500/60 transition-colors">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-vermillion-200">{r.name}</h2>
              <span className="text-xs text-neutral-500">#{r.id}</span>
            </div>
            {r.description && <p className="text-sm text-neutral-400 mt-1">{r.description}</p>}
            <div className="mt-3 flex gap-3 text-xs text-neutral-400">
              <span>{r._count.members} members</span>
              <span>{r._count.raidNights} nights</span>
              <span>{r._count.awards} awards</span>
            </div>
          </Link>
        ))}
        {rosters.length === 0 && <p className="text-neutral-500">No rosters yet.</p>}
      </div>
    </div>
  );
}
