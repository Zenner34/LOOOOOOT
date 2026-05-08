"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";

type Character = { id: number; name: string; class: string; spec: string; role: string };
type Member = { characterId: number; memberRole: string; character: Character };
type Attendance = { characterId: number; status: string };

export default function NightClient({ night, admin }: {
  night: {
    id: number;
    date: string | Date;
    notes: string | null;
    roster: { id: number; name: string; members: Member[] };
    attendance: Attendance[];
  };
  admin: boolean;
}) {
  const initial: Record<number, string> = {};
  for (const m of night.roster.members) initial[m.characterId] = "absent";
  for (const a of night.attendance) initial[a.characterId] = a.status;
  const [statuses, setStatuses] = useState<Record<number, string>>(initial);
  const [busy, setBusy] = useState(false);

  const update = (id: number, status: string) => {
    setStatuses(s => ({ ...s, [id]: status }));
  };

  async function save() {
    setBusy(true);
    try {
      const records = Object.entries(statuses).map(([characterId, status]) => ({
        characterId: Number(characterId),
        status,
      }));
      const r = await fetch(`/api/raid-nights/${night.id}/attendance`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ records }),
      });
      if (r.ok) toast.success("Attendance saved.");
      else toast.error("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/attendance" className="text-sm text-neutral-400 hover:text-white">← Attendance</Link>
        <h1 className="text-xl font-semibold mt-1">
          {new Date(night.date).toISOString().slice(0, 10)} — {night.roster.name}
        </h1>
        {night.notes && <p className="text-neutral-400 text-sm">{night.notes}</p>}
      </div>

      <div className="panel overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>Character</th><th>Spec</th><th>Roster slot</th><th>Status</th></tr>
          </thead>
          <tbody>
            {night.roster.members.map(m => (
              <tr key={m.characterId}>
                <td className="font-medium" style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }}>
                  {m.character.name}
                </td>
                <td className="text-neutral-300">{m.character.spec}</td>
                <td className="text-xs uppercase text-neutral-500">{m.memberRole}</td>
                <td>
                  {admin ? (
                    <div className="flex gap-1">
                      {["present", "late", "absent"].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => update(m.characterId, s)}
                          className={`px-2 py-0.5 rounded text-xs border ${
                            statuses[m.characterId] === s
                              ? s === "present" ? "bg-emerald-600 border-emerald-500 text-white"
                              : s === "late" ? "bg-amber-600 border-amber-500 text-black"
                              : "bg-red-700 border-red-600 text-white"
                              : "border-neutral-700 text-neutral-400"
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                  ) : <span className="text-xs uppercase">{statuses[m.characterId] ?? "absent"}</span>}
                </td>
              </tr>
            ))}
            {night.roster.members.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-neutral-500">Roster has no members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {admin && (
        <div className="flex items-center gap-3">
          <button className="btn-primary" disabled={busy} onClick={save}>Save attendance</button>
        </div>
      )}
    </div>
  );
}
