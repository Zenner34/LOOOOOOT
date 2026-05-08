"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CLASS_COLOR } from "@/lib/specs";

type Player = { id: number; displayName: string };
type Character = { id: number; name: string; class: string; spec: string; playerId: number | null };
type Boss = { id: number; name: string; raid: { id: number; name: string; shortName: string; phaseId: number } };

const PAGES: Array<{ label: string; href: string; hint?: string; adminOnly?: boolean }> = [
  { label: "Overview",   href: "/overview",    hint: "go to overview" },
  { label: "Loot",       href: "/loot",        hint: "browse the loot catalog" },
  { label: "Assign",     href: "/loot/assign", hint: "award loot",                adminOnly: true },
  { label: "Roster",     href: "/rosters",     hint: "members and roles" },
  { label: "Players",    href: "/players",     hint: "mains + alts" },
  { label: "Characters", href: "/characters",  hint: "raw character list" },
  { label: "Attendance", href: "/attendance",  hint: "raid nights" },
];

export default function CommandPalette({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const visiblePages = PAGES.filter(p => !p.adminOnly || admin);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ players: Player[]; characters: Character[]; bosses: Boss[] } | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Toggle on Cmd/Ctrl + K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lazy-load search data the first time the palette opens.
  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/search")
        .then(r => r.json())
        .then(d => { setData(d); setLoaded(true); })
        .catch(() => setLoaded(true));
    }
  }, [open, loaded]);

  function jump(href: string) {
    setOpen(false);
    router.push(href);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-30 hidden md:flex items-center gap-2 rounded-lg bg-[var(--surface-2)] border border-white/10 px-3 py-2 text-xs text-neutral-400 hover:text-white hover:border-vermillion-500/40 transition shadow-card"
        aria-label="Open command palette"
      >
        Quick search
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">⌘K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setOpen(false)}
      />
      <Command
        label="Quick search"
        className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[var(--surface)] shadow-2xl overflow-hidden animate-fade-in"
      >
        <div className="flex items-center px-3 border-b border-white/5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500 mr-2 flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Command.Input
            autoFocus
            placeholder="Search pages, players, characters, bosses…"
            className="flex-1 bg-transparent py-3 text-sm placeholder:text-neutral-500 outline-none border-0"
          />
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-400">esc</kbd>
        </div>

        <Command.List className="max-h-[60vh] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-neutral-500">
            {loaded ? "No matches." : "Loading…"}
          </Command.Empty>

          <Command.Group heading="Pages" className="px-1 [&>div[cmdk-group-heading]]:px-2 [&>div[cmdk-group-heading]]:py-1.5 [&>div[cmdk-group-heading]]:text-[10px] [&>div[cmdk-group-heading]]:font-semibold [&>div[cmdk-group-heading]]:uppercase [&>div[cmdk-group-heading]]:tracking-wider [&>div[cmdk-group-heading]]:text-neutral-500">
            {visiblePages.map(p => (
              <Command.Item
                key={p.href}
                value={`page ${p.label} ${p.hint ?? ""}`}
                onSelect={() => jump(p.href)}
                className="px-2 py-2 rounded-md text-sm text-neutral-200 cursor-pointer flex items-center justify-between data-[selected=true]:bg-vermillion-500/10 data-[selected=true]:text-vermillion-200"
              >
                <span>{p.label}</span>
                {p.hint && <span className="text-xs text-neutral-500">{p.hint}</span>}
              </Command.Item>
            ))}
          </Command.Group>

          {data && data.players.length > 0 && (
            <Command.Group heading="Players" className="mt-2 [&>div[cmdk-group-heading]]:px-2 [&>div[cmdk-group-heading]]:py-1.5 [&>div[cmdk-group-heading]]:text-[10px] [&>div[cmdk-group-heading]]:font-semibold [&>div[cmdk-group-heading]]:uppercase [&>div[cmdk-group-heading]]:tracking-wider [&>div[cmdk-group-heading]]:text-neutral-500">
              {data.players.map(p => (
                <Command.Item
                  key={`pl${p.id}`}
                  value={`player ${p.displayName}`}
                  onSelect={() => jump(`/players/${p.id}`)}
                  className="px-2 py-2 rounded-md text-sm text-neutral-200 cursor-pointer data-[selected=true]:bg-vermillion-500/10 data-[selected=true]:text-vermillion-200"
                >
                  {p.displayName}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data && data.characters.length > 0 && (
            <Command.Group heading="Characters" className="mt-2 [&>div[cmdk-group-heading]]:px-2 [&>div[cmdk-group-heading]]:py-1.5 [&>div[cmdk-group-heading]]:text-[10px] [&>div[cmdk-group-heading]]:font-semibold [&>div[cmdk-group-heading]]:uppercase [&>div[cmdk-group-heading]]:tracking-wider [&>div[cmdk-group-heading]]:text-neutral-500">
              {data.characters.map(c => (
                <Command.Item
                  key={`ch${c.id}`}
                  value={`character ${c.name} ${c.class} ${c.spec}`}
                  onSelect={() => c.playerId ? jump(`/players/${c.playerId}`) : jump("/characters")}
                  className="px-2 py-2 rounded-md text-sm cursor-pointer data-[selected=true]:bg-vermillion-500/10"
                >
                  <span style={{ color: CLASS_COLOR[c.class] ?? "#fff" }} className="font-medium">{c.name}</span>
                  <span className="text-neutral-500 text-xs"> · {c.spec}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {data && data.bosses.length > 0 && (
            <Command.Group heading="Bosses" className="mt-2 [&>div[cmdk-group-heading]]:px-2 [&>div[cmdk-group-heading]]:py-1.5 [&>div[cmdk-group-heading]]:text-[10px] [&>div[cmdk-group-heading]]:font-semibold [&>div[cmdk-group-heading]]:uppercase [&>div[cmdk-group-heading]]:tracking-wider [&>div[cmdk-group-heading]]:text-neutral-500">
              {data.bosses.map(b => (
                <Command.Item
                  key={`bo${b.id}`}
                  value={`boss ${b.name} ${b.raid.name} ${b.raid.shortName}`}
                  onSelect={() => jump(`/loot?phaseFilter=${b.raid.phaseId}&raid=${b.raid.id}&boss=${b.id}`)}
                  className="px-2 py-2 rounded-md text-sm cursor-pointer flex items-center justify-between data-[selected=true]:bg-vermillion-500/10"
                >
                  <span className="text-neutral-200">{b.name}</span>
                  <span className="text-xs text-neutral-500">{b.raid.shortName}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="px-3 py-2 border-t border-white/5 flex items-center gap-3 text-[10px] text-neutral-500">
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↵</kbd> open</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">esc</kbd> close</span>
        </div>
      </Command>
    </div>
  );
}
