"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CLASS_COLOR } from "@/lib/specs";
import { WowheadLink } from "@/lib/wowhead";
import { ClassIcon } from "@/app/components/ClassIcon";
import { Select } from "@/app/components/Select";
import { Search, X } from "@/app/components/ui/Icon";
import type { AdminAward, RosterWithRoster } from "./AdminLootClient";

export default function EditAwardModal({
  award,
  roster,
  onClose,
  onSaved,
  onDeleted,
}: {
  award: AdminAward;
  roster: RosterWithRoster;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [characterId, setCharacterId] = useState<number>(award.character.id);
  const [raidNightId, setRaidNightId] = useState<string>(
    award.raidNight ? String(award.raidNight.id) : "none",
  );
  const [notes, setNotes] = useState<string>(award.notes ?? "");
  const [characterQuery, setCharacterQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on Escape, body-scroll lock while open, click-outside closes the
  // character picker only (not the whole modal).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (!pickerRef.current?.contains(e.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [pickerOpen]);

  // Build a flat, search-filtered list of characters grouped by player.
  const filteredCharacters = useMemo(() => {
    const q = characterQuery.trim().toLowerCase();
    return roster.characters
      .filter(c => {
        if (!q) return true;
        const hay = [c.name, c.class, c.spec, c.playerName ?? ""].join(" ").toLowerCase();
        return q.split(/\s+/).every(t => hay.includes(t));
      })
      .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.name.localeCompare(b.name));
  }, [roster.characters, characterQuery]);

  const currentCharacter = roster.characters.find(c => c.id === characterId) ?? null;

  const dirty =
    characterId !== award.character.id ||
    raidNightId !== (award.raidNight ? String(award.raidNight.id) : "none") ||
    (notes || "") !== (award.notes ?? "");

  async function save() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/loot/${award.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          characterId,
          raidNightId: raidNightId === "none" ? null : Number(raidNightId),
          notes: notes.trim() ? notes.trim() : null,
        }),
      });
      if (!r.ok) {
        toast.error("Save failed.");
        return;
      }
      toast.success("Award updated.");
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function deleteAward() {
    if (deleting) return;
    if (!confirm(`Delete ${award.item.name} from ${award.character.name}? This can be undone.`)) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/loot/${award.id}`, { method: "DELETE" });
      if (!r.ok) {
        toast.error("Delete failed.");
        return;
      }
      toast.success(`Deleted ${award.item.name}.`);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Edit award">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-1">
                Edit award
              </div>
              <WowheadLink name={award.item.name} wowheadId={award.item.wowheadId} iconSize={24} />
              <div className="mt-1 text-[11px] text-neutral-500">
                {award.item.boss.name} · {award.item.boss.raid.shortName}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200 transition p-1 -m-1"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 overflow-y-auto">
            {/* Winner picker */}
            <div ref={pickerRef} className="relative">
              <label className="label">Winner</label>
              <button
                type="button"
                onClick={() => setPickerOpen(o => !o)}
                className="w-full inline-flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-neutral-100 hover:border-white/20 focus:border-vermillion-400/60 focus:ring-2 focus:ring-vermillion-500/20 outline-none transition"
              >
                {currentCharacter ? (
                  <span className="inline-flex items-center gap-2 min-w-0">
                    <ClassIcon cls={currentCharacter.class} size={14} />
                    <span style={{ color: CLASS_COLOR[currentCharacter.class] ?? "#fff" }} className="font-medium truncate">
                      {currentCharacter.name}
                    </span>
                    <span className="text-neutral-500 text-xs truncate">
                      · {currentCharacter.spec}
                      {currentCharacter.playerName && currentCharacter.playerName !== currentCharacter.name
                        ? ` · ${currentCharacter.playerName}`
                        : ""}
                    </span>
                  </span>
                ) : (
                  <span className="text-neutral-500">— pick a winner —</span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 flex-shrink-0">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {pickerOpen && (
                <div className="absolute z-10 mt-1.5 w-full rounded-lg border border-white/10 bg-[var(--surface-2)] shadow-2xl flex flex-col max-h-[300px]">
                  <div className="relative p-2 border-b border-white/5">
                    <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search players or characters…"
                      value={characterQuery}
                      onChange={e => setCharacterQuery(e.target.value)}
                      className="input pl-7 text-xs h-8"
                    />
                  </div>
                  <ul className="flex-1 overflow-y-auto p-1">
                    {filteredCharacters.length === 0 ? (
                      <li className="px-2 py-3 text-center text-xs text-neutral-500">No matches</li>
                    ) : filteredCharacters.map(c => {
                      const active = c.id === characterId;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => { setCharacterId(c.id); setPickerOpen(false); setCharacterQuery(""); }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition ${
                              active
                                ? "bg-vermillion-500/15 text-vermillion-100"
                                : "text-neutral-200 hover:bg-vermillion-500/[0.08] hover:text-vermillion-200"
                            }`}
                          >
                            {c.isMain && <span className="text-gold-300 text-[9px]" aria-hidden>★</span>}
                            <ClassIcon cls={c.class} size={12} />
                            <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium">
                              {c.name}
                            </span>
                            <span className="text-neutral-500 text-[11px] flex-1 text-left truncate">
                              · {c.spec}
                              {c.playerName && c.playerName !== c.name ? ` · ${c.playerName}` : ""}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Raid night */}
            <div>
              <label className="label">Raid night</label>
              <Select
                value={raidNightId}
                onValueChange={v => setRaidNightId(v)}
                options={[
                  { value: "none", label: "— none —" },
                  ...roster.raidNights.map(n => ({
                    value: String(n.id),
                    label: `${n.date}${n.notes ? ` · ${n.notes}` : ""}`,
                  })),
                ]}
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                Changing this re-stamps the award's date to the night's date.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional context (off-spec, MS+1, etc.)"
                className="input w-full resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={deleteAward}
              disabled={deleting}
              className="inline-flex items-center gap-1 text-sm text-rose-300 hover:text-rose-200 disabled:opacity-30 transition"
            >
              {deleting ? "Deleting…" : "Delete award"}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="btn"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
