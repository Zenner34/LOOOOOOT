-- Week 12 (May 5, 2026) loot import.
-- Self-contained: creates the missing character (Bugatti's new Holy Paladin
-- alt) and missing item (Pit Lord's Satchel) before inserting the 20 awards.
-- Idempotent — re-running deletes and re-inserts the May 5 RaidNight + its
-- awards, so any duplicate runs converge on the same final state.

BEGIN;

-- 1. Add Bugatti's Holy Paladin alt to the roster if missing.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Bugatti', 'Paladin', 'Holy Paladin', 'heal', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Bugatti'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Paladin' AND c.spec = 'Holy Paladin'
   );

INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" = 'Bugatti'
   AND c.class = 'Paladin'
   AND c.spec = 'Holy Paladin'
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- 2. Add Pit Lord's Satchel under Magtheridon if missing.
--    wowheadId intentionally omitted — the public 34845 resolves to
--    "Yarzill's Mutton" in the live TBC Classic tooltip DB and the
--    tooltip script's renameLinks=true overwrites the visible name.
INSERT INTO "Item" (name, "bossId", slot, "itemLevel", notes)
SELECT 'Pit Lord''s Satchel', b.id, 'Bag', 70, '20-slot epic bag'
  FROM "Boss" b
 WHERE b.name = 'Magtheridon'
   AND NOT EXISTS (SELECT 1 FROM "Item" WHERE name = 'Pit Lord''s Satchel');

-- 3. Reset the Week 12 RaidNight + its awards so re-runs converge.
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-05'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-05'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-05', 'Week 12');

-- 4. Insert all 20 LootAwards. Each row resolves character by
--    (player displayName + class + canonical spec) and item by name.
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt") VALUES
  ((SELECT id FROM "Item" WHERE name = 'Eye of Gruul' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'HotforSenpai' AND c.class = 'Priest' AND c.spec = 'Holy Priest' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Zephleo' AND c.class = 'Druid' AND c.spec = 'Balance Druid' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Hero' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Kayotics' AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Eredar Wand of Obliteration' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Koco' AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Subforfeet' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Chestguard of the Fallen Defender' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'DIsrespect' AND c.class = 'Warrior' AND c.spec = 'Fury Warrior' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Defender' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Zephleo' AND c.class = 'Druid' AND c.spec = 'Balance Druid' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pit Lord''s Satchel' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Blargn' AND c.class = 'Mage' AND c.spec = 'Frost Mage' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Chestguard of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bugatti' AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Soul-Eater''s Handwraps' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Valiks' AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Glaive of the Pit' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bungle' AND c.class = 'Druid' AND c.spec = 'Restoration Druid' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Chestguard of the Fallen Hero' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bugatti' AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Koco' AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pit Lord''s Satchel' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Doge' AND c.class = 'Hunter' AND c.spec = 'Beast Mastery Hunter' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Chestguard of the Fallen Hero' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bugatti' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Crystalheart Pulse-Staff' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Lebearjames' AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Terror Pit Girdle' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bugatti' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Chestguard of the Fallen Defender' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Capriciousxo' AND c.class = 'Druid' AND c.spec = 'Balance Druid' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bored' AND c.class = 'Mage' AND c.spec = 'Frost Mage' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pit Lord''s Satchel' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Girthstorm' AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-05' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-05T00:00:00Z'::timestamp);

COMMIT;

-- Sanity checks (run separately):
-- SELECT COUNT(*) FROM "LootAward" la
--   JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--   WHERE rn.date = '2026-05-05';   -- expect 20
--
-- SELECT i.name AS item, p."displayName" AS player, c.class, c.spec
--   FROM "LootAward" la
--   JOIN "Item" i ON la."itemId" = i.id
--   JOIN "Character" c ON la."characterId" = c.id
--   JOIN "Player" p ON c."playerId" = p.id
--   JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--   WHERE rn.date = '2026-05-05'
--   ORDER BY i.name;
