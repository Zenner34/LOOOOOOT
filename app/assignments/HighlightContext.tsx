"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "assignments.lockedHighlight";

/**
 * Highlight state for the assignment sheet. Two layers compose:
 *
 * - `lockedIds` — sticky *set* of character ids. The top-bar player
 *   picker locks all of a player's characters at once so a raider sees
 *   their main + alts light up together. Persists across reloads via
 *   localStorage; the stored value is a comma-separated id list, and we
 *   still accept the legacy single-integer encoding so old admins don't
 *   lose their existing lock.
 * - `hoverId` — transient, set on chip mouseenter, cleared on mouseleave.
 *   Single character only.
 *
 * Hover wins for the highlight when present (so the raider can briefly
 * peek elsewhere without losing their lock). Use `isHighlighted(id)` to
 * render the gold ring; use `anyHighlight` to know whether to desaturate
 * non-matching chips.
 */
type HighlightCtx = {
  hoverId: number | null;
  lockedIds: ReadonlySet<number>;
  anyHighlight: boolean;
  isHighlighted: (id: number) => boolean;
  setHover: (id: number | null) => void;
  setLocked: (ids: number[] | null) => void;
};

const Ctx = createContext<HighlightCtx | null>(null);

const EMPTY_SET: ReadonlySet<number> = new Set();

export function HighlightProvider({
  children,
  storageKey = STORAGE_KEY,
}: {
  children: ReactNode;
  /** Override so sheets with different id-spaces (the BT/Hyjal member
   *  sheet vs the old character-based sheet) don't share locks. */
  storageKey?: string;
}) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [lockedIds, setLockedIdsRaw] = useState<ReadonlySet<number>>(EMPTY_SET);

  // Hydrate lock from localStorage on mount so a returning raider stays
  // focused on themselves. Accepts the comma-separated format AND the
  // legacy single-integer string so old saved locks still work.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const ids = raw
        .split(",")
        .map(s => Number(s.trim()))
        .filter(n => Number.isFinite(n) && n > 0);
      if (ids.length > 0) setLockedIdsRaw(new Set(ids));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLocked(ids: number[] | null) {
    const next: ReadonlySet<number> = ids && ids.length > 0 ? new Set(ids) : EMPTY_SET;
    setLockedIdsRaw(next);
    try {
      if (next.size === 0) window.localStorage.removeItem(storageKey);
      else window.localStorage.setItem(storageKey, [...next].join(","));
    } catch {}
  }

  const value = useMemo<HighlightCtx>(() => {
    const anyHighlight = hoverId != null || lockedIds.size > 0;
    return {
      hoverId,
      lockedIds,
      anyHighlight,
      isHighlighted: (id: number) =>
        hoverId != null ? hoverId === id : lockedIds.has(id),
      setHover: setHoverId,
      setLocked,
    };
  }, [hoverId, lockedIds]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHighlight(): HighlightCtx {
  const v = useContext(Ctx);
  if (!v) return {
    hoverId: null,
    lockedIds: EMPTY_SET,
    anyHighlight: false,
    isHighlighted: () => false,
    setHover: () => {},
    setLocked: () => {},
  };
  return v;
}
