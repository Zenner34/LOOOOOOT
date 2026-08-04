/* Mount Hyjal boss strategy data. Rendered by app/guides/BossGuide.tsx
   via the shared RaidGuide selector. */

import type { Boss } from "../types";

const TOTEM = "#3fa9ff"; // shaman/priest utility accent for role callouts

/* ══════════════════════════ RAGE WINTERCHILL ══════════════════════════ */

const RAGE: Boss = {
  id: "rage-winterchill",
  name: "Rage Winterchill",
  role: "First Boss",
  accent: "#7ec8ff",
  badges: [{ label: "Undead" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "First Boss",
      title: "Overview",
      lead: [
        "Rage Winterchill opens Mount Hyjal and serves as a positioning and awareness check. The mechanics are simple, but poor movement or delayed reactions quickly overwhelm healers.",
        "The encounter rewards disciplined positioning and immediate responses to targeted mechanics rather than raw DPS.",
      ],
      callout: {
        tone: "tip",
        title: "Awareness over DPS",
        body: "Nothing here is complex — it's won by reacting instantly. Move out of Death and Decay on sight and get heals onto frozen players before they drop.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Icebolt",
          effect: "Freezes a random player, dealing heavy Frost damage and preventing all actions.",
          execution: [
            "Healers immediately stabilize the affected player.",
            "Be prepared for temporary healing disruption if a healer is targeted.",
          ],
        },
        {
          name: "Death and Decay",
          effect: "Creates a large Shadow damage zone beneath a random player.",
          execution: [
            "Move immediately.",
            "Never finish a cast while standing in Death and Decay.",
            "Re-establish positioning once the area is clear.",
          ],
        },
        {
          name: "Frost Nova",
          effect: "Roots nearby players.",
          execution: [
            "Stay aware of Death and Decay placement while rooted.",
            "Recover positioning immediately once the root expires.",
          ],
        },
      ],
      positioning: [
        "Tank Winterchill near the center of the fighting area.",
        "Face the boss away from the raid.",
        "Melee remain behind the boss.",
        "Ranged and healers spread to reduce movement conflicts while staying in healing range.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish positioning",
        "Maintain consistent DPS",
        "Move out of Death and Decay",
        "Stabilize Icebolt targets",
        "Continue until defeated",
      ],
      wipes: [
        "Standing in Death and Decay.",
        "Delayed movement.",
        "Frozen players dying before receiving heals.",
        "Raid collapsing into the same location.",
      ],
    },
  ],
};

/* ══════════════════════════════ ANETHERON ══════════════════════════════ */

const ANETHERON: Boss = {
  id: "anetheron",
  name: "Anetheron",
  role: "Second Boss",
  accent: "#ff8a4c",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Second Boss",
      title: "Overview",
      lead: [
        "Anetheron is primarily an add-management encounter. The boss has dangerous abilities, but Infernal control is what determines success.",
        "Stay calm during Infernal spawns and don't sacrifice positioning while switching targets.",
      ],
      callout: {
        tone: "tip",
        title: "Infernal control decides it",
        body: "Every Infernal is an immediate ranged swap — identify the landing spot, let a tank grab it, and burn it down before returning to the boss.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Inferno",
          effect: "Summons an Infernal that deals heavy Fire damage and creates constant raid pressure.",
          execution: [
            "Immediately identify the Infernal landing location.",
            "Tanks establish control quickly.",
            "Ranged DPS immediately eliminate the Infernal.",
            "Resume boss damage once the Infernal dies.",
          ],
        },
        {
          name: "Carrion Swarm",
          effect: "Heavy frontal Shadow damage.",
          execution: [
            "Keep the boss faced away from the raid.",
            "Never stand in front of Anetheron.",
          ],
        },
        {
          name: "Sleep",
          effect: "Places multiple players into a magical sleep.",
          execution: [
            "Healers anticipate temporary healing gaps.",
            "Tanks stay prepared for incoming damage while parts of the raid are incapacitated.",
          ],
        },
        {
          name: "Vampiric Aura",
          effect: "Anetheron heals through melee attacks.",
          execution: [
            "Maintain steady DPS.",
            "Minimize unnecessary encounter length.",
          ],
        },
      ],
      positioning: [
        "Tank the boss facing away from the raid.",
        "Melee remain behind the boss.",
        "Ranged spread enough to avoid Infernal overlap.",
        "Maintain awareness of Infernal landing locations.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish positioning",
        "Maintain boss damage",
        "Swap immediately to Infernals",
        "Return to boss DPS",
        "Repeat until defeated",
      ],
      wipes: [
        "Ignoring Infernal spawns.",
        "Standing inside Infernal fire.",
        "Carrion Swarm hitting the raid.",
        "Tanks losing control after Sleep.",
      ],
    },
  ],
};

/* ══════════════════════════════ KAZ'ROGAL ══════════════════════════════ */

