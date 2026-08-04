"use client";

import { useState } from "react";
import { Shield, Eye, Swords, Sparkles, Info, Crown, Check, X, ArrowRight, Trophy } from "@/app/components/ui/Icon";

/* ────────────────────────────────────────────────────────────────────
   Illidan Stormrage — Black Temple strategy handbook.
   Content is data-driven so extra bosses can be added to BOSSES later.
   ──────────────────────────────────────────────────────────────────── */

const FEL = "#a3ff5e"; // Illidan's fel-green accent

type Mechanic = { name: string; effect: string; execution: string[] };

type Section = {
  id: string;
  tab: string;
  tag: string;
  title: string;
  subtitle?: string;
  lead?: string[];
  callout?: { tone: "tip" | "danger" | "win"; title: string; body: string };
  mechanics?: Mechanic[];
  dps?: { title: string; intro: string; steps: string[]; note?: string };
  role?: { title: string; intro: string; points: string[] };
  positioning?: string[];
  execution?: string[];
  mistakes?: string[];
  flow?: string[];
  wipes?: string[];
  closing?: string;
};

const SECTIONS: Section[] = [
  {
    id: "overview",
    tab: "Overview",
    tag: "Final Boss",
    title: "The Encounter",
    lead: [
      "Illidan is the final and most mechanically demanding encounter in Black Temple. The fight runs through multiple phases that test positioning, movement, add control, and execution.",
      "The fight is rarely lost due to DPS. Most wipes happen because players panic during transitions, fail movement mechanics, mishandle the Flames of Azzinoth, or lose control of the Demon Phase.",
    ],
    callout: {
      tone: "tip",
      title: "Discipline over damage",
      body: "Remain disciplined and execute each phase cleanly. Clean execution — not raw throughput — is what wins this raid.",
    },
  },
  {
    id: "phase-1",
    tab: "Phase 1",
    tag: "Phase 1",
    title: "Phase One",
    lead: [
      "Illidan begins as a standard tank-and-spank with heavy emphasis on tank positioning and avoiding unnecessary damage.",
      "The goal is to push him cleanly into the Flame Phase while using as few cooldowns as possible.",
    ],
    mechanics: [
      {
        name: "Shear",
        effect: "Massive reduction to the current tank's maximum health.",
        execution: [
          "Tanks must avoid being hit by Shear through proper mitigation and avoidance.",
          "A failed Shear almost always results in a tank death.",
        ],
      },
      {
        name: "Flame Crash",
        effect: "Creates a patch of fire beneath a player's location.",
        execution: [
          "Move immediately.",
          "Do not force other players through fire.",
          "Return to position once the area is safe.",
        ],
      },
      {
        name: "Draw Soul",
        effect: "Illidan transitions into Phase Two.",
        execution: [
          "Finish the transition cleanly.",
          "Prepare immediately for Flames of Azzinoth.",
        ],
      },
    ],
    positioning: [
      "Tank Illidan near the center of the room.",
      "Keep the boss faced away from the raid.",
      "Melee remain behind the boss.",
      "Ranged maintain spacing to minimize unnecessary movement.",
    ],
  },
  {
    id: "flames",
    tab: "Flames",
    tag: "Phase 2",
    title: "Flames of Azzinoth",
    subtitle: "The most important phase of the encounter",
    lead: [
      "Nearly every progression wipe occurs here — players lose control of the Flames or fail Eye Beam movement.",
    ],
    callout: {
      tone: "danger",
      title: "The objective is simple",
      body: "Kill Flame #1. Immediately hard-swap to Flame #2. Never split DPS.",
    },
    mechanics: [
      {
        name: "Flames of Azzinoth",
        effect: "Two Flames spawn and must be tanked separately. Each Flame continuously drops Blaze beneath itself.",
        execution: [
          "Each Flame receives its own dedicated tank.",
          "Tanks slowly kite their Flame around the outside edge of the platform.",
          "Never leave a Flame standing in multiple Blaze patches.",
          "Kite smoothly — do not over-move.",
        ],
      },
      {
        name: "Blaze",
        effect: "Leaves permanent fire where each Flame stands.",
        execution: [
          "Tanks continuously rotate their Flame around the room.",
          "Never backtrack through old Blaze.",
          "Preserve as much usable space as possible.",
        ],
      },
      {
        name: "Eye Beam",
        effect: "Massive beam that instantly kills players caught in its path.",
        execution: [
          "Move immediately when Eye Beam targets your area.",
          "Never run through the center of the room.",
          "Rotate around the outside edge.",
          "Resume DPS only after reaching safety.",
        ],
      },
      {
        name: "Dark Barrage",
        effect: "Heavy magical damage on random players.",
        execution: [
          "Healers remain alert for spike damage.",
          "Continue normal positioning.",
        ],
      },
    ],
    dps: {
      title: "Never split damage",
      intro: "Committing everything to one Flame at a time minimizes healer strain, reduces Blaze uptime, and shortens the most dangerous phase of the encounter.",
      steps: [
        "Hard-commit all DPS to Flame #1.",
        "Kill Flame #1 completely.",
        "Immediately rotate to Flame #2.",
        "Continue until both Flames are dead.",
      ],
    },
    positioning: [
      "Tanks remain separated.",
      "Raid follows the active Flame.",
      "Melee remain behind the active Flame.",
      "Ranged avoid unnecessary movement.",
      "Always respect Eye Beam paths.",
    ],
    mistakes: [
      "Splitting DPS.",
      "Tanks allowing Flames to sit in Blaze.",
      "Crossing Eye Beam.",
      "Running through the middle of the room.",
      "Over-kiting Flames.",
    ],
  },
  {
    id: "phase-3",
    tab: "Phase 3",
    tag: "Phase 3",
    title: "Phase Three",
    lead: [
      "Illidan returns to the fight. The mechanics become manageable provided players continue to respect positioning.",
    ],
    mechanics: [
      {
        name: "Parasitic Shadowfiend",
        effect: "Infests a player and spawns parasites if mishandled.",
        execution: [
          "The affected player immediately moves away from the raid.",
          "Parasites are picked up and eliminated quickly.",
          "Do not allow parasites to spread through the raid.",
        ],
      },
      {
        name: "Flame Crash",
        effect: "Same fire-patch mechanic as Phase One.",
        execution: ["Continue handling exactly as in Phase One."],
      },
    ],
    positioning: [
      "Resume normal Phase One positioning.",
      "Players affected by Parasitic Shadowfiend move away before parasites spawn.",
      "Return after parasites have been controlled.",
    ],
    mistakes: [
      "Parasites spawning inside the raid.",
      "Players panicking and running through melee.",
      "Poor parasite cleanup.",
    ],
  },
  {
    id: "demon",
    tab: "Demon",
    tag: "Phase 4",
    title: "Demon Phase",
    subtitle: "Illidan transforms into his Demon Form",
    lead: [
      "This phase revolves around the Warlock tank maintaining control while the raid manages Shadow Demons and avoids unnecessary movement.",
    ],
    role: {
      title: "Warlock Tank",
      intro: "The Warlock tank holds threat on Illidan throughout Demon Phase. A stable Warlock tank makes this phase dramatically easier.",
      points: [
        "Equip appropriate Shadow Resistance gear.",
        "Use Searing Pain to establish and maintain threat.",
        "Remain within healer range while keeping stable positioning.",
      ],
    },
    mechanics: [
      {
        name: "Shadow Blast",
        effect: "Heavy Shadow damage directed at the Warlock tank.",
        execution: [
          "Maintain Shadow Resistance gear.",
          "Healers prepare for consistent incoming damage.",
        ],
      },
      {
        name: "Shadow Demons",
        effect: "Target random players and stun them on contact. A stunned player is unlikely to survive.",
        execution: [
          "Shadow Demons become the highest DPS priority.",
          "Kill assigned Shadow Demons immediately.",
        ],
      },
      {
        name: "Laser / Demon Abilities",
        effect: "Assorted demon-form damage and movement checks.",
        execution: [
          "Continue avoiding unnecessary movement.",
          "Maintain healer range.",
          "Preserve DPS uptime whenever safely possible.",
        ],
      },
    ],
    positioning: [
      "Warlock maintains consistent boss positioning.",
      "Raid remains spread.",
      "Players immediately swap to Shadow Demons before returning to Illidan.",
    ],
    mistakes: [
      "Shadow Demons reaching players.",
      "Warlock losing threat.",
      "Poor Shadow Resistance preparation.",
      "Players chasing unnecessary DPS.",
    ],
  },
  {
    id: "final",
    tab: "Final",
    tag: "Phase 5",
    title: "Final Phase",
    subtitle: "Illidan combines previous mechanics into the final burn",
    lead: [
      "The encounter is nearly won. Do not throw away the kill by becoming impatient.",
    ],
    execution: [
      "Handle Flame Crash.",
      "Handle Parasites.",
      "Kill Shadow Demons immediately.",
      "Respect positioning.",
      "Continue clean tank swaps.",
      "Use remaining cooldowns to finish the encounter.",
    ],
    positioning: [
      "No major positioning changes — maintain discipline.",
      "Avoid unnecessary movement.",
      "Do not sacrifice mechanics for extra DPS.",
    ],
    callout: {
      tone: "win",
      title: "Close it out",
      body: "Every mechanic is executed exactly as before. Stay patient, keep the swaps clean, and burn him down.",
    },
  },
  {
    id: "reference",
    tab: "Flow & Wipes",
    tag: "Reference",
    title: "Encounter Flow & Reference",
    flow: [
      "Phase One",
      "Flames of Azzinoth",
      "Phase Three",
      "Demon Phase",
      "Repeat as required",
      "Final Burn",
      "Victory",
    ],
    wipes: [
      "Failed Shear on the tank.",
      "Poor Flame kiting.",
      "Splitting DPS between Flames.",
      "Eye Beam deaths.",
      "Parasites spawning in the raid.",
      "Shadow Demons reaching players.",
      "Warlock losing threat during Demon Phase.",
      "Greeding DPS instead of respecting mechanics.",
      "Panic during transitions.",
    ],
    closing:
      "If every player executes these strategies consistently, Black Temple becomes a fight of discipline rather than difficulty. Clean execution wins this raid.",
  },
];

