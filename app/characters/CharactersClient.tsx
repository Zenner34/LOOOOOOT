"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR, SPECS } from "@/lib/specs";

type Character = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  active: boolean;
};

export default function CharactersClient({ initial, admin }: { initial: Character[]; admin: boolean }) {
  const router = useRouter();
  const [chars, setChars] = useState(initial);
  const [name, setName] = useState("");
  const [spec, setSpec] = useState(SPECS[0].key);
  const [busy, setBusy] = useState(false);

  const sorted = useMemo(
    () => [...chars].sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)),
    [chars],
  );

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/characters", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, spec }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const created = await r.json();
      setChars([...chars, created]);
      setName("");
      toast.success(`Added ${created.name}.`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: number, body: Partial<Character>) {
    const r = await fetch(`/api/characters/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      toast.error("Update failed.");
      return;
    }
    const updated = await r.json();
    setChars(chars.map(c => (c.id === id ? updated : c)));
  }

  async function remove(id: number) {
    if (!confirm("Delete this character? Their loot history stays but is detached.")) return;
    const r = await fetch(`/api/characters/${id}`, { method: "DELETE" });
    if (r.ok) {
      const removed = chars.find(c => c.id === id);
      setChars(chars.filter(c => c.id !== id));
      if (removed) toast.success(`Deleted ${removed.name}.`);
    } else {
      toast.error("Delete failed.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Characters</h1>
        <span className="text-sm text-neutral-400">{chars.length} total</span>
      </div>

      {admin && (
        <form onSubmit={add} className="panel p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="min-w-[220px]">
            <label className="label">Spec</label>
            <select className="input" value={spec} onChange={e => setSpec(e.target.value)}>
              {SPECS.map(s => (
                <option key={s.key} value={s.key}>{s.key}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" disabled={busy}>Add</button>
        </form>
      )}

      <div className="panel overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class / Spec</th>
              <th>Role</th>
              <th>Active</th>
              {admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.id}>
                <td className="font-medium" style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</td>
                <td className="text-neutral-300">{c.spec}</td>
                <td>
                  {admin ? (
                    <select
                      className="input w-28"
                      value={c.role}
                      onChange={e => patch(c.id, { role: e.target.value })}
                    >
                      <option value="tank">tank</option>
                      <option value="heal">heal</option>
                      <option value="dps">dps</option>
                    </select>
                  ) : <span className="uppercase text-xs text-neutral-400">{c.role}</span>}
                </td>
                <td>
                  {admin ? (
                    <input
                      type="checkbox"
                      checked={c.active}
                      onChange={e => patch(c.id, { active: e.target.checked })}
                    />
                  ) : (c.active ? "yes" : "no")}
                </td>
                {admin && (
                  <td className="text-right">
                    <button className="btn-danger" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={admin ? 5 : 4} className="py-6 text-center text-neutral-500">No characters yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
