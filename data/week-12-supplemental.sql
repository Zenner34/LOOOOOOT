-- Week 12 supplemental loot import (May 5, 2026).
--
-- Adds 9 awards that were missing from the original week-12.sql import:
--   1. Barbatos       · Pauldrons of the Fallen Champion
--   2. Frustrated     · Bladespire Warbands
--   3. Capriciousxo   · Eye of Gruul              (separate Gruul kill)
--   4. Rfx            · Girdle of the Endless Pit
--   5. Kalihiwai      · Chestguard of the Fallen Champion
--   6. Glzy           · Gauntlets of the Dragonslayer
--   7. Kalihiwai      · Leggings of the Fallen Champion
--   8. Bake           · Leggings of the Fallen Champion
--   9. Glzy           · Leggings of the Fallen Hero
--
-- Two awards from the supplemental list duplicate ones already in
-- week-12.sql (Capriciousxo · Chestguard of the Fallen Defender,
-- Bored · Magtheridon's Head) — both inserts use NOT EXISTS guards
-- so re-runs converge cleanly.
--
-- Pit Lord's Satchel (HotforSenpai) is deliberately not tracked, per
-- the same policy in week-12.sql and week-13.sql.
--
-- New players added if missing: Rfx, Kalihiwai, Glzy, Bake.
-- New characters added if missing: Barbatos's Restoration Shaman main,
-- Rfx's Fury Warrior main, Kalihiwai's Holy Paladin main,
-- Glzy's Beast Mastery Hunter main, Bake's Restoration Shaman alt.
--
-- Idempotent — re-running only re-inserts awards that are missing.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════
-- 1. Players: add Rfx, Kalihiwai, Glzy, Bake if missing.
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "Player" ("displayName")
SELECT v.name
  FROM (VALUES ('Rfx'), ('Kalihiwai'), ('Glzy'), ('Bake')) AS v(name)
 WHERE NOT EXISTS (SELECT 1 FROM "Player" p WHERE p."displayName" = v.name);

-- ════════════════════════════════════════════════════════════════════════
-- 2. Characters: add the five new mains/alts if missing, then attach
--    each to the Master Roster.
-- ════════════════════════════════════════════════════════════════════════

-- Barbatos · Restoration Shaman (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Barbatos', 'Shaman', 'Restoration Shaman', 'heal', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Barbatos'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Shaman' AND c.spec = 'Restoration Shaman'
   );

-- Rfx · Fury Warrior (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Rfx', 'Warrior', 'Fury Warrior', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Rfx'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Warrior' AND c.spec = 'Fury Warrior'
   );

-- Kalihiwai · Holy Paladin (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Kalihiwai', 'Paladin', 'Holy Paladin', 'heal', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Kalihiwai'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Paladin' AND c.spec = 'Holy Paladin'
   );

-- Glzy · Beast Mastery Hunter (main)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Glzy', 'Hunter', 'Beast Mastery Hunter', 'dps', TRUE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Glzy'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Hunter' AND c.spec = 'Beast Mastery Hunter'
   );

-- Bake · Restoration Shaman (alt)
INSERT INTO "Character" (name, class, spec, role, "isMain", "playerId", active)
SELECT 'Bake', 'Shaman', 'Restoration Shaman', 'heal', FALSE, p.id, TRUE
  FROM "Player" p
 WHERE p."displayName" = 'Bake'
   AND NOT EXISTS (
     SELECT 1 FROM "Character" c
      WHERE c."playerId" = p.id AND c.class = 'Shaman' AND c.spec = 'Restoration Shaman'
   );