export default function BlackTempleGuide() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const section = SECTIONS.find(s => s.id === active) ?? SECTIONS[0];
  const idx = SECTIONS.findIndex(s => s.id === active);

  return (
    <div className="space-y-5">
      <BossHero />

      {/* Phase tab bar — sticky under the site header */}
      <div className="sticky top-14 z-20 -mx-4 px-4 py-2 bg-[var(--bg)]/85 backdrop-blur-md border-y border-white/[0.06]">
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map((s, i) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  on ? "text-[#0c1108]" : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
                }`}
                style={on ? { background: FEL } : undefined}
              >
                <span
                  className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold ${on ? "" : "bg-white/10"}`}
                  style={on ? { background: "rgba(0,0,0,0.22)" } : undefined}
                >
                  {i + 1}
                </span>
                {s.tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section */}
      <article className="space-y-5">
        <SectionHeader tag={section.tag} title={section.title} subtitle={section.subtitle} />

        {section.lead && (
          <div className="space-y-3">
            {section.lead.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-neutral-300 max-w-3xl">{p}</p>
            ))}
          </div>
        )}

        {section.callout && <Callout {...section.callout} />}

        {section.role && <WarlockCallout {...section.role} />}

        {section.mechanics && (
          <Block title="Key mechanics" icon={<Swords size={14} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.mechanics.map(m => <MechanicCard key={m.name} m={m} />)}
            </div>
          </Block>
        )}

        {section.dps && (
          <Block title="DPS strategy" icon={<Sparkles size={14} />}>
            <div className="panel p-4 sm:p-5">
              <h4 className="text-base font-semibold text-neutral-100">{section.dps.title}</h4>
              <p className="mt-1 text-sm text-neutral-400 max-w-2xl">{section.dps.intro}</p>
              <ol className="mt-4 space-y-2">
                {section.dps.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-200">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-[#0c1108]" style={{ background: FEL }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </Block>
        )}

        {section.execution && (
          <Block title="Execution" icon={<Check size={14} />}>
            <CheckList items={section.execution} />
          </Block>
        )}

        {section.positioning && (
          <Block title="Positioning" icon={<Shield size={14} />}>
            <CheckList items={section.positioning} />
          </Block>
        )}

        {section.flow && <EncounterFlow steps={section.flow} />}

        {section.mistakes && (
          <Block title="Common mistakes" icon={<X size={14} />} tone="danger">
            <ul className="grid gap-2 sm:grid-cols-2">
              {section.mistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2 text-sm text-rose-100/90">
                  <X size={13} className="mt-0.5 shrink-0 text-rose-400" />
                  {m}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {section.wipes && (
          <Block title="Common wipe causes" icon={<X size={14} />} tone="danger">
            <ul className="grid gap-2 sm:grid-cols-2">
              {section.wipes.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2 text-sm text-rose-100/90">
                  <X size={13} className="mt-0.5 shrink-0 text-rose-400" />
                  {m}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {section.closing && (
          <div className="rounded-xl border p-5 text-center" style={{ borderColor: `${FEL}33`, background: `${FEL}0d` }}>
            <Trophy size={22} className="mx-auto mb-2" style={{ color: FEL }} />
            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-neutral-200">{section.closing}</p>
          </div>
        )}
      </article>

      {/* Prev / next */}
      <div className="flex items-center justify-between gap-3 border-t hairline pt-4">
        <StepButton
          dir="prev"
          section={idx > 0 ? SECTIONS[idx - 1] : null}
          onClick={s => setActive(s.id)}
        />
        <StepButton
          dir="next"
          section={idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null}
          onClick={s => setActive(s.id)}
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function BossHero() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8"
      style={{
        background:
          "radial-gradient(120% 140% at 15% 0%, rgba(163,255,94,0.14), transparent 55%), " +
          "radial-gradient(100% 120% at 100% 100%, rgba(120,80,200,0.12), transparent 60%), " +
          "linear-gradient(180deg, #12160e, #0b0d0a)",
      }}
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: FEL }}>
            <Crown size={13} /> Black Temple · Final Boss
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50">Illidan Stormrage</h2>
          <p className="mt-1 text-sm italic text-neutral-400">&ldquo;You are not prepared!&rdquo;</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge label="Demon" hint="Humanoid during portions of the encounter" />
          <Badge label="Demonslaying Elixir ✓" tone="fel" />
        </div>
      </div>
    </div>
  );
}

function Badge({ label, hint, tone }: { label: string; hint?: string; tone?: "fel" }) {
  return (
    <span
      title={hint}
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${hint ? "cursor-help" : ""}`}
      style={
        tone === "fel"
          ? { borderColor: `${FEL}44`, background: `${FEL}14`, color: FEL }
          : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.75)" }
      }
    >
      {label}
    </span>
  );
}

function SectionHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: FEL }}>{tag}</div>
      <h3 className="text-2xl font-bold tracking-tight text-neutral-100">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
    </div>
  );
}

function Block({ title, icon, tone, children }: { title: string; icon: React.ReactNode; tone?: "danger"; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${tone === "danger" ? "text-rose-300" : "text-neutral-300"}`}>
        <span className={tone === "danger" ? "text-rose-400" : ""} style={tone === "danger" ? undefined : { color: FEL }}>{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function MechanicCard({ m }: { m: Mechanic }) {
  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: FEL }} />
        <h5 className="text-[15px] font-semibold text-neutral-100">{m.name}</h5>
      </div>
      <p className="text-sm text-neutral-400 leading-relaxed">{m.effect}</p>
      <ul className="space-y-1.5 border-t border-white/[0.06] pt-3">
        {m.execution.map((e, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-200">
            <ArrowRight size={12} className="mt-1 shrink-0" style={{ color: FEL }} />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-lg surface-muted px-3 py-2 text-sm text-neutral-200">
          <Check size={14} className="mt-0.5 shrink-0" style={{ color: FEL }} />
          {it}
        </li>
      ))}
    </ul>
  );
}

function Callout({ tone, title, body }: { tone: "tip" | "danger" | "win"; title: string; body: string }) {
  const styles = {
    tip:    { border: `${FEL}33`, bg: `${FEL}0d`, color: FEL, icon: <Info size={15} /> },
    danger: { border: "rgba(244,63,94,0.28)", bg: "rgba(244,63,94,0.07)", color: "#fb7185", icon: <Eye size={15} /> },
    win:    { border: "rgba(255,215,0,0.3)", bg: "rgba(255,215,0,0.06)", color: "#FFD700", icon: <Trophy size={15} /> },
  }[tone];
  return (
    <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: styles.border, background: styles.bg }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: styles.color }}>
        {styles.icon}
        {title}
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-200">{body}</p>
    </div>
  );
}

