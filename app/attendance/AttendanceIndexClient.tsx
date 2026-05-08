"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Roster = { id: number; name: string };
type Night = {
  id: number;
  date: string | Date;
  notes: string | null;
  roster: Roster;
  _count: { attendance: number; awards: number };
};

export default function AttendanceIndexClient({
  rosters,
  nights,
  admin,
}: {
  rosters: Roster[];
  nights: Night[];
  admin: boolean;
}) {
  const router = useRouter();
  const [rosterId, setRosterId] = useState<number | "">(rosters[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function createNight(e: React.FormEvent) {
    e.preventDefault();
    if (!rosterId) return;
    setBusy(true);
    try {
      const r = await fetch("/api/raid-nights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rosterId, date, notes }),
      });
      if (!r.ok) return;
      const created = await r.json();
      router.push(`/attendance/${created.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="heading-eyebrow">Roster</span>
        <h1 className="text-2xl font-bold tracking-tight">Raid nights</h1>
        <p className="text-sm text-neutral-400 mt-1">Each raid night is one row. Mark attendance and award loot from the night.</p>
      </div>

      {admin && (
        <form onSubmit={createNight} className="panel p-4 flex flex-wrap items-end gap-3">
          {rosters.length > 1 && (
            <div className="min-w-[180px]">
              <label className="label">Roster</label>
              <select className="input" value={rosterId} onChange={e => setRosterId(Number(e.target.value) || "")}>
                {rosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
          <div className="min-w-[160px]">
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="label">Notes</label>
            <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. BT — Illidan prog" />
          </div>
          <button className="btn-primary" disabled={!rosterId || busy}>Create raid night</button>
        </form>
      )}

      <div className="panel overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Roster</th><th>Notes</th><th>Attendance</th><th>Awards</th><th></th></tr>
          </thead>
          <tbody>
            {nights.map(n => (
              <tr key={n.id}>
                <td>{new Date(n.date).toISOString().slice(0, 10)}</td>
                <td>{n.roster.name}</td>
                <td className="text-neutral-400">{n.notes ?? ""}</td>
                <td>{n._count.attendance}</td>
                <td>{n._count.awards}</td>
                <td className="text-right"><Link className="btn" href={`/attendance/${n.id}`}>Open</Link></td>
              </tr>
            ))}
            {nights.length === 0 && <tr><td colSpan={6} className="text-center py-6 text-neutral-500">No raid nights yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
