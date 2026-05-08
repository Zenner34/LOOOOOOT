"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Five most-used routes get prime thumb-reach real estate at the bottom of
// the screen on phones. Mirrors the pattern of native apps (iOS tab bar,
// Material bottom navigation). Hidden at md and up since desktop has the
// horizontal nav.

const ITEMS = [
  { href: "/overview",    label: "Overview", icon: IconOverview },
  { href: "/loot",        label: "Loot",     icon: IconLoot },
  { href: "/loot/assign", label: "Assign",   icon: IconAssign },
  { href: "/players",     label: "Players",  icon: IconPlayers },
  { href: "/attendance",  label: "Nights",   icon: IconCalendar },
];

export default function MobileTabBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/overview" ? pathname === href : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[var(--bg)]/95 backdrop-blur-md pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(item => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-medium transition ${
                  active ? "text-vermillion-300" : "text-neutral-400 active:text-vermillion-200"
                }`}
              >
                <span className={active ? "text-vermillion-300" : "text-neutral-300"}>
                  <Icon active={active} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// --- Icons ---

function IconOverview({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconLoot({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8H3m18 0v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8m18 0-2-4H5L3 8m9 4v3" />
    </svg>
  );
}
function IconAssign({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function IconPlayers({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
