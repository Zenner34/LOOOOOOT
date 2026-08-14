import Link from "next/link";
import { Layers, Swords } from "@/app/components/ui/Icon";

export const dynamic = "force-dynamic";

const DISCORD_URL = "https://discord.gg/rcPbtZNNbT";
const LOGS_URL = "https://fresh.warcraftlogs.com/guild/id/775140";

export default function Home() {
  return (
    <div className="space-y-10 animate-fade-in">
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
        <p className="mt-3 max-w-md text-neutral-400 text-sm sm:text-base leading-relaxed">
          Burning Crusade Classic guild — everything you need for raid night in one place.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        <HubCard
          href="/guides"
          title="Guides"
          blurb="Boss strategy for Black Temple & Mount Hyjal."
          accent="vermillion"
          icon={<Swords size={26} strokeWidth={2} />}
        />
        <HubCard
          href="/assignments"
          title="Assignments"
          blurb="Your job for each fight, night by night."
          accent="gold"
          icon={<Layers size={26} strokeWidth={2} />}
        />
        <HubCard
          href={DISCORD_URL}
          external
          title="Discord"
          blurb="Join the guild Discord."
          accent="discord"
          icon={
            <img
              src="https://cdn.simpleicons.org/discord/5865F2"
              alt=""
              width={26}
              height={26}
              className="w-[26px] h-[26px]"
            />
          }
        />
        <HubCard
          href={LOGS_URL}
          external
          title="Logs"
          blurb="Parses & rankings on Warcraft Logs."
          accent="logs"
          icon={
            <img
              src="https://assets.rpglogs.com/img/warcraft/favicon.png?v=4"
              alt=""
              width={26}
              height={26}
              className="w-[26px] h-[26px] rounded-sm"
            />
          }
        />
      </section>
    </div>
  );
}

type Accent = "vermillion" | "gold" | "discord" | "logs";

const ACCENTS: Record<Accent, { ring: string; glow: string; tile: string; titleHover: string }> = {
  vermillion: {
    ring: "hover:border-vermillion-500/40",
    glow: "hover:shadow-[0_18px_40px_-20px_rgba(200,16,46,0.55)]",
    tile: "bg-vermillion-500/10 text-vermillion-300 ring-1 ring-vermillion-500/20",
    titleHover: "group-hover:text-vermillion-200",
  },
  gold: {
    ring: "hover:border-gold-400/40",
    glow: "hover:shadow-[0_18px_40px_-20px_rgba(218,165,32,0.55)]",
    tile: "bg-gold-400/10 text-gold-200 ring-1 ring-gold-400/20",
    titleHover: "group-hover:text-gold-200",
  },
  discord: {
    ring: "hover:border-[#5865F2]/50",
    glow: "hover:shadow-[0_18px_40px_-20px_rgba(88,101,242,0.6)]",
    tile: "bg-[#5865F2]/10 ring-1 ring-[#5865F2]/25",
    titleHover: "group-hover:text-[#a9b1ff]",
  },
  logs: {
    ring: "hover:border-white/20",
    glow: "hover:shadow-[0_18px_40px_-20px_rgba(255,255,255,0.25)]",
    tile: "bg-white/5 ring-1 ring-white/10",
    titleHover: "group-hover:text-white",
  },
};

function HubCard({
  href, title, blurb, icon, accent, external = false,
}: {
  href: string;
  title: string;
  blurb: string;
  icon: React.ReactNode;
  accent: Accent;
  external?: boolean;
}) {
  const a = ACCENTS[accent];
  const inner = (
    <>
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${a.tile}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className={`flex items-center gap-1.5 text-lg font-semibold tracking-tight text-neutral-100 ${a.titleHover} transition-colors`}>
          {title}
          {external && <span aria-hidden="true" className="text-sm text-neutral-500">↗</span>}
        </h3>
        <p className="mt-0.5 text-sm text-neutral-400 leading-snug">{blurb}</p>
      </div>
    </>
  );

  const className = `relative flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[var(--surface)] p-5 group transition-all duration-200 hover:-translate-y-0.5 ${a.ring} ${a.glow}`;

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
