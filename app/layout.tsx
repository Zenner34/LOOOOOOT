import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import LogoutButton from "./components/LogoutButton";

export const metadata: Metadata = {
  title: "LOOOOOOT — TBC Raid Loot Tracker",
  description: "WoW Burning Crusade guild loot tracker with rosters, splits, and BiS-weighted scoring.",
};

const NAV = [
  { href: "/overview",   label: "Overview"   },
  { href: "/loot",       label: "Loot"       },
  { href: "/loot/assign",label: "Assign"     },
  { href: "/rosters",    label: "Rosters"    },
  { href: "/characters", label: "Characters" },
  { href: "/attendance", label: "Attendance" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          var whTooltips = {colorLinks: true, iconizeLinks: true, renameLinks: true};
        `}} />
        <script src="https://wow.zamimg.com/js/tooltips.js" defer></script>
      </head>
      <body>
        <header className="border-b border-neutral-800 bg-neutral-950">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-6">
            <Link href="/overview" className="font-bold text-amber-400 text-lg tracking-wider">
              LOOOOOOT
            </Link>
            <nav className="flex gap-1 flex-1">
              {NAV.map(item => (
                <Link key={item.href} href={item.href} className="px-3 py-1.5 rounded text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="text-sm">
              {admin ? (
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">admin</span>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/login" className="btn">Log in</Link>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
