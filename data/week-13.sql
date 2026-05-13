-- Week 13 (May 12, 2026) loot import.
-- Self-contained: creates the missing Player (Frustrated) and Characters
-- (Frustrated's Arms Warrior main, Barbatos's Affliction Warlock alt,
-- Pizookies's Combat Rogue alt) before inserting the 10 awards.
-- Pit Lord's Satchel is deliberately not tracked, so even though
-- Pizookies's Rogue is now on the roster the satchel award is excluded.
-- The Koco Magtheridon's Head from the table was reassigned to Blargn
-- on the night, so only the Blargn row is recorded.
-- Idempotent — re-running deletes and re-inserts the May 12 RaidNight
-- + its awards, so duplicate runs converge on the same final state.

BEGIN;

-- 1. Add the new Player (Frustrated) if missing.
INSERT INTO "Player" ("displayName")
SELECT 'Frustrated'
 WHERE NOT EXISTS (SELECT 1 FROM "Player" WHERE "displayName" = 'Frustrated');

-- 2. Add Frustrated's Arms Warrior main if missing.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Frustrated', 'Warrior', 'Arms Warrior', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Frustrated'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Warrior' AND c.spec = 'Arms Warrior'
   );

INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" = 'Frustrated'
   AND c.class = 'Warrior'
   AND c.spec = 'Arms Warrior'
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- 3. Add Barbatos's Affliction Warlock alt if missing.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Barbatos', 'Warlock', 'Affliction Warlock', 'dps', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Barbatos'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock'
   );

INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" = 'Barbatos'
   AND c.class = 'Warlock'
   AND c.spec = 'Affliction Warlock'
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- 4. Add Pizookies's Combat Rogue alt if missing.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Pizookies', 'Rogue', 'Combat Rogue', 'dps', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Pizookies'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Rogue' AND c.spec = 'Combat Rogue'
   );

INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE p."displayName" = 'Pizookies'
   AND c.class = 'Rogue'
   AND c.spec = 'Combat Rogue'
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- 5. Reset the Week 13 RaidNight + its awards so re-runs converge.
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-12'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-12'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-12', 'Week 13');

-- 6. Insert the 10 LootAwards. Pit Lord's Satchel (Pizookies) is
--    intentionally excluded from tracking. Koco's Magtheridon's Head
--    was reassigned to Blargn on the night, so only the Blargn row
--    is recorded.
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt") VALUES
  ((SELECT id FROM "Item" WHERE name = 'Cloak of the Pit Stalker' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Corr' AND c.class = 'Warrior' AND c.spec = 'Fury Warrior' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Hero' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Barbatos' AND c.class = 'Warlock' AND c.spec = 'Affliction Warlock' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Elektro' AND c.class = 'Shaman' AND c.spec = 'Elemental Shaman' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Sleepyrat' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Sleepyrat' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Leggings of the Fallen Champion' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Sleepyrat' AND c.class = 'Paladin' AND c.spec = 'Holy Paladin' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Pauldrons of the Fallen Defender' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Bored' AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Skryt' AND c.class = 'Shaman' AND c.spec = 'Restoration Shaman' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Girdle of the Endless Pit' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Frustrated' AND c.class = 'Warrior' AND c.spec = 'Arms Warrior' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp),
  ((SELECT id FROM "Item" WHERE name = 'Magtheridon''s Head' LIMIT 1), (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id WHERE p."displayName" = 'Blargn' AND c.class = 'Mage' AND c.spec = 'Arcane Mage' LIMIT 1), (SELECT id FROM "Roster" WHERE name = 'Master Roster'), (SELECT id FROM "RaidNight" WHERE date = '2026-05-12' AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster') LIMIT 1), '2026-05-12T00:00:00Z'::timestamp);

COMMIT;

-- Sanity checks (run separately):
-- SELECT COUNT(*) FROM "LootAward" la
--   JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--   WHERE rn.date = '2026-05-12';   -- expect 10
-- SELECT p."displayName", c.class, c.spec, i.name
--   FROM "LootAward" la
--   JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--   JOIN "Character" c  ON la."characterId" = c.id
--   JOIN "Player" p     ON c."playerId" = p.id
--   JOIN "Item" i       ON la."itemId" = i.id
--  WHERE rn.date = '2026-05-12'
--  ORDER BY p."displayName", i.name;
