// Generate data/loot.sql from data/loot.tsv. Output is a single
// transaction safe to paste into the Neon SQL editor — wipes existing
// LootAward + Attendance + RaidNight rows, then inserts a RaidNight per
// unique date and a LootAward per loot row.
//
// Items are looked up by name from the seeded "Item" table. Characters
// are looked up by (player displayName + class + canonical spec). Player
// aliases (Fishynethers→Kalihiwai etc.) handle the post-correction merges.
//
// Usage:  tsx scripts/generate-loot-sql.ts

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SPEC_BY_KEY, SPECS } from "../lib/specs";
import { TBC_DATA } from "../lib/tbc-data";

const ROOT = resolve(__dirname, "..");
const TSV = resolve(ROOT, "data", "loot.tsv");
const OUT = resolve(ROOT, "data", "loot.sql");

const SEASON_YEAR = 2026;

// Roster aliases applied AFTER the post-correction merges. e.g. week 11 has
// a "Fishynethers" loot row but Fishynethers got merged into Kalihiwai's
// druid alt; resolve those rows under the new player name.
const PLAYER_ALIAS: Record<string, string> = {
  Fishynethers: "Kalihiwai",
  Boredmage:    "Bored",
  Creeq:        "Creek",
};

const SPEC_ALIAS: Record<string, string> = {
  "Druid:Feral (Bear)": "Feral Druid (Tank)",
  "Druid:Feral (Cat)":  "Feral Druid (DPS)",
};

// Items that the loot history references but the seed catalog
// (lib/tbc-data.ts) doesn't include. We INSERT them at the top of
// loot.sql (idempotently — guarded by NOT EXISTS) so the SQL is
// self-contained. Boss is matched by name; slot/itemLevel are best-
// effort and tooltips will be missing until tbc-data.ts is updated.
interface MissingItem { name: string; boss: string; slot?: string; itemLevel?: number }
const MISSING_ITEMS: MissingItem[] = [
  // High King Maulgar
  { name: "Maulgar's Warhelm",         boss: "High King Maulgar",      slot: "Head",          itemLevel: 128 },
  { name: "Hammer of the Naaru",       boss: "High King Maulgar",      slot: "Two-Hand Mace", itemLevel: 128 },
  { name: "Belt of Divine Inspiration", boss: "High King Maulgar",     slot: "Waist",         itemLevel: 128 },
  // Gruul the Dragonkiller
  { name: "Eye of Gruul",              boss: "Gruul the Dragonkiller", slot: "Trinket",       itemLevel: 128 },
  { name: "Windshear Boots",           boss: "Gruul the Dragonkiller", slot: "Feet",          itemLevel: 128 },
  { name: "Gauntlets of the Dragonslayer", boss: "Gruul the Dragonkiller", slot: "Hands",     itemLevel: 128 },
  // Magtheridon
  { name: "Magtheridon's Head",        boss: "Magtheridon",            slot: "Quest",         itemLevel: 128 },
  { name: "Eredar Wand of Obliteration", boss: "Magtheridon",          slot: "Wand",          itemLevel: 128 },
  { name: "Karaborian Talisman",       boss: "Magtheridon",            slot: "Held In Off-hand", itemLevel: 128 },
  { name: "Terror Pit Girdle",         boss: "Magtheridon",            slot: "Waist",         itemLevel: 128 },
  { name: "Girdle of the Endless Pit", boss: "Magtheridon",            slot: "Waist",         itemLevel: 128 },
  { name: "Aegis of the Vindicator",   boss: "Magtheridon",            slot: "Shield",        itemLevel: 128 },
  { name: "Liar's Tongue Gloves",      boss: "Magtheridon",            slot: "Hands",         itemLevel: 128 },
];

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", March: "03", Apr: "04", April: "04",
  May: "05", Jun: "06", June: "06", Jul: "07", July: "07",
  Aug: "08", August: "08", Sep: "09", Sept: "09", September: "09",
  Oct: "10", October: "10", Nov: "11", November: "11", Dec: "12", December: "12",
};

