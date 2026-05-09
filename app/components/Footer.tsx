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
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href="https://fresh.warcraftlogs.com/guild/id/775140"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition group"
          >
            <img
              src="https://www.warcraftlogs.com/favicon.ico"
              alt=""
              width={16}
              height={16}
              className="rounded-sm opacity-80 group-hover:opacity-100 transition"
            />
            Warcraft Logs
            <span aria-hidden="true" className="text-neutral-600">↗</span>
          </a>
          <a
            href="https://discord.gg/rcPbtZNNbT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition group"
          >
            <img
              src="https://cdn.simpleicons.org/discord/5865F2"
              alt=""
              width={16}
              height={16}
              className="opacity-90 group-hover:opacity-100 transition"
            />
            Guild Discord
            <span aria-hidden="true" className="text-neutral-600">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
