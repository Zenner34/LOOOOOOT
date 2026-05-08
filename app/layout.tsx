import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { isAdmin } from "@/lib/auth";
import NavBar from "./components/NavBar";
import CommandPalette from "./components/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "meilootlol — TBC Raid Loot Tracker",
  description: "WoW Burning Crusade guild loot tracker with rosters, splits, and BiS-weighted scoring.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          var whTooltips = {colorLinks: true, iconizeLinks: true, renameLinks: true};
        `}} />
        <script src="https://wow.zamimg.com/js/tooltips.js" defer></script>
      </head>
      <body className="font-sans">
        <NavBar admin={admin} />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <CommandPalette />
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "!bg-[var(--surface-2)] !border-white/10 !text-neutral-100",
            },
          }}
        />
      </body>
    </html>
  );
}
