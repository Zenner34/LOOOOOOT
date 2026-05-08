"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/overview",    label: "Overview"   },
  { href: "/loot",        label: "Loot"       },
  { href: "/loot/assign", label: "Assign"     },
  { href: "/rosters",     label: "Rosters"    },
  { href: "/characters",  label: "Characters" },
  { href: "/attendance",  label: "Attendance" },
];

export default function NavBar({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/overview" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/70 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-6">
        <Link href="/overview" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-black text-xs font-black shadow-glow">
            m
          </span>
          <span className="font-bold text-amber-300 tracking-wide group-hover:text-amber-200 transition">
            meilootlol
          </span>
          <span className="ml-1 hidden sm:inline rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            TBC
          </span>
        </Link>

        <nav className="flex gap-0.5 flex-1 overflow-x-auto">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "nav-link-active" : "nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="text-sm">
          {admin ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                admin
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="btn">Log in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
