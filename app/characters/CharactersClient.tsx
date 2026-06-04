"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR, SPECS } from "@/lib/specs";
import { SPECIALIZATIONS, type Specialization } from "@/lib/loot";
import { ClassIcon } from "@/app/components/ClassIcon";
import { SpecIcon } from "@/app/components/SpecIcon";
import { Select } from "@/app/components/Select";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { Shield, Pencil } from "@/app/components/ui/Icon";

type Character = {
  id: number;
  name: string;
  class: string;
  spec: string;
  role: string;
  active: boolean;
  isMain: boolean;
  craftedSpecializations: string[];
};

type SortKey = "name" | "class" | "role" | "active" | "main";
type SortDir = "asc" | "desc";

// SPECS grouped by class for the spec dropdown — far easier to scan
// than a flat 28-row list.
const specGroups = (() => {
  const byClass = new Map<string, typeof SPECS>();
  for (const s of SPECS) {
    const arr = byClass.get(s.class) ?? [];
    arr.push(s);
    byClass.set(s.class, arr);
  }
  return Array.from(byClass.entries()).map(([cls, specs]) => ({
    label: cls,
    options: specs.map(s => {
      const shortName = s.key.replace(`${cls} `, "").replace(` ${cls}`, "");
      return {
        value: s.key,
        label: (
          <span className="inline-flex items-center gap-2">
            <SpecIcon spec={s.key} size={16} />
            <span>{shortName}</span>
          </span>
        ),
      };
    }),
  }));
})();

