import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatCard } from "@/app/components/ui/StatCard";
import { CountUp } from "@/app/components/ui/CountUp";
import { SectionTitle } from "@/app/components/ui/SectionTitle";
import {
  ArrowUpRight,
  Award,
  Calendar,
  Shield,
  Users,
} from "@/app/components/ui/Icon";

export const dynamic = "force-dynamic";

const WOW_ICON_BASE = "https://wow.zamimg.com/images/wow/icons/medium/";

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
    <div className="space-y-12 animate-fade-in">
      <section className="flex flex-col items-center text-center pt-6 sm:pt-10">
        <img
          src="/logo.png"
          alt="Rising Sun"
          width={96}
          height={96}
          className="w-24 h-24 rounded-2xl ring-1 ring-gold-400/40 shadow-glow mb-5"
        />
        <span className="eyebrow">and he say me i noob LOL</span>
        <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-vermillion-100">Rising Sun</h1>
        <p className="mt-3 max-w-xl text-neutral-400 text-sm sm:text-base leading-relaxed">
          Burning Crusade Classic guild loot tracker — roster, attendance, and a transparent
          loot history for every raid we run.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Players"      value={<CountUp value={players} />}    icon={Users} />
        <StatCard label="Characters"   value={<CountUp value={characters} />} icon={Shield} />
        <StatCard label="Items looted" value={<CountUp value={awards} />}     tone="gold" icon={Award} />
        <StatCard label="Last raid"    value={lastRaidLabel}                  icon={Calendar} />
      </section>

      <section>
        <SectionTitle eyebrow="Jump to" title="Where to next" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: "/overview",   title: "Overview",     blurb: "Who's looted what, sorted by most recent.",   iconName: "inv_misc_spyglass_03",            accent: "vermillion" as const },
            { href: "/loot",       title: "Loot catalog", blurb: "Every raid drop, browsable by phase / boss.", iconName: "inv_box_03",                      accent: "gold"       as const },
            { href: "/players",    title: "Players",      blurb: "Mains and alts grouped by human.",            iconName: "inv_misc_tournaments_banner_human", accent: "vermillion" as const },
            { href: "/characters", title: "Characters",   blurb: "One row per character — class, spec, role.",  iconName: "spell_holy_powerwordshield",      accent: "gold"       as const },
            { href: "/rosters",    title: "Roster",       blurb: "Master Roster membership and slot.",          iconName: "inv_misc_book_11",                accent: "vermillion" as const },
            { href: "/attendance", title: "Attendance",   blurb: "Per-night attendance and raid history.",      iconName: "inv_misc_pocketwatch_01",         accent: "gold"       as const },
          ].map((card, i) => (
            <NavCard key={card.href} {...card} delay={i * 50} />
          ))}
        </div>
      </section>
    </div>
  );
}

function NavCard({
  href, title, blurb, iconName, accent, delay = 0,
}: {
  href: string;
  title: string;
  blurb: string;
  iconName: string;
  accent: "vermillion" | "gold";
  delay?: number;
}) {
  const ring = accent === "vermillion"
    ? "hover:border-vermillion-500/50 hover:shadow-[0_8px_24px_-12px_rgba(200,16,46,0.4)]"
    : "hover:border-gold-400/50 hover:shadow-[0_8px_24px_-12px_rgba(218,165,32,0.4)]";
  const titleColor = accent === "vermillion" ? "text-vermillion-200" : "text-gold-200";
  const iconGlow = accent === "vermillion"
    ? "group-hover:shadow-[0_6px_18px_-4px_rgba(200,16,46,0.55)]"
    : "group-hover:shadow-[0_6px_18px_-4px_rgba(218,165,32,0.55)]";
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className={`panel p-6 group transition-all animate-fade-in-up ${ring} hoverable`}
    >
      <div className="flex items-start justify-between gap-3">
        <img
          src={`${WOW_ICON_BASE}${iconName}.jpg`}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className={`h-11 w-11 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.35)] ${iconGlow} group-hover:scale-[1.04] transition`}
        />
        <ArrowUpRight size={16} className="text-neutral-600 group-hover:text-neutral-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
      </div>
      <h3 className={`mt-4 text-base font-semibold tracking-tight ${titleColor}`}>{title}</h3>
      <p className="mt-1 text-sm text-neutral-400 leading-relaxed">{blurb}</p>
    </Link>
  );
}
