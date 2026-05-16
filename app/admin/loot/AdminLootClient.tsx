"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { WowheadLink } from "@/lib/wowhead";
import { parsePhaseParam } from "@/lib/phases";
import { PhaseFilter } from "@/app/components/PhaseFilter";
import { Select } from "@/app/components/Select";
import { ClassIcon } from "@/app/components/ClassIcon";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { ArrowDown, ArrowUp, Inbox, Pencil, Search, X } from "@/app/components/ui/Icon";
import EditAwardModal from "./EditAwardModal";

export type AdminAward = {
  id: number;
  awardedAt: string;
  notes: string | null;
  item: {
    id: number;
    name: string;
    wowheadId: number | null;
    slot: string | null;
    boss: { name: string; raid: { shortName: string; name: string } };
  };
  character: {
    id: number;
    name: string;
    class: string;
    spec: string;
    playerId: number | null;
    playerName: string | null;
  };
  roster: { id: number; name: string };
  raidNight: { id: number; date: string; notes: string | null } | null;
};

export type RosterWithRoster = {
  id: number;
  name: string;
  characters: Array<{
    id: number;
    name: string;
    class: string;
    spec: string;
    isMain: boolean;
    playerId: number | null;
    playerName: string | null;
  }>;
  raidNights: Array<{ id: number; date: string; notes: string | null }>;
};

const UNDO_GRACE_MS = 5000;

