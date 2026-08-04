"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const RAIDS = [
  { href: "/guides/black-temple", label: "Black Temple", short: "BT", accent: "#a3ff5e" },
  { href: "/guides/mount-hyjal",  label: "Mount Hyjal",  short: "MH", accent: "#ff9d5e" },
] as const;

export default function GuidesNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div className="flex flex-wrap gap-2">
      {RAIDS.map(r => {
        const active = isActive(r.href);
        return (
          <Link
            key={r.href}
            href={r.href}
            className={`group inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition ${
              active
                ? "border-white/15 bg-[var(--surface-2)] shadow-card"
                : "border-white/[0.06] bg-[var(--surface)] hover:border-white/10 hover:bg-white/[0.02]"
            }`}
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-lg text-[11px] font-bold tracking-wide transition"
              style={{
                background: active ? `${r.accent}1a` : "rgba(255,255,255,0.04)",
                color: active ? r.accent : "rgba(255,255,255,0.45)",
                boxShadow: active ? `inset 0 0 0 1px ${r.accent}55` : "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {r.short}
            </span>
            <span className={`text-sm font-semibold ${active ? "text-neutral-100" : "text-neutral-400 group-hover:text-neutral-200"}`}>
              {r.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