const KAZROGAL: Boss = {
  id: "kazrogal",
  name: "Kaz'rogal",
  role: "Third Boss",
  accent: "#b18bff",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Third Boss",
      title: "Overview",
      lead: [
        "Kaz'rogal is a resource-management encounter that heavily punishes mana users. The mechanics are simple, but poor mana management or overextended cooldowns can wipe the raid fast.",
        "The fight gets easier the faster it ends — efficient DPS and proper cooldown usage matter, without sacrificing execution.",
      ],
      callout: {
        tone: "danger",
        title: "Never hit 0 mana",
        body: "Mark of Kaz'rogal drains mana, and anyone who bottoms out explodes on the raid. Pool restoration cooldowns proactively and call it out before you get close to empty.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Mark of Kaz'rogal",
          effect: "A debuff that periodically drains mana. Players who reach 0 mana explode, dealing heavy damage to themselves and nearby allies.",
          execution: [
            "Mana users closely monitor their mana pool and avoid reaching 0.",
            "Use Mana Potions, Dark/Demonic Runes, Mana Tide, Innervate, etc. proactively.",
            "Healers avoid excessive overhealing to preserve mana.",
            "Communicate before your mana becomes a problem — not after.",
          ],
        },
        {
          name: "Cleave",
          effect: "Heavy frontal physical attack.",
          execution: [
            "Keep Kaz'rogal faced away from the raid.",
            "Never stand in front of the boss unless assigned.",
          ],
        },
        {
          name: "War Stomp",
          effect: "Short-range stun affecting nearby players.",
          execution: [
            "Tanks maintain stable positioning.",
            "Healers prepare for brief healing disruption.",
          ],
        },
      ],
      positioning: [
        "Tank Kaz'rogal near the center of the encounter area.",
        "Face the boss away from the raid.",
        "Melee remain behind the boss.",
        "Ranged and healers spread while staying in healing range.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish positioning",
        "Maintain steady DPS",
        "Manage mana carefully throughout",
        "Use mana cooldowns before critical levels",
        "Continue until defeated",
      ],
      wipes: [
        "Players exploding from Mark of Kaz'rogal.",
        "Running completely out of mana.",
        "Excessive overhealing early in the encounter.",
        "Standing in front of the boss.",
        "Panic mana-cooldown usage after reaching critical mana.",
      ],
    },
  ],
};

/* ══════════════════════════════ AZGALOR ══════════════════════════════ */

const AZGALOR: Boss = {
  id: "azgalor",
  name: "Azgalor",
  role: "Fourth Boss",
  accent: "#ff5e6c",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Fourth Boss",
      title: "Overview",
      lead: [
        "Azgalor is the final encounter before Archimonde and a positioning and personal-responsibility check. Every player must execute correctly.",
        "Doom and Rain of Fire punish individual mistakes, and Howl of Azgalor pressures healers constantly. The fight is controlled through discipline and clean movement.",
      ],
      callout: {
        tone: "danger",
        title: "Doom targets leave the raid",
        body: "When Doom expires the player dies and summons a Doom Guard. Get out before you die, let a tank grab the guard away from the raid, and burn it fast.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Doom",
          effect: "An unremovable debuff on a random player. When it expires the player dies and a Doom Guard is summoned.",
          execution: [
            "Affected players immediately move away from the raid — do not die inside it.",
            "Tanks immediately pick up the Doom Guard.",
            "Ranged DPS quickly eliminate the Doom Guard, then return to the boss.",
          ],
        },
        {
          name: "Rain of Fire",
          effect: "Creates a large area of Fire damage.",
          execution: [
            "Move immediately.",
            "Never finish a cast while standing in Rain of Fire.",
            "Return to position once safe.",
          ],
        },
        {
          name: "Howl of Azgalor",
          effect: "Raid-wide silence affecting nearby players.",
          execution: [
            "Healers prepare before each silence.",
            "Avoid unnecessary damage immediately before it occurs.",
            "Use personal defensives if healing is delayed.",
          ],
        },
        {
          name: "Cleave",
          effect: "Heavy frontal physical damage.",
          execution: [
            "Keep Azgalor facing away from the raid.",
            "Never stand in front of the boss unless assigned.",
          ],
        },
      ],
      positioning: [
        "Tank Azgalor facing away from the raid.",
        "Melee remain behind the boss.",
        "Ranged spread around the encounter area.",
        "Doom targets immediately leave the raid before dying.",
        "Doom Guards are picked up away from the raid before being burned down.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish positioning",
        "Maintain steady boss damage",
        "Handle Rain of Fire immediately",
        "Doom targets move away",
        "Tanks secure Doom Guards",
        "Kill Doom Guards",
        "Resume boss damage",
        "Repeat until defeated",
      ],
      wipes: [
        "Doom targets dying inside the raid.",
        "Tanks failing to pick up Doom Guards.",
        "Standing in Rain of Fire.",
        "Healers caught by Howl after unnecessary raid damage.",
        "Players standing in front of the boss.",
      ],
    },
  ],
};

/* ══════════════════════════════ ARCHIMONDE ══════════════════════════════ */

