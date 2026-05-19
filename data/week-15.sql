-- Week 15 (May 17, 2026) loot import — Sunday SSC + TK clear.
--
-- 32 awards parsed from the 5/17 raid log (33 in the source — Lillack's
-- Leggings of the Vanquished Hero is intentionally skipped per admin).
-- A few in-game character renames map to existing DB characters; the
-- lookups stay on (player displayName + class + spec) so the renames
-- don't matter:
--   Boredmage      → player "Bored", class Mage, spec Arcane Mage
--   Daladots       → player "Daladed", Warlock, Destruction Warlock
--   Creekx         → player "Creek", Mage, Arcane Mage
--   Cørr           → player "Corr", Warrior, Fury Warrior
--   Hoodfuryx      → player "Hoodfury", Hunter, Beast Mastery Hunter
--   Yuppers        → player "Massesto", Warlock, Affliction Warlock
--   Cowabungle     → player "Bungle", Druid, Restoration Druid
--
-- New entries to seed:
--   3 new players + mains: Cholima (Resto Shaman), Jasmia (Shadow
--     Priest), Cutebrat (Fury Warrior)
--   3 new alt characters on existing players: Bearlet on Priestlynn
--     (Feral Druid Tank), Dafnibellium on Slamchamber (Holy Priest),
--     Zappyshmoo on Shmoo (Enhancement Shaman)
--
-- Token / class mismatches confirmed with admin and recorded as-is:
--   Glzy got Helm of the Vanquished Hero — goes to BM Hunter main.
--   Case got Gloves of the Vanquished Champion — goes to Enh Shaman.
--   Lebearjames got two Vanquished Defender tokens — goes to Feral
--     Druid (Tank) per the pattern established in prior weeks.
--
-- Idempotent — re-running deletes and re-inserts the May 17 RaidNight
-- + its awards, so duplicate runs converge on the same final state.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 1. Players: add Cholima, Jasmia, Cutebrat if missing.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "Player" ("displayName")
SELECT v.name
  FROM (VALUES ('Cholima'), ('Jasmia'), ('Cutebrat')) AS v(name)
 WHERE NOT EXISTS (SELECT 1 FROM "Player" p WHERE p."displayName" = v.name);

-- ════════════════════════════════════════════════════════════════════════
-- 2. Characters: 3 new mains for the new players + 3 new alts attached
--    to existing players.
-- ════════════════════════════════════════════════════════════════════════
-- Cholima · Restoration Shaman (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Cholima', 'Shaman', 'Restoration Shaman', 'heal', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Cholima'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Shaman' AND c.spec = 'Restoration Shaman'
   );

-- Jasmia · Shadow Priest (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Jasmia', 'Priest', 'Shadow Priest', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Jasmia'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Priest' AND c.spec = 'Shadow Priest'
   );

-- Cutebrat · Fury Warrior (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Cutebrat', 'Warrior', 'Fury Warrior', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Cutebrat'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Warrior' AND c.spec = 'Fury Warrior'
   );

-- Bearlet · Feral Druid (Tank) — alt on Priestlynn.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Bearlet', 'Druid', 'Feral Druid (Tank)', 'tank', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Priestlynn'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Druid' AND c.spec = 'Feral Druid (Tank)'
   );

-- Dafnibellium · Holy Priest — alt on Slamchamber.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Dafnibellium', 'Priest', 'Holy Priest', 'heal', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Slamchamber'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Priest' AND c.spec = 'Holy Priest'
   );

-- Zappyshmoo · Enhancement Shaman — alt on Shmoo.
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Zappyshmoo', 'Shaman', 'Enhancement Shaman', 'dps', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Shmoo'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Shaman' AND c.spec = 'Enhancement Shaman'
   );

-- ════════════════════════════════════════════════════════════════════════
-- 3. Roster memberships for all 6 new characters.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id,
       CASE WHEN c."isMain" THEN 'main' ELSE 'alt' END
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE (p."displayName", c.class, c.spec) IN (
         ('Cholima',    'Shaman',  'Restoration Shaman'),
         ('Jasmia',     'Priest',  'Shadow Priest'),
         ('Cutebrat',   'Warrior', 'Fury Warrior'),
         ('Priestlynn', 'Druid',   'Feral Druid (Tank)'),
         ('Slamchamber','Priest',  'Holy Priest'),
         ('Shmoo',      'Shaman',  'Enhancement Shaman')
       )
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- ════════════════════════════════════════════════════════════════════════
-- 4. Reset the May 17 RaidNight + its awards so re-runs converge.
-- ════════════════════════════════════════════════════════════════════════
DELETE FROM "LootAward"
 WHERE "raidNightId" IN (
   SELECT id FROM "RaidNight"
    WHERE date = '2026-05-17'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
 );
DELETE FROM "RaidNight"
 WHERE date = '2026-05-17'
   AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster');

INSERT INTO "RaidNight" ("rosterId", date, notes)
VALUES ((SELECT id FROM "Roster" WHERE name = 'Master Roster'), '2026-05-17', 'Week 15 - SSC + TK');

