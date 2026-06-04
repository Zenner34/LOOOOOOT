"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { WowheadLink } from "@/lib/wowhead";
import { CLASS_COLOR } from "@/lib/specs";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { Hammer } from "@/app/components/ui/Icon";

export type Crafter = {
  id: number;
  name: string;
  class: string;
  spec: string;
  playerId: number | null;
  playerName: string | null;
};

/**
 * One row per *crafted output*. Belts/boots are gated by who owns the
 * pattern (canCraftLabel = null); weapons are gated by an in-game
 * specialization (canCraftLabel = "Master Hammersmith" etc.). Both kinds
 * expose the same Can-craft / Crafted pair of lists.
 */
export type CraftedCard = {
  key: string;
  profession: string;
  itemName: string;
  wowheadId: number | null;
  binding: "boe" | "bop";
  /** When set, "Can craft" entries come from this Blacksmithing specialization
   *  (no dropped pattern). Surface it as a hint on the card. */
  canCraftLabel: string | null;
  canCraft: Crafter[];
  crafted: Crafter[];
  /** Active raiders whose spec is eligible for the item (from ItemWeight) and
   *  who haven't been awarded the crafted output yet. */
  needsCrafting: Crafter[];
};

export type ProfessionGroup = {
  key: string;
  label: string;
  blurb: string;
  items: CraftedCard[];
};

type Lens = "all" | "hasCrafter" | "hasOwner" | "hasNeed";

const LENS_OPTIONS: Array<{ value: Lens; label: string; hint: string }> = [
  { value: "all",        label: "All",          hint: "Every crafted item we track." },
  { value: "hasCrafter", label: "Has a crafter", hint: "Someone in the guild can make this one." },
  { value: "hasOwner",   label: "Crafted",      hint: "Someone in the guild has been awarded a crafted copy." },
  { value: "hasNeed",    label: "Needs crafting", hint: "At least one eligible raider still doesn't have one." },
];

export default function ProfessionsClient({ groups, totalItems }: {
  groups: ProfessionGroup[];
  totalItems: number;
}) {
  const [lens, setLens] = useState<Lens>("all");

  const filteredGroups = useMemo(() => {
    if (lens === "all") return groups;
    return groups.map(g => ({
      ...g,
      items: g.items.filter(it => {
        if (lens === "hasCrafter") return it.canCraft.length > 0;
        if (lens === "hasOwner")   return it.crafted.length > 0;
        if (lens === "hasNeed")    return it.needsCrafting.length > 0;
        return true;
      }),
    }));
  }, [groups, lens]);

  const filteredItemCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const activeHint = LENS_OPTIONS.find(o => o.value === lens)?.hint;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Crafters"
        title="Professions"
        subtitle="Who can craft each SSC/TK profession item and who's already had one made. Belts and boots are gated by patterns; weapons are gated by the in-game Blacksmithing specialization."
      />

      {totalItems > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1">
            {LENS_OPTIONS.map(opt => {
              const active = lens === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLens(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                    active
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {activeHint && (
            <span className="text-xs text-neutral-500">{activeHint}</span>
          )}
        </div>
      )}

      {filteredGroups.map(g => {
        if (g.items.length === 0) return null;
        return (
          <section key={g.key} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{g.label}</h2>
              <p className="text-sm text-neutral-400 mt-0.5">{g.blurb}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.items.map(item => (
                <article key={item.key} className="panel p-4 flex flex-col gap-3">
                  <header>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-0.5 flex items-center gap-1.5">
                      <span>Crafts</span>
                      <span
                        className={`px-1.5 py-px rounded text-[9px] ${
                          item.binding === "boe"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                        title={item.binding === "boe"
                          ? "Crafted item is Bind on Equip — tradeable"
                          : "Crafted item is Bind on Pickup — soulbound to the crafter"}
                      >
                        {item.binding === "boe" ? "BoE" : "BoP"}
                      </span>
                      {item.canCraftLabel && (
                        <span
                          className="px-1.5 py-px rounded text-[9px] bg-amber-500/10 text-amber-300/90"
                          title="In-game Blacksmithing specialization required — set on the Characters tab."
                        >
                          {item.canCraftLabel}
                        </span>
                      )}
                    </div>
                    <WowheadLink
                      name={item.itemName}
                      wowheadId={item.wowheadId}
                      iconSize={24}
                      className="text-base font-semibold"
                    />
                  </header>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CrafterList
                      heading="Can craft"
                      count={item.canCraft.length}
                      crafters={item.canCraft}
                      empty={item.canCraftLabel
                        ? `No characters tagged ${item.canCraftLabel} yet.`
                        : "No one has this pattern yet."}
                    />
                    <CrafterList
                      heading="Crafted"
                      count={item.crafted.length}
                      crafters={item.crafted}
                      empty="No one has been awarded this yet."
                    />
                    <CrafterList
                      heading="Needs crafting"
                      count={item.needsCrafting.length}
                      crafters={item.needsCrafting}
                      empty="No eligible raider is missing this item."
                      tone="needs"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {totalItems === 0 ? (
        <EmptyState
          icon={Hammer}
          title="No profession items in the catalog yet"
          description="Patterns drop from SSC and TK trash; crafted outputs live under the Crafted (Nether Vortex) catalog section. Award them via the loot page as they drop."
        />
      ) : filteredItemCount === 0 ? (
        <EmptyState
          icon={Hammer}
          title="Nothing matches this filter"
          description="Try the other lenses or All to see every item."
          variant="compact"
        />
      ) : null}
    </div>
  );
}

function CrafterList({
  heading,
  count,
  crafters,
  empty,
  tone,
}: {
  heading: string;
  count: number;
  crafters: Crafter[];
  empty: string;
  tone?: "needs";
}) {
  const headingColor = tone === "needs" ? "text-amber-300/80" : "text-neutral-500";
  return (
    <div>
      <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${headingColor} mb-1.5`}>
        {heading} · {count}
      </div>
      {crafters.length === 0 ? (
        <p className="text-xs text-neutral-500 italic">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {crafters.map(c => (
            <li key={c.id}>
              {c.playerId !== null ? (
                <Link
                  href={`/players/${c.playerId}`}
                  className="inline-flex items-center gap-2 text-sm hover:underline"
                >
                  <CrafterLabel c={c} />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm">
                  <CrafterLabel c={c} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CrafterLabel({ c }: { c: Crafter }) {
  return (
    <>
      <span className="font-semibold" style={{ color: CLASS_COLOR[c.class] ?? "#fff" }}>
        {c.name}
      </span>
      <span className="text-xs text-neutral-500">
        {c.playerName && c.playerName !== c.name
          ? `${c.playerName} · ${c.spec}`
          : c.spec}
      </span>
    </>
  );
}
