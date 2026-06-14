import type { Metadata, Viewport } from "next";
import { Inter, Cinzel } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { isAdmin } from "@/lib/auth";
import NavBar from "./components/NavBar";
import MobileTabBar from "./components/MobileTabBar";
import CommandPalette from "./components/CommandPalette";
import Footer from "./components/Footer";
import WowheadRefresh from "./components/WowheadRefresh";
import { TooltipProvider } from "./components/ui/Tooltip";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Display serif for raid-y headings (boss names, raid section titles)
// on /assignments. Used via .font-display utility in globals.css.
const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Rising Sun Loot Log - and he say me i noob LOL",
  description: "Rising Sun guild loot tracker for the 'and he say me i noob LOL' guild — Burning Crusade Classic raid rosters, attendance, and loot history.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08090b",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          var whTooltips = {colorLinks: false, iconizeLinks: false, renameLinks: false, domain: "tbc"};
        `}} />
        <script src="https://wow.zamimg.com/widgets/power.js" defer></script>
      </head>
      <body className="font-sans">
        <TooltipProvider delayDuration={200} skipDelayDuration={300}>
          <WowheadRefresh />
          <NavBar admin={admin} />
          <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
          <Footer />
          <MobileTabBar admin={admin} />
          <CommandPalette admin={admin} />
        </TooltipProvider>
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
