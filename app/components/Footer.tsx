import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 py-6 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt=""
            width={24}
            height={24}
            className="rounded-md ring-1 ring-gold-400/30 group-hover:ring-gold-300/60 transition"
          />
          <span className="text-sm font-semibold text-vermillion-200 group-hover:text-vermillion-100 transition">
            Rising Sun
          </span>
          <span className="hidden sm:inline text-xs text-neutral-500">
            · and he say me i noob LOL
          </span>
        </Link>
        <a
          href="https://fresh.warcraftlogs.com/guild/id/775140"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-gold-200 transition"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12 12 3l9 9M5 10v10h14V10" />
          </svg>
          Warcraft Logs
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  );
}