export default function AdminLootClient({
  awards,
  total,
  page,
  pageSize,
  rosters,
  phases,
  filters,
}: {
  awards: AdminAward[];
  total: number;
  page: number;
  pageSize: number;
  rosters: RosterWithRoster[];
  phases: Array<{ order: number; name: string }>;
  filters: {
    q: string;
    from: string | null;
    to: string | null;
    roster: string | null;
    phase: string | null;
    sort: "dateAsc" | "dateDesc";
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(filters.q);
  const [editing, setEditing] = useState<AdminAward | null>(null);
  const [pendingDeletes, setPendingDeletes] = useState<Set<number>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);
  const phaseFilter = parsePhaseParam(filters.phase);

  // "/" hotkey focuses search.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA" || t?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced URL sync for search (300ms after typing stops).
  useEffect(() => {
    if (q === filters.q) return;
    const t = setTimeout(() => updateParam("q", q || null, true), 300);
    return () => clearTimeout(t);
  }, [q, filters.q]);

  function updateParam(key: string, value: string | null, resetPage = false) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value == null || value === "") sp.delete(key);
    else sp.set(key, value);
    if (resetPage) sp.delete("page");
    const qs = sp.toString();
    router.push(qs ? `/admin/loot?${qs}` : "/admin/loot");
  }

  function clearAllFilters() {
    setQ("");
    router.push("/admin/loot");
  }

  function toggleSort() {
    updateParam("sort", filters.sort === "dateDesc" ? "dateAsc" : "dateDesc");
  }

  async function deleteAward(award: AdminAward) {
    // Optimistic fade: mark pending, schedule actual delete after grace.
    setPendingDeletes(prev => new Set(prev).add(award.id));
    let cancelled = false;
    toast(`Deleted ${award.item.name} from ${award.character.name}`, {
      duration: UNDO_GRACE_MS,
      action: {
        label: "Undo",
        onClick: () => {
          cancelled = true;
          setPendingDeletes(prev => {
            const next = new Set(prev);
            next.delete(award.id);
            return next;
          });
        },
      },
    });
    setTimeout(async () => {
      if (cancelled) return;
      const r = await fetch(`/api/loot/${award.id}`, { method: "DELETE" });
      if (r.ok) {
        router.refresh();
      } else {
        toast.error("Delete failed — restoring.");
        setPendingDeletes(prev => {
          const next = new Set(prev);
          next.delete(award.id);
          return next;
        });
      }
    }, UNDO_GRACE_MS);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);
  const activeFilterCount = [
    filters.q,
    filters.from,
    filters.to,
    filters.roster && filters.roster !== "all" ? filters.roster : null,
    filters.phase,
  ].filter(Boolean).length;

  const editingRoster = editing ? rosters.find(r => r.id === editing.roster.id) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Admin"
        title="All loot"
        subtitle="Search, edit, or remove any award across every raid we've run. Changes save immediately; deletes have a five-second undo."
      />

      {/* Filter row — sticky at top of viewport */}
      <div className="sticky top-0 z-20 bg-[var(--bg)]/95 backdrop-blur-md -mx-4 px-4 py-3 border-y border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden />
            <input
              ref={searchRef}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search item, character, player…"
              className="input pl-9 pr-9 rounded-full"
              aria-label="Search awards"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-vermillion-200 transition"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="inline-flex items-center gap-2 text-xs">
            <span className="text-neutral-500">From</span>
            <input
              type="date"
              value={filters.from ?? ""}
              onChange={e => updateParam("from", e.target.value || null, true)}
              className="input text-xs min-w-[130px] [color-scheme:dark]"
              aria-label="From date"
            />
            <span className="text-neutral-500">To</span>
            <input
              type="date"
              value={filters.to ?? ""}
              onChange={e => updateParam("to", e.target.value || null, true)}
              className="input text-xs min-w-[130px] [color-scheme:dark]"
              aria-label="To date"
            />
          </div>

          {rosters.length > 1 && (
            <div className="min-w-[150px]">
              <Select
                value={filters.roster ?? String(rosters[0]?.id ?? "")}
                onValueChange={v => updateParam("roster", v, true)}
                size="sm"
                options={[
                  ...rosters.map(r => ({ value: String(r.id), label: r.name })),
                  { value: "all", label: "All rosters" },
                ]}
              />
            </div>
          )}

          <PhaseFilter phases={phases} selected={phaseFilter} />

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-vermillion-300 hover:text-vermillion-200 transition"
            >
              Reset {activeFilterCount > 1 ? `· ${activeFilterCount}` : ""}
            </button>
          )}

          <span className="ml-auto text-xs text-neutral-500 tabular-nums">
            {total === 0 ? "0 awards" : `Showing ${showingFrom}–${showingTo} of ${total}`}
          </span>
        </div>
      </div>

      {/* Table */}
      {awards.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No awards match"
          description={activeFilterCount > 0 ? "Try widening the date range or clearing a filter." : "No loot has been awarded yet."}
          variant="compact"
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <button
                    onClick={toggleSort}
                    className="hover:text-vermillion-200 transition inline-flex items-center gap-1"
                    title="Sort by date"
                  >
                    Date
                    {filters.sort === "dateDesc" && <ArrowDown size={12} aria-hidden />}
                    {filters.sort === "dateAsc" && <ArrowUp size={12} aria-hidden />}
                  </button>
                </th>
                <th>Item</th>
                <th>Winner</th>
                <th className="hidden md:table-cell">Boss</th>
                <th className="hidden lg:table-cell">Raid night</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {awards.map(a => {
                const pending = pendingDeletes.has(a.id);
                return (
                  <tr
                    key={a.id}
                    className={`group odd:bg-white/[0.012] hover:bg-vermillion-500/[0.04] transition-all ${pending ? "opacity-30" : ""}`}
                  >
                    <td className="text-neutral-400 text-xs tabular-nums whitespace-nowrap">
                      {a.awardedAt.slice(0, 10)}
                    </td>
                    <td>
                      <WowheadLink name={a.item.name} wowheadId={a.item.wowheadId} />
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        <ClassIcon cls={a.character.class} size={14} />
                        <span style={{ color: CLASS_COLOR[a.character.class] ?? "#fff" }} className="font-medium">
                          {a.character.name}
                        </span>
                        {a.character.playerName && a.character.playerName !== a.character.name && (
                          <span className="text-neutral-500 text-xs">· {a.character.playerName}</span>
                        )}
                      </span>
                    </td>
                    <td className="hidden md:table-cell text-neutral-400 text-xs">
                      {a.item.boss.name}
                      <span className="text-neutral-600"> · {a.item.boss.raid.shortName}</span>
                    </td>
                    <td className="hidden lg:table-cell text-neutral-500 text-xs">
                      {a.raidNight ? (
                        <span>{a.raidNight.date}{a.raidNight.notes ? <span className="text-neutral-600"> · {a.raidNight.notes}</span> : null}</span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-vermillion-200 disabled:opacity-30 px-2 py-1 rounded transition"
                        aria-label={`Edit award ${a.id}`}
                      >
                        <Pencil size={12} aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAward(a)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-rose-300 disabled:opacity-30 px-2 py-1 rounded transition"
                        aria-label={`Delete award ${a.id}`}
                      >
                        <X size={12} aria-hidden />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <PageLink page={page - 1} disabled={page <= 1} label="‹ Previous" />
            <PageLink page={page + 1} disabled={page >= totalPages} label="Next ›" />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && editingRoster && (
        <EditAwardModal
          award={editing}
          roster={editingRoster}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
          onDeleted={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function PageLink({ page, disabled, label }: { page: number; disabled: boolean; label: string }) {
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams.toString());
  if (page <= 1) sp.delete("page");
  else sp.set("page", String(page));
  const href = sp.toString() ? `/admin/loot?${sp.toString()}` : "/admin/loot";
  if (disabled) {
    return <span className="px-3 py-1.5 text-xs text-neutral-600 cursor-not-allowed">{label}</span>;
  }
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-xs text-neutral-200 hover:text-vermillion-200 rounded-md border border-white/10 hover:border-white/20 transition"
    >
      {label}
    </Link>
  );
}
