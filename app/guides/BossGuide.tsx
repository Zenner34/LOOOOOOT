"use client";

import { useState } from "react";
import { Shield, Eye, Swords, Sparkles, Info, Crown, Check, X, ArrowRight, Trophy, ListOrdered } from "@/app/components/ui/Icon";
import type { Boss, Mechanic, RoleNote, Section } from "./types";
import { ZoomImage } from "@/app/components/ui/ZoomImage";

/* Renders one boss: hero banner + sticky section tabs + section content.
   Fully driven by the Boss data in ./black-temple/bosses.ts. */
export default function BossGuide({
  boss,
  bossPrev,
  bossNext,
  onPickBoss,
  raidName = "Black Temple",
  modal = false,
}: {
  boss: Boss;
  bossPrev?: Boss | null;
  bossNext?: Boss | null;
  onPickBoss?: (id: string) => void;
  /** Raid name shown in the hero's crown line. */
  raidName?: string;
  /** Rendered inside a scrolling modal — pins the tab bar to the top of
   *  that container instead of below the site header. */
  modal?: boolean;
}) {
  const accent = boss.accent;
  const [active, setActive] = useState(boss.sections[0].id);
  const section = boss.sections.find(s => s.id === active) ?? boss.sections[0];
  const idx = boss.sections.findIndex(s => s.id === active);

  const nav = (variant: "top" | "bottom") => (
    <GuideNav
      accent={accent}
      sections={boss.sections}
      idx={idx}
      setActive={setActive}
      bossPrev={bossPrev}
      bossNext={bossNext}
      onPickBoss={onPickBoss}
      variant={variant}
    />
  );

  return (
    <div className="space-y-5">
      <BossHero boss={boss} raidName={raidName} />

      {/* Section tabs — sticky under the site header (or the modal's
          scroll top). Top-right nav on desktop. */}
      <div className={`sticky ${modal ? "top-0" : "top-14"} z-20 -mx-4 px-4 py-2 bg-[var(--bg)]/85 backdrop-blur-md border-y border-white/[0.06]`}>
        <div className="flex items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {boss.sections.map((s, i) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  on ? "text-[#0c0a12]" : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
                }`}
                style={on ? { background: accent } : undefined}
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
        <div className="shrink-0 hidden lg:block">{nav("top")}</div>
        </div>
      </div>

      <article className="space-y-5">
        <SectionHeader accent={accent} tag={section.tag} title={section.title} subtitle={section.subtitle} />

        {/* Text left, imagery right — the split keeps sections short so
            the reader isn't scrolling past a full-width diagram to reach
            the strategy. Stacks (text first) below lg. */}
        {(() => {
          const hasImg = !!(section.image || (section.images && section.images.length > 0));
          const lead = section.lead && (
            <div className="space-y-3">
              {section.lead.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-neutral-300 max-w-3xl">{p}</p>
              ))}
            </div>
          );
          const callout = section.callout && <Callout accent={accent} {...section.callout} />;
          if (!hasImg) {
            return (
              <>
                {lead}
                {callout}
              </>
            );
          }
          const imagery = (
            <div className="space-y-3">
              {section.image && (
                <figure className="space-y-1.5">
                  <ZoomImage
                    src={section.image}
                    alt={section.imageAlt ?? `${boss.name} strategy diagram`}
                    caption={section.imageCaption ?? section.title}
                    wrapperClassName="mx-auto w-fit max-w-full"
                    imgClassName="block h-auto max-h-[22rem] w-auto max-w-full rounded-xl border bg-black/30 transition hover:brightness-110 sm:max-h-[26rem]"
                    imgStyle={{ borderColor: `${accent}33` }}
                  />
                  <figcaption className="text-[11px] text-neutral-500 text-center">
                    {section.imageCaption ?? ""}{section.imageCaption ? " · " : ""}click to enlarge
                  </figcaption>
                </figure>
              )}
              {section.images?.map((img, i) => (
                <figure key={i} className="space-y-1.5">
                  <ZoomImage
                    src={img.src}
                    alt={img.alt ?? `${boss.name} — ${section.title} diagram`}
                    caption={img.caption ?? `${boss.name} — ${section.title}`}
                    wrapperClassName="mx-auto w-fit max-w-full"
                    imgClassName="block h-auto max-h-72 w-auto max-w-full rounded-xl border bg-black/30 transition hover:brightness-110 sm:max-h-80"
                    imgStyle={{ borderColor: `${accent}33` }}
                  />
                  {img.caption && (
                    <figcaption className="text-[11px] text-neutral-500 text-center">{img.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          );
          return (
            <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                {lead}
                {callout}
              </div>
              <div>{imagery}</div>
            </div>
          );
        })()}

        {section.roles?.map((r, i) => <RoleCallout key={i} accent={accent} role={r} />)}

        {section.mechanics && (
          <Block accent={accent} title="Key mechanics" icon={<Swords size={14} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {section.mechanics.map(m => <MechanicCard key={m.name} accent={accent} m={m} />)}
            </div>
          </Block>
        )}

        {section.dps && (
          <Block accent={accent} title="DPS strategy" icon={<Sparkles size={14} />}>
            <div className="panel p-4 sm:p-5">
              <h4 className="text-base font-semibold text-neutral-100">{section.dps.title}</h4>
              <p className="mt-1 text-sm text-neutral-400 max-w-2xl">{section.dps.intro}</p>
              <NumberedSteps accent={accent} steps={section.dps.steps} />
            </div>
          </Block>
        )}

        {section.order && (
          <Block accent={accent} title={section.order.title ?? "Execution order"} icon={<ListOrdered size={14} />}>
            <div className="panel p-4 sm:p-5">
              <NumberedSteps accent={accent} steps={section.order.steps} />
            </div>
          </Block>
        )}

        {section.execution && (
          <Block accent={accent} title="Execution" icon={<Check size={14} />}>
            <CheckList accent={accent} items={section.execution} />
          </Block>
        )}

        {section.positioning && (
          <Block accent={accent} title="Positioning" icon={<Shield size={14} />}>
            <CheckList accent={accent} items={section.positioning} />
          </Block>
        )}

        {section.flow && <EncounterFlow accent={accent} steps={section.flow} />}

        {(section.mistakes || section.wipes) && (
          <Block accent={accent} title={section.wipes ? "Common wipe causes" : "Common mistakes"} icon={<X size={14} />} tone="danger">
            <ul className="grid gap-2 sm:grid-cols-2">
              {(section.wipes ?? section.mistakes)!.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2 text-sm text-rose-100/90">
                  <X size={13} className="mt-0.5 shrink-0 text-rose-400" />
                  {m}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {section.closing && (
          <div className="rounded-xl border p-5 text-center" style={{ borderColor: `${accent}33`, background: `${accent}0d` }}>
            <Trophy size={22} className="mx-auto mb-2" style={{ color: accent }} />
            <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-neutral-200">{section.closing}</p>
          </div>
        )}
      </article>

      <div className="border-t hairline pt-4">{nav("bottom")}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function BossHero({ boss, raidName }: { boss: Boss; raidName: string }) {
  const a = boss.accent;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8"
      style={{
        background:
          `radial-gradient(120% 140% at 15% 0%, ${a}24, transparent 55%), ` +
          `radial-gradient(100% 120% at 100% 100%, ${a}14, transparent 60%), ` +
          "linear-gradient(180deg, #111319, #0a0b0e)",
      }}
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: a }}>
            <Crown size={13} /> {raidName} · {boss.role}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-50">{boss.name}</h2>
          {boss.quote && <p className="mt-1 text-sm italic text-neutral-400">&ldquo;{boss.quote}&rdquo;</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {boss.badges.map((b, i) => (
            <span
              key={i}
              title={b.hint}
              className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${b.hint ? "cursor-help" : ""}`}
              style={
                b.tone === "accent"
                  ? { borderColor: `${a}44`, background: `${a}14`, color: a }
                  : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }
              }
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ accent, tag, title, subtitle }: { accent: string; tag: string; title: string; subtitle?: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>{tag}</div>
      <h3 className="text-2xl font-bold tracking-tight text-neutral-100">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
    </div>
  );
}