const ARCHIMONDE: Boss = {
  id: "archimonde",
  name: "Archimonde",
  role: "Final Boss",
  quote: "Your resistance is insignificant!",
  accent: "#ffd24c",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Final Boss",
      title: "Overview",
      lead: [
        "Archimonde is the final encounter of Mount Hyjal and one of the most punishing fights in The Burning Crusade. He is not a DPS check — he dies when every player consistently executes the mechanics.",
        "Almost every mechanic can wipe the raid if handled incorrectly. Surviving matters more than maximizing damage. Stay calm, trust the strategy, and execute one mechanic at a time.",
      ],
      callout: {
        tone: "danger",
        title: "Everyone needs Tears of the Goddess",
        body: "Air Burst launches players skyward for lethal fall damage. Every player must have Tears of the Goddess on their bars before the pull and use it near the peak of the knock-up.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      roles: [
        {
          title: "Shaman & Priest — Fear coverage",
          accent: TOTEM,
          intro: "Continuous anti-Fear coverage keeps melee and tanks in control through every Fear.",
          points: [
            "Rotate Tremor Totems for uninterrupted coverage.",
            "Keep Fear Ward on the active tank whenever available.",
            "Don't spread farther than necessary from the totems.",
          ],
        },
      ],
      mechanics: [
        {
          name: "Air Burst",
          effect: "Launches a random player high into the air, dealing heavy fall damage on landing.",
          execution: [
            "Activate Tears of the Goddess near the peak of the knock-up to negate fall damage.",
            "Return to your assigned position immediately after landing.",
            "Every player keeps Tears of the Goddess on their bars before the pull.",
          ],
        },
        {
          name: "Doomfire",
          effect: "Summons a moving trail of fire that follows random players.",
          execution: [
            "Move early and kite Doomfire away from the raid.",
            "Never run Doomfire through melee or healers.",
            "Prefer small movements over large panic movements.",
            "Return to position once safe, staying aware of nearby Doomfire.",
          ],
        },
        {
          name: "Fear",
          effect: "Mass fear cast throughout the encounter.",
          execution: [
            "Rotate Tremor Totems for continuous coverage.",
            "Maintain Fear Ward on the active tank whenever available.",
            "Recover positioning immediately after every Fear.",
          ],
        },
        {
          name: "Grip of the Legion",
          effect: "Applies a Shadow damage-over-time effect to a random player.",
          execution: [
            "Healers quickly stabilize affected players.",
            "Continue normal positioning — do not force unnecessary movement.",
          ],
        },
        {
          name: "Finger of Death",
          effect: "Massive damage if no player is within melee range.",
          execution: [
            "Tanks maintain contact with Archimonde at all times.",
            "Never allow him to lose his primary target.",
            "Prevent unnecessary tank movement during mechanics.",
          ],
        },
        {
          name: "Soul Charge",
          effect: "Whenever a player dies, Archimonde gains a powerful buff based on that player's class.",
          execution: [
            "Deaths are not recoverable mistakes.",
            "Every player prioritizes survival over DPS.",
            "Avoid unnecessary risks throughout the encounter.",
          ],
        },
      ],
      positioning: [
        "Tank Archimonde near the center of the encounter area, faced away from the raid.",
        "Melee remain behind the boss.",
        "Ranged and healers spread evenly while staying in healing range.",
        "Avoid large gaps that make Doomfire movement unpredictable.",
        "Return to your assigned location after every mechanic — clean positioning makes the next one easier.",
      ],
    },
    {
      id: "final-burn",
      tab: "Final Burn",
      tag: "Execute",
      title: "The Final Burn",
      lead: [
        "Archimonde does not become mechanically harder at low health. The temptation is to ignore mechanics and finish him. Do not.",
      ],
      execution: [
        "Doomfire.",
        "Air Burst.",
        "Fear.",
        "Grip of the Legion.",
        "Positioning.",
      ],
      callout: {
        tone: "win",
        title: "A clean final minute beats a rushed kill",
        body: "Keep handling every mechanic exactly the same through the burn. If everyone survives, Archimonde dies.",
      },
      closing:
        "Archimonde rewards discipline more than damage. Every mechanic has a solution — trust the strategy, respect every mechanic, and stay alive. If everyone executes consistently, Archimonde will fall.",
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Pull & establish positioning",
        "Maintain DPS with clean spacing",
        "Kite Doomfire away from the raid",
        "Air Burst → Tears of the Goddess",
        "Recover after Fear",
        "Repeat to low health",
        "Clean final burn",
        "Victory",
      ],
      wipes: [
        "Forgetting Tears of the Goddess after Air Burst.",
        "Doomfire dragged through the raid.",
        "Panicking during Doomfire movement.",
        "Poor Tremor Totem or Fear Ward coverage.",
        "Tank losing contact with Archimonde.",
        "Deaths causing dangerous Soul Charge buffs.",
        "Sacrificing mechanics for additional DPS.",
        "Raid collapsing into poor positions after movement.",
        "Chain deaths during the final burn.",
      ],
    },
  ],
};

/* ══════════════════════════════ EXPORTS ══════════════════════════════ */

// Mount Hyjal encounters in order. First entry is the default selection.
export const MH_BOSSES: Boss[] = [RAGE, ANETHERON, KAZROGAL, AZGALOR, ARCHIMONDE];
