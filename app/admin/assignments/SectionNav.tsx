"use client";

import { useEffect, useState } from "react";
import { ASSIGNMENT_BOSSES } from "@/lib/assignments";

/**
 * Sticky right-rail jump nav. Lists every scroll target on the
 * assignments page — Buffs, Tank/Heal, then a SSC section with each
 * boss, then TK. Clicking a link smooth-scrolls to that section
 * (sections set scroll-margin-top so they don't hide under the page
 * header). Active link highlights as the corresponding section enters
 * the viewport via IntersectionObserver.
 */
type Link = { id: string; label: string };
type Group = { heading?: string; items: Link[] };

export function SectionNav() {
  const groups: Group[] = [
    {
      items: [
        { id: "buffs", label: "Buffs" },
        { id: "tank-heal", label: "Tank / Heal" },
      ],
    },
    {
      heading: "Serpentshrine Cavern",
      items: ASSIGNMENT_BOSSES.filter(b => b.raidShort === "SSC").map(b => ({
        id: `boss-${b.slug}`,
        label: b.name,
      })),
    },
    {
      heading: "Tempest Keep",
      items: ASSIGNMENT_BOSSES.filter(b => b.raidShort === "TK").map(b => ({
        id: `boss-${b.slug}`,
        label: b.name,
      })),
    },
  ];

  const allIds = groups.flatMap(g => g.items.map(i => i.id));
  const [activeId, setActiveId] = useState<string>(allIds[0] ?? "");

  // Track which section is currently most-prominent in the viewport.
  // rootMargin trims the top 30% / bottom 60% so the "active" link
  // matches where the user is actually reading.
  useEffect(() => {
    const els = allIds
      .map(id => document.getElementById(id))
      .filter((x): x is HTMLElement => !!x);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.5, 1] },
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allIds.join(",")]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <nav
      className="rounded-lg border border-[#2a3650] p-3 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
      style={{ background: "linear-gradient(180deg, #1a2236, #111827)" }}
      aria-label="Jump to section"
    >
      <div
        className="text-xs font-bold uppercase tracking-wider text-white text-center px-3 py-1 mb-2 border border-[#2c5494] rounded"
        style={{ background: "linear-gradient(180deg, #234876, #1e3a5f)", textShadow: "0 1px 0 rgba(0,0,0,0.4)" }}
      >
        Jump to
      </div>
      <ul className="flex flex-col gap-3 text-xs">
        {groups.map((g, gi) => (
          <li key={gi}>
            {g.heading && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200/80 mb-1 px-1">
                {g.heading}
              </div>
            )}
            <ul className="flex flex-col gap-px">
              {g.items.map(item => {
                const active = item.id === activeId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => jump(item.id)}
                      className={`group block w-full text-left px-2 py-1 rounded transition-colors border-l-2 ${
                        active
                          ? "border-vermillion-500 bg-vermillion-500/[0.08] text-vermillion-200 font-semibold"
                          : "border-transparent text-neutral-300 hover:text-vermillion-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