function Block({ accent, title, icon, tone, children }: { accent: string; title: string; icon: React.ReactNode; tone?: "danger"; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h4 className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${tone === "danger" ? "text-rose-300" : "text-neutral-300"}`}>
        <span className={tone === "danger" ? "text-rose-400" : ""} style={tone === "danger" ? undefined : { color: accent }}>{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function MechanicCard({ accent, m }: { accent: string; m: Mechanic }) {
  return (
    <div className="panel p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
        <h5 className="text-[15px] font-semibold text-neutral-100">{m.name}</h5>
      </div>
      <p className="text-sm text-neutral-400 leading-relaxed">{m.effect}</p>
      <ul className="space-y-1.5 border-t border-white/[0.06] pt-3">
        {m.execution.map((e, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-200">
            <ArrowRight size={12} className="mt-1 shrink-0" style={{ color: accent }} />
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NumberedSteps({ accent, steps }: { accent: string; steps: string[] }) {
  return (
    <ol className="mt-4 space-y-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-neutral-200">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold text-[#0c0a12]" style={{ background: accent }}>{i + 1}</span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function CheckList({ accent, items }: { accent: string; items: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 rounded-lg surface-muted px-3 py-2 text-sm text-neutral-200">
          <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent }} />
          {it}
        </li>
      ))}
    </ul>
  );
}

function Callout({ accent, tone, title, body }: { accent: string; tone: "tip" | "danger" | "win"; title: string; body: string }) {
  const styles = {
    tip:    { border: `${accent}33`, bg: `${accent}0d`, color: accent, icon: <Info size={15} /> },
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

function RoleCallout({ accent, role }: { accent: string; role: RoleNote }) {
  const c = role.accent ?? accent;
  return (
    <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: `${c}33`, background: `${c}0d` }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: c }}>
        <Shield size={15} /> {role.title}
      </div>
      <p className="mt-1.5 text-sm text-neutral-300 max-w-2xl">{role.intro}</p>
      <ul className="mt-3 space-y-1.5">
        {role.points.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-neutral-200">
            <ArrowRight size={12} className="mt-1 shrink-0" style={{ color: c }} />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EncounterFlow({ accent, steps }: { accent: string; steps: string[] }) {
  return (
    <Block accent={accent} title="Encounter flow" icon={<Sparkles size={14} />}>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="rounded-lg border px-3 py-1.5 text-sm font-medium"
                style={
                  last
                    ? { borderColor: `${accent}59`, background: `${accent}14`, color: accent }
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

/* Combined navigation: section prev/next (prominent, labeled) flanked by
   boss prev/next (arrow chips). Rendered top-right (desktop) and bottom. */
function GuideNav({
  accent, sections, idx, setActive, bossPrev, bossNext, onPickBoss, variant,
}: {
  accent: string;
  sections: Section[];
  idx: number;
  setActive: (id: string) => void;
  bossPrev?: Boss | null;
  bossNext?: Boss | null;
  onPickBoss?: (id: string) => void;
  variant: "top" | "bottom";
}) {
  const prevSec = idx > 0 ? sections[idx - 1] : null;
  const nextSec = idx < sections.length - 1 ? sections[idx + 1] : null;

  function BossArrow({ dir, boss }: { dir: "prev" | "next"; boss?: Boss | null }) {
    if (!boss || !onPickBoss) return null;
    const label = dir === "prev" ? "Prev boss" : "Next boss";
    return (
      <button
        type="button"
        onClick={() => onPickBoss(boss.id)}
        title={`${label}: ${boss.name}`}
        aria-label={`${label}: ${boss.name}`}
        className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition hover:brightness-125"
        style={{ borderColor: `${accent}44`, background: `${accent}12`, color: accent }}
      >
        {dir === "prev" && <ArrowRight size={14} className="shrink-0 rotate-180" />}
        <span className={`flex flex-col leading-tight ${dir === "next" ? "items-end" : "items-start"}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
          <span className="max-w-[8rem] truncate text-xs font-semibold">{boss.name}</span>
        </span>
        {dir === "next" && <ArrowRight size={14} className="shrink-0" />}
      </button>
    );
  }

  function SectionBtn({ dir, section, prominent }: { dir: "prev" | "next"; section: Section | null; prominent?: boolean }) {
    if (!section) return null;
    if (prominent) {
      return (
        <button
          type="button"
          onClick={() => setActive(section.id)}
          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition hover:brightness-110"
          style={{ background: accent, color: "#0c0a12" }}
        >
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[9px] uppercase tracking-wider opacity-70">Next</span>
            <span>{section.tab}</span>
          </span>
          <ArrowRight size={15} />
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setActive(section.id)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[var(--surface)] px-3 py-2 text-sm transition hover:border-white/20 hover:bg-white/[0.03]"
      >
        <ArrowRight size={15} className="rotate-180 text-neutral-500" />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[9px] uppercase tracking-wider text-neutral-500">Prev</span>
          <span className="text-neutral-200 font-medium">{section.tab}</span>
        </span>
      </button>
    );
  }

  // Top (sticky bar) stays compact — forward controls only, since the section
  // tabs and boss dropdown right beside it already handle going back. The
  // bottom bar carries the full prev/next set for both sections and bosses.
  if (variant === "top") {
    return (
      <div className="flex items-center justify-end gap-2">
        <SectionBtn dir="next" section={nextSec} prominent />
        <BossArrow dir="next" boss={bossNext} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <BossArrow dir="prev" boss={bossPrev} />
        <SectionBtn dir="prev" section={prevSec} />
      </div>
      <div className="flex items-center gap-2">
        <SectionBtn dir="next" section={nextSec} prominent />
        <BossArrow dir="next" boss={bossNext} />
      </div>
    </div>
  );
}
