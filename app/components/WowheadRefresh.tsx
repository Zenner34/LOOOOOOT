"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-runs the Wowhead tooltip script's link-decoration pass on every
 * client-side route change.
 *
 * Wowhead's tooltips.js (loaded with `defer` in app/layout.tsx) walks
 * the DOM at initial page-load, finds every `<a data-wowhead="…">`,
 * fetches that item's metadata, and replaces the icon + adds a hover
 * tooltip. On Next.js client navigation the document doesn't reload,
 * so newly-mounted links keep whatever fallback we server-rendered
 * (often the inv_misc_questionmark.jpg "?" icon) until the user hard
 * refreshes. Calling `$WowheadPower.refreshLinks()` makes the script
 * re-scan the new DOM and resolve the icons properly.
 *
 * Renders nothing — this is a behavioural hook that lives at the root.
 */
export default function WowheadRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const power = (window as { $WowheadPower?: { refreshLinks?: () => void } }).$WowheadPower;
    // The script may not have finished loading yet on first navigation;
    // try once now, then again after a short tick to catch the case
    // where defer-loading races route change.
    power?.refreshLinks?.();
    const t = window.setTimeout(() => {
      const later = (window as { $WowheadPower?: { refreshLinks?: () => void } }).$WowheadPower;
      later?.refreshLinks?.();
    }, 200);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
