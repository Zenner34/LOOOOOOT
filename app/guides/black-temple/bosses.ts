/* Black Temple boss strategy data. Rendered by app/guides/BossGuide.tsx
   via the shared RaidGuide selector. Images live in
   public/guides/black-temple/. */

import type { Boss } from "../types";

/* Class-flavoured accents reused inside role callouts. */
const WARLOCK = "#b794f6";
const MAGE = "#40C7EB";
const PALADIN = "#F58CBA";

const IMG = "/guides/black-temple";

/* ═══════════════════════ HIGH WARLORD NAJ'ENTUS ═══════════════════════ */

const NAJENTUS: Boss = {
  id: "najentus",
  name: "High Warlord Naj'entus",
  role: "First Boss",
  accent: "#5edfff",
  badges: [{ label: "Demon" }, { label: "Demonslaying Elixir ✓", tone: "accent" }],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "First Boss",
      title: "Overview",
      image: `${IMG}/najentus.png`,
      imageCaption: "Naj'entus — raid spread & positioning",
      lead: [
        "Naj'entus is primarily a healer and execution check. The fight revolves around removing Tidal Shield quickly while keeping a wide spread to reduce raid damage.",
        "The faster the shield comes down, the easier the encounter becomes.",
      ],
      callout: {
        tone: "tip",
        title: "Save the Spine for the Shield",
        body: "Loot every Impaling Spine and hold it — the assigned player only throws one to break Tidal Shield. Never panic-throw a spine early, or you'll have none when the shield goes up.",
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
          effect: "A random player is impaled, taking heavy Physical damage.",
          execution: [
            "Heal the target immediately.",
            "Loot the Spine immediately.",
            "The assigned player keeps the Spine until Tidal Shield — never throw it early.",
          ],
        },
        {
          name: "Tidal Shield",
          effect: "Naj'entus becomes immune and rapidly heals.",
          execution: [
            "Wait until the raid is healthy.",
            "Assigned player throws the Spine to break the shield immediately.",
            "Heroism / Bloodlust if assigned.",
            "Resume full DPS instantly.",
          ],
        },
        {
          name: "Needle Spine",
          effect: "Physical damage to several nearby players.",
          execution: [
            "Maintain spread — do not stack.",
            "Healers prepare for raid damage.",
          ],
        },
        {
          name: "Enrage",
          effect: "Hard enrage after eight minutes.",
          execution: ["Maintain strong DPS uptime to beat the timer."],
        },
      ],
      positioning: [
        "Tank Naj'entus near the center, faced away from the raid.",
        "Spread evenly around the boss within healing range.",
        "Avoid stacking whenever possible.",
        "Healers expect constant raid-wide damage and shield breaks.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Spread around the boss",
        "Heal Impaling Spine targets",
        "Loot every Spine",
        "Continue DPS",
        "Wait for Tidal Shield",
        "Break shield immediately",
        "Resume DPS",
      ],
      wipes: [
        "Throwing a Spine early.",
        "No Spine available for Tidal Shield.",
        "Slow shield break.",
        "Poor raid spread.",
        "Deaths before the shield break.",
        "Low DPS causing enrage.",
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
      image: `${IMG}/supremus.png`,
      imageCaption: "Supremus — phase positioning",
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
      image: `${IMG}/shade-of-akama.png`,
      imageCaption: "Shade of Akama — add control layout",
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
      image: `${IMG}/teron-gorefiend.png`,
      imageCaption: "Teron Gorefiend — Spirit & Construct handling",
      lead: [
        "Teron Gorefiend is a personal-responsibility encounter. The boss is mechanically simple, but players chosen for Shadow of Death must control their Spirit to keep the raid alive.",
        "One failed Spirit phase can quickly wipe the raid. Maintain clean positioning, maximize uptime, and execute every Shadow of Death correctly.",
      ],
      callout: {
        tone: "danger",
        title: "Know your Spirit controls before pull",
        body: "Everyone must understand the Vengeful Spirit action bar in advance. When you die to Shadow of Death, your only job is killing Shadowy Constructs before they reach the raid — never DPS the boss while dead.",
      },
    },
    {
      id: "strategy",
      tab: "Strategy",
      tag: "Strategy",
      title: "Mechanics & Spirit Phase",
      mechanics: [
        {
          name: "Shadow of Death",
          effect: "Every 30 seconds Teron marks four random non-tank players. After 55 seconds they die and become a Vengeful Spirit.",
          execution: [
            "If selected, continue normal DPS until death.",
            "Prepare to immediately control your Spirit — don't panic.",
            "Execute Spirit mechanics until your timer expires.",
          ],
        },
        {
          name: "Vengeful Spirit",
          effect: "On death you become a Spirit. Abilities: Spirit Strike (primary melee), Spirit Chains (root), Spirit Lance (ranged), Spirit Volley (AoE).",
          execution: [
            "Root incoming Constructs first (Spirit Chains).",
            "Kill the nearest Construct; use Volley when several are grouped.",
            "Keep moving while attacking — never let Constructs stack or reach the raid.",
          ],
        },
        {
          name: "Shadowy Constructs",
          effect: "Spawn only for Vengeful Spirits. If they reach the raid they rapidly kill players.",
          execution: [
            "Root first, then kill immediately.",
            "Continue moving while attacking.",
            "Never allow Constructs to stack together.",
          ],
        },
        {
          name: "Incinerate",
          effect: "Random Fire damage on a raid member.",
          execution: ["Healers react quickly.", "No special movement required."],
        },
        {
          name: "Crushing Shadows",
          effect: "Shadow damage debuff applied to random players.",
          execution: ["Healers monitor affected players.", "Continue normal execution."],
        },
      ],
      positioning: [
        "Tank Teron near the center, faced away from the raid.",
        "Melee stack behind the boss for maximum uptime.",
        "Ranged spread loosely within healer range.",
        "Raid: do not chase Spirit players — keep DPSing the boss.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Tank establishes Teron",
        "Raid spreads into position",
        "Maximize uptime",
        "Shadow of Death targets play until death",
        "Dead players control their Spirit",
        "Kill every Construct",
        "Resume boss damage",
      ],
      wipes: [
        "Players unfamiliar with Spirit controls.",
        "Constructs reaching the raid.",
        "Spirit players panicking.",
        "Standing in front of the boss.",
        "Poor healer reaction to Incinerate.",
        "Losing focus after multiple Spirit phases.",
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
      image: `${IMG}/gurtogg-bloodboil.png`,
      imageCaption: "Gurtogg — Bloodboil groups & Fel Rage",
      lead: [
        "Gurtogg Bloodboil is one of the first major progression checks in Black Temple. It's won through clean Bloodboil rotations, proper tank swaps, and disciplined healing during Fel Rage.",
        "This is primarily a healing and execution fight, not a DPS check. Consistent positioning and communication make for a much smoother kill.",
      ],
      callout: {
        tone: "tip",
        title: "Assign everything before the pull",
        body: "Three Bloodboil soak groups of 5 (four if comp allows), three tanks for progression, a tank-swap order, and healer coverage for each tank and the Fel Rage target. Heroism/Bloodlust on the first Fel Rage.",
      },
    },
    {
      id: "phase-1",
      tab: "Phase 1",
      tag: "Phase 1",
      title: "Phase One",
      subtitle: "~60 seconds — repeats after every Fel Rage",
      mechanics: [
        {
          name: "Bloodboil",
          effect: "Every 10–12s, applies a stacking, quickly-lethal DoT to the five players furthest from Gurtogg.",
          execution: [
            "Assigned group moves to the soak position.",
            "After receiving Bloodboil, immediately return to the raid.",
            "The next group rotates in.",
            "Never become one of the five furthest players unless assigned.",
          ],
        },
        {
          name: "Acidic Wound",
          effect: "Heavy armor reduction and bleed applied to the active tank.",
          execution: [
            "Rotate tanks around 8–10 stacks (healer comfort).",
            "Let the previous tank's stacks expire before taunting again.",
            "Prot Paladins may Divine Shield to drop stacks if assigned.",
          ],
        },
        {
          name: "Bewildering Strike",
          effect: "Significantly reduces the current tank's threat.",
          execution: [
            "Off-tanks stay high on threat throughout Phase One.",
            "Be prepared for immediate threat changes.",
          ],
        },
        {
          name: "Eject",
          effect: "Knocks back the active tank and reduces their threat.",
          execution: [
            "Tanks maintain strong threat.",
            "Off-tanks stay second and third on threat.",
            "Expect boss movement immediately after Eject.",
          ],
        },
        {
          name: "Arcing Smash",
          effect: "Heavy frontal attack that reduces healing received.",
          execution: [
            "Keep Gurtogg faced away from the raid.",
            "Only the active tank should ever be struck.",
          ],
        },
        {
          name: "Fel Acid Breath",
          effect: "Heavy frontal Nature damage and a damage-over-time effect.",
          execution: [
            "Only the active tank should be hit.",
            "If targeted as melee, move to the opposite side and return once safe.",
            "Rogues can Cloak of Shadows to remove the debuff.",
          ],
        },
      ],
      positioning: [
        "Gurtogg near the center, faced away from the raid.",
        "Melee stack one side; swap sides only to dodge Fel Acid Breath.",
        "Ranged hold assigned Bloodboil positions, rotating only when active.",
        "Healers cover assigned tanks and the soaking group.",
      ],
    },
    {
      id: "fel-rage",
      tab: "Fel Rage",
      tag: "Phase 2",
      title: "Fel Rage",
      subtitle: "After the fifth Bloodboil — 30 seconds, threat ignored",
      lead: [
        "Gurtogg fixates a random player and ignores threat. This is the highest healing requirement of the encounter.",
      ],
      mechanics: [
        {
          name: "Fel Geyser",
          effect: "Fel Rage opens with Fel Geyser — Nature damage and a knockback to nearby players.",
          execution: [
            "Spread before the fifth Bloodboil.",
            "Minimize splash damage.",
            "Return to position once the knockback resolves.",
          ],
        },
        {
          name: "Fel Rage",
          effect: "Gurtogg fixates a random player for 30 seconds, greatly boosting their health.",
          execution: [
            "The target moves to the Main Tank's previous position and stays predictable.",
            "All healers except one tank-healer swap to the target.",
            "Use Healthstones, potions, and personal defensives proactively.",
            "Hunters, Rogues, and Warlocks pop survival cooldowns if targeted.",
          ],
        },
        {
          name: "Insignificance",
          effect: "All other players lose threat during Fel Rage.",
          execution: [
            "Tanks contribute DPS.",
            "DPS use offensive cooldowns; Heroism on the first Fel Rage.",
            "Threat is irrelevant until Phase One resumes.",
          ],
        },
      ],
      positioning: [
        "Fel Rage target → Main Tank position, predictable for healers.",
        "Raid spreads around the target to avoid Fel Geyser splash.",
        "Healers commit almost all healing to the target until the phase ends.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Phase One positioning",
        "Bloodboil rotations",
        "Rotate tanks on Acidic Wound",
        "Hold threat through Bewildering Strike & Eject",
        "Spread before the 5th Bloodboil",
        "Fel Rage → target to MT spot",
        "Raid burns cooldowns, keep target alive",
        "Resume Phase One",
      ],
      wipes: [
        "Incorrect Bloodboil rotations.",
        "Players accidentally soaking Bloodboil.",
        "Tanks too low on threat after Bewildering Strike or Eject.",
        "Poor Acidic Wound tank swaps.",
        "Fel Rage target dying.",
        "Raid stacked for Fel Geyser.",
        "Standing in front of Gurtogg.",
        "Healers failing to swap quickly during Fel Rage.",
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
      image: `${IMG}/reliquary-of-souls.png`,
      imageCaption: "Reliquary of Souls — three-Essence layout",
      lead: [
        "One of the most mechanically unique fights in Black Temple: three distinct Essences, each demanding a different approach, with clean transitions in between.",
        "Phase One tests the tanks. Phase Two is an interrupt and healing check. Phase Three is a threat and DPS race. Most wipes happen in Phase Two on missed interrupts or poor Deaden / Rune Shield handling.",
      ],
      callout: {
        tone: "tip",
        title: "Phase Two decides it",
        body: "Interrupt discipline on Spirit Shock, instant Deaden removal, and immediate Rune Shield dispels win the encounter. Everything else is manageable.",
      },
    },
    {
      id: "suffering",
      tab: "Suffering",
      tag: "Phase 1",
      title: "Phase One",
      subtitle: "Essence of Suffering — healing is disabled",
      lead: [
        "Aura of Suffering disables healing. Tanks survive on avoidance and cooldowns, not throughput. After the opening moments threat drops off and DPS can go all out.",
      ],
      mechanics: [
        {
          name: "Aura of Suffering",
          effect: "Reduces healing received by 100%, removes armor, and greatly reduces Defense.",
          execution: [
            "Healers contribute damage instead of ineffective healing.",
            "Priests keep Power Word: Shield on the active tank.",
            "Tanks rely on avoidance and cooldowns rather than heals.",
          ],
        },
        {
          name: "Fixate",
          effect: "The closest player becomes the active target for several seconds.",
          execution: [
            "Tanks perform controlled swaps by becoming the closest player.",
            "Never run through the boss.",
            "DPS should never be the closest player.",
          ],
        },
        {
          name: "Soul Drain",
          effect: "A Magic debuff that quickly kills players if left active.",
          execution: [
            "Dispel immediately.",
            "Priests can Mass Dispel.",
            "Paladins assist with Cleanse when available.",
          ],
        },
        {
          name: "Enrage",
          effect: "Heavy increased melee damage.",
          execution: [
            "An assigned Rogue with Evasion can temporarily soak.",
            "Otherwise tanks use defensive cooldowns.",
          ],
        },
      ],
      positioning: [
        "Main tank begins closest to the boss.",
        "Melee attack from maximum melee range.",
        "The entire raid stacks behind the boss.",
        "Nobody moves in front unless performing a planned tank swap.",
      ],
    },
    {
      id: "desire",
      tab: "Desire",
      tag: "Phase 2",
      title: "Phase Two",
      subtitle: "Essence of Desire — the hardest phase",
      lead: [
        "Between Essences, Enslaved Souls spawn — stack and kill them; Soul Release restores health and mana. Hunters pre-cast Misdirection and don't crowd the Reliquary until the tank is ready.",
        "Success is almost entirely interrupt discipline, Rune Shield handling, and controlling Deaden. Every missed interrupt sharply raises the chance of a wipe.",
      ],
      callout: {
        tone: "danger",
        title: "Interrupts win or lose this",
        body: "Assign a strict Spirit Shock interrupt rotation with no overlaps. Remove Deaden instantly (Spell Reflect when possible). Spellsteal/dispel Rune Shield on sight. Never DPS into either.",
      },
      mechanics: [
        {
          name: "Aura of Desire",
          effect: "Players take damage equal to a portion of the damage they deal.",
          execution: [
            "Monitor your health constantly.",
            "Warlocks are cautious with Life Tap.",
            "Shadow Priests never Shadow Word: Death while Deaden is active.",
          ],
        },
        {
          name: "Spirit Shock",
          effect: "Heavy Shadow damage and an interrupt lockout.",
          execution: [
            "Assign a dedicated interrupt rotation.",
            "Never overlap interrupts.",
            "Missing Spirit Shock casts is the fastest way to wipe.",
          ],
        },
        {
          name: "Deaden",
          effect: "Greatly reduces incoming damage to the boss.",
          execution: [
            "Warriors Spell Reflect when possible.",
            "If not reflected, remove it immediately.",
            "Never continue DPS into Deaden.",
          ],
        },
        {
          name: "Rune Shield",
          effect: "Absorbs damage while healing the boss.",
          execution: [
            "Mages Spellsteal immediately.",
            "Otherwise Priests and Shamans remove it with Dispel Magic or Purge as assigned.",
            "Do not continue DPS until Rune Shield is removed.",
          ],
        },
        {
          name: "Cast Speed Reduction",
          effect: "Slowing the boss's casts widens the Spirit Shock interrupt window.",
          execution: [
            "Maintain Curse of Tongues or Mind-numbing Poison throughout the phase.",
            "Slower casts give a much safer interrupt window.",
          ],
        },
      ],
      positioning: [
        "Tank keeps the boss stationary.",
        "Raid remains stacked behind the boss.",
        "Interrupters stay within range at all times.",
        "Avoid unnecessary movement.",
      ],
    },
    {
      id: "anger",
      tab: "Anger",
      tag: "Phase 3",
      title: "Phase Three",
      subtitle: "Essence of Anger — controlled burn",
      lead: [
        "Raid damage ramps as Aura of Anger builds — a race between healer mana and boss health. Commit Bloodlust/Heroism and remaining offensive cooldowns here.",
      ],
      mechanics: [
        {
          name: "Aura of Anger",
          effect: "Increasing raid-wide Shadow damage over time.",
          execution: [
            "Finish the encounter quickly.",
            "Healers expect escalating raid damage throughout the phase.",
          ],
        },
        {
          name: "Soul Scream",
          effect: "Heavy frontal Shadow damage and mana burn.",
          execution: [
            "Tank faces the boss away from the raid.",
            "Never stand in front of the boss.",
            "Tanks spend Rage frequently to reduce incoming damage.",
          ],
        },
        {
          name: "Spite",
          effect: "Marks a player before dealing heavy burst damage.",
          execution: [
            "Healers quickly top the player.",
            "Use personal defensives and Healthstones when necessary.",
          ],
        },
        {
          name: "Threat",
          effect: "Threat matters again in this phase.",
          execution: [
            "Watch threat meters carefully.",
            "Pulling aggro during this phase frequently wipes the raid.",
          ],
        },
      ],
      positioning: [
        "Tank keeps the boss stationary.",
        "Melee remain behind the boss.",
        "Ranged spread within healer range.",
        "Nobody stands in front except the active tank.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Defeat Essence of Suffering",
        "Kill Enslaved Souls (interlude)",
        "Recover health & mana",
        "Defeat Essence of Desire with perfect interrupts",
        "Second interlude recovery",
        "Defeat Essence of Anger",
      ],
      wipes: [
        "Missed Spirit Shock interrupts.",
        "Slow removal of Rune Shield.",
        "DPS attacking through Deaden.",
        "Failure to maintain Curse of Tongues or Mind-numbing Poison.",
        "Tanks mishandling Fixate in Phase One.",
        "Standing in front of Essence of Anger.",
        "Players pulling threat in Phase Three.",
        "Slow recovery during intermissions.",
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
      image: `${IMG}/mother-shahraz.png`,
      imageCaption: "Mother Shahraz — positioning (camera angle may be scuffed)",
      lead: [
        "One of the final Black Temple encounters and a major execution check. Rather than relying on Shadow Resistance gear, our strategy maximizes raid DPS and uses Rocket Boots to handle Fatal Attraction.",
        "It's won through disciplined movement, positioning, and quick reactions — not raw healing or DPS.",
      ],
      callout: {
        tone: "danger",
        title: "Everyone needs Rocket Boots",
        body: "Rocket Boots are mandatory and replace the Shadow Resistance setup. Bring Healthstones, and save personal defensives for Fatal Attraction.",
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
          effect: "Three random players are teleported together and linked, taking heavy Shadow damage based on their proximity.",
          execution: [
            "Immediately activate Rocket Boots.",
            "Sprint directly away from the other two affected players.",
            "Keep separating until all three are safely spread.",
            "Return to your assigned position once the debuff expires.",
            "Use Healthstones or personal defensives if necessary.",
          ],
        },
        {
          name: "Sinful Beams",
          effect: "Shahraz cycles beams with different raid-wide effects — Sinful (Shadow), Vile (Poison DoT), Wicked (Arcane + mana burn), Sinister (Fire DoT).",
          execution: [
            "Healers react quickly to affected players.",
            "Continue normal positioning; avoid unnecessary movement.",
            "Personal defensives during dangerous beam overlaps.",
          ],
        },
        {
          name: "Saber Lash",
          effect: "Massive Physical damage split between players in front of the boss.",
          execution: [
            "Maintain the assigned tank stack at all times.",
            "Tanks remain tightly grouped.",
            "Never allow Saber Lash to strike a single player.",
            "DPS and healers never stand in front of the boss.",
          ],
        },
        {
          name: "Prismatic Auras",
          effect: "Shahraz cycles through different magical resistance auras throughout the fight.",
          execution: [
            "Continue normal execution — no positioning changes.",
            "Maintain maximum DPS uptime regardless of the active aura.",
          ],
        },
      ],
      positioning: [
        "Position Mother Shahraz in front of the right statue. Melee get under the extended hand to reduce knock-up.",
        "Face her away from the raid.",
        "Healers ready for large bursts of raid damage after Fatal Attraction.",
        "Ranged stack underneath the closed exitway leading to Council and tuck in the back corner.",
      ],
    },
    {
      id: "flow",
      tab: "Flow & Wipes",
      tag: "Reference",
      title: "Encounter Flow & Wipes",
      flow: [
        "Tanks establish Shahraz at the right statue",
        "Raid sets normal positioning",
        "Handle Saber Lash with the tank group",
        "Steady DPS, minimal movement",
        "Fatal Attraction → Rocket Boot away",
        "Heal through beams",
        "Return to position",
      ],
      wipes: [
        "Delayed Rocket Boot usage.",
        "Players remaining stacked after Fatal Attraction.",
        "Tank group failing Saber Lash positioning.",
        "Standing in front of the boss.",
        "Slow recovery after Fatal Attraction.",
        "Healers falling behind following beam combinations.",
        "Players panicking instead of moving directly away.",
      ],
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
    { label: "No Demonslaying Elixir" },
  ],
  sections: [
    {
      id: "overview",
      tab: "Overview",
      tag: "Week 1 · Safer Strat",
      title: "The Council",
      subtitle: "Week 1 — control over cleave",
      image: `${IMG}/illidari-council.png`,
      imageCaption: "Week 1 assignments — Malande split & Rogue-locked, Gathios/Veras stacked, Zerevor kited",
      lead: [
        "Four bosses share a single health pool. For our first clear we're intentionally running the safer Council strategy — NOT the full cleave.",
        "Gathios and Veras stay stacked with physical DPS on Veras, Malande is separated and locked down by a dedicated Rogue, and a Mage kites Zerevor away from everyone.",
      ],
      callout: {
        tone: "tip",
        title: "Week 1 goal: a clean first kill",
        body: "Don't chase optimal cleave. Keep Malande from healing the Council, keep the Mage alive on Zerevor, and burn Veras whenever he's up. Once it's on farm we move to the Gathios + Veras + Malande cleave with only Zerevor split.",
      },
    },
    {
      id: "setup",
      tab: "Setup",
      tag: "Positioning",
      title: "Positioning & Priority",
      lead: [
        "Three separate problems: the Gathios/Veras stack, a locked-down Malande, and a kited Zerevor. Get the setup right and the fight runs itself.",
      ],
      dps: {
        title: "Physical DPS target priority",
        intro: "Malande is not cleaved in Week 1, and Zerevor is the Mage's job — physical DPS lives on the Gathios/Veras stack.",
        steps: [
          "Veras — his low armor melts to physical damage.",
          "Gathios when Veras Vanishes.",
          "Veras again when he returns.",
        ],
      },
      positioning: [
        "Gathios + Veras stacked together; melee can cleave between the two.",
        "Malande kept separated — dedicated tank + dedicated Rogue full time.",
        "Never bring Malande into the Gathios/Veras group.",
        "Zerevor separated; a Mage kites him around the room.",
      ],
    },
    {
      id: "malande",
      tab: "Malande",
      tag: "Lockdown",
      title: "Malande",
      subtitle: "Separated and silenced the entire fight",
      lead: [
        "Malande stays split from Gathios and Veras for the whole encounter. One Rogue is glued to her full time — the entire point is preventing her casts, especially her heals.",
      ],
      roles: [
        {
          title: "Rogue — Malande duty",
          accent: "#FFF569",
          intro: "One Rogue is assigned to Malande full time and does not leave to chase DPS unless absolutely necessary.",
          points: [
            "Maintain Mind-Numbing Poison at all times — slower casts give more time to react and interrupt.",
            "Use PvP gloves for extra Kick coverage.",
            "Stay glued to Malande for the entire fight.",
            "If Kick is down, use a backup interrupt — never let Divine Wrath through just because Kick is on cooldown.",
          ],
        },
      ],
      mechanics: [
        {
          name: "Divine Wrath",
          effect: "Malande's most dangerous cast.",
          execution: ["Highest interrupt priority — never allow it to cast freely."],
        },
        {
          name: "Circle of Healing",
          effect: "Heals the Council.",
          execution: ["Second priority — do not let Malande repeatedly heal the Council."],
        },
        {
          name: "Empowered Smite",
          effect: "Damage cast.",
          execution: ["Lower priority, but interrupt whenever possible."],
        },
        {
          name: "Blessing of Spell Warding",
          effect: "Gathios can shield Malande — physical interrupts stop working.",
          execution: [
            "Shaman / other magical interrupts must cover her while shielded.",
            "Return to normal Rogue interrupt duty the moment it expires.",
          ],
        },
        {
          name: "Reflective Shield",
          effect: "Reflects damage back to attackers.",
          execution: [
            "Stop damaging Malande; keep monitoring her casts.",
            "Resume DPS when it expires — the Rogue stays on her regardless.",
          ],
        },
      ],
      positioning: [
        "Malande stays separated from Gathios and Veras.",
        "Her tank keeps her in a stable position.",
        "The Rogue remains directly on her.",
        "Do not cleave Malande during Week 1.",
      ],
      callout: {
        tone: "danger",
        title: "Objective",
        body: "Keep Malande controlled and prevent her from healing the Council. Everything else on her is secondary to shutting down Divine Wrath and Circle of Healing.",
      },
    },
    {
      id: "gathios-veras",
      tab: "Gathios + Veras",
      tag: "The Stack",
      title: "Gathios + Veras",
      subtitle: "Stacked together — burn Veras",
      lead: [
        "Gathios and Veras stay together, tanked away from Malande. Veras is the primary physical target; when he Vanishes, swap to Gathios and come back the moment he returns.",
      ],
      mechanics: [
        {
          name: "Vanish (Veras)",
          effect: "Veras disappears and reappears on a random player.",
          execution: [
            "On Vanish → melee immediately swap to Gathios and handle Deadly Poison.",
            "On return → the Off Tank snaps threat and drags Veras back into position.",
            "Melee immediately return to Veras.",
          ],
        },
        {
          name: "Deadly Poison (Veras)",
          effect: "Stacking poison on players, followed by an Envenom burst.",
          execution: [
            "Healers immediately prioritize affected players.",
            "Use Healthstones / defensives if needed — don't sit low into the Envenom burst.",
          ],
        },
        {
          name: "Consecration (Gathios)",
          effect: "Ground fire beneath Gathios.",
          execution: ["Move Gathios out and keep the raid out.", "Maintain Gathios/Veras positioning."],
        },
        {
          name: "Judgement (Gathios)",
          effect: "Heavy tank damage.",
          execution: ["Prepare defensive cooldowns for the tank."],
        },
        {
          name: "Blessing of Spell Warding (Gathios)",
          effect: "Gathios can shield a Council member from magic.",
          execution: [
            "Don't waste magical attacks into the protected target — hit an available one.",
            "If Malande gets it, lean on Shaman / other interrupts.",
          ],
        },
        {
          name: "Chromatic Resistance Aura (Gathios)",
          effect: "Gathios can buff Council resistance.",
          execution: [
            "Keep Malande outside the aura whenever positioning allows.",
            "Casters keep Curse of the Elements up on Gathios/Veras.",
          ],
        },
      ],
      positioning: [
        "Tank Gathios and Veras together, away from Malande.",
        "Physical DPS focuses Veras; melee cleave between the two.",
        "Off Tank (Feral) handles Veras re-taunt and Rogue positioning on reset.",
      ],
    },
    {
      id: "zerevor",
      tab: "Zerevor",
      tag: "Kite",
      title: "High Nethermancer Zerevor",
      subtitle: "Kited by a Mage, away from everyone",
      lead: [
        "The Mage owns Zerevor, kept completely separate from the Council. Survival comes first — his DPS is secondary.",
      ],
      roles: [
        {
          title: "Mage — Zerevor kite",
          accent: MAGE,
          intro: "The Mage isolates Zerevor and prioritizes staying alive above all.",
          points: [
            "Spellsteal Dampen Magic and keep it maintained.",
            "Establish threat, then kite Zerevor around the room.",
            "Avoid Arcane Bolt, Flamestrike, and Blizzard.",
            "Survival is the priority — DPS is secondary.",
          ],
        },
        {
          title: "Healers — cover the kiter",
          accent: "#5edfff",
          intro: "The Mage is on his own out there.",
          points: ["Toss HoTs on the mage kiter so he can focus on Zerevor's casts."],
        },
      ],
      mechanics: [
        {
          name: "Flamestrike",
          effect: "Large Fire area.",
          execution: ["Kite Zerevor out of it immediately."],
        },
        {
          name: "Blizzard",
          effect: "Large Frost zone.",
          execution: ["Keep moving — never let it sit on the kite path."],
        },
        {
          name: "Arcane Bolt",
          effect: "Direct nuke on the Mage.",
          execution: ["Avoid whenever possible; keep moving and maintain Dampen Magic."],
        },
      ],
    },
    {
      id: "flow",
      tab: "Flow",
      tag: "Reference",
      title: "Flow, Healing & Success",
      order: {
        title: "Healing priority",
        steps: [
          "Malande Tank",
          "Gathios Tank",
          "Veras Tank",
          "Deadly Poison targets",
          "Mage Tank",
          "General raid damage",
        ],
      },
      flow: [
        "Pull",
        "Separate Malande",
        "Mage separates Zerevor",
        "Gathios + Veras established",
        "Physical DPS on Veras",
        "Rogue controls Malande",
        "Veras Vanishes → swap to Gathios",
        "Handle Deadly Poison",
        "Veras returns → OT snaps",
        "Back to Veras · repeat until dead",
      ],
      wipes: [
        "Malande healing the Council through missed interrupts.",
        "Zerevor killing the Mage.",
        "Veras killing random raid members.",
        "Losing control of Gathios.",
        "Bringing Malande into the cleave stack in Week 1.",
      ],
      closing:
        "Week 1 success: Malande doesn't heal, Zerevor doesn't kill the Mage, Veras doesn't kill random raiders, Gathios stays controlled, and Veras burns whenever he's up. Once it's on farm, transition to the Gathios + Veras + Malande cleave with only Zerevor separated.",
    },
  ],
};

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
        "Illidan is the final encounter of Black Temple and rewards discipline more than raw DPS. The phases build on one another, but the majority of progression wipes happen during Flames of Azzinoth.",
        "Our goal: execute every phase cleanly, minimize movement, and push Illidan hard enough to shorten or skip Demon Phase. Clean mechanics kill this boss.",
      ],
      callout: {
        tone: "tip",
        title: "Prepare before the pull",
        body: "Required: Demonslaying Elixir, Healthstone, standard DPS consumables. Recommended: assigned personal defensives, Free Action Potion, and Rocket Boots for progression.",
      },
    },
    {
      id: "phase-1",
      tab: "Phase 1",
      tag: "Phase 1",
      title: "Phase One",
      subtitle: "Tank-and-spank — keep the arena clean",
      image: `${IMG}/illidan-p1.png`,
      imageCaption: "Illidan — Phase One positioning",
      lead: [
        "A straightforward tank-and-spank. Maximize uptime while keeping the arena clean before the most dangerous phase begins.",
      ],
      mechanics: [
        {
          name: "Shear",
          effect: "Massively reduces the tank's maximum health.",
          execution: [
            "Tanks must avoid being hit by Shear; plan defensive cooldowns.",
            "A successful Shear will usually result in a tank death.",
          ],
        },
        {
          name: "Flame Crash",
          effect: "Creates a fire patch beneath a player's location.",
          execution: [
            "Move immediately, return once safe.",
            "Never drag fire through the raid.",
          ],
        },
        {
          name: "Parasitic Shadowfiend",
          effect: "Infests a random player.",
          execution: [
            "The affected player immediately moves away from the raid.",
            "Parasites are picked up and killed immediately.",
            "Never allow parasites to spawn inside the raid.",
          ],
        },
      ],
      positioning: [
        "Keep Illidan near the center, faced away from the raid.",
        "Melee stay behind for maximum uptime.",
        "Ranged spread naturally within healer range.",
        "Minimize unnecessary movement.",
      ],
    },
    {
      id: "flames",
      tab: "Flames",
      tag: "Phase 2",
      title: "Flames of Azzinoth",
      subtitle: "The progression phase — the fight is won or lost here",
      image: `${IMG}/illidan-p2.png`,
      imageCaption: "Illidan — Flames of Azzinoth kiting",
      lead: [
        "Control Blaze, avoid Eye Beam, and kill the Flames as fast as possible. Nearly every progression wipe happens here.",
      ],
      callout: {
        tone: "danger",
        title: "Hard-commit, never split",
        body: "Entire raid commits to Flame #1, kills it, then hard-swaps to Flame #2. Splitting DPS lengthens the most dangerous phase and spreads Blaze everywhere.",
      },
      mechanics: [
        {
          name: "Flames of Azzinoth",
          effect: "Two Flames spawn; each gets its own dedicated tank and drops Blaze wherever it stands.",
          execution: [
            "Tanks continuously kite their Flame around the outside of the platform.",
            "Never allow Blaze to stack in one location.",
            "Kite smoothly and preserve room — never over-kite.",
          ],
        },
        {
          name: "Eye Beam",
          effect: "Massive beam that instantly kills players in its path.",
          execution: [
            "Move immediately and rotate around the outside edge.",
            "Never run through the middle.",
            "Resume DPS immediately after reaching safety.",
          ],
        },
        {
          name: "Blaze",
          effect: "Permanently removes usable platform space.",
          execution: [
            "Tanks are responsible for managing platform space.",
            "Smooth movement is always better than panic movement.",
          ],
        },
      ],
      dps: {
        title: "Our strategy — never split",
        intro: "Hard-committing one Flame at a time shortens the most dangerous phase and reduces overall Blaze coverage.",
        steps: [
          "Entire raid hard-commits to Flame #1.",
          "Kill Flame #1.",
          "Immediately hard-swap to Flame #2.",
          "Never split DPS.",
        ],
      },
      positioning: [
        "Tanks remain separated with their own Flame.",
        "Raid follows the active Flame; melee stay behind it.",
        "Ranged avoid unnecessary movement.",
        "Always respect Eye Beam paths.",
      ],
      mistakes: [
        "Splitting DPS.",
        "Standing in Blaze.",
        "Crossing Eye Beam.",
        "Tanks allowing Flames to sit still.",
        "Panic movement.",
      ],
    },
    {
      id: "phase-3",
      tab: "Phase 3",
      tag: "Phase 3",
      title: "Phase Three",
      subtitle: "Illidan returns to normal mechanics",
      image: `${IMG}/illidan-p3-p5.png`,
      imageCaption: "Illidan — Phase Three through Final positioning",
      lead: [
        "This phase should feel identical to Phase One with continued Parasite management.",
      ],
      mechanics: [
        {
          name: "Parasitic Shadowfiend",
          effect: "Infests a random player.",
          execution: [
            "Parasite targets move away from the raid immediately.",
            "Kill parasites quickly.",
            "Never allow them to spawn inside the raid.",
          ],
        },
        {
          name: "Flame Crash",
          effect: "Same fire-patch mechanic as Phase One.",
          execution: ["Continue handling exactly as before.", "Maximize boss uptime."],
        },
      ],
      positioning: [
        "Resume normal Phase One positioning.",
        "Parasite targets move away before parasites spawn.",
        "Return once parasites are controlled.",
      ],
    },
    {
      id: "demon",
      tab: "Demon",
      tag: "Phase 4",
      title: "Demon Phase",
      subtitle: "Skip whenever possible through strong raid DPS",
      lead: [
        "The goal is to skip this phase with strong raid DPS. A clean raid should spend very little time here. If it does occur, the Warlock tank keeps control while the raid clears Shadow Demons.",
      ],
      roles: [
        {
          title: "Warlock Tank",
          accent: WARLOCK,
          intro: "If Demon Phase happens, the Warlock tank holds threat on Illidan.",
          points: [
            "Equip Shadow Resistance gear.",
            "Maintain threat using Searing Pain.",
            "Stay within healer range with consistent positioning.",
          ],
        },
      ],
      mechanics: [
        {
          name: "Shadow Demons",
          effect: "Target random players and stun them on contact. A stunned player is unlikely to survive.",
          execution: [
            "Shadow Demons are the highest DPS priority.",
            "Kill assigned Shadow Demons immediately.",
            "Return to Illidan as soon as Demons are dead.",
          ],
        },
        {
          name: "Shadow Blast",
          effect: "Heavy Shadow damage on the Warlock tank.",
          execution: [
            "Maintain Shadow Resistance gear.",
            "Healers prepare for consistent incoming damage.",
          ],
        },
      ],
      positioning: [
        "Warlock maintains consistent boss positioning.",
        "Raid remains spread.",
        "Swap to Shadow Demons, then return to Illidan.",
      ],
      mistakes: [
        "Shadow Demons reaching players.",
        "Warlock losing threat.",
        "Poor Shadow Resistance preparation.",
        "Chasing unnecessary DPS.",
      ],
    },
    {
      id: "final",
      tab: "Final",
      tag: "Phase 5",
      title: "Final Phase",
      subtitle: "Illidan combines previous mechanics into one final burn",
      lead: ["The encounter is nearly won. Do not throw it away by becoming impatient."],
      execution: [
        "Continue handling Flame Crash.",
        "Continue handling Parasites.",
        "Kill Shadow Demons immediately if they appear.",
        "Maintain positioning.",
        "Use remaining offensive cooldowns.",
        "Do not greed mechanics for extra DPS.",
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
        "(Optional Demon Phase)",
        "Final Burn",
        "Victory",
      ],
      wipes: [
        "Tank dying to Shear.",
        "Parasites spawning inside the raid.",
        "Splitting DPS on Flames.",
        "Poor Flame kiting.",
        "Eye Beam deaths.",
        "Blaze covering too much of the platform.",
        "Panic during transitions.",
        "Greeding DPS instead of respecting mechanics.",
      ],
      closing:
        "Flames of Azzinoth determines the outcome. Hard-commit to one Flame, treat Blaze management as more important than DPS, and prioritize mechanics over personal damage. A clean Flames phase makes the rest of the fight easy — and with strong DPS, Demon Phase becomes extremely short or is skipped entirely.",
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
