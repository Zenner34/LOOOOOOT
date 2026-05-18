"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "assignments.lockedHighlight";

/**
 * Hover-highlight shared state. Any CharacterChip on the page reads
 * `effectiveId` and lights up if its character id matches; every other
 * chip dims. Two layers compose into `effectiveId`:
 *
 * - `lockedId` — sticky selection from the top-bar "Spotlight" picker.
 *   Persists across reloads via localStorage, ignored when the admin
 *   hovers something else.
 * - `hoverId` — transient, set on chip mouseenter, cleared on
 *   mouseleave.
 *
 * Hover wins when present; otherwise the locked id is used. This keeps
 * the "what am I doing tonight?" use case (lock yourself, then hover
 * other people to compare) feeling natural.
 */
type HighlightCtx = {
  hoverId: number | null;
  lockedId: number | null;
  effectiveId: number | null;
  setHover: (id: number | null) => void;
  setLocked: (id: number | null) => void;
};

const Ctx = createContext<HighlightCtx | null>(null);

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [lockedId, setLockedIdRaw] = useState<number | null>(null);

  // Hydrate locked id from localStorage on mount so a returning raider
  // stays focused on themselves. Wrapped in a try/catch because the
  // typed value can be invalid (other origin, manual edit, etc.).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) setLockedIdRaw(n);
      }
    } catch {}
  }, []);

  function setLocked(id: number | null) {
    setLockedIdRaw(id);
    try {
      if (id == null) window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {}
  }

  const value = useMemo<HighlightCtx>(() => ({
    hoverId,
    lockedId,
    effectiveId: hoverId ?? lockedId,
    setHover: setHoverId,
    setLocked,
  }), [hoverId, lockedId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHighlight() {
  const v = useContext(Ctx);
  // No-op fallback so chips outside the provider still render fine.
  if (!v) return { hoverId: null, lockedId: null, effectiveId: null, setHover: () => {}, setLocked: () => {} } satisfies HighlightCtx;
  return v;
}
