import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [players, characters, awards, lastNight] = await Promise.all([
    prisma.player.count({ where: { active: true } }),
    prisma.character.count({ where: { active: true } }),
    prisma.lootAward.count(),
    prisma.raidNight.findFirst({ orderBy: { date: "desc" } }),
  ]);

  const lastRaidLabel = lastNight
    ? new Date(lastNight.date).toISOString().slice(0, 10)
    : "—";

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="flex flex-col items-center text-center pt-4 sm:pt-8">
        <img
          src="/logo.png"
          alt="Rising Sun"
          width={96}
          height={96}
          className="w-24 h-24 rounded-2xl ring-1 ring-gold-400/40 shadow-glow mb-4"
        />
        <span className="heading-eyebrow">and he say me i noob LOL</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-vermillion-100">Rising Sun</h1>
        <p className="mt-3 max-w-xl text-neutral-400 text-sm sm:text-base">
          Burning Crusade Classic guild loot tracker — roster, attendance, and a transparent
          loot history for every raid we run.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Players"      value={players} />
        <Stat label="Characters"   value={characters} />
        <Stat label="Items looted" value={awards} tone="gold" />
        <Stat label="Last raid"    value={lastRaidLabel} mono={false} />
      </section>

      <section>
        <span className="heading-eyebrow">Jump to</span>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Where to next</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NavCard
            href="/overview"
            title="Overview"
            blurb="Who's looted what, sorted by most recent."
            accent="vermillion"
          />
          <NavCard
            href="/loot"
            title="Loot catalog"
            blurb="Every raid drop, browsable by phase / boss."
            accent="gold"
          />
          <NavCard
            href="/players"
            title="Players"
            blurb="Mains and alts grouped by human."
            accent="vermillion"
          />
          <NavCard
            href="/characters"
            title="Characters"
            blurb="One row per character — class, spec, role."
            accent="gold"
          />
          <NavCard
            href="/rosters"
            title="Roster"
            blurb="Master Roster membership and slot."
            accent="vermillion"
          />
          <NavCard
            href="/attendance"
            title="Attendance"
            blurb="Per-night attendance and raid history."
            accent="gold"
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label, value, tone = "default", mono = true,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "gold";
  mono?: boolean;
}) {
  const valueClass = tone === "gold" ? "text-gold-200" : "text-neutral-100";
  return (
    <div className="panel-elev px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</div>
      <div className={`text-2xl font-bold ${mono ? "tabular-nums" : ""} ${valueClass}`}>{value}</div>
    </div>
  );
}

function NavCard({
  href, title, blurb, accent,
}: {
  href: string;
  title: string;
  blurb: string;
  accent: "vermillion" | "gold";
}) {
  const ring = accent === "vermillion"
    ? "hover:border-vermillion-500/50 hover:shadow-[0_8px_24px_-12px_rgba(200,16,46,0.4)]"
    : "hover:border-gold-400/50 hover:shadow-[0_8px_24px_-12px_rgba(218,165,32,0.4)]";
  const titleColor = accent === "vermillion" ? "text-vermillion-200" : "text-gold-200";
  return (
    <Link
      href={href}
      className={`panel p-4 sm:p-5 group transition-all ${ring} hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={`text-base font-semibold tracking-tight ${titleColor}`}>{title}</h3>
        <span className="text-neutral-500 group-hover:text-white transition" aria-hidden="true">→</span>
      </div>
      <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed">{blurb}</p>
    </Link>
  );
}