function resolveSpecKey(className: string, specName: string): string {
  const aliasKey = `${className}:${specName}`;
  if (SPEC_ALIAS[aliasKey]) return SPEC_ALIAS[aliasKey];
  const combined = `${specName} ${className}`;
  if (SPEC_BY_KEY[combined]) return combined;
  const found = SPECS.find(
    s => s.class === className && s.key.toLowerCase().startsWith(specName.toLowerCase()),
  );
  if (found) return found.key;
  throw new Error(`No canonical spec for class="${className}" spec="${specName}"`);
}

function parseShortDate(s: string): string {
  // "Feb 19" / "March 3" -> "2026-02-19"
  const [monthName, dayRaw] = s.trim().split(/\s+/);
  const month = MONTHS[monthName];
  if (!month) throw new Error(`Unknown month "${monthName}" in date "${s}"`);
  const day = String(Number(dayRaw)).padStart(2, "0");
  return `${SEASON_YEAR}-${month}-${day}`;
}

function sqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

interface Row {
  week: number;
  date: string;          // ISO yyyy-mm-dd
  player: string;        // post-alias displayName
  className: string;
  specKey: string;
  itemName: string;
}

function parseTsv(): { rows: Row[]; itemSet: Set<string> } {
  const lines = readFileSync(TSV, "utf8").split(/\r?\n/).filter(l => l.trim().length);
  const [header, ...body] = lines;
  const cols = header.split("\t").map(s => s.trim());
  const idx = (n: string) => {
    const i = cols.indexOf(n);
    if (i < 0) throw new Error(`Missing column "${n}"`);
    return i;
  };
  const iWeek = idx("Week"), iDate = idx("Date"), iPlayer = idx("Player");
  const iClass = idx("Class"), iSpec = idx("Spec"), iItem = idx("Item");

  const itemSet = new Set<string>();
  const rows = body.map((line, n) => {
    const c = line.split("\t").map(s => s.trim());
    const week = Number(c[iWeek]);
    const date = parseShortDate(c[iDate]);
    const rawPlayer = c[iPlayer];
    const player = PLAYER_ALIAS[rawPlayer] ?? rawPlayer;
    const className = c[iClass];
    const specKey = resolveSpecKey(className, c[iSpec]);
    const itemName = c[iItem];
    if (!Number.isFinite(week) || !date || !player || !className || !specKey || !itemName) {
      throw new Error(`Row ${n + 2}: missing cell — "${line}"`);
    }
    itemSet.add(itemName);
    return { week, date, player, className, specKey, itemName };
  });
  return { rows, itemSet };
}

function knownItemNames(): Set<string> {
  const names = new Set<string>();
  for (const phase of TBC_DATA) {
    for (const raid of phase.raids) {
      for (const boss of raid.bosses) {
        for (const item of boss.items) names.add(item.name);
      }
    }
  }
  return names;
}

