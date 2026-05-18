"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";
import { Menu, X } from "@/app/components/ui/Icon";

const NAV = [
  { href: "/overview",    label: "Overview"                  },
  { href: "/loot",        label: "Loot"                      },
  { href: "/loot/assign",        label: "Assign",      adminOnly: true },
  { href: "/admin/loot",         label: "All loot",    adminOnly: true },
  { href: "/admin/assignments",  label: "Assignments"                  },
  { href: "/rosters",     label: "Roster"                    },
  { href: "/players",     label: "Players"                   },
  { href: "/characters",  label: "Characters"                },
  { href: "/attendance",  label: "Attendance"                },
];

export default function NavBar({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleNav = NAV.filter(item => !item.adminOnly || admin);

  const isActive = (href: string) =>
    href === "/overview" ? pathname === href : pathname.startsWith(href);

  // Close drawer on route change.
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/75 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4 md:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Rising Sun"
              width={32}
              height={32}
              className="w-8 h-8 rounded-md ring-1 ring-gold-400/40 shadow-glow group-hover:ring-gold-300/70 transition"
            />
            <span className="font-bold text-vermillion-200 tracking-wide group-hover:text-vermillion-100 transition text-base">
              Rising Sun
            </span>
            <span className="ml-1 hidden sm:inline rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              TBC
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-0.5 flex-1 overflow-x-auto">
            {visibleNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "nav-link-active" : "nav-link"}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* spacer for mobile so the right-side controls hug the right edge */}
          <div className="flex-1 md:hidden" />

          <div className="text-sm flex items-center gap-2">
            {admin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  admin
                </span>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="btn">Log in</Link>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="md:hidden btn !p-2"
            >
              <Menu size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[80vw] max-w-xs bg-[var(--surface)] border-l border-white/10 shadow-2xl animate-fade-in">
            <div className="px-4 h-14 flex items-center justify-between border-b border-white/5">
              <span className="font-bold text-vermillion-200">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-ghost btn-xs"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="px-2 py-3 flex flex-col gap-1">
              {visibleNav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-3 rounded-lg text-base font-medium transition ${
                    isActive(item.href)
                      ? "bg-vermillion-500/10 text-vermillion-200"
                      : "text-neutral-200 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
