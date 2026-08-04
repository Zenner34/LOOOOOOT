/* ────────────────────────────────────────────────────────────────────
   Black Temple boss strategy data. Rendered by app/guides/BossGuide.tsx.
   Add a new boss by appending to BT_BOSSES and flipping its roster entry
   to include an `id`.
   ──────────────────────────────────────────────────────────────────── */

import type { Boss } from "../types";

/* Class-flavoured accents reused inside role callouts. */
const WARLOCK = "#b794f6";
const MAGE = "#40C7EB";
const PALADIN = "#F58CBA";

/* ══════════════════════════════ ILLIDAN ══════════════════════════════ */

const ILLIDAN: Boss = {
  id: "illidan",
  name: "Illidan Stormrage",
  role: "Final Boss",
  quote: "You are not prepared!",
  accent: "#a3ff5e",
  badges: [
    { label: "Demon", hint: "Humanoid during portions of the encounter" },
    { label: "Demonslaying Elixir ✓", tone: "accent" },
  ],
  sections: [
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
      roles: [
        {
          title: "Warlock Tank",
          accent: WARLOCK,
          intro: "The Warlock tank holds threat on Illidan throughout Demon Phase. A stable Warlock tank makes this phase dramatically easier.",
          points: [
            "Equip appropriate Shadow Resistance gear.",
            "Use Searing Pain to establish and maintain threat.",
            "Remain within healer range while keeping stable positioning.",
          ],
        },
      ],
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
      lead: ["The encounter is nearly won. Do not throw away the kill by becoming impatient."],
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
  ],
};

/* ═════════════════════════ ILLIDARI COUNCIL ═════════════════════════ */

