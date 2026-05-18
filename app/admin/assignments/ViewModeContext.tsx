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
};

const Ctx = createContext<ViewModeCtx | null>(null);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [readOnly, setReadOnlyRaw] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "raider") setReadOnlyRaw(true);
    } catch {}
  }, []);

  function setReadOnly(v: boolean) {
    setReadOnlyRaw(v);
    try {
      if (v) window.localStorage.setItem(STORAGE_KEY, "raider");
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return <Ctx.Provider value={{ readOnly, setReadOnly }}>{children}</Ctx.Provider>;
}

export function useViewMode(): ViewModeCtx {
  return useContext(Ctx) ?? { readOnly: false, setReadOnly: () => {} };
}

/** Conditional wrapper: renders children only when NOT in read-only mode. */
export function EditOnly({ children }: { children: ReactNode }) {
  const { readOnly } = useViewMode();
  if (readOnly) return null;
  return <>{children}</>;
}
