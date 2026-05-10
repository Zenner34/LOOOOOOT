import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatCard } from "@/app/components/ui/StatCard";
import { CountUp } from "@/app/components/ui/CountUp";
import { SectionTitle } from "@/app/components/ui/SectionTitle";
import {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/overview",   title: "Overview",     blurb: "Who's looted what, sorted by most recent.",   iconName: "inv_box_03",                        accent: "vermillion" as const },
            { href: "/loot",       title: "Loot catalog", blurb: "Every raid drop, browsable by phase / boss.", iconName: "inv_misc_bag_10",                   accent: "gold"       as const },
            { href: "/players",    title: "Players",      blurb: "Mains and alts grouped by human.",            iconName: "inv_misc_tournaments_banner_human", accent: "vermillion" as const },
            { href: "/characters", title: "Characters",   blurb: "One row per character — class, spec, role.",  iconName: "spell_holy_powerwordshield",        accent: "gold"       as const },
            { href: "/rosters",    title: "Roster",       blurb: "Master Roster membership and slot.",          iconName: "inv_misc_book_11",                  accent: "vermillion" as const },
            { href: "/attendance", title: "Attendance",   blurb: "Per-night attendance and raid history.",      iconName: "inv_misc_pocketwatch_01",           accent: "gold"       as const },
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
  const hoverShadow = accent === "vermillion"
    ? "hover:shadow-[0_18px_40px_-20px_rgba(200,16,46,0.55)]"
    : "hover:shadow-[0_18px_40px_-20px_rgba(218,165,32,0.55)]";
  const titleHover = accent === "vermillion"
    ? "group-hover:text-vermillion-200"
    : "group-hover:text-gold-200";
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className={`relative block rounded-xl border border-white/[0.06] bg-[var(--surface)] p-6 group transition-all duration-200 animate-fade-in-up hover:-translate-y-1 hover:border-white/[0.12] ${hoverShadow}`}
    >
      <img
        src={`${WOW_ICON_BASE}${iconName}.jpg`}
        alt=""
        width={52}
        height={52}
        loading="lazy"
        className="h-13 w-13 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-[1.05] transition-transform duration-200"
        style={{ width: 52, height: 52 }}
      />
      <h3 className={`mt-5 text-lg font-semibold tracking-tight text-neutral-100 ${titleHover} transition-colors`}>{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed">{blurb}</p>
    </Link>
  );
}
