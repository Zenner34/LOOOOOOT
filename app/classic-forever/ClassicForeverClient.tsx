"use client";

import { PageHeader } from "@/app/components/ui/PageHeader";
import { SafeImage } from "@/app/components/ui/SafeImage";
import { SectionNav, type SectionNavGroup } from "@/app/assignments/SectionNav";
import { ClassIcon } from "@/app/components/ClassIcon";
import { Info } from "@/app/components/ui/Icon";
import { CLASS_COLOR } from "@/lib/specs";
import {
  CLASS_PICKS,
  FACTION_COLOR,
  PVE_TIERS,
  PVP_TIERS,
  RACES,
  RACIALS,
  RIVALRY,
  TIER_META,
  VERDICTS,
  type TierBlock,
  type TierKey,
} from "./content";

const ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large/";

/** Jump-nav targets. Icons are slugs already proven to load elsewhere on
 *  the site, so the rail never renders a row of broken images. */
const NAV_GROUPS: SectionNavGroup[] = [
  {
    items: [
      { id: "classes", label: "Pick by class", icon: `${ICON_BASE}spell_magic_greaterblessingofkings.jpg` },
      { id: "racials", label: "Racial abilities", icon: `${ICON_BASE}spell_holy_magicalsentry.jpg` },
      { id: "pve", label: "PvE tiers", icon: `${ICON_BASE}ability_warrior_savageblow.jpg` },
      { id: "pvp", label: "PvP tiers", icon: `${ICON_BASE}ability_warrior_riposte.jpg` },
      { id: "rivalry", label: "Orc vs Undead", icon: `${ICON_BASE}ability_warrior_innerrage.jpg` },
      { id: "verdict", label: "Best pick", icon: `${ICON_BASE}spell_holy_auraoflight.jpg` },
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────── */

/** Renders `**bold**` and `*italic*` runs from the content strings. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-neutral-100">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
          return (
            <em key={i} className="italic text-neutral-200">
              {p.slice(1, -1)}
            </em>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/**
 * Race portrait. The abbreviation plate is the real element — the Wowhead
 * portrait layers on top and simply stays hidden if the CDN doesn't serve
 * it, so a missing icon degrades to a tinted monogram instead of a gap.
 */
function RaceIcon({ raceKey, size = 34 }: { raceKey: string; size?: number }) {
  const race = RACES[raceKey];
  if (!race) return null;
  const tint = FACTION_COLOR[race.faction];

  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-[6px] text-[10px] font-bold"
      style={{
        width: size,
        height: size,
        background: `${tint}22`,
        color: tint,
        boxShadow: `inset 0 0 0 1px ${tint}66`,
      }}
      aria-hidden
    >
      {race.abbr}
      <SafeImage
        src={`${ICON_BASE}${race.icon}.jpg`}
        width={size}
        height={size}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </span>
  );
}

/** Race portrait + name, the shared inline unit. */
function RaceTag({ raceKey, size = 22 }: { raceKey: string; size?: number }) {
  const race = RACES[raceKey];
  if (!race) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <RaceIcon raceKey={raceKey} size={size} />
      <span className="font-semibold" style={{ color: FACTION_COLOR[race.faction] }}>
        {race.name}
      </span>
    </span>
  );
}

function FactionChip({ faction }: { faction: keyof typeof FACTION_COLOR }) {
  const tint = FACTION_COLOR[faction];
  return (
    <span
      className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ background: `${tint}1a`, color: tint }}
    >
      {faction}
    </span>
  );
}

function UnconfirmedChip() {
  return (
    <span className="ml-1.5 inline-block rounded-full border border-gold-400/40 bg-gold-400/10 px-1.5 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-gold-200">
      Unconfirmed
    </span>
  );
}

/* ── Pick by class ──────────────────────────────────────────────────── */