const ILLIDARI_COUNCIL: Boss = {
  id: "illidari-council",
  name: "Illidari Council",
  role: "The Council",
  quote: "Be silent, and I will grant you a merciful death!",
  accent: "#c58bff",
  badges: [
    { label: "4 bosses · shared health", hint: "Damage is split across all four; they must fall together" },
    { label: "Split & cleave", tone: "accent" },
  ],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "The Council",
      title: "The Council",
      subtitle: "Four bosses, one shared health pool",
      lead: [
        "The Illidari Council is fought as four bosses that share a single health pool — nobody dies first, so damage must stay balanced across the group.",
        "The core of the strategy: split High Nethermancer Zerevor out and kite him with a Mage, while the raid stacks and cleaves the remaining three.",
      ],
      callout: {
        tone: "tip",
        title: "Isolate Zerevor, stack the rest",
        body: "Pulling Zerevor away removes his most dangerous magic from the group and lets the raid stack Malande, Veras, and Gathios together for maximum cleave with minimal movement.",
      },
    },
    {
      id: "zerevor",
      tab: "Zerevor",
      tag: "Isolate",
      title: "High Nethermancer Zerevor",
      subtitle: "Kited by a Mage around the room",
      lead: [
        "Zerevor is the primary boss removed from the Council stack. Because of his extremely dangerous magical abilities, a Mage kites him around the outside of the room.",
        "This keeps his casts off the stacked raid and minimizes avoidable damage while the rest of the raid cleaves.",
      ],
      roles: [
        {
          title: "Mage — Zerevor Kite",
          accent: MAGE,
          intro: "One Mage owns Zerevor for the whole fight, keeping him on the outer edge and never letting him free-cast into the raid.",
          points: [
            "Maintain control of Zerevor around the outside edge of the room.",
            "Never allow Zerevor to freely cast into the stacked raid.",
            "Maintain distance while avoiding unnecessary movement.",
            "Keep the kite path consistent and predictable.",
          ],
        },
      ],
      mechanics: [
        {
          name: "Blizzard",
          effect: "Creates a large Frost damage zone.",
          execution: ["Move away immediately.", "Avoid forcing dangerous movement paths."],
        },
        {
          name: "Flamestrike",
          effect: "Creates a large Fire damage area.",
          execution: ["Move out quickly.", "Avoid overlapping dangerous ground effects."],
        },
        {
          name: "Arcane Explosion",
          effect: "High Arcane damage around Zerevor.",
          execution: ["Maintain distance.", "Prevent Zerevor from reaching the raid."],
        },
      ],
    },
    {
      id: "stack",
      tab: "The Stack",
      tag: "Stack & Cleave",
      title: "The Cleave Stack",
      subtitle: "Malande · Veras · Gathios",
      lead: [
        "The remaining three bosses stay stacked on top of each other so the raid can cleave all of them at once.",
      ],
      callout: {
        tone: "tip",
        title: "Why keep them stacked",
        body: "Stacking Gathios, Malande, and Veras maximizes cleave damage, keeps melee uptime high, gives consistent interrupt coverage on Malande, and cuts unnecessary movement.",
      },
      execution: [
        "Keep Gathios, Malande, and Veras together.",
        "Maintain melee uptime.",
        "Cleave all three targets whenever possible.",
        "Melee stay ready to interrupt Malande's casts.",
      ],
    },
    {
      id: "veras",
      tab: "Veras",
      tag: "Control",
      title: "Veras Darkshadow",
      subtitle: "Burst on contact — controlled, not removed",
      lead: [
        "Veras creates dangerous burst damage when he connects with players. The plan is not to permanently remove him — instead he's controlled through threat management and defensive cooldowns while staying inside the cleave stack.",
      ],
      mechanics: [
        {
          name: "Vanish",
          effect: "Veras disappears and attacks a random player when he returns.",
          execution: [
            "Paladins pre-place Blessing of Protection on the player Veras targets.",
            "Off-tanks immediately establish threat and drag Veras back into the cleave stack.",
            "Minimize the time Veras spends attacking random targets.",
          ],
        },
      ],
      roles: [
        {
          title: "Paladin — Blessing of Protection",
          accent: PALADIN,
          intro: "Have BoP ready for whoever Veras jumps to after Vanish.",
          points: ["Watch for Veras's post-Vanish target and bubble them immediately."],
        },
        {
          title: "Off-tank — Recover Veras",
          accent: MAGE,
          intro: "Snap Veras back into the stack the moment he reappears.",
          points: ["Immediately establish threat and return Veras to the cleave group."],
        },
      ],
      positioning: [
        "Veras remains with Malande and Gathios.",
        "Maintain the three-boss cleave stack.",
        "Do not separate Veras unless required to recover control.",
      ],
    },
    {
      id: "execution",
      tab: "Execution",
      tag: "Kill Order",
      title: "Council Execution",
      subtitle: "How the pull runs, start to finish",
      order: {
        title: "Updated Council execution",
        steps: [
          "Mage separates and kites Zerevor around the room.",
          "Malande, Veras, and Gathios remain stacked together.",
          "Raid cleaves the stacked bosses for maximum damage.",
          "Melee maintain interrupt coverage on Malande.",
          "Paladins prepare Blessing of Protection for Veras targets after Vanish.",
          "Off-tanks immediately regain Veras threat and return him to the cleave stack.",
          "Continue controlled damage until the Council falls.",
        ],
      },
      mistakes: [
        "Letting Zerevor cast into the stacked raid.",
        "Standing in Blizzard or Flamestrike.",
        "Losing Veras to random targets after Vanish.",
        "Missing interrupts on Malande.",
        "Breaking the cleave stack unnecessarily.",
      ],
      closing:
        "The Council shares one health pool — controlled, coordinated cleave brings all four down together. Keep Zerevor isolated, keep the stack tight, and the fight stays clean.",
    },
  ],
};

/* ═══════════════════════ HIGH WARLORD NAJ'ENTUS ═══════════════════════ */

const NAJENTUS: Boss = {
  id: "najentus",
  name: "High Warlord Naj'entus",
  role: "First Boss",
  accent: "#5edfff",
  badges: [{ label: "Humanoid" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "First Boss",
      title: "Overview",
      lead: [
        "Naj'entus is the first encounter in Black Temple and an introduction to controlled raid damage and planned recovery. It's built around managing Impaling Spine and properly breaking Tidal Shield.",
        "It isn't hard because of complexity — it's lost when players panic during shield phases, fail to recover from raid damage, or handle spines incorrectly.",
      ],
      callout: {
        tone: "tip",
        title: "Consistent breaks, clean recovery",
        body: "The whole fight is a rhythm: save an Impaling Spine, break the Tidal Shield the instant it appears, then recover cleanly from the burst. Do that every time and he falls.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Impaling Spine",
          effect: "A player is pinned and takes heavy damage over time until the spine is removed.",
          execution: [
            "Do not always remove the spine immediately — save spine usage for Tidal Shield.",
            "Ensure the pinned player survives until the correct removal timing.",
            "Avoid wasting spines when a shield is approaching.",
          ],
        },
        {
          name: "Tidal Shield",
          effect: "Naj'entus shields himself and regenerates health. Breaking it causes a large raid-wide damage burst.",
          execution: [
            "Break the shield immediately when it appears using an available Impaling Spine.",
            "Prepare for the raid-wide damage afterward.",
            "Resume DPS after recovery.",
          ],
        },
        {
          name: "Needle Spine",
          effect: "Raid-wide physical damage applied throughout the encounter.",
          execution: [
            "Maintain spacing.",
            "Avoid unnecessary stacking.",
            "Healers should expect consistent raid damage.",
          ],
        },
      ],
      positioning: [
        "Tank Naj'entus in a consistent location.",
        "Keep the boss facing away from the raid.",
        "Melee remain behind the boss.",
        "Ranged and healers spread to reduce unnecessary damage.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Engage Naj'entus",
        "DPS while handling Needle Spine",
        "Save Impaling Spine for Tidal Shield",
        "Break shield",
        "Recover from raid damage",
        "Repeat until defeated",
      ],
      wipes: [
        "Breaking Tidal Shield incorrectly.",
        "Poor raid recovery after shield damage.",
        "Removing spines at poor timings.",
        "Players stacking and increasing raid damage.",
      ],
    },
  ],
};

