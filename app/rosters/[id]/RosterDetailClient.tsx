"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLASS_COLOR } from "@/lib/specs";

type Roster = { id: number; name: string; description: string | null };
type Character = { id: number; name: string; class: string; spec: string; role: string; active: boolean };
type Member = { id: number; rosterId: number; characterId: number; memberRole: string; character: Character };

export default function RosterDetailClient(props: {
  roster: Roster;
  initialMembers: Member[];
  allCharacters: Character[];
  admin: boolean;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(props.initialMembers);
  const [pickId, setPickId] = useState<number | "">("");
  const [pickRole, setPickRole] = useState("main");
  const [err, setErr] = useState<string | null>(null);

  const inRoster = useMemo(() => new Set(members.map(m => m.characterId)), [members]);
  const available = props.allCharacters.filter(c => !inRoster.has(c.id));

  const grouped = useMemo(() => {
    const by: Record<string, Member[]> = { tank: [], heal: [], dps: [] };
    for (const m of members) (by[m.character.role] ??= []).push(m);
    return by;
  }, [members]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!pickId) return;
    const r = await fetch(`/api/rosters/${props.roster.id}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characterId: pickId, memberRole: pickRole }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error ?? "failed");
      return;
    }
    const created = await r.json();
    setMembers([...members, created]);
    setPickId("");
  }

  async function changeRole(characterId: number, memberRole: string) {
    const r = await fetch(`/api/rosters/${props.roster.id}/members`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characterId, memberRole }),
    });
    if (!r.ok) return;
    const updated = await r.json();
    setMembers(members.map(m => (m.characterId === characterId ? updated : m)));
  }

  async function removeMember(characterId: number) {
    const r = await fetch(`/api/rosters/${props.roster.id}/members?characterId=${characterId}`, {
      method: "DELETE",
    });
    if (r.ok) setMembers(members.filter(m => m.characterId !== characterId));
  }

  async function deleteRoster() {
    if (!confirm("Delete this roster? All its raid nights and loot awards will be removed.")) return;
    const r = await fetch(`/api/rosters/${props.roster.id}`, { method: "DELETE" });
    if (r.ok) {
      router.push("/rosters");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/rosters" className="text-sm text-neutral-400 hover:text-white">← Rosters</Link>
          <h1 className="text-xl font-semibold mt-1">{props.roster.name}</h1>
          {props.roster.description && <p className="text-neutral-400 text-sm">{props.roster.description}</p>}
        </div>
        {props.admin && <button className="btn-danger" onClick={deleteRoster}>Delete roster</button>}
      </div>

      {props.admin && (
        <form onSubmit={addMember} className="panel p-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="label">Add character</label>
            <select className="input" value={pickId} onChange={e => setPickId(Number(e.target.value) || "")}>
              <option value="">Select a character…</option>
              {available.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.spec})</option>
              ))}
            </select>
          </div>
          <div className="min-w-[120px]">
            <label className="label">Slot</label>
            <select className="input" value={pickRole} onChange={e => setPickRole(e.target.value)}>
              <option value="main">main</option>
              <option value="bench">bench</option>
              <option value="trial">trial</option>
            </select>
          </div>
          <button className="btn-primary" disabled={!pickId}>Add</button>
          {err && <p className="text-sm text-red-400">{err}</p>}
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(["tank", "heal", "dps"] as const).map(role => (
          <div key={role} className="panel p-3">
            <h2 className="text-sm uppercase tracking-wide text-neutral-400 mb-2">
              {role === "tank" ? "Tanks" : role === "heal" ? "Healers" : "DPS"}
              <span className="ml-2 text-neutral-600">({grouped[role]?.length ?? 0})</span>
            </h2>
            <ul className="space-y-1">
              {(grouped[role] ?? []).map(m => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate" style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }}>
                    {m.character.name}
                  </span>
                  <span className="text-xs text-neutral-500 truncate">{m.character.spec}</span>
                  {props.admin ? (
                    <>
                      <select
                        className="input !w-20 !py-0.5"
                        value={m.memberRole}
                        onChange={e => changeRole(m.characterId, e.target.value)}
                      >
                        <option value="main">main</option>
                        <option value="bench">bench</option>
                        <option value="trial">trial</option>
                      </select>
                      <button className="text-xs text-red-400 hover:text-red-300" onClick={() => removeMember(m.characterId)}>×</button>
                    </>
                  ) : <span className="text-xs text-neutral-500">{m.memberRole}</span>}
                </li>
              ))}
              {(grouped[role]?.length ?? 0) === 0 && <li className="text-xs text-neutral-600">none</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
