"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import BossGuide from "@/app/guides/BossGuide";
import { BT_BOSSES } from "@/app/guides/black-temple/bosses";
import { MH_BOSSES } from "@/app/guides/mount-hyjal/bosses";
import type { PhaseBossMeta } from "@/lib/raid-helper";
import { ArrowUpRight, X } from "@/app/components/ui/Icon";

/**
 * The boss-guide popup opened from an assignment card. Renders the full
 * guide for that boss — hero, section tabs, diagrams — inside a large
 * scrollable overlay, so raiders can read the fight without leaving
 * their assignments. Section tabs pin to the top of the modal while
 * scrolling; a header link jumps to the full /guides page.
 */
export function BossGuideModal({
  boss,
  onClose,
}: {
  boss: PhaseBossMeta;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Scroll-lock the page behind the overlay; Escape closes.
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

  const guideBoss = useMemo(
    () => [...BT_BOSSES, ...MH_BOSSES].find(b => b.id === boss.guideId) ?? null,
    [boss.guideId],
  );

  if (!mounted || !guideBoss) return null;

  const raidName = boss.raidShort === "BT" ? "Black Temple" : "Mount Hyjal";
  const guideHref = boss.raidShort === "BT" ? "/guides/black-temple" : "/guides/mount-hyjal";

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={`${boss.name} guide`}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-2 sm:p-6 pointer-events-none">
        <div className="pointer-events-auto flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg)] shadow-2xl animate-fade-in">
          {/* Slim header — the guide's own hero carries the big title. */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
            <div className="min-w-0 inline-flex items-baseline gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: boss.accent }}
              >
                Boss Guide
              </span>
              <span className="truncate text-sm font-semibold text-neutral-200">{boss.name}</span>
              <span className="hidden sm:inline text-[11px] text-neutral-500">· {raidName}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href={guideHref}
                className="btn-ghost btn-xs inline-flex items-center gap-1"
                title={`Open the full ${raidName} guide`}
              >
                Full guide <ArrowUpRight size={12} aria-hidden />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost btn-xs !px-2"
                aria-label="Close guide"
              >
                <X size={15} aria-hidden />
              </button>
            </div>
          </div>

          {/* The guide itself, scrolling independently. */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
            <BossGuide boss={guideBoss} raidName={raidName} modal />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