function WarlockCallout({ title, intro, points }: { title: string; intro: string; points: string[] }) {
  const purple = "#b794f6";
  return (
    <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: `${purple}33`, background: `${purple}0d` }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: purple }}>
        <Shield size={15} /> {title}
      </div>
      <p className="mt-1.5 text-sm text-neutral-300 max-w-2xl">{intro}</p>
      <ul className="mt-3 space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-200">
            <ArrowRight size={12} className="mt-1 shrink-0" style={{ color: purple }} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EncounterFlow({ steps }: { steps: string[] }) {
  return (
    <Block title="Encounter flow" icon={<Sparkles size={14} />}>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="rounded-lg border px-3 py-1.5 text-sm font-medium"
                style={
                  last
                    ? { borderColor: "rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.08)", color: "#FFD700" }
                    : { borderColor: "rgba(255,255,255,0.08)", background: "var(--surface)", color: "rgba(255,255,255,0.85)" }
                }
              >
                {s}
              </span>
              {!last && <ArrowRight size={14} className="text-neutral-600" />}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

function StepButton({ dir, section, onClick }: { dir: "prev" | "next"; section: Section | null; onClick: (s: Section) => void }) {
  if (!section) return <span />;
  return (
    <button
      onClick={() => onClick(section)}
      className={`group inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[var(--surface)] px-3.5 py-2 text-sm transition hover:border-white/15 hover:bg-white/[0.02] ${dir === "next" ? "flex-row-reverse text-right" : ""}`}
    >
      <ArrowRight size={15} className={`text-neutral-500 group-hover:text-neutral-200 transition ${dir === "prev" ? "rotate-180" : ""}`} />
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500">{dir === "prev" ? "Previous" : "Next"}</span>
        <span className="font-semibold text-neutral-200">{section.tab}</span>
      </span>
    </button>
  );
}