-- ════════════════════════════════════════════════════════════════════════
-- 5. LootAwards (32 rows). Source-spreadsheet order — SSC trash awards
--    around 8:58-9:05pm, TK clears later 10:18-10:25pm.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
    LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-17'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-17T00:00:00Z'::timestamp
  FROM (VALUES
    -- SSC clears (earlier in the night)
    ('Bungle',        'Druid',   'Restoration Druid',     'Coral Band of the Revived'),
    ('Massesto',      'Warlock', 'Affliction Warlock',    'Leggings of the Vanquished Hero'),
    ('Massesto',      'Warlock', 'Affliction Warlock',    'Sextant of Unstable Currents'),
    ('Glzy',          'Hunter',  'Beast Mastery Hunter',  'Helm of the Vanquished Hero'),
    ('Glzy',          'Hunter',  'Beast Mastery Hunter',  'Cobra-Lash Boots'),
    ('Ebtmommy',      'Paladin', 'Protection Paladin',    'Scarab of Displacement'),
    ('Ebtmommy',      'Paladin', 'Protection Paladin',    'Gloves of the Vanquished Champion'),
    ('Ebtmommy',      'Paladin', 'Protection Paladin',    'Pauldrons of the Argent Sentinel'),
    ('Case',          'Shaman',  'Enhancement Shaman',    'Gloves of the Vanquished Champion'),
    ('Elektro',       'Rogue',   'Combat Rogue',          'Gloves of the Vanquished Champion'),
    ('Elektro',       'Rogue',   'Combat Rogue',          'Leggings of the Vanquished Champion'),
    ('Massesto',      'Warlock', 'Affliction Warlock',    'Cord of Screaming Terrors'),
    ('Massesto',      'Warlock', 'Affliction Warlock',    'Boots of the Shifting Nightmare'),
    ('Hoodfury',      'Hunter',  'Beast Mastery Hunter',  'True-Aim Stalker Bands'),
    ('Priestlynn',    'Druid',   'Feral Druid (Tank)',    'Band of Vile Aggression'),
    ('Shmoo',         'Shaman',  'Enhancement Shaman',    'Boots of Effortless Striking'),
    ('Bored',         'Mage',    'Arcane Mage',           'Helm of the Vanquished Hero'),
    ('Bored',         'Mage',    'Arcane Mage',           'Serpent-Coil Braid'),
    -- TK clears (later in the night)
    ('Slamchamber',   'Priest',  'Holy Priest',           'Fel Reaver''s Piston'),
    ('Elektro',       'Rogue',   'Combat Rogue',          'Pauldrons of the Vanquished Champion'),
    ('Priestlynn',    'Druid',   'Feral Druid (Tank)',    'Pauldrons of the Vanquished Defender'),
    ('Priestlynn',    'Druid',   'Feral Druid (Tank)',    'Chestguard of the Vanquished Defender'),
    ('Corr',          'Warrior', 'Fury Warrior',          'Band of the Ranger-General'),
    ('Creek',         'Mage',    'Arcane Mage',           'Chestguard of the Vanquished Hero'),
    ('Glzy',          'Hunter',  'Beast Mastery Hunter',  'Bands of the Celestial Archer'),
    ('Cutebrat',      'Warrior', 'Fury Warrior',          'Solarian''s Sapphire'),
    ('Jasmia',        'Priest',  'Shadow Priest',         'Mindstorm Wristbands'),
    ('Bored',         'Mage',    'Arcane Mage',           'Chestguard of the Vanquished Hero'),
    ('Priestlynn',    'Druid',   'Feral Druid (Tank)',    'Verdant Sphere'),
    ('Case',          'Shaman',  'Enhancement Shaman',    'Netherbane'),
    ('Daladed',       'Warlock', 'Destruction Warlock',   'Wand of the Forgotten Star'),
    ('Cholima',       'Shaman',  'Restoration Shaman',    'Pauldrons of the Vanquished Champion')
  ) AS v(player, class, spec, item);

COMMIT;

-- Sanity checks (run separately):
--
-- 1. Total awards for May 17 — expect 32. If you see fewer, a (player,
--    class, spec) or item lookup returned NULL and that row silently
--    failed; run a diagnostic similar to week-12-supplemental-diagnose.sql
--    to identify the missing match.
--    SELECT COUNT(*) FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     WHERE rn.date = '2026-05-17';
--
-- 2. Per-player breakdown:
--    SELECT p."displayName", c.class, c.spec, i.name
--      FROM "LootAward" la
--      JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--      JOIN "Character" c  ON la."characterId" = c.id
--      JOIN "Player" p     ON c."playerId" = p.id
--      JOIN "Item" i       ON la."itemId" = i.id
--     WHERE rn.date = '2026-05-17'
--     ORDER BY p."displayName", i.name;
--
-- 3. Verify the new players + characters exist:
--    SELECT p."displayName", c.name, c.class, c.spec, c."isMain"
--      FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
--     WHERE p."displayName" IN ('Cholima','Jasmia','Cutebrat','Bungle')
--        OR (p."displayName" = 'Priestlynn' AND c.class = 'Druid')
--        OR (p."displayName" = 'Slamchamber' AND c.class = 'Priest')
--        OR (p."displayName" = 'Shmoo' AND c.class = 'Shaman')
--     ORDER BY p."displayName", c."isMain" DESC, c.spec;