function ClassCard({ pick }: { pick: (typeof CLASS_PICKS)[number] }) {
  const color = CLASS_COLOR[pick.className] ?? "#9aa4b2";
  return (
    <article className="panel-elev overflow-hidden" style={{ borderLeft: `2px solid ${color}88` }}>
      <header className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <ClassIcon cls={pick.className} size={20} />
        <h3 className="font-semibold" style={{ color }}>
          {pick.className}
        </h3>
        {pick.scope && (
          <span className="text-[11px] text-neutral-500">· {pick.scope}</span>
        )}
      </header>

      {pick.uncovered ? (
        <p className="px-3 py-2.5 text-[13px] italic leading-relaxed text-neutral-500">
          {pick.uncovered}
        </p>
      ) : (
        <ul>
          {pick.recs.map((r, i) => (
            <li
              key={i}
              className={`flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:gap-3 ${
                i > 0 ? "border-t border-white/[0.04]" : ""
              }`}
            >
              {/* Stacked so a two-word race name never wraps mid-name
                  against the note column. */}
              <div className="flex shrink-0 flex-row items-center gap-2 sm:w-36 sm:flex-col sm:items-start sm:gap-1">
                <RaceTag raceKey={r.race} />
                <span className="whitespace-nowrap rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  {r.label}
                </span>
              </div>
              <p className="min-w-0 text-[13px] leading-relaxed text-neutral-400">
                <RichText text={r.why} />
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* ── Racial ability reference ───────────────────────────────────────── */

function RacialCard({ entry }: { entry: (typeof RACIALS)[number] }) {
  const race = RACES[entry.race];
  const tint = race ? FACTION_COLOR[race.faction] : "#9aa4b2";
  return (
    <article className="panel-elev overflow-hidden" style={{ borderLeft: `2px solid ${tint}77` }}>
      <header className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <RaceIcon raceKey={entry.race} size={26} />
        <h3 className="font-semibold text-neutral-100">{race?.name ?? entry.race}</h3>
        {race && <FactionChip faction={race.faction} />}
      </header>

      {entry.gap ? (
        <p className="px-3 py-2.5 text-[13px] italic leading-relaxed text-neutral-500">{entry.gap}</p>
      ) : (
        <dl className="divide-y divide-white/[0.04]">
          {entry.abilities.map(a => (
            <div key={a.name} className="px-3 py-2.5">
              <dt className="text-[13px] font-semibold text-neutral-100">
                {a.name}
                {a.tag && <UnconfirmedChip />}
              </dt>
              <dd className="mt-0.5 text-[13px] leading-relaxed text-neutral-400">
                <RichText text={a.text} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

/* ── Tier lists ─────────────────────────────────────────────────────── */

function TierGroup({ block }: { block: TierBlock }) {
  const meta = TIER_META[block.tier];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-bold"
          style={{
            background: `${meta.color}1f`,
            color: meta.color,
            boxShadow: `inset 0 0 0 1px ${meta.color}66`,
          }}
          aria-hidden
        >
          {block.tier}
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <span aria-hidden className="h-px flex-1" style={{ background: `${meta.color}33` }} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {block.entries.map((e, i) => {
          const race = RACES[e.race];
          return (
            <article
              key={`${e.race}-${i}`}
              className="panel-elev flex gap-3 p-3"
              style={{ borderLeft: `2px solid ${meta.color}55` }}
            >
              <RaceIcon raceKey={e.race} />
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-neutral-100">
                    {e.displayName ?? race?.name ?? e.race}
                  </h4>
                  {race && <FactionChip faction={race.faction} />}
                </div>
                <p className="text-[13px] leading-relaxed text-neutral-400">
                  <RichText text={e.note} />
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section shell ──────────────────────────────────────────────────── */

function Section({
  id,
  title,
  kicker,
  lede,
  children,
}: {
  id: string;
  title: string;
  kicker?: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <div>
        {kicker && <div className="eyebrow mb-1">{kicker}</div>}
        <h2 className="font-display text-2xl text-amber-200" style={{ letterSpacing: "0.03em" }}>
          {title}
        </h2>
        {lede && <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

export default function ClassicForeverClient() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        eyebrow="Warcraft Forever"
        title="Classic Forever"
        subtitle="Every race got a reason to matter in the racial rework. Find your class, see what to roll, and why."
      />

      <div className="panel-elev flex items-start gap-3 p-3.5" style={{ borderLeft: "2px solid #ffd70066" }}>
        <Info size={16} className="mt-0.5 shrink-0 text-gold-200" aria-hidden />
        <p className="text-[13px] leading-relaxed text-neutral-400">
          <strong className="font-semibold text-gold-200">Pre-release.</strong> Reported from the
          BlizzCon 2026 panels and hands-on demo access. Effects may still change before{" "}
          <span className="font-semibold text-neutral-200">November 4, 2026</span>. Anything the
          source flagged as uncertain is marked <UnconfirmedChip /> below, and classes it never
          covered say so rather than guess.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="order-last col-span-12 space-y-8 min-w-0 lg:order-none lg:col-span-9">
          <Section
            id="classes"
            kicker="Start here"
            title="Pick by class"
            lede="What to roll, class by class, and the specific interaction that justifies it."
          >
            <div className="grid items-start gap-2 lg:grid-cols-2">
              {CLASS_PICKS.map(p => (
                <ClassCard key={p.className} pick={p} />
              ))}
            </div>
          </Section>

          <Section
            id="racials"
            kicker="Reference"
            title="Racial abilities"
            lede="The kits behind the grades — what each racial actually does."
          >
            <div className="grid items-start gap-2 lg:grid-cols-2">
              {RACIALS.map(r => (
                <RacialCard key={r.race} entry={r} />
              ))}
            </div>
          </Section>

          <Section
            id="pve"
            kicker="Raiding"
            title="PvE tier list"
            lede="Graded on damage contribution. A low grade isn't always a bad roll — read Undead's note."
          >
            <div className="space-y-5">
              {PVE_TIERS.map(block => (
                <TierGroup key={block.tier} block={block} />
              ))}
            </div>
          </Section>

          <Section id="pvp" kicker="Arenas & battlegrounds" title="PvP tier list">
            <div className="space-y-5">
              {PVP_TIERS.map(block => (
                <TierGroup key={block.tier} block={block} />
              ))}
            </div>
          </Section>

          <Section
            id="rivalry"
            kicker="Horde"
            title="Orc vs Undead"
            lede="The recurring Horde racial tension. Which one wins depends entirely on class."
          >
            <div className="sheet-panel p-0">
              {RIVALRY.map((r, i) => (
                <div
                  key={r.label}
                  className={`flex flex-col gap-1 p-3 sm:flex-row sm:gap-4 ${
                    i > 0 ? "border-t border-white/[0.06]" : ""
                  }`}
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-44">
                    <RaceIcon raceKey="orc" size={24} />
                    <RaceIcon raceKey="undead" size={24} />
                    <span className="text-[13px] font-semibold text-neutral-100">{r.label}</span>
                  </div>
                  <p className="min-w-0 text-[13px] leading-relaxed text-neutral-400">{r.text}</p>
                </div>
              ))}
            </div>
            <div
              className="panel-elev flex gap-3 p-3.5"
              style={{ borderLeft: `2px solid ${FACTION_COLOR.Alliance}66` }}
            >
              <RaceIcon raceKey="human" size={28} />
              <p className="min-w-0 text-[13px] leading-relaxed text-neutral-400">
                On Alliance there&rsquo;s no equivalent argument — Human&rsquo;s stun removal is a
                hard answer in nearly every matchup, not just anti-Rogue. If there&rsquo;s a single
                best PvP racial on Alliance it&rsquo;s Human over Night Elf, despite Night
                Elf&rsquo;s higher raw burst ceiling.
              </p>
            </div>
          </Section>

          <Section id="verdict" kicker="The short answer" title="If you just want one pick">
            <div className="grid gap-2 sm:grid-cols-3">
              {VERDICTS.map(v => (
                <article key={v.label} className="panel-elev space-y-2 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <RaceIcon raceKey={v.race} size={30} />
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90">
                      {v.label}
                    </h4>
                  </div>
                  <p className="text-[13px] leading-relaxed text-neutral-400">
                    <RichText text={v.text} />
                  </p>
                </article>
              ))}
            </div>
          </Section>

          <footer className="border-t hairline pt-4 text-xs leading-relaxed text-neutral-500">
            Verified against Icy Veins&rsquo; &ldquo;The Racial Rework Gives Every Race a Reason to
            Matter in Warcraft Forever,&rdquo; reported from the BlizzCon 2026 panels with hands-on
            demo access. Pre-release &middot; effects may change before November 4, 2026.
          </footer>
        </div>

        {/* Quick jumps — a table of contents above the body on phones, a
            sticky right rail from lg up. */}
        <aside className="col-span-12 lg:col-span-3">
          <SectionNav groups={NAV_GROUPS} />
        </aside>
      </div>
    </div>
  );
}
