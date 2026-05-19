"use client";

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
};

export type ProfessionGroup = {
  key: string;
  label: string;
  blurb: string;
  items: PatternCard[];
};

export default function ProfessionsClient({ groups, totalItems }: {
  groups: ProfessionGroup[];
  totalItems: number;
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        eyebrow="Crafters"
        title="Professions"
        subtitle="Who can craft each BoE belt / boots recipe from SSC and Tempest Keep. Patterns are bound — only the player who looted it can craft."
      />

      {groups.map(g => {
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-vermillion-300/90 mb-0.5">
                      Crafts
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

      {totalItems === 0 && (
        <EmptyState
          icon={Hammer}
          title="No patterns in the catalog yet"
          description="Patterns drop from SSC and TK trash. Run data/corrections-008.sql to seed the catalog, then award them via the loot page as they drop."
        />
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
