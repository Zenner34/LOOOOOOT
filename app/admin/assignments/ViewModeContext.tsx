"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "assignments.viewMode";

/**
 * Edit / Raider view toggle. Admins can flip into raider view to
 * preview the sheet stripped of every editing affordance — no Suggest
 * buttons, no Reset, no per-section delete or rename, no "add" boxes,
 * no team-edit pencil. Useful for "what does this look like for the
 * raiders?" without having to log out.
 *
 * Read-only mode persists to localStorage so reloads stay in whichever
 * view the admin last used.
 */
type ViewModeCtx = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
  /** True when the page can't be edited at all (non-admin viewer).
   *  In this state setReadOnly is a no-op and the toggle is hidden. */
  forced: boolean;
};

const Ctx = createContext<ViewModeCtx | null>(null);

export function ViewModeProvider({
  forceReadOnly = false,
  children,
}: {
  /** Pin readOnly true and disable the toggle. Set for non-admins. */
  forceReadOnly?: boolean;
  children: ReactNode;
}) {
  // Non-admins are pinned to read-only; admins can toggle freely with
  // their preference persisted to localStorage.
  const [readOnly, setReadOnlyRaw] = useState(forceReadOnly);

  useEffect(() => {
    if (forceReadOnly) {
      setReadOnlyRaw(true);
      return;
    }
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "raider") setReadOnlyRaw(true);
    } catch {}
  }, [forceReadOnly]);

  function setReadOnly(v: boolean) {
    if (forceReadOnly) return; // pinned for non-admins
    setReadOnlyRaw(v);
    try {
      if (v) window.localStorage.setItem(STORAGE_KEY, "raider");
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return <Ctx.Provider value={{ readOnly, setReadOnly, forced: forceReadOnly }}>{children}</Ctx.Provider>;
}

export function useViewMode(): ViewModeCtx {
  return useContext(Ctx) ?? { readOnly: false, setReadOnly: () => {}, forced: false };
}

/** Conditional wrapper: renders children only when NOT in read-only mode. */
export function EditOnly({ children }: { children: ReactNode }) {
  const { readOnly } = useViewMode();
  if (readOnly) return null;
  return <>{children}</>;
}