/* ══════════════════════════════ SUPREMUS ══════════════════════════════ */

const SUPREMUS: Boss = {
  id: "supremus",
  name: "Supremus",
  role: "Second Boss",
  accent: "#ff7a3c",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Second Boss",
      title: "Overview",
      lead: [
        "Supremus is a movement-focused encounter that alternates between a traditional tank phase and a chase phase where he targets random players.",
        "It's not a DPS check — it's a positioning check. Most deaths come from ignoring movement mechanics or failing to respect the chase phase.",
      ],
      callout: {
        tone: "tip",
        title: "Positioning over parses",
        body: "Nobody outruns a bad path. Respect Molten Flame, give volcanoes a wide berth, and when Supremus fixates you, kite the outside edge — never cut through the raid.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Hateful Strike",
          effect: "Heavy physical damage against the highest-threat targets within range.",
          execution: [
            "Maintain proper tank positioning.",
            "Keep appropriate targets in melee range.",
            "Avoid unnecessary tank instability.",
          ],
        },
        {
          name: "Molten Flame",
          effect: "Fire waves travel across the room.",
          execution: [
            "Move immediately — do not greed casts.",
            "Avoid forcing movement paths into other players.",
          ],
        },
        {
          name: "Volcanoes",
          effect: "Volcanoes spawn around the room and deal heavy fire damage.",
          execution: [
            "Avoid standing near volcanoes.",
            "Keep movement clean.",
            "Do not trap yourself against terrain.",
          ],
        },
        {
          name: "Fixate",
          effect: "Supremus chases a random player during Phase Two.",
          execution: [
            "The targeted player maintains distance using the outside of the room.",
            "Avoid running through the raid.",
            "Do not panic and cut through the center.",
          ],
        },
      ],
      positioning: [
        "Phase One — boss controlled in the center, melee behind, ranged spread.",
        "Phase Two — raid uses the outside edge of the room.",
        "Avoid crossing paths during the chase.",
        "Maintain awareness of volcano locations.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Phase One — tank & DPS, avoid fire",
        "Phase Two — Supremus fixates, movement fight",
        "Return to Phase One",
        "Repeat until defeated",
      ],
      wipes: [
        "Standing in Molten Flame.",
        "Poor Phase Two movement.",
        "Running through other players during Fixate.",
        "Ignoring volcano placement.",
      ],
    },
  ],
};

/* ═══════════════════════════ SHADE OF AKAMA ═══════════════════════════ */

