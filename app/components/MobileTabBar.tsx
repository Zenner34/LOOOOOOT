"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import { Award, Calendar, Layers, Package, Shield, Swords, Users } from "@/app/components/ui/Icon";

// Five most-used routes get prime thumb-reach real estate at the bottom of
// the screen on phones. Mirrors the pattern of native apps (iOS tab bar,
// Material bottom navigation). Hidden at md and up since desktop has the
// horizontal nav.

const ITEMS: Array<{ href: string; label: string; icon: LucideIcon; adminOnly?: boolean }> = [
  { href: "/overview",    label: "Overview", icon: Swords },
  { href: "/loot",        label: "Loot",     icon: Package },
  { href: "/loot/assign", label: "Assign",   icon: Award, adminOnly: true },
  { href: "/players",     label: "Players",  icon: Users },
  { href: "/attendance",  label: "Nights",   icon: Calendar },
];

// Public-only set — the three player-facing pages that survived the site
// simplification. Everything else is admin-only now.
const PUBLIC_ITEMS: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/guides",      label: "Guides",      icon: Shield },
  { href: "/assignments", label: "Assignments", icon: Layers },
  { href: "/overview",    label: "Overview",    icon: Swords },
];

export default function MobileTabBar({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/overview" ? pathname === href : pathname.startsWith(href);

  const items = admin ? ITEMS : PUBLIC_ITEMS;

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/10 bg-[var(--bg)]/95 backdrop-blur-md pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(item => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-medium transition ${
                  active ? "text-vermillion-300" : "text-neutral-400 active:text-vermillion-200"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
