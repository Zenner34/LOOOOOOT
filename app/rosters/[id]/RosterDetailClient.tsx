"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { Select } from "@/app/components/Select";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";

type Roster = { id: number; name: string; description: string | null };
type Character = { id: number; name: string; class: string; spec: string; role: string; active: boolean; isMain: boolean };
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

  const inRoster = useMemo(() => new Set(members.map(m => m.characterId)), [members]);
  const available = props.allCharacters.filter(c => !inRoster.has(c.id));

  const grouped = useMemo(() => {
    const by: Record<string, Member[]> = { tank: [], heal: [], dps: [] };
    for (const m of members) (by[m.character.role] ??= []).push(m);
    for (const role of Object.keys(by)) {
      by[role].sort((a, b) =>
        (Number(b.character.isMain) - Number(a.character.isMain)) ||
        a.character.name.localeCompare(b.character.name),
      );
    }
    return by;
  }, [members]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    if (!pickId) return;
    const r = await fetch(`/api/rosters/${props.roster.id}/members`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ characterId: pickId }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast.error(j.error ?? "Failed to add member.");
      return;
    }
    const created = await r.json();
    setMembers([...members, created]);
    setPickId("");
    toast.success(`Added ${created.character?.name ?? "character"}.`);
  }

  async function setMainAlt(characterId: number, isMain: boolean) {
    const r = await fetch(`/api/characters/${characterId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isMain }),
    });
    if (!r.ok) return;
    setMembers(members.map(m =>
      m.characterId === characterId
        ? { ...m, character: { ...m.character, isMain } }
        : m,
    ));
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link href="/rosters" className="text-xs text-neutral-500 hover:text-vermillion-200">← Rosters</Link>
        <div className="mt-2 flex items-start justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <span className="heading-eyebrow">Roster</span>
            <h1 className="text-2xl font-bold tracking-tight">{props.roster.name}</h1>
            {props.roster.description && <p className="text-neutral-400 text-sm mt-1">{props.roster.description}</p>}
          </div>
          {props.admin && <button className="btn-danger btn-xs" onClick={deleteRoster}>Delete roster</button>}
        </div>
      </div>

      {props.admin && (
        <form onSubmit={addMember} className="panel p-4 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-3">
          <div className="min-w-0">
            <label className="label">Add character</label>
            <Select
              value={String(pickId || "")}
              onValueChange={v => setPickId(Number(v) || "")}
              placeholder="Select a character…"
              options={available.map(c => ({
                value: String(c.id),
                label: (
                  <span className="inline-flex items-center gap-2">
                    <SpecIcon spec={c.spec} size={14} />
                    <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                    <span className="text-neutral-500 text-xs">{c.spec}</span>
                  </span>
                ),
              }))}
            />
          </div>
          <button className="btn-primary" disabled={!pickId}>Add</button>
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {(["tank", "heal", "dps"] as const).map(role => (
          <div key={role} className="panel p-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-2 flex items-center justify-between">
              <span>{role === "tank" ? "Tanks" : role === "heal" ? "Healers" : "DPS"}</span>
              <span className="pill">{grouped[role]?.length ?? 0}</span>
            </h2>
            <ul className="space-y-1">
              {(grouped[role] ?? []).map(m => (
                <li key={m.id} className="flex items-center gap-2 text-sm rounded-md hover:bg-white/[0.02] transition py-1 -mx-1 px-1">
                  <SpecIcon spec={m.character.spec} size={16} />
                  <span className="flex-1 min-w-0 truncate font-medium" style={{ color: CLASS_COLOR[m.character.class] ?? "#fff" }}>
                    {m.character.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 truncate hidden sm:inline">{m.character.spec}</span>
                  {props.admin ? (
                    <>
                      <Select
                        size="sm"
                        value={m.character.isMain ? "main" : "alt"}
                        onValueChange={v => setMainAlt(m.characterId, v === "main")}
                        triggerClassName="!w-[60px]"
                        options={[
                          { value: "main", label: "main" },
                          { value: "alt",  label: "alt" },
                        ]}
                      />
                      <button
                        className="text-neutral-500 hover:text-red-400 active:text-red-300 min-w-[28px] min-h-[28px] flex items-center justify-center"
                        onClick={() => removeMember(m.characterId)}
                        aria-label={`Remove ${m.character.name}`}
                      >×</button>
                    </>
                  ) : (
                    m.character.isMain ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-200">★ main</span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">alt</span>
                    )
                  )}
                </li>
              ))}
              {(grouped[role]?.length ?? 0) === 0 && <li className="text-xs text-neutral-600 italic px-1">none</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