-- Roster memberships for all five new characters.
INSERT INTO "RosterMember" ("rosterId", "characterId", "memberRole")
SELECT (SELECT id FROM "Roster" WHERE name = 'Master Roster'), c.id, 'main'
  FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
 WHERE (p."displayName", c.class, c.spec) IN (
         ('Barbatos',  'Shaman',  'Restoration Shaman'),
         ('Rfx',       'Warrior', 'Fury Warrior'),
         ('Kalihiwai', 'Paladin', 'Holy Paladin'),
         ('Glzy',      'Hunter',  'Beast Mastery Hunter'),
         ('Bake',      'Shaman',  'Restoration Shaman')
       )
   AND NOT EXISTS (
     SELECT 1 FROM "RosterMember" rm
      WHERE rm."rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
        AND rm."characterId" = c.id
   );

-- ════════════════════════════════════════════════════════════════════════
-- 3. LootAwards. Re-running is safe: every insert is guarded against
--    duplicates on (itemId, characterId, raidNightId).
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO "LootAward" ("itemId", "characterId", "rosterId", "raidNightId", "awardedAt")
SELECT
  (SELECT id FROM "Item" WHERE name = v.item LIMIT 1),
  (SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
    WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
    LIMIT 1),
  (SELECT id FROM "Roster" WHERE name = 'Master Roster'),
  (SELECT id FROM "RaidNight"
    WHERE date = '2026-05-05'
      AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
    LIMIT 1),
  '2026-05-05T00:00:00Z'::timestamp
  FROM (VALUES
    ('Barbatos',     'Shaman',  'Restoration Shaman',   'Pauldrons of the Fallen Champion'),
    ('Capriciousxo', 'Druid',   'Balance Druid',        'Chestguard of the Fallen Defender'),
    ('Frustrated',   'Warrior', 'Arms Warrior',         'Bladespire Warbands'),
    ('Capriciousxo', 'Druid',   'Balance Druid',        'Eye of Gruul'),
    ('Bored',        'Mage',    'Arcane Mage',          'Magtheridon''s Head'),
    ('Rfx',          'Warrior', 'Fury Warrior',         'Girdle of the Endless Pit'),
    ('Kalihiwai',    'Paladin', 'Holy Paladin',         'Chestguard of the Fallen Champion'),
    ('Glzy',         'Hunter',  'Beast Mastery Hunter', 'Gauntlets of the Dragonslayer'),
    ('Kalihiwai',    'Paladin', 'Holy Paladin',         'Leggings of the Fallen Champion'),
    ('Bake',         'Shaman',  'Restoration Shaman',   'Leggings of the Fallen Champion'),
    ('Glzy',         'Hunter',  'Beast Mastery Hunter', 'Leggings of the Fallen Hero')
  ) AS v(player, class, spec, item)
 WHERE NOT EXISTS (
   SELECT 1 FROM "LootAward" la
    WHERE la."itemId" = (SELECT id FROM "Item" WHERE name = v.item LIMIT 1)
      AND la."characterId" = (
        SELECT c.id FROM "Character" c JOIN "Player" p ON c."playerId" = p.id
         WHERE p."displayName" = v.player AND c.class = v.class AND c.spec = v.spec
         LIMIT 1)
      AND la."raidNightId" = (
        SELECT id FROM "RaidNight"
         WHERE date = '2026-05-05'
           AND "rosterId" = (SELECT id FROM "Roster" WHERE name = 'Master Roster')
         LIMIT 1)
 );

COMMIT;

-- Sanity checks (run separately):
--
-- Total awards for May 5 should now be 26 (17 from week-12 + 9 new).
--   SELECT COUNT(*) FROM "LootAward" la
--    JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--    WHERE rn.date = '2026-05-05';
--
-- Per-player breakdown:
--   SELECT p."displayName", c.class, c.spec, i.name
--     FROM "LootAward" la
--     JOIN "RaidNight" rn ON la."raidNightId" = rn.id
--     JOIN "Character" c  ON la."characterId" = c.id
--     JOIN "Player" p     ON c."playerId" = p.id
--     JOIN "Item" i       ON la."itemId" = i.id
--    WHERE rn.date = '2026-05-05'
--    ORDER BY p."displayName", i.name;
