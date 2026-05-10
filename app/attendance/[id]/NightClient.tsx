"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Users } from "@/app/components/ui/Icon";

type Character = { id: number; name: string; class: string; spec: string; role: string };
type Member = { characterId: number; memberRole: string; character: Character };
type Attendance = { characterId: number; status: string };

// 'no_show' = was on the roster, expected to attend, never showed.
// Distinct from 'absent' (which means a heads-up miss) so we can flag
// the bail-on-the-team pattern and call it out on player profiles.
const STATUSES = ["present", "late", "absent", "no_show"] as const;
type Status = typeof STATUSES[number];

const STATUS_LABEL: Record<string, string> = {
  present: "Present",
  late:    "Late",
  absent:  "Absent",
  no_show: "No-show",
};

const STATUS_CLASS: Record<string, { active: string; inactive: string }> = {
  present: { active: "bg-emerald-600 border-emerald-500 text-white",        inactive: "border-white/10 text-neutral-400 hover:border-emerald-500/40" },
  late:    { active: "bg-amber-600 border-amber-500 text-black",            inactive: "border-white/10 text-neutral-400 hover:border-amber-500/40" },
  absent:  { active: "bg-neutral-700 border-neutral-600 text-neutral-100",  inactive: "border-white/10 text-neutral-400 hover:border-neutral-500/60" },
  no_show: { active: "bg-vermillion-600 border-vermillion-500 text-white",  inactive: "border-white/10 text-neutral-400 hover:border-vermillion-500/50" },
};

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

  function bulkSet(status: Status) {
    const next: Record<number, string> = {};
    for (const m of night.roster.members) next[m.characterId] = status;
    setStatuses(next);
  }

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

  const presentCount = Object.values(statuses).filter(s => s === "present").length;
  const lateCount    = Object.values(statuses).filter(s => s === "late").length;
  const absentCount  = Object.values(statuses).filter(s => s === "absent").length;
  const noShowCount  = Object.values(statuses).filter(s => s === "no_show").length;

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <Link href="/attendance" className="inline-flex items-center text-xs text-neutral-500 hover:text-vermillion-200 transition">← Raid nights</Link>
      <PageHeader
        eyebrow="Attendance"
        title={new Date(night.date).toISOString().slice(0, 10)}
        subtitle={`${night.roster.name}${night.notes ? ` · ${night.notes}` : ""}`}
      />
      <div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Stat label="Present" value={String(presentCount)} tone="fresh" />
          <Stat label="Late"    value={String(lateCount)}    tone="warm" />
          <Stat label="Absent"  value={String(absentCount)} />
          <Stat label="No-show" value={String(noShowCount)}  tone="cold" />
        </div>
      </div>

      {admin && night.roster.members.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500">Mark all:</span>
          <button onClick={() => bulkSet("present")} className="btn btn-xs">Present</button>
          <button onClick={() => bulkSet("late")}    className="btn btn-xs">Late</button>
          <button onClick={() => bulkSet("absent")}  className="btn btn-xs">Absent</button>
          <button onClick={() => bulkSet("no_show")} className="btn btn-xs hover:!border-vermillion-500/40 hover:!text-vermillion-200">No-show</button>
        </div>
      )}

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {night.roster.members.map(m => (
          <div key={m.characterId} className="panel p-3">
            <div className="flex items-center gap-2">
              <SpecIcon spec={m.character.spec} size={18} />
              <span className="font-medium" style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }}>
                {m.character.name}
              </span>
              <span className="text-xs text-neutral-500 ml-auto">{m.character.spec}</span>
              <span className="pill !uppercase">{m.memberRole}</span>
            </div>
            {admin ? (
              <div className="mt-2 flex gap-1.5">
                {STATUSES.map(s => {
                  const active = statuses[m.characterId] === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update(m.characterId, s)}
                      className={`flex-1 px-2 py-2 rounded-md text-[11px] uppercase tracking-wider font-semibold border transition min-h-[36px] ${
                        active ? STATUS_CLASS[s].active : STATUS_CLASS[s].inactive
                      }`}
                    >{STATUS_LABEL[s]}</button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1 text-xs uppercase text-neutral-400">{STATUS_LABEL[statuses[m.characterId] ?? "absent"]}</div>
            )}
          </div>
        ))}
        {night.roster.members.length === 0 && (
          <EmptyState
            icon={Users}
            title="Roster has no members"
            description="Add characters to the roster before tracking attendance."
            variant="compact"
          />
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block panel overflow-hidden">
        <table className="table">
          <thead>
            <tr><th>Character</th><th>Spec</th><th>Slot</th><th>Status</th></tr>
          </thead>
          <tbody>
            {night.roster.members.map(m => (
              <tr key={m.characterId}>
                <td className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <SpecIcon spec={m.character.spec} size={18} />
                    <span style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }}>{m.character.name}</span>
                  </span>
                </td>
                <td className="text-neutral-300">{m.character.spec}</td>
                <td className="text-xs uppercase text-neutral-500">{m.memberRole}</td>
                <td>
                  {admin ? (
                    <div className="flex gap-1">
                      {STATUSES.map(s => {
                        const active = statuses[m.characterId] === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => update(m.characterId, s)}
                            className={`px-2.5 py-1 rounded text-xs border transition whitespace-nowrap ${
                              active ? STATUS_CLASS[s].active : STATUS_CLASS[s].inactive
                            }`}
                          >{STATUS_LABEL[s]}</button>
                        );
                      })}
                    </div>
                  ) : <span className="text-xs uppercase">{STATUS_LABEL[statuses[m.characterId] ?? "absent"]}</span>}
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
        <div className="sticky bottom-[68px] md:bottom-0 -mx-4 px-4 py-3 bg-[var(--bg)]/90 backdrop-blur-md border-t border-white/[0.06] md:border-0 md:bg-transparent md:px-0 md:py-0 md:relative">
          <button className="btn-primary w-full md:w-auto" disabled={busy} onClick={save}>Save attendance</button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "fresh" | "warm" | "cold" }) {
  const TONE: Record<string, string> = {
    default: "text-neutral-200",
    fresh:   "text-emerald-300",
    warm:    "text-gold-200",
    cold:    "text-vermillion-200",
  };
  return (
    <div className="panel-elev px-3 py-2 min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 truncate">{label}</div>
      <div className={`text-base font-bold tabular-nums truncate ${TONE[tone]}`}>{value}</div>
    </div>
  );
}
