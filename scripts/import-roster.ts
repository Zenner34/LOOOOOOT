// Wipe and re-import the guild roster from data/roster.tsv.
//
// Usage:  tsx scripts/import-roster.ts            # wipe + import (default)
//         tsx scripts/import-roster.ts --dry      # parse + report, no DB writes
//
// Wipes (in dependency order): LootAward, Attendance, RosterMember, RaidNight,
// Roster, Character, Player. Then re-creates the singleton "Master Roster" and
// inserts a Player + Character per row, attaching every Character to Master
// Roster as a member.
//
// TSV columns: Player, Class, Spec, Role, Main / Alt
// (Spec column is the in-game spec name; combined with Class it maps to a
//  canonical SPEC key from lib/specs.ts.)

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SPEC_BY_KEY, SPECS } from "../lib/specs";

const prisma = new PrismaClient();

const ROSTER_TSV = resolve(__dirname, "..", "data", "roster.tsv");

// "Feral (Bear)" / "Feral (Cat)" are the in-sheet names for the two Feral
// druid specs; canonical keys distinguish (Tank) vs (DPS). Hunters and others
// just need Class prefixed/suffixed onto the bare spec name.
const SPEC_ALIAS: Record<string, string> = {
  "Druid:Feral (Bear)": "Feral Druid (Tank)",
  "Druid:Feral (Cat)":  "Feral Druid (DPS)",
};

const ROLE_ALIAS: Record<string, "tank" | "heal" | "dps"> = {
  "Tank":         "tank",
  "Healer":       "heal",
  "Healers":      "heal",
  "Physical DPS": "dps",
  "Caster DPS":   "dps",
  "DPS":          "dps",
};

interface Row {
  player: string;
  className: string;
  specName: string;
  role: string;
  mainAlt: string;
  // Resolved.
  specKey: string;
  isMain: boolean;
  resolvedRole: "tank" | "heal" | "dps";
}

function resolveSpecKey(className: string, specName: string): string {
  const aliasKey = `${className}:${specName}`;
  if (SPEC_ALIAS[aliasKey]) return SPEC_ALIAS[aliasKey];
  // Default: combine spec + class. e.g. "Frost" + "Mage" -> "Frost Mage".
  const combined = `${specName} ${className}`;
  if (SPEC_BY_KEY[combined]) return combined;
  // Fall back to scanning SPECS for a matching class whose key starts with the spec.
  const found = SPECS.find(
    s => s.class === className && s.key.toLowerCase().startsWith(specName.toLowerCase()),
  );
  if (found) return found.key;
  throw new Error(`No canonical spec for class="${className}" spec="${specName}"`);
}

function parseTsv(path: string): Row[] {
  const raw = readFileSync(path, "utf8");
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error(`${path} is empty`);
  const [header, ...body] = lines;
  const cols = header.split("\t").map(s => s.trim());
  const idx = (name: string) => {
    const i = cols.indexOf(name);
    if (i < 0) throw new Error(`Missing column "${name}" in header: ${cols.join(" | ")}`);
    return i;
  };
  const iPlayer  = idx("Player");
  const iClass   = idx("Class");
  const iSpec    = idx("Spec");
  const iRole    = idx("Role");
  const iMainAlt = idx("Main / Alt");

  return body.map((line, i) => {
    const cells = line.split("\t").map(s => s.trim());
    const player    = cells[iPlayer];
    const className = cells[iClass];
    const specName  = cells[iSpec];
    const role      = cells[iRole];
    const mainAlt   = cells[iMainAlt];
    if (!player || !className || !specName || !role || !mainAlt) {
      throw new Error(`Row ${i + 2}: missing required cell — "${line}"`);
    }
    const specKey = resolveSpecKey(className, specName);
    const isMain = mainAlt.toLowerCase() === "main";
    const resolvedRole = ROLE_ALIAS[role];
    if (!resolvedRole) throw new Error(`Row ${i + 2}: unknown role "${role}"`);
    // Sanity-check role from sheet matches role from canonical spec.
    const specDef = SPEC_BY_KEY[specKey];
    if (specDef.role !== resolvedRole) {
      throw new Error(
        `Row ${i + 2}: sheet role "${role}" -> ${resolvedRole} but spec ${specKey} is ${specDef.role}`,
      );
    }
    return { player, className, specName, role, mainAlt, specKey, isMain, resolvedRole };
  });
}

async function wipeRosterData() {
  // Order matters because of FK constraints. Roster cascades to its members,
  // raid nights, and awards — but deleting LootAward + Attendance first keeps
  // any cascades short and predictable.
  await prisma.lootAward.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.rosterMember.deleteMany({});
  await prisma.raidNight.deleteMany({});
  await prisma.roster.deleteMany({});
  await prisma.character.deleteMany({});
  await prisma.player.deleteMany({});
}

async function main() {
  const dry = process.argv.includes("--dry");
  const rows = parseTsv(ROSTER_TSV);

  // Validate: a player should have exactly one Main per class+spec (alts of
  // the same class+spec are allowed but Main+Main collisions probably mean a
  // typo). Just warn — don't block.
  const byPlayerMain = new Map<string, number>();
  for (const r of rows) {
    if (!r.isMain) continue;
    byPlayerMain.set(r.player, (byPlayerMain.get(r.player) ?? 0) + 1);
  }
  for (const [p, n] of byPlayerMain) {
    if (n > 1) console.warn(`warn: player "${p}" has ${n} Main rows`);
  }

  const players = new Set(rows.map(r => r.player));
  console.log(`Parsed ${rows.length} rows / ${players.size} unique players from ${ROSTER_TSV}`);

  if (dry) {
    console.log("--dry: stopping before any DB writes");
    return;
  }

  console.log("Wiping existing rosters / players / characters / loot…");
  await wipeRosterData();

  // Recreate the singleton roster.
  const masterRoster = await prisma.roster.create({
    data: {
      name: "Master Roster",
      description: "The guild roster — every active raider's character lives here.",
    },
  });

  // Create Players first so we have IDs for Character.playerId.
  const playerIdByName = new Map<string, number>();
  for (const name of players) {
    const p = await prisma.player.create({ data: { displayName: name } });
    playerIdByName.set(name, p.id);
  }

  // Create Characters and add each to Master Roster.
  let createdChars = 0;
  for (const r of rows) {
    const playerId = playerIdByName.get(r.player)!;
    const character = await prisma.character.create({
      data: {
        name: r.player,
        class: r.className,
        spec: r.specKey,
        role: r.resolvedRole,
        isMain: r.isMain,
        playerId,
      },
    });
    await prisma.rosterMember.create({
      data: {
        rosterId: masterRoster.id,
        characterId: character.id,
        memberRole: "main",
      },
    });
    createdChars++;
  }

  console.log(`Done. Players: ${players.size}, Characters: ${createdChars}, Roster: ${masterRoster.name}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