export default function CharactersClient({ initial, admin }: { initial: Character[]; admin: boolean }) {
  const router = useRouter();
  const [chars, setChars] = useState(initial);
  const [name, setName] = useState("");
  const [spec, setSpec] = useState(SPECS[0].key);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(k: SortKey) {
    if (k === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? chars.filter(c => c.name.toLowerCase().includes(q) || c.class.toLowerCase().includes(q) || c.spec.toLowerCase().includes(q))
      : chars;
    if (!showInactive) rows = rows.filter(c => c.active);
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":   return a.name.localeCompare(b.name) * dir;
        case "class":  return (a.class.localeCompare(b.class) || a.spec.localeCompare(b.spec)) * dir;
        case "role":   return (a.role.localeCompare(b.role) || a.name.localeCompare(b.name)) * dir;
        case "active": return ((Number(b.active) - Number(a.active)) || a.name.localeCompare(b.name)) * dir;
        case "main":   return ((Number(b.isMain) - Number(a.isMain)) || a.name.localeCompare(b.name)) * dir;
      }
    });
    return rows;
  }, [chars, search, showInactive, sortKey, sortDir]);

  const inactiveCount = useMemo(() => chars.filter(c => !c.active).length, [chars]);

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

  const sortIndicator = (k: SortKey) =>
    k === sortKey ? (sortDir === "asc" ? "↑" : "↓") : "";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Roster"
        title="Characters"
        subtitle="Every character in the master roster — class, spec, role, and main/alt at a glance."
        actions={
          <span className="text-sm text-neutral-400">{chars.length} total{search && ` · ${visible.length} match search`}</span>
        }
      />

      {admin && (
        <form onSubmit={add} className="panel p-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="min-w-[260px]">
            <label className="label">Spec</label>
            <Select
              value={spec}
              onValueChange={setSpec}
              groups={specGroups}
            />
          </div>
          <button className="btn-primary" disabled={busy || !name.trim()}>Add</button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-sm"
          placeholder="Search by name, class, or spec…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm text-neutral-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
            className="accent-vermillion-500 w-4 h-4"
          />
          Show inactive{inactiveCount > 0 && <span className="text-neutral-500">({inactiveCount})</span>}
        </label>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {visible.map(c => (
          <div key={c.id} className={`panel p-3 ${c.active ? "" : "opacity-50"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 min-w-0 flex-1">
                <SpecIcon spec={c.spec} size={22} />
                <span className="min-w-0">
                  {admin ? (
                    <NameEditor c={c} onSave={n => patch(c.id, { name: n })} />
                  ) : (
                    <div className="font-semibold truncate" style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</div>
                  )}
                  <div className="text-xs text-neutral-400 truncate">{c.spec}</div>
                </span>
              </span>
              <MainAltBadge isMain={c.isMain} />
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-neutral-300">
                {c.role}
              </span>
            </div>
            {admin && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Select
                  size="sm"
                  value={c.spec}
                  onValueChange={v => patch(c.id, { spec: v })}
                  groups={specGroups}
                  triggerClassName="!min-w-[160px]"
                />
                <Select
                  size="sm"
                  value={c.isMain ? "main" : "alt"}
                  onValueChange={v => patch(c.id, { isMain: v === "main" })}
                  triggerClassName="!w-20"
                  options={[
                    { value: "main", label: "main" },
                    { value: "alt",  label: "alt" },
                  ]}
                />
                <Select
                  size="sm"
                  value={c.role}
                  onValueChange={v => patch(c.id, { role: v })}
                  triggerClassName="!w-24"
                  options={[
                    { value: "tank", label: "tank" },
                    { value: "heal", label: "heal" },
                    { value: "dps",  label: "dps" },
                  ]}
                />
                <label className="inline-flex items-center gap-1.5 text-xs text-neutral-400 min-h-[28px]">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={e => patch(c.id, { active: e.target.checked })}
                    className="accent-vermillion-500 w-4 h-4"
                  />
                  active
                </label>
                <button className="btn-danger btn-xs ml-auto" onClick={() => remove(c.id)}>Delete</button>
              </div>
            )}
            {admin && (
              <div className="mt-2">
                <SpecializationChips
                  value={c.craftedSpecializations}
                  onChange={next => patch(c.id, { craftedSpecializations: next })}
                />
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <EmptyState
            icon={Shield}
            title={search ? `No characters match "${search}"` : "No characters yet"}
            description={search ? "Try a broader query or clear the search." : "Add a character to get started."}
            variant="compact"
          />
        )}
      </div>

      {/* Desktop: full table */}
      <div className="hidden md:block panel overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>
                <button onClick={() => toggleSort("name")} className="hover:text-vermillion-200 transition">
                  Name {sortIndicator("name")}
                </button>
              </th>
              <th>
                <button onClick={() => toggleSort("class")} className="hover:text-vermillion-200 transition">
                  Class / Spec {sortIndicator("class")}
                </button>
              </th>
              <th>
                <button onClick={() => toggleSort("main")} className="hover:text-vermillion-200 transition">
                  Main / Alt {sortIndicator("main")}
                </button>
              </th>
              <th>
                <button onClick={() => toggleSort("role")} className="hover:text-vermillion-200 transition">
                  Role {sortIndicator("role")}
                </button>
              </th>
              <th>
                <button onClick={() => toggleSort("active")} className="hover:text-vermillion-200 transition">
                  Active {sortIndicator("active")}
                </button>
              </th>
              {admin && <th title="Blacksmithing specialization — gates the &quot;Can craft&quot; list on the Professions tab.">Crafts</th>}
              {admin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {visible.map(c => (
              <tr key={c.id} className={c.active ? "" : "opacity-50"}>
                <td className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    <SpecIcon spec={c.spec} size={20} />
                    {admin ? (
                      <NameEditor c={c} onSave={n => patch(c.id, { name: n })} />
                    ) : (
                      <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>{c.name}</span>
                    )}
                  </span>
                </td>
                <td className="text-neutral-300 text-sm">
                  {admin ? (
                    <Select
                      size="sm"
                      value={c.spec}
                      onValueChange={v => patch(c.id, { spec: v })}
                      groups={specGroups}
                      triggerClassName="!min-w-[180px]"
                    />
                  ) : c.spec}
                </td>
                <td>
                  {admin ? (
                    <Select
                      size="sm"
                      value={c.isMain ? "main" : "alt"}
                      onValueChange={v => patch(c.id, { isMain: v === "main" })}
                      triggerClassName="!w-20"
                      options={[
                        { value: "main", label: "main" },
                        { value: "alt",  label: "alt" },
                      ]}
                    />
                  ) : <MainAltBadge isMain={c.isMain} />}
                </td>
                <td>
                  {admin ? (
                    <Select
                      size="sm"
                      value={c.role}
                      onValueChange={v => patch(c.id, { role: v })}
                      triggerClassName="!w-24"
                      options={[
                        { value: "tank", label: "tank" },
                        { value: "heal", label: "heal" },
                        { value: "dps",  label: "dps" },
                      ]}
                    />
                  ) : <span className="uppercase text-xs text-neutral-400">{c.role}</span>}
                </td>
                <td>
                  {admin ? (
                    <input
                      type="checkbox"
                      checked={c.active}
                      onChange={e => patch(c.id, { active: e.target.checked })}
                      className="accent-vermillion-500"
                    />
                  ) : (c.active ? "yes" : "no")}
                </td>
                {admin && (
                  <td>
                    <SpecializationChips
                      value={c.craftedSpecializations}
                      onChange={next => patch(c.id, { craftedSpecializations: next })}
                    />
                  </td>
                )}
                {admin && (
                  <td className="text-right">
                    <button className="btn-danger btn-xs" onClick={() => remove(c.id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={admin ? 7 : 5} className="py-10 text-center text-neutral-500">
                  {search ? `No characters match "${search}".` : "No characters yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline rename. Saving PATCHes the same character row, so loot awards
// (which reference the character id) stay attached — no detach/re-add.
function NameEditor({ c, onSave }: { c: Character; onSave: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(c.name);
  useEffect(() => { if (!editing) setVal(c.name); }, [c.name, editing]);

  if (editing) {
    const commit = () => {
      const next = val.trim();
      setEditing(false);
      if (next && next !== c.name) onSave(next);
      else setVal(c.name);
    };
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          else if (e.key === "Escape") { setVal(c.name); setEditing(false); }
        }}
        className="input !h-7 !py-0 w-40 text-sm"
        aria-label="Character name"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group/name inline-flex items-center gap-1.5 hover:text-vermillion-200 transition"
      title="Rename character"
    >
      <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium">{c.name}</span>
      <Pencil size={11} className="text-neutral-500 opacity-0 group-hover/name:opacity-100 transition" aria-hidden />
    </button>
  );
}

// Short label so the chips don't blow up the table column.
const SPEC_SHORT: Record<Specialization, string> = {
  "Master Hammersmith": "Hammer",
  "Master Swordsmith":  "Sword",
  "Master Axesmith":    "Axe",
};

function SpecializationChips({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const set = new Set(value);
  function toggle(s: Specialization) {
    const next = new Set(set);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange(Array.from(next));
  }
  return (
    <div className="inline-flex flex-wrap gap-1 items-center">
      {SPECIALIZATIONS.map(s => {
        const on = set.has(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            title={s}
            aria-pressed={on}
            className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition ${
              on
                ? "bg-vermillion-500/15 text-vermillion-200 border-vermillion-500/40"
                : "bg-white/[0.03] text-neutral-500 border-white/10 hover:text-neutral-300 hover:border-white/20"
            }`}
          >
            {SPEC_SHORT[s]}
          </button>
        );
      })}
    </div>
  );
}

function MainAltBadge({ isMain }: { isMain: boolean }) {
  return isMain ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-400/15 text-gold-200 ring-1 ring-gold-400/30">
      <span aria-hidden="true">★</span>main
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
      alt
    </span>
  );
}