const SHADE_OF_AKAMA: Boss = {
  id: "shade-of-akama",
  name: "Shade of Akama",
  role: "Third Boss",
  accent: "#8b9dff",
  badges: [{ label: "Humanoid" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Third Boss",
      title: "Overview",
      lead: [
        "Shade of Akama is an add-management encounter. The boss itself is not the main threat.",
        "The raid controls incoming Ashtongue enemies while eliminating the Channelers keeping Akama suppressed. Once Akama is released, it becomes a simple burn.",
      ],
      callout: {
        tone: "tip",
        title: "Kill Channelers, control adds",
        body: "Objective first: bring down the Channelers while keeping Ashtongue adds off the healers. The moment the Shade is freed, collapse everything onto it.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Channelers",
          effect: "Channelers maintain control over Shade of Akama.",
          execution: [
            "Channelers are the primary objective.",
            "Do not allow them to remain active longer than necessary.",
            "Maintain control of incoming adds while they are alive.",
          ],
        },
        {
          name: "Ashtongue Adds",
          effect: "Multiple waves of adds spawn throughout the encounter.",
          execution: [
            "Keep adds controlled.",
            "Prevent unnecessary pressure on healers.",
            "Do not tunnel random adds instead of progressing the encounter.",
          ],
        },
        {
          name: "Shade of Akama Release",
          effect: "Once Channelers are defeated, Akama becomes active and the boss phase begins.",
          execution: [
            "Collapse damage onto Shade.",
            "Maintain control until the encounter ends.",
          ],
        },
      ],
      positioning: [
        "Keep adds away from healers.",
        "Maintain enough space for movement.",
        "Avoid allowing multiple uncontrolled adds to reach the raid.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Engage Channelers",
        "Control Ashtongue adds",
        "Eliminate Channelers",
        "Shade becomes active",
        "Burn Shade",
        "Clean up remaining enemies",
      ],
      wipes: [
        "Losing control of adds.",
        "Ignoring Channelers.",
        "Allowing too many adds to overwhelm tanks.",
        "Poor target priority.",
      ],
    },
  ],
};

/* ══════════════════════════ TERON GOREFIEND ══════════════════════════ */

const TERON: Boss = {
  id: "teron-gorefiend",
  name: "Teron Gorefiend",
  role: "Fourth Boss",
  quote: "I have use for you!",
  accent: "#a78bfa",
  badges: [{ label: "Undead" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Fourth Boss",
      title: "Overview",
      lead: [
        "Teron Gorefiend is one of the first major execution checks in Black Temple. The boss is manageable, but the encounter lives or dies on handling Shadow of Death.",
        "A single failure during the Spirit phase can create additional Constructs that quickly overwhelm the raid. The encounter is won by consistency, not raw damage.",
      ],
      callout: {
        tone: "danger",
        title: "Know your Ghost bar before pull",
        body: "Anyone who can be hit by Shadow of Death must learn the Spirit action bar in advance. Destroy Constructs before they reach the raid — and never try to DPS the boss while dead.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Shadow of Death",
          effect: "A player is marked for death and removed from combat. After dying they become a Spirit with a new action bar used to control Shadowy Constructs.",
          execution: [
            "Selected players immediately focus on the Spirit phase.",
            "Learn the Spirit abilities before progression attempts.",
            "Destroy Constructs before they reach the raid.",
            "Do not attempt to DPS the boss during this phase.",
          ],
        },
        {
          name: "Spirit Phase",
          effect: "The dead player becomes responsible for stopping Shadowy Constructs from reaching the raid.",
          execution: [
            "Locate Constructs immediately.",
            "Use available Spirit abilities efficiently.",
            "Prioritize controlling and killing Constructs.",
            "Successful Spirit phases are required for a clean kill.",
          ],
        },
        {
          name: "Incinerate",
          effect: "Targets random players with heavy Fire damage.",
          execution: [
            "Maintain raid spread.",
            "Heal targets quickly.",
            "Avoid unnecessary splash damage.",
          ],
        },
        {
          name: "Doom Blossom",
          effect: "Creates stationary flowers that deal raid damage.",
          execution: [
            "Avoid unnecessary damage.",
            "Continue normal execution while managing movement.",
          ],
        },
      ],
      positioning: [
        "Tank Teron away from the raid.",
        "Melee remain behind the boss.",
        "Ranged and healers spread.",
        "Maintain enough space for Spirit players to handle Constructs.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Engage Teron",
        "Handle normal boss mechanics",
        "Shadow of Death targets enter Spirit phase",
        "Destroy all Constructs",
        "Return to normal combat",
        "Repeat until defeated",
      ],
      wipes: [
        "Failed Spirit phases.",
        "Constructs reaching the raid.",
        "Poor raid spacing.",
        "Players ignoring Shadow of Death preparation.",
        "Losing control during Doom Blossom.",
      ],
    },
  ],
};

/* ══════════════════════════ GURTOGG BLOODBOIL ══════════════════════════ */