function build(): string {
  const { rows, itemSet } = parseTsv();
  const known = knownItemNames();
  const augmented = new Set([...known, ...MISSING_ITEMS.map(m => m.name)]);
  const missing = [...itemSet].filter(n => !augmented.has(n)).sort();
  if (missing.length) {
    console.error("Items not found in seed catalog or MISSING_ITEMS list:");
    for (const m of missing) console.error("  - " + m);
    throw new Error(`${missing.length} loot row(s) reference unknown items.`);
  }

  // Unique RaidNights, in week order.
  const nightByDate = new Map<string, { date: string; week: number }>();
  for (const r of rows) {
    if (!nightByDate.has(r.date)) nightByDate.set(r.date, { date: r.date, week: r.week });
  }
  const nights = [...nightByDate.values()].sort((a, b) => a.date.localeCompare(b.date));

  const out: string[] = [];
  out.push(`-- Generated by scripts/generate-loot-sql.ts. Do not edit by hand.`);
  out.push(`-- Source: data/loot.tsv (${rows.length} rows / ${nights.length} raid nights / ${itemSet.size} unique items)`);
  out.push(`-- Paste this into Neon's SQL editor and run as a single transaction.`);
  out.push(``);
  out.push(`BEGIN;`);
  out.push(``);
  // Items that the loot data references but the seed catalog is missing.
  // Inserted idempotently — re-runs (and freshly-seeded DBs that already
  // have these items) skip them via NOT EXISTS.
  const itemsActuallyUsed = MISSING_ITEMS.filter(m => itemSet.has(m.name));
  if (itemsActuallyUsed.length) {
    out.push(`-- 0. Backfill items that the loot history references but the seed`);
    out.push(`--    catalog (lib/tbc-data.ts) is missing. Idempotent.`);
    for (const m of itemsActuallyUsed) {
      const cols = [`name`, `"bossId"`];
      const valFns: string[] = [sqlString(m.name), `b.id`];
      if (m.slot)      { cols.push(`slot`);        valFns.push(sqlString(m.slot)); }
      if (m.itemLevel) { cols.push(`"itemLevel"`); valFns.push(String(m.itemLevel)); }
      out.push(`INSERT INTO "Item" (${cols.join(", ")})`);
      out.push(`SELECT ${valFns.join(", ")} FROM "Boss" b WHERE b.name = ${sqlString(m.boss)}`);
      out.push(`  AND NOT EXISTS (SELECT 1 FROM "Item" WHERE name = ${sqlString(m.name)});`);
    }
    out.push(``);
  }
  out.push(`-- 1. Wipe existing loot history so re-runs are idempotent.`);
  out.push(`DELETE FROM "LootAward";`);
  out.push(`DELETE FROM "Attendance";`);
  out.push(`DELETE FROM "RaidNight";`);
  out.push(``);
  out.push(`-- 2. RaidNight per unique raid date (rosterId = Master Roster).`);
  out.push(`INSERT INTO "RaidNight" ("rosterId", date, notes) VALUES`);
  out.push(
    nights
      .map(n => `  ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), ${sqlString(n.date)}, ${sqlString("Week " + n.week)})`)
      .join(",\n") + `;`,
  );
  out.push(``);
  out.push(`-- 3. LootAward per loot row.`);
  out.push(`INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt") VALUES`);
  const awardSql = rows.map(r => {
    const itemSub = `(SELECT id FROM "Item" WHERE name = ${sqlString(r.itemName)} LIMIT 1)`;
    const charSub =
      `(SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id` +
      ` WHERE p."displayName" = ${sqlString(r.player)} AND c.class = ${sqlString(r.className)}` +
      ` AND c.spec = ${sqlString(r.specKey)} LIMIT 1)`;
    const rosterSub = `(SELECT id FROM "Roster" WHERE name = 'Master Roster')`;
    const nightSub  = `(SELECT id FROM "RaidNight" WHERE date = ${sqlString(r.date)} AND "rosterId" = ${rosterSub} LIMIT 1)`;
    const awardedAt = `${sqlString(r.date + "T00:00:00Z")}::timestamp`;
    return `  (${itemSub}, ${charSub}, ${rosterSub}, ${nightSub}, ${awardedAt})`;
  });
  out.push(awardSql.join(",\n") + `;`);
  out.push(``);
  // Self-check: any award with NULL itemId or NULL characterId means a lookup
  // failed silently (item rename, missing character row, etc.). Abort the
  // transaction if we find any so prod data isn't half-loaded.
  out.push(`-- 4. Abort if any subquery resolved to NULL.`);
  out.push(`DO $$`);
  out.push(`DECLARE bad INT;`);
  out.push(`BEGIN`);
  out.push(`  SELECT COUNT(*) INTO bad FROM "LootAward" WHERE "itemId" IS NULL OR "characterId" IS NULL OR "raidNightId" IS NULL;`);
  out.push(`  IF bad > 0 THEN RAISE EXCEPTION 'loot.sql: % rows have unresolved subqueries; aborting', bad; END IF;`);
  out.push(`END $$;`);
  out.push(``);
  out.push(`COMMIT;`);
  out.push(``);
  out.push(`-- Sanity checks (run separately):`);
  out.push(`-- SELECT COUNT(*) FROM "RaidNight";    -- expect ${nights.length}`);
  out.push(`-- SELECT COUNT(*) FROM "LootAward";    -- expect ${rows.length}`);
  out.push(`-- SELECT date, COUNT(*) AS items FROM "RaidNight" rn`);
  out.push(`--   LEFT JOIN "LootAward" la ON la."raidNightId" = rn.id`);
  out.push(`--   GROUP BY rn.id, date ORDER BY date;`);
  return out.join("\n");
}

const sql = build();
writeFileSync(OUT, sql);
console.log(`Wrote ${OUT} (${sql.length} chars)`);
