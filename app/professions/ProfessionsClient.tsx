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

export type PatternCard = {
  id: number;
  name: string;
  craftedItemName: string;
  wowheadId: number | null;
  crafters: Crafter[];
  /** Whether the *crafted* item is BoE (tradeable) or BoP (soulbound
   *  to the crafter). All current SSC/TK profession drops produce BoE
   *  gear, but the filter exists for future BoP-output recipes. */
  binding: "boe" | "bop";
};

export type ProfessionGroup = {
  key: string;
  label: string;
  blurb: string;
  items: PatternCard[];
};

type BindingFilter = "boe" | "bop" | "all";

const BINDING_OPTIONS: Array<{ value: BindingFilter; label: string; hint: string }> = [
  { value: "boe", label: "Crafts BoE", hint: "Recipe makes a tradeable item — the crafter can mail it to you." },
  { value: "bop", label: "Crafts BoP", hint: "Recipe makes a soulbound item — only the crafter can use it." },
  { value: "all", label: "All",        hint: "Every catalog recipe regardless of what its output binds as." },
];

export default function ProfessionsClient({ groups, totalItems }: {
  groups: ProfessionGroup[];
  totalItems: number;
}) {
  // Default to BoE — guild's primary use case is "who can craft a
  // tradeable belt/boots and send it to me".
  const [binding, setBinding] = useState<BindingFilter>("boe");

  const filteredGroups = useMemo(() => {
    if (binding === "all") return groups;
    return groups.map(g => ({
      ...g,
      items: g.items.filter(it => it.binding === binding),
    }));
  }, [groups, binding]);

  const filteredItemCount = filteredGroups.reduce((sum, g) => sum + g.items.length, 0);
  const activeHint = BINDING_OPTIONS.find(o => o.value === binding)?.hint;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Crafters"
        title="Professions"
        subtitle="Who in the guild can craft each belt / boots recipe from SSC and Tempest Keep. Filter by whether the crafted item is tradeable (BoE) or soulbound to the crafter (BoP)."
      />

      {totalItems > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1">
            {BINDING_OPTIONS.map(opt => {
              const active = binding === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBinding(opt.value)}
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
                <article key={item.id} className="panel p-4 flex flex-col gap-3">
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
                    </div>
                    <WowheadLink
                      name={item.craftedItemName}
                      wowheadId={item.wowheadId}
                      iconSize={24}
                      className="text-base font-semibold"
                    />
                  </header>

                  <div className="flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1.5">
                      Crafted by · {item.crafters.length}
                    </div>
                    {item.crafters.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">
                        No one has this pattern yet.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {item.crafters.map(c => (
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
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {totalItems === 0 ? (
        <EmptyState
          icon={Hammer}
          title="No patterns in the catalog yet"
          description="Patterns drop from SSC and TK trash. Run data/corrections-008.sql to seed the catalog, then award them via the loot page as they drop."
        />
      ) : filteredItemCount === 0 ? (
        <EmptyState
          icon={Hammer}
          title={`No ${binding === "boe" ? "BoE" : "BoP"} recipes in the catalog`}
          description="Try the other binding, or All to see every recipe."
          variant="compact"
        />
      ) : null}
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