const GURTOGG: Boss = {
  id: "gurtogg-bloodboil",
  name: "Gurtogg Bloodboil",
  role: "Fifth Boss",
  accent: "#ff5e6c",
  badges: [{ label: "Humanoid" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Fifth Boss",
      title: "Overview",
      lead: [
        "Gurtogg Bloodboil is a sustained damage encounter built around controlled Bloodboil rotations and proper handling of Fel Rage.",
        "The fight becomes increasingly dangerous as it continues. Success depends on clean rotations and avoiding unnecessary healer strain.",
      ],
      callout: {
        tone: "tip",
        title: "Clean rotations carry the fight",
        body: "Bloodboil punishes chaos. Rotate your assigned groups in a planned order, never stray into another group's spot, and keep the Fel Rage target alive with pre-planned cooldowns.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Bloodboil",
          effect: "Applies a stacking damage-over-time effect to the five closest players.",
          execution: [
            "Assigned Bloodboil groups rotate in a planned order.",
            "Do not accidentally enter another group's position.",
            "Maintain consistency throughout the fight.",
          ],
        },
        {
          name: "Fel Rage",
          effect: "Gurtogg fixates a random player, greatly increasing their health and making them his primary target.",
          execution: [
            "The targeted player must survive the assault.",
            "Healers immediately prepare for increased damage.",
            "Use personal cooldowns when appropriate.",
            "Others avoid unnecessary mechanics while Fel Rage is active.",
          ],
        },
        {
          name: "Acidic Wound",
          effect: "Reduces armor on the current tank.",
          execution: [
            "Tanks manage stacks carefully.",
            "Avoid allowing excessive stacks before swaps.",
          ],
        },
        {
          name: "Arcing Smash",
          effect: "Frontal physical damage attack.",
          execution: [
            "Keep Gurtogg facing away from the raid.",
            "Avoid standing in front of the boss.",
          ],
        },
      ],
      positioning: [
        "Tank Gurtogg in a controlled location.",
        "Melee remain behind the boss.",
        "Bloodboil groups maintain assigned locations.",
        "Ranged keep enough separation to avoid accidental overlap.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish boss positioning",
        "Rotate Bloodboil groups",
        "Manage tank swaps",
        "Handle Fel Rage targets",
        "Repeat until defeated",
      ],
      wipes: [
        "Incorrect Bloodboil rotations.",
        "Players entering the wrong group.",
        "Poor Fel Rage healing.",
        "Excessive Acidic Wound stacks.",
        "Standing in front of the boss.",
      ],
    },
  ],
};

/* ══════════════════════════ RELIQUARY OF SOULS ══════════════════════════ */

const RELIQUARY: Boss = {
  id: "reliquary-of-souls",
  name: "Reliquary of Souls",
  role: "Sixth Boss",
  accent: "#ff7ad4",
  badges: [{ label: "Elemental" }, { label: "No Demonslaying Elixir" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Sixth Boss",
      title: "Overview",
      lead: [
        "Reliquary of Souls is a three-phase encounter where each phase introduces a different threat and tests a different part of the raid.",
      ],
      callout: {
        tone: "tip",
        title: "Three phases, three tests",
        body: "Phase One is tank survival. Phase Two is interrupts and damage control. Phase Three is the final burn and resource management. Discipline through all three wins it.",
      },
    },
    {
      id: "suffering",
      tab: "Suffering",
      tag: "Phase 1",
      title: "Phase One",
      subtitle: "Essence of Suffering",
      lead: [
        "The Essence of Suffering removes normal tanking tools and creates a heavy physical damage check. The raid relies on mitigation and cooldown management.",
      ],
      mechanics: [
        {
          name: "Aura of Suffering",
          effect: "Reduces defensive capabilities and healing effectiveness.",
          execution: [
            "Tanks rely on mitigation.",
            "Use cooldowns correctly.",
            "Healers prepare for heavy incoming damage.",
          ],
        },
      ],
      positioning: [
        "Keep the boss controlled.",
        "Melee remain behind.",
        "Avoid unnecessary movement.",
      ],
    },
    {
      id: "desire",
      tab: "Desire",
      tag: "Phase 2",
      title: "Phase Two",
      subtitle: "Essence of Desire",
      lead: ["This phase is primarily an interrupt and positioning check."],
      callout: {
        tone: "danger",
        title: "Interrupt Deaden on sight",
        body: "Every missed Deaden dramatically increases the encounter length. Keep interrupt rotations tight and watch for reflected damage from Aura of Desire.",
      },
      mechanics: [
        {
          name: "Deaden",
          effect: "Greatly reduces incoming damage to the Essence.",
          execution: [
            "Interrupt immediately.",
            "Missing casts dramatically increases encounter length.",
          ],
        },
        {
          name: "Spirit Shock",
          effect: "Heavy Shadow damage ability.",
          execution: ["Interrupt whenever possible."],
        },
        {
          name: "Aura of Desire",
          effect: "Reflects damage back to attackers.",
          execution: [
            "Maintain controlled DPS.",
            "Avoid unnecessary deaths from reflected damage.",
          ],
        },
      ],
      positioning: [
        "Maintain spacing.",
        "Continue clean interrupts.",
        "Avoid unnecessary damage.",
      ],
    },
    {
      id: "anger",
      tab: "Anger",
      tag: "Phase 3",
      title: "Phase Three",
      subtitle: "Essence of Anger",
      lead: [
        "The final phase is a controlled burn. Defeat the Essence before increasing damage and resource pressure overwhelm the group.",
      ],
      mechanics: [
        {
          name: "Soul Scream",
          effect: "Heavy frontal Shadow damage and mana drain.",
          execution: [
            "Face the boss away from the raid.",
            "Maintain proper tank positioning.",
          ],
        },
        {
          name: "Seethe",
          effect: "Increasing damage output over time.",
          execution: ["Finish the encounter before damage becomes unmanageable."],
        },
      ],
      positioning: [
        "Keep boss facing away.",
        "Maintain raid spread.",
        "Avoid unnecessary movement.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Essence of Suffering",
        "Clear transition adds",
        "Essence of Desire",
        "Clear transition adds",
        "Essence of Anger",
        "Final burn",
      ],
      wipes: [
        "Failed interrupts on Essence of Desire.",
        "Poor Phase One tank survival.",
        "Excessive reflected damage.",
        "Slow transition cleanup.",
        "Running out of resources in Phase Three.",
      ],
    },
  ],
};

