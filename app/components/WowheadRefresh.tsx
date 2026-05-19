"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-runs the Wowhead tooltip script's link-decoration pass on every
 * client-side route change.
 *
 * Wowhead's widgets/power.js (loaded with `defer` in app/layout.tsx)
 * scans the DOM on initial document-load, finds every `<a
 * data-wowhead="…">`, fetches that item's metadata, and replaces
 * the icon + adds a hover tooltip. On Next.js client navigation the
 * document doesn't reload, so newly-mounted links keep whatever
 * fallback we server-rendered (often the inv_misc_questionmark.jpg
 * "?" icon) until the user hard refreshes.
 *
 * The widget exposes a few different refresh API surfaces depending
 * on its version. We try them in order, polling for the global to
 * appear (defer-loaded scripts race route changes early in the
 * session). Renders nothing — this is a behavioural hook.
 */
type WowheadWindow = Window & {
  $WowheadPower?: { refreshLinks?: () => void; refresh?: () => void };
  WH?: { Tooltip?: { refresh?: () => void } };
};

function tryRefresh(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as WowheadWindow;
  if (w.$WowheadPower?.refreshLinks) { w.$WowheadPower.refreshLinks(); return true; }
  if (w.$WowheadPower?.refresh)      { w.$WowheadPower.refresh();      return true; }
  if (w.WH?.Tooltip?.refresh)        { w.WH.Tooltip.refresh();         return true; }
  return false;
}

export default function WowheadRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Immediate attempt — covers the steady-state case where the
    // script has long since loaded.
    if (tryRefresh()) return;
    // Otherwise poll for the global. Most environments have it within
    // 300-800ms of `defer` script load; we cap at 5s to avoid
    // leaking intervals if the script never loads (CDN blocked, etc).
    const start = Date.now();
    const id = window.setInterval(() => {
      if (tryRefresh() || Date.now() - start > 5000) {
        window.clearInterval(id);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [pathname]);

  return null;
}