/* ══════════════════════════ MOTHER SHAHRAZ ══════════════════════════ */

const SHAHRAZ: Boss = {
  id: "mother-shahraz",
  name: "Mother Shahraz",
  role: "Seventh Boss",
  accent: "#e08bff",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Seventh Boss",
      title: "Overview",
      lead: [
        "Mother Shahraz is a positioning and movement encounter. The primary mechanic is Fatal Attraction.",
        "For this strategy the raid intentionally ignores the traditional Shadow Resistance setup and handles Fatal Attraction through movement using Rocket Boots.",
      ],
      callout: {
        tone: "danger",
        title: "Everyone needs Rocket Boots",
        body: "Every player must have functional Rocket Boots prepared before this encounter. Failing to immediately separate during Fatal Attraction is the primary cause of deaths.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Positioning",
      mechanics: [
        {
          name: "Fatal Attraction",
          effect: "Three players are teleported together and linked. Players remaining near each other take increasing Shadow damage.",
          execution: [
            "Immediately activate Rocket Boots.",
            "Spread away from the other linked players.",
            "Do not run toward the raid.",
            "Return to your position after the effect ends.",
            "Every player must have functional Rocket Boots prepared.",
          ],
        },
        {
          name: "Saber Lash",
          effect: "Heavy physical damage split among nearby targets.",
          execution: [
            "Keep assigned targets stacked for Saber Lash.",
            "Do not allow the boss to hit only one target.",
          ],
        },
        {
          name: "Beam Abilities",
          effect: "Random players are targeted by magical beams.",
          execution: [
            "Maintain positioning.",
            "Healers prepare for additional damage.",
          ],
        },
      ],
      positioning: [
        "Tanks remain stacked appropriately for Saber Lash.",
        "Melee stay behind the boss.",
        "Ranged spread around the room.",
        "Maintain enough space for Fatal Attraction movement.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Establish positioning",
        "Maintain Saber Lash setup",
        "Fatal Attraction occurs",
        "Rocket Boots + separate immediately",
        "Return to position",
        "Repeat until defeated",
      ],
      wipes: [
        "Players not having Rocket Boots prepared.",
        "Slow reaction to Fatal Attraction.",
        "Running linked players through the raid.",
        "Poor Saber Lash positioning.",
        "Excessive unnecessary movement.",
      ],
    },
  ],
};

/* ══════════════════════════════ EXPORTS ══════════════════════════════ */

// Every boss guide, in Black Temple kill order. Order drives the boss rail
// and the default selection (first entry).
export const BT_BOSSES: Boss[] = [
  NAJENTUS,
  SUPREMUS,
  SHADE_OF_AKAMA,
  TERON,
  GURTOGG,
  RELIQUARY,
  SHAHRAZ,
  ILLIDARI_COUNCIL,
  ILLIDAN,
];
